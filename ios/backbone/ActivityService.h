#import "RCTBridgeModule.h"
#import "SensorDataService.h"

@interface ActivityService : NSObject <RCTBridgeModule>
@property (nonatomic, strong) RCTBridge *bridge;
@property SensorDataService *sensorDataService;
@property NSDictionary *activityClassMap;
@end
