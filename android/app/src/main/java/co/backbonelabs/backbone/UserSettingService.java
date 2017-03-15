package co.backbonelabs.backbone;

import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.provider.Settings;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.JSError;
import timber.log.Timber;

import static android.content.Context.MODE_PRIVATE;

/**
 * Interface for interacting with the local user setting via SharedPreferences
 */
public class UserSettingService extends ReactContextBaseJavaModule {
    /**
     * Public constructor
     * @param reactContext
     */
    public UserSettingService(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "UserSettingService";
    }

    @ReactMethod
    public void launchAppSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", MainActivity.currentActivity.getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        MainActivity.currentActivity.startActivity(intent);
    }
}
