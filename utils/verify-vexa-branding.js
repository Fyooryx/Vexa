#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = import.meta.dirname;

const read = (file) => fs.readFileSync(path.join(root, "..", file), "utf8");
const readJson = (file) => JSON.parse(read(file));

function fail(message) {
	console.error(`[Vexa branding] FAIL: ${message}`);
	throw new Error(message);
}

function expect(condition, message) {
	if (!condition) fail(message);
}

function expectFile(file) {
	expect(
		fs.existsSync(path.join(root, "..", file)),
		`missing Vexa asset: ${file}`,
	);
}

const pkg = readJson("package.json");
const lock = readJson("package-lock.json");
const bun = read("bun.lock");
const config = read("config.xml");
const identity = read("src/lib/vexaIdentity.js");

const widget = /<widget[^>]*\bid="([^"]+)"/.exec(config);
const version = /<widget[^>]*\bversion="([^"]+)"/.exec(config);

expect(
	widget?.[1] === "com.vexa.app",
	"config.xml widget id must be com.vexa.app",
);
expect(
	config.includes("<name>Vexa</name>"),
	"config.xml app name must be Vexa",
);
expect(
	version?.[1] === pkg.version,
	"config.xml and package.json versions must match",
);
expect(pkg.name === "com.vexa.app", "package.json name must be com.vexa.app");
expect(pkg.displayName === "Vexa", "package.json displayName must be Vexa");
expect(
	pkg.engines?.node && /(?:^|\D)22(?:\D|$)/.test(pkg.engines.node),
	"package.json must declare Node.js 22+ support",
);
expect(lock.name === pkg.name, "package-lock root name drifted");
expect(lock.version === pkg.version, "package-lock root version drifted");
expect(
	bun.includes(`"name": "${pkg.name}"`),
	"bun.lock root package name drifted",
);

expect(identity.includes('NAME: "Vexa"'), "Vexa identity name is missing");
expect(
	identity.includes('PACKAGE_NAME: "com.vexa.app"'),
	"Vexa identity package is missing",
);
expect(
	identity.includes('FREE_PACKAGE_NAME: "com.vexa.appfree"'),
	"Vexa free package identity is missing",
);
expect(identity.includes('URL_SCHEME: "vexa"'), "Vexa URL scheme is missing");
expect(
	identity.includes('LEGACY_URL_SCHEME: "acode"'),
	"legacy URL scheme identity is missing",
);
expect(
	identity.includes('REPOSITORY_URL: "https://github.com/Fyooryx/Vexa"'),
	"Vexa repository identity is missing",
);
expect(
	identity.includes(
		'UPSTREAM_REPOSITORY_URL: "https://github.com/Acode-Foundation/Acode"',
	),
	"upstream repository identity is missing",
);

expect(config.includes('android:scheme="vexa"'), "vexa:// scheme is missing");
expect(
	config.includes('android:scheme="acode"'),
	"legacy acode:// compatibility scheme is missing",
);
expect(
	config.includes('android:icon="@drawable/vexa_icon"'),
	"active launcher icon must use vexa_icon",
);
expect(
	config.includes('android:roundIcon="@drawable/vexa_icon"'),
	"active round launcher icon must use vexa_icon",
);
expect(
	!config.includes("@mipmap/ic_acode_"),
	"config.xml still references a legacy Acode launcher resource",
);

const appIcons = read("src/lib/appIcons.js");
expect(
	appIcons.includes('image: "icons/vexa.svg"'),
	"default app icon must use vexa.svg",
);
expect(
	!appIcons.includes("icons/ic_acode_"),
	"app icon picker still references legacy Acode SVGs",
);

const runtimeConfig = read("src/lib/config.js");
expect(
	runtimeConfig.includes('LOG_FILE_NAME: "Vexa.log"'),
	"Vexa log filename is missing",
);
expect(
	runtimeConfig.includes("GITHUB_URL: VEXA_IDENTITY.REPOSITORY_URL"),
	"GitHub URL must use canonical Vexa identity",
);

const helpers = read("src/utils/helpers.js");
expect(
	/com\.vexa\.app(?:free)?\.documents/.test(helpers) &&
		/com\.foxdebug\.acode(?:free)?\.documents/.test(helpers),
	"helpers.js must support Vexa SAF and legacy Acode SAF URIs",
);

const openFolder = read("src/lib/openFolder.js");
expect(
	/com\.vexa\.app(?:free)?\.documents/.test(openFolder) &&
		/com\.foxdebug\.acode/.test(openFolder),
	"openFolder.js must support Vexa SAF and legacy compatibility",
);

const packageJsonText = read("package.json");
expect(
	packageJsonText.includes(
		'"verify:branding": "node utils/verify-vexa-branding.js"',
	),
	"verify:branding script is missing",
);
expect(
	packageJsonText.includes('"prebuild": "npm run verify:branding"'),
	"prebuild branding gate is missing",
);

const buildScript = read("utils/scripts/build.sh");
expect(
	buildScript.startsWith("#!/usr/bin/env bash"),
	"build.sh must use bash explicitly",
);
expect(buildScript.includes("set -Eeuo pipefail"), "build.sh must fail fast");
expect(!buildScript.includes("eval "), "build.sh must not use eval");

for (const file of [
	"res/android/drawable/vexa_icon.png",
	"res/android/drawable/vexa_icon_foreground.xml",
	"www/icons/vexa.png",
	"www/icons/vexa.svg",
]) {
	expectFile(file);
}

const pngPath = path.join(root, "..", "res/android/drawable/vexa_icon.png");
const png = fs.readFileSync(pngPath);
expect(
	png.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
	"vexa_icon.png is not a valid PNG",
);
expect(png.length >= 24, "vexa_icon.png is truncated");
expect(png.readUInt32BE(16) === 128, "vexa_icon.png width must be 128px");
expect(png.readUInt32BE(20) === 128, "vexa_icon.png height must be 128px");

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

const androidRoot = path.join(root, "..", "res/android");
const legacyLauncherFiles = walk(androidRoot).filter((file) =>
	/[/\\](?:mipmap-(mdpi|hdpi|xhdpi|xxhdpi|xxxhdpi)|drawable-[^/\\]+)[/\\](?:ic_acode_[^/\\]+|ic_launcher(?:_round)?)\.webp$/i.test(
		file,
	),
);

expect(
	legacyLauncherFiles.length > 0,
	"no Android launcher WebP assets were found under res/android",
);

for (const file of legacyLauncherFiles) {
	const data = fs.readFileSync(file);
	expect(
		data.length > 64,
		`launcher asset is unexpectedly small: ${path.relative(root, file)}`,
	);
	expect(
		data.subarray(0, 4).toString("ascii") === "RIFF",
		`launcher asset is not RIFF/WebP: ${path.relative(root, file)}`,
	);
	expect(
		data.subarray(8, 12).toString("ascii") === "WEBP",
		`launcher asset is not WebP: ${path.relative(root, file)}`,
	);
}

console.log(
	`[Vexa branding] PASS | Version: ${pkg.version} | Package: ${pkg.name} | Launcher WebP assets checked: ${legacyLauncherFiles.length}`,
);
