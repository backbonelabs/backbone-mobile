package co.backbonelabs.backbone.util;

public class Constants {
    public interface SENSOR {
        public static String ACCELEROMETER = "ACCELEROMETER";
    }
    public interface ACTION {
        public static String STARTFOREGROUND_ACTION = "co.backbonelabs.backbone.action.startForeground";
        public static String STOPFOREGROUND_ACTION = "co.backbonelabs.backbone.action.stopForeground";
    }
    public interface NOTIFICATION_ID {
        public static int FOREGROUND_SERVICE = 101;
    }
}
