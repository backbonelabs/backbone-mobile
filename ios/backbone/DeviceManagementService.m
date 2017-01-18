#import "DeviceManagementService.h"
#import "BluetoothService.h"
#import "RCTUtils.h"

@implementation DeviceManagementService

static NSMutableDictionary *_deviceCollection = nil;

- (id)init {
  self = [super init];
  if (!_deviceCollection) {
    _deviceCollection = [NSMutableDictionary new];
  }
  
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(connectToDevice:(NSString *)deviceID) {
  // Check whether specified device is in list of saved peripherals
  NSUUID *uuid = [[NSUUID alloc] initWithUUIDString:deviceID];
  NSArray *savedDevices = [BluetoothServiceInstance.centralManager retrievePeripheralsWithIdentifiers:@[uuid]];
  if (savedDevices && [savedDevices count] > 0) {
    [BluetoothServiceInstance selectDevice:savedDevices[0]];
  } else if (_deviceCollection[deviceID]) {
    // Connect to a "scanned device"
    [BluetoothServiceInstance selectDevice:_deviceCollection[deviceID][@"peripheral"]];
  }
  
  DLog(@"Attempting to connect to %@", BluetoothServiceInstance.currentDevice);
  
  // Only attempt a connect if device is defined
  if (BluetoothServiceInstance.currentDevice) {
    [BluetoothServiceInstance connectDevice:BluetoothServiceInstance.currentDevice completionBlock:^(NSError * _Nullable error) {
      if (error) {
        NSDictionary *makeError = RCTMakeError(@"Failed to connect to device", nil, @{
                                                                                      @"domain": error.domain,
                                                                                      @"code": [NSNumber numberWithLong:error.code],
                                                                                      @"userInfo": error.userInfo,
                                                                                      });
        [self deviceConnectionStatus:makeError];
      } else {
        [self deviceConnectionStatus:@{@"isConnected": @YES, @"deviceMode": @(BluetoothServiceInstance.currentDeviceMode)}];
      }
      
    }];
    [self checkConnectTimeout];
  } else {
    // There is no valid device
    [self deviceConnectionStatus:RCTMakeError(@"Not a valid device", nil, nil)];
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
  [self stopScanForDevices];
  
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

- (void)checkConnectTimeout {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    if (BluetoothServiceInstance.currentDevice.state != CBPeripheralStateConnected) {
      DLog(@"Connection timeout");
      [BluetoothServiceInstance disconnectDevice:^(NSError * _Nullable error) {
        NSDictionary *makeError = RCTMakeError(@"Device took too long to connect", nil, nil);
        [self deviceConnectionStatus:makeError];
      }];
    }
  });
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"ConnectionStatus", @"DevicesFound"];
}

- (void)deviceConnectionStatus:(NSDictionary *)status {
  [self sendEventWithName:@"ConnectionStatus" body:status];
}

- (void)devicesFound:(NSMutableArray *)deviceList {
  [self sendEventWithName:@"DevicesFound" body:deviceList];
}

@end;
