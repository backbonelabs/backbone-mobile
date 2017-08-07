//
//  SessionControlService.h
//  Backbone
//
//  Created by Eko Mirhard on 11/23/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>
#import "Constants.h"
#import <AWSKinesis/AWSKinesis.h>

@interface SessionControlService : RCTEventEmitter <RCTBridgeModule, CBPeripheralDelegate> {
  ErrorHandler _errorHandler;
  int currentSessionState;
  int previousSessionState;
  int currentCommand;
  
  int sessionDuration;
  int slouchDistanceThreshold;
  int slouchTimeThreshold;
  
  int vibrationPattern;
  int vibrationSpeed;
  int vibrationDuration;
  
  BOOL distanceNotificationStatus;
  BOOL statisticNotificationStatus;
  BOOL slouchNotificationStatus;
  
  BOOL forceStoppedSession;
  BOOL notificationStateChanged;
  
  BOOL requestedReadSessionStatistics;
  
  NSDateFormatter *timestampFormatter;
  AWSFirehoseRecorder *firehoseRecorder;
  
  NSString *sessionId;
  double sessionStartTimestamp;
  
  BOOL shouldFlushFirehoseRecords;
}

+ (SessionControlService *)getSessionControlService;

- (id)initService;
- (BOOL)hasActiveSession;

@end
