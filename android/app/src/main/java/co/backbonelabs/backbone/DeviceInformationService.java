package co.backbonelabs.backbone;

import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCharacteristic;
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

public class DeviceInformationService extends ReactContextBaseJavaModule {
    private static DeviceInformationService instance = null;
    private ReactApplicationContext reactContext;

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
        this.reactContext = reactContext;

        IntentFilter filter = new IntentFilter();
        filter.addAction(Constants.ACTION_CHARACTERISTIC_READ);
        filter.addAction(Constants.ACTION_CHARACTERISTIC_UPDATE);
        filter.addAction(Constants.ACTION_DESCRIPTOR_WRITE);
        reactContext.registerReceiver(bleBroadcastReceiver, filter);
    }

    private Constants.StringCallBack firmwareVersionCallBack;
    private Constants.IntCallBack batteryLevelCallBack;
    private Constants.MapCallBack deviceStatusCallBack;
    private boolean hasPendingCallback = false;
    private boolean requestingSelfTest;

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

        if (hasPendingCallback) {
            return;
        }

        hasPendingCallback = true;

        if (bluetoothService.isDeviceReady()) {
            if (bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.FIRMWARE_VERSION_CHARACTERISTIC)
                    && bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.BATTERY_LEVEL_CHARACTERISTIC)) {
                retrieveFirmwareVersion(new Constants.StringCallBack() {
                    @Override
                    public void onStringCallBack(final String version) {
                        Timber.d("Found version %s", version);

                        retrieveBatteryLevel(new Constants.IntCallBack() {
                            @Override
                            public void onIntCallBack(final int level) {
                                Timber.d("Found battery %d", level);

                                hasPendingCallback = false;

                                if (bluetoothService.isDeviceReady()) {
                                    WritableMap wm = Arguments.createMap();
                                    wm.putInt("deviceMode", bluetoothService.getCurrentDeviceMode());
                                    wm.putString("identifier", bluetoothService.getCurrentDeviceIdentifier());
                                    wm.putString("firmwareVersion", version);
                                    wm.putInt("batteryLevel", level);

                                    callback.invoke(null, wm);
                                }
                                else {
                                    callback.invoke(JSError.make("Not connected to a device"));
                                }
                            }
                        });
                    }
                });
            }
            else {
                hasPendingCallback = false;

                WritableMap wm = Arguments.createMap();
                wm.putInt("deviceMode", bluetoothService.getCurrentDeviceMode());
                wm.putString("identifier", bluetoothService.getCurrentDeviceIdentifier());
                wm.putString("firmwareVersion", "");
                wm.putInt("batteryLevel", -1);

                callback.invoke(null, wm);
            }
        }
        else {
            hasPendingCallback = false;

            callback.invoke(JSError.make("Not connected to a device"));
        }
    }

    /**
     * Send a command to re-run the self-test.
     * This should only be called when the initial self-test has failed.
     */
    @ReactMethod
    public void requestSelfTest() {
        if (requestingSelfTest) return;

        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.isDeviceReady() &&
                bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC)) {
            BluetoothGattCharacteristic deviceStatusChar = bluetoothService.getCharacteristic(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC);

            if (deviceStatusChar != null && (deviceStatusChar.getProperties() & BluetoothGattCharacteristic.PROPERTY_NOTIFY) != 0) {
                Timber.d("Request self test");
                requestingSelfTest = true;

                // Enable the DeviceStatus notification before sending the request
                bluetoothService.toggleCharacteristicNotification(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC, true);
            }
            else {
                EventEmitter.send(reactContext, "DeviceTestStatus", JSError.make("Self-Test re-run not supported"));
            }
        }
    }

    public void refreshDeviceTestStatus() {
        retrieveDeviceStatus(new Constants.MapCallBack() {
            @Override
            public void onMapCallBack(WritableMap map) {
                Timber.d("Refresh self-test status %b", map.getBoolean("selfTestStatus"));
                WritableMap wm = Arguments.createMap();
                wm.putBoolean("success", map.getBoolean("selfTestStatus"));
                EventEmitter.send(reactContext, "DeviceTestStatus", wm);
            }
        });
    }

    public void retrieveFirmwareVersion(Constants.StringCallBack callBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        firmwareVersionCallBack = callBack;

        if (!bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.FIRMWARE_VERSION_CHARACTERISTIC)) {
            firmwareVersionCallBack.onStringCallBack("");
            firmwareVersionCallBack = null;
        }
        else {
            boolean status = bluetoothService.readCharacteristic(Constants.CHARACTERISTIC_UUIDS.FIRMWARE_VERSION_CHARACTERISTIC);

            if (!status) {
                // Return the default value when failed to fetch the actual version
                firmwareVersionCallBack.onStringCallBack("");
                firmwareVersionCallBack = null;
            }
        }
    }

    public void retrieveBatteryLevel(Constants.IntCallBack callBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        batteryLevelCallBack = callBack;

        if (!bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.BATTERY_LEVEL_CHARACTERISTIC)) {
            batteryLevelCallBack.onIntCallBack(-1);
            batteryLevelCallBack = null;
        }
        else {
            boolean status = bluetoothService.readCharacteristic(Constants.CHARACTERISTIC_UUIDS.BATTERY_LEVEL_CHARACTERISTIC);

            if (!status) {
                // Return the default value when failed to fetch the actual version
                batteryLevelCallBack.onIntCallBack(-1);
                batteryLevelCallBack = null;
            }
        }
    }

    public void retrieveDeviceStatus(Constants.MapCallBack callBack) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        deviceStatusCallBack = callBack;

        if (!bluetoothService.hasCharacteristic(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC)) {
            // Return default value for older devices with no access to this characteristic
            WritableMap statusMap = Arguments.createMap();
            statusMap.putBoolean("selfTestStatus", true);

            deviceStatusCallBack.onMapCallBack(statusMap);
            deviceStatusCallBack = null;
        }
        else {
            boolean status = bluetoothService.readCharacteristic(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC);

            if (!status) {
                // Return the default value when failed to fetch the actual version
                WritableMap statusMap = Arguments.createMap();
                statusMap.putBoolean("selfTestStatus", true);

                deviceStatusCallBack.onMapCallBack(statusMap);
                deviceStatusCallBack = null;
            }
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

                    firmwareVersionCallBack = null;
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

                    batteryLevelCallBack = null;
                }
                else if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC.toString())) {
                    if (status == BluetoothGatt.GATT_SUCCESS) {
                        byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                        int initStatus = Utilities.getIntFromByteArray(responseArray, 0);
                        int selfTestStatus = Utilities.getIntFromByteArray(responseArray, 4);
                        int batteryVoltage = Utilities.getIntFromByteArray(responseArray, 8);
                        Timber.d("Status Map: %d %d %d", initStatus, selfTestStatus, batteryVoltage);

                        WritableMap statusMap = Arguments.createMap();
                        statusMap.putBoolean("initStatus", initStatus == 0);
                        statusMap.putBoolean("selfTestStatus", selfTestStatus == 0);
                        statusMap.putInt("batteryVoltage", batteryVoltage);

                        deviceStatusCallBack.onMapCallBack(statusMap);
                    }
                    else {
                        WritableMap statusMap = Arguments.createMap();
                        statusMap.putBoolean("selfTestStatus", false);

                        deviceStatusCallBack.onMapCallBack(statusMap);
                    }

                    deviceStatusCallBack = null;
                }
            }
            else if (action.equals(Constants.ACTION_CHARACTERISTIC_UPDATE)) {
                Timber.d("CharacteristicUpdate");
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC.toString())) {
                    if (requestingSelfTest) {
                        requestingSelfTest = false;

                        byte[] responseArray = intent.getByteArrayExtra(Constants.EXTRA_BYTE_VALUE);

                        int selfTestStatus = Utilities.getIntFromByteArray(responseArray, 4);
                        Timber.d("Self-Test Status: %d", selfTestStatus);

                        WritableMap wm = Arguments.createMap();
                        wm.putBoolean("success", selfTestStatus == 0);
                        EventEmitter.send(reactContext, "DeviceTestStatus", wm);
                    }
                }
            }
            else if (action.equals(Constants.ACTION_DESCRIPTOR_WRITE)) {
                Timber.d("DescriptorWrite");
                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.DEVICE_STATUS_CHARACTERISTIC.toString())) {
                    // Send the actual command to start self-test after enabling the status notification
                    byte[] commandBytes = new byte[1];

                    commandBytes[0] = Constants.SESSION_COMMANDS.SELF_TEST;

                    bluetoothService.writeToCharacteristic(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC, commandBytes);
                }
            }
//            else if (action.equals(Constants.ACTION_CHARACTERISTIC_WRITE)) {
//                String uuid = intent.getStringExtra(Constants.EXTRA_BYTE_UUID_VALUE);
//                int status = intent.getIntExtra(Constants.EXTRA_BYTE_STATUS_VALUE, BluetoothGatt.GATT_FAILURE);
//                Timber.d("Self-Test write %d", status);
//
//                if (uuid.equals(Constants.CHARACTERISTIC_UUIDS.SESSION_CONTROL_CHARACTERISTIC.toString())) {
//                    if (status == BluetoothGatt.GATT_SUCCESS) {
//                        if (requestingSelfTest) {
//                            Timber.d("Self-Test request sent");
//                        }
//                    }
//                    else {
//                        Log.e("DeviceInformation", "Error sending self-test command");
//                    }
//                }
//            }
        }
    };
}
