/**
 * Termux-backed terminal facade for Vexa.
 *
 * The old embedded Alpine/AXS environment is no longer installed or started.
 * Interactive shell sessions are delegated to the official Termux application
 * through its documented RUN_COMMAND interface.
 */
const exec = require("cordova/exec");

const Terminal = {
	packageName: "com.termux",
	backend: "termux",

	isInstalled() {
		return new Promise((resolve, reject) => {
			exec(
				(result) => resolve(result === "1" || result === 1 || result === true),
				reject,
				"TermuxBridge",
				"isInstalled",
				[],
			);
		});
	},

	isSupported() {
		return this.isInstalled();
	},

	open() {
		return new Promise((resolve, reject) => {
			exec(resolve, reject, "TermuxBridge", "open", []);
		});
	},

	openSession(workdir = "~") {
		return new Promise((resolve, reject) => {
			exec(resolve, reject, "TermuxBridge", "openSession", [workdir]);
		});
	},

	runShell(command, options = {}) {
		const workdir =
			typeof options.workdir === "string" && options.workdir.trim()
				? options.workdir.trim()
				: "~";
		const background = options.background === true;

		return new Promise((resolve, reject) => {
			exec(
				resolve,
				reject,
				"TermuxBridge",
				"runShell",
				[String(command ?? ""), workdir, background],
			);
		});
	},

	execute(command, options = {}) {
		return this.runShell(command, {
			...options,
			background: options.background !== false,
		});
	},

	legacyWarning() {
		return "Vexa Terminal now uses Termux. Install Termux and grant Vexa permission to run commands in the Termux environment.";
	},

	// Compatibility methods. They intentionally do not recreate Alpine/AXS.
	async startAxs() {
		throw new Error(this.legacyWarning());
	},

	async install() {
		throw new Error(this.legacyWarning());
	},

	async uninstall() {
		return true;
	},

	async backup() {
		throw new Error("Vexa does not own the Termux filesystem. Manage Termux backups from Termux.");
	},

	async restore() {
		throw new Error("Vexa does not own the Termux filesystem. Restore the Termux environment from Termux.");
	},

	async isAxsRunning() {
		return false;
	},

	async stopAxs() {
		return true;
	},

	async migrateLegacyHome() {
		return true;
	},
};

module.exports = Terminal;
