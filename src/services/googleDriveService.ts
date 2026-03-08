import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as FileSystem from 'expo-file-system';
import * as Sentry from '@sentry/react-native';

// CRITICAL: This MUST be a "Web application" Client ID from Google Cloud Console.
// It CANNOT be your Android Client ID, otherwise you get DEVELOPER_ERROR (Error 10).
// Without a Web Client ID, Google will give you a 401 Unauthorized error when accessing Google Drive API.
const WEB_CLIENT_ID = "871132329368-vbvrs4cuon807asqrbh2eabedr86iljl.apps.googleusercontent.com";
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'];
const APP_PACKAGE = 'com.sarallekhan';
type GoogleSignInMode = 'strict' | 'androidFallback';

function configureGoogleSignIn(mode: GoogleSignInMode = 'strict') {
    if (mode === 'androidFallback') {
        // Fallback mode: rely on Android google-services config only.
        // Useful when web client wiring drifts, while package/SHA mapping is valid.
        GoogleSignin.configure({
            scopes: SCOPES,
            offlineAccess: false,
            forceCodeForRefreshToken: false,
        });
        return;
    }

    GoogleSignin.configure({
        scopes: SCOPES,
        webClientId: WEB_CLIENT_ID,
        offlineAccess: true,
        // Avoid forcing repeated consent prompts after the first successful login.
        forceCodeForRefreshToken: false,
    });
}

interface ParsedGoogleApiError {
    code?: number;
    message?: string;
    reason?: string;
    projectNumber?: string;
}

function isDeveloperConfigError(error: any): boolean {
    const rawCode = error?.code;
    const normalizedCode = String(rawCode ?? '').toUpperCase();
    const normalizedMessage = String(error?.message ?? '').toUpperCase();
    const developerStatusCode = (statusCodes as any).DEVELOPER_ERROR;

    return (
        rawCode === developerStatusCode ||
        rawCode === 10 ||
        normalizedCode === 'DEVELOPER_ERROR' ||
        normalizedCode === '10' ||
        normalizedMessage.includes('DEVELOPER_ERROR')
    );
}

function mapGoogleSignInError(error: any): Error {
    if (error?.code === statusCodes.SIGN_IN_CANCELLED) {
        return new Error("User cancelled the login flow");
    }
    if (error?.code === statusCodes.IN_PROGRESS) {
        return new Error("Sign in is in progress already");
    }
    if (error?.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        return new Error("Google Play Services not available or outdated");
    }
    if (isDeveloperConfigError(error)) {
        return new Error(
            `Google Sign-In config mismatch for package ${APP_PACKAGE}. ` +
            `Register this APK signing SHA-1/SHA-256 in Firebase and refresh google-services.json. ` +
            `Most common cause: this APK is signed with a different key (debug vs release), ` +
            `or CI GOOGLE_SERVICES_JSON does not match the keystore used to build this APK.`
        );
    }

    return error instanceof Error
        ? error
        : new Error(error?.message || "Google Sign-In failed unexpectedly.");
}

function parseGoogleApiErrorPayload(raw: string): ParsedGoogleApiError {
    try {
        const payload = JSON.parse(raw);
        const err = payload?.error || {};
        const reason = err?.errors?.[0]?.reason || err?.details?.[0]?.reason;
        const containerInfo = err?.details?.[0]?.metadata?.containerInfo || err?.details?.[0]?.metadata?.consumer;

        let projectNumber: string | undefined;
        if (typeof containerInfo === 'string') {
            const match = containerInfo.match(/projects\/(\d+)/);
            if (match) projectNumber = match[1];
        }

        return {
            code: err?.code,
            message: err?.message,
            reason,
            projectNumber,
        };
    } catch {
        return {};
    }
}

function mapDriveApiError(status: number, raw: string, fallbackMessage: string): Error {
    const parsed = parseGoogleApiErrorPayload(raw);
    const reason = String(parsed.reason || '').toLowerCase();
    const message = String(parsed.message || '').toLowerCase();

    if (status === 401) {
        return new Error("Session expired. Please sign in again.");
    }

    const isApiDisabled = status === 403 && (
        reason.includes('accessnotconfigured') ||
        reason.includes('service_disabled') ||
        message.includes('has not been used') ||
        message.includes('is disabled')
    );

    if (isApiDisabled) {
        const projectHint = parsed.projectNumber ? ` (project ${parsed.projectNumber})` : '';
        return new Error(
            `Google Drive API is disabled${projectHint}. Enable it in Google Cloud Console, wait a few minutes, then retry.`
        );
    }

    if (parsed.message) {
        return new Error(parsed.message);
    }

    return new Error(`${fallbackMessage} (${status})`);
}

