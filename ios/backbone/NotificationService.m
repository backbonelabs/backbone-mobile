//
//  NotificationService.m
//  Backbone
//
//  Created by Eko Mirhard on 1/4/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "NotificationService.h"
#import "Constants.h"

@implementation NotificationService

+ (void)clearNotifications {
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber: 1];
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber: 0];
}

- (id)init {
  return self;
}

RCT_EXPORT_MODULE();

/**
 Send a local push notification
 @param type The type of the notification
 @param title The title to be displayed on the push notification
 @param message The message to be displayed on the push notification
 */
RCT_EXPORT_METHOD(sendNotification:(int)type title:(NSString*)title message:(NSString*)message) {
  UILocalNotification *localNotification = [[UILocalNotification alloc] init];
  
  // The notification type is actually not yet being used on iOS
  // and it's defined here to keep our native calls similar to the Android version
  if (localNotification) {
    localNotification.alertTitle = NSLocalizedString(title, nil);
    localNotification.alertBody = NSLocalizedString(message, nil);
    localNotification.soundName = UILocalNotificationDefaultSoundName;
    
    [[UIApplication sharedApplication] scheduleLocalNotification:localNotification];
  }
}

/**
 Clear the local push notification from the notification center
 */
RCT_EXPORT_METHOD(clearNotification:(int)type) {
  // Clears out all notifications since there's still no way to filter them on iOS
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber: 1];
  [[UIApplication sharedApplication] setApplicationIconBadgeNumber: 0];
}

/**
 Schedule a local push notification
 @param notificationParam Notification parameters
 */
