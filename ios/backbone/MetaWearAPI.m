#import "MetaWearAPI.h"
#import "RCTBridge.h"
#import "RCTEventDispatcher.h"

@implementation MetaWearAPI

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(connectToMetaWear: (RCTResponseSenderBlock)callback) {
  NSLog(@"OBJ-C: Connecting to hardware...");

  self.slouching = NO;
  self.stepCounter = 0;
  self.slouchCounter = 0;
  self.correctPosture = 0;
  self.tempActivityCounter = 0;
  self.postureSensitivity = 0.05;
  
  MBLMetaWearManager *manager = [MBLMetaWearManager sharedManager];
  NSLog(@"Meta %@", manager);
//  [manager startScanForMetaWearsWithHandler:^(NSArray *array) {
//      MBLMetaWear *device = [array firstObject];
//      NSLog(@"MetaWear: %@", device);
//      [device connectWithHandler:^(NSError *error) {
//        if (device.state == MBLConnectionStateConnected) {
//          self.device = device;
//          self.accelerometerMMA8452Q = (MBLAccelerometerMMA8452Q *)device.accelerometer;
//          self.accelerometerMMA8452Q.sampleFrequency = 1.56;
//          callback(@[[NSNull null], @YES]);
//        } else {
//          callback(@[error, @NO]);
//        }
//      }];
//      [[MBLMetaWearManager sharedManager] stopScanForMetaWears];
//
//  }];
}

//RCT_EXPORT_METHOD(startPostureMonitoring) {
//  [self stopActivityTracking];
//
//  [self.accelerometerMMA8452Q.xAxisReadyEvent startNotificationsWithHandlerAsync:^(MBLNumericData *obj, NSError *error) {
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
//  self.accelerometerMMA8452Q.shakeThreshold = 0.12;
//  self.accelerometerMMA8452Q.shakeWidth = 300.00;
//  [self.accelerometerMMA8452Q.shakeEvent startNotificationsWithHandlerAsync:^(id obj, NSError *error) {
//    if (error) {
//      NSLog(@"There was an error %@", error);
//    }
//    [self handleShake];
//  }];
//}
//
//RCT_EXPORT_METHOD(stopActivityTracking) {
//  NSLog(@"OBJ-C: Stop activity tracking...");
//  [self.accelerometerMMA8452Q.shakeEvent stopNotificationsAsync];
//}
//
//RCT_EXPORT_METHOD(stopPostureMonitoring) {
//  NSLog(@"OBJ-C: Stop posture...");
//  [self.accelerometerMMA8452Q.xAxisReadyEvent stopNotificationsAsync];
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
//  [self.bridge.eventDispatcher sendAppEventWithName:@"StepDetected" body: @{@"step": [NSNumber numberWithInt: ++self.stepCounter]}];
//  NSLog(@"stepping");
//}
//
//- (void) activeEvent {
//  BOOL activeEvent = YES;
//  [self.bridge.eventDispatcher sendAppEventWithName: @"UserActive" body: @{@"event": [NSNumber numberWithBool:activeEvent]}];
//}
//
//- (void) inactiveEvent {
//  BOOL inactiveEvent = NO;
//  [self.bridge.eventDispatcher sendAppEventWithName: @"UserInactive" body: @{@"event": [NSNumber numberWithBool:inactiveEvent]}];
//}

@end

