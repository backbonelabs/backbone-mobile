package co.backbonelabs.backbone.util;

import java.util.UUID;

public class Constants {
    public interface SENSORS {
        String ACCELEROMETER = "ACCELEROMETER";
    }

    public interface ACTIONS {
        String START_POSTURE_FOREGROUND_SERVICE = "co.backbonelabs.backbone.intent.action.START_POSTURE_FOREGROUND_SERVICE";
        String STOP_POSTURE_FOREGROUND_SERVICE = "co.backbonelabs.backbone.intent.action.STOP_POSTURE_FOREGROUND_SERVICE";
        String STOP_POSTURE_ACTIVITY = "co.backbonelabs.backbone.intent.action.STOP_POSTURE_ACTIVITY";
    }

    public interface NOTIFICATION_IDS {
        int SLOUCH_NOTIFICATION = 100;
        int FOREGROUND_SERVICE = 101;
    }

    public interface MODULES {
        String POSTURE = "posture";
    }

    public interface EVENTS {
        String ACTIVITY_DISABLED = "ActivityDisabled";
    }

    public interface DEVICE_STATUSES {
        int DISCONNECTED = 0;
        int CONNECTING = 1;
        int CONNECTED = 2;
        int DISCONNECTING = 3;
    }

    public interface DEVICE_MODES {
        int UNKNOWN = 0;
        int BACKBONE = 1;
        int BOOTLOADER = 2;
    }

    public interface SESSION_STATES {
        int STOPPED = 0;
        int RUNNING = 1;
        int PAUSED = 2;
    }

    public interface SESSION_OPERATIONS {
        int START = 0;
        int RESUME = 1;
        int PAUSE = 2;
        int STOP = 3;
    }

    public interface SESSION_COMMANDS {
        int START = 0x00;
        int RESUME = 0x01;
        int PAUSE = 0x02;
        int STOP = 0x03;
    }

    public interface BOOTLOADER_STATES {
        int OFF = 0;
        int INITIATED = 1;
        int ON = 2;
        int UPLOADING = 3;
        int UPDATED = 4;
    }

    public interface BOOTLOADER_COMMANDS {
        int VERIFY_CHECK_SUM = 0x31;
        int GET_FLASH_SIZE = 0x32;
        int ENTER_BOOTLOADER = 0x38;
        int SEND_DATA = 0x37;
        int PROGRAM_ROW = 0x39;
        int VERIFY_ROW = 0x3A;
        int EXIT_BOOTLOADER = 0x3B;
    }

    public interface FIRMWARE_UPDATE_STATES {
        int INVALID_SERVICE = -2;
        int INVALID_FILE = -1;
        int BEGIN = 0;
        int END_SUCCESS = 1;
        int END_ERROR = 2;
    }

    public interface BOOTLOADER_BYTE_TYPES {
        int BYTE_START_CMD = 0;
        int BYTE_CMD_TYPE = 1;
        int BYTE_CMD_DATA_SIZE = 2;
        int BYTE_CMD_DATA_SIZE_SHIFT = 3;
        int BYTE_CHECKSUM = 4;
        int BYTE_CHECKSUM_SHIFT = 5;
        int BYTE_PACKET_END = 6;
        int BYTE_PACKET_END_VER_ROW = 9;
        int BYTE_ARRAY_ID = 4;
        int BYTE_ROW = 5;
        int BYTE_ROW_SHIFT = 6;
        int BYTE_CHECKSUM_VER_ROW = 7;
        int BYTE_CHECKSUM_VER_ROW_SHIFT = 8;
    }

    public interface BOOTLOADER_ERROR_CONSTANTS {
        int CASE_SUCCESS = 0;
        int CASE_ERR_FILE = 1;
        int CASE_ERR_EOF = 2;
        int CASE_ERR_LENGTH = 3;
        int CASE_ERR_DATA = 4;
        int CASE_ERR_CMD = 5;
        int CASE_ERR_DEVICE = 6;
        int CASE_ERR_VERSION = 7;
        int CASE_ERR_CHECKSUM = 8;
        int CASE_ERR_ARRAY = 9;
        int CASE_ERR_ROW = 10;
        int CASE_BTLDR = 11;
        int CASE_ERR_APP = 12;
        int CASE_ERR_ACTIVE = 13;
        int CASE_ERR_UNK = 14;
        int CASE_ABORT = 15;

        String CYRET_ERR_FILE = "CYRET_ERR_FILE";
        String CYRET_ERR_EOF = "CYRET_ERR_EOF";
        String CYRET_ERR_LENGTH = "CYRET_ERR_LENGTH";
        String CYRET_ERR_DATA = "CYRET_ERR_DATA";
        String CYRET_ERR_CMD = "CYRET_ERR_CMD";
        String CYRET_ERR_DEVICE = "CYRET_ERR_DEVICE";
        String CYRET_ERR_VERSION = "CYRET_ERR_VERSION";
        String CYRET_ERR_CHECKSUM = "CYRET_ERR_CHECKSUM";
        String CYRET_ERR_ARRAY = "CYRET_ERR_ARRAY";
        String CYRET_BTLDR = "CYRET_BTLDR";
        String CYRET_ERR_APP = "CYRET_ERR_APP";
        String CYRET_ERR_ACTIVE = "CYRET_ERR_ACTIVE";
        String CYRET_ERR_UNK = "CYRET_ERR_UNK";
        String CYRET_ERR_ROW = "CYRET_ERR_ROW";
        String CYRET_ABORT = "CYRET_ABORT";
    }

