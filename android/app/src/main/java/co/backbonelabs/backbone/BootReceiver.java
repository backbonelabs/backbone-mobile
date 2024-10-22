package co.backbonelabs.backbone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

import timber.log.Timber;

// This class is responsible to listen to the boot events, particularly here is when
// the boot process has been completed, so we can proceed to reschedule notifications when needed
public class BootReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_BOOT_COMPLETED)) {
            // Check for any scheduled notifications and proceed with rescheduling
            Timber.d("Boot Completed");

            NotificationService.rescheduleNotification(context);
        }
    }
}
