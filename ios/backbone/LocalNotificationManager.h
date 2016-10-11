//
//  LocalNotificationManager.h
//  Backbone
//
//  Created by Eko Mirhard on 10/2/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

@interface LocalNotificationManager : NSObject

+ (BOOL)scheduleNotification:(NSString*)moduleName;
+ (BOOL)hasScheduledNotification:(NSString*)moduleName;
+ (void)cancelScheduledNotification:(NSString*)moduleName;

@end
