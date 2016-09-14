#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static MBLMetaWear *_sharedDevice;
static MBLMetaWearManager *_manager;
static BOOL _remembered;
static NSMutableDictionary *_deviceCollection;
static int _scanCount;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

- (id)init {
  _manager = [MBLMetaWearManager sharedManager];
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getSavedDevice:(RCTResponseSenderBlock)callback) {
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      NSLog(@"Found a saved device");
      _remembered = YES;
      _sharedDevice = task.result[0];
    } else {
      NSLog(@"No saved device found");
      _remembered = NO;
    }
    callback(@[[NSNumber numberWithBool:_remembered]]);
    return nil;
  }];
}

RCT_EXPORT_METHOD(connectToDevice) {
  NSLog(@"Attempting to connect to %@", _sharedDevice);
  [_sharedDevice connectWithHandler:^(NSError * _Nullable error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Failed to connect to device", nil, @{
                                                                                    @"domain": error.domain,
                                                                                    @"code": [NSNumber numberWithLong:error.code],
                                                                                    @"userInfo": error.userInfo,
                                                                                    @"remembered": [NSNumber numberWithBool:_remembered],
                                                                                    });
      [self deviceConnectionStatus:makeError];
    } else {
      if (!_remembered) {
        [_manager stopScanForMetaWears];
        [_sharedDevice rememberDevice];
      }
      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      [self deviceConnectionStatus:@{}];
    }
  }];
  
  [self checkConnectTimeout];
}

RCT_EXPORT_METHOD(selectDevice:(NSString *)deviceID:(RCTResponseSenderBlock)callback) {
  _sharedDevice = [_deviceCollection objectForKey:deviceID];
  if (!_sharedDevice) {
    NSDictionary *makeError = RCTMakeError(@"Failed to select device", nil, @{});
    callback(@[makeError]);
  } else {
    callback(@[[NSNull null]]);
  }
}

RCT_EXPORT_METHOD(scanForDevices :(RCTResponseSenderBlock)callback) {
  NSLog(@"Scanning for devices");
  _deviceCollection = [NSMutableDictionary new];
  NSMutableArray *deviceList = [NSMutableArray new];
  
  [_manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *__nonnull array) {
    NSLog(@"Scan count %i", _scanCount);
    ++_scanCount;
    if ([deviceList count]) {
      [deviceList removeAllObjects];
    }
    
    for (MBLMetaWear *device in array) {
        _deviceCollection[[device.identifier UUIDString]] = device;
        [deviceList addObject: @{
                                 @"name": device.name,
                                 @"identifier": [device.identifier UUIDString],
                                 @"RSSI": device.discoveryTimeRSSI,
                                 }];
    }
    NSLog(@"collection %lu", (unsigned long)[_deviceCollection count]);
//    [NSThread sleepForTimeInterval:1.0f];
    [self devicesFound:deviceList];
  }];
  
  [self checkScanTimeout:callback];
}

RCT_EXPORT_METHOD(getDeviceStatus:(RCTResponseSenderBlock)callback) {
  callback(@[[NSNumber numberWithInteger:_sharedDevice.state]]);
}

RCT_EXPORT_METHOD(forgetDevice:(RCTResponseSenderBlock)callback) {
  NSLog(@"forget device");
  [_sharedDevice disconnectWithHandler:^(NSError * _Nullable error) {
    [_sharedDevice forgetDevice];
    _sharedDevice = nil;
    if (_sharedDevice) {
      NSDictionary *makeError = RCTMakeError(@"Failed to forget device", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered]});
      callback(@[makeError]);
    } else {
      callback(@[[NSNull null]]);
    }
  }];
}

- (void)checkConnectTimeout {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    if (_sharedDevice.state != MBLConnectionStateConnected) {
      NSLog(@"Connection timeout");
      NSDictionary *makeError = RCTMakeError(@"Device took too long to connect", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered]});
      [self deviceConnectionStatus:makeError];
    }
  });
}

- (void)checkScanTimeout :(RCTResponseSenderBlock)callback {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 5 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    [_manager stopScanForMetaWears];
    if (_scanCount < 5) {
      NSLog(@"Scan timeout");
      NSDictionary *makeError = RCTMakeError(@"There was a problem scanning", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered]});
      callback(@[makeError]);
    } else {
      callback(@[[NSNull null]]);
    }
    _scanCount = 0;
  });
}

- (void)deviceConnectionStatus:(NSDictionary *)status {
  [self.bridge.eventDispatcher sendAppEventWithName:@"ConnectionStatus" body: status];
}

- (void)devicesFound:(NSMutableArray *)deviceList {
  [self.bridge.eventDispatcher sendAppEventWithName:@"DevicesFound" body: deviceList];
}

@end;
