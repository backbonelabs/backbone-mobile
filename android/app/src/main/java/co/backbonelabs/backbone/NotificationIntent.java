package co.backbonelabs.backbone;

import android.app.Notification;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import java.util.Calendar;

import co.backbonelabs.backbone.util.Constants;
import timber.log.Timber;

import static android.content.Context.MODE_PRIVATE;

// This class is responsible to process whatever we need to do when the alarm's invoked,
// which includes firing the notification and repeating it if required
public class NotificationIntent extends BroadcastReceiver {
    public void onReceive(Context context, Intent intent) {
        // Get the registered notification and fire it
        NotificationManager notificationManager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);

        Notification notification = intent.getParcelableExtra(Constants.EXTRA_NOTIFICATION);
        int type = intent.getIntExtra(Constants.EXTRA_NOTIFICATION_ID, 0);
        notificationManager.notify(type, notification);

        Timber.d("Notification Alarm: %d", type);

        // Reschedule the timer if it needs to be repeated
        SharedPreferences preference = context.getSharedPreferences(Constants.NOTIFICATION_PREF_ID, MODE_PRIVATE);
        long fireTimestamp = preference.getLong(String.format("notification-scheduledTimestamp-%d", type), 0);
        long repeatInterval = preference.getLong(String.format("notification-repeatInterval-%d", type), 0);
        boolean shouldRepeat = repeatInterval > 0;

        if (shouldRepeat) {
            // If the previous scheduled timestamp is in the past,
            // skip to the next timestamp
            Calendar currentCalendar = Calendar.getInstance();
            while (fireTimestamp < currentCalendar.getTimeInMillis()) {
                fireTimestamp += repeatInterval;
            }

            // Reschedule the notification by overriding the timestamp.
            // This ensure that the next fire time is set based on the specified repeat interval
            WritableMap notificationParam = Arguments.createMap();
            notificationParam.putInt("notificationType", type);
            notificationParam.putDouble("scheduledTimestamp", fireTimestamp);

            Timber.d("Repeat Notification: %d %d %d", type, repeatInterval, fireTimestamp);
            NotificationService.scheduleNotification(context, notificationParam);
        }
    }
}
