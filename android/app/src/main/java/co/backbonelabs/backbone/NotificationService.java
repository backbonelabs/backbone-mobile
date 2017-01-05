package co.backbonelabs.backbone;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import co.backbonelabs.backbone.util.Constants;

public class NotificationService extends ReactContextBaseJavaModule {
    private static ReactApplicationContext context;

    /**
     * Public constructor
     * @param reactContext
     */
    public NotificationService(ReactApplicationContext reactContext) {
        super(reactContext);
        NotificationService.context = reactContext;
    }

    @Override
    public String getName() {
        return "NotificationService";
    }

    /**
     * Send a local notification
     * @param title The first text line to be displayed on the local notification
     * @param message The second text line to be displayed on the local notification
     */
    @ReactMethod
    public void sendLocalNotification(String title, String message) {
        sendNotification(Constants.NOTIFICATION_IDS.SLOUCH_NOTIFICATION, title, message);
    }

    /**
     * Posts a notification to be shown in the status bar
     * @param id A unique identifier for the notification. If a notification with the same id
     *           has already been posted and has not yet been canceled, it will be replaced
     *           with the updated information from the new notification.
     * @param title The first line of text in the notification
     */
    public static void sendNotification(int id, String title) {
        sendNotification(id, title, "");
    }

    /**
     * Posts a notification to be shown in the status bar
     * @param id A unique identifier for the notification. If a notification with the same id
     *           has already been posted and has not yet been canceled, it will be replaced
     *           with the updated information from the new notification.
     * @param title The first line of text in the notification
     * @param text The second line of text in the notification
     */
    public static void sendNotification(int id, String title, String text) {
        NotificationCompat.Builder builder = createBuilderTemplate()
                .setContentTitle(title)
                .setContentText(text);

        NotificationManager mNotificationManager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        mNotificationManager.notify(id, builder.build());
    }

    /**
     * Creates builder class for Notification objects that launches the MainActivity.
     * A Notification can be created from the builder class to be passed to a NotificationManager.
     * @return A NotificationCompat.Builder object
     */
    private static NotificationCompat.Builder createBuilderTemplate() {
        long[] vibrationPattern = {0, 500};

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(context)
                .setSmallIcon(R.drawable.ic_stat_notify_logo)
                .setAutoCancel(true)
                .setVibrate(vibrationPattern);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Set background color of the small icon if OS is Lollipop (5.0) or higher
            builder.setColor(Color.rgb(237, 28, 36));
        }

        Intent notificationIntent = new Intent(context, MainActivity.class);
        notificationIntent.setAction(Intent.ACTION_MAIN);
        notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0,
                notificationIntent, 0);

        builder.setContentIntent(pendingIntent);

        return builder;
    }
}
