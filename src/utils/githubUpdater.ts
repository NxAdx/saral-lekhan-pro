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
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                // Optional: 'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch github releases', response.status);
            return null;
        }

        const data = await response.json();
        const latestVersionTag = data.tag_name; // e.g., 'v2.9.4'
        const currentVersion = APP_VERSION.replace(/^v/, '');

        // Strip 'v' if present for clean comparison
        const cleanLatest = latestVersionTag.replace(/^v/, '');
        const cleanCurrent = currentVersion.replace(/^v/, '');

        // Compare as semantic version parts to avoid false "update available" prompts.
        // Find the APK asset
        const assets = Array.isArray(data?.assets) ? data.assets : [];
        const apkAsset = assets.find((asset: any) => typeof asset?.name === 'string' && asset.name.endsWith('.apk'));
        const hasApk = !!apkAsset;
        const versionCompare = compareVersions(cleanLatest, cleanCurrent);
        const isReinstall = allowSameVersion && versionCompare === 0 && hasApk;
        const hasUpdate = versionCompare > 0 || isReinstall;

        if (versionCompare > 0 && !hasApk) {
            console.log('Update found but no .apk asset attached');
            return null;
        }

        if (hasUpdate) {
            return {
                hasUpdate: true,
                version: cleanLatest,
                downloadUrl: apkAsset?.browser_download_url || '',
                changelog: data.body || '',
                releaseUrl: data.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`,
                isReinstall,
            };
        }

        return {
            hasUpdate: false,
            version: cleanCurrent,
            downloadUrl: '',
            changelog: data.body || '',
            releaseUrl: data.html_url || `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/latest`,
            isReinstall: false,
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

        // Trigger Android Native Package Installer
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            // FLAG_GRANT_READ_URI_PERMISSION | FLAG_ACTIVITY_NEW_TASK
            flags: 268435457,
            type: 'application/vnd.android.package-archive',
        });

        return true;
    } catch (e) {
        console.error("Install App Error:", e);
        // Fallback: open installer permission settings and then release URL in browser.
        try {
            await IntentLauncher.startActivityAsync('android.settings.MANAGE_UNKNOWN_APP_SOURCES', {
                data: `package:${APP_PACKAGE}`,
            });
        } catch {
            // No-op; continue fallback.
        }
        try {
            await Linking.openURL(downloadUrl);
            return true;
        } catch {
            return false;
        }
    }
}
