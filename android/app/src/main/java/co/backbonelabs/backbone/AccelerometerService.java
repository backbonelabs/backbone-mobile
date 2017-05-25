package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.AsyncTask;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.DeviceLogger;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.JSError;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

public class AccelerometerService extends ReactContextBaseJavaModule {
    private static AccelerometerService instance = null;
    private ReactApplicationContext reactContext;

    public static AccelerometerService getInstance() {
        return instance;
    }

    public static AccelerometerService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new AccelerometerService(reactContext);
        }
        return instance;
    }

    private AccelerometerService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        dataRecords = new ArrayList<>();

        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_CHARACTERISTIC_WRITE);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_UPDATE);
        filter.addAction(Constants.ACTION_DESCRIPTOR_WRITE);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);
    }

    private boolean accelerometerNotificationStatus;
    private Constants.IntCallBack toggleCallBack = null;
    private long previousDataTimestamp = 0;
    private ArrayList<WritableMap> dataRecords;

    @Override
    public String getName() {
        return "AccelerometerService";
    }

    @ReactMethod
    public void startListening(final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC)) {
            toggleAccelerometerNotification(true, new Constants.IntCallBack() {
                @Override
                public void onIntCallBack(int status) {
                    if (status == 0) {
                        callback.invoke();
                    }
                    else {
                        callback.invoke(JSError.make("Accelerometer is not available"));
                    }
                }
            });
        } else {
            callback.invoke(JSError.make("Accelerometer is not ready"));
        }
    }

    @ReactMethod
    public void stopListening(final Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady()
                && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC)) {
            toggleAccelerometerNotification(false, new Constants.IntCallBack() {
                @Override
                public void onIntCallBack(int error) {
                    if (error == 0) {
                        callback.invoke();
                    }
                    else {
                        callback.invoke(JSError.make("Accelerometer is not available"));
                    }
                }
            });
        } else {
            callback.invoke(JSError.make("Accelerometer is not ready"));
        }
    }

    @ReactMethod
    public void reset() {
        dataRecords.clear();
    }

    @ReactMethod
    public void exportLog() {
        // Copy to another container for background exporting
        // while still allowing changes to the main container
        final ArrayList<WritableMap> tmpData = new ArrayList<>();

        for (int i = 0; i < dataRecords.size(); i++) {
            tmpData.add(dataRecords.get(i));
        }

        AsyncTask.execute(new Runnable() {
            @Override
            public void run() {
                DeviceLogger.logAccelerometer(tmpData);
            }
        });

        reset();
    }

    public void toggleAccelerometerNotification(boolean state, Constants.IntCallBack callback) {
        Timber.d("Toggle Accelerometer");
        toggleCallBack = callback;
        accelerometerNotificationStatus = state;

        BluetoothService bluetoothService = BluetoothService.getInstance();
        boolean result;

        if (state) {
            int sessionDurationInSecond = 0;
            int slouchDistanceThreshold = Constants.SLOUCH_DEFAULT_DISTANCE_THRESHOLD;
            int slouchTimeThreshold = Constants.SLOUCH_DEFAULT_TIME_THRESHOLD;
            int vibrationPattern = 0;
            int vibrationSpeed = 0;
            int vibrationDuration = 0;

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

            result = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
        }
        else {
            byte[] commandBytes = new byte[12];

            commandBytes[0] = Constants.SESSION_COMMANDS.STOP;

            result = bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
        }

        if (!result) {
            toggleCallBack.onIntCallBack(1);
            toggleCallBack = null;
        }
    }

    private final BroadcastReceiver bleBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            BluetoothService bluetoothService = BluetoothService.getInstance();
            final String action = intent.getAction();
            Timber.d("Receive Broadcast %s", action);

            if (action.equals(Constants.ACTION_CHARACTERISTIC_WRITE)) {
                Timber.d("CharacteristicWrite");
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS && toggleCallBack != null) {
                        boolean toggleStatus = bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC, accelerometerNotificationStatus);

                        // If we failed initiating the descriptor writer, handle the error callback
                        if (!toggleStatus) {
                            Log.e("AccelerometerService", "Error toggling notification");
                            toggleCallBack.onIntCallBack(1);
                            toggleCallBack = null;
                        }
                    }
                    else {
                        if (toggleCallBack != null) {
                            Log.e("AccelerometerService", "Error writing into session control");
                            toggleCallBack.onIntCallBack(1);
                            toggleCallBack = null;
                        }
                    }
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_UPDATE)) {
                Timber.d("CharacteristicUpdate");
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC.toString())) {
                    byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                    float xAxis = Utilities.getFloatFromByteArray(responseArray, 0);
                    float yAxis = Utilities.getFloatFromByteArray(responseArray, 4);
                    float zAxis = Utilities.getFloatFromByteArray(responseArray, 8);
                    float acceleration = Utilities.getFloatFromByteArray(responseArray, 12);

                    long currentTimestamp = System.currentTimeMillis();

                    // Prevent from flooding the React side for rendering the chart
                    // as that would freeze the entire UI due to excessive data being sent
                    if (currentTimestamp - previousDataTimestamp >= 250) {
                        previousDataTimestamp = currentTimestamp;

                        WritableMap wm = Arguments.createMap();
                        wm.putDouble("xAxis", xAxis);
                        wm.putDouble("yAxis", yAxis);
                        wm.putDouble("zAxis", zAxis);
                        wm.putDouble("acceleration", acceleration);
                        Timber.d("Accelerometer data %f %f %f %f", xAxis, yAxis, zAxis, acceleration);
                        EventEmitter.send(reactContext, "AccelerometerData", wm);

                        String now = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss.SSSS").format(Calendar.getInstance().getTime());

                        WritableMap record = Arguments.createMap();
                        record.putString("dateTime", now);
                        record.putDouble("xAxis", xAxis);
                        record.putDouble("yAxis", yAxis);
                        record.putDouble("zAxis", zAxis);
                        dataRecords.add(record);
                    }
                }
            }
            else if (action.equals(Constants.ACTION_DESCRIPTOR_WRITE)) {
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.ACCELEROMETER_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        if (toggleCallBack != null) {
                            toggleCallBack.onIntCallBack(0);
                            toggleCallBack = null;
                        }
                    } else {
                        if (toggleCallBack != null) {
                            Log.e("AccelerometerService", "Error writing into notification descriptor");
                            toggleCallBack.onIntCallBack(1);
                            toggleCallBack = null;
                        }
                    }
                }
            }
        }
    };
}