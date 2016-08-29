package co.backbonelabs.Backbone.util;

public class Constants {
    public interface SENSOR {
        public static String ACCELEROMETER = "ACCELEROMETER";
    }
    public interface ACTION {
        public static String STARTFOREGROUND_ACTION = "co.backbonelabs.Backbone.action.startForeground";
        public static String STOPFOREGROUND_ACTION = "co.backbonelabs.Backbone.action.stopForeground";
    }
    public interface NOTIFICATION_ID {
        public static int FOREGROUND_SERVICE = 101;
    }
}
