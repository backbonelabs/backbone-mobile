#import "DeviceManagementService.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(checkSavedDevices :(RCTResponseSenderBlock)callback) {
  NSLog(@"Check saved devices");
  self.manager = [MBLMetaWearManager sharedManager];
  [[self.manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      self.device = task.result[0];
      [self connectToDevice: self.device: callback];
    } else {
      [self scanForDevices];
    }
    return nil;
  }];
}

RCT_EXPORT_METHOD(selectDevice :(NSString *)deviceID :(RCTResponseSenderBlock)callback) {
  [self.manager stopScanForMetaWears];
  [self connectToDevice: [self.nativeDeviceCollection objectForKey:deviceID]: callback];
}

- (void)connectToDevice :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback {
  [self.device connectWithHandler:^(NSError *error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Test", error, @{
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
  NSMutableDictionary *deviceCollection = [NSMutableDictionary new];
  [self.manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *array) {
    for (MBLMetaWear *device in array) {
      NSString *deviceID = [device.identifier UUIDString];
      self.nativeDeviceCollection[deviceID] = device;
      deviceCollection[deviceID] = @{
                                     @"name": device.name,
                                     @"identifier": deviceID,
                                     @"RSSI": device.discoveryTimeRSSI,
                                     };
    }
    [self deviceEventEmitter :deviceCollection];
  }];
}

- (void) deviceEventEmitter :(NSMutableDictionary *)deviceCollection {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceCollection];
}

@end;