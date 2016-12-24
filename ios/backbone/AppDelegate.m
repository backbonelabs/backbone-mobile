/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "RCTBundleURLProvider.h"
#import "RCTRootView.h"
#import "Mixpanel/Mixpanel.h"
#import "RCTPushNotificationManager.h"

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Cancel all prior notifications
  [application cancelAllLocalNotifications];
  
  // Register notification types
  UIUserNotificationType types = (UIUserNotificationType) (UIUserNotificationTypeSound | UIUserNotificationTypeAlert);
  UIUserNotificationSettings *notificationSettings = [UIUserNotificationSettings settingsForTypes:types
                                                                                       categories:nil];
  [application registerUserNotificationSettings:notificationSettings];

  NSDictionary *environment = [[NSProcessInfo processInfo] environment];
  
  // Generate singleton instance of the Mixpanel API
  [Mixpanel sharedInstanceWithToken:[environment valueForKey:@"MIXPANEL_TOKEN"]];
  
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

// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  DLog(@"didRegisterUserNotificationSettings");
  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}

// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  DLog(@"didRegisterForRemoteNotificationsWithDeviceToken");
  DLog(@"deviceToken: %@", deviceToken);
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}

// Handler for when the app is active in the foreground
- (void)applicationDidBecomeActive:(UIApplication *)application {
  DLog(@"applicationDidBecomeActive");
}

// Handler for when the app is in the background
- (void)applicationDidEnterBackground:(UIApplication *)application {
  DLog(@"applicationDidEnterBackground");
}

// Handler for application termination
- (void)applicationWillTerminate:(UIApplication *)application {
  
}

@end
