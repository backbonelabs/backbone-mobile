//
//  DeviceInformationService.h
//  Backbone
//
//  Created by Eko Mirhard on 11/16/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import "Constants.h"

@interface DeviceInformationService : RCTEventEmitter <RCTBridgeModule, CBPeripheralDelegate> {
  StringHandler _firmwareVersionHandler;
  IntHandler _batteryLevelHandler;
  DictionaryHandler _deviceStatusHandler;
  BOOL hasPendingCallback;
}

+ (DeviceInformationService *)getDeviceInformationService;

- (id)initService;

- (void)refreshDeviceTestStatus;
- (void)retrieveFirmwareVersion:(StringHandler)handler;
- (void)retrieveBatteryLevel:(IntHandler)handler;
- (void)retrieveDeviceStatus:(DictionaryHandler)handler;

@end
