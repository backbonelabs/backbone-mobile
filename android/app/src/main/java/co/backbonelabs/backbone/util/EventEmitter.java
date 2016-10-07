package co.backbonelabs.backbone.util;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class EventEmitter {
    public static <E> void send(ReactApplicationContext reactContext, String eventName, E params) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }
}
