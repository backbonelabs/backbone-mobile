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
  int previousSessionState;
  int currentCommand;
  
  int sessionDuration;
  int sessionDistanceThreshold;
  int sessionTimeThreshold;
  
  int vibrationPattern;
  int vibrationSpeed;
  int vibrationDuration;
  
  BOOL distanceNotificationStatus;
  BOOL statisticNotificationStatus;
  BOOL slouchNotificationStatus;
  
  BOOL forceStoppedSession;
  BOOL notificationStateChanged;
}

@property (nonatomic, strong) RCTBridge *bridge;

@property (nonatomic, readonly) CBCharacteristic *sessionControlCharacteristic;
@property (nonatomic, readonly) CBCharacteristic *distanceCharacteristic;
@property (nonatomic, readonly) CBCharacteristic *slouchCharacteristic;
@property (nonatomic, readonly) CBCharacteristic *sessionStatisticCharacteristic;

+ (SessionControlService *)getSessionControlService;

- (id)initService;

@end
