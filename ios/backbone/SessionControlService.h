//
//  SessionControlService.h
//  Backbone
//
//  Created by Eko Mirhard on 11/23/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTBridgeModule.h"
#import "Constants.h"

@interface SessionControlService : NSObject <RCTBridgeModule, CBPeripheralDelegate> {
  ErrorHandler _errorHandler;
  int currentSessionState;
  
  BOOL distanceNotificationStatus;
}

@property (nonatomic, strong) RCTBridge *bridge;

@property (nonatomic, readonly) CBCharacteristic *sessionControlCharacteristic;
@property (nonatomic, readonly) CBCharacteristic *distanceCharacteristic;

+ (SessionControlService *)getSessionControlService;

- (id)initService;

@end
