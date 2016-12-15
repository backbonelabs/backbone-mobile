package co.backbonelabs.backbone;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothProfile;
import android.os.Handler;
import android.support.annotation.Nullable;

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

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.JSError;
import timber.log.Timber;

public class DeviceManagementService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private boolean scanning;
    private ReactContext reactContext;

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

    @ReactMethod
    public void scanForDevices(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();
        if (scanning) {
            callback.invoke(JSError.make("A scan has already been initiated"));
        }
        else if (bluetoothService.getCurrentDevice() != null) {
            callback.invoke();
        }
        else if (!bluetoothService.getIsEnabled()) {
            callback.invoke(JSError.make("Bluetooth is not enabled"));
        }
        else {
            scanning = true;
            deviceCollection = new HashMap<String, BluetoothDevice>();

            Timber.d("Starting scan");
            bluetoothService.startScanForBLEDevices(new BluetoothService.DeviceScanCallBack() {
                @Override
                public void onDeviceFound(BluetoothDevice device, int rssi) {
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

            callback.invoke();
        }
    }

    @ReactMethod
    public void stopScanForDevices() {
        Timber.d("Stopping scan");
        scanning = false;
        BluetoothService bluetoothService = BluetoothService.getInstance();

        bluetoothService.stopScan();
    }

    @ReactMethod
    public void connectToDevice(String identifier) {
        Timber.d("connectToDevice %s", identifier);
        final BluetoothService bluetoothService = BluetoothService.getInstance();
        BluetoothDevice device = bluetoothService.findDeviceByAddress(identifier);
        if (device != null) {
            bluetoothService.connectDevice(device, new BluetoothService.DeviceConnectionCallBack() {
                @Override
                public void onDeviceConnected() {
                    Timber.d("DeviceConnected");
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", true);
                    wm.putNull("message");
                    sendEvent(reactContext, "ConnectionStatus", wm);
                }

                @Override
                public void onDeviceDisconnected() {
                    Timber.d("DeviceDisconnected");
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", false);
                    wm.putNull("message");
                    sendEvent(reactContext, "ConnectionStatus", wm);
                }
            });

            checkConnectTimeout();
        } else {
            // Could not retrieve a valid device
            WritableMap wm = Arguments.createMap();
            wm.putString("message", "Not a valid device");
            sendEvent(reactContext, "ConnectionStatus", wm);
        }
    }

    /**
     * Disconnects an established connection, or cancels a connection attempt currently in progress
     * @param callback Callback will be invoked with an error object if there is an exception.
     *                 Otherwise, it will be invoked with no arguments.
     */
    @ReactMethod
    public void cancelConnection(Callback callback) {
        Timber.d("Cancel device connection and any running scan");
        try {
            final BluetoothService bluetoothService = BluetoothService.getInstance();
            stopScanForDevices();
            bluetoothService.disconnect();
            callback.invoke();
        } catch (Exception e) {
            e.printStackTrace();
            callback.invoke(JSError.make(e.getMessage()));
        }
    }

    @ReactMethod
    public void getDeviceStatus(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.getCurrentDevice() != null) {
            callback.invoke(bluetoothService.getDeviceState() == BluetoothProfile.STATE_CONNECTED ? Constants.DEVICE_STATUSES.CONNECTED : Constants.DEVICE_STATUSES.DISCONNECTED);
        } else {
            callback.invoke(Constants.DEVICE_STATUSES.DISCONNECTED);
        }
    }

    private void checkConnectTimeout() {
        int interval = 1000 * 10; // 10 seconds of timeout
        Handler handler = new Handler();
        Runnable runnable = new Runnable(){
            public void run() {
                Timber.d("Check connection timeout");
                if (BluetoothService.getInstance().getDeviceState() != BluetoothProfile.STATE_CONNECTED) {
                    Timber.d("Device connection timeout");
                    BluetoothService.getInstance().disconnect();
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", false);
                    wm.putString("message", "Device took too long to connect");
                    sendEvent(reactContext, "ConnectionStatus", wm);
                }
            }
        };

        handler.postDelayed(runnable, interval);
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        Timber.d("sendEvent " + eventName);
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableArray params) {
        Timber.d("sendEvent " + eventName);
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
