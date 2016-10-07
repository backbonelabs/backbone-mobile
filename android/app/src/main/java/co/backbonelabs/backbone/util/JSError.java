package co.backbonelabs.backbone.util;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

public class JSError {
    public static WritableMap make(String message) {
        WritableMap error = Arguments.createMap();
        error.putString("message", message);
        return error;
    }

    public static WritableMap make(String message, HashMap<String, String> details) {
        WritableMap error = Arguments.createMap();
        Iterator<Map.Entry<String, String>> iterator = details.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, String> pair = iterator.next();
            error.putString(pair.getKey(), pair.getValue());
        }
        error.putString("message", message);
        return error;
    }
}
