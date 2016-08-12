#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
+ (MBLMetaWear *) getDevice;
- (void) connectToDevice;
- (void) checkDeviceConnection;
- (void) scanForDevices;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
@end
