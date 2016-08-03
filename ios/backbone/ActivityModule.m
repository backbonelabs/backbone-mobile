#import <Foundation/Foundation.h>
#import "ActivityModule.h"

@implementation ActivityModule

- (id)init {
  self.notificationName = @""; // this is the notification name the module is interested in and should be set in each subclass
  return self;
}

- (void)startListening {
  NSLog(@"Adding %@ as an observer", NSStringFromClass([self class]));
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(notify:)
                                               name:self.notificationName
                                             object:nil];
}

- (void)stopListening {
  NSLog(@"Removing %@ as an observer", NSStringFromClass([self class]));
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

- (void)notify:(NSNotification *)notification {
  NSLog(@"%@ received notification", NSStringFromClass([self class]));
}

- (void)dealloc {
  // Remove as an observer when current instance is deallocated
  [self stopListening];
}

@end
