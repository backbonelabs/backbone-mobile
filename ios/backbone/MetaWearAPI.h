#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLAccelerometer *accelerometer;
  @property BOOL calibrated;
  @property double controlAngle;
  @property double currentAngle;
  @property double tilt;
  @property double controlDistance;
  @property double currentDistance;
  @property double slouchThreshold;
- (void) handleTilt;
- (void) tiltEventEmitter;
@end
