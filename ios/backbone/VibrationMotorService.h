//
//  VibrationMotorService.h
//  Backbone
//
//  Created by Eko Mirhard on 4/19/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import <CoreBluetooth/CoreBluetooth.h>
#import <React/RCTBridgeModule.h>
#import "Constants.h"

@interface VibrationMotorService : NSObject <RCTBridgeModule, CBPeripheralDelegate> {
  int currentVibrationIndex;
  NSArray *_currentVibrationCommands;
  int nextVibrationDelay;
}

+ (VibrationMotorService *)getVibrationMotorService;

- (id)initService;

@end
