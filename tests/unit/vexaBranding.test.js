import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file) =>
	fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

describe("Vexa branding", () => {
	it("keeps application identity aligned", () => {
		const config = read("config.xml");
		const packageJson = JSON.parse(read("package.json"));
		const packageLock = JSON.parse(read("package-lock.json"));

		expect(config).toMatch(/<widget[^>]*\bid="com\.vexa\.app"/);
		expect(config).toMatch(/<name>Vexa<\/name>/);
		expect(packageJson.name).toBe("com.vexa.app");
		expect(packageJson.displayName).toBe("Vexa");
		expect(packageLock.name).toBe("com.vexa.app");
		expect(packageLock.version).toBe(packageJson.version);
	});

	it("uses the Vexa asset for active launcher/icon selection", () => {
		const config = read("config.xml");
		const appIcons = read("src/lib/appIcons.js");

		expect(config).not.toMatch(/@mipmap\/ic_acode_/);
		expect(config).toMatch(/android:icon="@drawable\/vexa_icon"/);
		expect(config).toMatch(/android:roundIcon="@drawable\/vexa_icon"/);
		expect(appIcons).toMatch(/icons\/vexa\.svg/);
		expect(appIcons).not.toMatch(/icons\/ic_acode_/);
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

		expect(authenticator).toContain(
			'DEFAULT_BASE_URL = "https://acode.app"',
		);
		expect(authenticator).toContain("Unsupported authentication endpoint");
		expect(authenticator).toContain("Untrusted authentication endpoint");
		expect(authenticator).toContain(
			'("acode.app".equalsIgnoreCase(host) || "dev.acode.app".equalsIgnoreCase(host))',
		);
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