try {
    configureGoogleSignIn('strict');
} catch (e) {
    console.warn("Google Sign-in not available in this environment:", e);
}

function getEmailFromUserInfo(userInfo: any): string {
    // Handles shape differences across Google Sign-In package versions.
    return userInfo?.data?.user?.email || userInfo?.user?.email || 'Unknown';
}

async function hasPreviousSession(): Promise<boolean> {
    // Compatibility across @react-native-google-signin/google-signin versions:
    // some builds expose hasPreviousSignIn, others only provide getCurrentUser.
    const maybeApi = GoogleSignin as unknown as { hasPreviousSignIn?: () => Promise<boolean> };
    if (typeof maybeApi.hasPreviousSignIn === 'function') {
        try {
            return await maybeApi.hasPreviousSignIn();
        } catch {
            // Fall back to current-user probe below.
        }
    }
    return Boolean(GoogleSignin.getCurrentUser());
}

export class GoogleDriveService {
    /**
     * Silently refresh the OAuth access token.
     * Access tokens expire after ~1 hour; this must be called before every API call.
     */
    static async getFreshToken(): Promise<string> {
        try {
            // Fast path: if a token is already available, use it directly.
            const directTokens = await GoogleSignin.getTokens();
            if (directTokens?.accessToken) {
                return directTokens.accessToken;
            }
        } catch {
            // Fall through to silent refresh logic.
        }

        try {
            const hasPrevious = await hasPreviousSession();
            if (!hasPrevious) {
                throw new Error("Session expired. Please sign in again.");
            }

            await GoogleSignin.signInSilently();
            const refreshedTokens = await GoogleSignin.getTokens();
            if (!refreshedTokens?.accessToken) {
                throw new Error("Session expired. Please sign in again.");
            }
            return refreshedTokens.accessToken;
        } catch (error: any) {
            if (error?.code === (statusCodes as any).SIGN_IN_REQUIRED) {
                throw new Error("Session expired. Please sign in again.");
            }
            throw mapGoogleSignInError(error);
        }
    }

    static async verifyAndAddScopes() {
        try {
            // For older accounts/silent sign-in, we check if scopes are already granted.
            // addScopes will only prompt if they are missing.
            await GoogleSignin.addScopes({ scopes: SCOPES });
            return true;
        } catch (error) {
            console.log("Drive scopes not granted by user", error);
            return false;
        }
    }

    static async signIn() {
        try {
            await GoogleSignin.hasPlayServices();

            // Prefer silent sign-in if a previous session exists to avoid re-prompting OAuth UI.
            const hasPrevious = await hasPreviousSession();
            if (hasPrevious) {
                try {
                    const silentUser = await GoogleSignin.signInSilently();
                    await this.verifyAndAddScopes(); // Ensure scopes are present
                    const silentTokens = await GoogleSignin.getTokens();
                    if (silentTokens?.accessToken) {
                        return {
                            accessToken: silentTokens.accessToken,
                            email: getEmailFromUserInfo(silentUser),
                        };
                    }
                } catch {
                    // Fall through to interactive sign-in.
                }
            }

            const userInfo = await GoogleSignin.signIn();
            await this.verifyAndAddScopes(); // Safety check for new account checkbox skip
            const tokens = await GoogleSignin.getTokens();
            return { accessToken: tokens.accessToken, email: getEmailFromUserInfo(userInfo) };
        } catch (error: any) {
            if (isDeveloperConfigError(error)) {
                // One-time recovery path:
                // retry with Android default OAuth config from google-services.json.
                try {
                    configureGoogleSignIn('androidFallback');
                    await GoogleSignin.hasPlayServices();
                    const userInfo = await GoogleSignin.signIn();
                    await this.verifyAndAddScopes();
                    const tokens = await GoogleSignin.getTokens();
                    if (tokens?.accessToken) {
                        return { accessToken: tokens.accessToken, email: getEmailFromUserInfo(userInfo) };
                    }
                } catch {
                    // No-op: original error mapping below will handle user-facing guidance.
                } finally {
                    // Restore strict mode for future flows.
                    try {
                        configureGoogleSignIn('strict');
                    } catch {
                        // Ignore configure restore errors.
                    }
                }
            }
            throw mapGoogleSignInError(error);
        }
    }

