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

RCT_EXPORT_METHOD(disableActivity:(NSString *)activityName) {
  NSLog(@"disableActivity");
  SensorDataService *sensorDataService = [SensorDataService getSensorDataService];
  [sensorDataService unregisterActivityByName:activityName];
}

@end