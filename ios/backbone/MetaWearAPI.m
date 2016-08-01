#import "MetaWearAPI.h"
#import "RCTBridge.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"

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
    if (error) {
      NSDictionary *makeError = RCTMakeError(@"Test", error, @{
                                                               @"domain": error.domain,
                                                               @"code": [NSNumber numberWithInteger:error.code],
                                                               @"userInfo": error.userInfo
                                                               });
      callback(@[makeError, @NO]);
    } else {
      [self.manager stopScanForMetaWears];
      [self.device.led flashLEDColorAsync:[UIColor greenColor] withIntensity:1.0 numberOfFlashes:1];
      callback(@[[NSNull null], @YES]);
    }
  }];
}

RCT_EXPORT_METHOD(selectMetaWear:(NSString *)deviceID:(RCTResponseSenderBlock)callback) {
  [self connectToMetaWear:[self.nativeDeviceCollection objectForKey:deviceID]:callback];
}

RCT_EXPORT_METHOD(startPostureMonitoring) {
  self.accelerometer = (MBLAccelerometer *)self.device.accelerometer;
  self.accelerometer.sampleFrequency = 1.56;

  self.calibrated = false;

  //placeholder
  self.slouchThreshold = 0.10;

  [self.accelerometer.dataReadyEvent startNotificationsWithHandlerAsync:^(MBLAccelerometerData * _Nullable obj, NSError * _Nullable error) {
    self.currentDistance = sqrt((pow(obj.z, 2) + pow(obj.y, 2)));
    if (!self.calibrated) {
      self.controlDistance = self.currentDistance;
      self.calibrated = true;
    }
    else if (fabs(self.controlDistance - self.currentDistance) >= self.slouchThreshold) {
      NSLog(@"Control distance: %f, current distance: %f", self.controlDistance, self.currentDistance);
    }
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
