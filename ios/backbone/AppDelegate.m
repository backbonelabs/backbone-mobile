/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "PostureModule.h"
#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Register notification types
  UIUserNotificationType types = (UIUserNotificationType) (UIUserNotificationTypeSound | UIUserNotificationTypeAlert);
  UIUserNotificationSettings *notificationSettings = [UIUserNotificationSettings settingsForTypes:types
                                                                                       categories:nil];
  [application registerUserNotificationSettings:notificationSettings];

  // Launch React Native app
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"backbone"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

// Handler for when the app is active in the foreground
- (void)applicationDidBecomeActive:(UIApplication *)application {
  NSLog(@"applicationDidBecomeActive");
  // Prevent posture module from sending local notifications if the app is in the foreground
  [PostureModule setShouldSendNotifications:false];
}

// Handler for when the app is in the background
- (void)applicationDidEnterBackground:(UIApplication *)application {
  NSLog(@"applicationDidEnterBackground");
  // Allow posture module to send local notifications if the app switches to the background
  [PostureModule setShouldSendNotifications:true];
}

@end
