package co.backbonelabs.Backbone;

import com.facebook.react.bridge.ReactApplicationContext;

import java.util.HashMap;

public abstract class ActivityModule {
    protected String name;
    protected String sensor;
    protected String notificationName;
    protected ReactApplicationContext mReactContext;

    public ActivityModule(ReactApplicationContext reactContext) {
        mReactContext = reactContext;
    }

    public String getName() {
        return name;
    }

    public String getSensor() {
        return sensor;
    }

    public String getNotificationName() {
        return notificationName;
    }

    public abstract void update();
}
