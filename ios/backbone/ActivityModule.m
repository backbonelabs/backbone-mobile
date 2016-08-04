#import <Foundation/Foundation.h>
#import "ActivityModule.h"

@implementation ActivityModule

- (id)init {
  self.notificationName = @""; // this is the notification name the module is interested in and should be set in each subclass
  return self;
}

/**
 Adds the ActivityModule as an observer to notifications matching self.notificationName
 */
- (void)startListening {
  NSLog(@"Adding %@ as an observer", NSStringFromClass([self class]));
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(notify:)
                                               name:self.notificationName
                                             object:nil];
}

/**
 Removes the ActivityModule as an observer from notifications matching self.notificationName
 */
- (void)stopListening {
  NSLog(@"Removing %@ as an observer", NSStringFromClass([self class]));
  [[NSNotificationCenter defaultCenter] removeObserver:self];
}

/**
 All subclasses should have their own notify definition. The logic for deciding how to handle sensor
 data by each activity will be placed here.
 */
- (void)notify:(NSNotification *)notification {
  NSLog(@"%@ received notification", NSStringFromClass([self class]));
}

- (void)dealloc {
  // Remove as an observer when current instance is deallocated
  [self stopListening];
}

@end
