//
//  UserService.h
//  Backbone
//
//  Created by Kevin Huang on 6/1/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#ifndef UserService_h
#define UserService_h

#import <React/RCTBridgeModule.h>

@interface UserService : NSObject <RCTBridgeModule> {
  NSString *userId;
}

+ (UserService *)getUserService;

- (id)initService;
- (NSString*)getUserId;

@end

#endif /* UserService_h */
