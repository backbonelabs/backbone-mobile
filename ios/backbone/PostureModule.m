#import <Foundation/Foundation.h>
#import "DeviceManagementService.h"
#import "PostureModule.h"
#import "SensorNotifications.h"
#import "RCTEventDispatcher.h"

#define RADIANS_TO_DEGREES(radians) ((radians) * (180.0 / M_PI))
#define TILT_TO_AXIS(tilt) ((1.0 / 90.0) * (tilt))

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
  self.isIncrementing = false;
  self.distanceThreshold = 0.20;
  self.time = 0;
  self.slouchTime = 0;
  self.slouchTimeThreshold = 5;
  return self;
}

- (void)notify:(NSNotification *)notification {
  [super notify:notification];
  NSLog(@"Start PostureModule notify");
  NSDictionary *data = notification.userInfo;
  [self calculatePostureMetrics:data];
}

- (void)calculatePostureMetrics:(NSDictionary *)data {
  double x = [[data objectForKey:@"x"] doubleValue];
  double y = [[data objectForKey:@"y"] doubleValue];
  double z = [[data objectForKey:@"z"] doubleValue];
  
  // In high acceleration cases where -1 < value > 1
  // Perform modulus operation on appropriate axis
  if (x < -1 || x > 1) {
    x = fmod(x, 1);
    //    NSLog(@"MOD X %f", x);
  }
  
  if (y < -1 || y > 1) {
    y = fmod(y, 1);
    //    NSLog(@"MOD Y %f", y);
  }
  
  if (z < -1 || z > 1) {
    z = fmod(z, 1);
    //    NSLog(@"MOD Z %f", z);
  }

  double currentAngleXY = RADIANS_TO_DEGREES(atan2(x, y));
  double currentAngleXZ = RADIANS_TO_DEGREES(atan2(x, z));

  if (!self.calibrated) {
    // Set static angles for XY & XZ axes
    self.controlAngleXZ = currentAngleXZ;
    self.controlAngleXY = currentAngleXY;
    NSLog(@"CONTROL ANGLE XY %f & XZ %f", currentAngleXY, currentAngleXZ);
    
    // Old method of setting static distance with Z & Y axes
    self.controlDistanceOld = sqrt(pow(z, 2) + pow(y, 2));
    NSLog(@"CONTROL DISTANCE OLD %f", self.controlDistanceOld);
    
    self.calibrated = true;
  }
  
  // Set current angle difference for XY & XZ axes
  self.differenceAngleXY = self.controlAngleXY - currentAngleXY;
  self.differenceAngleXZ = self.controlAngleXZ - currentAngleXZ;

  // Find distance using difference in static and current XY & XZ angles
  self.currentDistance = sqrt(pow([self tiltToAxis:self.differenceAngleXZ], 2) + pow([self tiltToAxis:self.differenceAngleXY], 2));
  
  // Old method of setting current distance with Z & Y axes
  self.currentDistanceOld = sqrt(pow(z, 2) + pow(y, 2));
  NSLog(@"CURRENT DISTANCE %f & DISTANCE OLD %f", self.currentDistance, fabs(self.controlDistanceOld - self.currentDistanceOld));

//  NSLog(@"NEW DIFF %f", self.currentDistance);
//  NSLog(@"OLD DIFF %f", fabs(self.controlDistanceOld - self.currentDistanceOld));

  [self handleDistance];
}

/**
 * Translate tilt (difference between control and current) into an 
 * axis value between 0 and 1. 0 = 0 degrees and 1 = 90 degrees.
 */
- (double)tiltToAxis:(double)tilt {
  double axis;
  
  // Tilt is in 3rd quadrant
  if (tilt > 180) {
    axis = TILT_TO_AXIS((tilt - 180));
  }
  
  // Tilt is in 2nd quadrant
  else if (tilt > 90) {
    axis = TILT_TO_AXIS((90 - fmod(tilt, 90)));
  }
  
  // Tilt is in 1st or 4th quadrant
  else {
    axis = TILT_TO_AXIS((fabs(tilt)));
  }
//  NSLog(@"CONTROL XY %f & XZ %f", self.controlAngleXY, self.controlAngleXZ);
//  NSLog(@"DIFFERENCE XY %f & XZ %f", self.differenceAngleXY, self.differenceAngleXZ);
//  NSLog(@"AXIS %f", axis);
  return axis;
}

- (void)handleDistance {
  
  // Log distance if it exceeds the threshold
  if (self.currentDistance > self.distanceThreshold) {
    if (!self.time) {
      self.time = [[NSDate date] timeIntervalSince1970];
    } else {
      self.slouchTime = [[NSDate date] timeIntervalSince1970] - self.time;
      NSLog(@"Slouch time %f", self.slouchTime);
    }

    if (self.slouchTime > self.slouchTimeThreshold) {
      
      // Add call to emitPostureData, because of time and slouchTime reset
      [self emitPostureData];
      MBLMetaWear *device = [DeviceManagementService getDevice];
      [device.hapticBuzzer startHapticWithDutyCycleAsync:255 pulseWidth:500 completion:nil];
      self.time = 0;
      self.slouchTime = 0;
    }
  } else {
    self.time = 0;
    self.slouchTime = 0;
  }

  if (shouldSendNotifications) {
    NSLog(@"Sending posture local notification");
    UILocalNotification *localNotif = [[UILocalNotification alloc] init];
    if (localNotif) {
      localNotif.alertBody = NSLocalizedString(@"Your posture is not optimal!", nil);
      localNotif.soundName = UILocalNotificationDefaultSoundName;
      localNotif.userInfo = @{
                              @"module": self.name
                              };

      [[UIApplication sharedApplication] scheduleLocalNotification:localNotif];

      // Disable additional notifications until the next time the app goes to the background
      shouldSendNotifications = false;
    }
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
