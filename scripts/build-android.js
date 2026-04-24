const { spawnSync } = require("child_process");
const path = require("path");

const target = String(process.argv[2] || "").trim().toLowerCase();
const gradleTasksByTarget = {
  direct: ["bundleDirectRelease", "assembleDirectRelease", "--no-daemon"],
  fdroid: ["assembleFdroidRelease", "--no-daemon"],
};

if (!gradleTasksByTarget[target]) {
  console.error("Usage: node scripts/build-android.js <direct|fdroid>");
  process.exit(1);
}

const androidDir = path.join(__dirname, "..", "android");
const env = { ...process.env, SARAL_BUILD_TARGET: target };

const result =
  process.platform === "win32"
    ? spawnSync("cmd.exe", ["/d", "/s", "/c", ["gradlew.bat", ...gradleTasksByTarget[target]].join(" ")], {
        cwd: androidDir,
        env,
        stdio: "inherit",
      })
    : spawnSync("bash", ["gradlew", ...gradleTasksByTarget[target]], {
        cwd: androidDir,
        env,
        stdio: "inherit",
      });

process.exit(result.status ?? 1);
