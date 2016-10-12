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
    private static String TAG = "ForegroundService";

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if (intent.getAction().equals(Constants.ACTIONS.START_POSTURE_FOREGROUND_SERVICE)) {
            Log.i(TAG, "Received start posture foreground intent");
            Intent notificationIntent = new Intent(this, MainActivity.class);
            notificationIntent.setAction(Intent.ACTION_MAIN);
            notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
            notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            PendingIntent pendingIntent = PendingIntent.getActivity(this, 0,
                    notificationIntent, 0);

            Intent stopIntent = new Intent(this, ForegroundService.class);
            stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE);
            PendingIntent stopPendingIntent = pendingIntent.getService(this, 0, stopIntent, 0);

            Notification notification = new Notification.Builder(this)
                    .setSmallIcon(R.drawable.ic_stat_notify_logo)
                    .setContentTitle("Backbone")
                    .setTicker("Backbone posture monitoring in progress")
                    .setContentText("Posture monitoring in progress")
                    .setContentIntent(pendingIntent)
                    .setOngoing(true)
                    .addAction(android.R.drawable.ic_lock_power_off, "Stop", stopPendingIntent)
                    .build();
            startForeground(Constants.NOTIFICATION_IDS.FOREGROUND_SERVICE, notification);
        } else if (intent.getAction().equals(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE)) {
            Log.i(TAG, "Received stop posture foreground intent");
            ActivityService.getInstance().disableActivity(Constants.MODULES.POSTURE);
            stopForeground(true);
            stopSelf();
        }
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
