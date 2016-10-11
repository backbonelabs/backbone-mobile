#import "SensorDataService.h"
#import "DeviceManagementService.h"
#import "ActivityModule.h"
#import "SensorNotifications.h"
#import "LocalNotificationManager.h"

#import "Constant.h"

/**
 SensorDataService manages which device sensors to listen to based on which ActivityModules
 are enabled. Each ActivityModule has a property for indicating which sensor they need.
 Since multiple activities can be enabled at the same time, it's possible that multiple activities
 will use the same sensor.
 
 SensorDataService will manage the set of active activities and only
 attach one data handler for each sensor that's needed by all the activities. In other words, if two
 activity modules need to use the accelerometer, SensorDataService would have one and only one data event
 handler attached to the accelerometer.
 
 SensorDataService will then post a notification for each sensor data, and the individual ActivityModules
 will listen to the notifications they are interested in. This allows sensor data from the device to be streamed
 to one observer (SensorDataService), and SensorDataService will in turn broadcast the event data to any
 interested ActivityModules.
 
 When a sensor is no longer needed by any active ActivityModules, SensorDataService will remove the data event
 handler from the sensor.
 
 When retrieving an instance of SensorDataService, always call the getSensorDataService method at the class level.
 A new instance of SensorDataService should NOT be instantiated. This ensures we are working with a singleton throughout
 the lifecycle of the app.
 */
@implementation SensorDataService

- (id)initWithDevice:(MBLMetaWear *)device {
  self.device = device;
  self.activeActivities = [[NSMutableSet alloc] init];
  self.activeSensors = [[NSMutableSet alloc] init];
  return self;
}

/**
 Returns a singleton instance.
 Any consumers of SensorDataService should call this to retrieve an instance of SensorDataService
 instead of instantiating their own SensorDataService instance.
 @return SensorDataService A singleton instance of SensorDataService
 */
+ (SensorDataService *)getSensorDataService {
  static SensorDataService *_sharedInstance = nil;
  MBLMetaWear *device = [DeviceManagementService getDevice];
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

/**
 Registers an ActivityModule as active and attaches a data event handler to the appropriate
 sensor if needed
 @param activityModule An ActivityModule to register to the list of active activities
 */
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
      MBLAccelerometerBMI160 *accelerometerBMI160 = (MBLAccelerometerBMI160*)sensorDataService.device.accelerometer;
      accelerometerBMI160.sampleFrequency = 1.56;
      [accelerometerBMI160.dataReadyEvent startNotificationsWithHandlerAsync:^(MBLAccelerometerData * _Nullable obj, NSError * _Nullable error) {
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
    else if ([activityModule.sensor isEqualToString:@"accelerometerBMI160"]) {
      // accelerometer
      NSLog(@"Enabling accelerometerBMI160");
      [[UIApplication sharedApplication] cancelAllLocalNotifications];
      
      if ([LocalNotificationManager scheduleNotification:activityModule.name]) {
        MBLAccelerometerBMI160 *accelerometerBMI160 = (MBLAccelerometerBMI160*)sensorDataService.device.accelerometer;
        
        [accelerometerBMI160.stepEvent startNotificationsWithHandlerAsync:^(MBLNumericData * _Nullable obj, NSError * _Nullable error) {
          [[NSNotificationCenter defaultCenter] postNotificationName:AccelerometerBMI160Notification
                                                              object:sensorDataService
                                                            userInfo:nil];
        }];
      }
    }

    // Add the sensor to the list of sensors we're actively listening to
    [sensorDataService.activeSensors addObject:activityModule.sensor];
  }
}

/**
 Removes an ActivityModule from the list of active activities and removes the data event handler
 from a sensor if no other activities require that particular sensor. This will unregister all
 active activities with the same name.
 @param activityName Name of the ActivityModule to unregister
 */
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
      }
      else if ([listeningToSensor isEqualToString:@"gyro"]) {
        // Stop notifications on gyroscope
        NSLog(@"Disabling notifications on gyroscope");
        [sensorDataService.device.gyro.dataReadyEvent stopNotificationsAsync];
      }
      else if ([listeningToSensor isEqualToString:@"accelerometerBMI160"]) {
        NSLog(@"Disabling notifications on accelerometerBMI160");
        [[UIApplication sharedApplication] cancelAllLocalNotifications];
        
        MBLAccelerometerBMI160 *accelerometerBMI160 = (MBLAccelerometerBMI160*)sensorDataService.device.accelerometer;
        [accelerometerBMI160.stepEvent stopNotificationsAsync];
      }
    }
  }];
  
  // Update the set of active sensors
  [sensorDataService.activeSensors removeAllObjects];
  [sensorDataService.activeSensors setSet:activeSensors];
}

/**
 Removes all ActivityModule from the list of active activities and removes all data event handlers
 from all active sensors
 */
- (void)unregisterAllActivities {
  NSLog(@"unregisterAllActivities");
  SensorDataService *sensorDataService = [SensorDataService getSensorDataService];
  
  NSMutableSet *activeActivityNames = [[NSMutableSet alloc] init];
  
  // Store the names into a separate set before we start manipulating the activity set
  for (ActivityModule *activity in sensorDataService.activeActivities) {
    [activeActivityNames addObject:activity.name];
  }
  
  // Unregister active activities one by one
  for (NSString *activityName in activeActivityNames) {
    [sensorDataService unregisterActivityByName:activityName];
  }
}

@end
