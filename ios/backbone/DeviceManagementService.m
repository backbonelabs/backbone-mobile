#import "DeviceManagementService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static MBLMetaWearManager *_manager = nil;
static MBLMetaWear *_sharedDevice = nil;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

// Constructor function
- (id)init {
  NSLog(@"Devices: %@", self.nativeDeviceCollection);
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
  
  // Tries to retrieve any saved devices and runs a block on finish
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    
    // If length of block is not nil, then we have a saved device
    if ([task.result count]) {
      NSLog(@"Found device");
      _sharedDevice = task.result[0];
      [self connectToDevice :callback];
    } else {
      NSLog(@"Didn't find device");
      // Else scan for devices in vicinity
      [self scanForDevices :callback];
    }
    return nil;
  }];
}

// Method for handling a selected device from RN
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
  // Attempts to connect to the device for 10 seconds
  [_sharedDevice connectWithTimeout:10 handler:^(NSError *error) {
    if (error) {
      // If there's an error, make an error object and return in callback
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                              @"domain": error.domain,
                                                              @"code": [NSNumber numberWithInteger:error.code],
                                                              @"userInfo": error.userInfo
                                                              });
      callback(@[makeError, @NO]);
    } else {
      [_sharedDevice.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      callback(@[[NSNull null], @YES]);
    }
  }];
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
