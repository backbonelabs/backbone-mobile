#import <Foundation/Foundation.h>
#import "Environment.h"

@implementation Environment

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (NSDictionary*)constantsToExport {
  NSDictionary *info = [[NSBundle mainBundle] infoDictionary];
  return info;
}

@end
