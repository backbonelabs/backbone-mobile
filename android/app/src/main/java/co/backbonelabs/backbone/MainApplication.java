package co.backbonelabs.backbone;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.brentvatne.react.ReactVideoPackage;
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
    private final ReactNativeHost reactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                new MainReactPackage(),
                new BridgePackage(),
                new ReactVideoPackage(),
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
    }
}
