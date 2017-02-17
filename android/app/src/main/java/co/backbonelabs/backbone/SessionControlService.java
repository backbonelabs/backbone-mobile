package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.JSError;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

public class SessionControlService extends ReactContextBaseJavaModule {
    private static SessionControlService instance = null;
    private ReactApplicationContext reactContext;

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

        IntentFilter filter = new IntentFilter();
//        filter.addAction(Constants.ACTION_CHARACTERISTIC_FOUND);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_UPDATE);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_WRITE);
        filter.addAction(Constants.ACTION_DESCRIPTOR_WRITE);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);
    }

    private int currentSessionState = Constants.SESSION_STATES.STOPPED;
    private int previousSessionState = Constants.SESSION_STATES.STOPPED;
    private int currentCommand;

    private int sessionDuration;
    private int slouchDistanceThreshold;
    private int slouchTimeThreshold;

    private int vibrationPattern;
    private int vibrationSpeed;
    private int vibrationDuration;

    private boolean distanceNotificationStatus;
    private boolean statisticNotificationStatus;
    private boolean slouchNotificationStatus;

    private boolean forceStoppedSession;
    private boolean notificationStateChanged;

    private Constants.IntCallBack errorCallBack;

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
            if (currentSessionState == Constants.SESSION_STATES.STOPPED) {
                forceStoppedSession = false;

                sessionDuration = Constants.SESSION_DEFAULT_DURATION;
                slouchDistanceThreshold = Constants.SLOUCH_DEFAULT_DISTANCE_THRESHOLD;
                slouchTimeThreshold = Constants.SLOUCH_DEFAULT_TIME_THRESHOLD;

                vibrationPattern = Constants.VIBRATION_DEFAULT_PATTERN;
                vibrationSpeed = Constants.VIBRATION_DEFAULT_SPEED;
                vibrationDuration = Constants.VIBRATION_DEFAULT_DURATION;

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

                sessionDuration *= 60; // Convert to second from minute

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
            else if (currentSessionState == Constants.SESSION_STATES.PAUSED) {
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

    @ReactMethod
    public void pause(final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC)) {
            if (currentSessionState == Constants.SESSION_STATES.RUNNING) {
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
                callback.invoke();
            }
        }
        else {
            callback.invoke(JSError.make("Session Control is not ready"));
        }
    }

    @ReactMethod
    public void stop(final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

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

    private void toggleSessionOperation(int operation, Constants.IntCallBack errCallBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        previousSessionState = currentSessionState;
        currentCommand = operation;
        errorCallBack = errCallBack;

        boolean status;

        if (operation == Constants.SESSION_OPERATIONS.START) {
            byte[] commandBytes = new byte[12];

            commandBytes[0] = Constants.SESSION_COMMANDS.START;

            commandBytes[1] = Utilities.getByteFromInt(sessionDuration, 3);
            commandBytes[2] = Utilities.getByteFromInt(sessionDuration, 2);
            commandBytes[3] = Utilities.getByteFromInt(sessionDuration, 1);
            commandBytes[4] = Utilities.getByteFromInt(sessionDuration, 0);

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

                    break;
                case Constants.SESSION_OPERATIONS.STOP:
                    commandBytes[0] = Constants.SESSION_COMMANDS.STOP;
                    currentSessionState = Constants.SESSION_STATES.STOPPED;
                    distanceNotificationStatus = false;
                    slouchNotificationStatus = false;
                    statisticNotificationStatus = false;

                    break;
            }

            status = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
        }

        Timber.d("Toggle Session Control %d", operation);

        // There won't be any response back from the board once it failed here
        // So if we failed initiating the characteristic writer, handle the error callback right away
        if (!status) {
            Log.e("SessionControlService", "Error initiating session control update");
            errorCallBack.onIntCallBack(1);
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

    private final BroadcastReceiver bleBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            BluetoothService bluetoothService = BluetoothService.getInstance();
            final String action = intent.getAction();
            Timber.d("Receive Broadcast %s", action);

            if (action.equals(Constants.ACTION_CHARACTERISTIC_UPDATE)) {
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

                    if (!forceStoppedSession) {
                        errorCallBack = null;

                        currentSessionState = Constants.SESSION_STATES.STOPPED;

                        distanceNotificationStatus = false;
                        statisticNotificationStatus = false;
                        slouchNotificationStatus = false;

                        bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.SESSION_DATA_CHARACTERISTIC, distanceNotificationStatus);
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
                                Log.e("SessionControlService", "Error toggling notification");
                                errorCallBack.onIntCallBack(1);
                            }
                        }
                    }
                    else {
                        Log.e("SessionControlService", "Error writing into session control");
                        if (errorCallBack != null) {
                            errorCallBack.onIntCallBack(1);
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
                                Log.e("SessionControlService", "Error toggling notification");
                                errorCallBack.onIntCallBack(1);

                                revertOperation();
                            }
                        }
                    }
                    else {
                        Log.e("SessionControlService", "Error writing into notification descriptor");
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);

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
                                Log.e("SessionControlService", "Error toggling notification");
                                errorCallBack.onIntCallBack(1);

                                notificationStateChanged = true;
                                revertOperation();
                            }
                        }
                    }
                    else {
                        Log.e("SessionControlService", "Error writing into notification descriptor");
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);

                            notificationStateChanged = true;
                            revertOperation();
                        }
                    }
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_STATISTIC_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null) {
                            errorCallBack.onIntCallBack(0);
                        }
                    }
                    else {
                        Log.e("SessionControlService", "Error writing into notification descriptor");
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);

                            notificationStateChanged = true;
                            revertOperation();
                        }
                    }
                }
            }
        }
    };
}