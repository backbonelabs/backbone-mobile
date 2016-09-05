#import "ActivityModule.h"

@interface PostureModule : ActivityModule
@property BOOL calibrated;
@property BOOL isIncrementing;
//@property double controlAngle;
//@property double currentAngle;
//@property double tilt;
@property double controlDistance;
@property double currentDistance;
@property double distanceThreshold;
//@property double tiltThreshold;
@property double time;
@property double slouchTime;
@property double slouchTimeThreshold;
+ (void)setShouldSendNotifications:(BOOL)flag;
//- (void)handleTilt;
- (void)handleDistance;
- (void)emitPostureData;
@end