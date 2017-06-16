package co.backbonelabs.backbone;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

public class UserService extends ReactContextBaseJavaModule {
    private static UserService instance = null;
    private ReactApplicationContext reactContext;

    private String id;

    public static UserService getInstance() {
        return instance;
    }

    public static UserService getInstance(ReactApplicationContext reactContext) {
        if (instance == null) {
            instance = new UserService(reactContext);
        }
        return instance;
    }

    private UserService(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "UserService";
    }

    public String getUserId() {
        return id;
    }

    @ReactMethod
    public void setUserId(String userId) {
        id = userId;
    }

    @ReactMethod
    public void unsetUserId() {
        id = null;
    }
}
