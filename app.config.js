const packageJson = require("./package.json");

const BUILD_TARGET = String(process.env.SARAL_BUILD_TARGET || "direct").trim().toLowerCase();
const isFdroidBuild = BUILD_TARGET === "fdroid";

module.exports = {
  expo: {
    name: "Saral Lekhan",
    slug: "saral-lekhan",
    scheme: "sarallekhan",
    version: packageJson.version,
    sdkVersion: "49.0.0",
    platforms: ["ios", "android"],
    icon: "./assets/ios-light.png",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/splash-icon-dark.png",
      resizeMode: "contain",
      backgroundColor: "#D9D7D2",
      dark: {
        image: "./assets/splash-icon-light.png",
        backgroundColor: "#1C1A17",
      },
    },
    android: {
      jsEngine: "hermes",
      package: "com.sarallekhan",
      versionCode: Number(packageJson.androidVersionCode || 1),
      newArchEnabled: true,
      adaptiveIcon: {
        foregroundImage: "./assets/android-adaptive.png",
        backgroundColor: "#D9D7D2",
      },
      softwareKeyboardLayoutMode: "resize",
      intentFilters: [
        {
          action: "VIEW",
          autoVerify: true,
          data: [{ scheme: "sarallekhan" }],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    extra: {
      runtimeFlagsUrl: isFdroidBuild
        ? ""
        : "https://raw.githubusercontent.com/NxAdx/saral-lekhan-pro/main/runtime-flags.json",
      distributionChannel: isFdroidBuild ? "fdroid" : "direct",
      updaterMode: isFdroidBuild ? "fdroid" : "github",
      eas: {
        projectId: "d9a30678-cf8c-4f8b-8c28-0b49f63f3208",
      },
    },
    plugins: ["expo-router"],
  },
};
