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
import android.os.ParcelUuid;
import android.util.SparseIntArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.MissingFormatArgumentException;
import java.util.UUID;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.DeviceScanRecord;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.Utilities;
import timber.log.Timber;

public class BluetoothService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static BluetoothService instance = null;
    private int deviceState = BluetoothProfile.STATE_DISCONNECTED;
    private int state;
    private boolean shouldRestart = false;

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
    private String currentDeviceIdentifier = "";
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

//        bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
//        state = bluetoothAdapter.getState();
    }

    public interface DeviceScanCallBack {
        void onDeviceFound(BluetoothDevice device, int rssi);
    }

    public interface DeviceConnectionCallBack {
        void onDeviceConnected();
        void onDeviceDisconnected();
    }

    private DeviceScanCallBack scanCallBack;
    private DeviceConnectionCallBack connectionCallBack = null, disconnectCallBack = null;

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
     * @param callback The Bluetooth state is passed in the second argument as a key of a map
     */
    @ReactMethod
    public void getState(Callback callback) {
        WritableMap response = Arguments.createMap();
        response.putInt("state", bluetoothStateMap.get(state, -1));
        callback.invoke(null, response);
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
            Timber.d("DeviceState %d %d", newState, status);

            if (status == 133) {
                // Set up some delay before another connect attempt
                try {
                    Thread.sleep(1000, 0);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                // Device was not yet ready, retry the connection
                connectDevice(currentDevice, connectionCallBack);
            }
            else if (deviceState != newState) {
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

                    try {
                        Method refreshMethod = bleGatt.getClass().getMethod("refresh", null);
                        if (refreshMethod != null) {
                            Timber.d("Clearing cache of GATT services");
                            boolean clearStatus = ((boolean)refreshMethod.invoke(bleGatt));
                            Timber.d("Cache clear %b", clearStatus);
                        }
                    } catch (Exception localException) {
                        Timber.e(localException, "Couldn't find refresh method");
                    }

                    // Set up some delay to finish the cache clearing before closing the GATT
                    try {
                        Thread.sleep(1000, 0);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    if (bleGatt != null) {
                        bleGatt.close();
                        bleGatt = null;
                    }

                    // GATT should be closed on all disconnect event to clear up the connection pool
                    // Set some delay for closing GATT and device transition
                    try {
                        Thread.sleep(1500, 0);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }

                    BootLoaderService bootLoaderService = BootLoaderService.getInstance();

                    if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.INITIATED) {
                        Timber.d("Disconnected while in BOOTLOADER_STATES.INITIATED");
                        Timber.d("Reconnect Device");
                        // Reconnect right away to proceed with the actual firmware update
                        reconnectDevice();

                    }
                    else if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.ON && shouldRestart) {
                        Timber.d("Disconnected while in BOOTLOADER_STATES.ON");
                        Timber.d("Reconnect Restart");
                        reconnectDevice();
                    }
                    else if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.UPDATED) {
                        Timber.d("Disconnected while in BOOTLOADER_STATES.UPDATED");
                        Timber.d("Reconnect Device Updated");
                        reconnectDevice();
                    }
                    else {
                        currentDevice = null;
                        deviceState = BluetoothProfile.STATE_DISCONNECTED;

                        if (disconnectCallBack != null) {
                            disconnectCallBack.onDeviceDisconnected();
                            disconnectCallBack = null;
                        }

                        emitDeviceState();
                    }
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
                if (shouldRestart) shouldRestart = false;

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
            BootLoaderService bootLoaderService = BootLoaderService.getInstance();

            if (currentDeviceMode == Constants.DEVICE_MODES.BACKBONE) {
                if (serviceMap.size() == 2) {
                    Timber.d("Found all services in Backbone mode");
                    // Check for pending notification of a successful firmware update
                    if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.UPDATED) {
                        // Successfully restarted after upgrading firmware.
                        // Notify the update and refresh device state
                        Timber.d("Firmware Updated Successfully");
                        bootLoaderService.firmwareUpdated();
                        DeviceInformationService.getInstance(reactContext).refreshDeviceTestStatus();
                        emitDeviceState();
                    }
                    else {
                        if (connectionCallBack != null) {
                            connectionCallBack.onDeviceConnected();
                            connectionCallBack = null;
                        }
                        else {
                            emitDeviceState();
                        }
                    }

                    bootLoaderService.setBootLoaderState(Constants.BOOTLOADER_STATES.OFF);
                }
            }
            else if (currentDeviceMode == Constants.DEVICE_MODES.BOOTLOADER) {
                if (serviceMap.size() == 1) {
                    if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.OFF) {
                        shouldRestart = true;
                    }
                    else if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.ON) {
                        shouldRestart = false;

                        if (connectionCallBack != null) {
                            connectionCallBack.onDeviceConnected();
                            connectionCallBack = null;
                        }
                        else {
                            emitDeviceState();
                        }
                    }
                    else if (bootLoaderService.getBootLoaderState() == Constants.BOOTLOADER_STATES.UPLOADING) {
                        Timber.d("Abort previous firmware update");
                        // Connection was restored after a lost connection when a firmware update was running
                        // Reset back to initial bootloader state
                        bootLoaderService.setBootLoaderState(Constants.BOOTLOADER_STATES.ON);

                        if (connectionCallBack != null) {
                            connectionCallBack.onDeviceConnected();
                            connectionCallBack = null;
                        }
                        else {
                            emitDeviceState();
                        }
                    }
                    Timber.d("Found all services in Bootloader mode");
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
            mBundle.putString(Constants.EXTRA_BYTE_UUID_VALUE,  characteristicUUID);

            if (status == BluetoothGatt.GATT_SUCCESS) {
                mBundle.putByteArray(Constants.EXTRA_BYTE_VALUE, characteristic.getValue());
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
            Timber.d("Discovering services...");
            gatt.discoverServices();
        }
    };

    private BluetoothAdapter.LeScanCallback bleScanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(final BluetoothDevice device, final int rssi, final byte[] scanRecord) {
            MainActivity.currentActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Timber.d("Found %s", device.getName());
                    boolean isBackboneDevice = false;
                    List<ParcelUuid> serviceUuids = DeviceScanRecord.getServiceUuids(scanRecord);
                    for (int i = 0; i < serviceUuids.size(); i++) {
                        Timber.d("Serve %s", serviceUuids.get(i).getUuid().toString());
                        if (serviceUuids.get(i).getUuid().equals(Constants.SERVICE_UUIDS.BACKBONE_SERVICE) ||
                                serviceUuids.get(i).getUuid().equals(Constants.SERVICE_UUIDS.BOOTLOADER_SERVICE)) {
                            Timber.d("Valid Device");
                            isBackboneDevice = true;
                            break;
                        }
                    }

                    if (isBackboneDevice) {
                        scanCallBack.onDeviceFound(device, rssi);
                    }
                }
            });
        }
    };

    public void startScanForBLEDevices(DeviceScanCallBack callBack) {
        if (callBack != null) {
            scanCallBack = callBack;
        }

        bluetoothAdapter.startLeScan(bleScanCallback);
    }

    public void stopScan() {
        bluetoothAdapter.stopLeScan(bleScanCallback);
    }

    public BluetoothDevice getCurrentDevice() {
        return currentDevice;
    }

    public String getCurrentDeviceIdentifier() {
        return currentDeviceIdentifier;
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

        Timber.d("Connecting to GATT server");

        currentDevice = device;
        currentDeviceIdentifier = currentDevice.getAddress();

        bleGatt = currentDevice.connectGatt(getCurrentActivity(), false, gattCallback);

        if (callBack != null) {
            connectionCallBack = callBack;
        }

        stopScan();
    }

    public void emitDeviceState() {
        Timber.d("Emit Device State: %d", deviceState);
        WritableMap wm = Arguments.createMap();
        wm.putInt("state", deviceState);
        EventEmitter.send(reactContext, "DeviceState", wm);
    }

    /**
     * Disconnects an established connection, or cancels a connection attempt currently in progress,
     * and then closes and forgets the GATT client
     */
    public void disconnect(DeviceConnectionCallBack callback) {
        Timber.d("disconnect()");
        if (callback != null) {
            disconnectCallBack = callback;
        }

        // Check for both GATT state and device state
        if (bleGatt == null || (currentDevice != null && deviceState == BluetoothProfile.STATE_DISCONNECTED)) {
            Timber.d("Device is not connected, skipping GATT disconnect");
            if (disconnectCallBack != null) {
                disconnectCallBack.onDeviceDisconnected();
                disconnectCallBack = null;
            }
        } else {
            Timber.d("About to disconnect and close");
            bleGatt.disconnect();
        }
    }

    public void reconnectDevice() {
        if (currentDevice != null) {
            connectDevice(currentDevice, null);
        }
    }

    public boolean isDeviceReady() {
        return bleGatt != null && currentDevice != null && deviceState == BluetoothProfile.STATE_CONNECTED;
//        return currentDevice != null && deviceState == BluetoothProfile.STATE_CONNECTED && isDeviceBonded();
    }

    public int getDeviceState() {
        Timber.d("GetDeviceState %d", deviceState);
        return deviceState;
    }

    public int getCurrentDeviceMode() {
        return currentDeviceMode;
    }

    public boolean isShouldRestart() {
        return shouldRestart;
    }

    public boolean hasCharacteristic(UUID characteristicUUID) {
        return characteristicMap.containsKey(characteristicUUID);
    }

    public BluetoothGattCharacteristic getCharacteristic(UUID characteristicUUID) {
        return characteristicMap.get(characteristicUUID);
    }

    public boolean toggleCharacteristicNotification(UUID characteristicUUID, boolean state) {
        boolean status = false;

        if (!hasCharacteristic(characteristicUUID)) {
            Timber.d("Characteristic Not Found!");
        }
        else {
            Timber.d("Characteristic Found! %s", characteristicUUID.toString());
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            if (!isDeviceReady() || characteristic == null) {
                // Connection was lost in the middle of the request
                Timber.d("GATT Connection Lost");
                return false;
            }

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

    public boolean readCharacteristic(UUID characteristicUUID) {
        boolean readStatus = false;

        if (!hasCharacteristic(characteristicUUID)) {
            Timber.d("Characteristic not found!");
        }
        else {
            BluetoothGattCharacteristic characteristic = characteristicMap.get(characteristicUUID);

            // Only one GATT operation can run at any point in time,
            // so we might have to make several read attempts when
            // there is another GATT operation running
            int counter = Constants.MAX_BLE_ACTION_ATTEMPT;

            do {
                if (!isDeviceReady() || characteristic == null) {
                    // Connection was lost in the middle of the request
                    Timber.d("GATT Connection Lost");
                    return false;
                }

                readStatus = bleGatt.readCharacteristic(characteristic);

                if (!readStatus) {
                    try {
                        Thread.sleep(100, 0);
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                }
            } while (!readStatus && (--counter > 0));
        }

        return readStatus;
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
                if (!isDeviceReady() || characteristic == null) {
                    // Connection was lost in the middle of the request
                    Timber.d("GATT Connection Lost");
                    return false;
                }

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
        boolean status = false;

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP && bleGatt != null) {
            int retry = 5;

            while (!status && retry > 0) {
                status = bleGatt.requestMtu(mtu);
                retry--;
            }
        }

        if (!status) {
            // Failed updating MTU, proceed to discovering services
            bleGatt.discoverServices();
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
