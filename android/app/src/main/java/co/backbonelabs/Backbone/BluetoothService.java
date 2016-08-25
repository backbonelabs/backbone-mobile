package co.backbonelabs.Backbone;

import android.app.Activity;
import android.bluetooth.BluetoothAdapter;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.annotation.Nullable;
import android.util.Log;
import android.util.SparseIntArray;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.MissingFormatArgumentException;

public class BluetoothService extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private static BluetoothService instance = null;
    private static final String TAG = "BluetoothService";

    public static BluetoothService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new BluetoothService(reactContext);
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

    private ReactContext mReactContext;
    private BluetoothAdapter mBluetoothAdapter;

    private final BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            final String action = intent.getAction();
            if (action.equals(BluetoothAdapter.ACTION_STATE_CHANGED)) {
                final int state = intent.getIntExtra(BluetoothAdapter.EXTRA_STATE, BluetoothAdapter.ERROR);
                WritableMap wm = Arguments.createMap();
                wm.putInt("state", bluetoothStateMap.get(state, -1));
                sendEvent(mReactContext, "BluetoothState", wm);
            }
        }
    };

    private BluetoothService(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;

        // Listen to the Activity's lifecycle events
        reactContext.addLifecycleEventListener(this);

        mBluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
    }

    /**
     * Checks if Bluetooth is enabled
     * @param promise Resolves with a boolean indicating if Bluetooth is enabled or not
     */
    @ReactMethod
    public void getIsEnabled(Promise promise) {
        if (promise != null) {
            promise.resolve(mBluetoothAdapter != null && mBluetoothAdapter.isEnabled());
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

    private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
        Log.d(TAG, "sendEvent");
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @Override
    public void onHostResume() {
        // Activity `onResume`
        Log.d(TAG, "onHostResume");
        IntentFilter filter = new IntentFilter(BluetoothAdapter.ACTION_STATE_CHANGED);
        mReactContext.registerReceiver(mBroadcastReceiver, filter);
    }

    @Override
    public void onHostPause() {
        // Activity `onPause`
        Log.d(TAG, "onHostPause");
        mReactContext.unregisterReceiver(mBroadcastReceiver);
    }

    @Override
    public void onHostDestroy() {
        // Activity `onDestroy`
    }
}
