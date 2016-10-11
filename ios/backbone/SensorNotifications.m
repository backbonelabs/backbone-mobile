#import <Foundation/Foundation.h>
#import "SensorNotifications.h"

// All notification names associated to the sensor data events are defined here.
// ActivityModules will listen to these notification names and ActivityModules can
// in turn emit separate events to React Native components through RCTEventEmitter.
// The naming convention is simply the sensor name followed by "Notification" in title case format.
NSString * const AccelerometerNotification = @"AccelerometerNotification";
NSString * const AccelerometerBMI160Notification = @"AccelerometerBMI160Notification";
NSString * const GyroscopeNotification = @"GyroscopeNotification";
