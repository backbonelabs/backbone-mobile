package co.backbonelabs.backbone;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;

import com.facebook.react.ReactActivity;
import com.mbientlab.metawear.MetaWearBleService;

import timber.log.Timber;

public class MainActivity extends ReactActivity implements ServiceConnection {
    public static MetaWearBleService.LocalBinder metaWearServiceBinder;
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

        // Set up NotificationService
        notificationService = new NotificationService(getApplicationContext());

        // Bind the service when the activity is created
        getApplicationContext().bindService(new Intent(this, MetaWearBleService.class),
                this, Context.BIND_AUTO_CREATE);

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
        bluetoothService.setShouldCloseGatt(true);

        // Disconnect from device
        if (bluetoothService.getCurrentDevice() != null) {
            bluetoothService.disconnect();
        }

        // Unbind the service when the activity is destroyed
        getApplicationContext().unbindService(this);
    }

    @Override
    public void onServiceConnected(ComponentName name, IBinder service) {
        // Typecast the binder to the service's LocalBinder class
        metaWearServiceBinder = (MetaWearBleService.LocalBinder) service;
        metaWearServiceBinder.executeOnUiThread();
    }

    @Override
    public void onServiceDisconnected(ComponentName componentName) { }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "backbone";
    }
}
