#import <Foundation/Foundation.h>
#import "ActivityModule.h"
#import "DeviceManagementService.h"

@interface SensorDataService : NSObject
@property MBLMetaWear *device;
@property NSMutableSet *activeSensors;
@property NSMutableSet *activeActivities;
+ (SensorDataService *)getSensorDataService;
- (id)initWithDevice:(MBLMetaWear *)device;
- (void)registerActivity:(ActivityModule *)activityModule;
- (void)unregisterActivityByName:(NSString *)activityName;
- (void)unregisterAllActivities;
@end
