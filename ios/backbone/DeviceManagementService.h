#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject
  @property RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property NSMutableDictionary *nativeDeviceCollection;
+ (MBLMetaWear *) getDevice;
- (void) scanForDevices :(RCTResponseSenderBlock)callback;
- (void) connectToDevice :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
@end
