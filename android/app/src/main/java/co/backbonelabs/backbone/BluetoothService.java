package co.backbonelabs.backbone;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Bundle;
import android.support.annotation.Nullable;
import android.util.SparseIntArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.HashMap;
import java.util.List;
import java.util.MissingFormatArgumentException;
import java.util.UUID;

import co.backbonelabs.backbone.util.Constants;
import timber.log.Timber;

public class BluetoothService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static BluetoothService instance = null;
    private int deviceState = BluetoothProfile.STATE_DISCONNECTED;
    private int state;

    public static BluetoothService getInstance() {
        return instance;
    }

    public static BluetoothService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new BluetoothService(reactContext);
            instance.serviceMap = new HashMap<>();
            instance.characteristicMap = new HashMap<>();

//            BootLoaderService.getInstance(reactContext);
        }
        return instance;
    }

    private static final SparseIntArray bluetoothStateMap = new SparseIntArray() {
        {
            append(BluetoothAdapter.STATE_OFF, 2);
            append(BluetoothAdapter.STATE_TURNING_ON, 3);
            append(BluetoothAdapter.STATE_ON, 4);
            append(BluetoothAdapter.STATE_DISCONNECTED, 5);
            append(BluetoothAdapter.STATE_CONNECTING, 6);
            append(BluetoothAdapter.STATE_CONNECTED, 7);
            append(BluetoothAdapter.STATE_DISCONNECTING, 8);
            append(BluetoothAdapter.STATE_TURNING_OFF, 9);
        }
    };

    private BluetoothDevice currentDevice = null;
    private int currentDeviceMode = Constants.DEVICE_MODES.UNKNOWN;

    private ReactContext reactContext;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothGatt bleGatt;

    private HashMap<UUID, Boolean> serviceMap;
    private HashMap<UUID, BluetoothGattCharacteristic> characteristicMap;

    private final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
                state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
                WritableMap wm = Arguments.createMap();
                wm.putInt("state", bluetoothStateMap.get(state, -1));
                sendEvent(reactContext, "BluetoothState", wm);
            }
        }
    };

    private BluetoothService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        // Listen to the Activity's lifecycle events
        reactContext.addLifecycleEventListener(this);

        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        state = bluetoothAdapter.getState();
    }

    public interface DeviceScanCallBack {
        void onDeviceFound(BluetoothDevice device, int rssi);
    }

    public interface DeviceConnectionCallBack {
        void onDeviceConnected();
        void onDeviceDisconnected();
    }

    private DeviceScanCallBack scanCallBack;
    private DeviceConnectionCallBack connectionCallBack;

    /**
     * Retrieves the BluetoothAdapter
     * @return The default BluetoothAdapter
     */
    public BluetoothAdapter getAdapter() {
        return bluetoothAdapter;
    }

    /**
     * Checks if Bluetooth is enabled
     * @return True/false indicating whether Bluetooth is enabled
     */
    public boolean getIsEnabled() {
        return bluetoothAdapter != null && bluetoothAdapter.isEnabled();
    }

    /**
     * Returns the current Bluetooth state (based on the custom state map) to a callback
     * @param callback The Bluetooth state is passed in the second argument
     */
    @ReactMethod
    public void getState(Callback callback) {
        callback.invoke(null, bluetoothStateMap.get(state, -1));
    }

    /**
     * React method for checking if Bluetooth is enabled
     * @param promise Resolves with a boolean indicating if Bluetooth is enabled or not
     */
    @ReactMethod
    public void getIsEnabled(Promise promise) {
        if (promise != null) {
            promise.resolve(getIsEnabled());
        } else {
            promise.reject(new MissingFormatArgumentException("Missing promise"));
        }
    }

    /**
     * Initiates the activity to prompt the user to enable Bluetooth
     */
    @ReactMethod
    public void enable() {
        Intent enableBtIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        Activity currentActivity = getCurrentActivity();
        currentActivity.startActivity(enableBtIntent);
    }

    @Override
    public String getName() {
        return "BluetoothService";
    }

    private BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            deviceState = newState;
            Timber.d("DeviceState %d", newState);

            if (newState == BluetoothProfile.STATE_CONNECTED) {
                Timber.d("Device Connected");
                gatt.discoverServices();
            }
            else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                Timber.d("Device Disconnected");

                serviceMap.clear();
                characteristicMap.clear();
