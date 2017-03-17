package co.backbonelabs.backbone;

import android.content.Intent;
import android.net.Uri;
import android.provider.Settings;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Interface for interacting with the local user setting via Intent
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
