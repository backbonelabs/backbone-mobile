#import <Foundation/Foundation.h>
#import "DeviceManagementService.h"
#import "PostureModule.h"
#import "SensorNotifications.h"
#import "LocalNotificationManager.h"
#import "RCTEventDispatcher.h"
#import "Constants.h"

@implementation PostureModule

static BOOL shouldSendNotifications;

+ (void)setShouldSendNotifications:(BOOL)flag {
  shouldSendNotifications = flag;
}

- (id)init {
  self = [super init];
  self.name = @"posture";
  self.notificationName = AccelerometerNotification;
  self.sensor = @"accelerometer";
  self.calibrated = false;
  self.distanceThreshold = 0.20;
  self.time = 0;
  self.slouchTime = 0;
  self.slouchTimeThreshold = 5;
  return self;
}

- (void)notify:(NSNotification *)notification {
  [super notify:notification];
  DLog(@"Start PostureModule notify");
  NSDictionary *data = notification.userInfo;
  [self calculatePostureMetrics:data];
  [self handleDistance];
}

- (void)calculatePostureMetrics:(NSDictionary *)data {
  double y = [[data objectForKey:@"y"] doubleValue];
  double z = [[data objectForKey:@"z"] doubleValue];
  
  if (!self.calibrated) {
    // Set baseline metrics
    self.controlY = y;
    self.controlZ = z;
    self.calibrated = true;
  } else {
    // Calculate difference between control and current y & z axes
    // Use the Pythagorean Theorem to calculate current distance
    self.currentDistance = sqrt(pow((self.controlZ - z), 2) + pow((self.controlY - y), 2));
    DLog(@"currentDistance %f", self.currentDistance);
    [self handleDistance];
  }
}

- (void)handleDistance {
  // Check whether distance exceeds the distance threshold
  if (self.currentDistance >= self.distanceThreshold) {
    DLog(@"Slouching for... %f", self.slouchTime);
    // Store timestamp of when slouching was first detected
    if (!self.time) {
      self.time = [[NSDate date] timeIntervalSince1970];
    } else {
      // Calculate time elapsed since slouching was first detected
      self.slouchTime = [[NSDate date] timeIntervalSince1970] - self.time;
    }
    
    // Check if user has been slouching for longer than threshold
    if (self.slouchTime > self.slouchTimeThreshold) {
      // Emit posture data event before time variables are cleared
      [self emitPostureData];
      DLog(@"BZZT!");
      MBLMetaWear *device = [DeviceManagementService getDevice];
      [device.hapticBuzzer startHapticWithDutyCycleAsync:248 pulseWidth:500 completion:nil];
      // Check if a notification should be posted
      if (shouldSendNotifications) {
        // Post local notification to phone
        DLog(@"Sending posture local notification");
        if ([LocalNotificationManager scheduleNotification:self.name]) {
          // Disable additional notifications until the next time the app goes to the background
          shouldSendNotifications = NO;
        }
      }
      
      // Reset time variables, in order to calculate time again
      self.time = 0;
      self.slouchTime = 0;
    }
  } else {
    // User stopped slouching, reset time variables
    self.time = 0;
    self.slouchTime = 0;
  }
  
  [self emitPostureData];
}

- (void)emitPostureData {
  [self.bridge.eventDispatcher sendAppEventWithName:@"PostureDistance" body:@{
                                                                              @"currentDistance": [NSNumber numberWithDouble:self.currentDistance],
                                                                              @"slouchTime": [NSNumber numberWithDouble: self.slouchTime]
                                                                              }];
}


@end
