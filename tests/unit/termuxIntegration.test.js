import fs from "node:fs";
import { describe, expect, it } from "vitest";

const read = (file) =>
	fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

describe("Vexa Termux bridge", () => {
	it("registers the optional Termux bridge without removing the built-in runtime", () => {
		const plugin = read("src/plugins/terminal/plugin.xml");

		expect(plugin).toContain("TermuxBridge");
		expect(plugin).toContain("com.termux.permission.RUN_COMMAND");
		expect(plugin).toContain('<package android:name="com.termux" />');
		expect(plugin).toContain("TerminalService.java");
		expect(plugin).toContain("AlpineDocumentProvider.java");
	});

	it("exposes the Termux bridge through the terminal facade", () => {
		const facade = read("src/plugins/terminal/www/Terminal.js");
		const bridge = read("src/plugins/terminal/src/android/TermuxBridge.java");

		expect(facade).toContain("isTermuxInstalled()");
		expect(facade).toContain("openTermuxSession");
		expect(facade).toContain("runTermuxCommand");
		expect(bridge).toContain('TERMUX_PACKAGE = "com.termux"');
		expect(bridge).toContain("com.termux.RUN_COMMAND");
	});
});
