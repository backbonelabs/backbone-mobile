#import "KeepAwake.h"
#import "UIKit/UIKit.h"

@implementation KeepAwake

- (id)init {
  return self;
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(activate)
{
  [[UIApplication sharedApplication] setIdleTimerDisabled:YES];
}

RCT_EXPORT_METHOD(deactivate)
{
  [[UIApplication sharedApplication] setIdleTimerDisabled:NO];
}

@end
