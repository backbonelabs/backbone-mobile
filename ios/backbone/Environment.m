#import <Foundation/Foundation.h>
#import "Environment.h"

@implementation Environment

RCT_EXPORT_MODULE();

- (NSDictionary*)constantsToExport {
  NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
  return info;
}

@end