    public interface BOOTLOADER_GENERAL_CONSTANTS {
        int PACKET_END = 0x17;
        int MAX_DATA_SIZE = 133;
        int BASE_CMD_SIZE = 0x07;

        int RADIX = 16;
        int ADDITIVE_OP = 8;
        int BYTE_ARRAY_SIZE = 7;

        int RESPONSE_START = 2;
        int RESPONSE_END = 4;

        int STATUS_START = 4;
        int STATUS_END = 6;
        int CHECKSUM_START = 4;
        int CHECKSUM_END = 6;

        int SILICON_ID_START = 8;
        int SILICON_ID_END = 16;
        int SILICON_REV_START = 16;
        int SILICON_REV_END = 18;

        int START_ROW_START = 8;
        int START_ROW_END = 12;
        int END_ROW_START = 12;
        int END_ROW_END = 16;

        int DATA_START = 8;
        int DATA_END = 10;
    }

    public interface SERVICE_UUIDS {
        UUID BACKBONE_SERVICE = UUID.fromString("00010000-0000-1000-8000-00805F9B0421");
        UUID BATTERY_SERVICE = UUID.fromString("0000180F-0000-1000-8000-00805F9B34FB");
        UUID BOOTLOADER_SERVICE = UUID.fromString("00060000-F8CE-11E4-ABF4-0002A5D5C51B");
    }

    public interface CHARACTERISTIC_UUIDS {
        UUID SESSION_CONTROL_CHARACTERISTIC = UUID.fromString("00010001-0000-1000-8000-00805F9B0421");
        UUID MOTOR_CONTROL_CHARACTERISTIC = UUID.fromString("00010002-0000-1000-8000-00805F9B0421");
        UUID SESSION_STATISTIC_CHARACTERISTIC = UUID.fromString("00010003-0000-1000-8000-00805F9B0421");
        UUID SESSION_DATA_CHARACTERISTIC = UUID.fromString("00010004-0000-1000-8000-00805F9B0421");
        UUID ACCELEROMETER_CHARACTERISTIC = UUID.fromString("00010005-0000-1000-8000-00805F9B0421");
        UUID ENTER_BOOTLOADER_CHARACTERISTIC = UUID.fromString("00010006-0000-1000-8000-00805F9B0421");
        UUID FIRMWARE_VERSION_CHARACTERISTIC = UUID.fromString("00010007-0000-1000-8000-00805F9B0421");
        UUID SLOUCH_CHARACTERISTIC = UUID.fromString("00010008-0000-1000-8000-00805F9B0421");
        UUID BATTERY_LEVEL_CHARACTERISTIC = UUID.fromString("00002A19-0000-1000-8000-00805F9B34FB");
        UUID BOOTLOADER_CHARACTERISTIC = UUID.fromString("00060001-F8CE-11E4-ABF4-0002A5D5C51B");
    }

    public interface StringCallBack {
        void onStringCallBack(String str);
    }

    public interface IntCallBack {
        void onIntCallBack(int value);
    }

    public final static int MAX_BLE_ACTION_ATTEMPT = 50;
    public final static int MAX_IDLE_DURATION = 120; // Delay before the app disconnects from the device on an idle situation, in seconds
    public final static int CONNECTION_TIMEOUT = 10; // Device connection timeout, in seconds

    public final static int SESSION_DEFAULT_DURATION = 5; // Session duration in minutes
    public final static int SLOUCH_DEFAULT_DISTANCE_THRESHOLD = 2000; // Distance threshold in ten thousandths of a unit
    public final static int SLOUCH_DEFAULT_TIME_THRESHOLD = 3; // Time threshold in seconds

    public final static int VIBRATION_DEFAULT_PATTERN = 1; // Number of times the motor should vibrate [0-3]
    public final static int VIBRATION_DEFAULT_SPEED = 50; // Speed of motor vibration [0-255]
    public final static int VIBRATION_DEFAULT_DURATION = 50; // Duration of motor vibration in tens of milliseconds [0-255]

    public final static String ACTION_CHARACTERISTIC_FOUND = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_FOUND";
    public final static String ACTION_CHARACTERISTIC_UPDATE = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_UPDATE";
    public final static String ACTION_CHARACTERISTIC_READ = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_READ";
    public final static String ACTION_CHARACTERISTIC_WRITE = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_WRITE";
    public final static String ACTION_DESCRIPTOR_WRITE = "co.backbonelabs.backbone.intent.action.DESCRIPTOR_WRITE";

    public final static String EXTRA_BYTE_VALUE = "co.backbonelabs.backbone.extra.BYTE_VALUE";
    public final static String EXTRA_BYTE_UUID_VALUE = "co.backbonelabs.backbone.extra.BYTE_UUID_VALUE";
    public final static String EXTRA_BYTE_STATUS_VALUE = "co.backbonelabs.backbone.extra.BYTE_STATUS_VALUE";

    public static final String CLIENT_CHARACTERISTIC_CONFIG = "00002902-0000-1000-8000-00805F9B34FB";

    public static final String DEVICE_PREF_ID = "co.backbonelabs.backbone.DEVICE_PREF_ID";
    public static final String USER_PREF_ID = "co.backbonelabs.backbone.USER_PREF_ID";
    public static final String SAVED_DEVICE_PREF_KEY = "co.backbonelabs.backbone.SAVED_DEVICE_PREF_KEY";
}
