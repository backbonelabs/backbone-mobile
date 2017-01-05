//
//  NotificationService.m
//  Backbone
//
//  Created by Eko Mirhard on 1/4/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "NotificationService.h"

@implementation NotificationService

- (id)init {
  return self;
}

RCT_EXPORT_MODULE();

/**
 Send a local push notification
 @param title The title to be displayed on the push notification
 @param message The message to be displayed on the push notification
 */
RCT_EXPORT_METHOD(sendLocalNotification:(NSString*)title message:(NSString*)message) {
  UILocalNotification *localNotification = [[UILocalNotification alloc] init];
  
  if (localNotification) {
    localNotification.alertTitle = NSLocalizedString(title, nil);
    localNotification.alertBody = NSLocalizedString(message, nil);
    localNotification.soundName = UILocalNotificationDefaultSoundName;
    
    [[UIApplication sharedApplication] scheduleLocalNotification:localNotification];
  }
}

@end
