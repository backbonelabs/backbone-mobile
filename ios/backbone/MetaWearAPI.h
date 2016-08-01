#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property MBLMetaWearManager * manager;
  @property MBLAccelerometer *accelerometer;
  @property NSMutableDictionary *nativeDeviceCollection;
  @property BOOL calibrated;
  @property double controlDistance;
  @property double currentDistance;
  @property double slouchThreshold;
  @property float tilt;
- (void) connectToMetaWear :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback;
- (void) handleTilt;
- (void) tiltEventEmitter;
- (void) deviceEventEmitter:(NSMutableDictionary *)deviceCollection;
@end
