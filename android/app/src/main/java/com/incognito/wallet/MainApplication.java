package com.incognito.wallet;

import android.app.Application;

import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.airbnb.android.react.lottie.LottiePackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.List;

import io.invertase.firebase.auth.RNFirebaseAuthPackage;
import io.invertase.firebase.database.RNFirebaseDatabasePackage;
import io.invertase.firebase.fabric.crashlytics.RNFirebaseCrashlyticsPackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;
import io.invertase.firebase.analytics.RNFirebaseAnalyticsPackage;

import com.microsoft.codepush.react.CodePush;

import com.appsflyer.AppsFlyerLib;
import com.appsflyer.AppsFlyerConversionListener;
import java.util.Map;
import android.util.Log;

public class MainApplication extends Application implements ReactApplication {

  private static final String AF_DEV_KEY = "FdTLFrVc9wNVebXvZGA6Ag";
  private static final String TAG = "MainApplication";

  private final ReactNativeHost mReactNativeHost =
          new ReactNativeHost(this) {
            @Override
            public boolean getUseDeveloperSupport() {
              return BuildConfig.DEBUG;
            }

            @Override
            protected List<ReactPackage> getPackages() {
              @SuppressWarnings("UnnecessaryLocalVariable")
              List<ReactPackage> packages = new PackageList(this).getPackages();
              // Packages that cannot be autolinked yet can be added manually here, for example:
              packages.add(new RNFirebaseAuthPackage());
              packages.add(new RNFirebaseDatabasePackage());
              packages.add(new RNFirebaseMessagingPackage());
              packages.add(new RNFirebaseNotificationsPackage());
              packages.add(new RNFirebaseCrashlyticsPackage());
              packages.add(new RNFirebaseAnalyticsPackage());
              packages.add(new GomobilePackage());
              return packages;
            }

            @Override
            protected String getJSMainModuleName() {
              return "index";
            }

            @Override
            protected String getJSBundleFile() {
              return CodePush.getJSBundleFile();
            }
          };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    AppsFlyerConversionListener conversionListener = new AppsFlyerConversionListener() {
        @Override
        public void onConversionDataSuccess(Map<String, Object> conversionData) {
            for (String attrName : conversionData.keySet()) {
                Log.d(TAG, "attribute: " + attrName + " = " + conversionData.get(attrName));
            }
        }

        @Override
        public void onConversionDataFail(String errorMessage) {
            Log.d(TAG, "error getting conversion data: " + errorMessage);
        }

        @Override
        public void onAppOpenAttribution(Map<String, String> conversionData) {

            for (String attrName : conversionData.keySet()) {
                Log.d(TAG, "attribute: " + attrName + " = " + conversionData.get(attrName));
            }

        }

        @Override
        public void onAttributionFailure(String errorMessage) {
            Log.d(TAG, "error onAttributionFailure : " + errorMessage);
        }
    };

    AppsFlyerLib.getInstance().init(AF_DEV_KEY, conversionListener, getApplicationContext());
    AppsFlyerLib.getInstance().startTracking(this);
  }
}
