package co.backbonelabs.backbone;

import android.app.Application;

import com.facebook.CallbackManager;
import com.facebook.FacebookSdk;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import com.facebook.appevents.AppEventsLogger;
import com.facebook.react.ReactApplication;
import com.bugsnag.BugsnagReactNative;
import com.rnfs.RNFSPackage;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;
import com.horcrux.svg.SvgPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

    private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

    protected static CallbackManager getCallbackManager() {
        return mCallbackManager;
    }

    private final ReactNativeHost reactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new FBSDKPackage(mCallbackManager),
                BugsnagReactNative.getPackage(),
                new RNFSPackage(),
                new ReactMaterialKitPackage(),
                new SvgPackage(),
                new RNSensitiveInfoPackage(),
                new BackbonePackage()
            );
        }
    };

    @Override
    public ReactNativeHost getReactNativeHost() {
        return reactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        SoLoader.init(this, /* native exopackage */ false);
        FacebookSdk.sdkInitialize(getApplicationContext());
        // If you want to use AppEventsLogger to log events.
        AppEventsLogger.activateApp(this);
    }
}
