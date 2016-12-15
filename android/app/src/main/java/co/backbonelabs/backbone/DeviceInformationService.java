package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothProfile;
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
import co.backbonelabs.backbone.util.JSError;
import timber.log.Timber;

public class DeviceInformationService extends ReactContextBaseJavaModule {
    private static DeviceInformationService instance = null;

    public static DeviceInformationService getInstance() {
        return instance;
    }

    public static DeviceInformationService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new DeviceInformationService(reactContext);
        }
        return instance;
    }

    private DeviceInformationService(ReactApplicationContext reactContext) {
        super(reactContext);

        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_CHARACTERISTIC_READ);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);
    }

    private Constants.StringCallBack firmwareVersionCallBack;
    private Constants.IntCallBack batteryLevelCallBack;

    @Override
    public String getName() {
        return "DeviceInformationService";
    }

    /**
     * Retrieves the device battery level and firmware version
     * @param callback The callback will be called with an error dictionary as the first argument if there are exceptions,
     *                 and a device information dictionary as the second argument if there are no exceptions
     */
    @ReactMethod
    public void getDeviceInformation(final Callback callback) {
        final BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.getCurrentDevice() != null && bluetoothService.getDeviceState() == BluetoothProfile.STATE_CONNECTED) {
            retrieveFirmwareVersion(new Constants.StringCallBack() {
                @Override
                public void onStringCallBack(final String version) {
                    Timber.d("Found version %s", version);

                    retrieveBatteryLevel(new Constants.IntCallBack() {
                        @Override
                        public void onIntCallBack(int level) {
                            Timber.d("Found battery %d", level);
                            WritableMap wm = Arguments.createMap();
                            wm.putString("identifier", bluetoothService.getCurrentDevice().getAddress());
                            wm.putString("firmwareVersion", version);
                            wm.putInt("batteryLevel", level);

                            callback.invoke(null, wm);
                        }
                    });
                }
            });
        }
        else {
            callback.invoke(JSError.make("Not connected to a device"));
        }
    }

    public void retrieveFirmwareVersion(Constants.StringCallBack callBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        firmwareVersionCallBack = callBack;

        if (!bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.FIRMWARE_VERSION_CHARACTERISTIC)) {
            firmwareVersionCallBack.onStringCallBack("");
        }
        else {
            bluetoothService.readCharacteristic(Constants.CHARACTERISTIC_UUIDS.FIRMWARE_VERSION_CHARACTERISTIC);
        }
    }

    public void retrieveBatteryLevel(Constants.IntCallBack callBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        batteryLevelCallBack = callBack;

        if (!bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.BATTERY_LEVEL_CHARACTERISTIC)) {
            batteryLevelCallBack.onIntCallBack(-1);
        }
        else {
            bluetoothService.readCharacteristic(Constants.CHARACTERISTIC_UUIDS.BATTERY_LEVEL_CHARACTERISTIC);
        }
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
                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);

                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.FIRMWARE_VERSION_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);
                        String version = String.valueOf(responseArray[0]) + "." + String.valueOf(responseArray[1]) + "." + String.valueOf(responseArray[2]) + "." + String.valueOf(responseArray[3]);
                        firmwareVersionCallBack.onStringCallBack(version);
                        Timber.d("Version %s", version);
                    }
                    else  {
                        firmwareVersionCallBack.onStringCallBack("");
                    }
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.BATTERY_LEVEL_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);
                        batteryLevelCallBack.onIntCallBack(responseArray[0]);
                        Timber.d("Battery %d", responseArray[0]);
                    }
                    else  {
                        batteryLevelCallBack.onIntCallBack(-1);
                    }
                }
            }
        }
    };
}
