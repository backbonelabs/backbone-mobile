package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

public class VibrationMotorService extends ReactContextBaseJavaModule {
    private static VibrationMotorService instance = null;
    private ReactApplicationContext reactContext;

    public static VibrationMotorService getInstance() {
        return instance;
    }

    public static VibrationMotorService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new VibrationMotorService(reactContext);
        }
        return instance;
    }

    private VibrationMotorService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_CHARACTERISTIC_WRITE);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);
    }

    private ReadableArray currentVibrationCommands;
    private int currentVibrationIndex;
    private int nextVibrationDelay;

    private Handler vibrationHandler = null;

    @Override
    public String getName() {
        return "VibrationMotorService";
    }

    @ReactMethod
    public void vibrate(ReadableArray vibrationParams) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady() &&
                bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.VIBRATION_MOTOR_CHARACTERISTIC)) {
            currentVibrationCommands = vibrationParams;
            currentVibrationIndex = 0;
            sendNextVibrationCommand();
        }
    }

    private void sendNextVibrationCommand() {
        // Check if there's any pending vibration commands
        if (currentVibrationIndex == currentVibrationCommands.size()) return;

        ReadableMap vibrationParam = currentVibrationCommands.getMap(currentVibrationIndex);
        int vibrationSpeed = (vibrationParam.hasKey("vibrationSpeed") ? vibrationParam.getInt("vibrationSpeed") : Constants.VIBRATION_DEFAULT_SPEED);
        int vibrationDuration = (vibrationParam.hasKey("vibrationDuration") ? vibrationParam.getInt("vibrationDuration") : Constants.VIBRATION_DEFAULT_DURATION * 10);

        nextVibrationDelay = vibrationDuration + 100; // Add an extra delay of 100ms

        byte[] commandBytes = new byte[4];

        commandBytes[0] = Constants.VIBRATION_COMMANDS.START;
        commandBytes[1] = (byte)vibrationSpeed; 
        commandBytes[2] = Utilities.getByteFromInt(vibrationDuration, 1);
        commandBytes[3] = Utilities.getByteFromInt(vibrationDuration, 0);

        boolean status = BluetoothService.getInstance().writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.VIBRATION_MOTOR_CHARACTERISTIC, commandBytes);

        if (!status) {
            Log.e("VibrationMotorService", "Error writing into motor control");
        }
    }

    private final BroadcastReceiver bleBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            BluetoothService bluetoothService = BluetoothService.getInstance();
            final String action = intent.getAction();
            Timber.d("Receive Broadcast %s", action);

            if (action.equals(Constants.ACTION_CHARACTERISTIC_WRITE)) {
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.VIBRATION_MOTOR_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        // Set a delay before sending the next command
                        Runnable vibrationRunnable = new Runnable(){
                            public void run() {
                                currentVibrationIndex++;
                                sendNextVibrationCommand();
                            }
                        };

                        if (vibrationHandler == null) {
                            vibrationHandler = new Handler();
                        }

                        vibrationHandler.postDelayed(vibrationRunnable, nextVibrationDelay);
                    }
                    else {
                        Log.e("VibrationMotorService", "Error writing into motor control");
                    }
                }
            }
        }
    };
}
