package co.backbonelabs.Backbone;

import android.app.Activity;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.IBinder;

import com.facebook.react.ReactActivity;
import com.mbientlab.metawear.MetaWearBleService;

public class MainActivity extends ReactActivity implements ServiceConnection {
    public static MetaWearBleService.LocalBinder metaWearServiceBinder;
    public static Activity currentActivity;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Bind the service when the activity is created
        getApplicationContext().bindService(new Intent(this, MetaWearBleService.class),
                this, Context.BIND_AUTO_CREATE);
    }

    @Override
    protected void onResume() {
        super.onResume();
        currentActivity = this;
    }

    @Override
    protected void onPause() {
        super.onPause();
        currentActivity = null;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();

        // Disconnect from device
        if (DeviceManagementService.mMWBoard != null) {
            DeviceManagementService.mMWBoard.disconnect();
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
