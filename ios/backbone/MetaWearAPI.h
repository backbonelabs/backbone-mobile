#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometer *accelerometer;
  @property NSMutableDictionary *nativeDeviceCollection;
  @property BOOL calibrated;
  @property double controlAngle;
  @property double currentAngle;
  @property double tilt;
  @property double controlDistance;
  @property double currentDistance;
  @property double slouchThreshold;
+ (MBLMetaWear *) getDevice;
- (void) connectToMetaWear :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback;
- (void) handleTilt;
- (void) tiltEventEmitter;
- (void) deviceEventEmitter:(NSMutableDictionary *)deviceCollection;
@end