//                reconnectDevice();
            }
        }

        @Override
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            final String macAddress = gatt.getDevice().getAddress();
            Timber.d(macAddress + " onServicesDiscovered status: " + status);
            characteristicMap.clear();

            if (status == BluetoothGatt.GATT_SUCCESS) {
                Timber.d(macAddress + " GATT_SUCCESS");
                List<BluetoothGattService> services = gatt.getServices();
                for (BluetoothGattService service : services) {
                    UUID serviceUuid = service.getUuid();
                    Timber.d(macAddress + " uuid: " + serviceUuid);

                    List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();

                    if (serviceUuid.equals(Constants.SERVICE_UUIDS.BACKBONE_SERVICE) || serviceUuid.equals(Constants.SERVICE_UUIDS.BATTERY_SERVICE)) {
                        currentDeviceMode = Constants.DEVICE_MODES.BACKBONE;
                        Timber.d("Found Backbone Device");

                        if (characteristics != null && characteristics.size() > 0) {
                            Timber.d("Add Servis %s", serviceUuid.toString());
                            serviceMap.put(serviceUuid, true);
                        }
                    }
                    else if (serviceUuid.equals(Constants.SERVICE_UUIDS.BOOTLOADER_SERVICE)) {
                        currentDeviceMode = Constants.DEVICE_MODES.BOOTLOADER;
                        Timber.d("Found Bootloader");

                        if (characteristics != null && characteristics.size() > 0) {
                            Timber.d("Add Servis %s", serviceUuid.toString());
                            serviceMap.put(serviceUuid, true);
                        }
                    }

                    for (BluetoothGattCharacteristic characteristic : characteristics) {
                        Timber.d(macAddress + " service: " + service.getUuid() + " characteristic: " + characteristic.getUuid());

                        characteristicMap.put(characteristic.getUuid(), characteristic);

                        String characteristicUUID = characteristic.getUuid().toString();
                        Intent intent = new Intent(Constants.ACTION_CHARACTERISTIC_FOUND);
                        Bundle mBundle = new Bundle();
                        mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE, characteristicUUID);
                        intent.putExtras(mBundle);
                        reactContext.sendBroadcast(intent);
                    }
                }
            }

            if (currentDeviceMode == Constants.DEVICE_MODES.BACKBONE) {
                Timber.d("ServiceMap %d", serviceMap.size());

                if (serviceMap.size() == 2) {
                    connectionCallBack.onDeviceConnected();
                }
            }
            else if (currentDeviceMode == Constants.DEVICE_MODES.BOOTLOADER) {
                if (serviceMap.size() == 1) {
                    connectionCallBack.onDeviceConnected();
                }
            }
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt,
                                         BluetoothGattCharacteristic characteristic, int status) {
            String serviceUUID = characteristic.getService().getUuid().toString();

            String characteristicUUID = characteristic.getUuid().toString();

            Timber.d("DidRead %s", characteristicUUID);
            // GATT Characteristic read
            Intent intent = new Intent(Constants.ACTION_CHARACTERISTIC_READ);
            Bundle mBundle = new Bundle();

            mBundle.putInt(Constants.EXTRA_BYTE_STATUS_VALUE, status);

            if (status == BluetoothGatt.GATT_SUCCESS) {
                mBundle.putByteArray(Constants.EXTRA_BYTE_VALUE, characteristic.getValue());
                mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE,  characteristicUUID);
            }

            intent.putExtras(mBundle);
            reactContext.sendBroadcast(intent);
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt,
                                            BluetoothGattCharacteristic characteristic) {
            String serviceUUID = characteristic.getService().getUuid().toString();

            String characteristicUUID = characteristic.getUuid().toString();
            Timber.d("DidChanged %s", characteristicUUID);

            Intent intent = new Intent(Constants.ACTION_CHARACTERISTIC_UPDATE);
            Bundle mBundle = new Bundle();

            mBundle.putByteArray(Constants.EXTRA_BYTE_VALUE, characteristic.getValue());
            mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE, characteristicUUID);

            intent.putExtras(mBundle);
            reactContext.sendBroadcast(intent);

