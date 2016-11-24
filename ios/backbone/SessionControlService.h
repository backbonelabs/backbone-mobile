//
//  SessionControlService.h
//  Backbone
//
//  Created by Eko Mirhard on 11/23/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import "RCTEventEmitter.h"
#import "RCTBridgeModule.h"
#import "Constants.h"

@interface SessionControlService : RCTEventEmitter <RCTBridgeModule, CBPeripheralDelegate> {
  ErrorHandler _errorHandler;
  int currentSessionState;
  int previousSessionState;
  int currentCommand;
  
  BOOL distanceNotificationStatus;
}

@property (nonatomic, readonly) CBCharacteristic *sessionControlCharacteristic;
@property (nonatomic, readonly) CBCharacteristic *distanceCharacteristic;

+ (SessionControlService *)getSessionControlService;

- (id)initService;

@end
