import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as FileSystem from 'expo-file-system';
import * as Sentry from '@sentry/react-native';

// CRITICAL: This MUST be a "Web application" Client ID from Google Cloud Console.
// It CANNOT be your Android Client ID, otherwise you get DEVELOPER_ERROR (Error 10).
// Without a Web Client ID, Google will give you a 401 Unauthorized error when accessing Google Drive API.
const WEB_CLIENT_ID = "1021975293117-ompp70m5ehcg614a02fannpnj52v4r94.apps.googleusercontent.com";
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'];

try {
    GoogleSignin.configure({
        scopes: SCOPES,
        webClientId: WEB_CLIENT_ID,
    });
} catch (e) {
    console.warn("Google Sign-in not available in this environment:", e);
}

export class GoogleDriveService {
    /**
     * Silently refresh the OAuth access token.
     * Access tokens expire after ~1 hour; this must be called before every API call.
     */
    static async getFreshToken(): Promise<string> {
        try {
            // silentSignIn refreshes the session without showing UI
            await GoogleSignin.signInSilently();
            const tokens = await GoogleSignin.getTokens();
            return tokens.accessToken;
        } catch (error) {
            // If silent sign-in fails, the user needs to re-authenticate
            throw new Error("Session expired. Please sign in again.");
        }
    }

    static async signIn() {
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const tokens = await GoogleSignin.getTokens();
            // @ts-ignore - version differences in GoogleSignin library
            const email = userInfo.data?.user?.email || userInfo.user?.email || 'Unknown';
            return { accessToken: tokens.accessToken, email };
        } catch (error: any) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                throw new Error("User cancelled the login flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                throw new Error("Sign in is in progress already");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                throw new Error("Google Play Services not available or outdated");
            } else {
                throw error;
            }
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
            const data = await res.json();
            if (data.files && data.files.length > 0) {
                return data.files[0].id;
            }
            return null;
        } catch (e) {
            console.warn("Failed to check for existing backup", e);
            return null;
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
                Sentry.captureMessage(`Drive upload failed: ${response.status}`, { level: 'error', extra: { errorText } });
                throw new Error(`Drive upload failed: ${errorText}`);
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
                throw new Error("Download corrupted or failed.");
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
