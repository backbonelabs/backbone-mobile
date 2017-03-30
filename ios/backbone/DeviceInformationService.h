//
//  DeviceInformationService.h
//  Backbone
//
//  Created by Eko Mirhard on 11/16/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTBridgeModule.h>
#import "Constants.h"

@interface DeviceInformationService : NSObject <RCTBridgeModule, CBPeripheralDelegate> {
  StringHandler _firmwareVersionHandler;
  IntHandler _batteryLevelHandler;
  BOOL hasPendingCallback;
}

@property (nonatomic, strong) RCTBridge *bridge;

+ (DeviceInformationService *)getDeviceInformationService;

- (id)initService;

- (void)retrieveFirmwareVersion:(StringHandler)handler;
- (void)retrieveBatteryLevel:(IntHandler)handler;

@end
