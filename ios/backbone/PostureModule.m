#import <Foundation/Foundation.h>
#import "DeviceManagementService.h"
#import "PostureModule.h"
#import "SensorNotifications.h"
#import "LocalNotificationManager.h"
#import "RCTEventDispatcher.h"

#import "Constant.h"

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
//  self.tiltThreshold = 10;
  return self;
}

- (void)notify:(NSNotification *)notification {
  [super notify:notification];
  NSLog(@"Start PostureModule notify");
  NSDictionary *data = notification.userInfo;
  [self calculatePostureMetrics:data];
//  [self handleTilt];
  [self handleDistance];
}

- (void)calculatePostureMetrics:(NSDictionary *)data {
//  double x = [[data objectForKey:@"x"] doubleValue];
  double y = [[data objectForKey:@"y"] doubleValue];
  double z = [[data objectForKey:@"z"] doubleValue];
//  self.currentAngle = RADIANS_TO_DEGREES(atan2(x, z));
  self.currentDistance = sqrt(pow(z, 2) + pow(y, 2));
  
  if (!self.calibrated) {
    // set baseline metrics
//    self.controlAngle = self.currentAngle;
    self.controlDistance = self.currentDistance;
    self.calibrated = true;
  }
//  else {
//    // calculate tilt
//    // tilt will be positive if leaning forward, negative if leaning backward
//    
//    // check if current angle is in the upper or lower quadrants based on atan2
//    if (self.currentAngle >= 0) {
//      // current angle is in the upper quadrants
//      if (self.currentAngle >= self.controlAngle) {
//        // leaned back
//        self.tilt = -(self.currentAngle - self.controlAngle);
//      } else {
//        // leaned forward
//        self.tilt = self.controlAngle - self.currentAngle;
//      }
//    } else {
//      // current angle is in the lower quadrants
//      if (self.currentAngle >= (self.controlAngle - 180)) {
//        // leaned forward between 90 and 180 degrees
//        self.tilt = self.controlAngle + fabs(self.currentAngle);
//      } else {
//        // leaned backward between 90 and 180 degrees
//        self.tilt = self.controlAngle - self.currentAngle - 360;
//      }
//    }
//  }
}

//- (void)handleTilt {
//  NSLog(@"Tilt is: %f", self.tilt);
//  if (self.tilt > self.tiltThreshold) {
//    MBLMetaWear *device = [DeviceManagementService getDevice];
//    [device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:5];
//    
//    if (shouldSendNotifications) {
//      NSLog(@"Sending posture local notification");
//      UILocalNotification *localNotif = [[UILocalNotification alloc] init];
//      if (localNotif) {
//        localNotif.alertBody = NSLocalizedString(@"Your posture is not optimal!", nil);
//        localNotif.soundName = UILocalNotificationDefaultSoundName;
//        localNotif.userInfo = @{
//                                @"module": self.name
//                                };
//        
//        [[UIApplication sharedApplication] scheduleLocalNotification:localNotif];
//        
//        // Disable additional notifications until the next time the app goes to the background
//        shouldSendNotifications = false;
//      }
//    }
//  }
//  [self.bridge.eventDispatcher sendAppEventWithName:@"PostureTilt" body:@{@"tilt": [NSNumber numberWithDouble:self.tilt]}];
//}

- (void)handleDistance {
  NSLog(@"Control distance: %f, current distance: %f, slouch time: %f", self.controlDistance, self.currentDistance, self.slouchTime);
  // log distance if it exceeds the threshold
  if (fabs(self.controlDistance - self.currentDistance) >= self.distanceThreshold) {
    if (!self.time) {
      self.time = [[NSDate date] timeIntervalSince1970];
    } else {
      self.slouchTime = [[NSDate date] timeIntervalSince1970] - self.time;
    }
    
    if (self.slouchTime > self.slouchTimeThreshold) {
      // Check if a notification should be posted
      if (shouldSendNotifications) {
        // Post local notification to phone
        NSLog(@"Sending posture local notification");
        if ([LocalNotificationManager scheduleNotification:self.name]) {
          // Disable additional notifications until the next time the app goes to the background
          shouldSendNotifications = NO;
        }
      }

      MBLMetaWear *device = [DeviceManagementService getDevice];
      [device.hapticBuzzer startHapticWithDutyCycleAsync:255 pulseWidth:500 completion:nil];
      self.time = 0;
      self.slouchTime = 0;
    }
  } else {
    self.time = 0;
    self.slouchTime = 0;
  }

  [self emitPostureData];
}

- (void)emitPostureData {
  [self.bridge.eventDispatcher sendAppEventWithName:@"PostureDistance" body:@{
                                                                              @"currentDistance": [NSNumber numberWithDouble:self.currentDistance],
                                                                              @"controlDistance": [NSNumber numberWithDouble:self.controlDistance],
                                                                              @"slouchTime": [NSNumber numberWithDouble: self.slouchTime]
                                                                              }];
}


@end
