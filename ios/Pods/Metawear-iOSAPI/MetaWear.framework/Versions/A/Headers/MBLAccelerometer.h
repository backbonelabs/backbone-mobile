/**
 * MBLAccelerometer.h
 * MetaWear
 *
 * Created by Stephen Schiffli on 7/29/14.
 * Copyright 2014 MbientLab Inc. All rights reserved.
 *
 * IMPORTANT: Your use of this Software is limited to those specific rights
 * granted under the terms of a software license agreement between the user who
 * downloaded the software, his/her employer (which must be your employer) and
 * MbientLab Inc, (the "License").  You may not use this Software unless you
 * agree to abide by the terms of the License which can be found at
 * www.mbientlab.com/terms . The License limits your use, and you acknowledge,
 * that the  Software may not be modified, copied or distributed and can be used
 * solely and exclusively in conjunction with a MbientLab Inc, product.  Other
 * than for the foregoing purpose, you may not use, reproduce, copy, prepare
 * derivative works of, modify, distribute, perform, display or sell this
 * Software and/or its documentation for any purpose.
 *
 * YOU FURTHER ACKNOWLEDGE AND AGREE THAT THE SOFTWARE AND DOCUMENTATION ARE
 * PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR IMPLIED,
 * INCLUDING WITHOUT LIMITATION, ANY WARRANTY OF MERCHANTABILITY, TITLE,
 * NON-INFRINGEMENT AND FITNESS FOR A PARTICULAR PURPOSE. IN NO EVENT SHALL
 * MBIENTLAB OR ITS LICENSORS BE LIABLE OR OBLIGATED UNDER CONTRACT, NEGLIGENCE,
 * STRICT LIABILITY, CONTRIBUTION, BREACH OF WARRANTY, OR OTHER LEGAL EQUITABLE
 * THEORY ANY DIRECT OR INDIRECT DAMAGES OR EXPENSES INCLUDING BUT NOT LIMITED
 * TO ANY INCIDENTAL, SPECIAL, INDIRECT, PUNITIVE OR CONSEQUENTIAL DAMAGES, LOST
 * PROFITS OR LOST DATA, COST OF PROCUREMENT OF SUBSTITUTE GOODS, TECHNOLOGY,
 * SERVICES, OR ANY CLAIMS BY THIRD PARTIES (INCLUDING BUT NOT LIMITED TO ANY
 * DEFENSE THEREOF), OR OTHER SIMILAR COSTS.
 *
 * Should you have any questions regarding your right to use this Software,
 * contact MbientLab Inc, at www.mbientlab.com.
 */

#import <Foundation/Foundation.h>
#import <MetaWear/MBLConstants.h>
#import <MetaWear/MBLAccelerometerData.h>
#import <MetaWear/MBLModule.h>

@class MBLMetaWear;

typedef enum {
    MBLAccelerometerRange2G = 0,
    MBLAccelerometerRange4G = 1,
    MBLAccelerometerRange8G = 2
} MBLAccelerometerRange;

typedef enum {
    MBLAccelerometerSampleFrequency800Hz = 0,
    MBLAccelerometerSampleFrequency400Hz = 1,
    MBLAccelerometerSampleFrequency200Hz = 2,
    MBLAccelerometerSampleFrequency100Hz = 3,
    MBLAccelerometerSampleFrequency50Hz = 4,
    MBLAccelerometerSampleFrequency12_5Hz = 5,
    MBLAccelerometerSampleFrequency6_25Hz = 6,
    MBLAccelerometerSampleFrequency1_56Hz = 7
} MBLAccelerometerSampleFrequency;

typedef enum {
    MBLAccelerometerSleepSampleFrequency50Hz = 0,
    MBLAccelerometerSleepSampleFrequency12_5Hz = 1,
    MBLAccelerometerSleepSampleFrequency6_25Hz = 2,
    MBLAccelerometerSleepSampleFrequency1_56Hz = 3
} MBLAccelerometerSleepSampleFrequency;

typedef enum {
    MBLAccelerometerPowerSchemeNormal = 0,
    MBLAccelerometerPowerSchemeLowNoiseLowPower = 1,
    MBLAccelerometerPowerSchemeHighResolution = 2,
    MBLAccelerometerPowerSchemeLowerPower = 3,
} MBLAccelerometerPowerScheme;

@interface MBLAccelerometer : MBLModule

/**
 Maximum acceleration the accelerometer can report
 */
@property (nonatomic) MBLAccelerometerRange fullScaleRange;
/**
 High-pass filter enable; YES: Output data high-pass filtered, NO: No filter
 */
@property (nonatomic) BOOL highPassFilter;
/**
 Data rate selection; 0: 800Hz, 1: 400Hz, 2: 200 Hz, 3: 100 Hz, 4: 50 Hz,
 5: 12.5 Hz, 6: 6.25 Hz, 7: 1.56 Hz
 */
@property (nonatomic) MBLAccelerometerSampleFrequency sampleFrequency;
/**
 Reduced noise reduced mode; NO: Normal Mode, YES: Reduced noise
 in low noise mode, the maximum signal that can be measured is ±4g. Note: Any
 thresholds set above 4g will not be reached.
 */
@property (nonatomic) BOOL lowNoise;
/**
 Fast Read mode; NO: Normal Mode, YES: Fast Read Mode F_READ bit selects between
 Normal and Fast Read mode. When selected, the auto-increment counter
 will skip over the LSB data bytes.
 */
@property (nonatomic) BOOL fastReadMode;

/**
 ACTIVE mode power scheme selection
 */
@property (nonatomic) MBLAccelerometerPowerScheme activePowerScheme;

/** Configures the Auto-WAKE sample frequency when the device is in 
 SLEEP Mode; 0: 50 Hz, 1: 12.5 Hz, 2: 6.25 Hz, 3: 1.56 Hz 
 */
@property (nonatomic) MBLAccelerometerSleepSampleFrequency sleepSampleFrequency;
/**
 SLEEP mode power scheme selection
 */
@property (nonatomic) MBLAccelerometerPowerScheme sleepPowerScheme;
/**
 Auto-SLEEP; NO: Disabled, YES: Enabled
 */
@property (nonatomic) BOOL autoSleep;


/**
 Turn on the accelerometer and start receiving updates. This will invoke the provided
 block each time a new reading shows up.  Please set any configuration properties
 before calling this method, setting properties after this call will have no effect
 until startAccelerometerUpdatesWithHandler: is called again.
 @param MBLAccelerometerHandler handler, Callback to handle each time a new reading is taken, 
 it has the signature: (MBLAccelerometerData *acceleration, NSError *error), where the acceleration
 object contains the x, y, and z acceleration data in g's and a time interval since data collection began
 @returns none
 */
- (void)startAccelerometerUpdatesWithHandler:(MBLAccelerometerHandler)handler;

/**
 Turn off the accelerometer and stop receiving updates.
 will stop being called
 @param none
 @returns none
 */
- (void)stopAccelerometerUpdates;

@end
