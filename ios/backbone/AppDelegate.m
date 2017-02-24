/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "BluetoothService.h"
#import "BootLoaderService.h"
#import "SessionControlService.h"
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

  NSDictionary *environment = [[NSBundle mainBundle] infoDictionary];

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

// Handler for when the app is about to return to the foreground
- (void)applicationWillEnterForeground:(UIApplication *)application {
  DLog(@"applicationWillEnterForeground");
  if (_idleTimer) {
    DLog(@"Cancel idle timer");
    [[UIApplication sharedApplication] endBackgroundTask:backgroundUpdateTask];
    [_idleTimer invalidate];
    _idleTimer = nil;
  }
}

- (void)checkIdleState {
  DLog(@"Check idle state");
  if (![[SessionControlService getSessionControlService] hasActiveSession]
      && ![[BootLoaderService getBootLoaderService] isUpdatingFirmware]) {
    // No active session found and not on updating firmware, disconnect from the device to save battery
    DLog(@"Disconnect on idle");
    [BluetoothServiceInstance disconnectDevice:nil];
  }
  
  // Cleanups on the timer and notify that we no longer need the background support for timers
  _idleTimer = nil;
  [[UIApplication sharedApplication] endBackgroundTask:backgroundUpdateTask];
}

- (void)applicationWillResignActive:(UIApplication *)application {
  DLog(@"applicationWillResignActive");
}

// Handler for when the app is in the background
- (void)applicationDidEnterBackground:(UIApplication *)application {
  DLog(@"applicationDidEnterBackground");
  backgroundUpdateTask = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
    [[UIApplication sharedApplication] endBackgroundTask:backgroundUpdateTask];
  }];
  
  _idleTimer = [NSTimer scheduledTimerWithTimeInterval:MAX_IDLE_DURATION target:self selector:@selector(checkIdleState) userInfo:nil repeats:NO];
}

// Handler for application termination
- (void)applicationWillTerminate:(UIApplication *)application {

}

@end
