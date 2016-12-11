/*
 * Copyright Cypress Semiconductor Corporation, 2014-2015 All rights reserved.
 *
 * This software, associated documentation and materials ("Software") is
 * owned by Cypress Semiconductor Corporation ("Cypress") and is
 * protected by and subject to worldwide patent protection (UnitedStates and foreign), United States copyright laws and international
 * treaty provisions. Therefore, unless otherwise specified in a separate license agreement between you and Cypress, this Software
 * must be treated like any other copyrighted material. Reproduction,
 * modification, translation, compilation, or representation of this
 * Software in any other form (e.g., paper, magnetic, optical, silicon)
 * is prohibited without Cypress's express written permission.
 *
 * Disclaimer: THIS SOFTWARE IS PROVIDED AS-IS, WITH NO WARRANTY OF ANY
 * KIND, EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO,
 * NONINFRINGEMENT, IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS
 * FOR A PARTICULAR PURPOSE. Cypress reserves the right to make changes
 * to the Software without notice. Cypress does not assume any liability
 * arising out of the application or use of Software or any product or
 * circuit described in the Software. Cypress does not authorize its
 * products for use as critical components in any products where a
 * malfunction or failure may reasonably be expected to result in
 * significant injury or death ("High Risk Product"). By including
 * Cypress's product in a High Risk Product, the manufacturer of such
 * system or application assumes all risk of such use and in doing so
 * indemnifies Cypress against all liability.
 *
 * Use of this Software may be limited by and subject to the applicable
 * Cypress software license agreement.
 *
 *
 */

#import <Foundation/Foundation.h>
#import <CoreBluetooth/CoreBluetooth.h>
#import "Constants.h"
#import <UIKit/UIKit.h>

typedef union {
  uint8_t bytes[4];
  float floatVal;
  int intVal;
} byteArrayUnion;

@interface Utilities : NSObject

/*!
 *  @method timeInFormat:
 *
 *  @discussion Method that converts seconds to minute:seconds format
 *
 */
+(NSString*)timeInFormat:(double)timeInterval;

/*!
 *  @method secondsToHour:
 *
 *  @discussion Method that converts seconds to hours
 *
 */

+(double)secondsToHour:(double)timeInterval;

/*!
 *  @method secondsToMinute:
 *
 *  @discussion Method that converts seconds to minute
 *
 */
+(double)secondsToMinute:(double)timeInterval;

/*!
 *  @method meterToKM:
 *
 *  @discussion Method that converts meter to km
 *
 */

+(double)meterToKM:(double)meter;

/*!
 *  @method getCurrentTime
 *
 *  @discussion Method that returns the current time
 *
 */
+(NSString *) getCurrentTime;

/*!
 *  @method getCurrentDate
 *
 *  @discussion Method that returns the current date
 *
 */
+(NSString *) getCurrentDate;

/*!
 *  @method dataFromHexString:
 *
 *  @discussion Method to handle conversion of user entered hex value
 *
 */

+ (NSMutableData *)dataFromHexString:(NSString *)string;

/*!
 *  @method convertCharacteristicValueToASCII:
 *
 *  @discussion Method to handle ASCII conversion
 *
 */
+(NSString *)convertCharacteristicValueToASCII:(NSData *)data;

/*!
 *  @method getIntegerFromHexString:
 *
 *  @discussion Method that returns the integer from hex string
 *
 */
+(unsigned int) getIntegerFromHexString:(NSString *)hexString;

/*!
 *  @method get128BitUUIDForUUID:
 *
 *  @discussion Method that returns the 128 bit UUID
 *
 */
+(NSString *)get128BitUUIDForUUID:(CBUUID *)UUID;

/*!
 *  @method convertSFLOATFromData:
 *
 *  @discussion Method to convert the SFLOAT to simple float
 *
 */

+(float) convertSFLOATFromData:(int16_t)tempData;

/*!
 *  @method convertToHexFromASCII:
 *
 *  @discussion Method to convert ASCII string to hex
 *
 */

+ (NSString *) convertToHexFromASCII:(NSString *)ASCIIString;


/*!
 *  @method convertToFloatFromBytes:
 *
 *  @discussion Method to convert 4 bytes from the specified offset to float
 *
 */
+ (float) convertToFloatFromBytes:(uint8_t*)bytes offset:(int)idx;

/*!
 *  @method convertToIntFromBytes:
 *
 *  @discussion Method to convert 4 bytes from the specified offset to integer
 *
 */
+ (int) convertToIntFromBytes:(uint8_t*)bytes offset:(int)idx;

/*!
 *  @method getByteFromFloat:index:
 *
 *  @discussion Method to get the byte of an float value on the requested index
 *
 */
+ (uint8_t) getByteFromFloat:(float)val index:(int)idx;

/*!
 *  @method getByteFromInt:index:
 *
 *  @discussion Method to get the byte of an integer value on the requested index
 *
 */
+ (uint8_t) getByteFromInt:(int)val index:(int)idx;

@end
