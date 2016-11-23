package co.backbonelabs.backbone;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothProfile;
import android.content.SharedPreferences;
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

import static android.content.Context.MODE_PRIVATE;

public class DeviceManagementService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static final String TAG = "DeviceManagementService";
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
    public void getSavedDevice(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();
        SharedPreferences preference = MainActivity.currentActivity.getSharedPreferences(Constants.DEVICE_PREF_ID, MODE_PRIVATE);

        String address = preference.getString(Constants.SAVED_DEVICE_PREF_KEY, "");
        Timber.d("GetSaved %s", address);
        BluetoothDevice device = bluetoothService.getCurrentDevice();

        if (address != null && address.length() > 0) {
            Timber.d("reconnect %s", address);
            device = bluetoothService.findDeviceByAddress(address);

            bluetoothService.selectDevice(device);
        }

        callback.invoke(device != null);
    }

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
    public void selectDevice(String macAddress, Callback callback) {
        Timber.d("selectDevice " + macAddress);
        stopScanForDevices();
        BluetoothDevice device = deviceCollection.get(macAddress);
        if (device == null) {
            callback.invoke(JSError.make("Device not in range"));
        } else {
            BluetoothService.getInstance().selectDevice(device);

            callback.invoke();
        }
    }

    @ReactMethod
    public void connectToDevice() {
        Timber.d("connectToDevice");
        final BluetoothService bluetoothService = BluetoothService.getInstance();
        bluetoothService.connectDevice(bluetoothService.getCurrentDevice(), new BluetoothService.DeviceConnectionCallBack() {
            @Override
            public void onDeviceConnected() {
                Timber.d("DeviceConnected");
                WritableMap wm = Arguments.createMap();
                wm.putBoolean("isConnected", true);
                wm.putNull("message");
                sendEvent(reactContext, "ConnectionStatus", wm);

                rememberDevice(BluetoothService.getInstance().getCurrentDevice().getAddress());
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
            bluetoothService.stopScan();
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

    @ReactMethod
    public void forgetDevice(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();

        if (bluetoothService.getCurrentDevice() != null) {
            bluetoothService.disconnect();

            SharedPreferences preference = MainActivity.currentActivity.getSharedPreferences(Constants.DEVICE_PREF_ID, MODE_PRIVATE);
            SharedPreferences.Editor editor = preference.edit();

            editor.remove(Constants.SAVED_DEVICE_PREF_KEY);
            editor.commit();

            callback.invoke();
        } else {
            callback.invoke(JSError.make("Currently not connected to a device"));
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
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", false);
                    wm.putString("message", "Device took too long to connect");
                    sendEvent(reactContext, "ConnectionStatus", wm);
                }
            }
        };

        handler.postDelayed(runnable, interval);
    }

    private void rememberDevice(String address) {
        SharedPreferences preference = MainActivity.currentActivity.getSharedPreferences(Constants.DEVICE_PREF_ID, MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();

        try {
            editor.putString(Constants.SAVED_DEVICE_PREF_KEY, address);
            editor.commit();
        } catch (Exception e) {
            e.printStackTrace();
        }
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
