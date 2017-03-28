package co.backbonelabs.backbone;

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

// This class is responsible to listen to the boot events, particularly here is when
// the boot process has been completed, so we can proceed to reschedule notifications when needed
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
                    Constants.NOTIFICATION_TYPES.SINGLE_REMINDER,
                    Constants.NOTIFICATION_TYPES.INFREQUENT_REMINDER
            };

            SharedPreferences preference = context.getSharedPreferences(Constants.NOTIFICATION_PREFERENCES, MODE_PRIVATE);

            for (int type : notificationTypes) {
                // Check if the notification of this type has been scheduled
                if (preference.getBoolean(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_IS_SCHEDULED, type), false)) {
                    // Detected scheduled notification, check if we still need to reschedule
                    long fireTimestamp = preference.getLong(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_TIMESTAMP, type), 0);
                    long repeatInterval = preference.getLong(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_REPEAT_INTERVAL, type), 0);
                    boolean shouldRepeat = repeatInterval > 0;

                    WritableMap notificationParam = Arguments.createMap();
                    notificationParam.putInt(Constants.NOTIFICATION_PARAMETER_TYPE, type);

                    Calendar currentCalendar = GregorianCalendar.getInstance();

                    if (!shouldRepeat) {
                        // Non-repeated timers should only be rescheduled when the scheduled time is in the future
                        if (fireTimestamp >= currentCalendar.getTimeInMillis()) {
                            Timber.d("Reschedule Notification: %d", type);
                            notificationParam.putDouble(Constants.NOTIFICATION_PARAMETER_SCHEDULED_TIMESTAMP, fireTimestamp);
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
                        notificationParam.putDouble(Constants.NOTIFICATION_PARAMETER_SCHEDULED_TIMESTAMP, fireTimestamp);
                        NotificationService.scheduleNotification(context, notificationParam);
                    }
                }
            }
        }
    }
}
