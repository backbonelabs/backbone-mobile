//
//  DeviceLogger.h
//  Backbone
//
//  Created by Eko Mirhard on 5/25/17.
//  Copyright © 2017 Backbone Labs, Inc. All rights reserved.
//

#import <Foundation/Foundation.h>

@interface DeviceLogger : NSObject

+ (void)logAccelerometerData:(NSArray*)data;

@end
