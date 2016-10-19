package co.backbonelabs.backbone;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.support.v4.content.LocalBroadcastManager;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.WritableMap;
import com.mbientlab.metawear.module.Led;

import java.util.HashMap;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import timber.log.Timber;

public class PostureModule extends ActivityModule<HashMap<String, Float>> {
    private boolean calibrated;
    private double controlAngle;
    private double controlDistance;
    private double tilt;
    private double tiltThreshold = 10.0;
    private boolean isLedBlinking = false;

    public PostureModule(ReactApplicationContext reactContext) {
        super(reactContext);
        name = Constants.MODULES.POSTURE;
        sensor = Constants.SENSORS.ACCELEROMETER;
        notificationName = "Accelerometer";
        calibrated = false;
        tilt = 0;

        LocalBroadcastManager.getInstance(MainActivity.currentActivity)
                .registerReceiver(messageReceiver, new IntentFilter(notificationName));
    }

    private BroadcastReceiver messageReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            HashMap<String, Float> data = (HashMap<String, Float>) intent.getSerializableExtra(SensorDataService.INTENT_EXTRA_NAME);
            Timber.d("PostureModule received data: " + data.toString());
            process(data);
        }
    };

    @Override
    public void process(HashMap<String, Float> data) {
        float x = data.get("x");
        float y = data.get("y");
        float z = data.get("z");
        double currentAngle = Math.toDegrees(Math.atan2(x, z));
        double currentDistance = Math.sqrt(Math.pow(z, 2) + Math.pow(y, 2));

        if (!calibrated) {
            // Set baseline metrics
            controlAngle = currentAngle;
            controlDistance = currentDistance;
            calibrated = true;
        } else {
            // Calculate tilt
            // Tilt will be positive if leaning forward, negative if leaning backward

            // Check if current angle is in the upper or lower quadrants based on atan2
            if (currentAngle >= 0) {
                // Current angle is in the upper quadrants
                if (currentAngle >= controlAngle) {
                    // leaned back
                    tilt = -(currentAngle - controlAngle);
                } else {
                    // leaned forward
                    tilt = controlAngle - currentAngle;
                }
            } else {
                // Current angle is in the lower quadrants
                if (currentAngle >= (controlAngle - 180)) {
                    // leaned forward between 90 and 180 degrees
                    tilt = controlAngle + Math.abs(currentAngle);
                } else {
                    // leaned backward between 90 and 180 degrees
                    tilt = controlAngle - currentAngle - 360;
                }
            }
        }
        handleTilt();
    }

    private void handleTilt() {
        Led ledModule = DeviceManagementService.mwBoard.lookupModule(Led.class);

        if (ledModule != null) {
            if (Math.abs(tilt) > tiltThreshold && !isLedBlinking) {
                Timber.d("Blink LED");
                ledModule
                        .configureColorChannel(Led.ColorChannel.GREEN)
                        .setHighTime((short) 50)
                        .setHighIntensity((byte) 20)
                        .setPulseDuration((short) 100)
                        .setRepeatCount((byte) -1)
                        .commit();

                ledModule.play(false);
                isLedBlinking = true;
            } else {
                isLedBlinking = false;
                ledModule.stop(false);
            }
        }
        emitTilt();
    }

    private void emitTilt() {
        Timber.d("emitTilt " + tilt);
        WritableMap wm = Arguments.createMap();
        wm.putDouble("tilt", tilt);
        EventEmitter.send(reactContext, "PostureTilt", wm);
    }
}
