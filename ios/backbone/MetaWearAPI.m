#import "MetaWearAPI.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"
#define RADIANS_TO_DEGREES(radians) ((radians) * (180.0 / M_PI))

@implementation MetaWearAPI

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(searchForMetaWear: (RCTResponseSenderBlock)callback) {

  self.manager = [MBLMetaWearManager sharedManager];

  [[self.manager retrieveSavedMetaWearsAsync] continueWithBlock:^id(BFTask *task) {
    if ([task.result count]) {
      MBLMetaWear *device = task.result[0];
      self.device = device;
      [self connectToMetaWear:self.device:callback];
    } else {
      [self.manager startScanForMetaWearsAllowDuplicates:NO handler:^(NSArray *array) {
        self.device = 0;

        for (MBLMetaWear *device in array) {
          if (!self.device || self.device.discoveryTimeRSSI.integerValue > device.discoveryTimeRSSI.integerValue) {
            self.device = device;
          }
        }
        [self connectToMetaWear:self.device:callback];
        [self.device rememberDevice];
      }];
    }
    return nil;
  }];
}

- (void)connectToMetaWear :(MBLMetaWear *)device :(RCTResponseSenderBlock)callback {
  [self.device connectWithHandler:^(NSError *error) {
    if (self.device.state == MBLConnectionStateConnected) {
      [self.device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      callback(@[[NSNull null], @YES]);
    }
  }];
}

RCT_EXPORT_METHOD(startPostureMonitoring) {
  self.accelerometer = (MBLAccelerometerMMA8452Q *)self.device.accelerometer;
  self.accelerometer.sampleFrequency = 1.56;

  self.calibrated = false;

  [self.accelerometer.dataReadyEvent startNotificationsWithHandlerAsync:^(MBLAccelerometerData * _Nullable obj, NSError * _Nullable error) {
    self.currentAngle = RADIANS_TO_DEGREES(atan2(obj.x, obj.z));
    if (!self.calibrated) {
      // set baseline posture
      self.controlAngle = self.currentAngle;
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

    [self handleTilt];
    [self tiltEventEmitter];
    NSLog(@"Tilt is: %f", self.tilt);
  }];
}

RCT_EXPORT_METHOD(stopPostureMonitoring) {
  [self.accelerometer.dataReadyEvent stopNotificationsAsync];
}

- (void) handleTilt {
  if (self.tilt > 10) {
    [self.device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:5];
  }
}

- (void) tiltEventEmitter {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Tilt" body: @{@"tilt": [NSNumber numberWithDouble:self.tilt]}];
}

//RCT_EXPORT_METHOD(startPostureMonitoring) {
//  [self stopActivityTracking];
//
//  [self.accelerometer.xAxisReadyEvent startNotificationsWithHandlerAsync:^(MBLNumericData *obj, NSError *error) {
//    if (!error) {
//      if (self.correctPosture != 0) {
//        if ((self.correctPosture - self.postureSensitivity) > obj.value.floatValue) {
//          [self slouchTimeIncremented];
//          if (self.slouching != YES) {
//            self.slouching = YES;
//            [self activateVibrate];
//            [self slouchEvent];
//          }
//        } else {
//          [self postureTimeIncremented];
//          if (self.slouching != NO) {
//            self.slouching = NO;
//          }
//        }
//      } else {
//        self.correctPosture = obj.value.floatValue;
//        return;
//      }
//    } else {
//      NSLog(@"Obj-C: There is an error %@ or we're stopping", error);
//    }
//  }];
//}
//
//RCT_EXPORT_METHOD(startActivityTracking) {
//  NSLog(@"OBJ-C: Start activity tracking...");
//  self.accelerometer.shakeThreshold = 0.12;
//  self.accelerometer.shakeWidth = 300.00;
//  [self.accelerometer.shakeEvent startNotificationsWithHandlerAsync:^(id obj, NSError *error) {
//    if (error) {
//      NSLog(@"There was an error %@", error);
//    }
//    [self handleShake];
//  }];
//}
//
//RCT_EXPORT_METHOD(stopActivityTracking) {
//  NSLog(@"OBJ-C: Stop activity tracking...");
//  [self.accelerometer.shakeEvent stopNotificationsAsync];
//}
//
//RCT_EXPORT_METHOD(stopPostureMonitoring) {
//  NSLog(@"OBJ-C: Stop posture...");
//  [self.accelerometer.xAxisReadyEvent stopNotificationsAsync];
//  self.correctPosture = 0;
//  [self startActivityTracking];
//}
//
//- (void) handleShake {
//  [self stepEvent];
//  self.tempActivityCounter++;
//  [NSThread detachNewThreadSelector:@selector(checkForIdle) toTarget:self withObject:nil];
//  if (self.tempActivityCounter == 10 && !self.userActive) {
//    self.tempActivityCounter = 0;
//    self.userActive = YES;
//    [self activeEvent];
//    [NSThread detachNewThreadSelector:@selector(checkForActivity) toTarget:self withObject:nil];
//  }
//}
//
//- (void)checkForIdle {
//  NSLog(@"OBJ-C: Checking for user idle");
//  int lastCounterRead = self.tempActivityCounter;
//  [NSThread sleepForTimeInterval:10.0f];
//  if ((self.tempActivityCounter - lastCounterRead) < 10) {
//    self.tempActivityCounter = 0;
//  }
//}
//
//- (void)checkForActivity {
//  NSLog(@"OBJ-C: Checking for activity");
//  for (int i = 1; ; i++) {
//    int lastCounterRead = self.tempActivityCounter;
//    [NSThread sleepForTimeInterval:10.0f];
//    if ((self.tempActivityCounter - lastCounterRead) < 10) {
//      NSLog(@"OBJ-C: User state: Idle for 10 seconds!");
//      self.tempActivityCounter = 0;
//      self.userActive = NO;
//      [self inactiveEvent];
//      [self activateVibrate];
//      break;
//    }
//  }
//}
//
//- (void) activateVibrate {
//  [self.device.hapticBuzzer startHapticWithDutyCycleAsync:255 pulseWidth:500 completion:nil];
//}
//
//- (void) slouchEvent {
//  [self.bridge.eventDispatcher sendAppEventWithName:@"SlouchEvent" body: @{@"slouch": [NSNumber numberWithInt: ++self.slouchCounter]}];
//}
//
//- (void) slouchTimeIncremented {
//  [self.bridge.eventDispatcher sendAppEventWithName: @"SlouchTime" body: @{@"time": [NSNumber numberWithInt: ++self.slouchTime]}];
//}
//
//- (void) postureTimeIncremented {
//  [self.bridge.eventDispatcher sendAppEventWithName: @"PostureTime" body: @{@"time": [NSNumber numberWithInt: ++self.postureTime]}];
//}
//
//- (void) stepEvent {
//  [self.bridge.eventDispatcher sendAppEventWithName:@"Step" body: @{@"step": [NSNumber numberWithInt: ++self.stepCounter]}];
//}
//
//- (void) activeEvent {
//  [self.bridge.eventDispatcher sendAppEventWithName: @"Active" body: @{@"event": [NSNumber numberWithBool:YES]}];
//}
//
//- (void) inactiveEvent {
//  [self.bridge.eventDispatcher sendAppEventWithName: @"Inactive" body: @{@"event": [NSNumber numberWithBool:NO]}];
//}

@end
