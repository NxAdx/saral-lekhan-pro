import * as FileSystem from 'expo-file-system';
import { Linking, Platform, NativeModules } from 'react-native';
import Constants from 'expo-constants';

const { UpdaterModule } = NativeModules;

export const APP_VERSION = (Constants.expoConfig?.version || '0.0.0').replace(/^v/, '');
const REPO_OWNER = 'NxAdx';
const REPO_NAME = 'saral-lekhan-pro';

/**
 * Expert Numeric Versioning Logic
 * Pattern: major * 100,000,000 + minor * 10,000 + patch
 */
function getVersionNumber(version: string): number {
    const parts = version.replace(/^v/, '').split('.').map(p => parseInt(p, 10));
    const major = parts[0] || 0;
    const minor = parts[1] || 0;
    const patch = parts[2] || 0;
    return major * 100000000 + minor * 10000 + patch;
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
 */
export async function checkForUpdate(allowSameVersion = false): Promise<UpdateInfo | null> {
    try {
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases`, {
            headers: { 'Accept': 'application/vnd.github.v3+json' }
        });

        if (!response.ok) return null;

        const releases = await response.json();
        if (!Array.isArray(releases) || releases.length === 0) return null;

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

        if (!latestRelease || !apkAsset) return null;

        const latestVersion = latestRelease.tag_name.replace(/^v/, '');
        const currentVersion = APP_VERSION.replace(/^v/, '');

        const latestNum = getVersionNumber(latestVersion);
        const currentNum = getVersionNumber(currentVersion);

        const isNewVersion = latestNum > currentNum;
        const isReinstall = latestNum === currentNum && allowSameVersion;
        const hasUpdate = isNewVersion || isReinstall;

        return {
            hasUpdate,
            version: latestVersion,
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
 * Advanced Installation Mechanism
 * Prioritizes PackageInstaller Session (Direct Install) with fallback for MIUI.
 */
export async function downloadAndInstallApk(
    downloadUrl: string,
    version: string,
    onProgress?: (progress: number) => void
): Promise<boolean> {
    if (Platform.OS !== 'android') return false;

    try {
        const fileUri = `${FileSystem.cacheDirectory}update_v${version}.apk`;

        const downloadResumable = FileSystem.createDownloadResumable(
            downloadUrl,
            fileUri,
            {},
            (dp) => {
                const prog = dp.totalBytesExpectedToWrite > 0 
                    ? dp.totalBytesWritten / dp.totalBytesExpectedToWrite 
                    : 0;
                if (onProgress) onProgress(prog);
            }
        );

        const result = await downloadResumable.downloadAsync();
        if (!result) return false;

        // --- INSTALLATION LOGIC ---
        
        // 1. MIUI Fallback Check (known to break PackageInstaller sessions)
        let isMiui = false;
        try {
            const manufacturer = await UpdaterModule.getManufacturer();
            isMiui = manufacturer?.toLowerCase().includes('xiaomi');
        } catch (e) {
            // Non-critical check
        }

        if (isMiui || !UpdaterModule) {
            // Legacy/Fallback Method for MIUI or if Module failed
            console.log('Using legacy installation method (MIUI detected or Module missing)');
            return await Linking.openURL(downloadUrl); 
        }

        // 2. Direct Install (PackageInstaller Session)
        // Convert URI to absolute file path for the native module
        const absolutePath = result.uri.replace('file://', '');
        return await UpdaterModule.installPackage(absolutePath);

    } catch (e) {
        console.error("Install Error:", e);
        try {
            await Linking.openURL(downloadUrl);
            return true;
        } catch {
            return false;
        }
    }
}
