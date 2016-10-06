//
//  StepModule.h
//  Backbone
//
//  Created by Eko Mirhard on 10/1/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#ifndef StepModule_h
#define StepModule_h

#import "ActivityModule.h"

@interface StepModule : ActivityModule
{
  NSMutableArray *_previousSteps;
}

+ (void)setShouldSendNotifications:(BOOL)flag;
- (void)checkIdleTime;

@end

#endif /* StepModule_h */
