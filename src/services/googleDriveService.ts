import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import * as FileSystem from 'expo-file-system';

const WEB_CLIENT_ID = "1021975293117-ql3fac9mrc79oi2stc6tecr3ua47p722.apps.googleusercontent.com";
const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/userinfo.email'];

GoogleSignin.configure({
    scopes: SCOPES,
    webClientId: WEB_CLIENT_ID,
    offlineAccess: true,
});

export class GoogleDriveService {
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
                throw new Error(`Drive upload failed: ${errorText}`);
            }

            return true;
        } catch (error) {
            console.error("Backup Error:", error);
            throw error;
        }
    }

    // 3. Restore the SQLite database
    static async restoreDatabase(accessToken: string) {
        try {
            const fileId = await this.getExistingBackupId(accessToken);
            if (!fileId) {
                throw new Error("No backup found on Google Drive.");
            }

            // Download the file contents
            const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!response.ok) {
                throw new Error(`Failed to download backup: ${response.statusText}`);
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
                throw new Error("Download corrupted or failed.");
            }

            return true;
        } catch (error) {
            console.error("Restore Error:", error);
            throw error;
        }
    }
}
