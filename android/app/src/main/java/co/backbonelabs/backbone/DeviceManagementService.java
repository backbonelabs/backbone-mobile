package co.backbonelabs.backbone;

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
import com.facebook.react.bridge.LifecycleEventListener;
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

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.JSError;

public class DeviceManagementService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String TAG = "DeviceManagementService";
    public static MetaWearBoard mwBoard;
    private boolean scanning;
    private Handler handler = new Handler(Looper.getMainLooper());
    private ReactContext reactContext;
    private BluetoothAdapter bluetoothAdapter;

    public DeviceManagementService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;

        // Listen to the Activity's lifecycle events
        reactContext.addLifecycleEventListener(this);
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
                            // Close GATT client to release resources
                            Log.d(TAG, "Closing GATT client");
                            gatt.close();
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
                    sendEvent(reactContext, "DevicesFound", deviceList);

                }
            });
        }
    };

    @ReactMethod
    public void getSavedDevice(Callback callback) {
        callback.invoke(mwBoard != null);
    }

    @ReactMethod
    public void scanForDevices(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();
        if (scanning) {
            callback.invoke(JSError.make("A scan has already been initiated"));
        } else if (!bluetoothService.getIsEnabled()) {
            callback.invoke(JSError.make("Bluetooth is not enabled"));
        } else {
            scanning = true;
            deviceCollection = new HashMap<String, BluetoothDevice>();
            Log.d(TAG, "Starting scan");
            UUID[] serviceUuids = new UUID[] {
                    MetaWearBoard.METAWEAR_SERVICE_UUID,
            };
            bluetoothAdapter = bluetoothService.getAdapter();
            bluetoothAdapter.startLeScan(serviceUuids, mLeScanCallback);
            callback.invoke();
        }
    }

    @ReactMethod
    public void stopScanForDevices() {
        Log.d(TAG, "Stopping scan");
        scanning = false;
        BluetoothService bluetoothService = BluetoothService.getInstance();
        bluetoothAdapter = bluetoothService.getAdapter();
        bluetoothAdapter.stopLeScan(mLeScanCallback);
    }

    @ReactMethod
    public void selectDevice(String macAddress, Callback callback) {
        Log.d(TAG, "selectDevice " + macAddress);
        stopScanForDevices();
        BluetoothDevice device = deviceCollection.get(macAddress);
        if (device == null) {
            callback.invoke(JSError.make("Device not in range"));
        } else {
            mwBoard = MainActivity.metaWearServiceBinder.getMetaWearBoard(device);
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
            sendEvent(reactContext, "ConnectionStatus", wm);
        }

        @Override
        public void disconnected() {
            Log.d(TAG, "MetaWearBoard disconnected");
            WritableMap wm = Arguments.createMap();
            wm.putBoolean("isConnected", false);
            wm.putNull("message");
            sendEvent(reactContext, "ConnectionStatus", wm);
        }

        @Override
        public void failure(int status, Throwable error) {
            Log.e(TAG, "MetaWearBoard error connecting", error);
            WritableMap wm = Arguments.createMap();
            wm.putBoolean("isConnected", false);
            wm.putString("message", "Device took too long to connect");
            sendEvent(reactContext, "ConnectionStatus", wm);
        }
    };

    @ReactMethod
    public void connectToDevice() {
        Log.d(TAG, "connectToDevice");
        mwBoard.setConnectionStateHandler(stateHandler);
        mwBoard.connect();
    }

    @ReactMethod
    public void getDeviceStatus(Callback callback) {
        if (mwBoard != null) {
            callback.invoke(mwBoard.isConnected() ? Constants.DEVICE_STATUSES.CONNECTED : Constants.DEVICE_STATUSES.DISCONNECTED);
        } else {
            callback.invoke(Constants.DEVICE_STATUSES.DISCONNECTED);
        }
    }

    @ReactMethod
    public void forgetDevice(Callback callback) {
        if (mwBoard != null) {
            mwBoard.disconnect();
            mwBoard = null;
            callback.invoke();
        } else {
            callback.invoke(JSError.make("Currently not connected to a device"));
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

    @Override
    public void onHostResume() {
        // Activity `onResume`
    }

    @Override
    public void onHostPause() {
        // Activity `onPause`
        // Stop scanning regardless if a scan is in progress or not
        stopScanForDevices();
    }

    @Override
    public void onHostDestroy() {
        // Activity `onDestroy`
    }
}