RCT_EXPORT_METHOD(scheduleNotification:(NSDictionary*)notificationParam) {
  UILocalNotification *localNotification = [[UILocalNotification alloc] init];
  
  if (localNotification && notificationParam != nil) {
    int type = -1;
    NSString *title = nil;
    NSString *text = nil;
    
    if ([notificationParam objectForKey:@"notificationType"] != nil) {
      type = [[notificationParam objectForKey:@"notificationType"] intValue];
    }
    
    switch (type) {
      case NOTIFICATION_TYPE_INFREQUENT_REMINDER:
        title = @"Are you still alive?";
        text = @"We miss you already!";
        break;
      case NOTIFICATION_TYPE_DAILY_REMINDER:
        title = @"It's time!";
        text = @"It's that time of the day again! Brace yourself!";
        break;
      case NOTIFICATION_TYPE_SINGLE_REMINDER:
        title = @"It's time!";
        text = @"It's time to move!";
        break;
    }
    
    // Return on invalid type
    if (title == nil) return;
    
    int initialDelay = 0;
    NSCalendarUnit repeatInterval = NSCalendarUnitDay;
    int year = -1, month = 1, day = 1;
    int hour = -1, minute = 0, second = 0;
    
    NSCalendar *calendar = [NSCalendar calendarWithIdentifier:NSCalendarIdentifierGregorian];
    NSDateComponents *dateComps = [calendar components:NSCalendarUnitYear|NSCalendarUnitMonth|NSCalendarUnitDay|NSCalendarUnitHour|NSCalendarUnitMinute|NSCalendarUnitSecond fromDate:[NSDate date]];
    
    if ([notificationParam objectForKey:@"scheduledYear"] != nil) {
      year = [[notificationParam objectForKey:@"scheduledYear"] intValue];
    }
    
    if ([notificationParam objectForKey:@"scheduledMonth"] != nil) {
      month = [[notificationParam objectForKey:@"scheduledMonth"] intValue];
    }
    
    if ([notificationParam objectForKey:@"scheduledDay"] != nil) {
      day = [[notificationParam objectForKey:@"scheduledDay"] intValue];
    }
    
    if ([notificationParam objectForKey:@"scheduledHour"] != nil) {
      hour = [[notificationParam objectForKey:@"scheduledHour"] intValue];
    }
    
    if ([notificationParam objectForKey:@"scheduledMinute"] != nil) {
      minute = [[notificationParam objectForKey:@"scheduledMinute"] intValue];
    }
    
    if ([notificationParam objectForKey:@"scheduledSecond"] != nil) {
      second = [[notificationParam objectForKey:@"scheduledSecond"] intValue];
    }
    
    // Only use user-defined schedule time if requested.
    // Otherwise use the current time as the base
    if (year != -1) {
      [dateComps setYear:year];
      [dateComps setMonth:month];
      [dateComps setDay:day];
    }
    
    if (hour != -1) {
      [dateComps setHour:hour];
      [dateComps setMinute:minute];
      [dateComps setSecond:second];
    }
    
    NSDate *fireDate = [calendar dateFromComponents:dateComps];
    
    // Return on invalid date
    if (fireDate == nil) return;
    
    double fireTimestamp = [fireDate timeIntervalSince1970];
    
    NSDate *currentDate = [NSDate date];
    
    switch (type) {
      case NOTIFICATION_TYPE_INFREQUENT_REMINDER:
        // Always use the current time
        fireDate = [NSDate date];
        initialDelay = NOTIFICATION_INITIAL_DELAY_INFREQUENT_REMINDER;
        repeatInterval = NSCalendarUnitDay;
        break;
      case NOTIFICATION_TYPE_DAILY_REMINDER:
        // Fire in the same day if the scheduled time is in the future
        if (fireTimestamp > [currentDate timeIntervalSince1970]) {
          initialDelay = 0;
        }
        else {
          initialDelay = NOTIFICATION_INITIAL_DELAY_DAILY_REMINDER;
        }
        repeatInterval = NSCalendarUnitDay;
        break;
      case NOTIFICATION_TYPE_SINGLE_REMINDER:
        initialDelay = 0;
        repeatInterval = 0;
        break;
    }
    
    localNotification.alertTitle = NSLocalizedString(title, nil);
    localNotification.alertBody = NSLocalizedString(text, nil);
    localNotification.timeZone = [NSTimeZone defaultTimeZone];
    localNotification.fireDate = [fireDate dateByAddingTimeInterval:initialDelay];
    localNotification.userInfo = @{@"type" : @(type)};
    localNotification.soundName = UILocalNotificationDefaultSoundName;
    
    // Repeat if needed
    if (repeatInterval > 0) {
      localNotification.repeatInterval = repeatInterval;
    }
    
    DLog(@"Schedule notification %d", type);
    
    // Unschedule the previous notification of the same type
    [self unscheduleNotification:type];
    
    [[UIApplication sharedApplication] scheduleLocalNotification:localNotification];
  }
}

/**
 Check if the specified notification type has been scheduled
 @param callback The callback contains the
 */
RCT_EXPORT_METHOD(hasScheduledNotification:(int)type callback:(RCTResponseSenderBlock)callback) {
  NSArray *eventArray = [[UIApplication sharedApplication] scheduledLocalNotifications];
  BOOL found = false;
  
  for (UILocalNotification *localNotif in eventArray) {
    NSDictionary *userInfo = localNotif.userInfo;
    
    if ([[userInfo objectForKey:@"type"] intValue] == type) {
      found = YES;
      break;
    }
  }
  
  callback(@[[NSNull null], @{@"onSchedule": [NSNumber numberWithBool:found]}]);
}

/**
 Unschedule a scheduled notification based on the specified type
 @param type The notification type
 */
RCT_EXPORT_METHOD(unscheduleNotification:(int)type) {
  NSArray *eventArray = [[UIApplication sharedApplication] scheduledLocalNotifications];
  
  for (UILocalNotification *localNotif in eventArray) {
    NSDictionary *userInfo = localNotif.userInfo;
    
    if ([[userInfo objectForKey:@"type"] intValue] == type) {
      [[UIApplication sharedApplication] cancelLocalNotification:localNotif];
    }
  }
}

@end
