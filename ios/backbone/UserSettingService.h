//
//  UserSettingService.h
//  Backbone
//
//  Created by Eko Mirhard on 10/20/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#ifndef UserSettingService_h
#define UserSettingService_h

#import "RCTBridgeModule.h"

@interface UserSettingService : NSObject <RCTBridgeModule>

@property (nonatomic, strong) RCTBridge *bridge;

@end

#endif /* UserSettingService_h */
