package co.backbonelabs.backbone;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.os.Build;
import android.support.v4.app.NotificationCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.util.Calendar;
import java.util.GregorianCalendar;

import co.backbonelabs.backbone.util.Constants;
import timber.log.Timber;

import static android.content.Context.MODE_PRIVATE;

public class NotificationService extends ReactContextBaseJavaModule {
    private static ReactApplicationContext context;

    /**
     * Public constructor
     * @param reactContext
     */
    public NotificationService(ReactApplicationContext reactContext) {
        super(reactContext);
        NotificationService.context = reactContext;
    }

    @Override
    public String getName() {
        return "NotificationService";
    }

    /**
     * Send a local notification
     * @param title The first text line to be displayed on the local notification
     * @param message The second text line to be displayed on the local notification
     */
    @ReactMethod
    public void sendLocalNotification(String title, String message) {
        sendNotification(Constants.NOTIFICATION_TYPES.SLOUCH_WARNING, title, message);
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
        NotificationCompat.Builder builder = createBuilderTemplate(context)
                .setContentTitle(title)
                .setContentText(text);

        NotificationManager mNotificationManager =
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        mNotificationManager.notify(id, builder.build());
    }

    /**
     * Schedule a notification to be shown in the status bar based on the React Context
     * @param notificationParam Notification parameters
     */
    @ReactMethod
    public static void scheduleNotification(ReadableMap notificationParam) {
        scheduleNotification(context, notificationParam);
    }

    /**
     * Schedule a notification to be shown in the status bar.
     * To be used by boot-event listeners to pass the temporary context instead of the React Context
     * @param context Current context to be used for various initializations
     * @param notificationParam Notification parameters
     */
    public static void scheduleNotification(Context context, ReadableMap notificationParam) {
        int type;
        String title = "";
        String text = "";

        type = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_TYPE);
        Timber.d("Schedule Notification: %d", type);

        switch (type) {
            case Constants.NOTIFICATION_TYPES.INFREQUENT_REMINDER:
                title = "Are you alive?";
                text = "We miss you already!";
                break;
            case Constants.NOTIFICATION_TYPES.DAILY_REMINDER:
                title = "It's time!";
                text = "It's that time of the day again! Brace yourself!";
                break;
            case Constants.NOTIFICATION_TYPES.SINGLE_REMINDER:
                title = "It's time!";
                text = "It's that time of the day again! Brace yourself!";
                break;
        }

        // Invalid notification type, exit the function
        if (title.isEmpty()) return;

        NotificationCompat.Builder builder = createBuilderTemplate(context)
                .setContentTitle(title)
                .setContentText(text);

