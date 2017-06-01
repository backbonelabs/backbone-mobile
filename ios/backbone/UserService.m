//
//  UserService.m
//  Backbone
//
//  Created by Kevin Huang on 6/1/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "UserService.h"

@implementation UserService

+ (UserService*)getUserService {
  static UserService *_userService = nil;
  
  static dispatch_once_t userServiceInitialized;
  dispatch_once(&userServiceInitialized, ^{
    _userService = [[self alloc] initService];
  });
  
  return _userService;
}

- (id)initService {
  self = [super init];
  DLog(@"UserService init");
  
  userId = nil;
  return self;
}

- (id)init {
  return [UserService getUserService];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(setUserId:(NSString*)id) {
  userId = id;
}

RCT_EXPORT_METHOD(unsetUserId) {
  userId = nil;
}

- (NSString*)getUserId {
  return userId;
}

@end
