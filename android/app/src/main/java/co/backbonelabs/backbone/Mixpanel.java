package co.backbonelabs.backbone;

import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableMapKeySetIterator;
import com.facebook.react.bridge.ReadableType;
import com.mixpanel.android.mpmetrics.MixpanelAPI;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * React Native wrapper for the Mixpanel Android API
 * Most of this code was copied from https://github.com/davodesign84/react-native-mixpanel
 */
public class Mixpanel extends ReactContextBaseJavaModule implements LifecycleEventListener {
    private MixpanelAPI mixpanel;

    public Mixpanel(ReactApplicationContext reactContext) {
        super(reactContext);
        String projectToken = BuildConfig.MIXPANEL_TOKEN;
        mixpanel = MixpanelAPI.getInstance(reactContext.getCurrentActivity(), projectToken);
    }

    /**
     * Converts a ReadableMap object from React Native to a JSONObject.
     * @param readableMap The ReadableMap object to convert to a JSONObject
     * @return JSONObject equivalent of readableMap
     * @throws JSONException
     */
    static JSONObject reactToJSON(ReadableMap readableMap) throws JSONException {
        JSONObject jsonObject = new JSONObject();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while(iterator.hasNextKey()){
            String key = iterator.nextKey();
            ReadableType valueType = readableMap.getType(key);
            switch (valueType){
                case Null:
                    jsonObject.put(key,JSONObject.NULL);
                    break;
                case Boolean:
                    jsonObject.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    jsonObject.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    jsonObject.put(key, readableMap.getString(key));
                    break;
                case Map:
                    jsonObject.put(key, reactToJSON(readableMap.getMap(key)));
                    break;
                case Array:
                    jsonObject.put(key, reactToJSON(readableMap.getArray(key)));
                    break;
            }
        }

        return jsonObject;
    }

    /**
     * Converts a ReadableArray object from React Native to a JSONObject.
     * @param readableArray The ReadableArray object to convert to a JSONObject
     * @return JSONObject equivalent of readableArray
     * @throws JSONException
     */
    static JSONArray reactToJSON(ReadableArray readableArray) throws JSONException {
        JSONArray jsonArray = new JSONArray();
        for(int i=0; i < readableArray.size(); i++) {
            ReadableType valueType = readableArray.getType(i);
            switch (valueType){
                case Null:
                    jsonArray.put(JSONObject.NULL);
                    break;
                case Boolean:
                    jsonArray.put(readableArray.getBoolean(i));
                    break;
                case Number:
                    jsonArray.put(readableArray.getDouble(i));
                    break;
                case String:
                    jsonArray.put(readableArray.getString(i));
                    break;
                case Map:
                    jsonArray.put(reactToJSON(readableArray.getMap(i)));
                    break;
                case Array:
                    jsonArray.put(reactToJSON(readableArray.getArray(i)));
                    break;
            }
        }
        return jsonArray;
    }

    @Override
    public String getName() {
        return "Mixpanel";
    }

    /**
     * Track an event with no properties
     * @param name The name of the event to send
     */
    @ReactMethod
    public void track(final String name) {
        mixpanel.track(name);
    }

    /**
     * Track an event with properties
     * @param name The name of the event to send
     * @param props Key-value pairs of the properties to include in the event
     */
    @ReactMethod
    public void trackWithProperties(final String name, final ReadableMap props) {
        JSONObject obj = null;
        try {
            obj = Mixpanel.reactToJSON(props);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        mixpanel.track(name, obj);
    }

    /**
     * Create an alias for linking a user ID to the current ID
     * @param newId New ID to link to current ID
     */
    @ReactMethod
    public void createAlias(final String newId) {
        mixpanel.alias(newId, mixpanel.getDistinctId());
    }

    /**
     * Associate future calls to track(String) with the user identified by the given distinct ID
     * @param userId A unique identifier for the user
     */
    @ReactMethod
    public void identify(final String userId) {
        mixpanel.identify(userId);
        mixpanel.getPeople().identify(userId);
    }

    /**
     * Begin timing of an event
     * @param event The name of the event to track with timing
     */
    @ReactMethod
    public void timeEvent(final String event) {
        mixpanel.timeEvent(event);
    }

    /**
     * Register properties that will be sent with every subsequent call to track(String)
     * @param properties Super properties to register
     */
    @ReactMethod
    public void registerSuperProperties(final ReadableMap properties) {
        JSONObject obj = null;
        try {
            obj = Mixpanel.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        mixpanel.registerSuperProperties(obj);
    }

    /**
     * Register super properties like registerSuperProperties(ReadableMap), but only
     * if no other super property with the same names have already been registered
     * @param properties Super properties to register
     */
    @ReactMethod
    public void registerSuperPropertiesOnce(final ReadableMap properties) {
        JSONObject obj = null;
        try {
            obj = Mixpanel.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        mixpanel.registerSuperPropertiesOnce(obj);
    }

    /**
     * Set a collection of properties on a user all at once
     * @param properties Key-value pair of property names and values
     */
    @ReactMethod
    public void set(final ReadableMap properties) {
        JSONObject obj = null;
        try {
            obj = Mixpanel.reactToJSON(properties);
        } catch (JSONException e) {
            e.printStackTrace();
        }

        mixpanel.getPeople().set(obj);
    }

    /**
     * Increment an existing numbered user property
     * @param property The user property to update
     * @param count The amount to be added to the current value of the property
     */
    @ReactMethod
    public void incrementUserPropertyBy(final String property, final double count) {
        mixpanel.getPeople().increment(property, count);
    }

    /**
     * Clear all distinct IDs, super properties, and push registrations from persistent storage,
     * and then flush the events
     */
    @ReactMethod
    public void reset() {
        mixpanel.reset();
        mixpanel.flush();
    }

    /**
     * Push all queued events and user profile changes to Mixpanel
     */
    @ReactMethod
    public void flush() {
        mixpanel.flush();
    }

    @Override
    public void onHostResume() {
        // Actvity `onResume`
    }

    @Override
    public void onHostPause() {
        // Actvity `onPause`

        if (mixpanel != null) {
            mixpanel.flush();
        }
    }

    @Override
    public void onHostDestroy() {
        // Actvity `onDestroy`

        if (mixpanel != null) {
            mixpanel.flush();
        }
    }
}
