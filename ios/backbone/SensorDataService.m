#import "SensorDataService.h"
#import "MetaWearAPI.h"
#import "ActivityModule.h"
#import "SensorNotifications.h"

@implementation SensorDataService

- (id)initWithDevice:(MBLMetaWear *)device {
  self.device = device;
  self.activeActivities = [[NSMutableSet alloc] init];
  self.activeSensors = [[NSMutableSet alloc] init];
  return self;
}

// Returns a singleton instance
// Any consumers of SensorDataService should call this to retrieve an instance of SensorDataService
// instead of instantiating their own SensorDataService instance
+ (SensorDataService *)getSensorDataService {
  static SensorDataService *_sharedInstance = nil;
  MBLMetaWear *device = [MetaWearAPI getDevice];
  if (!device) {
    @throw [NSException exceptionWithName:@"DeviceNotConnectedException" reason:@"Not connected to a device" userInfo:nil];
  } else {
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
      _sharedInstance = [[self alloc] initWithDevice:device];
    });
    return _sharedInstance;
  }
}

- (void)registerActivity:(ActivityModule *)activityModule {
  NSLog(@"registerActivity");
  SensorDataService *sensorDataService = [SensorDataService getSensorDataService];

  // Add activity to list of active activities
  [sensorDataService.activeActivities addObject:activityModule];

  // Enable the activity module to start listening to notifications
  [activityModule startListening];

  if (![sensorDataService.activeSensors containsObject:activityModule.sensor]) {
    // There are currently no event handlers for the activity's required sensor,
    // so we will register an event handler with the sensor

    // The event handlers should post a notification to NSNotificationCenter with
    // the sensor data transformed into a NSDictionary
    if ([activityModule.sensor isEqualToString:@"accelerometer"]) {
      // accelerometer
      NSLog(@"Enabling accelerometer");
      sensorDataService.device.accelerometer.sampleFrequency = 1.56;
      [sensorDataService.device.accelerometer.dataReadyEvent startNotificationsWithHandlerAsync:^(MBLAccelerometerData * _Nullable obj, NSError * _Nullable error) {
        // Post notification with the RMS, x, y, and z values from the accelerometer event
        [[NSNotificationCenter defaultCenter] postNotificationName:AccelerometerNotification
                                                            object:sensorDataService
                                                          userInfo:@{
                                                                     @"rms": [NSNumber numberWithDouble:obj.RMS],
                                                                     @"x": [NSNumber numberWithDouble:obj.x],
                                                                     @"y": [NSNumber numberWithDouble:obj.y],
                                                                     @"z": [NSNumber numberWithDouble:obj.z]
                                                                     }];
      }];
    }

    // Add the sensor to the list of sensors we're actively listening to
    [sensorDataService.activeSensors addObject:activityModule.sensor];
  }
}

- (void)unregisterActivityByName:(NSString *)activityName {
  NSLog(@"unregisterActivityByName");
  SensorDataService *sensorDataService = [SensorDataService getSensorDataService];
  NSPredicate *isNotActivityName = [NSPredicate predicateWithBlock:^BOOL(ActivityModule * _Nonnull activity, NSDictionary<NSString *,id> * _Nullable bindings) {
    if ([activity.name isEqualToString:activityName]) {
      return NO;
    } else {
      return YES;
    }
  }];
  
  // Find all active activities with the same name and have them stop listening to notifications
  for (ActivityModule *activity in sensorDataService.activeActivities) {
    if ([activity.name isEqualToString:activityName]) {
      [activity stopListening];
    }
  }
  
  // Remove activities matching the name from the set of active activities
  [sensorDataService.activeActivities filterUsingPredicate:isNotActivityName];
  
  // Get a collection of all the sensors that are still being used by the active activities
  NSMutableSet *activeSensors = [[NSMutableSet alloc] init];
  for (ActivityModule *activityModule in sensorDataService.activeActivities) {
    [activeSensors addObject:activityModule.sensor];
  }

  // Check if there are any sensors no longer being used by the active activities
  [sensorDataService.activeSensors enumerateObjectsUsingBlock:^(NSString * _Nonnull listeningToSensor, BOOL * _Nonnull stop) {
    __block BOOL found = NO;
    [activeSensors enumerateObjectsUsingBlock:^(NSString * _Nonnull activeSensor, BOOL * _Nonnull stopEnumeratingActiveSensors) {
      if ([activeSensor isEqualToString:listeningToSensor]) {
        found = YES;
        *stopEnumeratingActiveSensors = YES;
      }
    }];
    
    if (!found) {
      // There is a sensor that is no longer used by any of the active activity modules
      if ([listeningToSensor isEqualToString:@"accelerometer"]) {
        // Stop notifications on accelerometer
        NSLog(@"Disabling notifications on accelerometer");
        [sensorDataService.device.accelerometer.dataReadyEvent stopNotificationsAsync];
      } else if ([listeningToSensor isEqualToString:@"gyro"]) {
        // Stop notifications on gyroscope
        NSLog(@"Disabling notifications on gyroscope");
        [sensorDataService.device.gyro.dataReadyEvent stopNotificationsAsync];
      }
    }
  }];
  
  // Update the set of active sensors
  [sensorDataService.activeSensors removeAllObjects];
  [sensorDataService.activeSensors setSet:activeSensors];
}

@end