import { describe, expect, it } from "vitest";
import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");

describe("Vexa Termux integration", () => {
	it("packages the Termux bridge instead of the embedded terminal service", () => {
		const plugin = read("src/plugins/terminal/plugin.xml");

		expect(plugin).toContain("TermuxBridge");
		expect(plugin).toContain("com.termux.permission.RUN_COMMAND");
		expect(plugin).toContain('com.termux');
		expect(plugin).not.toContain("AlpineDocumentProvider.java");
		expect(plugin).not.toContain("init-alpine.sh");
		expect(plugin).not.toContain("init-sandbox.sh");
	});

	it("uses Termux as the local terminal facade", () => {
		const facade = read("src/plugins/terminal/www/Terminal.js");
		const component = read("src/components/terminal/terminal.js");
		const manager = read("src/components/terminal/terminalManager.js");

		expect(facade).toContain('packageName: "com.termux"');
		expect(facade).toContain('backend: "termux"');
		expect(component).toContain("connectToTermuxSession");
		expect(manager).toContain("termuxMode: isTermuxTerminal");
	});
});
