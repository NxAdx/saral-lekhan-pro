import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import Constants from 'expo-constants';
import { Linking, Platform } from 'react-native';

export const APP_VERSION = (Constants.expoConfig?.version || '0.0.0').replace(/^v/, '');
const APP_PACKAGE = Constants.expoConfig?.android?.package || 'com.sarallekhan';

const REPO_OWNER = 'NxAdx';
const REPO_NAME = 'saral-lekhan-pro';

function parseVersionParts(version: string): number[] {
    return version
        .split('.')
        .map((part) => parseInt(part, 10))
        .map((part) => (Number.isFinite(part) ? part : 0));
}

function compareVersions(a: string, b: string): number {
    const left = parseVersionParts(a);
    const right = parseVersionParts(b);
    const maxLen = Math.max(left.length, right.length);

    for (let i = 0; i < maxLen; i += 1) {
        const l = left[i] ?? 0;
        const r = right[i] ?? 0;
        if (l > r) return 1;
        if (l < r) return -1;
    }
    return 0;
}

export interface UpdateInfo {
    hasUpdate: boolean;
    version: string;
    downloadUrl: string;
    changelog: string;
    releaseUrl: string;
    isReinstall: boolean;
}

/**
 * Checks the public GitHub repository for the latest release.
 * Returns information about the update if the latest tag is greater than the current app version.
 */
export async function checkForUpdate(allowSameVersion = false): Promise<UpdateInfo | null> {
    try {
        // We use the full releases list to be more robust than just '/latest' 
        // which can sometimes be delayed or skip pre-releases the user might want.
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch github releases', response.status);
            return null;
        }

        const releases = await response.json();
        if (!Array.isArray(releases) || releases.length === 0) return null;

        // Find the most recent release that has an APK
        let latestRelease = null;
        let apkAsset = null;

        for (const release of releases) {
            const assets = Array.isArray(release.assets) ? release.assets : [];
            const foundApk = assets.find((asset: any) =>
                typeof asset?.name === 'string' && asset.name.endsWith('.apk')
            );
            if (foundApk) {
                latestRelease = release;
                apkAsset = foundApk;
                break;
            }
        }

        if (!latestRelease || !apkAsset) {
            console.log('No releases with APK found');
            return null;
        }

        const latestVersionTag = latestRelease.tag_name;
        const currentVersion = APP_VERSION.replace(/^v/, '');

        const cleanLatest = latestVersionTag.replace(/^v/, '');
        const cleanCurrent = currentVersion.replace(/^v/, '');

        const versionCompare = compareVersions(cleanLatest, cleanCurrent);

        // Strict Logic:
        // 1. hasUpdate is ONLY true if cleanLatest > cleanCurrent
        // 2. isReinstall is ONLY true if cleanLatest == cleanCurrent AND allowSameVersion (manual check) is true

        const isNewVersion = versionCompare > 0;
        const isReinstall = versionCompare === 0 && allowSameVersion;
        const hasUpdate = isNewVersion || isReinstall;

        return {
            hasUpdate,
            version: cleanLatest,
            downloadUrl: apkAsset.browser_download_url,
            changelog: latestRelease.body || '',
            releaseUrl: latestRelease.html_url,
            isReinstall,
        };

    } catch (error) {
        console.error('Update Check Error:', error);
        return null;
    }
}

/**
 * Downloads the APK from the raw URL to the document directory, then triggers an Android intent to install it.
 */
export async function downloadAndInstallApk(
    downloadUrl: string,
    version: string,
    onProgress?: (progress: number) => void
): Promise<boolean> {
    if (Platform.OS !== 'android') return false;
    if (!downloadUrl) return false;

    try {
        const cacheRoot = FileSystem.cacheDirectory || FileSystem.documentDirectory || '';
        const fileUri = `${cacheRoot}saral_lekhan_update_v${version}_${Date.now()}.apk`;

        // Setup Resumable Download to track progress
        const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            (downloadProgress) => {
                const expected = downloadProgress.totalBytesExpectedToWrite || 0;
                const progress = expected > 0
                    ? downloadProgress.totalBytesWritten / expected
                    : 0;
                if (onProgress) onProgress(progress);
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result) return false;
        const contentUri = await FileSystem.getContentUriAsync(result.uri);

        // Trigger Android Native Package Installer (Fire and forget, do not await)
        IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
            flags: 268435457,
            type: 'application/vnd.android.package-archive',
        }).catch(async (intentError) => {
            console.error("Intent Error:", intentError);
            // Fallback: open installer permission settings and then release URL in browser.
            try {
                await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
                    data: `package:${APP_PACKAGE}`,
                });
            } catch {
                // No-op
            }
            Linking.openURL(downloadUrl).catch(() => { });
        });

        // Resolve immediately so UI is not stuck at "Downloading 100%"
        return true;
    } catch (e) {
        console.error("Install App Error:", e);
        try {
            await Linking.openURL(downloadUrl);
            return true;
        } catch {
            return false;
        }
    }
}
