//
//  UserSettingService.m
//  Backbone
//
//  Created by Eko Mirhard on 8/22/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "UserSettingService.h"

@implementation UserSettingService

- (id)init {
  return self;
}

RCT_EXPORT_MODULE();

/**
 Get the local device's clock format
 @param callback The callback contains the required boolean stating whether the device use 24-hour format
 */
RCT_EXPORT_METHOD(getDeviceClockFormat:(RCTResponseSenderBlock)callback) {
  NSString *formatStringForHours = [NSDateFormatter dateFormatFromTemplate:@"j" options:0 locale:[NSLocale currentLocale]];
  NSRange containsA = [formatStringForHours rangeOfString:@"a"];
  
  callback(@[[NSNull null], @{@"is24Hour": [NSNumber numberWithBool:containsA.location == NSNotFound]}]);
}

@end
