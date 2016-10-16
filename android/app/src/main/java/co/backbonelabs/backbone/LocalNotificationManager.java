package co.backbonelabs.backbone;

import android.content.Context;
import android.os.Handler;
import android.util.Log;

import java.util.HashMap;

public class LocalNotificationManager {
    private static Context mContext;
    private static final String TAG = "LocalNotificationMgr";

    private static HashMap<String, Runnable> scheduledNotifications;

    private static final Integer STEP_NOTIFICATION_ID = 0x100;
    private static final Integer STEP_NOTIFICATION_PERIOD = 5; // in 'Minute'

    private static Handler notificationHandler;

    public LocalNotificationManager(Context context) {
        mContext = context;
        notificationHandler = new Handler();
        scheduledNotifications = new HashMap<String, Runnable>();
    }

    /**
     * Schedule local notifications based on the moduleName
     * @param moduleName Name of the ActivityModule set as userInfo in the notification
     */
    public static void scheduleNotification(String moduleName) {
        if (moduleName.equals("step")) {
            Runnable idleNotificationRunnable = new Runnable() {
                public void run() {
                    Log.d(TAG, "Idle TimeOut Notification");
                    NotificationService.sendNotification(STEP_NOTIFICATION_ID, "Go and take a walk!");
                    notificationHandler.postDelayed(this, STEP_NOTIFICATION_PERIOD * 1000 * 60);
                }
            };

            scheduledNotifications.put(moduleName, idleNotificationRunnable);
            notificationHandler.postDelayed(idleNotificationRunnable, STEP_NOTIFICATION_PERIOD * 1000 * 60);
        }
    }

    /**
     * Check for any scheduled notification with the following moduleName set as userInfo
     * @param moduleName Name of the ActivityModule set as userInfo in the notification
     * @return A boolean indicating whether any scheduled notification matching the criteria exists
     */
    public static boolean hasScheduledNotification(String moduleName) {
        return scheduledNotifications.containsKey(moduleName);
    }

    /**
     * Cancel all scheduled notification with the following moduleName set as userInfo
     * @param moduleName Name of the ActivityModule set as userInfo in the notification
     */
    public static void cancelScheduledNotification(String moduleName) {
        if (hasScheduledNotification(moduleName)) {
            notificationHandler.removeCallbacks(scheduledNotifications.get(moduleName));
            scheduledNotifications.remove(moduleName);
        }
    }
}
