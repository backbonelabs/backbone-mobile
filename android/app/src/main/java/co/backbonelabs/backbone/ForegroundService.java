package co.backbonelabs.backbone;

import android.app.Notification;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;
import android.os.IBinder;
import android.support.annotation.Nullable;

import com.facebook.react.bridge.Callback;

import co.backbonelabs.backbone.util.Constants;
import timber.log.Timber;

public class ForegroundService extends Service {
    private static boolean hasPendingForegroundOperation = false;

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        // Determine which action to process
        switch (intent.getAction()) {
            case Constants.ACTIONS.START_POSTURE_FOREGROUND_SERVICE:
                Timber.d("Received start posture foreground intent");
                buildPostureNotification((SessionControlService.getInstance().getCurrentSessionState() == Constants.SESSION_STATES.RUNNING ? Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY : Constants.ACTIONS.RESUME_POSTURE_ACTIVITY));
                break;
            case Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY:
                if (!hasPendingForegroundOperation) {
                    hasPendingForegroundOperation = true;

                    SessionControlService.getInstance().pause(new Callback() {
                        @Override
                        public void invoke(Object... args) {
                            Timber.d("Invoke Pause");
                            if (args == null || args.length == 0) {
                                Timber.d("Pause Success");
                                buildPostureNotification(Constants.ACTIONS.RESUME_POSTURE_ACTIVITY);
                                SessionControlService.getInstance().emitSessionControlEvent(Constants.SESSION_OPERATIONS.PAUSE);
                            }

                            hasPendingForegroundOperation = false;
                        }
                    });
                }
                break;
            case Constants.ACTIONS.RESUME_POSTURE_ACTIVITY:
                if (!hasPendingForegroundOperation) {
                    hasPendingForegroundOperation = true;

                    SessionControlService.getInstance().resume(null, new Callback() {
                        @Override
                        public void invoke(Object... args) {
                            Timber.d("Invoke Resume");
                            if (args == null || args.length == 0) {
                                Timber.d("Resume Success");
                                buildPostureNotification(Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY);
                                SessionControlService.getInstance().emitSessionControlEvent(Constants.SESSION_OPERATIONS.RESUME);
                            }

                            hasPendingForegroundOperation = false;
                        }
                    });
                }
                break;
            case Constants.ACTIONS.STOP_POSTURE_ACTIVITY:
                Timber.d("Received stop posture intent");
                if (!hasPendingForegroundOperation) {
                    hasPendingForegroundOperation = true;

                    SessionControlService.getInstance().stop(new Callback() {
                        @Override
                        public void invoke(Object... args) {
                            if (args == null || args.length == 0) {
                                // Stop service and cleanup
                                stopForeground(true);
                                stopSelf();
                            }

                            hasPendingForegroundOperation = false;
                        }
                    });
                }

                break;
            case Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE:
                Timber.d("Received stop posture foreground intent");
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

    private void buildPostureNotification(String action) {
        // Create an intent to launch the app
        Intent notificationIntent = new Intent(this, MainActivity.class);
        notificationIntent.setAction(Intent.ACTION_MAIN);
        notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        // Create a pending intent for the intent to launch the app
        PendingIntent launchApp = PendingIntent.getActivity(this, 0, notificationIntent, 0);

        // Create an intent to pause/resume the posture activity
        Intent toggleIntent = new Intent(this, ForegroundService.class);
        toggleIntent.setAction(action);

        // Create an intent to stop the posture activity
        Intent stopIntent = new Intent(this, ForegroundService.class);
        stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_ACTIVITY);

        // Create pending intents for the foreground intent to pause/resume as well as to stop the posture activity
        PendingIntent togglePostureActivity = launchApp.getService(this, 0, toggleIntent, 0);
        PendingIntent stopPostureActivity = launchApp.getService(this, 0, stopIntent, 0);

        // Create a notification with the two intents
        Notification.Builder notificationBuilder = new Notification.Builder(this)
                .setSmallIcon(R.drawable.ic_stat_notify_logo)
                .setContentTitle("Backbone")
                .setTicker("Backbone posture monitoring " + (action == Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY ? "in progress" : "is paused"))
                .setContentText("Posture monitoring " + (action == Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY ? "in progress" : "is paused"))
                .setContentIntent(launchApp)
                .setOngoing(true)
                .addAction((action == Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY ? android.R.drawable.ic_media_pause : android.R.drawable.ic_media_play),
                        (action == Constants.ACTIONS.PAUSE_POSTURE_ACTIVITY ? "Pause" : "Resume"), togglePostureActivity)
                .addAction(android.R.drawable.ic_lock_power_off, "Stop", stopPostureActivity);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Set background color of the small icon if OS is Lollipop (5.0) or higher
            notificationBuilder.setColor(Color.rgb(237, 28, 36));
        }
        Notification notification = notificationBuilder.build();

        // Start the foreground service with the notification
        startForeground(Constants.NOTIFICATION_TYPES.FOREGROUND_SERVICE, notification);
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        Timber.d("onDestroy");
    }

    @Nullable
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}
