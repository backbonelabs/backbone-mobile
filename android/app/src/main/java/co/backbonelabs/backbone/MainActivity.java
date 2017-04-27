package co.backbonelabs.backbone;

import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.content.Intent;
import com.facebook.react.ReactActivity;

import co.backbonelabs.backbone.util.Constants;
import timber.log.Timber;

public class MainActivity extends ReactActivity {
    public static Activity currentActivity;
    private NotificationService notificationService;
    private Handler idleTimerHandler = new Handler();
    private Runnable idleTimerRunnable = null;

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        MainApplication.getCallbackManager().onActivityResult(requestCode, resultCode, data);
    }

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

        if (idleTimerRunnable != null) {
            Timber.d("Cancel idle timer");
            idleTimerHandler.removeCallbacks(idleTimerRunnable);
            idleTimerRunnable = null;
        }
    }

    @Override
    protected void onPause() {
        Timber.d("onPause");
        super.onPause();
    }

    @Override
    protected void onStop() {
        Timber.d("onStop");
        super.onStop();

        idleTimerRunnable = new Runnable(){
            public void run() {
                Timber.d("Check idle state");
                if (!SessionControlService.getInstance().hasActiveSession()
                        && !BootLoaderService.getInstance().isUpdatingFirmware()) {
                    // No active session found and not on firmware update, disconnect from the device to save battery
                    Timber.d("Disconnect on idle");
                    BluetoothService.getInstance().disconnect(null);
                }

                idleTimerRunnable = null;
            }
        };

        idleTimerHandler.postDelayed(idleTimerRunnable, Constants.MAX_IDLE_DURATION * 1000);
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

    @Override
    public void onBackPressed() {
        BootLoaderService bootLoaderService = BootLoaderService.getInstance();
        if (bootLoaderService.getHasPendingUpdate()) {
            Timber.d("Firmware update on progress, back-button disabled");
        }
        else {
            Timber.d("Back-button enabled");
            super.onBackPressed();
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
