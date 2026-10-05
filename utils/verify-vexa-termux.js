#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const readJson = (file) => JSON.parse(read(file));

function expect(condition, message) {
	if (!condition) throw new Error(`[Vexa Termux] FAIL: ${message}`);
}

const packageJson = readJson("package.json");
const config = read("config.xml");
const plugin = read("src/plugins/terminal/plugin.xml");
const bridge = read("src/plugins/terminal/src/android/TermuxBridge.java");
const facade = read("src/plugins/terminal/www/Terminal.js");
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
	"TermuxBridge source is missing",
);
expect(
	bridge.includes('TERMUX_PACKAGE = "com.termux"'),
	"Termux package constant is missing",
);
expect(
	bridge.includes("com.termux.RUN_COMMAND"),
	"RUN_COMMAND action is missing",
);
expect(
	bridge.includes("RUN_COMMAND_PATH"),
	"RUN_COMMAND path extra is missing",
);
expect(
	bridge.includes("RUN_COMMAND_ARGUMENTS"),
	"RUN_COMMAND arguments extra is missing",
);
expect(
	bridge.includes("RUN_COMMAND_WORKDIR"),
	"RUN_COMMAND working-directory extra is missing",
);

expect(
	facade.includes("isTermuxInstalled()"),
	"Termux availability API is missing",
);
expect(facade.includes("openTermux()"), "Termux open API is missing");
expect(
	facade.includes("openTermuxSession("),
	"Termux session API is missing",
);
expect(
	facade.includes("runTermuxCommand("),
	"Termux command API is missing",
);
expect(
	defaults.includes('termuxWorkdir: "~"'),
	"Termux working directory default is missing",
);
expect(
	settings.includes('key: "openTermux"'),
	"Open Termux setting is missing",
);
expect(
	settings.includes('key: "openTermuxSession"'),
	"Open Termux shell setting is missing",
);
expect(
	settings.includes('key: "termuxWorkdir"'),
	"Termux working directory setting is missing",
);

for (const file of [
	"src/plugins/terminal/src/android/TermuxBridge.java",
	"src/plugins/terminal/www/Terminal.js",
]) {
	expect(fs.existsSync(path.join(root, file)), `missing Termux asset: ${file}`);
}

console.log(
	`[Vexa Termux] PASS | Vexa ${packageJson.version} | optional Termux bridge verified`,
);
