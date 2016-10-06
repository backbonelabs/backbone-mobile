//
//  LocalNotificationManager.m
//  Backbone
//
//  Created by Eko Mirhard on 10/2/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import "LocalNotificationManager.h"

#import "Constant.h"

@implementation LocalNotificationManager

+ (BOOL)scheduleNotification:(NSString*)moduleName {
  if ([moduleName isEqualToString:@"posture"]) {
    UILocalNotification *localNotif = [[UILocalNotification alloc] init];
    if (localNotif) {
      localNotif.alertBody = NSLocalizedString(@"Your posture is not optimal!", nil);
      localNotif.soundName = UILocalNotificationDefaultSoundName;
      localNotif.userInfo = @{
                              @"module": moduleName
                              };
      
      [[UIApplication sharedApplication] scheduleLocalNotification:localNotif];
    }
    else {
      return NO;
    }
  }
  else if ([moduleName isEqualToString:@"step"]) {
    for (int i = 1; i <= NOTIFICATION_CYCLE / NOTIFICATION_PERIOD; i++) {
      UILocalNotification *newNotif = [[UILocalNotification alloc] init];
      
      if (newNotif) {
        newNotif.timeZone = [NSTimeZone localTimeZone];
        newNotif.fireDate = [NSDate dateWithTimeIntervalSinceNow:NOTIFICATION_PERIOD * 60.0 * i];
        newNotif.alertBody = NSLocalizedString(@"Go and take a walk!", nil);
        newNotif.soundName = UILocalNotificationDefaultSoundName;
        newNotif.repeatInterval = NSCalendarUnitHour;
        newNotif.userInfo = @{
                              @"module": moduleName
                              };
        
        [[UIApplication sharedApplication] scheduleLocalNotification:newNotif];
      }
      else {
        return NO;
      }
    }
  }
  
  return YES;
}

+ (BOOL)hasScheduledNotification:(NSString *)moduleName {
  NSArray *eventArray = [[UIApplication sharedApplication] scheduledLocalNotifications];
  
  for (UILocalNotification *localNotif in eventArray) {
    NSDictionary *userInfo = localNotif.userInfo;
    
    if ([[userInfo objectForKey:@"module"] isEqualToString:moduleName]) {
      return YES;
    }
  }
  
  return NO;
}

+ (void)cancelScheduledNotification:(NSString *)moduleName {
  NSArray *eventArray = [[UIApplication sharedApplication] scheduledLocalNotifications];
  
  for (UILocalNotification *localNotif in eventArray) {
    NSDictionary *userInfo = localNotif.userInfo;
    
    if ([[userInfo objectForKey:@"module"] isEqualToString:moduleName]) {
      [[UIApplication sharedApplication] cancelLocalNotification:localNotif];
    }
  }
}

@end
