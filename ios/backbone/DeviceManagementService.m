#import "DeviceManagementService.h"
#import "BluetoothService.h"
#import "RCTUtils.h"

@implementation DeviceManagementService

static BOOL _remembered;
static NSMutableDictionary *_deviceCollection = nil;

- (id)init {
  if (!_deviceCollection) {
    _deviceCollection = [NSMutableDictionary new];
  }
  
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getSavedDevice:(RCTResponseSenderBlock)callback) {
  NSUserDefaults *preference = [NSUserDefaults standardUserDefaults];
  
  // Check the shared preference for previously saved device UUID
  if ([preference objectForKey:PREF_SAVED_DEVICE_KEY]) {
    NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:[preference objectForKey:PREF_SAVED_DEVICE_KEY]];
    
    NSArray *savedDevices = [BluetoothServiceInstance.centralManager retrievePeripheralsWithIdentifiers:@[uuid]];
    DLog(@"Has Saved Device %@ %@", [preference objectForKey:PREF_SAVED_DEVICE_KEY], savedDevices);
    if (savedDevices && [savedDevices count] > 0) {
      [BluetoothServiceInstance selectDevice:savedDevices[0]];
      
      DLog(@"Found a saved device");
      _remembered = YES;
    }
    else {
      DLog(@"No saved device found");
      _remembered = NO;
    }
  }
  else {
    DLog(@"No saved device found");
    _remembered = NO;
  }
  
  callback(@[[NSNumber numberWithBool:BluetoothServiceInstance.currentDevice != nil]]);
}

RCT_EXPORT_METHOD(connectToDevice) {
  DLog(@"Attempting to connect to %@", BluetoothServiceInstance.currentDevice);
  [BluetoothServiceInstance connectDevice:BluetoothServiceInstance.currentDevice completionBlock:^(NSError * _Nullable error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Failed to connect to device", nil, @{
                                                                                    @"domain": error.domain,
                                                                                    @"code": [NSNumber numberWithLong:error.code],
                                                                                    @"userInfo": error.userInfo,
                                                                                    @"remembered": [NSNumber numberWithBool:_remembered],
                                                                                    });
      [self deviceConnectionStatus:makeError];
    } else {
      [BluetoothServiceInstance stopScan];
      
      if (!_remembered) {
        [self rememberDevice:BluetoothServiceInstance.currentDevice.identifier.UUIDString];
        _remembered = YES;
      }
//      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      [self deviceConnectionStatus:@{@"isConnected": @YES}];
    }
  
  }];
  
  [self checkConnectTimeout];
}

RCT_EXPORT_METHOD(selectDevice:(NSString *)deviceID:(RCTResponseSenderBlock)callback) {
  [self stopScanForDevices];
  [BluetoothServiceInstance selectDevice:_deviceCollection[deviceID][@"peripheral"]];
  
  if (!BluetoothServiceInstance.currentDevice) {
    NSDictionary *makeError = RCTMakeError(@"Failed to select device", nil, @{});
    callback(@[makeError]);
  } else {
    callback(@[[NSNull null]]);
  }
}

RCT_EXPORT_METHOD(scanForDevices :(RCTResponseSenderBlock)callback) {
  DLog(@"Scanning for devices");
  if ([BluetoothService getIsEnabled]) {
    [BluetoothServiceInstance startScanForBLEDevicesAllowDuplicates:NO handler:^(NSDictionary * _Nonnull device) {
      DLog(@"Found %@", device);
      _deviceCollection[device[@"identifier"]] = device;
      
      NSMutableArray *deviceList = [NSMutableArray new];
      
      [_deviceCollection enumerateKeysAndObjectsUsingBlock:^(id  _Nonnull key, id  _Nonnull obj, BOOL * _Nonnull stop) {
        [deviceList addObject: @{
                                 @"name": obj[@"name"],
                                 @"identifier": obj[@"identifier"],
                                 @"RSSI": obj[@"RSSI"]
                                 }];
      }];
      
      [self devicesFound:deviceList];
      
      DLog(@"Device: %@ %@, %@, %@", device[@"name"], device[@"advertisementData"], device[@"RSSI"], device[@"identifier"]);
    }];
    
    callback(@[[NSNull null]]);
  } else {
    // Bluetooth is disabled
    callback(@[RCTMakeError(@"Bluetooth is not enabled", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(stopScanForDevices) {
  DLog(@"Stopping device scan");
  [BluetoothServiceInstance stopScan];
}

RCT_EXPORT_METHOD(cancelConnection:(RCTResponseSenderBlock)callback) {
  DLog(@"Cancel device connection and any running scanning");
  [BluetoothServiceInstance stopScan];
  
  [BluetoothServiceInstance disconnectDevice:^(NSError * _Nullable error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Failed to disconnect", nil, nil);
      callback(@[makeError]);
    }
    else {
      callback(@[[NSNull null]]);
    }
  }];
}

RCT_EXPORT_METHOD(getDeviceStatus:(RCTResponseSenderBlock)callback) {
  callback(@[[NSNumber numberWithInteger:BluetoothServiceInstance.currentDevice.state]]);
}

RCT_EXPORT_METHOD(forgetDevice:(RCTResponseSenderBlock)callback) {
  DLog(@"forget device");
  NSUserDefaults *preference = [NSUserDefaults standardUserDefaults];
  [preference removeObjectForKey:PREF_SAVED_DEVICE_KEY];
  
  [BluetoothServiceInstance disconnectDevice:^(NSError * _Nullable error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Failed to disconnect with device", nil, nil);
      callback(@[makeError]);
    }
    else {
      _remembered = NO;
      callback(@[[NSNull null]]);
    }
  }];
}

- (void)rememberDevice:(NSString *)uuid {
  DLog(@"Remember device %@", uuid);
  NSUserDefaults *preference = [NSUserDefaults standardUserDefaults];
  [preference setObject:uuid forKey:PREF_SAVED_DEVICE_KEY];
}

- (void)checkConnectTimeout {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    if (BluetoothServiceInstance.currentDevice.state != CBPeripheralStateConnected) {
      DLog(@"Connection timeout");
      NSDictionary *makeError = RCTMakeError(@"Device took too long to connect", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered] });
      [self deviceConnectionStatus:makeError];
    }
  });
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"ConnectionStatus", @"DevicesFound"];
}

- (void)deviceConnectionStatus:(NSDictionary *)status {
  [self sendEventWithName:@"ConnectionStatus" body: status];
}

- (void)devicesFound:(NSMutableArray *)deviceList {
  [self sendEventWithName:@"DevicesFound" body: deviceList];
}

@end;
