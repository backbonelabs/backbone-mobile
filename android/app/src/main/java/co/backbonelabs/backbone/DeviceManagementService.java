package co.backbonelabs.backbone;

import android.bluetooth.BluetoothDevice;
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
import java.util.ArrayList;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.JSError;
import timber.log.Timber;

public class DeviceManagementService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private boolean scanning;
    private Handler connectionTimerHandler = null;
    private Runnable connectionTimerRunnable = null;
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
            final HashMap<String, ArrayList> deviceCollection = new HashMap<String, ArrayList>();

            Timber.d("Starting scan");
            bluetoothService.startScanForBLEDevices(new BluetoothService.DeviceScanCallBack() {
                @Override
                public void onDeviceFound(BluetoothDevice device, int rssi) {
                    // Create a Arraylist for every new bluetooth device found. Array
                    // stores the bluetooth device name, address, and RSSI
                    ArrayList newDeviceInfo = new ArrayList();
                    newDeviceInfo.add(device.getName());
                    newDeviceInfo.add(device.getAddress());
                    newDeviceInfo.add(rssi);
                    deviceCollection.put(device.getAddress(), newDeviceInfo);

                    // Map device collection to a JS-compatible array of JS-compatible objects
                    WritableArray deviceList = Arguments.createArray();
                    Set<Map.Entry<String, ArrayList>> entrySet = deviceCollection.entrySet();
                    for (Map.Entry entry : entrySet) {
                        ArrayList deviceEntryArray = (ArrayList)entry.getValue();
                        WritableMap deviceInfo = Arguments.createMap();
                        deviceInfo.putString("name", deviceEntryArray.get(0).toString());
                        deviceInfo.putString("identifier", deviceEntryArray.get(1).toString());
                        deviceInfo.putInt("RSSI", (int) deviceEntryArray.get(2));

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
                    if (connectionTimerRunnable != null) {
                        Timber.d("Cancel connection timeout");
                        connectionTimerHandler.removeCallbacks(connectionTimerRunnable);
                        connectionTimerRunnable = null;
                    }

                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", true);
                    wm.putInt("deviceMode", bluetoothService.getCurrentDeviceMode());
                    wm.putNull("message");
                    EventEmitter.send(reactContext, "ConnectionStatus", wm);
                }

                @Override
                public void onDeviceDisconnected() {
                    Timber.d("DeviceDisconnected");
                    WritableMap wm = Arguments.createMap();
                    wm.putBoolean("isConnected", false);
                    wm.putNull("message");
                    EventEmitter.send(reactContext, "ConnectionStatus", wm);
                }
            });

            if (connectionTimerHandler == null) {
                connectionTimerHandler = new Handler();
            }
            else if (connectionTimerRunnable != null) {
                Timber.d("Cancel connection timeout");
                connectionTimerHandler.removeCallbacks(connectionTimerRunnable);
                connectionTimerRunnable = null;
            }

            connectionTimerRunnable = new Runnable(){
                public void run() {
                    connectionTimerRunnable = null;

                    Timber.d("Device connection timeout");
                    BluetoothService.getInstance().disconnect(new BluetoothService.DeviceConnectionCallBack() {
                        @Override
                        public void onDeviceConnected() {
                        }

                        @Override
                        public void onDeviceDisconnected() {
                            WritableMap wm = Arguments.createMap();
                            wm.putBoolean("isConnected", false);
                            wm.putString("message", "Device took too long to connect");
                            EventEmitter.send(reactContext, "ConnectionStatus", wm);
                        }
                    });
                }
            };

            connectionTimerHandler.postDelayed(connectionTimerRunnable, Constants.CONNECTION_TIMEOUT * 1000);
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
        try {
            final BluetoothService bluetoothService = BluetoothService.getInstance();
            stopScanForDevices();
            bluetoothService.disconnect(new BluetoothService.DeviceConnectionCallBack() {
                @Override
                public void onDeviceConnected() {
                }

                @Override
                public void onDeviceDisconnected() {
                    Timber.d("Connection Cancelled");
                    callback.invoke();
                }
            });
        } catch (Exception e) {
            e.printStackTrace();
            callback.invoke(JSError.make("Failed to disconnect"));
        }
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
