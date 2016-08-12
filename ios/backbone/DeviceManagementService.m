#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static BOOL timeoutError = NO;
static MBLMetaWear *_sharedDevice = nil;
static MBLMetaWearManager *_manager = nil;
static NSMutableDictionary *_deviceCollection = nil;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

- (id)init {
  self = [super init];
  _manager = [MBLMetaWearManager sharedManager];
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(checkForSavedDevice :(RCTResponseSenderBlock)callback) {
  // Sets timeoutError to false because user initiated/re-initiated connection attempt
  timeoutError = NO;
  // Checks for a saved device
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if (![task.result count]) {
      NSLog(@"Found saved device");
      _sharedDevice = task.result[0];
      [self connectToSavedDevice];
      callback(@[@YES]);
    } else {
      NSLog(@"Didn't find device");
      [self scanForDevices];
      callback(@[@NO]);
    }
    return nil;
  }];
}

// Initiates connection to a device selected by user from RN interface
RCT_EXPORT_METHOD(selectDevice :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  timeoutError = NO;
  // Assign _sharedDevice to the selected device in the collection
  _sharedDevice = [_deviceCollection objectForKey:deviceID];
  [self connectToSavedDevice];
}

RCT_EXPORT_METHOD(forgetDevice) {
  NSLog(@"Forget device %@", _sharedDevice);
  // Forget the saved device
  [_sharedDevice forgetDevice];
  _sharedDevice = nil;
}

- (void)connectToSavedDevice {
  NSLog(@"Attempting connection to saved device: %@", _sharedDevice);
  [_sharedDevice connectWithHandler:^(NSError * _Nullable error) {
    if (timeoutError) {
      return;
    }
    else if (error) {
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                              @"domain": error.domain,
                                                              @"code": [NSNumber numberWithInteger:error.code],
                                                              @"userInfo": error.userInfo,
                                                              });
      [self deviceConnectionStatus: makeError];
    } else {
      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      [self deviceConnectionStatus: @{@"code:": [NSNumber numberWithInteger:1], @"message": @"Successfully connected"}];
    }
  }];
  
  [self checkDeviceTimeout];
}

// Checks after 10 seconds whether device is connected or not
- (void)checkDeviceTimeout {
  NSLog(@"Checking for timeout");
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    // If device connection state doesn't equal "connected", then invoke callback with error
    if (_sharedDevice.state != 2) {
      timeoutError = YES;
      NSDictionary *makeError = RCTMakeError(@"This device is taking too long to connect.", nil, @{
                                                              @"domain": [NSNull null],
                                                              @"code": [NSNumber numberWithInteger:2],
                                                              @"userInfo": [NSNull null],
                                                              });
      [self deviceConnectionStatus: makeError];
    }
  });
}

- (void)scanForDevices {
  NSLog(@"Scanning");
  /**
   Collection for storing devices and connecting to later -
   sending the entire device object to RN causes app to crash
   */
  _deviceCollection = [NSMutableDictionary new];
  // Scans for devices in the vicinity and updates their info in real-time
  [_manager startScanForMetaWearsAllowDuplicates:NO handler:^(NSArray *array) {
    // Stores a list of devices with information that's "JS-safe"
    NSMutableArray *deviceList = [NSMutableArray array];
    // Loops through found devices
    for (MBLMetaWear *device in array) {
      // Assign device to collection based on device identifier string
      _deviceCollection[[device.identifier UUIDString]] = device;
      // Add objects to deviceList array
      NSLog(@"Devices %@", device);
      [deviceList addObject: @{
                               @"name": device.name,
                               @"identifier": [device.identifier UUIDString],
                               @"RSSI": device.discoveryTimeRSSI,
                               }];
    }
    // Once all devices added to array, emit as event
    [self deviceEventEmitter :deviceList];
  }];
}

- (void)deviceEventEmitter :(NSMutableArray *)deviceList {
  // Emit 'Devices' event with an array of "JS-safe" device objects
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceList];
}

- (void)deviceConnectionStatus :(NSDictionary *)status {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Status" body: status];
}

@end;
