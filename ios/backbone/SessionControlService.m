//
//  SessionControlService.m
//  Backbone
//
//  Created by Eko Mirhard on 11/23/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import "SessionControlService.h"
#import "BluetoothService.h"
#import "RCTUtils.h"
#import "RCTEventDispatcher.h"
#import "Utilities.h"

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
  
  previousSessionState = SESSION_STATE_STOPPED;
  currentSessionState = SESSION_STATE_STOPPED;
  _sessionControlCharacteristic = nil;
  _distanceCharacteristic = nil;
  
  return self;
}

- (id)init {
  return [SessionControlService getSessionControlService];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(start:(NSDictionary*)sessionParam callback:(RCTResponseSenderBlock)callback) {
  if (BluetoothServiceInstance.currentDevice && self.sessionControlCharacteristic && self.distanceCharacteristic) {
    if (currentSessionState == SESSION_STATE_STOPPED) {
      sessionDuration = SESSION_DEFAULT_DURATION;
      sessionDistanceThreshold = SESSION_DEFAULT_DISTANCE_THRESHOLD_UNIT;
      sessionTimeThreshold = SESSION_DEFAULT_TIME_THRESHOLD;
      
      vibrationPattern = VIBRATION_DEFAULT_PATTERN;
      vibrationSpeed = VIBRATION_DEFAULT_SPEED;
      vibrationDuration = VIBRATION_DEFAULT_DURATION;
      
      if (sessionParam != nil && [sessionParam objectForKey:@"sessionDuration"] != nil) {
        sessionDuration = [[sessionParam objectForKey:@"sessionDuration"] intValue];
      }
      
      if (sessionParam != nil && [sessionParam objectForKey:@"sessionDistanceThreshold"] != nil) {
        sessionDistanceThreshold = [[sessionParam objectForKey:@"sessionDistanceThreshold"] intValue];
      }
      
      if (sessionParam != nil && [sessionParam objectForKey:@"sessionTimeThreshold"] != nil) {
        sessionTimeThreshold = [[sessionParam objectForKey:@"sessionTimeThreshold"] intValue];
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
      
      sessionDuration *= 60; // Convert to second from minute
      
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
    else if (currentSessionState == SESSION_STATE_PAUSED) {
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
      // Do nothing
      callback(@[[NSNull null]]);
    }
  }
  else {
    callback(@[RCTMakeError(@"Session Control is not ready", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(pause:(RCTResponseSenderBlock)callback) {
  if (BluetoothServiceInstance.currentDevice && self.sessionControlCharacteristic && self.distanceCharacteristic) {
    if (currentSessionState == SESSION_STATE_RUNNING) {
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
      // Do nothing
      callback(@[[NSNull null]]);
    }
  }
  else {
    callback(@[RCTMakeError(@"Session Control is not ready", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(stop:(RCTResponseSenderBlock)callback) {
  if (BluetoothServiceInstance.currentDevice && self.sessionControlCharacteristic && self.distanceCharacteristic) {
    if (currentSessionState == SESSION_STATE_RUNNING || currentSessionState == SESSION_STATE_PAUSED) {
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

- (void)toggleSessionOperation:(int)operation withHandler:(ErrorHandler)handler{
  _errorHandler = handler;
  
  currentCommand = operation;
  previousSessionState = currentSessionState;
  
  // 'Start' operation needs additional parameters to be sent
  if (operation == SESSION_OPERATION_START) {
    uint8_t bytes[12];
    
    bytes[0] = SESSION_COMMAND_START;
    
    bytes[1] = [Utilities getByteFromInt:sessionDuration index:3];
    bytes[2] = [Utilities getByteFromInt:sessionDuration index:2];
    bytes[3] = [Utilities getByteFromInt:sessionDuration index:1];
    bytes[4] = [Utilities getByteFromInt:sessionDuration index:0];
    
    bytes[5] = [Utilities getByteFromInt:sessionDistanceThreshold index:1];
    bytes[6] = [Utilities getByteFromInt:sessionDistanceThreshold index:0];
    
    bytes[7] = [Utilities getByteFromInt:sessionTimeThreshold index:1];
    bytes[8] = [Utilities getByteFromInt:sessionTimeThreshold index:0];
    
    bytes[9] = vibrationPattern;
    bytes[10] = vibrationSpeed;
    bytes[11] = vibrationDuration;
    
    currentSessionState = SESSION_STATE_RUNNING;
    
    distanceNotificationStatus = YES;
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    DLog(@"Toggle Session %@", data);
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:self.sessionControlCharacteristic type:CBCharacteristicWriteWithResponse];
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
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    DLog(@"Toggle Session %@", data);
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:self.sessionControlCharacteristic type:CBCharacteristicWriteWithResponse];
  }
  else {
    uint8_t bytes[1];
    
    switch (operation) {
      case SESSION_OPERATION_PAUSE:
        bytes[0] = SESSION_COMMAND_PAUSE;
        currentSessionState = SESSION_STATE_PAUSED;
        
        distanceNotificationStatus = NO;
        
        break;
      case SESSION_OPERATION_STOP:
        bytes[0] = SESSION_COMMAND_STOP;
        currentSessionState = SESSION_STATE_STOPPED;
        
        distanceNotificationStatus = NO;
        
        break;
    }
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    DLog(@"Toggle Session %@", data);
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:self.sessionControlCharacteristic type:CBCharacteristicWriteWithResponse];
  }
  
  DLog(@"Toggle Session State %d", operation);
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
  DLog(@"[SessionControl] Did Discover Characteristic with error: %@", error);
  
  if (error == nil) {
    for (CBCharacteristic *characteristic in service.characteristics) {
      if ([characteristic.UUID isEqual:SESSION_CONTROL_CHARACTERISTIC_UUID]) {
        _sessionControlCharacteristic = characteristic;
      }
      else if ([characteristic.UUID isEqual:DISTANCE_CHARACTERISTIC_UUID]) {
        _distanceCharacteristic = characteristic;
      }
    }
  }
}

-(void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"DidUpdateValue %@", characteristic);
  if ([characteristic.UUID isEqual:DISTANCE_CHARACTERISTIC_UUID]) {
    if (error == nil) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      DLog(@"DistanceRawValue %x %x %x %x", dataPointer[0], dataPointer[1], dataPointer[2], dataPointer[3]);
      
      float currentDistance = [Utilities convertToFloatFromBytes:dataPointer];
      
      [self.bridge.eventDispatcher sendAppEventWithName:@"PostureDistance" body:@{
                                                                                  @"currentDistance": [NSNumber numberWithFloat:currentDistance]
                                                                                  }];
    }
    else {
      
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error{
  DLog(@"DidUpdateNotif %@", characteristic);
  if ([characteristic.UUID isEqual:DISTANCE_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_errorHandler) {
        _errorHandler(error);
      }
      
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
      if (_errorHandler) {
        // No error, so we proceed to toggling distance notification
        [BluetoothServiceInstance.currentDevice setNotifyValue:distanceNotificationStatus forCharacteristic:self.distanceCharacteristic];
      }
      else {
        // For reverting, no need toggling the notification on the same state.
      }
    }
  }
}

@end
