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
import android.os.Build;
import android.os.Bundle;
import android.util.SparseIntArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.List;
import java.util.MissingFormatArgumentException;
import java.util.UUID;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.Utilities;
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
    private String currentDeviceIdentifier;
    private int currentDeviceMode = Constants.DEVICE_MODES.UNKNOWN;

    private ReactApplicationContext reactContext;
    private BluetoothAdapter bluetoothAdapter;
    private BluetoothGatt bleGatt;

    private HashMap<UUID, Boolean> serviceMap;
    private HashMap<UUID, BluetoothGattCharacteristic> characteristicMap;

    private final BroadcastReceiver broadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Timber.d("broadcastReceiver onReceive");
            final String action = intent.getAction();
            if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
                Timber.d("broadcastReceiver onReceive ACTION_STATE_CHANGED");
                state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
                WritableMap wm = Arguments.createMap();
                wm.putInt("state", bluetoothStateMap.get(state, -1));
                EventEmitter.send(reactContext, "BluetoothState", wm);
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
            Timber.d("DeviceState %d", newState);

            if (deviceState != newState) {
                deviceState = newState;

                if (newState == BluetoothProfile.STATE_CONNECTED) {
                    Timber.d("Device Connected");
                    // Enable bigger sized packet to be sent by changing the MTU size to 512
                    // This results in faster speed especially in firmware upload
                    // Only for Lollipop and above devices
                    exchangeGattMtu(512);
                }
                else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                    Timber.d("Device Disconnected");

                    serviceMap.clear();
                    characteristicMap.clear();

                    bleGatt.close();
                    bleGatt = null;

                    // GATT should be closed on all disconnect event to clear up the connection pool
                    // Set some delay for closing GATT
                    try {
                        Thread.sleep(1000, 0);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    BootLoaderService bootLoaderService = BootLoaderService.getInstance();

                    if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.INITIATED) {
                        Timber.d("Reconnect Device");
                        // Reconnect right away to proceed with the actual firmware update
                        reconnectDevice();
                    }
                    else if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.UPDATED) {
                        Timber.d("Reconnect Device Updated");
                        reconnectDevice();
                    }
                    else {
                        currentDevice = null;
                    }

                    emitDeviceState();
                }
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
                            Timber.d("Add Service %s", serviceUuid.toString());
                            serviceMap.put(serviceUuid, true);
                        }
                    }
                    else if (serviceUuid.equals(Constants.SERVICE_UUIDS.BOOTLOADER_SERVICE)) {
                        currentDeviceMode = Constants.DEVICE_MODES.BOOTLOADER;
                        Timber.d("Found Bootloader");

                        if (characteristics != null && characteristics.size() > 0) {
                            Timber.d("Add Service %s", serviceUuid.toString());
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

            Timber.d("serviceMap size: %d", serviceMap.size());
            if (currentDeviceMode == Constants.DEVICE_MODES.BACKBONE) {
                if (serviceMap.size() == 2) {
                    // Check for pending notification of a successful firmware update
                    BootLoaderService bootLoaderService = BootLoaderService.getInstance();

                    if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.UPDATED) {
                        // Successfully restarted after upgrading firmware
                        Timber.d("Firmware Updated Successfully");
                        bootLoaderService.firmwareUpdated();
                    }
                    else {
                        connectionCallBack.onDeviceConnected();

                        emitDeviceState();
                    }
                }
            }
            else if (currentDeviceMode == Constants.DEVICE_MODES.BOOTLOADER) {
                if (serviceMap.size() == 1) {
                    connectionCallBack.onDeviceConnected();

                    emitDeviceState();
                }
            }
        }

        @Override
        public void onCharacteristicRead(BluetoothGatt gatt,
                                         BluetoothGattCharacteristic characteristic, int status) {
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
            String characteristicUUID = characteristic.getUuid().toString();
            Timber.d("DidChanged %s", characteristicUUID);

            Intent intent = new Intent(Constants.ACTION_CHARACTERISTIC_UPDATE);
            Bundle mBundle = new Bundle();

            mBundle.putByteArray(Constants.EXTRA_BYTE_VALUE, characteristic.getValue());
            mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE, characteristicUUID);

            intent.putExtras(mBundle);
            reactContext.sendBroadcast(intent);
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

        @Override
        public void onMtuChanged(BluetoothGatt gatt, int mtu, int status) {
            if (status == BluetoothGatt.GATT_SUCCESS) {
                Timber.d("MTU successfully updated");
            }
            else {
                Timber.d("Error updating MTU: Code %d", status);
            }

            // Discover services after MTU update has been attempted, no matter what the status is
            gatt.discoverServices();
        }
    };

    private BluetoothAdapter.LeScanCallback bleScanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(final BluetoothDevice device, final int rssi, byte[] scanRecord) {
            MainActivity.currentActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Timber.d("Found %s", device.getName());
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

    public void connectDevice(String identifier, DeviceConnectionCallBack callBack) {
        currentDeviceIdentifier = identifier;
        currentDevice = findDeviceByAddress(currentDeviceIdentifier);

        if (currentDevice == null) {
            return;
        }

        bleGatt = currentDevice.connectGatt(getCurrentActivity(), false, gattCallback);

        if (callBack != null) {
            connectionCallBack = callBack;
        }

        stopScan();
    }

    private void emitDeviceState() {
        if (currentDevice == null) return;
        Timber.d("Emit Device State: %d", deviceState);
        WritableMap wm = Arguments.createMap();
        wm.putInt("state", deviceState);
        EventEmitter.send(reactContext, "DeviceState", wm);
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
        }
    }

    public void reconnectDevice() {
        if (currentDevice != null) {
            connectDevice(currentDeviceIdentifier, null);
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

        if (!hasCharacteristic(characteristicUUID)) {
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
        if (!hasCharacteristic(characteristicUUID)) {
            Timber.d("Characteristic not found!");
        }        
        else {
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            bleGatt.readCharacteristic(characteristic);            
        }
    }

    public boolean writeToCharacteristic(UUID characteristicUUID, byte[] data) {
        boolean writeStatus = false;

        if (!hasCharacteristic(characteristicUUID)) {
            Timber.d("Characteristic not found!");
        }
        else {
            Timber.d("Write to %s %s", characteristicUUID.toString(), Utilities.ByteArraytoHex(data));
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            // Since Android's GATT class only allows 1 write operation at a time,
            // we might have to attempt several times until an operation succeeds
            // when there is another GATT operation still running.
            // In most cases, it should succeed right away.
            int counter = Constants.MAX_BLE_ACTION_ATTEMPT;
            characteristic.setValue(data);

            do {
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

    private void exchangeGattMtu(int mtu) {
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            int retry = 5;
            boolean status = false;
            while (!status && retry > 0) {
                status = bleGatt.requestMtu(mtu);
                retry--;
            }

            try {
                Thread.sleep(1000, 0);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
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
    }

    @Override
    public void onHostDestroy() {
        // Activity `onDestroy`
        Timber.d("onHostDestroy");
    }
}
