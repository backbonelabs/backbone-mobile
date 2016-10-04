//
//  Constant.h
//  Backbone
//
//  Created by Eko Mirhard on 10/1/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#ifndef Constant_h
#define Constant_h

#define RADIANS_TO_DEGREES(radians) ((radians) * (180.0 / M_PI))
#define TIME_STAMP [[NSDate date] timeIntervalSince1970]

#define MINIMUM_STEP 30
#define STEP_TIME_LIMIT 15.0

// Change this value if you want to test it faster. Both values are now in 'minute'
#define NOTIFICATION_PERIOD 5
#define NOTIFICATION_CYCLE 60

#endif /* Constant_h */
