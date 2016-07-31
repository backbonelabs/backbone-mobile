#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometerMMA8452Q *accelerometer;
  @property BOOL calibrated;
  @property double controlAngle;
  @property double currentAngle;
  @property double tilt;
- (void) connectToMetaWear :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback;
- (void) handleTilt;
- (void) tiltEventEmitter;
@end
