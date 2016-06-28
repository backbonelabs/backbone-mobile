#import "RCTBridgeModule.h"
#import <MetaWear/MetaWear.h>

@interface MetaWearAPI : NSObject <RCTBridgeModule>
  @property (nonatomic, strong) RCTBridge *bridge;
  @property MBLMetaWear *device;
  @property int slouchTime;
  @property int postureTime;
  @property BOOL slouching;
  @property BOOL userActive;
  @property float postureSensitivity;
  @property float correctPosture;
  @property float stepCounter;
  @property float slouchCounter;
  @property float tempActivityCounter;
  - (void) handleShake;
  - (void) checkForIdle;
  - (void) checkForActivity;
  - (void) activateVibrate;
  - (void) slouchEvent;
  - (void) slouchTimeIncremented;
  - (void) postureTimeIncremented;
  - (void) stepEvent;
  - (void) activeEvent;
  - (void) inactiveEvent;
@end
