#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : RCTEventEmitter <RCTBridgeModule>
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometerMMA8452Q *accelerometer;
  @property BOOL calibrated;
  @property float controlAngle;
  @property float currentAngle;
  @property float tilt;
- (void) connectToMetaWear :(RCTResponseSenderBlock)callback;
- (void) scanForMetaWear :(RCTResponseSenderBlock)callback;
- (void) handleTilt;
- (void) tiltEventEmitter;
@end
