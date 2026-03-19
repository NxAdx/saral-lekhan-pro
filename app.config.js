export default ({ config }) => {
  const env = process.env.APP_ENV || 'direct'; // 'play' or 'direct'

  return {
    ...config,
    name: "Saral Lekhan",
    slug: "saral-lekhan",
    scheme: "sarallekhan",
    version: "3.0.0",
    sdkVersion: "53.0.0",
    platforms: ["ios", "android"],
    icon: "./assets/ios-light.png",
    userInterfaceStyle: "automatic",
    android: {
      package: "com.sarallekhan",
      versionCode: 300,
      newArchEnabled: true,
      permissions: env === 'play' ? [] : ["REQUEST_INSTALL_PACKAGES"],
      adaptiveIcon: {
        foregroundImage: "./assets/android-adaptive.png",
        backgroundColor: "#D9D7D2"
      },
      softwareKeyboardLayoutMode: "resize",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "sarallekhan" }],
          category: ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    extra: {
      ...config.extra,
      runtimeFlagsUrl: "https://raw.githubusercontent.com/NxAdx/saral-lekhan-pro/main/runtime-flags.json",
      distributionChannel: env,
      updaterMode: env === 'play' ? 'none' : 'github',
      eas: {
        projectId: "d9a30678-cf8c-4f8b-8c28-0b49f63f3208"
      }
    },
    updates: {
      url: "https://u.expo.dev/d9a30678-cf8c-4f8b-8c28-0b49f63f3208"
    },
    plugins: [
      "expo-router",
      "@react-native-google-signin/google-signin",
      "react-native-purchases"
    ]
  };
};
