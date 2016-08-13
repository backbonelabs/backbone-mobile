#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
+ (MBLMetaWear *) getDevice;
- (void) scanForDevices;
- (void) checkForConnectionTimeout;
- (void) deviceConnectionStatus :(NSDictionary *)status;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
@end
