package co.backbonelabs.backbone;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.os.IBinder;
import android.support.annotation.Nullable;
import android.util.Log;

import co.backbonelabs.backbone.util.Constants;

public class ForegroundService extends Service {
    private static final String TAG = "ForegroundService";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Determine which action to process
        switch (intent.getAction()) {
            case Constants.ACTIONS.START_POSTURE_FOREGROUND_SERVICE:
                Log.d(TAG, "Received start posture foreground intent");
                // Create an intent to launch the app
                Intent notificationIntent = new Intent(this, MainActivity.class);
                notificationIntent.setAction(Intent.ACTION_MAIN);
                notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
                notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

                // Create a pending intent for the intent to launch the app
                PendingIntent launchApp = PendingIntent.getActivity(this, 0, notificationIntent, 0);

                // Create an intent to stop the posture activity
                Intent stopIntent = new Intent(this, ForegroundService.class);
                stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_ACTIVITY);

                // Create a pending intent for the intent to stop the posture activity
                PendingIntent stopPostureActivity = launchApp.getService(this, 0, stopIntent, 0);

                // Create a notification with the two intents
                Notification notification = new Notification.Builder(this)
                        .setSmallIcon(R.drawable.ic_stat_notify_logo)
                        .setContentTitle("Backbone")
                        .setTicker("Backbone posture monitoring in progress")
                        .setContentText("Posture monitoring in progress")
                        .setContentIntent(launchApp)
                        .setOngoing(true)
                        .addAction(android.R.drawable.ic_lock_power_off, "Stop", stopPostureActivity)
                        .build();

                // Start the foreground service with the notification
                startForeground(Constants.NOTIFICATION_IDS.FOREGROUND_SERVICE, notification);
                break;
            case Constants.ACTIONS.STOP_POSTURE_ACTIVITY:
                Log.d(TAG, "Received stop posture intent");
                // Disable posture activity
                ActivityService.getInstance().disableActivity(Constants.MODULES.POSTURE);

                // No break here because we want to process the next case of stopping the service
            case Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE:
                Log.d(TAG, "Received stop posture foreground intent");
                // Remove service from foreground
                stopForeground(true);

                // Stop service
                stopSelf();
                break;
        }

        // Return START_NOT_STICKY to not have the service automatically
        // restart if the process is killed while the service is running
        return START_NOT_STICKY;
    };

    @Override
    public void onDestroy() {
        super.onDestroy();
        Log.d(TAG, "onDestroy");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
