package co.backbonelabs.backbone.util;

public class Constants {
    public interface SENSORS {
        String ACCELEROMETER = "ACCELEROMETER";
    }
    public interface ACTIONS {
        String START_POSTURE_FOREGROUND_SERVICE = "co.backbonelabs.backbone.action.startPostureForegroundService";
        String STOP_POSTURE_FOREGROUND_SERVICE = "co.backbonelabs.backbone.action.stopPostureForegroundService";
    }
    public interface NOTIFICATION_IDS {
        int FOREGROUND_SERVICE = 101;
    }
    public interface MODULES {
        String POSTURE = "posture";
    }
}
