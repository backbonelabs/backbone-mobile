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
      self.device = task.result[0];
      [self connectToMetaWear:self.device:callback];
    } else {
      self.nativeDeviceCollection =[NSMutableDictionary new];
      NSMutableDictionary *deviceCollection = [NSMutableDictionary new];
      [self.manager startScanForMetaWearsAllowDuplicates:YES handler:^(NSArray *array) {
        for (MBLMetaWear *device in array) {
          NSString *deviceID = [device.identifier UUIDString];
          self.nativeDeviceCollection[deviceID] = device;
          deviceCollection[deviceID] = @{
            @"name": device.name,
            @"identifier": deviceID,
            @"RSSI": device.discoveryTimeRSSI,
          };
          [self deviceEventEmitter:deviceCollection];
        }
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
      self.currentAngle = RADIANS_TO_DEGREES(atan(obj.z / obj.x));
    if (!self.calibrated) {
      float xControl = obj.x;
      float zControl = obj.z;
      self.controlAngle = RADIANS_TO_DEGREES(atan(zControl / xControl));
      self.calibrated = true;
    } else if (obj.x < 0 && obj.z > 0) {
      self.tilt = 90 + (90 + (self.currentAngle - self.controlAngle));
    } else if (obj.x < 0 && obj.z < 0) {
      self.tilt = -90 + (-90 - (self.currentAngle - self.controlAngle));
    } else {
      self.tilt = self.currentAngle - self.controlAngle;
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
  [self.bridge.eventDispatcher sendAppEventWithName:@"Tilt" body: @{@"tilt": [NSNumber numberWithFloat:self.tilt]}];
}

- (void) deviceEventEmitter:(NSMutableDictionary *)deviceCollection {
  [self.bridge.eventDispatcher sendAppEventWithName:@"Devices" body: deviceCollection];
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
