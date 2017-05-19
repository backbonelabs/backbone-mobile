//
//  AccelerometerService.h
//  Backbone
//
//  Created by Eko Mirhard on 5/20/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTBridgeModule.h>
#import "Constants.h"

@interface AccelerometerService : RCTEventEmitter <RCTBridgeModule, CBPeripheralDelegate> {
  ErrorHandler _toggleHandler;
  
  BOOL accelerometerNotificationStatus;
  NSTimeInterval previousDataTimestamp;
}

+ (AccelerometerService *)getAccelerometerService;

- (id)initService;

@end
