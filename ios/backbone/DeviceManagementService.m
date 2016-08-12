#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static BOOL errorThrown = NO;
static MBLMetaWear *_sharedDevice = nil;
static MBLMetaWearManager *_manager = nil;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

// Runs on initialization
- (id)init {
  NSLog(@"Init");
  self = [super init];
  if (self) {
    // Assign _manager to device manager
    _manager = [MBLMetaWearManager sharedManager];
  }
  return self;
}

RCT_EXPORT_MODULE();

// Check for saved devices, if none found then scan for nearby devices
RCT_EXPORT_METHOD(checkForSavedDevice :(RCTResponseSenderBlock)callback) {
  // Sets errorThrown to false because user initiated/re-initiated connection attempt
  errorThrown = NO;
  // Checks for a saved device
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    // If length of array object is not nil, then we've found a saved device
    if ([task.result count]) {
      NSLog(@"Found device, %lu", [task.result count]);
      _sharedDevice = task.result[0];
      // Call connectToDevice to handle connection
      [self connectToDevice :callback];
    } else {
      NSLog(@"Didn't find device");
      // Scan for devices in vicinity
      [self scanForDevices :callback];
    }
    return nil;
  }];
}

// Method for initiating connection to a device selected by user
RCT_EXPORT_METHOD(selectDevice :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  // Assign _sharedDevice to the selected device in the collection
  _sharedDevice = [self.nativeDeviceCollection objectForKey:deviceID];
  [self connectToDevice :callback];
}

// Attempts connection to the device assigned to _sharedDevice
- (void)connectToDevice :(RCTResponseSenderBlock)callback {
  NSLog(@"Attempting connection to %@", _sharedDevice);
  [_sharedDevice connectWithHandler:^(NSError * _Nullable error) {
    // errorThrown would be true if connection attempt timed out before
    if (errorThrown) {
      return;
    }
    else if (error) {
      // If there's an error, make an error object and return in callback
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                              @"domain": error.domain,
                                                              @"code": [NSNumber numberWithInteger:error.code],
                                                              @"userInfo": error.userInfo,
                                                              @"message": [NSNull null],
                                                              });
      callback(@[makeError, @NO]);
    } else {
      // Stop scanning for devices (startScanForMetaWearsAllowDuplicates doesn't stop scanning otherwise)
      [_manager stopScanForMetaWears];
      [_sharedDevice rememberDevice];
      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      callback(@[[NSNull null], @YES]);
    }
  }];

  // Initiate check for device connection state
  [self checkDeviceConnection :callback];
}

// Checks after 10 seconds whether device is connected or not
- (void)checkDeviceConnection :(RCTResponseSenderBlock)callback {
  // Runs block after 10 seconds
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    // If device connection state doesn't equal "connected", then invoke callback with error
    if (_sharedDevice.state != 2) {
      errorThrown = YES;
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                              @"domain": [NSNull null],
                                                              @"code": [NSNull null],
                                                              @"userInfo": [NSNull null],
                                                              @"message": @"This device is taking too long to connect.",
                                                              });
      callback(@[makeError]);
    }
  });
}

RCT_EXPORT_METHOD(forgetDevice) {
  NSLog(@"Forget device %@", _sharedDevice);
  // Forget the saved device
  [_sharedDevice forgetDevice];
  _sharedDevice = nil;
}

- (void) scanForDevices :(RCTResponseSenderBlock)callback {
  NSLog(@"Scanning");
  callback(@[[NSNull null], @NO]);
  /**
   Collection for storing devices and connecting to later -
   sending the entire device object to RN causes app to crash
   */
  self.nativeDeviceCollection = [NSMutableDictionary new];
  // Scans for devices in the vicinity and updates their info in real-time
  [_manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *array) {
    // Stores a list of devices with information that's "JS-safe"
    NSMutableArray *deviceList = [NSMutableArray array];
    // Loops through found devices
    for (MBLMetaWear *device in array) {
      // Assign device to collection based on device identifier string
      self.nativeDeviceCollection[[device.identifier UUIDString]] = device;
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

- (void) deviceEventEmitter :(NSMutableArray *)deviceList {
  // Emit 'Devices' event with an array of "JS-safe" device objects
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceList];
}

@end;
