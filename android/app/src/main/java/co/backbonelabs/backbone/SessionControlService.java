package co.backbonelabs.backbone;

import android.app.Activity;
import android.app.Application;
import android.bluetooth.BluetoothGatt;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.SharedPreferences;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;

import com.amazonaws.AmazonClientException;
import com.amazonaws.auth.AWSCredentialsProvider;
import com.amazonaws.auth.CognitoCachingCredentialsProvider;
import com.amazonaws.mobileconnectors.kinesis.kinesisrecorder.KinesisFirehoseRecorder;
import com.amazonaws.regions.Regions;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.JSError;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

public class SessionControlService extends ReactContextBaseJavaModule {
    private static SessionControlService instance = null;
    private ReactApplicationContext reactContext;
    private final String TAG = "SessionControlService";

    private KinesisFirehoseRecorder firehoseRecorder;
    private SimpleDateFormat timestampFormatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSS");
    private boolean shouldFlushFirehoseRecords = true;

    private int currentSessionState = Constants.SESSION_STATES.STOPPED;
    private int previousSessionState = Constants.SESSION_STATES.STOPPED;
    private int currentCommand;

    private int sessionDuration = Constants.SESSION_DEFAULT_DURATION;
    private int slouchDistanceThreshold = Constants.SLOUCH_DEFAULT_DISTANCE_THRESHOLD;
    private int slouchTimeThreshold = Constants.SLOUCH_DEFAULT_TIME_THRESHOLD;

    private int vibrationPattern = Constants.VIBRATION_DEFAULT_PATTERN;
    private int vibrationSpeed = Constants.VIBRATION_DEFAULT_SPEED;
    private int vibrationDuration = Constants.VIBRATION_DEFAULT_DURATION;

    private boolean distanceNotificationStatus;
    private boolean statisticNotificationStatus;
    private boolean slouchNotificationStatus;
    private boolean accelerometerNotificationStatus;

    private boolean forceStoppedSession;
    private boolean notificationStateChanged;

    private long sessionStartTimestamp;
    private String sessionId = "";

    private Constants.IntCallBack errorCallBack;

    public static SessionControlService getInstance() {
        return instance;
    }