//            if (characteristicUUID.equalsIgnoreCase(Constants.CHARACTERISTIC_UUIDS.BOOTLOADER_CHARACTERISTIC.toString())) {
                // final Intent intent = new Intent(Constants.ACTION_BOOTLOADER_UPDATE);
                // Bundle mBundle = new Bundle();
                // // Putting the byte value read for GATT Db
                // mBundle.putByteArray(Constants.EXTRA_BYTE_VALUE,
                //         characteristic.getValue());
                // mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE,
                //         characteristic.getUuid().toString());
                // mBundle.putInt(Constants.EXTRA_BYTE_INSTANCE_VALUE,
                //         characteristic.getInstanceId());
                // mBundle.putString(Constants.EXTRA_BYTE_SERVICE_UUID_VALUE,
                //         characteristic.getService().getUuid().toString());
                // mBundle.putInt(Constants.EXTRA_BYTE_SERVICE_INSTANCE_VALUE,
                //         characteristic.getService().getInstanceId());

                // String hexValue = Utilities.ByteArraytoHex(characteristic.getValue());

                // intent.putExtras(mBundle);
                // reactContext.sendBroadcast(intent);

                // Timber.d("Broadcast %s : %s", characteristicUUID, hexValue);
//            }
        }

        @Override
        public void onCharacteristicWrite(BluetoothGatt gatt, BluetoothGattCharacteristic
                characteristic, int status) {
            String characteristicUUID = characteristic.getUuid().toString();
            Timber.d("DidWrite %s %d", characteristicUUID, status);

            Intent intent = new Intent(Constants.ACTION_CHARACTERISTIC_WRITE);
            Bundle mBundle = new Bundle();

            mBundle.putInt(Constants.EXTRA_BYTE_STATUS_VALUE, status);
            mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE, characteristicUUID);

            intent.putExtras(mBundle);
            reactContext.sendBroadcast(intent);
        }

        @Override
        public void onDescriptorWrite(BluetoothGatt gatt, BluetoothGattDescriptor descriptor,
                                      int status) {
            BluetoothGattCharacteristic characteristic = descriptor.getCharacteristic();
            String characteristicUUID = characteristic.getUuid().toString();
            Timber.d("DidWriteDescriptor %s %d", characteristicUUID, status);

            Intent intent = new Intent(Constants.ACTION_DESCRIPTOR_WRITE);
            Bundle mBundle = new Bundle();

            mBundle.putInt(Constants.EXTRA_BYTE_STATUS_VALUE, status);
            mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE, characteristicUUID);

            intent.putExtras(mBundle);
            reactContext.sendBroadcast(intent);
        }
    };

    private BluetoothAdapter.LeScanCallback bleScanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(final BluetoothDevice device, final int rssi, byte[] scanRecord) {
            MainActivity.currentActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Timber.d("Found %s", device.getName());
                    currentDevice = device;

                    scanCallBack.onDeviceFound(device, rssi);
                }
            });
        }
    };

    public void startScanForBLEDevices(DeviceScanCallBack callBack) {
        UUID[] serviceUuids = new UUID[] {
                Constants.SERVICE_UUIDS.BACKBONE_SERVICE,
        };

        if (callBack != null) {
            scanCallBack = callBack;
        }

        bluetoothAdapter.startLeScan(serviceUuids, bleScanCallback);
    }

    public void stopScan() {
        bluetoothAdapter.stopLeScan(bleScanCallback);
    }

    public BluetoothDevice getCurrentDevice() {
        return currentDevice;
    }

    public void selectDevice(BluetoothDevice device) {
        if (device != null) {
            currentDevice = device;
        }
    }

    public BluetoothDevice findDeviceByAddress(String address) {
        BluetoothDevice device;
        try {
            device = bluetoothAdapter.getRemoteDevice(address);
        } catch (IllegalArgumentException e) {
            Timber.d("Invalid Address");
            return null;
        }

        return device;
    }

    public void connectDevice(BluetoothDevice device, DeviceConnectionCallBack callBack) {
        if (device == null) {
            return;
        }

        currentDevice = device;
        bleGatt = currentDevice.connectGatt(getCurrentActivity(), false, gattCallback);

        if (callBack != null) {
            connectionCallBack = callBack;
        }

        stopScan();
    }

    /**
     * Disconnects an established connection, or cancels a connection attempt currently in progress,
     * and then closes and forgets the GATT client
     */
    public void disconnect() {
        Timber.d("disconnect()");
        if (bleGatt != null) {
            Timber.d("About to disconnect and close");
            bleGatt.disconnect();
            bleGatt.close();
            bleGatt = null;
        }
    }

    public void reconnectDevice() {
        if (currentDevice != null) {
            connectDevice(currentDevice, null);
        }
    }

    public boolean isDeviceReady() {
        return currentDevice != null && deviceState == BluetoothProfile.STATE_CONNECTED;
//        return currentDevice != null && deviceState == BluetoothProfile.STATE_CONNECTED && isDeviceBonded();
    }

    public int getDeviceState() {
        Timber.d("GetDeviceState %d", deviceState);
        return deviceState;
    }

    public boolean hasCharacteristic(UUID characteristicUUID) {
        return characteristicMap.containsKey(characteristicUUID);
    }

    public boolean toggleCharacteristicNotification(UUID characteristicUUID, boolean state) {
        boolean status = false;

        if (!characteristicMap.containsKey(characteristicUUID)) {
            Timber.d("Characteristic Not Found!");
        }
        else {
            Timber.d("Characteristic Found! %s", characteristicUUID.toString());
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            // In Android, we need to directly write into the descriptor to enable notification
            if (characteristic.getDescriptor(UUID.fromString(Constants.CLIENT_CHARACTERISTIC_CONFIG)) != null) {
                BluetoothGattDescriptor descriptor = characteristic.getDescriptor(UUID.fromString(Constants.CLIENT_CHARACTERISTIC_CONFIG));
                descriptor.setValue(state == true ? BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE : BluetoothGattDescriptor.DISABLE_NOTIFICATION_VALUE);

                status = bleGatt.writeDescriptor(descriptor);
                Timber.d("Desc write %b", status);
            }

            if (status) {
                status = bleGatt.setCharacteristicNotification(characteristic, state);
                Timber.d("Char write %b", status);
            }
        }

        return status;
    }

    public void readCharacteristic(UUID characteristicUUID) {
        if (!characteristicMap.containsKey(characteristicUUID)) {
            Timber.d("Characteristic not found!");
        }        
        else {
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            bleGatt.readCharacteristic(characteristic);            
        }
    }

    public boolean writeToCharacteristic(UUID characteristicUUID, byte[] data) {
        boolean writeStatus = false;

        if (!characteristicMap.containsKey(characteristicUUID)) {
            Timber.d("Characteristic not found!");
        }
        else {
            Timber.d("Write to %s", characteristicUUID.toString());
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            // Since Android's GATT class only allows 1 write operation at a time,
            // we might have to attempt several times until an operation succeeds
            // when there is another GATT operation still running.
            // In most cases, it should succeed right away.
            int counter = Constants.MAX_BLE_ACTION_ATTEMPT;
            do {
                characteristic.setValue(data);
                characteristic.setWriteType(BluetoothGattCharacteristic.WRITE_TYPE_DEFAULT);
                writeStatus = bleGatt.writeCharacteristic(characteristic);

                if (!writeStatus) {
                    try {
                        Thread.sleep(100, 0);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            } while (!writeStatus && (counter-- > 0));
            Timber.d("Write Status %d", writeStatus ? 1 : 0);
        }

        return writeStatus;
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        Timber.d("sendEvent");
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public void onHostResume() {
        // Activity `onResume`
        Timber.d("onHostResume");
        IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
        reactContext.registerReceiver(broadcastReceiver, filter);
    }

    @Override
    public void onHostPause() {
        // Activity `onPause`
        Timber.d("onHostPause");
        reactContext.unregisterReceiver(broadcastReceiver);
    }

    @Override
    public void onHostDestroy() {
        // Activity `onDestroy`
    }
}
