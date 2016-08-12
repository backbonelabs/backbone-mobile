#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static BOOL connectionTimeout = NO;
static MBLMetaWear *_sharedDevice = nil;
static MBLMetaWearManager *_manager = nil;
static NSMutableDictionary *_deviceCollection = nil;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

- (id)init {
  NSLog(@"Type of self: %@", self);
  _manager = [MBLMetaWearManager sharedManager];
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(checkForSavedDevice :(RCTResponseSenderBlock)callback) {
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      NSLog(@"Found a saved device");
      _sharedDevice = task.result[0];
      [self connectToDevice];
      callback(@[@YES]);
    } else {
      NSLog(@"No saved devices found");
      [self scanForDevices];
      callback(@[@NO]);
    }
    return nil;
  }];
}

RCT_EXPORT_METHOD(selectDeviceToConnect :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  [_manager stopScanForMetaWears];
  _sharedDevice = [_deviceCollection objectForKey:deviceID];
  [self connectToDevice];
}

RCT_EXPORT_METHOD(forgetDevice) {
  NSLog(@"Forget device %@", _sharedDevice);
  [_sharedDevice forgetDevice];
  _sharedDevice = nil;
}

RCT_EXPORT_METHOD(retryConnect) {
  connectionTimeout = NO;
}

- (void)connectToDevice {
  NSLog(@"Attempting connection to device: %@", _sharedDevice);
  [_sharedDevice connectWithHandler:^(NSError * _Nullable error) {
    if (connectionTimeout) {
      return;
    } else if (error) {
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                              @"domain": error.domain,
                                                              @"code": [NSNumber numberWithInteger:error.code],
                                                              @"userInfo": error.userInfo,
                                                              });
      [self deviceConnectionStatus :makeError];
    } else {
      [_sharedDevice rememberDevice];
      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      [self deviceConnectionStatus: @{@"code:": [NSNumber numberWithInteger:1], @"message": @"Successfully connected"}];
    }
  }];
  
  [self checkForConnectionTimeout];
}

- (void)scanForDevices {
  NSLog(@"Scanning for devices");
  /* Collection for storing devices and connecting to later -
   sending the entire device object to RN causes app to crash
   */
  _deviceCollection = [NSMutableDictionary new];
  
  /* Scans for devices within BT range, doesn't run block each
   time new advertising packet found like other method. However,
   it does run the handler again when it detects a new device
   */
  [_manager startScanForMetaWearsWithHandler:^(NSArray *array) {
    // Stores a list of devices with information that's "JS-safe"
    NSMutableArray *deviceList = [NSMutableArray new];
    
    for (MBLMetaWear *device in array) {
      // Assign device to collection based on device identifier string
      _deviceCollection[[device.identifier UUIDString]] = device;
      // Add objects to deviceList array
      [deviceList addObject: @{
                               @"name": device.name,
                               @"identifier": [device.identifier UUIDString],
                               @"RSSI": device.discoveryTimeRSSI,
                               }];
    }
    
    // Once all devices added to array, emit an event with list
    [self deviceEventEmitter :deviceList];
  }];
}

- (void)checkForConnectionTimeout {
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    NSLog(@"Device connection timed out");
    if (_sharedDevice.state != 2) {
      connectionTimeout = YES;
      NSDictionary *makeError = RCTMakeError(@"This device is taking too long to connect.", nil, @{
                                                              @"domain": [NSNull null],
                                                              @"code": [NSNumber numberWithInteger:2],
                                                              @"userInfo": [NSNull null],
                                                              });
      [self deviceConnectionStatus: makeError];
    }
  });
}

- (void)deviceConnectionStatus :(NSDictionary *)status {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Status" body: status];
}

- (void)deviceEventEmitter :(NSMutableArray *)deviceList {
  // Emit 'Devices' event with an array of "JS-safe" device objects
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceList];
}


@end;