        Notification notification = builder.build();
        Intent notificationIntent = new Intent(context, NotificationIntent.class);
        notificationIntent.putExtra(Constants.EXTRA_NOTIFICATION_TYPE, type);
        notificationIntent.putExtra(Constants.EXTRA_NOTIFICATION, notification);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, type, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);

        // Define the user-defined time for the notification
        int year = -1, month = 1, day = 1;
        int hour = -1, minute = 0, second = 0;
        long initialDelay = 0;
        long repeatInterval = AlarmManager.INTERVAL_DAY;

        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_YEAR)) {
            year = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_SCHEDULED_YEAR);
        }

        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_MONTH)) {
            month = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_SCHEDULED_MONTH);
        }

        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_DAY)) {
            day = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_SCHEDULED_DAY);
        }

        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_HOUR)) {
            hour = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_SCHEDULED_HOUR);
        }

        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_MINUTE)) {
            minute = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_SCHEDULED_MINUTE);
        }

        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_SECOND)) {
            second = notificationParam.getInt(Constants.NOTIFICATION_PARAMETER_SCHEDULED_SECOND);
        }

        // Specifically request for a Gregorian Calendar format
        Calendar nextFireCalendar = GregorianCalendar.getInstance();
        Calendar currentCalendar = GregorianCalendar.getInstance();

        // Only set the user-defined time when available.
        // Otherwise use the current time components
        if (year != -1) {
            nextFireCalendar.set(Calendar.YEAR, year);
            nextFireCalendar.set(Calendar.MONTH, month - 1); // Month in the API is set from 0-11
            nextFireCalendar.set(Calendar.DAY_OF_MONTH, day);
        }

        if (hour != -1) {
            nextFireCalendar.set(Calendar.HOUR_OF_DAY, hour);
            nextFireCalendar.set(Calendar.MINUTE, minute);
            nextFireCalendar.set(Calendar.SECOND, second);
        }

        switch (type) {
            case Constants.NOTIFICATION_TYPES.INFREQUENT_REMINDER:
                // Always use the current time
                nextFireCalendar = GregorianCalendar.getInstance();
                initialDelay = Constants.NOTIFICATION_INITIAL_DELAYS.INFREQUENT_REMINDER;
                repeatInterval = Constants.NOTIFICATION_REPEAT_INTERVAL.INFREQUENT_REMINDER;
                break;
            case Constants.NOTIFICATION_TYPES.DAILY_REMINDER:
                // Set the initial delay only if it is on the next day
                if (currentCalendar.getTimeInMillis() < nextFireCalendar.getTimeInMillis()) {
                    initialDelay = 0;
                }
                else {
                    initialDelay = Constants.NOTIFICATION_INITIAL_DELAYS.DAILY_REMINDER;
                }
                repeatInterval = Constants.NOTIFICATION_REPEAT_INTERVAL.DAILY_REMINDER;
                break;
            case Constants.NOTIFICATION_TYPES.SINGLE_REMINDER:
                initialDelay = 0;
                repeatInterval = 0;
                break;
        }

        long fireTimestamp = nextFireCalendar.getTimeInMillis() + initialDelay;

        // This should not be sent by the React side.
        // Used only on rescheduling by the boot listener and notification repeater
        if (notificationParam.hasKey(Constants.NOTIFICATION_PARAMETER_SCHEDULED_TIMESTAMP)) {
            fireTimestamp = (long)notificationParam.getDouble(Constants.NOTIFICATION_PARAMETER_SCHEDULED_TIMESTAMP);
            Timber.d("Override initial %d", fireTimestamp);
        }

        // Schedule the notification based on the specified time above.
        // Starting from KITKAT (SDK-19), due to the Android SDK limitation,
        // there's no direct API to schedule repeated alarms without
        // sacrificing precision (timers might not fire at the exact chosen time).
        // Thus, we can only schedule a one time alarm, and reschedule again if needed
        AlarmManager alarmManager = (AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            alarmManager.setExact(AlarmManager.RTC_WAKEUP, fireTimestamp, pendingIntent);
        }
        else {
            alarmManager.set(AlarmManager.RTC_WAKEUP, fireTimestamp, pendingIntent);
        }

        // Save the notification settings to the system preference for future references
        SharedPreferences preference = context.getSharedPreferences(Constants.NOTIFICATION_PREFERENCES, MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();

        // Store the exact date parts instead of timestamp to handle changes in timezone
        // in order to have the notification fires at the exact same time as originally scheduled
        // on the local time
        Calendar nextDate = GregorianCalendar.getInstance();
        nextDate.setTimeInMillis(fireTimestamp);

        editor.putBoolean(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_IS_SCHEDULED, type), true);
        editor.putInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_YEAR, type), nextDate.get(Calendar.YEAR));
        editor.putInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MONTH, type), nextDate.get(Calendar.MONTH));
        editor.putInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_DAY, type), nextDate.get(Calendar.DAY_OF_MONTH));
        editor.putInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_HOUR, type), nextDate.get(Calendar.HOUR_OF_DAY));
        editor.putInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MINUTE, type), nextDate.get(Calendar.MINUTE));
        editor.putInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_SECOND, type), nextDate.get(Calendar.SECOND));
        editor.putLong(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_REPEAT_INTERVAL, type), repeatInterval);

        editor.commit();

        // Tell the system to allow our app to be alive for a brief period on device boot-up
        ComponentName receiver = new ComponentName(context, BootReceiver.class);
        PackageManager pm = context.getPackageManager();
        pm.setComponentEnabledSetting(receiver, PackageManager.COMPONENT_ENABLED_STATE_ENABLED, PackageManager.DONT_KILL_APP);
    }

    /**
     * Unschedule a scheduled notification
     * @param type Type of the notification to be unscheduled.
     */
    @ReactMethod
    public static void unscheduleNotification(int type) {
        unscheduleNotification(context, type);
    }

    /**
     * Unschedule a scheduled notification
     * To be used by boot-event listeners to pass the temporary context instead of the React Context
     * @param context Current context to be used for various initializations
     * @param type Type of the notification to be unscheduled
     */
    public static void unscheduleNotification(Context context, int type) {
        Timber.d("Unschedule Notification: %d", type);
        // Clear the notification setting from the system preference
        SharedPreferences preference = context.getSharedPreferences(Constants.NOTIFICATION_PREFERENCES, MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();

        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_IS_SCHEDULED, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_YEAR, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MONTH, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_DAY, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_HOUR, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MINUTE, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_SECOND, type));
        editor.remove(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_REPEAT_INTERVAL, type));

        editor.commit();

        // Retrieve the correct notification and unschedule it
        AlarmManager alarmManager = (AlarmManager)context.getSystemService(Context.ALARM_SERVICE);
        Intent notificationIntent = new Intent(context, NotificationIntent.class);
        PendingIntent pendingIntent = PendingIntent.getBroadcast(context, type, notificationIntent, PendingIntent.FLAG_UPDATE_CURRENT);
        alarmManager.cancel(pendingIntent);

        // Types of notification we need check
        int[] notificationTypes = new int[] {
                Constants.NOTIFICATION_TYPES.INACTIVITY_REMINDER,
                Constants.NOTIFICATION_TYPES.DAILY_REMINDER,
                Constants.NOTIFICATION_TYPES.SINGLE_REMINDER,
                Constants.NOTIFICATION_TYPES.INFREQUENT_REMINDER
        };

        boolean shouldDisableBootEvents = true;

        for (int notifType : notificationTypes) {
            // Check if we still have any scheduled notifications
            if (preference.getBoolean(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_IS_SCHEDULED, notifType), false)) {
                shouldDisableBootEvents = false;
                break;
            }
        }

        if (shouldDisableBootEvents) {
            // When we no longer need to check for notifications on device boot-up,
            // tell the system to revoke our right to be kept alive on boot-up
            ComponentName receiver = new ComponentName(context, BootReceiver.class);
            PackageManager pm = context.getPackageManager();
            pm.setComponentEnabledSetting(receiver, PackageManager.COMPONENT_ENABLED_STATE_DISABLED, PackageManager.DONT_KILL_APP);
        }
    }

    /**
     * Reschedule notifications called by certain events including boot process and timezone changes
     * @param context Current context to be used for various initializations
     */
    public static void rescheduleNotification(Context context) {
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
                int year = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_YEAR, type), 0);
                int month = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MONTH, type), 0);
                int day = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_DAY, type), 0);
                int hour = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_HOUR, type), 0);
                int minute = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_MINUTE, type), 0);
                int second = preference.getInt(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_SECOND, type), 0);
                long repeatInterval = preference.getLong(String.format("%s%d", Constants.NOTIFICATION_PREFERENCE_FORMAT_REPEAT_INTERVAL, type), 0);
                boolean shouldRepeat = repeatInterval > 0;

                WritableMap notificationParam = Arguments.createMap();
                notificationParam.putInt(Constants.NOTIFICATION_PARAMETER_TYPE, type);

                Calendar currentCalendar = GregorianCalendar.getInstance();
                Calendar fireCalendar = GregorianCalendar.getInstance();
                fireCalendar.set(year, month, day, hour, minute, second);
                long fireTimestamp = fireCalendar.getTimeInMillis();

                if (!shouldRepeat) {
                    // Non-repeated timers should only be rescheduled when
                    // the scheduled time is in the future, otherwise clean it up.
                    if (fireTimestamp >= currentCalendar.getTimeInMillis()) {
                        Timber.d("Reschedule Notification: %d", type);
                        notificationParam.putDouble(Constants.NOTIFICATION_PARAMETER_SCHEDULED_TIMESTAMP, fireTimestamp);
                        NotificationService.scheduleNotification(context, notificationParam);
                    }
                    else {
                        NotificationService.unscheduleNotification(context, type);
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

    /**
     * Creates builder class for Notification objects that launches the MainActivity.
     * A Notification can be created from the builder class to be passed to a NotificationManager.
     * @return A NotificationCompat.Builder object
     */
    private static NotificationCompat.Builder createBuilderTemplate(Context context) {
        long[] vibrationPattern = {0, 500};

        NotificationCompat.Builder builder =
                new NotificationCompat.Builder(context)
                .setSmallIcon(R.drawable.ic_stat_notify_logo)
                .setAutoCancel(true)
                .setVibrate(vibrationPattern);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            // Set background color of the small icon if OS is Lollipop (5.0) or higher
            builder.setColor(Color.rgb(237, 28, 36));
        }

        Intent notificationIntent = new Intent(context, MainActivity.class);
        notificationIntent.setAction(Intent.ACTION_MAIN);
        notificationIntent.addCategory(Intent.CATEGORY_LAUNCHER);
        notificationIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);

        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0,
                notificationIntent, 0);

        builder.setContentIntent(pendingIntent);

        return builder;
    }
}
