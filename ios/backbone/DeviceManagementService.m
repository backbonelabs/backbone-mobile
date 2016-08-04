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
  NSLog(@"Check for saved device");
  _manager = [MBLMetaWearManager sharedManager];
  [[_manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      _sharedDevice = task.result[0];
      [self connectToDevice: callback];
    } else {
      [self scanForDevices: callback];
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

- (void) scanForDevices {
  NSLog(@"Scan for devices");
  self.nativeDeviceCollection = [NSMutableDictionary new];
  [self.manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *array) {
    NSMutableArray *deviceList = [NSMutableArray array];
    for (MBLMetaWear *device in array) {
      NSString *deviceID = [device.identifier UUIDString];
      self.nativeDeviceCollection[deviceID] = device;
      [deviceList addObject: @{
                               @"name": device.name,
                               @"identifier": deviceID,
                               @"RSSI": device.discoveryTimeRSSI,
                               }];
    }
    [self deviceEventEmitter :deviceList];
  }];
}

- (void) deviceEventEmitter :(NSMutableArray *)deviceList {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceList];
}

@end;
