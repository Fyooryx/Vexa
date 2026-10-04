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

	it("keeps Vexa deep-link handling aligned", () => {
		const intent = read("src/handlers/intent.js");
		const identity = read("src/lib/vexaIdentity.js");

		expect(intent).toContain("isVexaDeepLink(url)");
		expect(intent).toContain("VEXA_IDENTITY.URL_SCHEME");
		expect(intent).toContain("VEXA_IDENTITY.LEGACY_URL_SCHEME");
		expect(identity).toContain("export function isUpstreamApiUrl");
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

});
