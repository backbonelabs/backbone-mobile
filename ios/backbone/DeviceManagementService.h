#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface DeviceManagementService : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
+ (MBLMetaWear *) getDevice;
- (void) scanForDevices :(RCTResponseSenderBlock)callback;
- (void) connectToDevice;
- (void) checkDeviceConnection :(RCTResponseSenderBlock)callback;
- (void) deviceEventEmitter :(NSMutableArray *)deviceList;
@end
