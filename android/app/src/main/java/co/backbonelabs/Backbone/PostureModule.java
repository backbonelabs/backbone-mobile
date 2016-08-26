package co.backbonelabs.Backbone;

public class PostureModule extends ActivityModule {
    public PostureModule() {
        super();
        name = "posture";
        sensor = "accelerometer";
        notificationName = "AccelerometerNotification";
    }

    @Override
    public void update() {}
}
