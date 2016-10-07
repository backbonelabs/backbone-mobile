package co.backbonelabs.backbone;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

public class EnvironmentModule extends ReactContextBaseJavaModule {
    public EnvironmentModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "Environment";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("API_SERVER_URL", BuildConfig.API_SERVER_URL);
        constants.put("DEV_MODE", BuildConfig.DEV_MODE);
        return constants;
    }
}
