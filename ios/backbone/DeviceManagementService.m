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
  [_manager stopScanForMetaWears];
  
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
  
  [self checkForTimeout];
}

RCT_EXPORT_METHOD(selectDevice:(NSString *)deviceID:(RCTResponseSenderBlock)callback) {
  _sharedDevice = [_deviceCollection objectForKey:deviceID];
  if (!_sharedDevice) {
    NSDictionary *makeError = RCTMakeError(@"Failed to select device", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered]});
    callback(@[makeError]);
  } else {
    callback(@[[NSNull null]]);
  }
}

RCT_EXPORT_METHOD(scanForDevices :(RCTResponseSenderBlock)callback) {
  NSLog(@"Scanning for devices");
  _deviceCollection = [NSMutableDictionary new];
  NSMutableArray *deviceList = [NSMutableArray new];
  
  [_manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *array) {
    NSLog(@"scan count %i", _scanCount);
    ++_scanCount;
    if ([deviceList count]) {
      [deviceList removeAllObjects];
    }
    
    for (MBLMetaWear *device in array) {
      if (device.discoveryTimeRSSI.integerValue >= -60) {
        _deviceCollection[[device.identifier UUIDString]] = device;
        [deviceList addObject: @{
                                 @"name": device.name,
                                 @"identifier": [device.identifier UUIDString],
                                 @"RSSI": device.discoveryTimeRSSI,
                                 }];
      }
    }
    [NSThread sleepForTimeInterval:1.0f];
    [self devicesFound:deviceList];
    if (_scanCount > 3) {
      [_manager stopScanForMetaWears];
      _scanCount = 0;
      callback(@[[NSNull null]]);
    }
  }];
}

RCT_EXPORT_METHOD(getDeviceStatus:(RCTResponseSenderBlock)callback) {
  callback(@[[NSNumber numberWithInteger:_sharedDevice.state]]);
}

RCT_EXPORT_METHOD(forgetDevice:(RCTResponseSenderBlock)callback) {
  [_sharedDevice forgetDevice];
  _sharedDevice = nil;
  if (_sharedDevice) {
    NSDictionary *makeError = RCTMakeError(@"Failed to forget device", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered]});
    callback(@[makeError]);
  } else {
    callback(@[[NSNull null]]);
  }
}

- (void)checkForTimeout {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    if (_sharedDevice.state != MBLConnectionStateConnected) {
      NSLog(@"Timeout");
      NSDictionary *makeError = RCTMakeError(@"Device took too long to connect", nil, @{ @"remembered": [NSNumber numberWithBool:_remembered]});
      [self deviceConnectionStatus:makeError];
    } else {
      [self deviceConnectionStatus:@{ @"message": @"Successfully connected" }];
    }
  });
}

- (void)deviceConnectionStatus:(NSDictionary *)status {
  [self.bridge.eventDispatcher sendAppEventWithName:@"ConnectionStatus" body: status];
}

- (void)devicesFound:(NSMutableArray *)deviceList {
  [self.bridge.eventDispatcher sendAppEventWithName:@"DevicesFound" body: deviceList];
}

@end;
