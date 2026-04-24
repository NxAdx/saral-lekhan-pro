import Constants from "expo-constants";
import { NativeModules } from "react-native";

type BuildInfoNativeModule = {
  distributionChannel?: string;
  updaterMode?: string;
  runtimeFlagsUrl?: string;
  isFdroidBuild?: boolean;
};

const nativeBuildInfo = NativeModules.BuildInfoModule as BuildInfoNativeModule | undefined;
const expoConfigExtra = (Constants.expoConfig as any)?.extra;
const legacyExtra = (Constants.manifest as any)?.extra;
const manifestExtra = expoConfigExtra || legacyExtra || {};

const distributionChannel = String(
  nativeBuildInfo?.distributionChannel || manifestExtra.distributionChannel || "direct"
).trim().toLowerCase();

const updaterMode = String(nativeBuildInfo?.updaterMode || manifestExtra.updaterMode || "github")
  .trim()
  .toLowerCase();

const runtimeFlagsUrl = String(
  nativeBuildInfo?.runtimeFlagsUrl ?? manifestExtra.runtimeFlagsUrl ?? ""
).trim();

const isFdroidBuild =
  typeof nativeBuildInfo?.isFdroidBuild === "boolean"
    ? nativeBuildInfo.isFdroidBuild
    : updaterMode === "fdroid" || distributionChannel === "fdroid";

export const BUILD_INFO = {
  distributionChannel,
  updaterMode,
  runtimeFlagsUrl,
  isFdroidBuild,
};

export const DISTRIBUTION_CHANNEL = BUILD_INFO.distributionChannel;
export const UPDATER_MODE = BUILD_INFO.updaterMode;
export const RUNTIME_FLAGS_URL = BUILD_INFO.runtimeFlagsUrl;
export const IS_FDROID_BUILD = BUILD_INFO.isFdroidBuild;
