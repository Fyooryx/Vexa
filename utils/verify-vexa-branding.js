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
const deepLink = read("src/utils/appDeepLink.js");
const intentHandler = read("src/handlers/intent.js");
const main = read("src/main.js");
const polyfill = read("src/lib/polyfill.js");
const bootstrap = read("www/index.html");

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

expect(
	deepLink.includes("VEXA_IDENTITY.URL_SCHEME") &&
		deepLink.includes("VEXA_IDENTITY.LEGACY_URL_SCHEME"),
	"deep-link parser must derive both Vexa and legacy schemes from canonical identity",
);
expect(
	intentHandler.includes("parseAppDeepLink(url)"),
	"intent handler must use the canonical deep-link parser",
);
expect(
	polyfill.includes('import config from "./config";') &&
		polyfill.includes("config.API_BASE") &&
		!polyfill.includes('url.includes("acode.app/api")'),
	"fetch credential routing must use the configured API base in the global polyfill",
);
expect(
	main.includes("config.API_BASE") &&
		!main.includes('url.includes("acode.app/api")'),
	"credential routing must use the configured API base instead of a hard-coded substring match",
);
expect(
	bootstrap.includes("<title>Vexa</title>"),
	"web bootstrap title must use Vexa branding",
);
for (const text of [
	"Vexa requires a modern browser.",
	"if Vexa stays on this screen.",
	"Vexa failed to start: storage is unavailable.",
	"Vexa failed to start. Update Android System WebView or Chrome.",
]) {
	expect(bootstrap.includes(text), `bootstrap must use Vexa startup text: ${text}`);
}

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

const englishStrings = readJson("src/lang/en-us.json");
const indonesianStrings = readJson("src/lang/id-id.json");
for (const [locale, strings] of [
	["en-us", englishStrings],
	["id-id", indonesianStrings],
]) {
	for (const [key, value] of Object.entries(strings)) {
		expect(
			typeof value !== "string" || !/\bAcode\b/i.test(value),
			`${locale} translation still exposes the old product name at key: ${key}`,
		);
	}
}

const pluginView = read("src/pages/plugin/plugin.view.js");
expect(
	!pluginView.includes("Built for older Acode"),
	"plugin compatibility warning still exposes the old product name",
);

const terminalInit = read("src/plugins/terminal/scripts/init-alpine.sh");
expect(
	terminalInit.includes("Welcome to Alpine Linux in Vexa!"),
	"Alpine terminal MOTD must use Vexa branding",
);
expect(
	terminalInit.includes("/usr/local/bin/vexa") &&
		terminalInit.includes('ln -sfn vexa "$PREFIX/alpine/usr/local/bin/acode"'),
	"Vexa terminal CLI must be installed with an Acode compatibility alias",
);

const aboutPage = read("src/pages/about/about.js");
const welcomePage = read("src/pages/welcome/welcome.js");
const appSettings = read("src/settings/appSettings.js");
const runningProcesses = read("src/pages/runningProcesses/runningProcesses.js");
const themeSetting = read("src/pages/themeSetting/themeSetting.js");
const backupRestore = read("src/settings/backupRestore.js");
const devcontainer = read(".devcontainer/devcontainer.json");
const iconCss = read("src/res/icons/style.css");

expect(
	aboutPage.includes('className="icon vexa"') &&
		!aboutPage.includes('className="icon acode"'),
	"About page must use the Vexa icon class",
);
expect(
	welcomePage.includes('tabIcon: "icon vexa"') &&
		welcomePage.includes('<LinkItem icon="vexa"') &&
		!welcomePage.includes('tabIcon: "icon acode"'),
	"Welcome page must use Vexa icon branding",
);
expect(
	iconCss.includes(".icon.vexa") &&
	iconCss.includes('url("/icons/vexa.svg")'),
	"Vexa icon CSS must use the Vexa logo asset",
);
for (const [file, source] of [
	["appSettings.js", appSettings],
	["runningProcesses.js", runningProcesses],
	["themeSetting.js", themeSetting],
	["backupRestore.js", backupRestore],
	["devcontainer.json", devcontainer],
]) {
	expect(
		!/\bAcode\b/i.test(source),
		`${file} still exposes a user-visible Acode brand string`,
	);
}
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
	helpers.includes("isVexaTerminalPublicSafUri") &&
		helpers.includes("com.vexa.app") &&
		helpers.includes("isLegacyAcodeTerminalPublicSafUri") &&
		helpers.includes("com.foxdebug.acode"),
	"helpers.js must support Vexa and legacy Acode SAF URIs",
);

const openFolder = read("src/lib/openFolder.js");
expect(
	openFolder.includes("isTerminalPublicSafUri") &&
		openFolder.includes("com\\.vexa\\.app") &&
		openFolder.includes("com\\.foxdebug\\.acode"),
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

const logoPath = path.join(root, "..", "res/logo_1.png");
const logo = fs.readFileSync(logoPath);
expect(
	logo.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
	"res/logo_1.png is not a valid PNG",
);
expect(logo.readUInt32BE(16) === 128, "res/logo_1.png width must be 128px");
expect(logo.readUInt32BE(20) === 128, "res/logo_1.png height must be 128px");

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
const legacyNamedResources = walk(androidRoot).filter((file) =>
	/ic_acode_/i.test(file),
);
expect(
	legacyNamedResources.length === 0,
	"legacy ic_acode_* resource files must not remain in the Vexa source tree",
);

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
