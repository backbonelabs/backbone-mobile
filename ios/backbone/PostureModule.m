#import <Foundation/Foundation.h>
#import "DeviceManagementService.h"
#import "PostureModule.h"
#import "SensorNotifications.h"
#import "RCTEventDispatcher.h"

#define RADIANS_TO_DEGREES(radians) ((radians) * (180.0 / M_PI))

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
  self.timeThreshold = 5;
  self.tiltThreshold = 10;
  return self;
}

- (void)notify:(NSNotification *)notification {
  [super notify:notification];
  NSLog(@"Start PostureModule notify");
  NSDictionary *data = notification.userInfo;
  [self calculatePostureMetrics:data];
  [self handleTilt];
  [self handleDistance];
}

- (void)calculatePostureMetrics:(NSDictionary *)data {
  double x = [[data objectForKey:@"x"] doubleValue];
  double y = [[data objectForKey:@"y"] doubleValue];
  double z = [[data objectForKey:@"z"] doubleValue];
  self.currentAngle = RADIANS_TO_DEGREES(atan2(x, z));
  self.currentDistance = sqrt(pow(z, 2) + pow(y, 2));

  if (!self.calibrated) {
    // set baseline metrics
    self.controlAngle = self.currentAngle;
    self.controlDistance = self.currentDistance;
    self.calibrated = true;
  } else {
    // calculate tilt
    // tilt will be positive if leaning forward, negative if leaning backward

    // check if current angle is in the upper or lower quadrants based on atan2
    if (self.currentAngle >= 0) {
      // current angle is in the upper quadrants
      if (self.currentAngle >= self.controlAngle) {
        // leaned back
        self.tilt = -(self.currentAngle - self.controlAngle);
      } else {
        // leaned forward
        self.tilt = self.controlAngle - self.currentAngle;
      }
    } else {
      // current angle is in the lower quadrants
      if (self.currentAngle >= (self.controlAngle - 180)) {
        // leaned forward between 90 and 180 degrees
        self.tilt = self.controlAngle + fabs(self.currentAngle);
      } else {
        // leaned backward between 90 and 180 degrees
        self.tilt = self.controlAngle - self.currentAngle - 360;
      }
    }
  }
}

- (void)handleTilt {
  NSLog(@"Tilt is: %f", self.tilt);
  if (self.tilt > self.tiltThreshold) {
    MBLMetaWear *device = [DeviceManagementService getDevice];
    [device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:5];

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
  }
  [self.bridge.eventDispatcher sendAppEventWithName:@"PostureTilt" body:@{@"tilt": [NSNumber numberWithDouble:self.tilt]}];
}

- (void) incrementTime {
  NSLog(@"Incrementing time");
  self.isIncrementing = true;
  self.time++;
  [NSThread sleepForTimeInterval:1.0f];
  self.isIncrementing = false;
}

- (void)handleDistance {
  // log distance if it exceeds the threshold
  if (fabs(self.controlDistance - self.currentDistance) >= self.distanceThreshold) {
    NSLog(@"Control distance: %f, current distance: %f, time: %f", self.controlDistance, self.currentDistance, self.time);
    if (self.time >= self.timeThreshold) {
      self.time = 0;
      MBLMetaWear *device = [DeviceManagementService getDevice];
      [device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
    } else if (!self.isIncrementing) {
      [self performSelectorInBackground:@selector(incrementTime) withObject:nil];
    }
  } else {
    self.time = 0;
  }
  [self.bridge.eventDispatcher sendAppEventWithName:@"PostureDistance" body:@{
                                                                              @"currentDistance": [NSNumber numberWithDouble:self.currentDistance],
                                                                              @"controlDistance": [NSNumber numberWithDouble:self.controlDistance],
                                                                              @"slouchTime": [NSNumber numberWithDouble:self.time]
                                                                              }];
}


@end
