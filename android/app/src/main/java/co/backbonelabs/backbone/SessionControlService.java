package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
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

    private int currentSessionState = Constants.SESSION_STATE.STOPPED;
    private int previousSessionState = Constants.SESSION_STATE.STOPPED;
    private int currentCommand;

    private boolean distanceNotificationStatus;

    private Constants.IntCallBack errorCallBack;

    @Override
    public String getName() {
        return "SessionControlService";
    }

    @ReactMethod
    public void start(final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.getCurrentDevice() != null
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.DISTANCE_CHARACTERISTIC)) {
            if (currentSessionState == Constants.SESSION_STATE.STOPPED) {
                toggleSessionOperation(Constants.SESSION_OPERATION.START, new Constants.IntCallBack() {
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
            else if (currentSessionState == Constants.SESSION_STATE.PAUSED) {
                toggleSessionOperation(Constants.SESSION_OPERATION.RESUME, new Constants.IntCallBack() {
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

        if (bluetoothService.getCurrentDevice() != null
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.DISTANCE_CHARACTERISTIC)) {
            if (currentSessionState == Constants.SESSION_STATE.RUNNING) {
                toggleSessionOperation(Constants.SESSION_OPERATION.PAUSE, new Constants.IntCallBack() {
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

        if (bluetoothService.getCurrentDevice() != null
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.DISTANCE_CHARACTERISTIC)) {
            if (currentSessionState == Constants.SESSION_STATE.RUNNING || currentSessionState == Constants.SESSION_STATE.PAUSED) {
                toggleSessionOperation(Constants.SESSION_OPERATION.STOP, new Constants.IntCallBack() {
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

    private void toggleSessionOperation(int operation, Constants.IntCallBack errCallBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();
        byte[] commandBytes = new byte[1];

        previousSessionState = currentSessionState;
        currentCommand = operation;
        errorCallBack = errCallBack;

        switch (operation) {
            case Constants.SESSION_OPERATION.START:
                commandBytes[0] = Constants.SESSION_COMMAND.START;
                currentSessionState = Constants.SESSION_STATE.RUNNING;
                distanceNotificationStatus = true;

                break;
            case Constants.SESSION_OPERATION.RESUME:
                commandBytes[0] = Constants.SESSION_COMMAND.RESUME;
                currentSessionState = Constants.SESSION_STATE.RUNNING;
                distanceNotificationStatus = true;

                break;
            case Constants.SESSION_OPERATION.PAUSE:
                commandBytes[0] = Constants.SESSION_COMMAND.PAUSE;
                currentSessionState = Constants.SESSION_STATE.PAUSED;
                distanceNotificationStatus = false;

                break;
            case Constants.SESSION_OPERATION.STOP:
                commandBytes[0] = Constants.SESSION_COMMAND.STOP;
                currentSessionState = Constants.SESSION_STATE.STOPPED;
                distanceNotificationStatus = false;

                break;
        }

        Timber.d("Toggle Session Control %d", operation);

        boolean status = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);

        // There won't be any response back from the board once it failed here
        // So if we failed initiating the characteristic writer, handle the error callback right away
        if (!status) {
            errorCallBack.onIntCallBack(1);
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

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.DISTANCE_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    float currentDistance = Utilities.getFloatFromByteArray(responseArray, 0);

                    WritableMap wm = Arguments.createMap();
                    wm.putDouble("currentDistance", currentDistance);
                    EventEmitter.send(reactContext, "PostureDistance", wm);

                    Timber.d("Distance %f", currentDistance);
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_WRITE)) {
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null) {
                            // Session state updated, so we proceed to toggle the notification state
                            boolean toggleStatus = bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.DISTANCE_CHARACTERISTIC, distanceNotificationStatus);

                            // If we failed initiating the descriptor writer, handle the error callback
                            if (!toggleStatus) {
                                errorCallBack.onIntCallBack(1);
                            }
                        }
                    }
                    else {
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

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.DISTANCE_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (errorCallBack != null) {
                            errorCallBack.onIntCallBack(0);
                        }
                    }
                    else {
                        if (errorCallBack != null) {
                            // Properly handle the failure when we failed toggling the notification state
                            errorCallBack.onIntCallBack(1);

                            // Revert as needed
                            switch (previousSessionState) {
                                case Constants.SESSION_STATE.STOPPED:
                                    // Stop the current session since there was an error creating the new session
                                    toggleSessionOperation(Constants.SESSION_OPERATION.STOP, null);
                                    break;
                                case Constants.SESSION_STATE.PAUSED:
                                    // Revert back to pause the current session since the resume operation went wrong
                                    toggleSessionOperation(Constants.SESSION_OPERATION.PAUSE, null);
                                    break;
                                case Constants.SESSION_STATE.RUNNING:
                                    if (currentCommand == Constants.SESSION_OPERATION.STOP) {
                                        // Session is stopped anyway, so there's no point reverting it back, as that would create a completely new session.
                                        // React should decide how to handle this case, ie. we can let the user to retry turning off the notification.
                                    }
                                    else if (currentCommand == Constants.SESSION_OPERATION.PAUSE) {
                                        // Pausing was not successfully completed, so we resume the current session
                                        toggleSessionOperation(Constants.SESSION_OPERATION.RESUME, null);
                                    }
                                    break;
                                default:
                                    break;
                            }
                        }
                    }
                }
            }
        }
    };
}