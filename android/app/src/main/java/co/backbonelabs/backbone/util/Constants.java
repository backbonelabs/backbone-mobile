package co.backbonelabs.backbone.util;

public class Constants {
    public interface SENSORS {
        String ACCELEROMETER = "ACCELEROMETER";
        String BMI160ACCELEROMETER = "BMI160ACCELEROMETER";
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
        String STEP = "step";
    }
    public interface EVENTS {
        String ACTIVITY_DISABLED = "ActivityDisabled";
    }
}
