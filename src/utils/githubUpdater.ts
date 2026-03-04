import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';

// Hardcoded to match app.json — update when bumping version
export const APP_VERSION = '2.9.9';

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
}

/**
 * Checks the public GitHub repository for the latest release.
 * Returns information about the update if the latest tag is greater than the current app version.
 */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
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
        const currentVersion = APP_VERSION;

        // Strip 'v' if present for clean comparison
        const cleanLatest = latestVersionTag.replace(/^v/, '');
        const cleanCurrent = currentVersion.replace(/^v/, '');

        // Compare as semantic version parts to avoid false "update available" prompts.
        if (compareVersions(cleanLatest, cleanCurrent) > 0) {

            // Find the APK asset
            const apkAsset = data.assets.find((asset: any) => asset.name.endsWith('.apk'));
            if (!apkAsset) {
                console.log('Update found but no .apk asset attached');
                return null;
            }

            return {
                hasUpdate: true,
                version: cleanLatest,
                downloadUrl: apkAsset.browser_download_url,
                changelog: data.body
            };
        }

        return { hasUpdate: false, version: cleanCurrent, downloadUrl: '', changelog: '' };

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

    try {
        const fileUri = `${FileSystem.documentDirectory}saral_lekhan_update_v${version}.apk`;

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
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/vnd.android.package-archive',
        });

        return true;
    } catch (e) {
        console.error("Install App Error:", e);
        return false;
    }
}
