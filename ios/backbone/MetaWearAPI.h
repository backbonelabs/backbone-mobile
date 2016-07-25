#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : RCTEventEmitter <RCTBridgeModule>
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometerMMA8452Q *accelerometer;
  @property NSDictionary *deviceCollection;
  @property BOOL calibrated;
  @property float controlAngle;
  @property float currentAngle;
  @property float tilt;
- (void) scanForMetaWear:(RCTResponseSenderBlock)callback;
- (void) handleTilt;
- (void) tiltEventEmitter;
- (void) scanEventEmitter:(NSMutableArray *)collection;
@end
