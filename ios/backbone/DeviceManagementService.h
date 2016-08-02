#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property NSMutableDictionary *nativeDeviceCollection;
- (void) deviceEventEmitter:(NSMutableDictionary *)deviceCollection;
@end
