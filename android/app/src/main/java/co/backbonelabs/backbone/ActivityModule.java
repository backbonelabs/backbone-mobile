package co.backbonelabs.backbone;

import com.facebook.react.bridge.ReactApplicationContext;

public abstract class ActivityModule<V> {
    protected String name;
    protected String sensor;
    protected String notificationName;
    protected ReactApplicationContext reactContext;

    public ActivityModule(ReactApplicationContext reactContext) {
        this.reactContext = reactContext;
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

    abstract void process(V data);
}
