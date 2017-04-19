//
//  VibrationMotorService.m
//  Backbone
//
//  Created by Eko Mirhard on 4/19/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import "VibrationMotorService.h"
#import "BluetoothService.h"
#import <React/RCTUtils.h>
#import "Utilities.h"

@implementation VibrationMotorService

+ (VibrationMotorService*)getVibrationMotorService {
  static VibrationMotorService *_vibrationMotorService = nil;
  
  static dispatch_once_t vibrationMotorServiceInitialized;
  dispatch_once(&vibrationMotorServiceInitialized, ^{
    _vibrationMotorService = [[self alloc] initService];
  });
  
  return _vibrationMotorService;
}

- (id)initService {
  self = [super init];
  DLog(@"VibrationMotorService init");
  [BluetoothServiceInstance addCharacteristicDelegate:self];
  
  return self;
}

- (id)init {
  return [VibrationMotorService getVibrationMotorService];
}

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(vibrate:(NSArray*)vibrationParams) {
  if ([BluetoothServiceInstance isDeviceReady] &&
      [BluetoothServiceInstance getCharacteristicByUUID:VIBRATION_MOTOR_CHARACTERISTIC_UUID]) {
    _currentVibrationCommands = [vibrationParams copy];
    currentVibrationIndex = 0;
    [self sendNextVibrationCommand];
  }
}

- (void)sendNextVibrationCommand {
  // Check if there's any pending vibration commands
  if (currentVibrationIndex == [_currentVibrationCommands count]) return;
  
  NSDictionary *vibrationParam = (NSDictionary*)_currentVibrationCommands[currentVibrationIndex];
  int vibrationSpeedType = (vibrationParam[@"vibrationSpeed"] ? [vibrationParam[@"vibrationSpeed"] intValue] : VIBRATION_SPEED_TYPE_MEDIUM);
  int vibrationDurationType = (vibrationParam[@"vibrationDuration"] ? [vibrationParam[@"vibrationDuration"] intValue] : VIBRATION_DURATION_TYPE_MEDIUM);
  int vibrationSpeed;
  int vibrationDuration;
  
  switch (vibrationSpeedType) {
    case VIBRATION_SPEED_TYPE_SLOW:
      vibrationSpeed = VIBRATION_SPEED_VALUE_SLOW;
      break;
    case VIBRATION_SPEED_TYPE_FAST:
      vibrationSpeed = VIBRATION_SPEED_VALUE_FAST;
      break;
    default:
      vibrationSpeed = VIBRATION_SPEED_VALUE_MEDIUM;
  }
  
  switch (vibrationDurationType) {
    case VIBRATION_DURATION_TYPE_SHORT:
      vibrationDuration = VIBRATION_DURATION_VALUE_SHORT;
      break;
    case VIBRATION_DURATION_TYPE_LONG:
      vibrationDuration = VIBRATION_DURATION_VALUE_LONG;
      break;
    default:
      vibrationDuration = VIBRATION_DURATION_VALUE_MEDIUM;
  }
  
  nextVibrationDelay = vibrationDuration;
  
  uint8_t bytes[4];
  
  bytes[0] = VIBRATION_COMMAND_START;
  bytes[1] = vibrationSpeed;
  bytes[2] = [Utilities getByteFromInt:vibrationDuration index:1];
  bytes[3] = [Utilities getByteFromInt:vibrationDuration index:0];
  
  NSData *data = [NSData dataWithBytes:bytes length:sizeof(bytes)];
  
  [BluetoothServiceInstance.currentDevice writeValue:data forCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:VIBRATION_MOTOR_CHARACTERISTIC_UUID] type:CBCharacteristicWriteWithResponse];
}

- (void)peripheral:(CBPeripheral *)peripheral didWriteValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  DLog(@"Has write %@ %@", characteristic, error);
  if ([characteristic.UUID isEqual:VIBRATION_MOTOR_CHARACTERISTIC_UUID]) {
    if (error) {
      DLog(@"Error writing to characteristic: %@ %@", characteristic.UUID, error.localizedDescription);
    }
    else {
      // Set a delay before sending the next command
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (nextVibrationDelay / 1000.0) * NSEC_PER_SEC), dispatch_get_main_queue(), ^{
        currentVibrationIndex++;
        [self sendNextVibrationCommand];
      });
    }
  }
}

@end
