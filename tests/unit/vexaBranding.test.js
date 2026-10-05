import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file) =>
	fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

describe("Vexa branding", () => {
	it("keeps application identity aligned", () => {
		const config = read("config.xml");
		const main = read("src/main.js");
		const core = read("src/lib/vexa.js");
		const settings = read("src/settings/mainSettings.js");
		const packageJson = JSON.parse(read("package.json"));
		const packageLock = JSON.parse(read("package-lock.json"));
		expect(fs.existsSync(new URL("../../src/lib/vexa.js", import.meta.url))).toBe(true);
		expect(fs.existsSync(new URL("../../src/lib/acode.js", import.meta.url))).toBe(false);

		expect(config).toMatch(/<widget[^>]*\bid="com\.vexa\.app"/);
		expect(config).toMatch(/<name>Vexa<\/name>/);
		expect(packageJson.name).toBe("com.vexa.app");
		expect(packageJson.displayName).toBe("Vexa");
				expect(packageLock.name).toBe("com.vexa.app");
		expect(packageJson.version).toBe("1.15.0");
		expect(settings).toContain('strings["rate vexa"]');
		expect(settings).toContain('strings["settings-category-about-vexa"]');
		expect(settings).toContain('strings["settings-category-support-vexa"]');
		expect(packageLock.version).toBe(packageJson.version);
		expect(main).toContain('import vexa from "lib/vexa";');
		expect(main).toContain("window.vexa = vexa");
		expect(core).toContain("class Vexa");
	});

	it("uses the Vexa asset for active launcher/icon selection", () => {
		const config = read("config.xml");
		const appIcons = read("src/lib/appIcons.js");

		expect(config).not.toMatch(/@mipmap\/ic_acode_/);
		expect(config).toMatch(/android:icon="@drawable\/vexa_icon"/);
		expect(config).toMatch(/android:roundIcon="@drawable\/vexa_icon"/);
		const iconImages =
			[...appIcons.matchAll(/image: "(icons\/vexa[^"]*\.svg)"/g)].map(
				(match) => match[1],
			);
		expect(iconImages).toHaveLength(16);
		expect(new Set(iconImages)).toHaveLength(16);
		expect(appIcons).not.toMatch(/icons\/ic_acode_/);
		expect(appIcons).toMatch(/icons\/vexa_default\.svg|icons\/vexa\.svg/);
		expect(read("www/logo.svg")).toContain("Vexa logo");
	});

	it("keeps the in-app test runner branded as Vexa", () => {
		const tester = read("src/test/tester.js");

		expect(tester).toContain("Running Vexa test suite...");
		expect(tester).not.toContain("Running Acode test suite...");
	});

	it("uses Vexa command identities", () => {
		const commands = read("src/cm/commandRegistry.js");
		const bindings = read("src/lib/keyBindings.js");

		expect(commands).toContain('name: "vexa:showWelcome"');
		expect(bindings).toContain('name: "vexa:showWelcome"');
	});

	it("uses the Vexa runtime boundary for migrated internal surfaces", () => {
		const api = read("src/lib/vexaApi.js");
		const commandRegistry = read("src/cm/commandRegistry.js");
		const loadPlugin = read("src/lib/loadPlugin.js");
		const loadPlugins = read("src/lib/loadPlugins.js");

		expect(api).toContain("getVexaCoreBoundaryStatus");
		expect(api).toContain("requireVexaCore");
		expect(commandRegistry).not.toContain("acode.exec(");
		expect(loadPlugin).not.toContain("acode.initPlugin");
		expect(loadPlugins).not.toContain("acode[onPluginLoadCallback]");
	});

	it("aligns Vexa deep links and API credential routing", () => {
		const deepLink = read("src/utils/appDeepLink.js");
		const intentHandler = read("src/handlers/intent.js");
		const main = read("src/main.js");

		expect(deepLink).toContain("VEXA_IDENTITY.URL_SCHEME");
				expect(intentHandler).toContain("parseAppDeepLink(url)");
		expect(main).toContain("config.API_BASE");
		expect(main).not.toContain('url.includes("acode.app/api")');

		const polyfill = read("src/lib/polyfill.js");
		expect(polyfill).toContain('import config from "./config";');
		expect(polyfill).toContain("config.API_BASE");
		expect(polyfill).not.toContain('url.includes("acode.app/api")');
	});

		it("keeps visible branding on Vexa assets and UI", () => {
		const about = read("src/pages/about/about.js");
		const welcome = read("src/pages/welcome/welcome.js");
		const appSettings = read("src/settings/appSettings.js");
		const runningProcesses = read("src/pages/runningProcesses/runningProcesses.js");
		const themeSetting = read("src/pages/themeSetting/themeSetting.js");
		const backupRestore = read("src/settings/backupRestore.js");
		const devcontainer = read(".devcontainer/devcontainer.json");
		const css = read("src/res/icons/style.css");

		expect(about).toContain('className="icon vexa"');
		expect(about).not.toContain('className="icon acode"');
		expect(welcome).toContain('tabIcon: "icon vexa"');
		expect(welcome).toContain('<LinkItem icon="vexa"');
		expect(appSettings).toContain("Scale text across the Vexa interface.");
		expect(runningProcesses).toContain('"Vexa Service"');
		expect(runningProcesses).toContain('"Vexa main process"');
		expect(themeSetting).toContain(">vexa</span>");
		expect(backupRestore).toContain("Vexa_backup_");
		expect(devcontainer).toContain('"name": "Vexa Development"');
		expect(css).toContain(".icon.vexa");
		expect(css).toContain('url("icons/vexa.svg")');
	});
it("uses the Vexa log filename", () => {
		expect(read("src/lib/config.js")).toMatch(/LOG_FILE_NAME:\s*"Vexa\.log"/);
	});
	it("exposes safe Vexa repository commands", () => {
		const commands = read("src/cm/commandRegistry.js");

		expect(commands).toContain('name: "vexa:copyDiagnostics"');
		expect(commands).toContain('name: "vexa:openRepository"');
		expect(commands).toContain('name: "vexa:openReleases"');
		expect(commands).toContain("VEXA_IDENTITY.REPOSITORY_URL");
	});

	it("pins native authentication to trusted HTTPS origins", () => {
		const authenticator = read(
			"src/plugins/auth/src/android/Authenticator.java",
		);

		expect(authenticator).toContain("Unsupported authentication endpoint");
		expect(authenticator).toContain("Untrusted authentication endpoint");
		expect(authenticator).toContain("validateBaseUrl(options.optString");
		expect(authenticator).toContain("validateBaseUrl(");
		expect(authenticator).toContain('"vexa".equalsIgnoreCase(data.getScheme())');
	});

	it("keeps About links explicit about Vexa and upstream boundaries", () => {
		const about = read("src/pages/about/about.js");

		expect(about).toContain("VEXA_IDENTITY.NAME");
		expect(about).toContain("VEXA_IDENTITY.REPOSITORY_URL");
		expect(about).toContain("Service endpoint");
		expect(about).toContain("Vexa repository");
		expect(about).toContain("Vexa releases");
	});

});
