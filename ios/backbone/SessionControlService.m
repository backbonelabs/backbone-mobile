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
  
  currentSessionState = SESSION_STATE_STOPPED;
  _sessionControlCharacteristic = nil;
  _distanceCharacteristic = nil;
  
  return self;
}

- (id)init {
  return [SessionControlService getSessionControlService];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(start:(RCTResponseSenderBlock)callback) {
  if (BluetoothServiceInstance.currentDevice && self.sessionControlCharacteristic && self.distanceCharacteristic) {
    if (currentSessionState == SESSION_STATE_STOPPED) {
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
  uint8_t bytes[1];
  _errorHandler = handler;
  
  switch (operation) {
    case SESSION_OPERATION_START:
      bytes[0] = SESSION_COMMAND_START;
      currentSessionState = SESSION_STATE_RUNNING;
      
      distanceNotificationStatus = YES;
      
      break;
    case SESSION_OPERATION_RESUME:
      bytes[0] = SESSION_COMMAND_RESUME;
      currentSessionState = SESSION_STATE_RUNNING;
      
      distanceNotificationStatus = YES;
      
      break;
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
  
  // For now we need to store this as it's needed later upon successfully toggling the notification
  //  NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
  _currentCommandData = [[NSData dataWithBytes:bytes length:sizeof(bytes)] copy];
  
  [BluetoothServiceInstance.currentDevice setNotifyValue:distanceNotificationStatus forCharacteristic:self.distanceCharacteristic];
  
  DLog(@"Toggle Session State %d", operation);
//  [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:self.sessionControlCharacteristic type:CBCharacteristicWriteWithResponse];
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
  if ([characteristic.UUID isEqual:DISTANCE_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
      
      _errorHandler(error);
    }
    else {
//      _errorHandler(nil);
      
      // Temporary solution: Toggle session state on the board only after toggling the notification state
      [BluetoothServiceInstance.currentDevice writeValue:_currentCommandData forCharacteristic:self.sessionControlCharacteristic type:CBCharacteristicWriteWithResponse];
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  if ([characteristic.UUID isEqual:SESSION_CONTROL_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error writing to characteristic: %@ %@", characteristic.UUID, error.localizedDescription);
      
      _errorHandler(error);
    }
    else {
      _errorHandler(nil);
      // When we have the updated firmware, we should toggle distance notification here after successfully update the session state
//      [BluetoothServiceInstance.currentDevice setNotifyValue:distanceNotificationStatus forCharacteristic:self.distanceCharacteristic];
    }
  }
}

@end
