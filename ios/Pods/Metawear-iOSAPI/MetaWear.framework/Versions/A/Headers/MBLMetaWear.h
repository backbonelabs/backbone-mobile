/**
 * MBLMetaWear.h
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
#import <CoreBluetooth/CoreBluetooth.h>
#import <MetaWear/MBLConstants.h>

@class MBLTemperature;
@class MBLAccelerometer;
@class MBLLED;
@class MBLMechanicalSwitch;
@class MBLGPIO;
@class MBLHapticBuzzer;
@class MBLiBeacon;
@class MBLNeopixel;
@class MBLEvent;
@class MBLDataProcessor;

@interface MBLMetaWear : NSObject <CBPeripheralDelegate>

/**
 Query the current RSSI
 */
- (void)readRSSIWithHandler:(MBLNumberHandler)handler;
/**
 Query the percent remaining battery life, returns int between 0-100
 */
- (void)readBatteryLifeWithHandler:(MBLNumberHandler)handler;
/**
 Query information about the device
 */
- (void)readDeviceInfoWithHandler:(MBLDeviceInfoHandler)handler;

/**
 Perform a software reset of the device
 */
- (void)resetDevice;

/**
 See if this device is running the most up to date firmware
 */
- (void)checkForFirmwareUpdateWithHandler:(MBLBoolHandler)handler;
/**
 Updates the device to the latest firmware.  Executes the progressHandler
 periodically with the progress (0.0 - 1.0), progressHandler will get called
 with 1.0 before handler is called.  handler will be passed a nil NSError* if
 update was successful and non-nil NSError* otherwise.
 @param MBLErrorHandler handler, Callback once update is complete
 @param MBLFloatHandler progressHandler, Periodically called while firmware upload is in progress
 @returns none
 */
- (void)updateFirmwareWithHandler:(MBLErrorHandler)handler
                  progressHandler:(MBLFloatHandler)progressHandler;


/** 
 Pointer the underlying CoreBluetooth object 
 */
@property (nonatomic, strong, readonly) CBPeripheral *peripheral;
/** 
 Stored value of signal strength at discovery time 
 */
@property (nonatomic, strong) NSNumber *discoveryTimeRSSI;

// *** Sensors ***
@property (nonatomic, strong, readonly) MBLMechanicalSwitch *mechanicalSwitch;
@property (nonatomic, strong, readonly) MBLLED *led;
@property (nonatomic, strong, readonly) MBLTemperature *temperature;
@property (nonatomic, strong, readonly) MBLAccelerometer *accelerometer;
@property (nonatomic, strong, readonly) MBLGPIO *gpio;
@property (nonatomic, strong, readonly) MBLHapticBuzzer *hapticBuzzer;
@property (nonatomic, strong, readonly) MBLiBeacon *iBeacon;
@property (nonatomic, strong, readonly) MBLNeopixel *neopixel;
@property (nonatomic, strong, readonly) MBLEvent *event;
@property (nonatomic, strong, readonly) MBLDataProcessor *dataProcessor;

@end
