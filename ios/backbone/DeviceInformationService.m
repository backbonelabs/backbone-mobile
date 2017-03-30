//
//  DeviceInformationService.m
//  Backbone
//
//  Created by Eko Mirhard on 11/16/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import "DeviceInformationService.h"
#import "BluetoothService.h"
#import <React/RCTUtils.h>
#import "Utilities.h"

@implementation DeviceInformationService

+ (DeviceInformationService*)getDeviceInformationService {
  static DeviceInformationService *_deviceInformationService = nil;
  
  static dispatch_once_t deviceInformationServiceInitialized;
  dispatch_once(&deviceInformationServiceInitialized, ^{
    _deviceInformationService = [[self alloc] initService];
  });
  
  return _deviceInformationService;
}

- (id)initService {
  self = [super init];
  DLog(@"DeviceInformation init");
  [BluetoothServiceInstance addCharacteristicDelegate:self];
  
  return self;
}

- (id)init {
  return [DeviceInformationService getDeviceInformationService];
}

RCT_EXPORT_MODULE();

/**
 Retrieves the device battery level and firmware version
 @param callback The callback will be called with an error dictionary as the first argument if there are exceptions,
                 and a device information dictionary as the second argument if there are no exceptions
 */
RCT_EXPORT_METHOD(getDeviceInformation:(RCTResponseSenderBlock)callback) {
  if (hasPendingCallback) {
    return;
  }

  hasPendingCallback = YES;

  if ([BluetoothServiceInstance isDeviceReady]) {
    if ([BluetoothServiceInstance getCharacteristicByUUID:FIRMWARE_VERSION_CHARACTERISTIC_UUID]
        && [BluetoothServiceInstance getCharacteristicByUUID:BATTERY_LEVEL_CHARACTERISTIC_UUID]) {
      [self retrieveFirmwareVersion:^(NSString * _Nonnull str) {
        [self retrieveBatteryLevel:^(int value) {
          hasPendingCallback = NO;
          callback(@[[NSNull null], @{@"deviceMode" : @(BluetoothServiceInstance.currentDeviceMode), @"firmwareVersion" : str, @"batteryLevel" : @(value), @"identifier" : [BluetoothServiceInstance.currentDevice.identifier UUIDString] }]);
        }];
      }];
    }
    else {
      // Required characteristics are not available, return default values
      hasPendingCallback = NO;
      callback(@[[NSNull null], @{@"deviceMode" : @(BluetoothServiceInstance.currentDeviceMode), @"firmwareVersion" : @"", @"batteryLevel" : @(-1), @"identifier" : [BluetoothServiceInstance.currentDevice.identifier UUIDString] }]);
    }
  }
  else {
    hasPendingCallback = NO;
    NSDictionary *makeError = RCTMakeError(@"Not connected to a device", nil, nil);
    callback(@[makeError]);
  }
}

- (void)retrieveFirmwareVersion:(StringHandler)handler {
  _firmwareVersionHandler = handler;
  
  if (![BluetoothServiceInstance getCharacteristicByUUID:FIRMWARE_VERSION_CHARACTERISTIC_UUID]) {
    _firmwareVersionHandler(@"");
  }
  else {
    [BluetoothServiceInstance.currentDevice readValueForCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:FIRMWARE_VERSION_CHARACTERISTIC_UUID]];
  }
}

- (void)retrieveBatteryLevel:(IntHandler)handler {
  _batteryLevelHandler = handler;
  
  if (![BluetoothServiceInstance getCharacteristicByUUID:BATTERY_LEVEL_CHARACTERISTIC_UUID]) {
    _batteryLevelHandler(-1);
  }
  else {
    [BluetoothServiceInstance.currentDevice readValueForCharacteristic:[BluetoothServiceInstance getCharacteristicByUUID:BATTERY_LEVEL_CHARACTERISTIC_UUID]];
  }
}

- (void)peripheral:(CBPeripheral *)peripheral didDiscoverCharacteristicsForService:(CBService *)service error:(NSError *)error {
  DLog(@"[DeviceInfo] Did Discover Characteristic with error: %@", error);
  
//  if (error == nil) {
//    for (CBCharacteristic *characteristic in service.characteristics) {
//      if ([characteristic.UUID isEqual:FIRMWARE_VERSION_CHARACTERISTIC_UUID]) {
//        _firmwareVersionCharacteristic = characteristic;
//      }
//      else if ([characteristic.UUID isEqual:BATTERY_LEVEL_CHARACTERISTIC_UUID]) {
//        _batteryLevelCharacteristic = characteristic;
//      }
//    }
//  }
}

- (void)peripheral:(CBPeripheral *)peripheral didUpdateValueForCharacteristic:(CBCharacteristic *)characteristic error:(NSError *)error {
  if ([characteristic.UUID isEqual:FIRMWARE_VERSION_CHARACTERISTIC_UUID]) {
    if (!error) {
      uint8_t *data = (uint8_t*) [characteristic.value bytes];
      
      _firmwareVersionHandler([NSString stringWithFormat:@"%d.%d.%d.%d", data[0], data[1], data[2], data[3]]);
    }
    else {
      _firmwareVersionHandler(@"");
    }
  }
  else if ([characteristic.UUID isEqual:BATTERY_LEVEL_CHARACTERISTIC_UUID]){
    if (!error) {
      uint8_t *data = (uint8_t*) [characteristic.value bytes];

      _batteryLevelHandler(data[0]);
    }
    else {
      _batteryLevelHandler(-1);
    }
  }
}

@end
