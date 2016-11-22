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
    public interface BOOTLOADER_STATE {
        int OFF = 0;
        int INITIATED = 1;
        int ON = 2;
    }

    public interface SERVICE_UUIDS {
        UUID BACKBONE_SERVICE = UUID.fromString("00010000-0000-1000-8000-805F9B34FB00");
        UUID BATTERY_SERVICE = UUID.fromString("0000180F-0000-1000-8000-00805F9B34FB");
        UUID BOOTLOADER_SERVICE = UUID.fromString("00060000-F8CE-11E4-ABF4-0002A5D5C51B");
    }

    public interface CHARACTERISTIC_UUIDS {
        UUID ACCELEROMETER_CHARACTERISTIC = UUID.fromString("00010004-0000-1000-8000-805F9B34FB00");
        UUID ENTER_BOOTLOADER_CHARACTERISTIC = UUID.fromString("00010005-0000-1000-8000-805F9B34FB00");
        UUID FIRMWARE_VERSION_CHARACTERISTIC = UUID.fromString("00010006-0000-1000-8000-805F9B34FB00");
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

    public final static String ACTION_CHARACTERISTIC_FOUND = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_FOUND";
    public final static String ACTION_CHARACTERISTIC_UPDATE = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_UPDATE";
    public final static String ACTION_CHARACTERISTIC_WRITE = "co.backbonelabs.backbone.intent.action.CHARACTERISTIC_WRITE";
    public final static String ACTION_BOOTLOADER_UPDATE = "co.backbonelabs.backbone.intent.action.BOOTLOADER_UPDATE";

    public final static String EXTRA_BYTE_VALUE = "co.backbonelabs.backbone.extra.BYTE_VALUE";
    public final static String EXTRA_BYTE_UUID_VALUE = "co.backbonelabs.backbone.extra.BYTE_UUID_VALUE";
    public final static String EXTRA_BYTE_STATUS_VALUE = "co.backbonelabs.backbone.extra.BYTE_STATUS_VALUE";
    public final static String EXTRA_BYTE_INSTANCE_VALUE = "co.backbonelabs.backbone.extra.BYTE_INSTANCE_VALUE";
    public final static String EXTRA_BYTE_SERVICE_UUID_VALUE = "co.backbonelabs.backbone.extra.BYTE_SERVICE_UUID_VALUE";
    public final static String EXTRA_BYTE_SERVICE_INSTANCE_VALUE = "co.backbonelabs.backbone.extra.BYTE_SERVICE_INSTANCE_VALUE";

    public static final String CLIENT_CHARACTERISTIC_CONFIG = "00002902-0000-1000-8000-00805F9B34FB";

    public static final String DEVICE_PREF_ID = "co.backbonelabs.backbone.DEVICE_PREF_ID";
    public static final String USER_PREF_ID = "co.backbonelabs.backbone.USER_PREF_ID";
    public static final String SAVED_DEVICE_PREF_KEY = "co.backbonelabs.backbone.SAVED_DEVICE_PREF_KEY";
}
