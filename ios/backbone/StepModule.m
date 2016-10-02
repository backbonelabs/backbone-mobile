//
//  StepModule.m
//  Backbone
//
//  Created by Eko Mirhard on 10/1/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import "DeviceManagementService.h"
#import "StepModule.h"
#import "SensorNotifications.h"
#import "LocalNotificationManager.h"
#import "RCTEventDispatcher.h"

#import "Constant.h"

@implementation StepModule

static BOOL shouldSendNotifications;

+ (void)setShouldSendNotifications:(BOOL)flag {
  shouldSendNotifications = flag;
}

- (id)init {
  self = [super init];
  self.name = @"step";
  self.notificationName = AccelerometerBMI160Notification;
  self.sensor = @"accelerometerBMI160";
  
  _previousSteps = [[NSMutableArray alloc] init];
  
  return self;
}

- (void)notify:(NSNotification *)notification {
  [super notify:notification];
  NSLog(@"Start StepModule notify");
  [self checkIdleTime];
}

- (void)checkIdleTime {
  dispatch_async(dispatch_get_main_queue(), ^(void){
    UIApplication *app = [UIApplication sharedApplication];
    NSArray *eventArray = [app scheduledLocalNotifications];
    
    BOOL hasScheduledNotification = [LocalNotificationManager hasScheduledNotification:self.name];
    
    [_previousSteps addObject:@{
                                @"timestamp" : [NSNumber numberWithDouble:TIME_STAMP]
                                }];
    
    BOOL found = YES;
    
    while (found) {
      found = NO;
      
      for (NSDictionary *dict in _previousSteps) {
        double time = [[dict objectForKey:@"timestamp"] doubleValue];
        
        if (TIME_STAMP - time > STEP_TIME_LIMIT) {
          
          [_previousSteps removeObjectAtIndex:0];
          
          found = YES;
          
          break;
        }
      }
    }

    if ([_previousSteps count] >= MINIMUM_STEP || !hasScheduledNotification) {
      [LocalNotificationManager cancelScheduledNotification:self.name];
      
      if ([LocalNotificationManager scheduleNotification:self.name]) {
        
      }
    }
  });
}

@end
