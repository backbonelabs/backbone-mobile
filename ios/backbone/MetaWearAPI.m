#import "MetaWearAPI.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"
#define RADIANS_TO_DEGREES(radians) ((radians) * (180.0 / M_PI))

@implementation MetaWearAPI

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(startPostureMonitoring) {
  self.accelerometer = (MBLAccelerometer *)self.device.accelerometer;
  self.accelerometer.sampleFrequency = 1.56;

  self.calibrated = false;

  //placeholder
  self.slouchThreshold = 0.10;

  [self.accelerometer.dataReadyEvent startNotificationsWithHandlerAsync:^(MBLAccelerometerData * _Nullable obj, NSError * _Nullable error) {
    self.currentAngle = RADIANS_TO_DEGREES(atan2(obj.x, obj.z));
    self.currentDistance = sqrt((pow(obj.z, 2) + pow(obj.y, 2)));
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

      // log distance if it exceeds the threshold
      if (fabs(self.controlDistance - self.currentDistance) >= self.slouchThreshold) {
        NSLog(@"Control distance: %f, current distance: %f", self.controlDistance, self.currentDistance);
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

@end
