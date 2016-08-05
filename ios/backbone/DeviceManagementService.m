#import "DeviceManagementService.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static MBLMetaWearManager *_manager = nil;
static MBLMetaWear *_sharedDevice = nil;

+ (MBLMetaWear *)getDevice {
  return _sharedDevice;
}

RCT_EXPORT_MODULE();

// Check for saved devices, if none found then scan for nearby devices
RCT_EXPORT_METHOD(checkForSavedDevice :(RCTResponseSenderBlock)callback) {
  _manager = [MBLMetaWearManager sharedManager];
  
  // Tries to retrieve any saved devices and runs a block on finish
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    
    // If length of block is not nil, then we have a saved device
    if (![task.result count]) {
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
  // Stop scanning for devices - doesn't stop scanning otherwise
  [_manager stopScanForMetaWears];
  // Assigned _sharedDevice to the selected device in the collection
  _sharedDevice = [self.nativeDeviceCollection objectForKey:deviceID];
  // Initiate connection to the device
  [self connectToDevice :callback];
}

// Connects to the device currently in _sharedDevice
- (void)connectToDevice :(RCTResponseSenderBlock)callback {
  NSLog(@"Connecting");
  [_sharedDevice connectWithHandler:^(NSError *error) {
    if (error) {
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
      NSLog(@"Devices");
      // Assign device to collection based on device identifier string
      self.nativeDeviceCollection[[device.identifier UUIDString]] = device;
      // Add objects to deviceList array
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
