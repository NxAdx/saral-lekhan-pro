package com.sarallekhan;

import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageInstaller;
import android.net.Uri;
import android.os.Build;
import android.util.Log;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

public class UpdaterModule extends ReactContextBaseJavaModule {
    private static final String TAG = "UpdaterModule";
    private final ReactApplicationContext reactContext;

    public UpdaterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @Override
    public String getName() {
        return "UpdaterModule";
    }

    @ReactMethod
    public void installPackage(String localPath, Promise promise) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.LOLLIPOP) {
            promise.reject("ERR_UNSUPPORTED_VERSION", "PackageInstaller requires API 21+ (Lollipop)");
            return;
        }

        try {
            File apkFile = new File(localPath);
            if (!apkFile.exists()) {
                promise.reject("ERR_FILE_NOT_FOUND", "APK file does not exist at path: " + localPath);
                return;
            }

            PackageInstaller packageInstaller = reactContext.getPackageManager().getPackageInstaller();
            PackageInstaller.SessionParams params = new PackageInstaller.SessionParams(
                    PackageInstaller.SessionParams.MODE_FULL_INSTALL);
            
            int sessionId = packageInstaller.createSession(params);
            PackageInstaller.Session session = packageInstaller.openSession(sessionId);

            try (InputStream in = new FileInputStream(apkFile);
                 OutputStream out = session.openWrite("update_session", 0, apkFile.length())) {
                byte[] buffer = new byte[65536];
                int n;
                while ((n = in.read(buffer)) >= 0) {
                    out.write(buffer, 0, n);
                }
                session.fsync(out);
            }

            // Status receiver intent
            Intent intent = new Intent(reactContext, InstallReceiver.class);
            intent.setAction("com.sarallekhan.INSTALL_STATUS");
            
            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                flags |= PendingIntent.FLAG_MUTABLE;
            }

            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    reactContext,
                    sessionId,
                    intent,
                    flags
            );

            session.commit(pendingIntent.getIntentSender());
            session.close();
            
            promise.resolve(true);
        } catch (Exception e) {
            Log.e(TAG, "Installation failed", e);
            promise.reject("ERR_INSTALLATION_FAILED", e.getMessage());
        }
    }

    @ReactMethod
    public void canInstallPackages(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            promise.resolve(reactContext.getPackageManager().canRequestPackageInstalls());
        } else {
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void openInstallPermissionSettings(Promise promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            try {
                Uri uri = Uri.parse("package:" + reactContext.getPackageName());
                Intent intent = new Intent(android.provider.Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES, uri);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                reactContext.startActivity(intent);
                promise.resolve(true);
            } catch (Exception e) {
                promise.reject("ERR_OPEN_SETTINGS_FAILED", e.getMessage());
            }
        } else {
            promise.resolve(false);
        }
    }

    @ReactMethod
    public void getManufacturer(Promise promise) {
        promise.resolve(Build.MANUFACTURER);
    }
}