    public static SessionControlService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new SessionControlService(reactContext);
        }
        return instance;
    }

    private SessionControlService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        timestampFormatter.setTimeZone(TimeZone.getTimeZone("GMT"));

        // Set up Firehose
        Regions region = Regions.US_WEST_2;
        AWSCredentialsProvider provider = new CognitoCachingCredentialsProvider(
                reactContext,
                Constants.AMAZON_COGNITO_IDENTITY_POOL,
                region
        );

        firehoseRecorder = new KinesisFirehoseRecorder(
                reactContext.getCacheDir(),
                region,
                provider
        );

        // Submit any pending Firehose records
        submitFirehoseRecords();

        // Load details of previous session, if any
        SharedPreferences preferences = reactContext.getSharedPreferences(Constants.POSTURE_SESSION_PREFERENCES, Context.MODE_PRIVATE);
        sessionId = preferences.getString(Constants.POSTURE_SESSION_PREFERENCE_SESSION_ID, null);
        sessionStartTimestamp = preferences.getLong(Constants.POSTURE_SESSION_PREFERENCE_START_TIMESTAMP, 0);

        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_CHARACTERISTIC_READ);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_UPDATE);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_WRITE);
        filter.addAction(Constants.ACTION_DESCRIPTOR_WRITE);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);

        // Register activity lifecycle callbacks to start and stop session tracking
        MainActivity.currentActivity.getApplication().registerActivityLifecycleCallbacks(new Application.ActivityLifecycleCallbacks() {
            @Override
            public void onActivityCreated(Activity activity, Bundle savedInstanceState) {

            }

            @Override
            public void onActivityStarted(Activity activity) {

            }

            @Override
            public void onActivityResumed(Activity activity) {
                Timber.d("onActivityResume");
                // Stop foreground service
                Intent stopIntent = new Intent(activity, ForegroundService.class);
                stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE);
                activity.startService(stopIntent);
            }

            @Override
            public void onActivityPaused(Activity activity) {
                Timber.d("onActivityPaused");
                if (hasActiveSession()) {
                    // There is an active session, start foreground service to continue listening
                    Intent startIntent = new Intent(activity, ForegroundService.class);
                    startIntent.setAction(Constants.ACTIONS.START_POSTURE_FOREGROUND_SERVICE);
                    activity.startService(startIntent);
                }
            }

            @Override
            public void onActivityStopped(Activity activity) {

            }

            @Override
            public void onActivitySaveInstanceState(Activity activity, Bundle outState) {

            }

            @Override
            public void onActivityDestroyed(Activity activity) {
                // App is terminated, perform cleanup tasks
                Timber.d("onActivityDestroyed");

                // Stop the foreground service
                Intent stopIntent = new Intent(activity, ForegroundService.class);
                stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE);
                activity.startService(stopIntent);

                // Clear the session completion notification if exists
                NotificationService.clearNotification(Constants.NOTIFICATION_TYPES.SESSION_COMPLETED);
            }
        });
    }

    @Override
    public String getName() {
        return "SessionControlService";
    }

    @ReactMethod
    public void start(ReadableMap sessionParam, final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC)) {
            forceStoppedSession = false;

            if (sessionParam != null && sessionParam.hasKey("sessionDuration")) {
                sessionDuration = sessionParam.getInt("sessionDuration");
            }

            if (sessionParam != null && sessionParam.hasKey("slouchDistanceThreshold")) {
                slouchDistanceThreshold = sessionParam.getInt("slouchDistanceThreshold");
            }

            if (sessionParam != null && sessionParam.hasKey("slouchTimeThreshold")) {
                slouchTimeThreshold = sessionParam.getInt("slouchTimeThreshold");
            }

            if (sessionParam != null && sessionParam.hasKey("vibrationPattern")) {
                vibrationPattern = sessionParam.getInt("vibrationPattern");
            }

            if (sessionParam != null && sessionParam.hasKey("vibrationSpeed")) {
                vibrationSpeed = sessionParam.getInt("vibrationSpeed");
            }

            if (sessionParam != null && sessionParam.hasKey("vibrationDuration")) {
                vibrationDuration = sessionParam.getInt("vibrationDuration");
            }

            toggleSessionOperation(Constants.SESSION_OPERATIONS.START, new Constants.IntCallBack() {
                @Override
                public void onIntCallBack(int val) {
                    if (val == 0) {
                        callback.invoke();
                    }
                    else {
                        callback.invoke(JSError.make("Error toggling session"));
                    }
                }
            });
        }
        else {
            callback.invoke(JSError.make("Session Control is not ready"));
        }
    }

    @ReactMethod
    public void pause(final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC)) {
            toggleSessionOperation(Constants.SESSION_OPERATIONS.PAUSE, new Constants.IntCallBack() {
                @Override
                public void onIntCallBack(int val) {
                    if (val == 0) {
                        callback.invoke();
                    }
                    else {
                        callback.invoke(JSError.make("Error toggling session"));
                    }
                }
            });
        }
        else {
            callback.invoke(JSError.make("Session Control is not ready"));
        }
    }

    @ReactMethod
    public void resume(ReadableMap sessionParam, final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC)) {
            if (sessionParam != null && sessionParam.hasKey("slouchDistanceThreshold")) {
                slouchDistanceThreshold = sessionParam.getInt("slouchDistanceThreshold");
            }

            if (sessionParam != null && sessionParam.hasKey("slouchTimeThreshold")) {
                slouchTimeThreshold = sessionParam.getInt("slouchTimeThreshold");
            }

            if (sessionParam != null && sessionParam.hasKey("vibrationPattern")) {
                vibrationPattern = sessionParam.getInt("vibrationPattern");
            }

            if (sessionParam != null && sessionParam.hasKey("vibrationSpeed")) {
                vibrationSpeed = sessionParam.getInt("vibrationSpeed");
            }

            if (sessionParam != null && sessionParam.hasKey("vibrationDuration")) {
                vibrationDuration = sessionParam.getInt("vibrationDuration");
            }

            toggleSessionOperation(Constants.SESSION_OPERATIONS.RESUME, new Constants.IntCallBack() {
                @Override
                public void onIntCallBack(int val) {
                    if (val == 0) {
                        callback.invoke();
                    } else {
                        callback.invoke(JSError.make("Error toggling session"));
                    }
                }
            });
        }
        else {
            callback.invoke(JSError.make("Session Control is not ready"));
        }
    }

    @ReactMethod
    public void stop(boolean waitForResponse, final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (!waitForResponse) {
            // Immediately update the current session state without waiting for the command to be sent.
            // Should only be used when the app needs to forcefully quit the monitor scene
            Timber.d("Skip Response");
            currentSessionState = Constants.SESSION_STATES.STOPPED;
        }

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC)) {
            if (currentSessionState == Constants.SESSION_STATES.RUNNING || currentSessionState == Constants.SESSION_STATES.PAUSED) {
                forceStoppedSession = true;

                toggleSessionOperation(Constants.SESSION_OPERATIONS.STOP, new Constants.IntCallBack() {
                    @Override
                    public void onIntCallBack(int val) {
                        if (val == 0) {
                            callback.invoke();
                        }
                        else {
                            callback.invoke(JSError.make("Error toggling session"));
                        }
                    }
                });
            }
            else {
                callback.invoke();
            }
        }
        else {
            callback.invoke(JSError.make("Session Control is not ready"));
        }
    }

    public boolean hasActiveSession() {
        return currentSessionState == Constants.SESSION_STATES.RUNNING || currentSessionState == Constants.SESSION_STATES.PAUSED;
    }

    public int getCurrentSessionState() {
        return currentSessionState;
    }

    public void emitSessionControlEvent(int operation) {
        WritableMap wm = Arguments.createMap();
        wm.putInt("operation", operation);
        EventEmitter.send(reactContext, "SessionControlState", wm);
    }

    /**
     * Reads from the session statistic characteristic. This is an asynchronous operation.
     * The results will be emitted through a SessionState event to JS.
     */
    @ReactMethod
    public void getSessionState() {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady() &&
                bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC)) {
            bluetoothService.readCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC);
        }
        else {
            WritableMap wm = Arguments.createMap();
            wm.putBoolean("hasActiveSession", false);
            wm.putInt("totalDuration", 0);
            wm.putInt("slouchTime", 0);
            Timber.d("SessionState data %s", wm);
            EventEmitter.send(reactContext, "SessionState", wm);
        }
    }

    private void toggleSessionOperation(int operation, Constants.IntCallBack errCallBack) {
        Timber.d("Toggle Session Control %d", operation);
        BluetoothService bluetoothService = BluetoothService.getInstance();

        previousSessionState = currentSessionState;
        currentCommand = operation;
        errorCallBack = errCallBack;

        boolean status;

        if (operation == Constants.SESSION_OPERATIONS.START) {
            // We generate the session id locally on the phone because we can't rely on the user
            // being connected to the internet when starting a session. This session id will be
            // sent to our data warehouse. The session id format is the user id and current
            // timestamp in seconds separated by a hyphen.
            String userId = UserService.getInstance().getUserId();
            if (userId == null) {
                userId = "";
            }
            sessionStartTimestamp = System.currentTimeMillis();
            sessionId = userId + "-" + (sessionStartTimestamp / 1000);
            Timber.d("sessionId %s", sessionId);

            // Store session details in case app is terminated in the middle of a posture session
            SharedPreferences preference = reactContext.getSharedPreferences(Constants.POSTURE_SESSION_PREFERENCES, Context.MODE_PRIVATE);
            SharedPreferences.Editor editor = preference.edit();
            editor.putString(Constants.POSTURE_SESSION_PREFERENCE_SESSION_ID, sessionId);
            editor.putLong(Constants.POSTURE_SESSION_PREFERENCE_START_TIMESTAMP, sessionStartTimestamp);
            editor.commit();

            int sessionDurationInSecond = sessionDuration * 60; // Convert to second from minute

            byte[] commandBytes = new byte[12];

            commandBytes[0] = Constants.SESSION_COMMANDS.START;

            commandBytes[1] = Utilities.getByteFromInt(sessionDurationInSecond, 3);
            commandBytes[2] = Utilities.getByteFromInt(sessionDurationInSecond, 2);
            commandBytes[3] = Utilities.getByteFromInt(sessionDurationInSecond, 1);
            commandBytes[4] = Utilities.getByteFromInt(sessionDurationInSecond, 0);

            commandBytes[5] = Utilities.getByteFromInt(slouchDistanceThreshold, 1);
            commandBytes[6] = Utilities.getByteFromInt(slouchDistanceThreshold, 0);

            commandBytes[7] = Utilities.getByteFromInt(slouchTimeThreshold, 1);
            commandBytes[8] = Utilities.getByteFromInt(slouchTimeThreshold, 0);

            commandBytes[9] = (byte)vibrationPattern;
            commandBytes[10] = (byte)vibrationSpeed;
            commandBytes[11] = (byte)vibrationDuration;

            currentSessionState = Constants.SESSION_STATES.RUNNING;
            distanceNotificationStatus = true;
            slouchNotificationStatus = true;
            statisticNotificationStatus = true;
            accelerometerNotificationStatus = true;

            status = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
        }
        else if (operation == Constants.SESSION_OPERATIONS.RESUME) {
            byte[] commandBytes = new byte[8];

            commandBytes[0] = Constants.SESSION_COMMANDS.RESUME;

            commandBytes[1] = Utilities.getByteFromInt(slouchDistanceThreshold, 1);
            commandBytes[2] = Utilities.getByteFromInt(slouchDistanceThreshold, 0);

            commandBytes[3] = Utilities.getByteFromInt(slouchTimeThreshold, 1);
            commandBytes[4] = Utilities.getByteFromInt(slouchTimeThreshold, 0);

            commandBytes[5] = (byte)vibrationPattern;
            commandBytes[6] = (byte)vibrationSpeed;
            commandBytes[7] = (byte)vibrationDuration;

            currentSessionState = Constants.SESSION_STATES.RUNNING;
            distanceNotificationStatus = true;
            slouchNotificationStatus = true;
            statisticNotificationStatus = true;
            accelerometerNotificationStatus = true;

            status = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
        }
        else  {
            byte[] commandBytes = new byte[1];

            switch (operation) {
                case Constants.SESSION_OPERATIONS.PAUSE:
                    commandBytes[0] = Constants.SESSION_COMMANDS.PAUSE;
                    currentSessionState = Constants.SESSION_STATES.PAUSED;
                    distanceNotificationStatus = false;
                    slouchNotificationStatus = false;
                    statisticNotificationStatus = true;
                    accelerometerNotificationStatus = false;

                    break;
                case Constants.SESSION_OPERATIONS.STOP:
                    commandBytes[0] = Constants.SESSION_COMMANDS.STOP;
                    currentSessionState = Constants.SESSION_STATES.STOPPED;
                    distanceNotificationStatus = false;
                    slouchNotificationStatus = false;
                    statisticNotificationStatus = false;
                    accelerometerNotificationStatus = false;

                    // Save session record for Firehose
                    saveSessionToFirehose();

                    // Submit all pending Firehose records
                    submitFirehoseRecords();

                    break;
            }

            status = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
        }

        if (!status) {
            // There won't be any response back from the board if
            // writing to the session control characteristic failed
            Log.e(TAG, "Error initiating session control update");

            if (errorCallBack != null) {
                errorCallBack.onIntCallBack(1);
                errorCallBack = null;
            }
        }
    }

    private void revertOperation() {
        // Revert as needed
        switch (previousSessionState) {
            case Constants.SESSION_STATES.STOPPED:
                // Stop the current session since there was an error creating the new session
                toggleSessionOperation(Constants.SESSION_OPERATIONS.STOP, null);
                break;
            case Constants.SESSION_STATES.PAUSED:
                // Revert back to pause the current session since the resume operation went wrong
                toggleSessionOperation(Constants.SESSION_OPERATIONS.PAUSE, null);
                break;
            case Constants.SESSION_STATES.RUNNING:
                if (currentCommand == Constants.SESSION_OPERATIONS.STOP) {
                    // Session is stopped anyway, so there's no point reverting it back, as that would create a completely new session.
                    // React should decide how to handle this case, ie. we can let the user to retry turning off the notification.
                }
                else if (currentCommand == Constants.SESSION_OPERATIONS.PAUSE) {
                    // Pausing was not successfully completed, so we resume the current session
                    toggleSessionOperation(Constants.SESSION_OPERATIONS.RESUME, null);
                }
                break;
            default:
                break;
        }
    }

    /**
     * Saves a posture session record to Firehose and clears the session details from SharedPreferences
     */
    private void saveSessionToFirehose() {
        Timber.d("saveSessionToFirehose");
        String userId = UserService.getInstance().getUserId();
        if (userId == null) {
            userId = "";
        }

        String startDateTime = timestampFormatter.format(new Date(sessionStartTimestamp));
        String endDateTime = timestampFormatter.format(new Date());
        String record = String.format("%s,%s,%s,%s\n", sessionId, userId, startDateTime, endDateTime);
        Timber.d("Firehose posture session record: %s", record);
        firehoseRecorder.saveRecord(record, Constants.FIREHOSE_STREAMS.POSTURE_SESSION);

        // Remove session data
        SharedPreferences preferences = reactContext.getSharedPreferences(Constants.POSTURE_SESSION_PREFERENCES, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = preferences.edit();
        editor.clear();
        editor.commit();
    }

    /**
     * Submit all pending Firehose records
     */
    private void submitFirehoseRecords() {
        new AsyncTask<Void, Void, Void>() {
            @Override
            protected Void doInBackground(Void... v) {
                try {
                    Timber.d("Submitting Firehose records");
                    firehoseRecorder.submitAllRecords();
                } catch (AmazonClientException ace) {
                    Log.e(TAG, "Error submitting to Firehose");
                    Log.e(TAG, Log.getStackTraceString(ace));
                }
                shouldFlushFirehoseRecords = true;
                return null;
            }
        }.execute();
    }

    private final BroadcastReceiver bleBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            BluetoothService bluetoothService = BluetoothService.getInstance();
            final String action = intent.getAction();
            Timber.d("Receive Broadcast %s", action);

            if (action.equals(Constants.ACTION_CHARACTERISTIC_READ)) {
                Timber.d("CharacteristicRead");
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);

                int flags = 0;
                int totalDuration = 0;
                int slouchTime = 0;

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    if (responseArray == null || responseArray.length < 12) {
                        // Invalid response, default to no active session
                    }
                    else {
                        flags = Utilities.getIntFromByteArray(responseArray, 0);
                        totalDuration = Utilities.getIntFromByteArray(responseArray, 4);
                        slouchTime = Utilities.getIntFromByteArray(responseArray, 8);
                    }

                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("hasActiveSession", flags % 2 == 1);
                    wm.putInt("totalDuration", totalDuration);
                    wm.putInt("slouchTime", slouchTime);
                    Timber.d("SessionState data %s", wm);
                    EventEmitter.send(reactContext, "SessionState", wm);
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_UPDATE)) {
                Timber.d("CharacteristicUpdate");
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    float currentDistance = Utilities.getFloatFromByteArray(responseArray, 0);
                    int timeElapsed = Utilities.getIntFromByteArray(responseArray, 4);

                    WritableMap wm = Arguments.createMap();
                    wm.putDouble("currentDistance", currentDistance);
                    wm.putInt("timeElapsed", timeElapsed);
                    Timber.d("SessionData data %s", wm);
                    EventEmitter.send(reactContext, "SessionData", wm);
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SLOUCH_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    boolean isSlouching = (responseArray[0] % 2 == 1);

                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isSlouching", isSlouching);
                    EventEmitter.send(reactContext, "SlouchStatus", wm);

                    Timber.d("Slouching? %b", isSlouching);
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    int flags = Utilities.getIntFromByteArray(responseArray, 0);
                    int totalDuration = Utilities.getIntFromByteArray(responseArray, 4);
                    int slouchTime = Utilities.getIntFromByteArray(responseArray, 8);

                    boolean hasActiveSession = (flags % 2 == 1);

                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("hasActiveSession", hasActiveSession);
                    wm.putInt("totalDuration", totalDuration);
                    wm.putInt("slouchTime", slouchTime);
                    EventEmitter.send(reactContext, "SessionStatistics", wm);

                    Intent stopIntent = new Intent(MainActivity.currentActivity, ForegroundService.class);
                    stopIntent.setAction(Constants.ACTIONS.STOP_POSTURE_FOREGROUND_SERVICE);
                    MainActivity.currentActivity.startService(stopIntent);

                    if (!forceStoppedSession) {
                        // Session automatically stopped
                        Timber.d("Session automatically stopped");
                        errorCallBack = null;

                        currentSessionState = Constants.SESSION_STATES.STOPPED;

                        distanceNotificationStatus = false;
                        statisticNotificationStatus = false;
                        slouchNotificationStatus = false;
                        accelerometerNotificationStatus = false;

                        bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC, statisticNotificationStatus);

                        // Save session record for Firehose
                        saveSessionToFirehose();

                        // Submit pending Firehose records
                        submitFirehoseRecords();
                    }
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    if (currentSessionState == Constants.SESSION_STATES.RUNNING) {
                        // Only save data to Firehose if session is running in case other modules are
                        // enabling accelerometer notifications outside of a posture session
                        float x = Utilities.getFloatFromByteArray(responseArray, 0);
                        float y = Utilities.getFloatFromByteArray(responseArray, 4);
                        float z = Utilities.getFloatFromByteArray(responseArray, 8);

                        Timber.d("Accelerometer data %f %f %f", x, y, z);

                        // Queue accelerometer record for Firehose
                        String now = timestampFormatter.format(new Date());
                        firehoseRecorder.saveRecord(String.format("%s,%s,%f,%f,%f\n", sessionId, now, x, y, z), Constants.FIREHOSE_STREAMS.POSTURE_SESSION_STREAM);

                        // Periodically submit records to Firehose to make
                        // sure the storage limit isn't reached. This will be
                        // done when the storage usage is at 50%, 75%, and 90%.
                        long storageLimit = firehoseRecorder.getDiskByteLimit();
                        long storageUsed = firehoseRecorder.getDiskBytesUsed();
                        float storageUsage = (float)storageUsed / storageLimit;
                        if (storageUsage >= 0.9 && shouldFlushFirehoseRecords) {
                            shouldFlushFirehoseRecords = false;
                            submitFirehoseRecords();
                        } else if (storageUsage >= 0.76) {
                            shouldFlushFirehoseRecords = true;
                        } else if (storageUsage >= 0.75 && shouldFlushFirehoseRecords) {
                            shouldFlushFirehoseRecords = false;
                            submitFirehoseRecords();
                        } else if (storageUsage >= 0.51) {
                            shouldFlushFirehoseRecords = true;
                        } else if (storageUsage >= 0.5 && shouldFlushFirehoseRecords) {
                            shouldFlushFirehoseRecords = false;
                            submitFirehoseRecords();
                        }
                    }
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_WRITE)) {
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null || notificationStateChanged) {
                            // Session state updated, so we proceed to toggle the notification state
                            notificationStateChanged = false;

                            boolean toggleStatus = bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC, distanceNotificationStatus);

                            // If we failed initiating the descriptor writer, handle the error callback
                            if (!toggleStatus && errorCallBack != null) {
                                Log.e(TAG, "Error toggling session data notification");
                                errorCallBack.onIntCallBack(1);
                                errorCallBack = null;
                            }
                        }
                    }
                    else {
                        Log.e(TAG, "Error writing into session control characteristic");
                        if (errorCallBack != null) {
                            errorCallBack.onIntCallBack(1);
                            errorCallBack = null;
                        }
                    }
                }
            }
            else if (action.equals(Constants.ACTION_DESCRIPTOR_WRITE)) {
                // Since toggling notification is done by directly writing into the descriptor,
                // We need to capture this event to properly handle the correct response
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null) {
                            boolean toggleStatus = bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.SLOUCH_CHARACTERISTIC, slouchNotificationStatus);

                            // If we failed initiating the descriptor writer, handle the error callback
                            if (!toggleStatus) {
                                Log.e(TAG, "Error toggling slouch notification");
                                errorCallBack.onIntCallBack(1);
                                errorCallBack = null;

                                revertOperation();
                            }
                        }
                    }
                    else {
                        Log.e(TAG, "Error writing into session data notification descriptor");
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);
                            errorCallBack = null;

                            revertOperation();
                        }
                    }
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SLOUCH_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null) {
                            boolean toggleStatus = bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC, statisticNotificationStatus);

                            // If we failed initiating the descriptor writer, handle the error callback
                            if (!toggleStatus) {
                                Log.e(TAG, "Error toggling session statistic notification");
                                errorCallBack.onIntCallBack(1);
                                errorCallBack = null;

                                notificationStateChanged = true;
                                revertOperation();
                            }
                        }
                    }
                    else {
                        Log.e(TAG, "Error writing into slouch notification descriptor");
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);
                            errorCallBack = null;

                            notificationStateChanged = true;
                            revertOperation();
                        }
                    }
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null) {
                            // Toggle accelerometer notification at the end of the 
                            // command flow to prevent concurrency issues on older Android versions
                            bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC, accelerometerNotificationStatus);
                            errorCallBack.onIntCallBack(0);
                            errorCallBack = null;
                        }
                    }
                    else {
                        Log.e(TAG, "Error writing into session statistic notification descriptor");
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);
                            errorCallBack = null;

                            notificationStateChanged = true;
                            revertOperation();
                        }
                    }
                }
            }
        }
    };
}
