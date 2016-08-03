#import <Foundation/Foundation.h>
#import "ActivityService.h"
#import "SensorDataService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

@implementation ActivityService

@synthesize bridge = _bridge;

- (id)init {
  // Map activity names to classes
  self.activityClassMap = @{
                            @"posture": @"PostureModule"
                            };
  return self;
}

RCT_EXPORT_MODULE();

// React Native components will call this when they need to enable a particular activity module.
// A callback should be included as the second argument which would be called with an error object
// if an error occurred while attempting to enable the activity. If no error occurred, null will be passed.
RCT_EXPORT_METHOD(enableActivity:(NSString *)activityName callback:(RCTResponseSenderBlock)callback) {
  NSLog(@"enableActivity");
  @try {
    SensorDataService *sensorDataService = [SensorDataService getSensorDataService];
    if (![self.activityClassMap valueForKey:activityName]) {
      NSLog(@"Invalid activity");
      callback(@[RCTMakeError(@"Invalid activity module", nil, nil)]);
    } else {
      // Instantiate the appropriate ActivityModule subclass and register it as an observer to SensorDataService
      ActivityModule *activityModule = [[NSClassFromString(self.activityClassMap[activityName]) alloc] init];
      NSLog(@"Instantiated %@ activity", NSStringFromClass([activityModule class]));
      
      // We need to pass the RCTBridge to the ActivityModules so that they can emit events to React Native if needed
      [activityModule setBridge:_bridge];

      [sensorDataService registerActivity:activityModule];
      callback(@[[NSNull null]]);
    }
  } @catch (NSException *exception) {
    callback(@[RCTMakeError(exception.reason, nil, exception.userInfo)]);
  }
}

// React Native components will call this when they need to disable a particular activity module.
RCT_EXPORT_METHOD(disableActivity:(NSString *)activityName) {
  NSLog(@"disableActivity");
  SensorDataService *sensorDataService = [SensorDataService getSensorDataService];
  [sensorDataService unregisterActivityByName:activityName];
}

@end