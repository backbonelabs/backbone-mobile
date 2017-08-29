package co.backbonelabs.backbone;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;
import android.text.format.DateFormat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

/**
 * Interface for interacting with the local user setting via Intent
 */
public class UserSettingService extends ReactContextBaseJavaModule {
    private ReactApplicationContext context;

    /**
     * Public constructor
     * @param reactContext
     */
    public UserSettingService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.context = reactContext;
    }

    @Override
    public String getName() {
        return "UserSettingService";
    }

    /**
     * Launch the system preference intent
     */
    @ReactMethod
    public void launchAppSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", MainActivity.currentActivity.getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        MainActivity.currentActivity.startActivity(intent);
    }

    /**
     * Get the local device setting to check if it's using 24-hour format
     */
    @ReactMethod
    public void getDeviceClockFormat(Callback callback) {
        WritableMap response = Arguments.createMap();
        response.putBoolean("is24Hour", DateFormat.is24HourFormat(context));
        callback.invoke(null, response);
    }
}
