package co.backbonelabs.backbone.util;

import java.util.UUID;

public class Constants {
    public interface SENSORS {
        String ACCELEROMETER = "ACCELEROMETER";
    }
    public interface ACTIONS {
        String START_POSTURE_FOREGROUND_SERVICE = "co.backbonelabs.backbone.action.startPostureForegroundService";
        String STOP_POSTURE_FOREGROUND_SERVICE = "co.backbonelabs.backbone.action.stopPostureForegroundService";
        String STOP_POSTURE_ACTIVITY = "co.backbonelabs.backbone.action.stopPostureActivity";
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
        UUID BOOTLOADER_SERVICE = UUID.fromString("00060000-F8CE-11E4-ABF4-0002A5D5C51B");
    }

    public interface CHARACTERISTIC_UUIDS {
        UUID ACCELEROMETER_CHARACTERISTIC = UUID.fromString("00010004-0000-1000-8000-805F9B34FB00");
        UUID ENTER_BOOTLOADER_CHARACTERISTIC = UUID.fromString("00010005-0000-1000-8000-805F9B34FB00");
        UUID BOOTLOADER_CHARACTERISTIC = UUID.fromString("00060001-F8CE-11E4-ABF4-0002A5D5C51B");
    }

    public final static int MAX_BLE_ACTION_ATTEMPT = 50;

    public final static String ACTION_SERVICE_FOUND = "com.backbonelabs.backbone.ACTION_SERVICE_FOUND";
    public final static String ACTION_CHARACTERISTIC_FOUND = "com.backbonelabs.backbone.ACTION_CHARACTERISTIC_FOUND";
    public final static String ACTION_CHARACTERISTIC_UPDATE = "com.backbonelabs.backbone.ACTION_CHARACTERISTIC_UPDATE";
    public final static String ACTION_CHARACTERISTIC_WRITE = "com.backbonelabs.backbone.ACTION_CHARACTERISTIC_WRITE";
    public final static String ACTION_BOOTLOADER_UPDATE = "com.backbonelabs.backbone.ACTION_BOOTLOADER_UPDATE";

    public final static String EXTRA_CHARACTERISTIC_UUID = "com.backbonelabs.backbone.EXTRA_CHARACTERISTIC_UUID";
    public final static String EXTRA_BYTE_VALUE = "com.backbonelabs.backbone.EXTRA_BYTE_VALUE";
    public final static String EXTRA_BYTE_UUID_VALUE = "com.backbonelabs.backbone.EXTRA_BYTE_UUID_VALUE";
    public final static String EXTRA_BYTE_INSTANCE_VALUE = "com.backbonelabs.backbone.EXTRA_BYTE_INSTANCE_VALUE";
    public final static String EXTRA_BYTE_SERVICE_UUID_VALUE = "com.backbonelabs.backbone.EXTRA_BYTE_SERVICE_UUID_VALUE";
    public final static String EXTRA_BYTE_SERVICE_INSTANCE_VALUE = "com.backbonelabs.backbone.EXTRA_BYTE_SERVICE_INSTANCE_VALUE";

    public static final String CLIENT_CHARACTERISTIC_CONFIG = "00002902-0000-1000-8000-00805f9b34fb";

    public static final String DEVICE_PREF_ID = "com.backbonelabs.backbone.DEVICE_PREF_ID";
    public static final String USER_PREF_ID = "com.backbonelabs.backbone.USER_PREF_ID";
    public static final String SAVED_DEVICE_PREF_KEY = "com.backbonelabs.backbone.SAVED_DEVICE_PREF_KEY";
}
