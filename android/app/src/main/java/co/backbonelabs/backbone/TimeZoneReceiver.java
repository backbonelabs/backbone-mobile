package co.backbonelabs.backbone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import timber.log.Timber;

// Listen to any changes to the current local timezone and reschedule notifications
public class TimeZoneReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_TIMEZONE_CHANGED)) {
            // Check for any scheduled notifications and proceed with rescheduling
            Timber.d("Time Zone Changed");

            NotificationService.rescheduleNotification(context);
        }
    }
}
