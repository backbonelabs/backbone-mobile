#import "DeviceManagementService.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation DeviceManagementService

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(searchForMetaWear: (RCTResponseSenderBlock)callback) {
  self.manager = [MBLMetaWearManager sharedManager];
  [[self.manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      self.device = task.result[0];
      [self connectToMetaWear:self.device:callback];
    } else {
      self.nativeDeviceCollection =[NSMutableDictionary new];
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
          [self deviceEventEmitter:deviceCollection];
        }
      }];
    }
    return nil;
  }];
}

RCT_EXPORT_METHOD(selectMetaWear:(NSString *)deviceID:(RCTResponseSenderBlock)callback) {
  [self connectToMetaWear:[self.nativeDeviceCollection objectForKey:deviceID]:callback];
}

- (void)connectToMetaWear :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback {
  [self.device connectWithHandler:^(NSError *error) {
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Test", error, @{
                                                               @"domain": error.domain,
                                                               @"code": [NSNumber numberWithInteger:error.code],
                                                               @"userInfo": error.userInfo
                                                               });
      callback(@[makeError, @NO]);
    } else {
      [self.manager stopScanForMetaWears];
      [self.device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      callback(@[[NSNull null], @YES]);
    }
  }];
}

- (void) deviceEventEmitter:(NSMutableDictionary *)deviceCollection {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceCollection];
}

@end;