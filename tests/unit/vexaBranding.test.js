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

	it("keeps Android network and terminal service policy hardened", () => {
		const networkConfig = read(
			"res/android/xml/network_security_config.xml",
		);
		const appConfig = read("config.xml");
		const terminalPlugin = read("src/plugins/terminal/plugin.xml");

		expect(networkConfig).toMatch(
			/<base-config cleartextTrafficPermitted="false">/,
		);
		expect(networkConfig).toMatch(
			/<domain includeSubdomains="false">localhost<\/domain>/,
		);
		expect(networkConfig).toMatch(
			/<domain includeSubdomains="false">127\.0\.0\.1<\/domain>/,
		);
		expect(appConfig).toMatch(
			/android:usesCleartextTraffic="false"/,
		);
		expect(terminalPlugin).toMatch(
			/PROPERTY_SPECIAL_USE_FGS_SUBTYPE/,
		);
		expect(terminalPlugin).toMatch(
			/foregroundServiceType="specialUse"/,
		);
	});
});
