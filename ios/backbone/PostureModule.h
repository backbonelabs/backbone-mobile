#import "ActivityModule.h"

@interface PostureModule : ActivityModule
@property BOOL calibrated;
@property double controlAngle;
@property double currentAngle;
@property double tilt;
@property double controlDistance;
@property double currentDistance;
@property double distanceThreshold;
@property double tiltThreshold;
+ (void)setShouldSendNotifications:(BOOL)flag;
- (void)handleTilt;
@end