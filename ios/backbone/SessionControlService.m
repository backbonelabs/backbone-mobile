//
//  SessionControlService.m
//  Backbone
//
//  Created by Eko Mirhard on 11/23/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import "SessionControlService.h"
#import "BluetoothService.h"
#import "DeviceInformationService.h"
#import <React/RCTUtils.h>
#import "Utilities.h"
#import "UserService.h"
#import <AWSCore/AWSCore.h>
#import <AWSCognito/AWSCognito.h>
#import <AWSKinesis/AWSKinesis.h>

@implementation SessionControlService

+ (SessionControlService*)getSessionControlService {
  static SessionControlService *_sessionControlService = nil;
  
  static dispatch_once_t sessionControlServiceInitialized;
  dispatch_once(&sessionControlServiceInitialized, ^{
    _sessionControlService = [[self alloc] initService];
  });
  
  return _sessionControlService;
}

- (id)initService {
  self = [super init];
  DLog(@"SessionControl init");
  [BluetoothServiceInstance addCharacteristicDelegate:self];
  
  shouldFlushFirehoseRecords = YES;
  timestampFormatter = [[NSDateFormatter alloc] init];
  [timestampFormatter setDateFormat:@"yyyy-MM-dd HH:mm:ss.SSSS"];
  
  // Set up Firehose
  AWSCognitoCredentialsProvider *credentialsProvider = [[AWSCognitoCredentialsProvider alloc] initWithRegionType:AWSRegionUSWest2 identityPoolId:AMAZON_COGNITO_IDENTITY_POOL];
  
  AWSServiceConfiguration *configuration = [[AWSServiceConfiguration alloc] initWithRegion:AWSRegionUSWest2 credentialsProvider:credentialsProvider];
  
  AWSServiceManager.defaultServiceManager.defaultServiceConfiguration = configuration;
  
  firehoseRecorder = [AWSFirehoseRecorder defaultFirehoseRecorder];
  
  // Submit any pending Firehose records
  [self submitFirehoseRecords];
  
  // Load details of previous session, if any
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  sessionId = [userDefaults stringForKey:USER_DEFAULT__SESSION_ID_KEY];
  sessionStartTimestamp = [userDefaults doubleForKey:USER_DEFAULT__START_TIMESTAMP_KEY];
  
  sessionDuration = SESSION_DEFAULT_DURATION;
  sessionDistanceThreshold = SLOUCH_DEFAULT_DISTANCE_THRESHOLD;
  sessionTimeThreshold = SLOUCH_DEFAULT_TIME_THRESHOLD;
  
  vibrationPattern = VIBRATION_DEFAULT_PATTERN;
  vibrationSpeed = VIBRATION_DEFAULT_SPEED;
  vibrationDuration = VIBRATION_DEFAULT_DURATION;
  
  previousSessionState = SESSION_STATE_STOPPED;
  currentSessionState = SESSION_STATE_STOPPED;
  
  requestedReadSessionStatistics = NO;
  
  return self;
}

- (id)init {
  return [SessionControlService getSessionControlService];
}

- (BOOL)hasActiveSession {
  return currentSessionState == SESSION_STATE_RUNNING || currentSessionState == SESSION_STATE_PAUSED;
}

