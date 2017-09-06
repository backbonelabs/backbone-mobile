//
//  ViewControllerService.m
//  Backbone
//
//  Created by Eko Mirhard on 8/31/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "ViewControllerService.h"

@implementation ViewControllerService

- (id)init {
  return self;
}

RCT_EXPORT_MODULE();

/**
 Reset the status bar back to the initial orientation
 */
RCT_EXPORT_METHOD(resetStatusBar) {
  // Perform it in the main thread to avoid threading issue
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] setStatusBarHidden:NO withAnimation:UIStatusBarAnimationNone];
  });
}

@end
