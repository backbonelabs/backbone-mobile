package co.backbonelabs.backbone;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.github.xinthink.rnmk.ReactMaterialKitPackage;
import com.horcrux.svg.RNSvgPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import br.com.classapp.RNSensitiveInfo.RNSensitiveInfoPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost reactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
            new ReactMaterialKitPackage(),
            new RNSvgPackage(),
        new RNSensitiveInfoPackage(),
        new BackbonePackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return reactNativeHost;
  }
}
