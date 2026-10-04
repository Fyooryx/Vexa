#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

function expect(condition, message) {
	if (!condition) throw new Error(`[Vexa Termux] FAIL: ${message}`);
}

const config = read("config.xml");
const packageJson = JSON.parse(read("package.json"));
const plugin = read("src/plugins/terminal/plugin.xml");
const terminalFacade = read("src/plugins/terminal/www/Terminal.js");
const terminalComponent = read("src/components/terminal/terminal.js");
const terminalManager = read("src/components/terminal/terminalManager.js");
const defaults = read("src/components/terminal/terminalDefaults.js");
const settings = read("src/settings/terminalSettings.js");

expect(packageJson.name === "com.vexa.app", "application package must remain com.vexa.app");
expect(packageJson.displayName === "Vexa", "application display name must remain Vexa");
expect(config.includes('id="com.vexa.app"'), "config.xml must use com.vexa.app");
expect(config.includes("<name>Vexa</name>"), "config.xml must use Vexa name");

expect(plugin.includes("TermuxBridge"), "terminal plugin must expose TermuxBridge");
expect(plugin.includes('android:name="com.termux.permission.RUN_COMMAND"'), "Termux RUN_COMMAND permission is missing");
expect(plugin.includes('<package android:name="com.termux" />'), "Termux package visibility query is missing");
expect(plugin.includes('src/android/TermuxBridge.java'), "TermuxBridge native source is missing");
expect(!plugin.includes("AlpineDocumentProvider.java"), "embedded Alpine document provider must not be packaged");
expect(plugin.includes("TerminalService.java"), "internal runtime service must remain available for built-in LSP/runtime compatibility");
expect(plugin.includes("init-alpine.sh"), "internal Alpine runtime asset must remain available for built-in LSP compatibility");
expect(plugin.includes("init-sandbox.sh"), "internal sandbox runtime asset must remain available for built-in LSP compatibility");

expect(terminalFacade.includes('packageName: "com.termux"'), "terminal facade must target Termux");
expect(terminalFacade.includes('backend: "termux"'), "terminal facade backend must be Termux");
expect(terminalFacade.includes("TermuxBridge"), "terminal facade must use native Termux bridge");
expect(terminalFacade.includes("packageName: \"com.termux\""), "terminal facade must target the official Termux package");
expect(!terminalFacade.includes("downloadFile("), "terminal facade must not download an embedded runtime");

expect(terminalComponent.includes("termuxMode"), "terminal component must expose Termux mode");
expect(terminalComponent.includes("connectToTermuxSession"), "terminal component must connect through Termux");
expect(terminalManager.includes("termuxMode: isTermuxTerminal"), "terminal manager must create Termux terminals");
expect(!terminalManager.includes("Executor.stopService()"), "Termux tab lifecycle must not stop the internal runtime executor");
expect(!terminalManager.includes("acodeTerminalSessions"), "legacy Acode terminal session storage must not be restored");
expect(defaults.includes("termuxAutoOpen: true"), "Termux auto-open setting must be enabled by default");
expect(settings.includes("openTermux"), "Terminal settings must expose an Open Termux action");

expect(fs.existsSync(path.join(root, "src/plugins/terminal/src/android/TermuxBridge.java")), "TermuxBridge.java must exist");
console.log(`[Vexa Termux] PASS | Vexa ${packageJson.version} | Termux backend configured`);
