package co.backbonelabs.Backbone;

import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.lang.reflect.Constructor;
import java.util.HashMap;

import co.backbonelabs.Backbone.util.JSError;

public class ActivityService extends ReactContextBaseJavaModule {
    private static final String TAG = "ActivityService";
    private static HashMap<String, Class> activityClassMap = new HashMap<String, Class>() {
        {
            put("posture", PostureModule.class);
        }
    };
    private ReactApplicationContext mReactContext;

    public ActivityService(ReactApplicationContext reactContext) {
        super(reactContext);
        mReactContext = reactContext;
    }

    @Override
    public String getName() {
        return "ActivityService";
    }

    /**
     * React Native components will call this when they need to enable a particular activity module.
     * @param activityName Name of the activity module to enable
     * @param callback Callback will be invoked with a JS-compatible error map if an error occurred,
     *                 otherwise it will be invoked with no arguments
     */
    @ReactMethod
    public void enableActivity(String activityName, Callback callback) {
        Log.d(TAG, "enableActivity");
        if (!activityClassMap.containsKey(activityName)) {
            callback.invoke(JSError.make("Invalid activity module"));
        } else {
            // Instantiate the appropriate ActivityModule subclass
            // and register it as an observer to SensorDataService
            Class<ActivityModule> _class = activityClassMap.get(activityName);
            try {
                Constructor<?> constructor = _class.getConstructor(ReactApplicationContext.class);
                ActivityModule activityModule = (ActivityModule) constructor.newInstance(mReactContext);
                Log.d(TAG, "Instantiated " + activityModule.getClass().getName() + " activity");

                SensorDataService sensorDataService = SensorDataService.getInstance();
                sensorDataService.registerActivity(activityModule);
                callback.invoke();
            } catch (Exception e) {
                callback.invoke(JSError.make(e.toString()));
                e.printStackTrace();
            }
        }
    }

    /**
     * React Native components will call this when they need to disable a particular activity module.
     * @param activityName Name of the activity
     */
    @ReactMethod
    public void disableActivity(String activityName) {
        Log.d(TAG, "disableActivity");
        if (activityClassMap.containsKey(activityName)) {
            SensorDataService sensorDataService = SensorDataService.getInstance();
            sensorDataService.unregisterActivity(activityName);
        }
    }
}
