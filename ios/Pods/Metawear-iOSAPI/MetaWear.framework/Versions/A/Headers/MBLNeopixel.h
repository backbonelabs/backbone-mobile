/**
 * MBLNeopixel.h
 * MetaWear
 *
 * Created by Stephen Schiffli on 8/12/14.
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

@interface MBLNeopixel : MBLModule

/**
 Initialize the Neopixel thread.
 @param uint8_t index, strand index
 @param uint8_t color, color order and speed
 @param uint8_t pin, I/O pin
 @param uint8_t length, strand length
 @returns none
 */
- (void)initializeStrandAtIndex:(uint8_t)index withColor:(uint8_t)color pin:(uint8_t)pin andLength:(uint8_t)length;

/**
 Hold Neopixel strand.
 @param uint8_t index, strand index
 @param BOOL enable, hold enable
 @returns none
 */
- (void)holdStrandAtIndex:(uint8_t)index withEnable:(BOOL)enable;

/**
 Clear Neopixel strand.
 @param uint8_t start, start index
 @param uint8_t end, stop index
 @returns none
 */
- (void)clearStrandwithStartIndex:(uint8_t)start endIndex:(uint8_t)end;

/**
 Set Pixel at strand index.
 @param uint8_t index, strand index
 @param uint8_t red, TODO
 @param uint8_t green, TODO
 @param uint8_t blue, TODO
 @returns none
 */
- (void)setPixelAtIndex:(uint8_t)index withRed:(uint8_t)red Green:(uint8_t)green andBlue:(uint8_t)blue;

/**
 Rotate strand at index.
 @param uint8_t index, strand index
 @param uint8_t flag, increment flag
 @param uint8_t repeat, rotate repeat
 @param uint16_t delay, delay in ms
 @returns none
 */
- (void)rotateStrandAtIndex:(uint8_t)index withIncFlag:(uint8_t)flag rotateRepeat:(uint8_t)repeat andDelay:(uint16_t)delay;

/**
 Deinitialize strand at index.
 @param uint8_t index, strand index
 @returns none
 */
- (void)deinitializeStrandAtIndex:(uint8_t)index;

@end
