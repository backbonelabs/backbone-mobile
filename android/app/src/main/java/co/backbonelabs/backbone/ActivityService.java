package co.backbonelabs.backbone;

import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.lang.reflect.Constructor;
import java.util.HashMap;

import co.backbonelabs.backbone.util.Constants;
import co.backbonelabs.backbone.util.EventEmitter;
import co.backbonelabs.backbone.util.JSError;

/**
 * Interface for enabling and disabling activities.
 * This is a singleton. Use getInstance() to retrieve the singleton instance.
 */
public class ActivityService extends ReactContextBaseJavaModule {
    private static final String TAG = "ActivityService";
    private static ActivityService instance = null;
    private static HashMap<String, Class> activityClassMap = new HashMap<String, Class>() {
        {
            put(Constants.MODULES.POSTURE, PostureModule.class);
            put(Constants.MODULES.STEP, StepModule.class);
        }
    };
    private ReactApplicationContext reactContext;

    /**
     * Returns the singleton instance
     * @return The singleton ActivityService instance
     */
    public static ActivityService getInstance() {
        return instance;
    }

    /**
     * Instantiates the singleton instance if one doesn't already exist
     * and returns the singleton instance.
     * @param reactContext The ReactApplicationContext
     * @return The singleton ActivityService instance
     */
    public static ActivityService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new ActivityService(reactContext);
        }
        return instance;
    }

    /**
     * Private constructor
     * @param reactContext
     */
    private ActivityService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
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
                ActivityModule activityModule = (ActivityModule) constructor.newInstance(reactContext);
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
     * The ACTIVITY_DISABLED event will be emitted after the module is disabled, and it will include
     * a module property whose value is the name of the activity.
     * @param activityName Name of the activity
     */
    @ReactMethod
    public void disableActivity(String activityName) {
        Log.d(TAG, "disableActivity");
        if (activityClassMap.containsKey(activityName)) {
            SensorDataService sensorDataService = SensorDataService.getInstance();
            sensorDataService.unregisterActivity(activityName);

            // Emit event to RN
            WritableMap wm = Arguments.createMap();
            wm.putString("module", activityName);
            EventEmitter.send(reactContext, Constants.EVENTS.ACTIVITY_DISABLED, wm);
        }
    }
}
