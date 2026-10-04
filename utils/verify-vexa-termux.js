#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(read(file));

function expect(condition, message) {
	if (!condition) {
		throw new Error(`[Vexa Termux] FAIL: ${message}`);
	}
}

const packageJson = readJson("package.json");
const config = read("config.xml");
const plugin = read("src/plugins/terminal/plugin.xml");
const bridge = read("src/plugins/terminal/src/android/TermuxBridge.java");
const facade = read("src/plugins/terminal/www/Terminal.js");
const component = read("src/components/terminal/terminal.js");
const manager = read("src/components/terminal/terminalManager.js");
const defaults = read("src/components/terminal/terminalDefaults.js");
const settings = read("src/settings/terminalSettings.js");

expect(
	packageJson.name === "com.vexa.app",
	"application package must remain com.vexa.app",
);
expect(
	packageJson.displayName === "Vexa",
	"application display name must remain Vexa",
);
expect(
	config.includes('id="com.vexa.app"'),
	"config.xml must use com.vexa.app",
);
expect(config.includes("<name>Vexa</name>"), "config.xml must use Vexa");

expect(
	plugin.includes("TermuxBridge"),
	"terminal plugin must expose TermuxBridge",
);
expect(
	plugin.includes('android:name="com.termux.permission.RUN_COMMAND"'),
	"Termux RUN_COMMAND permission is missing",
);
expect(
	plugin.includes('<package android:name="com.termux" />'),
	"Termux package visibility query is missing",
);
expect(
	plugin.includes("src/android/TermuxBridge.java"),
	"TermuxBridge native source is missing",
);
expect(
	!plugin.includes("AlpineDocumentProvider.java"),
	"obsolete Alpine document provider must not be packaged",
);
expect(
	plugin.includes("TerminalService.java"),
	"internal runtime service must remain for built-in LSP/runtime compatibility",
);
expect(
	plugin.includes("init-alpine.sh"),
	"internal Alpine runtime asset must remain for built-in LSP compatibility",
);
expect(
	plugin.includes("init-sandbox.sh"),
	"internal sandbox runtime asset must remain for built-in LSP compatibility",
);

expect(
	bridge.includes('TERMUX_PACKAGE = "com.termux"'),
	"Termux package constant is missing",
);
expect(
	bridge.includes("com.termux.RUN_COMMAND"),
	"Termux RUN_COMMAND action is missing",
);
expect(
	bridge.includes("RUN_COMMAND_PATH"),
	"Termux command path extra is missing",
);
expect(
	bridge.includes("RUN_COMMAND_ARGUMENTS"),
	"Termux command arguments extra is missing",
);
expect(
	bridge.includes("RUN_COMMAND_WORKDIR"),
	"Termux working directory extra is missing",
);

expect(
	facade.includes('packageName: "com.termux"'),
	"terminal facade must target Termux",
);
expect(
	facade.includes('backend: "termux"'),
	"terminal facade backend must be Termux",
);
expect(
	facade.includes("TermuxBridge"),
	"terminal facade must use the native Termux bridge",
);
expect(
	!facade.includes("downloadFile("),
	"terminal facade must not download an embedded runtime",
);

expect(
	component.includes("termuxMode"),
	"terminal component must expose Termux mode",
);
expect(
	component.includes("connectToTermuxSession"),
	"terminal component must connect through Termux",
);
expect(
	manager.includes("termuxMode: isTermuxTerminal"),
	"terminal manager must create Termux terminals",
);
expect(
	!manager.includes("Executor.stopService()"),
	"Termux tab lifecycle must not stop the internal runtime executor",
);
expect(
	!manager.includes("acodeTerminalSessions"),
	"legacy Acode terminal session storage must not be restored",
);
expect(
	defaults.includes("termuxAutoOpen: true"),
	"Termux auto-open must be enabled by default",
);
expect(
	defaults.includes('termuxWorkdir: "~"'),
	"Termux working directory default is missing",
);
expect(
	settings.includes('key: "openTermux"'),
	"settings must expose an Open Termux action",
);
expect(
	settings.includes('key: "termuxWorkdir"'),
	"settings must expose a Termux working directory",
);

for (const file of [
	"src/plugins/terminal/src/android/TermuxBridge.java",
	"src/plugins/terminal/www/Terminal.js",
	"docs/TERMUX_TERMINAL.md",
]) {
	expect(fs.existsSync(path.join(root, file)), `missing Termux asset: ${file}`);
}

console.log(
	`[Vexa Termux] PASS | Vexa ${packageJson.version} | Termux backend verified`,
);
