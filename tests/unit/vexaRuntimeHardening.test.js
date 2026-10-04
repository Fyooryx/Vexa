import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file) =>
	fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

describe("Vexa runtime hardening", () => {
	it("does not leave an unimplemented AdMob base isLoaded path", () => {
		const source = read(
			"src/plugins/admob/src/android/cordova/ads/AdBase.kt",
		);

		expect(source).toContain("open val isLoaded: Boolean");
		expect(source).toContain("get() = false");
		expect(source).not.toContain('TODO("Not yet implemented")');
	});

	it("uses CodeMirror measurement for the resize-editor command", () => {
		const source = read("src/lib/commands.js");

		expect(source).toContain('editor.requestMeasure?.()');
		expect(source).not.toContain("// TODO : Codemirror");
	});

	it("keeps native Vexa app-icon state synchronized with settings", () => {
		const systemJava = read(
			"src/plugins/system/android/com/foxdebug/system/System.java",
		);
		const systemApi = read("src/plugins/system/www/plugin.js");
		const main = read("src/main.js");

		expect(systemJava).toContain('case "get-app-icon":');
		expect(systemJava).toContain('"vexa_preferences"');
		expect(systemJava).toContain('.putString("app_icon", key)');
		expect(systemApi).toContain('get-app-icon');
		expect(main).toContain("system.getAppIcon");
		expect(main).toContain("native Vexa app icon state");
	});
});
