# Make Saral Lekhan Plus F-Droid-Ready (Status and Submission Plan, April 23, 2026)

## Summary
- The app is not fully F-Droid-ready yet.
- The public submission [MR !35334](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/35334) is still based on the older `2.17.33/100` recipe opened on March 25, 2026 and edited on April 13, 2026, so that MR should be updated rather than replaced.
- Your current local workspace is much closer: it already has a dedicated `fdroid` flavor, version sync around `2.17.39/102`, optional Spark AI wording, and an updated metadata template.
- The remaining blockers are proof blockers, not major architecture blockers: Java 17 validation, `fdroidserver` validation, final APK inspection, and updating the existing MR with the new metadata/build proof.

## Detailed Steps
1. [x] Freeze the F-Droid lane around the current local design.
2. [x] Harden `build.gradle` by conditionally excluding Flipper in F-Droid builds.
3. [/] Validate in the right toolchain (JDK 17).
   Currently running `assembleFdroidRelease` with JDK 17 locally.

4. Set up F-Droid tooling in a Linux-like environment.
   On Windows, use WSL/Debian or another Debian/Ubuntu environment as the main F-Droid validation environment. Install `fdroidserver` from the official tooling path described in [Installing the Server and Repo Tools](https://fdroid.gitlab.io/jekyll-fdroid/docs/Installing_the_Server_and_Repo_Tools/), then use that environment for `rewritemeta`, `lint`, `checkupdates`, and `build`.

5. Run the local project checks in this exact order.
   Run `npm ci --legacy-peer-deps`, `npx tsc --noEmit`, and then `npm run build:android:fdroid` with Java 17 active. Do not tag or submit until the F-Droid APK builds successfully.

6. Run the F-Droid metadata/build checks against `com.sarallekhan`.
   Run `fdroid rewritemeta com.sarallekhan`, `fdroid lint com.sarallekhan`, `fdroid checkupdates com.sarallekhan`, and `fdroid build -v -l com.sarallekhan`. The build metadata should follow the current [Build Metadata Reference](https://fdroid.gitlab.io/jekyll-fdroid/docs/Build_Metadata_Reference/) and the [Submitting to F-Droid Quick Start Guide](https://fdroid.gitlab.io/jekyll-fdroid/docs/Submitting_to_F-Droid_Quick_Start_Guide/).

7. Inspect the resulting F-Droid APK before submission.
   Confirm package ID is `com.sarallekhan`, version is `2.17.39` / `102`, the APK is unsigned as expected for F-Droid, and the final manifest does not include `REQUEST_INSTALL_PACKAGES`, `READ_EXTERNAL_STORAGE`, `WRITE_EXTERNAL_STORAGE`, `RECORD_AUDIO`, or release-side `SYSTEM_ALERT_WINDOW`.

8. Do one policy-focused runtime sanity check.
   Confirm the F-Droid build does not contact `u.expo.dev`, does not fetch startup flags from `raw.githubusercontent.com`, and does not call the GitHub updater path on startup. Confirm Spark AI remains dormant until the user manually adds a Gemini API key, which is why `NonFreeNet` is appropriate under F-Droid’s [Anti-Features](https://fdroid.gitlab.io/jekyll-fdroid/en/docs/Anti-Features/).

9. Ensure upstream metadata is complete and aligned.
   Keep `fastlane/metadata/android/en-US/short_description.txt`, `full_description.txt`, screenshots, and `changelogs/102.txt` in the upstream repo. This matches F-Droid’s upstream metadata guidance and reduces reviewer friction.

10. Push upstream first, then update the F-Droid MR.
    Commit the upstream app changes to your app repo, push the branch, and create/push the `v2.17.39` tag only after the F-Droid flavor is proven. Then update the `fdroiddata` branch behind [MR !35334](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/35334) with the new recipe and include a short MR note listing the exact commands you ran and the fact that Java 17 was pinned intentionally.

11. Respond to reviewer feedback only on the existing MR.
    Do not open a second inclusion MR unless the old branch becomes unusable. Keep all discussion on `!35334`, especially around `NonFreeNet`, Java 17 pinning, and the fact that the F-Droid flavor disables self-update behavior to comply with the [Inclusion Policy](https://fdroid.gitlab.io/jekyll-fdroid/docs/Inclusion_Policy/).

## Test Plan
- `npx tsc --noEmit` passes.
- `npm run build:android:fdroid` passes with Java 17.
- `fdroid rewritemeta com.sarallekhan` produces no meaningful diff.
- `fdroid lint com.sarallekhan` passes.
- `fdroid checkupdates com.sarallekhan` resolves `v2.17.39` correctly.
- `fdroid build -v -l com.sarallekhan` succeeds.
- Final APK has package `com.sarallekhan`, version `2.17.39/102`, and only intended permissions.
- Fresh install smoke test passes for launch, note create/edit/delete, export/import, biometric lock, and Spark AI only after user key entry.

## Assumptions
- Keep the same app ID: `com.sarallekhan`.
- Keep Spark AI in F-Droid as optional BYO-key functionality with `NonFreeNet`, not as a removed feature.
- Keep the current local `fdroid` flavor approach instead of upgrading the whole Android toolchain to Java 21 right now.
- Update the existing [MR !35334](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/35334), not a new MR.

## References
- [MR !35334](https://gitlab.com/fdroid/fdroiddata/-/merge_requests/35334)
- [F-Droid Inclusion Policy](https://fdroid.gitlab.io/jekyll-fdroid/docs/Inclusion_Policy/)
- [Build Metadata Reference](https://fdroid.gitlab.io/jekyll-fdroid/docs/Build_Metadata_Reference/)
- [Submitting to F-Droid Quick Start Guide](https://fdroid.gitlab.io/jekyll-fdroid/docs/Submitting_to_F-Droid_Quick_Start_Guide/)
- [Installing the Server and Repo Tools](https://fdroid.gitlab.io/jekyll-fdroid/docs/Installing_the_Server_and_Repo_Tools/)
- [Anti-Features](https://fdroid.gitlab.io/jekyll-fdroid/en/docs/Anti-Features/)
