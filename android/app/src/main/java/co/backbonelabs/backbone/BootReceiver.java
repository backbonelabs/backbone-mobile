package co.backbonelabs.backbone;

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

public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
            // Check for any scheduled notifications and proceed with rescheduling
            Timber.d("Boot Completed");

            // Types of notification we need check
            int[] notificationTypes = new int[] {
                    Constants.NOTIFICATION_TYPES.INACTIVITY_REMINDER,
                    Constants.NOTIFICATION_TYPES.DAILY_REMINDER,
                    Constants.NOTIFICATION_TYPES.SINGLE_REMINDER
            };

            SharedPreferences preference = context.getSharedPreferences(Constants.NOTIFICATION_PREF_ID, MODE_PRIVATE);

            for (int type : notificationTypes) {
                // Check if the notification of this type has been scheduled
                if (preference.getBoolean(String.format("notification-isScheduled-%d", type), false)) {
                    // Detected scheduled notification, check if we still need to reschedule
                    long fireTimestamp = preference.getInt(String.format("notification-scheduleTimestamp-%d", type), 0);
                    long repeatInterval = preference.getLong(String.format("notification-repeatInterval-%d", type), 0);
                    boolean shouldRepeat = repeatInterval > 0;

                    WritableMap notificationParam = Arguments.createMap();
                    notificationParam.putInt("notificationType", type);

                    Calendar currentCalendar = Calendar.getInstance();

                    if (!shouldRepeat) {
                        // Non-repeated timers should only be rescheduled when the scheduled time is in the future
                        if (fireTimestamp >= currentCalendar.getTimeInMillis()) {
                            Timber.d("Reschedule Notification: %d", type);
                            notificationParam.putDouble("scheduleTimestamp", fireTimestamp);
                            NotificationService.scheduleNotification(context, notificationParam);
                        }
                    }
                    else {
                        // If the previous scheduled timestamp is in the past,
                        // skip to the next timestamp
                        while (fireTimestamp < currentCalendar.getTimeInMillis()) {
                            fireTimestamp += repeatInterval;
                        }

                        Timber.d("Reschedule Notification: %d", type);
                        notificationParam.putDouble("scheduleTimestamp", fireTimestamp);
                        NotificationService.scheduleNotification(context, notificationParam);
                    }
                }
            }
        }
    }
}