    static async signOut() {
        try {
            await GoogleSignin.signOut();
        } catch (error) {
            console.error(error);
        }
    }

    // 1. Find existing backup file ID (if any)
    static async getExistingBackupId(accessToken: string): Promise<string | null> {
        try {
            const q = encodeURIComponent("name = 'saral_lekhan_backup.db' and trashed = false");
            const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw mapDriveApiError(res.status, errorText, "Drive query failed");
            }

            const data = await res.json();
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
            return null;
        } catch (e) {
            console.warn("Failed to check for existing backup", e);
            throw e;
        }
    }

    // 2. Backup the SQLite database
    static async backupDatabase(accessToken: string) {
        Sentry.addBreadcrumb({ category: 'sync', message: 'Starting cloud backup', level: 'info' });
        try {
            // First, ensure all current SQLite transactions are flushed.
            // Easiest is to just read the file directly since Expo SQLite stores it in the DocumentDirectory
            const dbDir = `${FileSystem.documentDirectory}SQLite`;
            const dbPath = `${dbDir}/saral_lekhan.db`;

            const fileInfo = await FileSystem.getInfoAsync(dbPath);
            if (!fileInfo.exists) {
                throw new Error("Local database file not found.");
            }

            // Read DB file as base64 to send in multipart form
            const dbBase64 = await FileSystem.readAsStringAsync(dbPath, { encoding: FileSystem.EncodingType.Base64 });

            const fileId = await this.getExistingBackupId(accessToken);

            const metadata = {
                name: 'saral_lekhan_backup.db',
                mimeType: 'application/x-sqlite3',
            };

            // Construct multipart body manually because fetch doesn't easily support raw bytes from Expo FileSystem directly in React Native
            const boundary = 'foo_bar_baz';
            let body = `--${boundary}\r\n`;
            body += 'Content-Type: application/json; charset=UTF-8\r\n\r\n';
            body += JSON.stringify(metadata) + '\r\n';
            body += `--${boundary}\r\n`;
            body += 'Content-Type: application/x-sqlite3\r\n';
            body += 'Content-Transfer-Encoding: base64\r\n\r\n';
            body += dbBase64 + '\r\n';
            body += `--${boundary}--`;

            const url = fileId
                ? `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`
                : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`;

            const method = fileId ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': `multipart/related; boundary=${boundary}`,
                    'Content-Length': body.length.toString()
                },
                body
            });

            if (!response.ok) {
                const errorText = await response.text();
                const mappedError = mapDriveApiError(response.status, errorText, "Drive upload failed");
                Sentry.captureMessage(`Drive upload failed: ${response.status}`, { level: 'error', extra: { errorText, mappedMessage: mappedError.message } });
                throw mappedError;
            }

            Sentry.addBreadcrumb({ category: 'sync', message: 'Backup successful', level: 'info' });
            return true;
        } catch (error) {
            Sentry.captureException(error);
            console.error("Backup Error:", error);
            throw error;
        }
    }

    // 3. Restore the SQLite database
    static async restoreDatabase(accessToken: string) {
        Sentry.addBreadcrumb({ category: 'sync', message: 'Starting cloud restore', level: 'info' });
        try {
            const fileId = await this.getExistingBackupId(accessToken);
            if (!fileId) {
                throw new Error("No backup found on Google Drive.");
            }

            // Because it's a binary DB file, fetch().blob() is often problematic in React Native.
            // Instead we use Expo FileSystem to download it directly.
            const dbDir = `${FileSystem.documentDirectory}SQLite`;
            const dbPath = `${dbDir}/saral_lekhan.db`;
            const downloadUri = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

            // Download directly to the SQLite designated path
            const { status } = await FileSystem.downloadAsync(downloadUri, dbPath, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (status !== 200) {
                Sentry.captureMessage(`Restore download failed: ${status}`, { level: 'error' });
                if (status === 401) {
                    throw new Error("Session expired. Please sign in again.");
                }
                if (status === 403) {
                    throw new Error("Google Drive access denied. Enable Drive API and sign in again.");
                }
                throw new Error(`Restore download failed with status ${status}.`);
            }

            Sentry.addBreadcrumb({ category: 'sync', message: 'Restore successful', level: 'info' });
            return true;
        } catch (error) {
            Sentry.captureException(error);
            console.error("Restore Error:", error);
            throw error;
        }
    }
}
