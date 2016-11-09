//
//  Constants.h
//  Backbone
//
//  Created by Eko Mirhard on 10/1/16.
//  Copyright © 2016 Backbone Labs, Inc. All rights reserved.
//

#ifndef Constants_h
#define Constants_h

/*
 General
 */

// Shorthand for faster access to the instance of the BluetoothService singleton
#define BluetoothServiceInstance      [BluetoothService getBluetoothService]

#define RADIANS_TO_DEGREES(radians)   ((radians) * (180.0 / M_PI))

#define TIME_STAMP [[NSDate date]     timeIntervalSince1970]

#define DATE_FORMAT   @"dd-MMM-yyyy"
#define TIME_FORMAT   @"HH:mm:ss"

#define MINIMUM_STEP      30
#define STEP_TIME_LIMIT   15.0

// Change this value if you want to test it faster. Both values are now in 'minute'
#define NOTIFICATION_PERIOD   5
#define NOTIFICATION_CYCLE    60

#define EVENT_ACTIVITY_DISABLED   "ActivityDisabled"

#define PREF_SAVED_DEVICE_KEY @"co.backbonelabs.backbone.PREF_SAVED_DEVICE_KEY"

/*
 Services and Characteristics UUID
*/

#define BACKBONE_SERVICE_UUID                     [CBUUID UUIDWithString:@"00010000-0000-1000-8000-805F9B34FB00"]
#define BOOTLOADER_SERVICE_UUID                   [CBUUID UUIDWithString:@"00060000-F8CE-11E4-ABF4-0002A5D5C51B"]

#define ENTER_BOOTLOADER_CHARACTERISTIC_UUID      [CBUUID UUIDWithString:@"00010005-0000-1000-8000-805F9B34FB00"]
#define BOOTLOADER_CHARACTERISTIC_UUID            [CBUUID UUIDWithString:@"00060001-F8CE-11E4-ABF4-0002A5D5C51B"]

/*
 Bootloader Specifics
*/

#define BOOTLOADER_STATE_OFF          0
#define BOOTLOADER_STATE_INITIATED    1
#define BOOTLOADER_STATE_ON           2

#define FIRMWARE_UPLOAD_STATE_BEGIN           0
#define FIRMWARE_UPLOAD_STATE_END_SUCCESS     1
#define FIRMWARE_UPLOAD_STATE_END_ERROR       -1

#define COMMAND_START_BYTE    0x01
#define COMMAND_END_BYTE      0x17

#define COMMAND_VERIFY_CHECKSUM       0x31
#define COMMAND_GET_FLASH_SIZE        0x32
#define COMMAND_SEND_DATA             0x37
#define COMMAND_ENTER_BOOTLOADER      0x38
#define COMMAND_PROGRAM_ROW           0x39
#define COMMAND_VERIFY_ROW            0x3A
#define COMMAND_EXIT_BOOTLOADER       0x3B

#define BOOTLOADER_CODE_SUCCESS               @"0x00"
#define BOOTLOADER_CODE_ERROR_FILE            @"0x01"
#define BOOTLOADER_CODE_ERROR_EOF             @"0x02"
#define BOOTLOADER_CODE_ERROR_LENGTH          @"0x03"
#define BOOTLOADER_CODE_ERROR_DATA            @"0x04"
#define BOOTLOADER_CODE_ERROR_COMMAND         @"0x05"
#define BOOTLOADER_CODE_ERROR_DEVICE          @"0x06"
#define BOOTLOADER_CODE_ERROR_VERSION         @"0x07"
#define BOOTLOADER_CODE_ERROR_CHECKSUM        @"0x08"
#define BOOTLOADER_CODE_ERROR_ARRAY           @"0x09"
#define BOOTLOADER_CODE_ERROR_ROW             @"0x0A"
#define BOOTLOADER_CODE_ERROR_BOOTLOADER      @"0x0B"
#define BOOTLOADER_CODE_ERROR_APPLICATION     @"0x0C"
#define BOOTLOADER_CODE_ERROR_ACTIVE          @"0x0D"
#define BOOTLOADER_CODE_ERROR_UNKNOWN         @"0x0F"
#define BOOTLOADER_CODE_ERROR_ABORT           @"0xFF"

#define FLASH_ARRAY_ID      @"flashArrayID"
#define FLASH_ROW_NUMBER    @"flashRowNumber"

#define CHECK_SUM   @"checkSum"
#define CRC_16      @"crc_16"
#define ROW_DATA    @"rowData"

/*
 Listing all type-definitions here
*/
typedef void (^ErrorHandler)(NSError *__nullable error);
typedef void (^ArrayHandler)(NSArray *__nonnull array);
typedef void (^DictionaryHandler)(NSDictionary *__nonnull array);

#endif /* Constants_h */
