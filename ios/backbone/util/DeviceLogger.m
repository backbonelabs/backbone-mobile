//
//  DeviceLogger.m
//  Backbone
//
//  Created by Eko Mirhard on 5/25/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "DeviceLogger.h"

@implementation DeviceLogger

+ (NSString*)getCurrentLogFileName {
  NSDateFormatter *dateFormatter = [[NSDateFormatter alloc] init];
  // Use periods instead of colons for time because colons are not supported in filenames for iOS and OS X
  [dateFormatter setDateFormat:@"yyyy-MM-dd HH.mm.ss"];
  return [NSString stringWithFormat:@"acc-log-%@.csv", [dateFormatter stringFromDate:[NSDate date]]];
}

+ (void)logAccelerometerData:(NSArray *)data {
  NSArray *documentPath = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
  NSString *filePath = [documentPath objectAtIndex:0];
  filePath = [filePath stringByAppendingPathComponent:[DeviceLogger getCurrentLogFileName]];
  
  NSMutableString *content = [NSMutableString new];
  [content appendString:@"Date-Time,x,y,z\n"];
  
  for (NSDictionary *row in data) {
    [content appendFormat:@"%@,%f,%f,%f\n", row[@"dateTime"], [row[@"xAxis"] floatValue], [row[@"yAxis"] floatValue], [row[@"zAxis"] floatValue]];
  }
  
  [content writeToFile:filePath atomically:YES encoding:NSUTF8StringEncoding error:nil];
}

@end
