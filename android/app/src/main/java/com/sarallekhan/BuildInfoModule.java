package com.sarallekhan;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;

import java.util.HashMap;
import java.util.Map;

public class BuildInfoModule extends ReactContextBaseJavaModule {
    public BuildInfoModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "BuildInfoModule";
    }

    @Override
    public Map<String, Object> getConstants() {
        Map<String, Object> constants = new HashMap<>();
        constants.put("distributionChannel", BuildConfig.BUILD_CHANNEL);
        constants.put("updaterMode", BuildConfig.UPDATER_MODE);
        constants.put("runtimeFlagsUrl", BuildConfig.RUNTIME_FLAGS_URL);
        constants.put("isFdroidBuild", BuildConfig.IS_FDROID_BUILD);
        return constants;
    }
}
