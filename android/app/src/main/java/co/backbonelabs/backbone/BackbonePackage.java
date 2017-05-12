package co.backbonelabs.backbone;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.JavaScriptModule;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class BackbonePackage implements ReactPackage {
    @Override
    public List<Class<? extends JavaScriptModule>> createJSModules() {
        return Collections.emptyList();
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        modules.add(new EnvironmentModule(reactContext));
        modules.add(new Mixpanel(reactContext));
        modules.add(BluetoothService.getInstance(reactContext));
        modules.add(BootLoaderService.getInstance(reactContext));
        modules.add(new DeviceManagementService(reactContext));
        modules.add(DeviceInformationService.getInstance(reactContext));
        modules.add(SessionControlService.getInstance(reactContext));
        modules.add(VibrationMotorService.getInstance(reactContext));
        modules.add(new UserSettingService(reactContext));
        modules.add(new NotificationService(reactContext));
        return modules;
    }

}
