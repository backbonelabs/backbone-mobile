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

    /**
     * React Native components will call this when they need to update the local user setting
     * @param settingMap Map of setting data to be applied
     * @param callback Callback will be invoked with a JS-compatible error map if an error occurred,
     *                 otherwise it will be invoked with no arguments
     */
    @ReactMethod
    public void updateUserSetting(ReadableMap settingMap, Callback callback) {
        Timber.d("UpdateUserSetting");

        // Get the shared preference editor under private mode so the user setting can only be accessed via this app
        SharedPreferences preference = MainActivity.currentActivity.getSharedPreferences(Constants.USER_PREF_ID, MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();

        try {
            // For now, as a placeholder, I set 3 fields, each with different data type for testing
            boolean hasUpdate = false;

            if (settingMap.hasKey("name")) {
                editor.putString("name", settingMap.getString("name"));
                hasUpdate = true;
            }

            if (settingMap.hasKey("sensitivity")) {
                editor.putInt("sensitivity", settingMap.getInt("sensitivity"));
                hasUpdate = true;
            }

            if (settingMap.hasKey("shouldNotify")) {
                editor.putBoolean("shouldNotify", settingMap.getBoolean("shouldNotify"));
                hasUpdate = true;
            }

            // Update when needed
            if (hasUpdate) editor.commit();

            // Testing applied setting
            // The second parameter is used to define default value on empty keys
            Timber.d("Setting[Name]: %s", preference.getString("name", "Nameless"));
            Timber.d("Setting[Sensitivity]: %d", preference.getInt("sensitivity", 100));
            Timber.d("Setting[ShouldNotify]: %s", (preference.getBoolean("shouldNotify", true) ? "ON" : "OFF"));

            callback.invoke();
        } catch (Exception e) {
            callback.invoke(JSError.make(e.toString()));
            e.printStackTrace();
        }
    }

    @ReactMethod
    public void launchAppSettings() {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                Uri.fromParts("package", MainActivity.currentActivity.getPackageName(), null));
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        MainActivity.currentActivity.startActivity(intent);
    }
}
