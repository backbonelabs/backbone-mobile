package co.backbonelabs.Backbone;

public abstract class ActivityModule {
    protected String name;
    protected String sensor;
    protected String notificationName;

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
