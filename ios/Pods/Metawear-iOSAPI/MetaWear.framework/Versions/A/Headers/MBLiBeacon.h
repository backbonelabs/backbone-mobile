/**
 * MBLiBeacon.h
 * MetaWear
 *
 * Created by Stephen Schiffli on 8/3/14.
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

#import <MetaWear/MBLConstants.h>
#import <MetaWear/MBLModule.h>

@interface MBLiBeacon : MBLModule

/**
 The iBeacon UUID being broadcast, the default is the MetaWear Service UUID
 */
@property (nonatomic, strong) CBUUID *uuid;
/**
 The iBeacon major value being broadcast, the default is 0x0000
 */
@property (nonatomic) uint16_t major;
/**
 The iBeacon minor value being broadcast, the default is 0x0000
 */
@property (nonatomic) uint16_t minor;

/**
 Calibrated RX power, default is -55 dBm
 */
@property (nonatomic) uint8_t powerRX;
/**
 TX power, default is 0 dBm
 */
@property (nonatomic) uint8_t powerTX;
/**
 Advertisement frequency in ms, default is 500 ms
 */
@property (nonatomic) uint16_t frequency;

/**
 Change iBeacon state to on or off. Please set any configuration properties
 before calling this method, setting properties after this call will have
 no effect until setBeaconOn: is called again.
 @param BOOL on, YES turns iBeacon on, NO, turns iBeacon off
 @returns none
 */
- (void)setBeaconOn:(BOOL)on;

@end
