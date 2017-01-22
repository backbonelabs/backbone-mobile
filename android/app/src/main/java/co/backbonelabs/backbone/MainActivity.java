package co.backbonelabs.backbone;

import android.app.Activity;
import android.os.Bundle;

import com.facebook.react.ReactActivity;

import timber.log.Timber;

public class MainActivity extends ReactActivity {
    public static Activity currentActivity;
    private NotificationService notificationService;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Hide splash theme
        setTheme(R.style.AppTheme);

        super.onCreate(savedInstanceState);

        // Enable Timber logging only on debug mode
        if (BuildConfig.DEBUG) {
            Timber.plant(new Timber.DebugTree());
        }

        currentActivity = this;
    }

    @Override
    protected void onResume() {
        Timber.d("onResume");
        super.onResume();
    }

    @Override
    protected void onPause() {
        Timber.d("onPause");
        super.onPause();
    }

    @Override
    public void onDestroy() {
        Timber.d("onDestroy");
        super.onDestroy();

        BluetoothService bluetoothService = BluetoothService.getInstance();

        // Disconnect from device
        if (bluetoothService.getCurrentDevice() != null) {
            bluetoothService.disconnect(null);
        }
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "backbone";
    }
}
