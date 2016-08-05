#import "DeviceManagementService.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

static MBLMetaWear *_sharedDevice = nil;
static MBLMetaWear *_manager = nil;

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
    if ([task.result count]) {
      _sharedDevice = task.result[0];
      [self connectToDevice :callback];
    } else {
      // Else scan for devices in vicinity
      [self scanForDevices :callback];
    }
    return nil;
  }];
}

RCT_EXPORT_METHOD(selectDevice :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  [self.manager stopScanForMetaWears];
  self.device = [self.nativeDeviceCollection objectForKey:deviceID];
  [self connectToDevice: self.device: callback];
}

- (void)connectToDevice :(RCTResponseSenderBlock)callback {
  [self.device connectWithHandler:^(NSError *error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Error", nil, @{
                                                               @"domain": error.domain,
                                                               @"code": [NSNumber numberWithInteger:error.code],
                                                               @"userInfo": error.userInfo
                                                               });
      callback(@[makeError, @NO]);
    } else {
      [self.device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      callback(@[[NSNull null], @YES]);
    }
  }];
}

- (void) scanForDevices :(RCTResponseSenderBlock)callback {
  callback(@[[NSNull null], @NO]);
  // Collection for storing devices and connecting to later
  self.nativeDeviceCollection = [NSMutableDictionary new];
  // Scans for devices in the vicinity and updates their info in real-time
  [_manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *array) {
    // Stores a list of devices with information that's JS safe
    NSMutableArray *deviceList = [NSMutableArray array];
    // Loops through found devices
    for (MBLMetaWear *device in array) {
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
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceList];
}

@end;