+ (NSMutableData *)dataFromHexString:(NSString *)string
{
  NSMutableData *data = [NSMutableData new];
  NSCharacterSet *hexSet = [[NSCharacterSet characterSetWithCharactersInString:@"0123456789ABCDEF "] invertedSet];
  
  // Check whether the string is a valid hex string. Otherwise return empty data
  if ([string rangeOfCharacterFromSet:hexSet].location == NSNotFound) {
    
    string = [string lowercaseString];
    unsigned char whole_byte;
    char byte_chars[3] = {'\0','\0','\0'};
    int i = 0;
    int length = (int)string.length;
    
    while (i < length-1)
    {
      char c = [string characterAtIndex:i++];
      
      if (c < '0' || (c > '9' && c < 'a') || c > 'f')
        continue;
      byte_chars[0] = c;
      byte_chars[1] = [string characterAtIndex:i++];
      whole_byte = strtol(byte_chars, NULL, 16);
      [data appendBytes:&whole_byte length:1];
    }
  }
  return data;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"SessionData", @"SessionStatistics", @"SessionState", @"SlouchStatus"];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(start:(NSDictionary*)sessionParam callback:(RCTResponseSenderBlock)callback) {
  if ([BluetoothServiceInstance isDeviceReady] && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_DATA_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SLOUCH_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
    forceStoppedSession = NO;
      
    if (sessionParam != nil && [sessionParam objectForKey:@"sessionDuration"] != nil) {
      sessionDuration = [[sessionParam objectForKey:@"sessionDuration"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"slouchDistanceThreshold"] != nil) {
      sessionDistanceThreshold = [[sessionParam objectForKey:@"slouchDistanceThreshold"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"slouchTimeThreshold"] != nil) {
      sessionTimeThreshold = [[sessionParam objectForKey:@"slouchTimeThreshold"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"vibrationPattern"] != nil) {
      vibrationPattern = [[sessionParam objectForKey:@"vibrationPattern"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"vibrationSpeed"] != nil) {
      vibrationSpeed = [[sessionParam objectForKey:@"vibrationSpeed"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"vibrationDuration"] != nil) {
      vibrationDuration = [[sessionParam objectForKey:@"vibrationDuration"] intValue];
    }
    
    DLog(@"SessionParam %@", sessionParam);
    DLog(@"SessionExtra %d %d %d %d %d %d", sessionDuration, sessionDistanceThreshold, sessionTimeThreshold, vibrationPattern, vibrationSpeed, vibrationDuration);
    
    [self toggleSessionOperation:SESSION_OPERATION_START withHandler:^(NSError * _Nullable error) {
      if (error) {
        callback(@[RCTMakeError(@"Error toggling session", nil, nil)]);
      }
      else {
        callback(@[[NSNull null]]);
      }
    }];
  }
  else {
    callback(@[RCTMakeError(@"Session Control is not ready", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(pause:(RCTResponseSenderBlock)callback) {
  if ([BluetoothServiceInstance isDeviceReady] && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_DATA_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SLOUCH_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
    [self toggleSessionOperation:SESSION_OPERATION_PAUSE withHandler:^(NSError * _Nullable error) {
      if (error) {
        callback(@[RCTMakeError(@"Error toggling session", nil, nil)]);
      }
      else {
        callback(@[[NSNull null]]);
      }
    }];
  }
  else {
    callback(@[RCTMakeError(@"Session Control is not ready", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(resume:(NSDictionary*)sessionParam callback:(RCTResponseSenderBlock)callback) {
  if ([BluetoothServiceInstance isDeviceReady] && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_DATA_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SLOUCH_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
    if (sessionParam != nil && [sessionParam objectForKey:@"slouchDistanceThreshold"] != nil) {
      sessionDistanceThreshold = [[sessionParam objectForKey:@"slouchDistanceThreshold"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"slouchTimeThreshold"] != nil) {
      sessionTimeThreshold = [[sessionParam objectForKey:@"slouchTimeThreshold"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"vibrationPattern"] != nil) {
      vibrationPattern = [[sessionParam objectForKey:@"vibrationPattern"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"vibrationSpeed"] != nil) {
      vibrationSpeed = [[sessionParam objectForKey:@"vibrationSpeed"] intValue];
    }
    
    if (sessionParam != nil && [sessionParam objectForKey:@"vibrationDuration"] != nil) {
      vibrationDuration = [[sessionParam objectForKey:@"vibrationDuration"] intValue];
    }
    
    [self toggleSessionOperation:SESSION_OPERATION_RESUME withHandler:^(NSError * _Nullable error) {
      if (error) {
        callback(@[RCTMakeError(@"Error toggling session", nil, nil)]);
      }
      else {
        callback(@[[NSNull null]]);
      }
    }];
  }
  else {
    callback(@[RCTMakeError(@"Session Control is not ready", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(stop:(RCTResponseSenderBlock)callback) {
  if ([BluetoothServiceInstance isDeviceReady] && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_DATA_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SLOUCH_CHARACTERISTIC_UUID]
      && [BluetoothServiceInstance getCharacteristicByUUID:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
    if (currentSessionState == SESSION_STATE_RUNNING || currentSessionState == SESSION_STATE_PAUSED) {
      forceStoppedSession = YES;
      
      [self toggleSessionOperation:SESSION_OPERATION_STOP withHandler:^(NSError * _Nullable error) {
        if (error) {
          callback(@[RCTMakeError(@"Error toggling session", nil, nil)]);
        }
        else {
          callback(@[[NSNull null]]);
        }
      }];
    }
    else {
      // Do nothing
      callback(@[[NSNull null]]);
    }
  }
  else {
    callback(@[RCTMakeError(@"Session Control is not ready", nil, nil)]);
  }
}

/**
 Reads from the session statistic characteristic. This is an asynchronous operation.
 The results will be emitted through a SessionState event to JS.
 */
RCT_EXPORT_METHOD(getSessionState) {
  DLog(@"GetSessionState");
  CBCharacteristic *sessionStatistics = [BluetoothServiceInstance getCharacteristicByUUID:SESSION_STATISTIC_CHARACTERISTIC_UUID];

  if ([BluetoothServiceInstance isDeviceReady] && sessionStatistics) {
    requestedReadSessionStatistics = YES;
    [BluetoothServiceInstance.currentDevice readValueForCharacteristic:sessionStatistics];
  }
  else {
    [self sendEventWithName:@"SessionState" body:@{
                                                   @"hasActiveSession": [NSNumber numberWithBool:false],
                                                   @"totalDuration" : [NSNumber numberWithInteger:0],
                                                   @"slouchTime" : [NSNumber numberWithInteger:0]
                                                   }];
  }
}

- (void)toggleSessionOperation:(int)operation withHandler:(ErrorHandler)handler{
  DLog(@"Toggle Session State %d", operation);
  _errorHandler = handler;
  
  currentCommand = operation;
  previousSessionState = currentSessionState;
  
  // 'Start' and 'Resume' operations require additional parameters to be sent
  if (operation == SESSION_OPERATION_START) {
    // We generate the session id locally on the phone because we can't rely on the user
    // being connected to the internet when starting a session. This session id will be
    // sent to our data warehouse. The session id format is the user id and current
    // timestamp in seconds separated by a hyphen.
    NSString *userId = [[UserService getUserService] getUserId];
    if (userId == nil) {
      userId = @"";
    }
    sessionStartTimestamp = [[NSDate date] timeIntervalSince1970];
    DLog(@"sessionStartTimestamp %f", sessionStartTimestamp);
    sessionId = [NSString stringWithFormat:@"%@-%ld", userId, (long)sessionStartTimestamp];
    DLog(@"sessionId %@", sessionId);
    
    // Store session details in case app is terminated in the middle of a posture session
    NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
    [userDefaults setObject:sessionId forKey:USER_DEFAULT__SESSION_ID_KEY];
    [userDefaults setDouble:sessionStartTimestamp forKey:USER_DEFAULT__START_TIMESTAMP_KEY];
    
    int sessionDurationInSecond = sessionDuration * 60; // Convert to second from minute
    
    uint8_t bytes[12];
    
    bytes[0] = SESSION_COMMAND_START;
    
    bytes[1] = [Utilities getByteFromInt:sessionDurationInSecond index:3];
    bytes[2] = [Utilities getByteFromInt:sessionDurationInSecond index:2];
    bytes[3] = [Utilities getByteFromInt:sessionDurationInSecond index:1];
    bytes[4] = [Utilities getByteFromInt:sessionDurationInSecond index:0];
    
    bytes[5] = [Utilities getByteFromInt:sessionDistanceThreshold index:1];
    bytes[6] = [Utilities getByteFromInt:sessionDistanceThreshold index:0];
    
    bytes[7] = [Utilities getByteFromInt:sessionTimeThreshold index:1];
    bytes[8] = [Utilities getByteFromInt:sessionTimeThreshold index:0];
    
    bytes[9] = vibrationPattern;
    bytes[10] = vibrationSpeed;
    bytes[11] = vibrationDuration;
    
    currentSessionState = SESSION_STATE_RUNNING;
    
    distanceNotificationStatus = YES;
    slouchNotificationStatus = YES;
    statisticNotificationStatus = YES;
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    DLog(@"Toggle Session %@", data);
    
    // Toggle accelerometer notification separately because the app doesn't rely on the
    // accelerometer notifications to monitor a posture session
    [BluetoothServiceInstance.currentDevice setNotifyValue:YES forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]];
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID] type:CBCharacteristicWriteWithResponse];
  }
  else if (operation == SESSION_OPERATION_RESUME) {
    uint8_t bytes[8];
    
    bytes[0] = SESSION_COMMAND_RESUME;
    
    bytes[1] = [Utilities getByteFromInt:sessionDistanceThreshold index:1];
    bytes[2] = [Utilities getByteFromInt:sessionDistanceThreshold index:0];
    
    bytes[3] = [Utilities getByteFromInt:sessionTimeThreshold index:1];
    bytes[4] = [Utilities getByteFromInt:sessionTimeThreshold index:0];
    
    bytes[5] = vibrationPattern;
    bytes[6] = vibrationSpeed;
    bytes[7] = vibrationDuration;
    
    currentSessionState = SESSION_STATE_RUNNING;
    
    distanceNotificationStatus = YES;
    slouchNotificationStatus = YES;
    statisticNotificationStatus = YES;
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    DLog(@"Toggle Session %@", data);
    
    // Toggle accelerometer notification separately because the app doesn't rely on the
    // accelerometer notifications to monitor a posture session
    [BluetoothServiceInstance.currentDevice setNotifyValue:YES forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]];
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID] type:CBCharacteristicWriteWithResponse];
  }
  else {
    uint8_t bytes[1];
    
    switch (operation) {
      case SESSION_OPERATION_PAUSE:
        bytes[0] = SESSION_COMMAND_PAUSE;
        currentSessionState = SESSION_STATE_PAUSED;
        
        distanceNotificationStatus = NO;
        slouchNotificationStatus = NO;
        statisticNotificationStatus = YES;
        
        break;
      case SESSION_OPERATION_STOP:
        bytes[0] = SESSION_COMMAND_STOP;
        currentSessionState = SESSION_STATE_STOPPED;
        
        distanceNotificationStatus = NO;
        slouchNotificationStatus = NO;
        
        // Save session record for Firehose
        [self saveSessionToFirehose];
        
        // Submit all pending Firehose records
        [self submitFirehoseRecords];
        
        break;
    }
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    DLog(@"Toggle Session %@", data);
    
    // Toggle accelerometer notification separately because the app doesn't rely on the
    // accelerometer notifications to monitor a posture session
    [BluetoothServiceInstance.currentDevice setNotifyValue:NO forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]];
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID] type:CBCharacteristicWriteWithResponse];
  }
}

- (void)revertOperation {
  // Revert as needed
  switch (previousSessionState) {
    case SESSION_STATE_STOPPED:
      // Stop the current session since there was an error creating the new session
      [self toggleSessionOperation:SESSION_OPERATION_STOP withHandler:nil];
      break;
    case SESSION_STATE_PAUSED:
      // Revert back to pause the current session since the resume operation went wrong
      [self toggleSessionOperation:SESSION_OPERATION_PAUSE withHandler:nil];
      break;
    case SESSION_STATE_RUNNING:
      if (currentCommand == SESSION_OPERATION_STOP) {
        // Session is stopped anyway, so there's no point reverting it back, as that would create a completely new session.
        // React should decide how to handle this case, ie. we can let the user to retry turning off the notification.
      }
      else if (currentCommand == SESSION_OPERATION_PAUSE) {
        // Pausing was not successfully completed, so we resume the current session
        [self toggleSessionOperation:SESSION_OPERATION_RESUME withHandler:nil];
      }
      break;
    default:
      break;
  }
}

/**
 * Saves a posture session record to Firehose and clears the session details from UserPreferences
 */
- (void)saveSessionToFirehose {
  DLog(@"saveSessionToFirehose");
  NSString *userId = [[UserService getUserService] getUserId];
  if (userId == nil) {
    userId = @"";
  }
  
  NSString *startDateTime = [timestampFormatter stringFromDate:[NSDate dateWithTimeIntervalSince1970:sessionStartTimestamp]];
  NSString *endDateTime = [timestampFormatter stringFromDate:[NSDate date]];
  NSData *record = [[NSString stringWithFormat:@"%@,%@,%@,%@\n", sessionId, userId, startDateTime, endDateTime] dataUsingEncoding:NSUTF8StringEncoding];
  [firehoseRecorder saveRecord:record streamName:FIREHOSE_POSTURE_SESSION];
  
  // Remove session data
  NSUserDefaults *userDefaults = [NSUserDefaults standardUserDefaults];
  [userDefaults removeObjectForKey:USER_DEFAULT__SESSION_ID_KEY];
  [userDefaults removeObjectForKey:USER_DEFAULT__START_TIMESTAMP_KEY];
}

/**
 * Submits all pending Firehose records
 */
- (void)submitFirehoseRecords {
  DLog(@"Submitting pending Firehose records");
  [[firehoseRecorder submitAllRecords] continueWithBlock:^id _Nullable(AWSTask * _Nonnull task) {
    if (task.error) {
      DLog(@"Error: %@", task.error);
    } else {
      DLog(@"Submitted Firehose records");
    }
    return nil;
  }];
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
  DLog(@"[SessionControl] Did Discover Characteristic with error: %@", error);
  
//  if (error == nil) {
//    for (CBCharacteristic *characteristic in service.characteristics) {
//      if ([characteristic.UUID isEqual:SESSION_CONTROL_CHARACTERISTIC_UUID]) {
//        _sessionControlCharacteristic = characteristic;
//      }
//      else if ([characteristic.UUID isEqual:SESSION_DATA_CHARACTERISTIC_UUID]) {
//        _distanceCharacteristic = characteristic;
//      }
//      else if ([characteristic.UUID isEqual:SLOUCH_CHARACTERISTIC_UUID]) {
//        _slouchCharacteristic = characteristic;
//      }
//      else if ([characteristic.UUID isEqual:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
//        _sessionStatisticCharacteristic = characteristic;
//      }
//    }
//  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"DidUpdateValue %@", characteristic);
  if (error == nil) {
    if ([characteristic.UUID isEqual:SESSION_DATA_CHARACTERISTIC_UUID]) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      DLog(@"DistanceRawValue %x %x %x %x", dataPointer[0], dataPointer[1], dataPointer[2], dataPointer[3]);
      
      float currentDistance = [Utilities convertToFloatFromBytes:dataPointer offset:0];
      int timeElapsed = [Utilities convertToIntFromBytes:dataPointer offset:4];
      
      NSDictionary *sessionData = @{
                                  @"currentDistance": [NSNumber numberWithFloat:currentDistance],
                                  @"timeElapsed": [NSNumber numberWithInt:timeElapsed]
                                  };
      DLog(@"SessionData %@", sessionData);
      [self sendEventWithName:@"SessionData" body:sessionData];
    }
    else if ([characteristic.UUID isEqual:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      
      int flags = 0;
      int totalDuration = 0;
      int slouchTime = 0;
      bool hasActiveSession = false;
      
      if (characteristic.value == nil || [characteristic.value length] < 12) {
        // Invalid response data, use default values
      }
      else {
        flags = [Utilities convertToIntFromBytes:dataPointer offset:0];
        totalDuration = [Utilities convertToIntFromBytes:dataPointer offset:4];
        slouchTime = [Utilities convertToIntFromBytes:dataPointer offset:8];
        
        // Check the Least-Significant Bit of the flags to retrieve the current session state
        hasActiveSession = (flags % 2 == 1);
      }
      
      if (requestedReadSessionStatistics) {
        // Session statistics were retrieved from a read request, emit SessionState event
        requestedReadSessionStatistics = NO;
        [self sendEventWithName:@"SessionState" body:@{
                                                       @"hasActiveSession": [NSNumber numberWithBool:hasActiveSession],
                                                       @"totalDuration" : [NSNumber numberWithInteger:totalDuration],
                                                       @"slouchTime" : [NSNumber numberWithInteger:slouchTime]
                                                       }];
      } else {
        // Session statistics were retrieved from a notification, emit SessionStatistics event
        [self sendEventWithName:@"SessionStatistics" body:@{
                                                            @"hasActiveSession": [NSNumber numberWithBool:hasActiveSession],
                                                            @"totalDuration" : [NSNumber numberWithInteger:totalDuration],
                                                            @"slouchTime" : [NSNumber numberWithInteger:slouchTime]
                                                            }];
        
        // This notification indicates the end of a session
        // So we have to disable all notifications after we receive it
        // Only perform the following statements when the session naturally finished
        if (!forceStoppedSession) {
          DLog(@"Session automatically stopped");
          _errorHandler = nil;
          
          currentSessionState = SESSION_STATE_STOPPED;
          
          distanceNotificationStatus = NO;
          slouchNotificationStatus = NO;
          statisticNotificationStatus = NO;
          
          [BluetoothServiceInstance.currentDevice setNotifyValue:NO forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]];
          
          [BluetoothServiceInstance.currentDevice setNotifyValue:distanceNotificationStatus forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_DATA_CHARACTERISTIC_UUID]];
          
          // Save session record for Firehose
          [self saveSessionToFirehose];
          
          // Submit pending Firehose records
          [self submitFirehoseRecords];
        }
      }
    }
    else if ([characteristic.UUID isEqual:SLOUCH_CHARACTERISTIC_UUID]) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      
      bool isSlouching = (dataPointer[0] % 2 == 1);
      
      [self sendEventWithName:@"SlouchStatus" body:@{
                                                     @"isSlouching": [NSNumber numberWithBool:isSlouching]
                                                     }];
    }
    else if ([characteristic.UUID isEqual:ACCELEROMETER_CHARACTERISTIC_UUID]) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      
      if (currentSessionState == SESSION_STATE_RUNNING) {
        // Only save data to Firehose if session is running in case other modules are
        // enabling accelerometer notifications outside of a posture session
        float x = [Utilities convertToFloatFromBytes:dataPointer offset:0];
        float y = [Utilities convertToFloatFromBytes:dataPointer offset:4];
        float z = [Utilities convertToFloatFromBytes:dataPointer offset:8];
        
        DLog(@"Accelerometer data %f %f %f", x, y, z);
        
        // Queue accelerometer record for Firehose
        NSString *now = [timestampFormatter stringFromDate:[NSDate date]];
        NSString *recordString = [NSString stringWithFormat:@"%@,%@,%f,%f,%f\n", sessionId, now, x, y, z];
        NSData *record = [recordString dataUsingEncoding:NSUTF8StringEncoding];
        [firehoseRecorder saveRecord:record streamName:FIREHOSE_POSTURE_SESSION_STREAM];
        
        // Periodically submit records to Firehose to make
        // sure the storage limit isn't reached. This will be
        // done when the storage usage is at 50%, 75%, and 90%.
        long storageLimit = [firehoseRecorder diskByteLimit];
        long storageUsed = [firehoseRecorder diskBytesUsed];
        float storageUsage = (float)storageUsed / storageLimit;
        if (storageUsage >= 0.9 && shouldFlushFirehoseRecords) {
          shouldFlushFirehoseRecords = NO;
          [self submitFirehoseRecords];
        } else if (storageUsage >= 0.76) {
          shouldFlushFirehoseRecords = YES;
        } else if (storageUsage >= 0.75) {
          shouldFlushFirehoseRecords = NO;
          [self submitFirehoseRecords];
        } else if (storageUsage >= 0.51) {
          shouldFlushFirehoseRecords = YES;
        } else if (storageUsage >= 0.5 && shouldFlushFirehoseRecords) {
          shouldFlushFirehoseRecords = NO;
          [self submitFirehoseRecords];
        }
      }
    }
  }
}

// Notifications are enabled one by one, with the following order: Distance, Slouch, Statistic
// Failure on any of them will result in operation reversal
- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error{
  DLog(@"DidUpdateNotif %@", characteristic);
  if ([characteristic.UUID isEqual:SESSION_DATA_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_errorHandler) {
        _errorHandler(error);
        [self revertOperation];
      }
    }
    else {
      [BluetoothServiceInstance.currentDevice setNotifyValue:slouchNotificationStatus forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SLOUCH_CHARACTERISTIC_UUID]];
    }
  }
  else if ([characteristic.UUID isEqual:SLOUCH_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_errorHandler) {
        _errorHandler(error);
        
        notificationStateChanged = YES;
        [self revertOperation];
      }
    }
    else {
      [BluetoothServiceInstance.currentDevice setNotifyValue:statisticNotificationStatus forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_STATISTIC_CHARACTERISTIC_UUID]];
    }
  }
  else if ([characteristic.UUID isEqual:SESSION_STATISTIC_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_errorHandler) {
        _errorHandler(error);
        
        notificationStateChanged = YES;
        [self revertOperation];
      }
    }
    else {
      // Session control is fully updated, return callback with no error
      if (_errorHandler) {
        _errorHandler(nil);
      }
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"Has write %@ %@", characteristic, error);
  if ([characteristic.UUID isEqual:SESSION_CONTROL_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error writing to characteristic: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_errorHandler) {
        _errorHandler(error);
      }
    }
    else {
      if (_errorHandler || notificationStateChanged) {
        // No error, so we proceed to toggling distance notification when needed
        notificationStateChanged = NO;
        
        [BluetoothServiceInstance.currentDevice setNotifyValue:distanceNotificationStatus forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_DATA_CHARACTERISTIC_UUID]];
      }
      else {
        // For reverting, no need toggling the notification on the same state.
      }
    }
  }
}

@end
