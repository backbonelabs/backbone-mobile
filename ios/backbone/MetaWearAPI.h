#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometer *accelerometer;
  @property BOOL calibrated;
  @property float controlDistance;
  @property float currentDistance;
  @property float tilt;
- (void) connectToMetaWear :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback;
- (void) handleTilt;
- (void) tiltEventEmitter;
@end
