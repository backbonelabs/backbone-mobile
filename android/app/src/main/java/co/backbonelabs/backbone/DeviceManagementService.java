package co.backbonelabs.backbone;

import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothProfile;
import android.os.Handler;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.JSError;
import timber.log.Timber;

public class DeviceManagementService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private boolean scanning;
    private boolean hasPendingConnection = false;
    private ReactApplicationContext reactContext;

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

    @ReactMethod
    public void scanForDevices(Callback callback) {
        BluetoothService bluetoothService = BluetoothService.getInstance();
        Timber.d("Should Scan %b", scanning);
        if (scanning) {
            callback.invoke(JSError.make("A scan has already been initiated"));
        }
        else if (!bluetoothService.getIsEnabled()) {
            callback.invoke(JSError.make("Bluetooth is not enabled"));
        }
        else {
            scanning = true;
            final HashMap<String, BluetoothDevice> deviceCollection = new HashMap<String, BluetoothDevice>();

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
                    EventEmitter.send(reactContext, "DevicesFound", deviceList);
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
        Timber.d("connectToDevice %s %d", identifier, BluetoothService.getInstance().getDeviceState());
        final BluetoothService bluetoothService = BluetoothService.getInstance();
        BluetoothDevice device = bluetoothService.findDeviceByAddress(identifier);
        if (device != null) {
            bluetoothService.connectDevice(device, new BluetoothService.DeviceConnectionCallBack() {
                @Override
                public void onDeviceConnected() {
                    Timber.d("DeviceConnected");
                    hasPendingConnection = false;
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", true);
                    wm.putInt("deviceMode", bluetoothService.getCurrentDeviceMode());
                    wm.putNull("message");
                    EventEmitter.send(reactContext, "ConnectionStatus", wm);
                }

                @Override
                public void onDeviceDisconnected() {
                    Timber.d("DeviceDisconnected");
                    hasPendingConnection = false;
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", false);
                    wm.putNull("message");
                    EventEmitter.send(reactContext, "ConnectionStatus", wm);
                }
            });

            hasPendingConnection = true;
            checkConnectTimeout();
        } else {
            // Could not retrieve a valid device
            EventEmitter.send(reactContext, "ConnectionStatus", JSError.make("Not a valid device"));
        }
    }

    /**
     * Disconnects an established connection, or cancels a connection attempt currently in progress
     * @param callback Callback will be invoked with an error object if there is an exception.
     *                 Otherwise, it will be invoked with no arguments.
     */
    @ReactMethod
    public void cancelConnection(final Callback callback) {
        Timber.d("Cancel device connection and any running scan");
        final BluetoothService bluetoothService = BluetoothService.getInstance();
        if (!bluetoothService.isDeviceReady()) {
            Timber.d("Device is not connected, do not attempt any BLE actions and respond with no error");
            callback.invoke();
        } else {
            try {
                stopScanForDevices();
                bluetoothService.disconnect(new BluetoothService.DeviceConnectionCallBack() {
                    @Override
                    public void onDeviceConnected() {
                    }

                    @Override
                    public void onDeviceDisconnected() {
                        Timber.d("Connection Cancelled");
                        hasPendingConnection = false;
                        callback.invoke();
                    }
                });
            } catch (Exception e) {
                e.printStackTrace();
                callback.invoke(JSError.make("Failed to disconnect"));
            }
        }
    }

    private void checkConnectTimeout() {
        int interval = 1000 * 10; // 10 seconds of timeout
        Handler handler = new Handler();
        Runnable runnable = new Runnable(){
            public void run() {
                Timber.d("Check connection timeout");
                if (hasPendingConnection && !BluetoothService.getInstance().isShouldRestart()) {
                    Timber.d("Device connection timeout %b", hasPendingConnection);
                    hasPendingConnection = false;

                    BluetoothService.getInstance().disconnect(null);
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", false);
                    wm.putString("message", "Device took too long to connect");
                    EventEmitter.send(reactContext, "ConnectionStatus", wm);
                }
            }
        };

        handler.postDelayed(runnable, interval);
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
