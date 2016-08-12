#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static MBLMetaWearManager *_manager = nil;
static MBLMetaWear *_sharedDevice = nil;
static BOOL errorThrown = NO;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

// Constructor function runs on module instantiation
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
  // Tries to retrieve any saved devices and runs block when done
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    // If length of block is not nil, then we have a saved device
    if ([task.result count]) {
      NSLog(@"Found device");
      // Assign _sharedDevice to our saved device
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

// Method for handling a selected device from React Native
RCT_EXPORT_METHOD(selectDevice :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  // Stop scanning for devices (startScanForMetaWearsAllowDuplicates doesn't stop scanning otherwise)
  [_manager stopScanForMetaWears];
  // Assign _sharedDevice to the selected device in the collection
  _sharedDevice = [self.nativeDeviceCollection objectForKey:deviceID];
  // Remember this device
  [_sharedDevice rememberDevice];
  // Initiate connection to the device
  [self connectToDevice :callback];
}

// Connects to the device currently in _sharedDevice
- (void)connectToDevice :(RCTResponseSenderBlock)callback {
  NSLog(@"Attempting to connect to %@", _sharedDevice);
  // Attempts to connect to the device and runs block once operation complete
  [_sharedDevice connectWithHandler:^(NSError * _Nullable error) {
    // errorThrown would be true if connection attempt timed out before
    if (errorThrown) {
      return;
    } else {
      if (error) {
        // If there's an error, make an error object and return in callback
        NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                                @"domain": error.domain,
                                                                @"code": [NSNumber numberWithInteger:error.code],
                                                                @"userInfo": error.userInfo
                                                                });
        callback(@[makeError, @NO]);
      } else {
        // Device is connected to, turn on LED
        [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
        callback(@[[NSNull null], @YES]);
      }
    }
  }];
  
  // Initiate check for device connection state
  [self checkDeviceConnection :callback];
}

// Checks after 10 seconds whether device is connected or not
- (void)checkDeviceConnection :(RCTResponseSenderBlock)callback {
  // Run block after 10 seconds
  dispatch_after(dispatch_time(DISPATCH_TIME_NOW, 10 * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
    // If device connection state doesn't equal "connected", then invoke callback with error
    if (_sharedDevice.state != 2) {
      errorThrown = YES;
      callback(@[@YES]);
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
