package co.backbonelabs.backbone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import co.backbonelabs.backbone.util.Constants;

public class StepModule extends ActivityModule<Object> {
    private static final String TAG = "StepModule";

    private List<HashMap<String, Number>> previousSteps;

    private static final Double STEP_TIME_LIMIT = 15.0;
    private static final Integer MINIMUM_STEP = 30;

    public StepModule(ReactApplicationContext reactContext) {
        super(reactContext);
        name = Constants.MODULES.STEP;
        sensor = Constants.SENSORS.BMI160ACCELEROMETER;
        notificationName = "AccelerometerBMI160";
        previousSteps = new ArrayList<>();

        LocalBroadcastManager.getInstance(MainActivity.currentActivity)
                .registerReceiver(messageReceiver, new IntentFilter(notificationName));
    }

    private BroadcastReceiver messageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            Log.d(TAG, "StepModule received data");
            process(null);
        }
    };

    @Override
    public void process(Object data) {
        checkIdleTime();
    }

    private void checkIdleTime() {
        Handler mainHandler = new Handler(Looper.getMainLooper());

        Runnable checkIdleRunnable = new Runnable() {
            @Override
            public void run() {
                previousSteps.add(new HashMap<String, Number>(){{put("timestamp", System.currentTimeMillis() / 1000L);}});

                boolean found = true;
                while (found) {
                    found = false;

                    for (HashMap<String, Number> data : previousSteps) {
                        double time = data.get("timestamp").doubleValue();

                        if (System.currentTimeMillis() / 1000L - time > STEP_TIME_LIMIT) {
                            previousSteps.remove(0);
                            found = true;

                            break;
                        }
                    }
                }

                if (previousSteps.size() >= MINIMUM_STEP || !LocalNotificationManager.hasScheduledNotification(name)) {
                    LocalNotificationManager.cancelScheduledNotification(name);

                    LocalNotificationManager.scheduleNotification(name);
                }
            }
        };

        mainHandler.post(checkIdleRunnable);
    }
}
