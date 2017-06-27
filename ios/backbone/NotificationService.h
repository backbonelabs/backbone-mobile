//
//  NotificationService.h
//  Backbone
//
//  Created by Eko Mirhard on 1/4/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import <UIKit/UIKit.h>
#import <React/RCTBridgeModule.h>

@interface NotificationService : NSObject <RCTBridgeModule>

+ (void)clearNotifications;

@end
