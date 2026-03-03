import * as FileSystem from 'expo-file-system';
import * as IntentLauncher from 'expo-intent-launcher';
import { Platform } from 'react-native';
import appJson from '../../app.json';

const REPO_OWNER = 'NxAdx';
const REPO_NAME = 'saral-lekhan-pro';
const APP_VERSION = appJson.expo.version;

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

        // Quick basic comparison (Assumes standard SemVer)
        if (cleanLatest !== cleanCurrent) {
            // Technically this triggers on *any* difference, but assuming we only push increasing versions

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
                const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                if (onProgress) onProgress(progress);
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result) return false;

        // Trigger Android Native Package Installer
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: result.uri,
            flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
            type: 'application/vnd.android.package-archive',
        });

        return true;
    } catch (e) {
        console.error("Install App Error:", e);
        return false;
    }
}
