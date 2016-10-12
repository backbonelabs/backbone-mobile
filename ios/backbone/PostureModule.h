#import "ActivityModule.h"

@interface PostureModule : ActivityModule
@property BOOL calibrated;
@property BOOL isIncrementing;
@property double controlY;
@property double controlZ;
@property double currentDistance;
@property double distanceThreshold;
@property double time;
@property double slouchTime;
@property double slouchTimeThreshold;
+ (void)setShouldSendNotifications:(BOOL)flag;
- (void)handleDistance;
- (void)emitPostureData;
@end
