package com.sarallekhan;

import android.os.Build;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import expo.modules.ReactActivityDelegateWrapper;

import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.util.Log;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.File;

public class MainActivity extends ReactActivity {
  private static final String TAG = "MainActivity";

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
  }

  /**
   * Returns the name of the main component registered from JavaScript.
   * This is used to schedule rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "main";
  }

  /**
   * Returns the instance of the {@link ReactActivityDelegate}. Here we use a util class {@link
   * DefaultReactActivityDelegate} which allows you to easily enable Fabric and Concurrent React
   * (aka React 18) with two boolean flags.
   */
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, BuildConfig.IS_NEW_ARCHITECTURE_ENABLED, new DefaultReactActivityDelegate(
        this,
        getMainComponentName(),
        // If you opted-in for the New Architecture, we enable the Fabric Renderer.
        DefaultNewArchitectureEntryPoint.getFabricEnabled()) {
          @Override
          protected Bundle getLaunchOptions() {
            Bundle bundle = super.getLaunchOptions();
            if (bundle == null) bundle = new Bundle();

            try {
                String notesJson = fetchInitialNotes();
                if (notesJson != null) {
                    bundle.putString("initialNotes", notesJson);
                    Log.d(TAG, "Passed initialNotes to JS: " + notesJson.length() + " chars");
                }
            } catch (Exception e) {
                Log.e(TAG, "Failed to pre-fetch notes", e);
            }
            return bundle;
          }

          private String fetchInitialNotes() {
              SQLiteDatabase db = null;
              Cursor cursor = null;
              try {
                  // Expo SQLite path: /data/user/0/com.sarallekhan/databases/saral_lekhan.db
                  File dbFile = getDatabasePath("saral_lekhan.db");
                  if (!dbFile.exists()) {
                      Log.d(TAG, "DB file not found at " + dbFile.getAbsolutePath());
                      return null;
                  }

                  db = SQLiteDatabase.openDatabase(dbFile.getAbsolutePath(), null, SQLiteDatabase.OPEN_READONLY);
                  cursor = db.rawQuery("SELECT * FROM notes WHERE is_deleted = 0 ORDER BY updated_at DESC LIMIT 20", null);

                  JSONArray array = new JSONArray();
                  while (cursor.moveToNext()) {
                      JSONObject obj = new JSONObject();
                      obj.put("id", cursor.getLong(cursor.getColumnIndexOrThrow("id")));
                      obj.put("title", cursor.getString(cursor.getColumnIndexOrThrow("title")));
                      obj.put("body", cursor.getString(cursor.getColumnIndexOrThrow("body")));
                      obj.put("tag", cursor.getString(cursor.getColumnIndexOrThrow("tag")));
                      obj.put("created_at", cursor.getLong(cursor.getColumnIndexOrThrow("created_at")));
                      obj.put("updated_at", cursor.getLong(cursor.getColumnIndexOrThrow("updated_at")));
                      obj.put("pinned", cursor.getInt(cursor.getColumnIndexOrThrow("pinned")) == 1);
                      array.put(obj);
                  }
                  return array.toString();
              } catch (Exception e) {
                  Log.e(TAG, "fetchInitialNotes error", e);
                  return null;
              } finally {
                  if (cursor != null) cursor.close();
                  if (db != null) db.close();
              }
          }

          @Override
          protected void loadApp(String appKey) {
            super.loadApp(appKey);
            // After app is loaded, we can peek at the RootView to ensure it doesn't flash white
            // However, DefaultReactActivityDelegate doesn't easily expose RootView here.
            // We rely on the theme background to cover the initialization gap.
          }
        });
  }

  /**
   * Align the back button behavior with Android S
   * where moving root activities to background instead of finishing activities.
   * @see <a href="https://developer.android.com/reference/android/app/Activity#onBackPressed()">onBackPressed</a>
   */
  @Override
  public void invokeDefaultOnBackPressed() {
    if (Build.VERSION.SDK_INT <= Build.VERSION_CODES.R) {
      if (!moveTaskToBack(false)) {
        // For non-root activities, use the default implementation to finish them.
        super.invokeDefaultOnBackPressed();
      }
      return;
    }

    // Use the default back button implementation on Android S
    // because it's doing more than {@link Activity#moveTaskToBack} in fact.
    super.invokeDefaultOnBackPressed();
  }
}
