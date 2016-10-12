#import "ActivityModule.h"

@interface PostureModule : ActivityModule
@property BOOL calibrated;
@property BOOL isIncrementing;
@property double controlAngleXY;
@property double controlAngleXZ;
@property double differenceAngleXY;
@property double differenceAngleXZ;
@property double currentDistance;

// For reference purposes only
@property double controlDistanceOld;
@property double currentDistanceOld;

@property double distanceThreshold;
@property double time;
@property double slouchTime;
@property double slouchTimeThreshold;
+ (void)setShouldSendNotifications:(BOOL)flag;
- (double)tiltToAxis:(double)tilt;
- (void)handleDistance;
- (void)emitPostureData;
@end