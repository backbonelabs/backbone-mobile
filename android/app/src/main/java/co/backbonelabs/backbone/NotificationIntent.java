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
import java.util.GregorianCalendar;

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
        int type = intent.getIntExtra(Constants.EXTRA_NOTIFICATION_TYPE, 0);
        notificationManager.notify(type, notification);

        Timber.d("Notification Alarm: %d", type);

        // Reschedule the timer if it needs to be repeated
        SharedPreferences preference = context.getSharedPreferences(Constants.NOTIFICATION_PREFERENCES, MODE_PRIVATE);
        int year = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_YEAR, type), 0);
        int month = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MONTH, type), 0);
        int day = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_DAY, type), 0);
        int hour = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_HOUR, type), 0);
        int minute = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MINUTE, type), 0);
        int second = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_SECOND, type), 0);
        long repeatInterval = preference.getLong(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_REPEAT_INTERVAL, type), 0);
        boolean shouldRepeat = repeatInterval > 0;

        if (shouldRepeat) {
            // If the previous scheduled timestamp is in the past,
            // skip to the next timestamp
            Calendar currentCalendar = GregorianCalendar.getInstance();
            Calendar fireCalendar = GregorianCalendar.getInstance();
            fireCalendar.set(year, month, day, hour, minute, second);
            long fireTimestamp = fireCalendar.getTimeInMillis();

            while (fireTimestamp <= currentCalendar.getTimeInMillis()) {
                fireTimestamp += repeatInterval;
            }

            // Reschedule the notification by overriding the timestamp.
            // This ensure that the next fire time is set based on the specified repeat interval
            WritableMap notificationParam = Arguments.createMap();
            notificationParam.putInt(Constants.NOTIFICATION_PARAMETER_TYPE, type);
            notificationParam.putDouble(Constants.NOTIFICATION_PARAMETER_SCHEDULED_TIMESTAMP, fireTimestamp);

            Timber.d("Repeat Notification: %d %d %d", type, repeatInterval, fireTimestamp);
            NotificationService.scheduleNotification(context, notificationParam);
        }
        else {
            NotificationService.unscheduleNotification(context, type);
        }
    }
}
