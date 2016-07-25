#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : RCTEventEmitter <RCTBridgeModule>
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometer *accelerometer;
  @property NSMutableDictionary *deviceCollection;
  @property BOOL calibrated;
  @property float controlAngle;
  @property float currentAngle;
  @property float tilt;
- (void) scanForMetaWear;
- (void) handleTilt;
- (void) tiltEventEmitter;
- (void) scanEventEmitter:(NSMutableArray *)collection;
@end
