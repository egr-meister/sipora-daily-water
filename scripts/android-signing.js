// Injects a release signing config into the generated android/app/build.gradle.
// Run AFTER `expo prebuild --platform android`. Idempotent: safe to run twice.
//
// Reads these Gradle properties (set from GitHub Secrets in CI via gradle.properties):
//   SIPORA_UPLOAD_STORE_FILE, SIPORA_UPLOAD_STORE_PASSWORD,
//   SIPORA_UPLOAD_KEY_ALIAS, SIPORA_UPLOAD_KEY_PASSWORD

const fs = require("fs");
const path = "android/app/build.gradle";

if (!fs.existsSync(path)) {
  console.error("build.gradle not found at " + path + " — run expo prebuild first.");
  process.exit(1);
}

let gradle = fs.readFileSync(path, "utf8");

if (gradle.includes("SIPORA_UPLOAD_STORE_FILE")) {
  console.log("Release signing config already present. Nothing to do.");
  process.exit(0);
}

const releaseSigningBlock = [
  "signingConfigs {",
  "        release {",
  "            if (project.hasProperty('SIPORA_UPLOAD_STORE_FILE')) {",
  "                storeFile file(SIPORA_UPLOAD_STORE_FILE)",
  "                storePassword SIPORA_UPLOAD_STORE_PASSWORD",
  "                keyAlias SIPORA_UPLOAD_KEY_ALIAS",
  "                keyPassword SIPORA_UPLOAD_KEY_PASSWORD",
  "            }",
  "        }",
].join("\n");

// 1) Add a `release` signing config at the start of the existing signingConfigs block.
if (!/signingConfigs\s*\{/.test(gradle)) {
  console.error("Could not find a signingConfigs block in build.gradle.");
  process.exit(1);
}
gradle = gradle.replace(/signingConfigs\s*\{/, releaseSigningBlock);

// 2) Point the release build type at signingConfigs.release (was signingConfigs.debug).
const before = gradle;
gradle = gradle.replace(
  /(release\s*\{[^}]*?signingConfig\s+)signingConfigs\.debug/s,
  "$1signingConfigs.release"
);
if (gradle === before) {
  console.warn(
    "Warning: could not repoint release buildType to signingConfigs.release. " +
      "Please verify android/app/build.gradle manually."
  );
}

fs.writeFileSync(path, gradle);
console.log("Release signing config injected into android/app/build.gradle.");
