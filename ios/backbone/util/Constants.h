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

#define MAX_IDLE_DURATION 120 // Delay before the app disconnects from the device on an idle situation, in seconds
#define CONNECTION_TIMEOUT 10 // Timeout for connection attempts, in seconds

// Change this value if you want to test it faster. Both values are now in 'minute'
#define NOTIFICATION_PERIOD   5
#define NOTIFICATION_CYCLE    60

#define EVENT_ACTIVITY_DISABLED   "ActivityDisabled"

#define PREF_SAVED_DEVICE_KEY @"co.backbonelabs.backbone.PREF_SAVED_DEVICE_KEY"

/*
 Services and Characteristics UUID
 */

#define DEVICE_MODE_UNKNOWN       0
#define DEVICE_MODE_BACKBONE      1
#define DEVICE_MODE_BOOTLOADER    2

#define BACKBONE_SERVICE_UUID                     [CBUUID UUIDWithString:@"00010000-0000-1000-8000-00805F9B0421"]
#define BATTERY_SERVICE_UUID                      [CBUUID UUIDWithString:@"180F"]
#define BOOTLOADER_SERVICE_UUID                   [CBUUID UUIDWithString:@"00060000-F8CE-11E4-ABF4-0002A5D5C51B"]

#define SESSION_CONTROL_CHARACTERISTIC_UUID       [CBUUID UUIDWithString:@"00010001-0000-1000-8000-00805F9B0421"]
#define VIBRATION_MOTOR_CHARACTERISTIC_UUID         [CBUUID UUIDWithString:@"00010002-0000-1000-8000-00805F9B0421"]
#define SESSION_STATISTIC_CHARACTERISTIC_UUID     [CBUUID UUIDWithString:@"00010003-0000-1000-8000-00805F9B0421"]
#define SESSION_DATA_CHARACTERISTIC_UUID          [CBUUID UUIDWithString:@"00010004-0000-1000-8000-00805F9B0421"]
#define ACCELEROMETER_CHARACTERISTIC_UUID         [CBUUID UUIDWithString:@"00010005-0000-1000-8000-00805F9B0421"]
#define ENTER_BOOTLOADER_CHARACTERISTIC_UUID      [CBUUID UUIDWithString:@"00010006-0000-1000-8000-00805F9B0421"]
#define FIRMWARE_VERSION_CHARACTERISTIC_UUID      [CBUUID UUIDWithString:@"00010007-0000-1000-8000-00805F9B0421"]
#define SLOUCH_CHARACTERISTIC_UUID                [CBUUID UUIDWithString:@"00010008-0000-1000-8000-00805F9B0421"]
#define BATTERY_LEVEL_CHARACTERISTIC_UUID         [CBUUID UUIDWithString:@"2A19"]
#define BOOTLOADER_CHARACTERISTIC_UUID            [CBUUID UUIDWithString:@"00060001-F8CE-11E4-ABF4-0002A5D5C51B"]

#define CLIENT_CHARACTERISTIC_CONFIG_UUID         [CBUUID UUIDWithString:@"00002902-0000-1000-8000-00805f9b34fb"]

/*
 Notification Specifics
 */

#define NOTIFICATION_TYPE_SLOUCH_WARNING        100
#define NOTIFICATION_TYPE_FOREGROUND_SERVICE    101
#define NOTIFICATION_TYPE_INACTIVITY_REMINDER   102
#define NOTIFICATION_TYPE_DAILY_REMINDER        103
#define NOTIFICATION_TYPE_SINGLE_REMINDER       104
#define NOTIFICATION_TYPE_INFREQUENT_REMINDER   105

#define NOTIFICATION_INITIAL_DELAY_DAILY_REMINDER         24 * 60 * 60 // 1-day delay
#define NOTIFICATION_INITIAL_DELAY_INFREQUENT_REMINDER    2 * 24 * 60 * 60 // 2-days delay

/*
 Vibration Motor Specifics
 */

#define VIBRATION_COMMAND_STOP              0
#define VIBRATION_COMMAND_START             1

#define VIBRATION_DEFAULT_PATTERN     1 // Number of times the motor should vibrate [0-3]
#define VIBRATION_DEFAULT_SPEED       50 // Speed of motor vibration [0-255]
#define VIBRATION_DEFAULT_DURATION    50 // Duration of motor vibration in tens of milliseconds [0-255]

/*
 Session Specifics
 */

#define SESSION_STATE_STOPPED     0
#define SESSION_STATE_RUNNING     1
#define SESSION_STATE_PAUSED      2

#define SESSION_OPERATION_START   0
#define SESSION_OPERATION_RESUME  1
#define SESSION_OPERATION_PAUSE   2
#define SESSION_OPERATION_STOP    3

#define SESSION_COMMAND_START     0x00
#define SESSION_COMMAND_RESUME    0x01
#define SESSION_COMMAND_PAUSE     0x02
#define SESSION_COMMAND_STOP      0x03

#define SESSION_DEFAULT_DURATION          5 // Session duration in minutes
#define SLOUCH_DEFAULT_DISTANCE_THRESHOLD 2000 // Distance threshold in ten thousandths of a unit
#define SLOUCH_DEFAULT_TIME_THRESHOLD     3 // Time threshold in seconds

/*
 Bootloader Specifics
 */

#define BOOTLOADER_STATE_OFF          0
#define BOOTLOADER_STATE_INITIATED    1
#define BOOTLOADER_STATE_ON           2
#define BOOTLOADER_STATE_UPLOADING    3
#define BOOTLOADER_STATE_UPDATED      4

#define FIRMWARE_UPDATE_STATE_INVALID_SERVICE       -2
#define FIRMWARE_UPDATE_STATE_INVALID_FILE          -1
#define FIRMWARE_UPDATE_STATE_BEGIN                 0
#define FIRMWARE_UPDATE_STATE_END_SUCCESS           1
#define FIRMWARE_UPDATE_STATE_END_ERROR             2

#define FIRMWARE_UPDATE_ERROR_COMMAND_RESULT    300
#define FIRMWARE_UPDATE_ERROR_COMMAND_VERIFY    301
#define FIRMWARE_UPDATE_ERROR_UPDATE_VALUE      302
#define FIRMWARE_UPDATE_ERROR_WRITE_VALUE       303
#define FIRMWARE_UPDATE_ERROR_ROW_NUMBER        304

#define COMMAND_START_BYTE    0x01
#define COMMAND_END_BYTE      0x17

#define COMMAND_VERIFY_CHECKSUM       0x31 // 49
#define COMMAND_GET_FLASH_SIZE        0x32 // 50
#define COMMAND_SEND_DATA             0x37 // 55
#define COMMAND_ENTER_BOOTLOADER      0x38 // 56
#define COMMAND_PROGRAM_ROW           0x39 // 57
#define COMMAND_VERIFY_ROW            0x3A // 58
#define COMMAND_EXIT_BOOTLOADER       0x3B // 59

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
typedef void (^StringHandler)(NSString *__nonnull str);
typedef void (^IntHandler)(int value);
typedef void (^DictionaryHandler)(NSDictionary *__nonnull dict);

#endif /* Constants_h */
