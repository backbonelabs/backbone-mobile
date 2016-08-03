#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property NSMutableDictionary *nativeDeviceCollection;
- (void) connectToDevice :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
@end
