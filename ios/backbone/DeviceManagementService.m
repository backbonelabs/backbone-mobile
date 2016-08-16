#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static MBLMetaWear *_sharedDevice = nil;
static MBLMetaWearManager *_manager = nil;
static BOOL _remembered = nil;
static NSMutableDictionary *_deviceCollection = nil;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

- (id)init {
  _manager = [MBLMetaWearManager sharedManager];
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(getSavedDevice :(RCTResponseSenderBlock)callback) {
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      NSLog(@"Found a saved device");
      _remembered = YES;
      _sharedDevice = task.result[0];
      callback(@[@YES]);
    } else {
      NSLog(@"No saved devices found");
      _remembered = YES;
      callback(@[@NO]);
    }
    return nil;
  }];
}

RCT_EXPORT_METHOD(connectToDevice) {
  NSLog(@"Attempting connection to device: %@", _sharedDevice);
  [_sharedDevice connectWithHandler:^(NSError * _Nullable error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                              @"domain": error.domain,
                                                              @"code": [NSNumber numberWithInteger:error.code],
                                                              @"userInfo": error.userInfo,
                                                              @"remembered": _remembered ? @1 : @0,
                                                              });
      [self deviceConnectionStatus :makeError];
    } else {
      [_sharedDevice rememberDevice];
      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      [self deviceConnectionStatus :@{
                                      @"message": @"Successfully connected",
                                      @"code": [NSNumber numberWithInteger:_sharedDevice.state],
                                      }];
    }
  }];
  
  [self checkForConnectionTimeout];
}

RCT_EXPORT_METHOD(selectDevice :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  [_manager stopScanForMetaWears];
  _sharedDevice = [_deviceCollection objectForKey:deviceID];
  // Keep callback to signal _sharedDevice is set
  callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(scanForDevices :(RCTResponseSenderBlock)callback) {
  NSLog(@"Scanning for devices");
  _deviceCollection = [NSMutableDictionary new];
  [_manager startScanForMetaWearsWithHandler:^(NSArray *array) {
    NSMutableArray *deviceList = [NSMutableArray new];
    
    for (MBLMetaWear *device in array) {
      _deviceCollection[[device.identifier UUIDString]] = device;
      [deviceList addObject: @{
                               @"name": device.name,
                               @"identifier": [device.identifier UUIDString],
                               @"RSSI": device.discoveryTimeRSSI,
                               }];
    }
    [_manager stopScanForMetaWears];
    callback(@[deviceList]);
  }];
}

RCT_EXPORT_METHOD(getDeviceStatus :(RCTResponseSenderBlock)callback) {
  callback(@[[NSNumber numberWithInteger:_sharedDevice.state]]);
}

RCT_EXPORT_METHOD(forgetDevice) {
  NSLog(@"Forget device %@", _sharedDevice);
  [_sharedDevice forgetDevice];
  _sharedDevice = nil;
}

- (void)checkForConnectionTimeout {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    if (_sharedDevice.state != MBLConnectionStateConnected) {
      NSLog(@"Device connection timed out");
      NSDictionary *makeError = RCTMakeError(@"This device is taking too long to connect.", nil, @{
                                                              @"domain": [NSNull null],
                                                              @"code": [NSNull null],
                                                              @"userInfo": [NSNull null],
                                                              @"remembered": _remembered ? @1 : @0,
                                                              });
      [self deviceConnectionStatus: makeError];
    }
  });
}

- (void)deviceConnectionStatus :(NSDictionary *)status {
  [self.bridge.eventDispatcher sendAppEventWithName:@"ConnectionStatus" body: status];
}


@end;
