#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property NSMutableDictionary *nativeDeviceCollection;
+ (MBLMetaWear *) getDevice;
- (void) scanForDevices :(RCTResponseSenderBlock)callback;
- (void) connectToDevice :(RCTResponseSenderBlock)callback;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
@end
