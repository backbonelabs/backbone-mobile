#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
+ (MBLMetaWear *) getDevice;
- (void) connectToSavedDevice;
- (void) checkDeviceTimeout;
- (void) scanForDevices;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
- (void) deviceConnectionStatus :(NSDictionary *)status;
@end
