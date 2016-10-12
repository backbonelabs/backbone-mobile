package co.backbonelabs.backbone;

import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.support.v4.app.NotificationCompat;

public class NotificationService {
    private static Context mContext;

    public NotificationService(Context context) {
        mContext = context;
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
        NotificationCompat.Builder mBuilder = createBuilderTemplate()
                .setContentTitle(title)
                .setContentText(text);

        NotificationManager mNotificationManager =
                (NotificationManager) mContext.getSystemService(Context.NOTIFICATION_SERVICE);
        mNotificationManager.notify(id, mBuilder.build());
    }

    /**
     * Creates builder class for Notification objects that launches the MainActivity.
     * A Notification can be created from the builder class to be passed to a NotificationManager.
     * @return A NotificationCompat.Builder object
     */
    private static NotificationCompat.Builder createBuilderTemplate() {
        long[] vibrationPattern = {0, 500};

        NotificationCompat.Builder mBuilder =
                new NotificationCompat.Builder(mContext)
                .setSmallIcon(R.drawable.ic_stat_notify_logo)
                .setAutoCancel(true)
                .setVibrate(vibrationPattern);

        Intent notificationIntent = new Intent(mContext, MainActivity.class);
        notificationIntent.setAction(Intent.ACTION_MAIN);
        notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        PendingIntent pendingIntent = PendingIntent.getActivity(mContext, 0,
                notificationIntent, 0);

        mBuilder.setContentIntent(pendingIntent);

        return mBuilder;
    }
}
