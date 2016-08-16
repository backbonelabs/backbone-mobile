#import <Foundation/Foundation.h>
#import "Environment.h"

@implementation Environment

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE();

- (NSDictionary*)constantsToExport {
  NSDictionary *environment = [[NSProcessInfo processInfo] environment];
  return environment;
}

@end