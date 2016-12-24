//
//  UserSettingService.m
//  Backbone
//
//  Created by Eko Mirhard on 10/20/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import "UserSettingService.h"
#import <Foundation/Foundation.h>
#import "RCTUtils.h"
#import "Constants.h"

@implementation UserSettingService

@synthesize bridge = _bridge;

- (id)init {
  return self;
}

RCT_EXPORT_MODULE();

// React Native components will call this when they need to update the local user setting
// A callback should be included as the second argument which would be called with an error object
// if an error occurred while attempting to apply the setting. If no error occurred, null will be passed.
RCT_EXPORT_METHOD(updateUserSetting:(NSDictionary*)settingDict callback:(RCTResponseSenderBlock)callback) {
  DLog(@"UpdateUserSetting");
  
  // Get a handle to the app preference via UserDefaults
  NSUserDefaults *preference = [NSUserDefaults standardUserDefaults];
  
  @try {
    // For now, as a placeholder, I set 3 fields, each with different data type for testing
    if ([settingDict objectForKey:@"name"] != nil) {
      [preference setObject:settingDict[@"name"] forKey:@"name"];
    }
    
    if ([settingDict objectForKey:@"sensitivity"] != nil) {
      [preference setInteger:[settingDict[@"sensitivity"] intValue] forKey:@"sensitivity"];
    }
    
    if ([settingDict objectForKey:@"shouldNotify"] != nil) {
      [preference setBool:[settingDict[@"shouldNotify"] boolValue] forKey:@"shouldNotify"];
    }
    
    // Testing applied setting
    // The second parameter is used to define default value on empty keys
    DLog(@"Setting[Name]: %@", [preference objectForKey:@"name"]);
    DLog(@"Setting[Sensitivity]: %d", [[preference objectForKey:@"sensitivity"] intValue]);
    DLog(@"Setting[ShouldNotify]: %@", ([[preference objectForKey:@"shouldNotify"] boolValue] ? @"ON" : @"OFF"));
    
    callback(@[[NSNull null]]);
  } @catch (NSException *exception) {
    callback(@[RCTMakeError(exception.reason, nil, exception.userInfo)]);
  }
}

@end
