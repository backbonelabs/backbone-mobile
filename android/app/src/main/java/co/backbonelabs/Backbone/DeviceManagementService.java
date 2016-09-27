package co.backbonelabs.Backbone;

import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothProfile;
import android.os.Handler;
import android.os.Looper;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.mbientlab.metawear.MetaWearBoard;
import com.mbientlab.metawear.MetaWearBoard.ConnectionStateHandler;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import co.backbonelabs.Backbone.util.JSError;

public class DeviceManagementService extends ReactContextBaseJavaModule {
    private static final String TAG = "DeviceManagementService";
    public static MetaWearBoard mMWBoard;
    private boolean mScanning;
    private Handler mHandler = new Handler(Looper.getMainLooper());
    private ReactContext mReactContext;
    private BluetoothAdapter mBluetoothAdapter;

    // Stops scanning after 5 seconds
    private static final long SCAN_PERIOD = 5000;

    public DeviceManagementService(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "DeviceManagementService";
    }

    private HashMap<String, BluetoothDevice> deviceCollection;

    private BluetoothAdapter.LeScanCallback mLeScanCallback = new BluetoothAdapter.LeScanCallback() {
        @Override
        public void onLeScan(final BluetoothDevice device, final int rssi, byte[] scanRecord) {
            MainActivity.currentActivity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    BluetoothGattCallback mGattCallback = new BluetoothGattCallback() {
                        @Override
                        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
                            if (newState == BluetoothProfile.STATE_CONNECTED) {
                                gatt.discoverServices();
                            }
                        }

                        @Override
                        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
                            final String macAddress = gatt.getDevice().getAddress();
                            Log.d(TAG, macAddress + " onServicesDiscovered status: " + status);
                            if (status == BluetoothGatt.GATT_SUCCESS) {
                                Log.d(TAG, macAddress + " GATT_SUCCESS");
                                List<BluetoothGattService> services = gatt.getServices();
                                for (BluetoothGattService service : services) {
                                    UUID serviceUuid = service.getUuid();
                                    Log.d(TAG, macAddress + " uuid: " + serviceUuid);
                                    if (serviceUuid.equals(MetaWearBoard.METAWEAR_SERVICE_UUID)) {
                                        // This is a MetaWear board
                                        Log.d(TAG, "Found MetaWear board");
                                        Log.d(TAG, macAddress + " service: " + serviceUuid + " service type: " + service.getType());

                                        List<BluetoothGattCharacteristic> characteristics = service.getCharacteristics();
                                        for (BluetoothGattCharacteristic characteristic : characteristics) {
                                            Log.d(TAG, macAddress + " service: " + service.getUuid() + " characteristic: " + characteristic.getUuid());

                                            List<BluetoothGattDescriptor> descriptors = characteristic.getDescriptors();
                                            for (BluetoothGattDescriptor descriptor : descriptors) {
                                                byte[] descriptorValues = descriptor.getValue();
                                                if (descriptorValues != null) {
                                                    String dv = "";
                                                    for (byte descriptorValue : descriptorValues) {
                                                        dv = dv + descriptorValue + " :: ";
                                                    }
                                                    Log.d(TAG, "characteristic: " + characteristic.getUuid() + " descriptor: " + descriptor.getUuid() + " value: " + dv);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    };

                    // Connect to GATT server (this is not needed for MetaWear,
                    // but could serve as a useful resource later for interacting with proprietary device
                    device.connectGatt(getCurrentActivity(), false, mGattCallback);

                    // Add device to collection
                    deviceCollection.put(device.getAddress(), device);

                    // Map device collection to a JS-compatible array of JS-compatible objects
                    WritableArray deviceList = Arguments.createArray();
                    Set<Map.Entry<String, BluetoothDevice>> entrySet = deviceCollection.entrySet();
                    for (Map.Entry entry : entrySet) {
                        BluetoothDevice _device = (BluetoothDevice) entry.getValue();

                        WritableMap deviceInfo = Arguments.createMap();
                        deviceInfo.putString("name", _device.getName());
                        deviceInfo.putString("identifier", _device.getAddress());
                        deviceInfo.putInt("RSSI", rssi);

                        deviceList.pushMap(deviceInfo);
                    }

                    // Emit device array to JS
                    sendEvent(mReactContext, "DevicesFound", deviceList);

                }
            });
        }
    };

    @ReactMethod
    public void getSavedDevice(Callback callback) {
        // MetaWear's Android API does not provide a way to save/remember a device like in iOS
        callback.invoke();
    }

    @ReactMethod
    public void scanForDevices(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();
        if (mScanning) {
            callback.invoke(JSError.make("A scan has already been initiated"));
        } else if (!bluetoothService.getIsEnabled()) {
            callback.invoke(JSError.make("Bluetooth is not enabled"));
        } else {
            mScanning = true;
            deviceCollection = new HashMap<String, BluetoothDevice>();
            Log.d(TAG, "Starting scan");
            UUID[] serviceUuids = new UUID[] {
                    MetaWearBoard.METAWEAR_SERVICE_UUID,
            };
            mBluetoothAdapter = bluetoothService.getAdapter();
            mBluetoothAdapter.startLeScan(serviceUuids, mLeScanCallback);
            callback.invoke();
        }
    }

    @ReactMethod
    public void stopScanForDevices() {
        Log.d(TAG, "Stopping scan");
        mScanning = false;
        BluetoothService bluetoothService = BluetoothService.getInstance();
        mBluetoothAdapter = bluetoothService.getAdapter();
        mBluetoothAdapter.stopLeScan(mLeScanCallback);
    }

    @ReactMethod
    public void selectDevice(String macAddress, Callback callback) {
        Log.d(TAG, "selectDevice " + macAddress);
        stopScanForDevices();
        BluetoothDevice device = deviceCollection.get(macAddress);
        if (device == null) {
            callback.invoke(JSError.make("Device not in range"));
        } else {
            mMWBoard = MainActivity.metaWearServiceBinder.getMetaWearBoard(device);
            callback.invoke();
        }
    }

    private final ConnectionStateHandler stateHandler = new ConnectionStateHandler() {
        @Override
        public void connected() {
            Log.d(TAG, "MetaWearBoard connected");
            WritableMap wm = Arguments.createMap();
            wm.putBoolean("isConnected", true);
            wm.putNull("message");
            sendEvent(mReactContext, "ConnectionStatus", wm);
        }

        @Override
        public void disconnected() {
            Log.d(TAG, "MetaWearBoard disconnected");
            WritableMap wm = Arguments.createMap();
            wm.putBoolean("isConnected", false);
            wm.putNull("message");
            sendEvent(mReactContext, "ConnectionStatus", wm);
        }

        @Override
        public void failure(int status, Throwable error) {
            Log.e(TAG, "MetaWearBoard error connecting", error);
            WritableMap wm = Arguments.createMap();
            wm.putBoolean("isConnected", false);
            wm.putString("message", error.getMessage());
            sendEvent(mReactContext, "ConnectionStatus", wm);
        }
    };

    @ReactMethod
    public void connectToDevice() {
        Log.d(TAG, "connectToDevice");
        mMWBoard.setConnectionStateHandler(stateHandler);
        mMWBoard.connect();
    }

    @ReactMethod
    public void getDeviceStatus(Callback callback) {
        // MetaWear's Android library does not have a way to access the device's connection status
        // so we just return 0 all the time to simulate a Disconnected state
        callback.invoke(0);
    }

    @ReactMethod
    public void forgetDevice(Callback callback) {
        mMWBoard = null;
        if (mMWBoard == null) {
            callback.invoke();
        } else {
            callback.invoke(JSError.make("Failed to forget device"));
        }
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        Log.d(TAG, "sendEvent " + eventName);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableArray params) {
        Log.d(TAG, "sendEvent " + eventName);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
