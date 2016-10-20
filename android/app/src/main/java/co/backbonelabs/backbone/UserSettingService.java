package co.backbonelabs.backbone;

import android.content.SharedPreferences;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import co.backbonelabs.backbone.util.JSError;
import timber.log.Timber;

import static android.content.Context.MODE_PRIVATE;

/**
 * Interface for interacting with the local user setting via SharedPreferences
 * This is a singleton. Use getInstance() to retrieve the singleton instance.
 */
public class UserSettingService extends ReactContextBaseJavaModule {
    private static UserSettingService instance = null;
    private static final String SETTING_ID = "UserSetting";
    private ReactApplicationContext reactContext;

    /**
     * Returns the singleton instance
     * @return The singleton UserSettingService instance
     */
    public static UserSettingService getInstance() {
        return instance;
    }

    /**
     * Instantiates the singleton instance if one doesn't already exist
     * and returns the singleton instance.
     * @param reactContext The ReactApplicationContext
     * @return The singleton UserSettingService instance
     */
    public static UserSettingService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new UserSettingService(reactContext);
        }
        return instance;
    }

    /**
     * Private constructor
     * @param reactContext
     */
    private UserSettingService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
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
        SharedPreferences preference = MainActivity.currentActivity.getSharedPreferences(SETTING_ID, MODE_PRIVATE);
        SharedPreferences.Editor editor = preference.edit();

        try {
            // For now, as a placeholder, I set 3 fields, each with different data type for testing
            editor.putString("name", settingMap.getString("name"));
            editor.putInt("sensitivity", settingMap.getInt("sensitivity"));
            editor.putBoolean("shouldNotify", settingMap.getBoolean("shouldNotify"));
            editor.commit();

            // Testing applied setting
            // The second parameter is used to define default value on empty keys
            Timber.d("Setting[Name]: %s", preference.getString("name", "Nameless"));
            Timber.d("Setting[Sensitivity]: %d", preference.getInt("Sensitivity", 100));
            Timber.d("Setting[ShouldNotify]: %s", (preference.getBoolean("shouldNotify", true) ? "ON" : "OFF"));

            callback.invoke();
        } catch (Exception e) {
            callback.invoke(JSError.make(e.toString()));
            e.printStackTrace();
        }
    }
}
