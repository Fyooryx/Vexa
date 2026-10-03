#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(read(file));

function fail(message) {
  console.error(\`[Vexa branding] FAIL: \${message}\`);
  process.exit(1);
}
function expect(condition, message) {
  if (!condition) fail(message);
}

const pkg = readJson("package.json");
const lock = readJson("package-lock.json");
const bun = readJson("bun.lock");
const config = read("config.xml");

const widget = /<widget[^>]*\bid="([^"]+)"/.exec(config);
const version = /<widget[^>]*\bversion="([^"]+)"/.exec(config);

expect(widget?.[1] === "com.vexa.app", "config.xml widget id must be com.vexa.app");
expect(config.includes("<name>Vexa</name>"), "config.xml app name must be Vexa");
expect(version?.[1] === pkg.version, "config.xml and package.json versions must match");
expect(pkg.name === "com.vexa.app", "package.json name must be com.vexa.app");
expect(pkg.displayName === "Vexa", "package.json displayName must be Vexa");
expect(lock.name === pkg.name && lock.version === pkg.version, "package-lock root identity/version drifted");
expect(bun.workspaces?.[""]?.name === pkg.name, "bun.lock root package name drifted");
expect(config.includes('android:scheme="vexa"'), "vexa:// scheme is missing");
expect(config.includes('android:scheme="acode"'), "legacy acode:// compatibility scheme is missing");

for (const file of [
  "config.xml",
  "package.json",
  "package-lock.json",
  "bun.lock",
  "utils/config.js",
  "src/lib/openFolder.js",
]) {
  expect(
    !read(file).includes("com.foxdebug.acode.documents"),
    \`\${file} still has a legacy Acode SAF package reference\`,
  );
}

const helpers = read("src/utils/helpers.js");
expect(
  helpers.includes("com.vexa.app.documents") &&
  helpers.includes("com.foxdebug.acode.documents"),
  "helpers.js must support both Vexa SAF and legacy Acode SAF URIs",
);

const openFolder = read("src/lib/openFolder.js");
expect(
  openFolder.includes("com.vexa.app.documents") &&
  openFolder.includes("com.foxdebug.acode"),
  "openFolder.js must support Vexa SAF and legacy compatibility",
);

expect(
  read("src/plugins/browser/utils/updatePackage.js").includes(
    'import " + packageName + ".R;',
  ),
  "updatePackage.js must derive Android R imports from the full widget package",
);

for (const file of [
  "res/android/drawable/vexa_icon.png",
  "www/icons/vexa.png",
  "www/icons/vexa.svg",
]) {
  expect(fs.existsSync(path.join(root, file)), \`missing Vexa asset: \${file}\`);
}

const expectedLauncherHashes = Object.freeze({
  mdpi: "6d240e9b1b6accacc2a9bf87d3a5928977cec30e21a2e01f8036fb14e01f5b42",
  hdpi: "766b647653d09c226d0efce39b93bec42ebc7ab5d0d0729ed8d2eda3148d7ad6",
  xhdpi: "bf4aa3eeb0223422e9fd77d634ec2826b9f827a8ca0e93107f1ae231dafd6a61",
  xxhdpi: "bcfbecf9e0792b75cd36b95d8ed629a7a38c4241d01f089292698b5da182f4aa",
  xxxhdpi: "b315a6787cdd0bdb010541690bbc3ddd5e8009ac0c15083e98f89b0930d770a5",
});

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

let launcherCount = 0;
for (const file of walk(path.join(root, "res/android"))) {
  if (!/[/\\]mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)[/\\](?:ic_acode_[^/\\]+|ic_launcher(?:_round)?)\.webp$/i.test(file)) {
    continue;
  }

  launcherCount += 1;
  const relative = path.relative(root, file);
  const density = /^res[/\\]android[/\\]mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)[/\\]/i.exec(relative)?.[1]?.toLowerCase();
  expect(density && expectedLauncherHashes[density], `unknown launcher density: ${relative}`);

  const hash = crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");

  expect(
    hash === expectedLauncherHashes[density],
    `launcher asset is not the expected Vexa logo for ${density}: ${relative}`,
  );
}
expect(launcherCount === 150, `expected 150 Android launcher WebP assets, checked ${launcherCount}`);

console.log("[Vexa branding] PASS");
console.log(\`Version: \${pkg.version} | Package: \${pkg.name} | Launchers checked: \${launcherCount}\`);
