//
//  AccelerometerService.m
//  Backbone
//
//  Created by Eko Mirhard on 5/20/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "AccelerometerService.h"
#import "BluetoothService.h"
#import <React/RCTUtils.h>
#import "Utilities.h"

@implementation AccelerometerService

+ (AccelerometerService*)getAccelerometerService {
  static AccelerometerService *_accelerometerService = nil;
  
  static dispatch_once_t accelerometerServiceInitialized;
  dispatch_once(&accelerometerServiceInitialized, ^{
    _accelerometerService = [[self alloc] initService];
  });
  
  return _accelerometerService;
}

- (id)initService {
  self = [super init];
  DLog(@"AccelerometerService init");
  [BluetoothServiceInstance addCharacteristicDelegate:self];
  
  accelerometerNotificationStatus = false;
  previousDataTimestamp = 0;
  
  return self;
}

- (id)init {
  return [AccelerometerService getAccelerometerService];
}

- (NSArray<NSString *> *)supportedEvents {
  return @[@"AccelerometerData"];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(startListening:(RCTResponseSenderBlock)callback) {
  if ([BluetoothServiceInstance isDeviceReady] && [BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]) {
    [self toggleAccelerometerNotification:YES withHandler:^(NSError * _Nullable error) {
      if (!error) {
        callback(@[[NSNull null]]);
      }
      else {
        callback(@[RCTMakeError(@"Accelerometer is not available", nil, nil)]);
      }
    }];
  }
  else {
    callback(@[RCTMakeError(@"Accelerometer is not ready", nil, nil)]);
  }
}

RCT_EXPORT_METHOD(stopListening:(RCTResponseSenderBlock)callback) {
  if ([BluetoothServiceInstance isDeviceReady] && [BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]) {
    [self toggleAccelerometerNotification:NO withHandler:^(NSError * _Nullable error) {
      if (!error) {
        callback(@[[NSNull null]]);
      }
      else {
        callback(@[RCTMakeError(@"Accelerometer is not available", nil, nil)]);
      }
    }];
  }
  else {
    callback(@[RCTMakeError(@"Accelerometer is not ready", nil, nil)]);
  }
}

- (void)toggleAccelerometerNotification:(BOOL)state withHandler:(ErrorHandler)handler {
  _toggleHandler = handler;
  accelerometerNotificationStatus = state;
  
  if (state) {
    int sessionDurationInSecond = 0;
    int slouchDistanceThreshold = SLOUCH_DEFAULT_DISTANCE_THRESHOLD;
    int slouchTimeThreshold = SLOUCH_DEFAULT_TIME_THRESHOLD;
    int vibrationPattern = 0;
    int vibrationSpeed = 0;
    int vibrationDuration = 0;
    
    uint8_t bytes[12];
    
    bytes[0] = SESSION_COMMAND_START;
    
    bytes[1] = [Utilities getByteFromInt:sessionDurationInSecond index:3];
    bytes[2] = [Utilities getByteFromInt:sessionDurationInSecond index:2];
    bytes[3] = [Utilities getByteFromInt:sessionDurationInSecond index:1];
    bytes[4] = [Utilities getByteFromInt:sessionDurationInSecond index:0];
    
    bytes[5] = [Utilities getByteFromInt:slouchDistanceThreshold index:1];
    bytes[6] = [Utilities getByteFromInt:slouchDistanceThreshold index:0];
    
    bytes[7] = [Utilities getByteFromInt:slouchTimeThreshold index:1];
    bytes[8] = [Utilities getByteFromInt:slouchTimeThreshold index:0];
    
    bytes[9] = vibrationPattern;
    bytes[10] = vibrationSpeed;
    bytes[11] = vibrationDuration;
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID] type:CBCharacteristicWriteWithResponse];
  }
  else {
    uint8_t bytes[1];
    
    bytes[0] = SESSION_COMMAND_STOP;
    
    NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
    
    [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:SESSION_CONTROL_CHARACTERISTIC_UUID] type:CBCharacteristicWriteWithResponse];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"DidUpdateValue %@", characteristic);
  if (error == nil) {
    if ([characteristic.UUID isEqual:ACCELEROMETER_CHARACTERISTIC_UUID]) {
      uint8_t *dataPointer = (uint8_t*) [characteristic.value bytes];
      
      float xAxis = [Utilities convertToFloatFromBytes:dataPointer offset:0];
      float yAxis = [Utilities convertToFloatFromBytes:dataPointer offset:4];
      float zAxis = [Utilities convertToFloatFromBytes:dataPointer offset:8];
      float acceleration = [Utilities convertToFloatFromBytes:dataPointer offset:12];
      
      // Prevent from flooding the React side for rendering the chart
      // as that would freeze the entire UI due to excessive data being sent
      NSTimeInterval currentTimestamp = [[NSDate date] timeIntervalSince1970] * 1000;
      if (currentTimestamp - previousDataTimestamp >= 250.0) {
        previousDataTimestamp = currentTimestamp;
        
        NSDictionary *accData = @{
                                  @"xAxis": [NSNumber numberWithFloat:xAxis],
                                  @"yAxis": [NSNumber numberWithFloat:yAxis],
                                  @"zAxis": [NSNumber numberWithFloat:zAxis],
                                  @"acceleration": [NSNumber numberWithFloat:acceleration]
                                  };
        
        DLog(@"AccelerometerData %@", accData);
        [self sendEventWithName:@"AccelerometerData" body:accData];
      }
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateNotificationStateForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error{
  DLog(@"DidUpdateNotif %@", characteristic);
  if ([characteristic.UUID isEqual:ACCELEROMETER_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error changing notification state: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_toggleHandler) {
        _toggleHandler(error);
      }
    }
    else {
      if (_toggleHandler) {
        _toggleHandler(nil);
      }
    }
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"Has write %@ %@", characteristic, error);
  if ([characteristic.UUID isEqual:SESSION_CONTROL_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error writing to characteristic: %@ %@", characteristic.UUID, error.localizedDescription);
      
      if (_toggleHandler) {
        _toggleHandler(error);
      }
    }
    else {
      [BluetoothServiceInstance.currentDevice setNotifyValue:accelerometerNotificationStatus forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:ACCELEROMETER_CHARACTERISTIC_UUID]];
    }
  }
}

@end
