import config from "./config";
import { getRuntimePackageName, VEXA_IDENTITY } from "./vexaIdentity";
import { getVexaCore, getVexaCoreBoundaryStatus } from "./vexaApi";

function valueOrUnknown(value) {
	return value === undefined || value === null || value === ""
		? "unknown"
		: String(value);
}

function getRuntime(runtime = {}) {
	return {
		buildInfo: runtime.buildInfo ?? globalThis.BuildInfo ?? {},
		device: runtime.device ?? globalThis.device ?? {},
		navigator: runtime.navigator ?? globalThis.navigator ?? {},
		editorManager: runtime.editorManager ?? globalThis.editorManager ?? null,
		clipboard: runtime.clipboard ?? null,
		cordova: runtime.cordova ?? globalThis.cordova,
		lspProviders: Array.isArray(runtime.lspProviders)
			? runtime.lspProviders
			: null,
	};
}

function getEditorFiles(editorManager) {
	return Array.isArray(editorManager?.files)
		? editorManager.files.filter((file) => file?.type === "editor")
		: [];
}

function getActiveSelection(editorManager) {
	const selection = editorManager?.editor?.state?.selection?.main;
	const doc = editorManager?.editor?.state?.doc;
	if (!selection || !doc?.lineAt) return null;
	const line = doc.lineAt(selection.head);
	return {
		line: line.number,
		column: Math.max(1, selection.head - line.from + 1),
	};
}

export function getWorkspaceSnapshot(runtime = {}) {
	const current = getRuntime(runtime);
	const files = getEditorFiles(current.editorManager);
	const activeFile = current.editorManager?.activeFile ?? null;
	const dirtyFiles = files.filter((file) => file?.markChanged);
	const selection = getActiveSelection(current.editorManager);
	const providers =
		current.lspProviders ??
		(typeof globalThis.listRuntimeProviders === "function"
			? globalThis.listRuntimeProviders()
			: typeof globalThis.vexa?.require === "function"
				? globalThis.vexa.require("lsp")?.runtimes?.list?.() || []
				: []);

	return {
		openFiles: files.length,
		dirtyFiles: dirtyFiles.length,
		activeFile: activeFile?.filename || activeFile?.name || "unknown",
		activeUri: activeFile?.uri || "unknown",
		selection,
		paneCount: Array.isArray(current.editorManager?.panes)
			? current.editorManager.panes.length
			: null,
		lspProviders: providers
			.map((provider) =>
				typeof provider === "string" ? provider : provider?.id,
			)
			.filter(Boolean),
	};
}

export function getVexaIdentityStatus(runtime = {}) {
	const current = getRuntime(runtime);
	const packageName = getRuntimePackageName(current.buildInfo);
	const checks = [
		{
			id: "name",
			label: "Product name",
			ok: VEXA_IDENTITY.NAME === "Vexa",
		},
		{
			id: "package",
			label: "Application package",
			ok: packageName === VEXA_IDENTITY.PACKAGE_NAME,
		},
		{
			id: "scheme",
			label: "Primary URL scheme",
			ok: VEXA_IDENTITY.URL_SCHEME === "vexa",
		},
	];
	const failed = checks.filter((check) => !check.ok).length;
	return Object.freeze({
		schemaVersion: 1,
		mode: VEXA_IDENTITY.IDENTITY_MODE,
		status: failed === 0 ? "LOCKED" : "ATTENTION",
		passed: checks.length - failed,
		failed,
		checks,
	});
}

export function formatVexaIdentityStatus(runtime = {}) {
	const status = getVexaIdentityStatus(runtime);
	return [
		"Vexa Identity Lock",
		"------------------",
		"Mode: " + status.mode,
		"Status: " + status.status,
		"Checks: " + status.passed + " passed / " + status.failed + " failed",
		"",
		...status.checks.map(
			(check) => (check.ok ? "PASS " : "FAIL ") + check.label,
		),
	].join("\n");
}

export function getVexaWorkspacePulse(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const health = getVexaHealthScore(runtime);
	const signals = [];

	if (workspace.dirtyFiles > 0) {
		signals.push({
			id: "unsaved",
			level: "attention",
			message: workspace.dirtyFiles + " unsaved file" + (workspace.dirtyFiles === 1 ? "" : "s"),
		});
	}
	if (health.failed > 0) {
		signals.push({
			id: "health",
			level: "attention",
			message: health.failed + " health check" + (health.failed === 1 ? "" : "s") + " need attention",
		});
	}
	if (current.navigator?.onLine === false) {
		signals.push({
			id: "offline",
			level: "info",
			message: "Offline mode",
		});
	}
	if (workspace.lspProviders.length === 0) {
		signals.push({
			id: "lsp",
			level: "info",
			message: "No LSP providers are currently registered",
		});
	}
	if (workspace.activeFile === "unknown") {
		signals.push({
			id: "focus",
			level: "info",
			message: "No active editor file",
		});
	}

	const criticalHealthFailure = health.checks.some(
		(check) =>
			!check.ok &&
			["identity", "runtime", "editor"].includes(check.id),
	);
	const status = criticalHealthFailure ? "ATTENTION" : "READY";
	return Object.freeze({
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		app: VEXA_IDENTITY.NAME,
		status,
		healthScore: health.score,
		activeFile: workspace.activeFile,
		openFiles: workspace.openFiles,
		dirtyFiles: workspace.dirtyFiles,
		lspProviders: workspace.lspProviders,
		signals,
	});
}

export function formatVexaWorkspacePulse(runtime = {}) {
	const pulse = getVexaWorkspacePulse(runtime);
	return [
		"Vexa Workspace Pulse",
		"--------------------",
		"Status: " + pulse.status,
		"Health: " + pulse.healthScore + "/100",
		"Open files: " + pulse.openFiles,
		"Unsaved files: " + pulse.dirtyFiles,
		"Active file: " + pulse.activeFile,
		"LSP providers: " +
			(pulse.lspProviders.length ? pulse.lspProviders.join(", ") : "none"),
		"",
		"Signals:",
		...(pulse.signals.length
			? pulse.signals.map((signal) => "- " + signal.message)
			: ["- none"]),
	].join("\n");
}

export function getVexaWorkspaceSnapshot(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const files = getEditorFiles(current.editorManager);

	return {
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		app: VEXA_IDENTITY.NAME,
		version: valueOrUnknown(current.buildInfo.versionName),
		package: getRuntimePackageName(current.buildInfo),
		migrationPhase: VEXA_IDENTITY.MIGRATION_PHASE ?? null,
		activeFile: workspace.activeFile,
		activeUri: workspace.activeUri,
		selection: workspace.selection,
		paneCount: workspace.paneCount,
		files: files.map((file) => ({
			filename: file?.filename || file?.name || "unknown",
			uri: file?.uri || null,
			dirty: Boolean(file?.markChanged || file?.isUnsaved),
			pinned: Boolean(file?.pinned),
			readOnly: Boolean(file?.readOnly),
			encoding: file?.encoding || null,
		})),
	};
}

export function formatVexaWorkspaceSnapshot(runtime = {}) {
	return JSON.stringify(getVexaWorkspaceSnapshot(runtime), null, 2);
}
export function getVexaWorkspaceReport(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const selection = workspace.selection
		? ":" + workspace.selection.line + ":" + workspace.selection.column
		: "";

	return [
		"Vexa Workspace Report",
		"---------------------",
		"App: " + VEXA_IDENTITY.NAME,
		"Version: " + valueOrUnknown(current.buildInfo.versionName),
		"Package: " + getRuntimePackageName(current.buildInfo),
		"Migration phase: " + valueOrUnknown(VEXA_IDENTITY.MIGRATION_PHASE),
		"Online: " + valueOrUnknown(current.navigator.onLine),
		"Open files: " + workspace.openFiles,
		"Unsaved files: " + workspace.dirtyFiles,
		"Active file: " + workspace.activeFile + selection,
		"Active URI: " + workspace.activeUri,
		"Editor panes: " + valueOrUnknown(workspace.paneCount),
		"LSP providers: " +
			(workspace.lspProviders.length
				? workspace.lspProviders.join(", ")
				: "none"),
		"Service boundary: " + config.BASE_URL,
		"Repository: " + VEXA_IDENTITY.REPOSITORY_URL,
	].join("\n");
}

export function getActiveCodeLocation(runtime = {}) {
	const workspace = getWorkspaceSnapshot(runtime);
	if (workspace.activeFile === "unknown") return null;
	const selection = workspace.selection
		? ":" + workspace.selection.line + ":" + workspace.selection.column
		: "";
	return workspace.activeFile + selection;
}

export function getVexaMigrationStatus() {
	return {
		phase: VEXA_IDENTITY.MIGRATION_PHASE ?? null,
		applicationName: VEXA_IDENTITY.NAME,
		applicationPackage: VEXA_IDENTITY.PACKAGE_NAME,
		freePackage: VEXA_IDENTITY.FREE_PACKAGE_NAME,
		primaryDeepLink: VEXA_IDENTITY.URL_SCHEME + "://",
		identityMode: VEXA_IDENTITY.IDENTITY_MODE,
	};
}

export function formatMigrationStatus() {
	const status = getVexaMigrationStatus();
	return [
		"Vexa Migration Status",
		"---------------------",
		"Phase: " + valueOrUnknown(status.phase),
		"Application: " + status.applicationName,
		"Package: " + status.applicationPackage,
		"Free package: " + status.freePackage,
		"Primary deep link: " + status.primaryDeepLink,
		"Identity mode: " + status.identityMode,
	].join("\n");
}

export function getVexaCapabilities(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const boundary = getVexaCoreBoundaryStatus();
	const capabilities = {
		coreBoundary: boundary.status === "CANONICAL",
		identityLock: true,
		workspacePulse: true,
		readinessGate: true,
		doctor: true,
		codemirror: Boolean(current.editorManager?.editor?.state),
		lsp: workspace.lspProviders.length > 0,
		multiPane: Number(workspace.paneCount || 0) > 1,
		terminal: Boolean(getVexaCore()?.require?.("terminal")),

		workspaceReport: true,
		workspaceCheckpoint: true,
		healthCheck: true,
		healthScore: true,
		healthSnapshot: true,
		migrationStatus: true,
		clipboard: Boolean(
			current.clipboard?.writeText ||
				current.navigator?.clipboard?.writeText ||
				current.cordova?.plugins?.clipboard?.copy,
		),
	};
	return Object.freeze(capabilities);
}

export function getVexaRuntimeProfile(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const checks = getVexaHealthChecks(runtime);
	const health = formatHealthSummary(checks);
	return Object.freeze({
		schemaVersion: 1,
		app: VEXA_IDENTITY.NAME,
		version: valueOrUnknown(current.buildInfo.versionName),
		package: getRuntimePackageName(current.buildInfo),
		migrationPhase: VEXA_IDENTITY.MIGRATION_PHASE ?? null,
		platform:
			current.device?.platform ||
			current.navigator?.userAgentData?.platform ||
			current.navigator?.platform ||
			"unknown",
		language: valueOrUnknown(current.navigator?.language),
		online: current.navigator?.onLine !== false,
		openFiles: workspace.openFiles,
		dirtyFiles: workspace.dirtyFiles,
		paneCount: workspace.paneCount,
		lspProviders: workspace.lspProviders,
		health: {
			passed: health.passed,
			failed: health.failed,
			ok: health.ok,
		},
		readiness: getVexaReadiness(runtime),
	});
}

export function formatVexaRuntimeProfile(runtime = {}) {
	const profile = getVexaRuntimeProfile(runtime);
	return [
		"Vexa Runtime Profile",
		"--------------------",
		"Schema: " + profile.schemaVersion,
		"App: " + profile.app,
		"Version: " + profile.version,
		"Package: " + profile.package,
		"Migration phase: " + valueOrUnknown(profile.migrationPhase),
		"Platform: " + profile.platform,
		"Language: " + profile.language,
		"Online: " + profile.online,
		"Open files: " + profile.openFiles,
		"Unsaved files: " + profile.dirtyFiles,
		"Editor panes: " + valueOrUnknown(profile.paneCount),
		"LSP providers: " +
			(profile.lspProviders.length ? profile.lspProviders.join(", ") : "none"),
		"Health: " +
			profile.health.passed +
			" passed / " +
			profile.health.failed +
			" failed",
	].join("\n");
}

export function formatVexaCapabilities(runtime = {}) {
	const capabilities = getVexaCapabilities(runtime);
	return [
		"Vexa Capabilities",
		"-----------------",
		...Object.entries(capabilities).map(
			([name, enabled]) => (enabled ? "PASS " : "---- ") + name,
		),
	].join("\n");
}

export function getVexaHealthChecks(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	return [
		{
			id: "identity",
			label: "Vexa identity lock",
			ok: getVexaIdentityStatus(runtime).failed === 0,
		},
		{
			id: "runtime",
			label: "Runtime metadata",
			ok: Boolean(
				current.buildInfo?.versionName || current.buildInfo?.versionCode,
			),
		},
		{
			id: "editor",
			label: "Editor manager",
			ok: Boolean(current.editorManager),
		},
		{
			id: "lsp",
			label: "LSP runtime registry",
			ok: true,
			detail: workspace.lspProviders.length + " providers registered",
		},
		{
			id: "clipboard",
			label: "Clipboard",
			ok: Boolean(
				current.clipboard?.writeText ||
					current.navigator?.clipboard?.writeText ||
					current.cordova?.plugins?.clipboard?.copy,
			),
		},
		{
			id: "network",
			label: "Network connectivity",
			ok: current.navigator.onLine !== false,
		},
	];
}

export function getVexaHealthScore(runtime = {}) {
	const checks = getVexaHealthChecks(runtime);
	const weights = {
		identity: 30,
		runtime: 20,
		editor: 20,
		lsp: 10,
		clipboard: 10,
		network: 10,
	};
	const totalWeight = Object.values(weights).reduce(
		(total, weight) => total + weight,
		0,
	);
	const earnedWeight = checks.reduce(
		(total, check) => total + (check.ok ? weights[check.id] || 0 : 0),
		0,
	);
	const score =
		totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
	const status =
		score >= 90 ? "HEALTHY" : score >= 70 ? "DEGRADED" : "ATTENTION";
	return Object.freeze({
		schemaVersion: 1,
		score,
		status,
		checks,
		passed: checks.filter((check) => check.ok).length,
		failed: checks.filter((check) => !check.ok).length,
	});
}

export function getVexaReadiness(runtime = {}) {
	const current = getRuntime(runtime);
	const identity = getVexaIdentityStatus(runtime);
	const health = getVexaHealthScore(runtime);
	const blockers = [];
	const signals = [];
	const recommendations = [];

	if (identity.failed > 0) {
		blockers.push("Vexa identity check failed");
		recommendations.push("Run Vexa Identity Lock and restore canonical product metadata.");
	}
	if (!current.editorManager) {
		blockers.push("Editor manager unavailable");
		recommendations.push("Restart the Vexa editor runtime before continuing.");
	}
	if (!current.buildInfo?.versionName && !current.buildInfo?.versionCode) {
		blockers.push("Runtime build metadata unavailable");
		recommendations.push("Rebuild or relaunch Vexa so runtime build metadata is available.");
	}
	if (current.navigator?.onLine === false) {
		signals.push("Network offline");
		recommendations.push("Restore network connectivity for online features.");
	}
	if (!(
		current.clipboard?.writeText ||
		current.navigator?.clipboard?.writeText ||
		current.cordova?.plugins?.clipboard?.copy
	)) {
		signals.push("Clipboard unavailable");
		recommendations.push("Enable clipboard access if diagnostics need to be copied.");
	}
	if (health.failed > 0 && blockers.length === 0) {
		signals.push(
			health.failed +
				" health check" +
				(health.failed === 1 ? "" : "s") +
				" require attention",
		);
	}

	const status = blockers.length
		? "BLOCKED"
		: signals.length
			? "DEGRADED"
			: "READY";

	return Object.freeze({
		schemaVersion: 1,
		status,
		healthScore: health.score,
		blockers,
		signals,
		recommendations: [...new Set(recommendations)],
	});
}

export function formatVexaReadiness(runtime = {}) {
	const readiness = getVexaReadiness(runtime);
	return [
		"Vexa Readiness Gate",
		"-------------------",
		"Status: " + readiness.status,
		"Health: " + readiness.healthScore + "/100",
		"Blockers: " + (readiness.blockers.length ? readiness.blockers.join("; ") : "none"),
		"Signals: " + (readiness.signals.length ? readiness.signals.join("; ") : "none"),
		"Recommendations: " +
			(readiness.recommendations.length ? readiness.recommendations.join("; ") : "none"),
	].join("\n");
}


export function getVexaDoctorReport(runtime = {}) {
	const coreBoundary = getVexaCoreBoundaryStatus();
	const identity = getVexaIdentityStatus(runtime);
	const readiness = getVexaReadiness(runtime);
	const health = getVexaHealthScore(runtime);
	const capabilities = getVexaCapabilities(runtime);
	const workspace = getVexaWorkspacePulse(runtime);
	const migration = getVexaMigrationStatus();

	const status =
		coreBoundary.status === "UNAVAILABLE" ||
		readiness.status === "BLOCKED" ||
		identity.status !== "LOCKED" ||
		health.status === "ATTENTION"
			? "BLOCKED"
: coreBoundary.status === "LEGACY_FALLBACK" ||
					readiness.status === "DEGRADED" ||
					health.status === "DEGRADED" ||
					workspace.status !== "READY"
				? "DEGRADED"
				: "READY";

	const recommendations = [
		...(coreBoundary.status === "UNAVAILABLE"
			? ["Restore the canonical Vexa runtime before continuing."]
			: coreBoundary.status === "LEGACY_FALLBACK"
				? ["Migrate the runtime to the canonical Vexa core boundary."]
				: []),
		...readiness.recommendations,
		...(health.failed
			? health.checks
					.filter((check) => !check.ok)
					.map((check) => "Resolve health check: " + check.label + ".")
			: []),
	];

	return Object.freeze({
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		app: VEXA_IDENTITY.NAME,
		status,
		coreBoundary,
		identity,
		readiness,
		health: {
			score: health.score,
			status: health.status,
			passed: health.passed,
			failed: health.failed,
		},
		capabilities,
		workspace: {
			status: workspace.status,
			openFiles: workspace.openFiles,
			dirtyFiles: workspace.dirtyFiles,
			activeFile: workspace.activeFile,
			lspProviders: workspace.lspProviders,
		},
		migration,
		recommendations: [...new Set(recommendations)],
	});
}

export function formatVexaDoctorReport(runtime = {}) {
	const doctor = getVexaDoctorReport(runtime);
	return [
		"Vexa Doctor",
		"------------",
		"Status: " + doctor.status,
		"Core boundary: " + doctor.coreBoundary.status,
		"Identity: " + doctor.identity.status,
		"Readiness: " + doctor.readiness.status,
		"Health: " + doctor.health.score + "/100 (" + doctor.health.status + ")",
		"Workspace: " + doctor.workspace.status,
		"Migration phase: " + valueOrUnknown(doctor.migration.phase),
		"Recommendations:",
		...(doctor.recommendations.length
			? doctor.recommendations.map((recommendation) => "- " + recommendation)
			: ["- none"]),
	].join("\n");
}

export function formatVexaHealthScore(runtime = {}) {
	const health = getVexaHealthScore(runtime);
	return [
		"Vexa Health Score",
		"-----------------",
		"Score: " + health.score + "/100",
		"Status: " + health.status,
		"Checks: " + health.passed + " passed / " + health.failed + " failed",
		"",
		...health.checks.map(
			(check) =>
				(check.ok ? "PASS " : "FAIL ") +
				check.label +
				(check.detail ? " (" + check.detail + ")" : ""),
		),
	].join("\n");
}

export function getVexaHealthSnapshot(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const health = getVexaHealthScore(runtime);
	const readiness = getVexaReadiness(runtime);
	const capabilities = getVexaCapabilities(runtime);

	return Object.freeze({
		schemaVersion: 1,
		generatedAt: new Date().toISOString(),
		app: VEXA_IDENTITY.NAME,
		version: valueOrUnknown(current.buildInfo.versionName),
		package: getRuntimePackageName(current.buildInfo),
		migrationPhase: VEXA_IDENTITY.MIGRATION_PHASE ?? null,
		health: {
			score: health.score,
			status: health.status,
			passed: health.passed,
			failed: health.failed,
		},
		readiness: {
			status: readiness.status,
			healthScore: readiness.healthScore,
			blockers: readiness.blockers,
			signals: readiness.signals,
		},
		workspace: {
			openFiles: workspace.openFiles,
			dirtyFiles: workspace.dirtyFiles,
			activeFile: workspace.activeFile,
			activeUri: workspace.activeUri,
			selection: workspace.selection,
			paneCount: workspace.paneCount,
			lspProviders: workspace.lspProviders,
		},
		capabilities,
	});
}

export function formatVexaHealthSnapshot(runtime = {}) {
	return [
		"Vexa Health Snapshot",
		"---------------------",
		JSON.stringify(getVexaHealthSnapshot(runtime), null, 2),
	].join("\n");
}

export function formatHealthSummary(checks) {
	const safeChecks = Array.isArray(checks) ? checks : [];
	const passed = safeChecks.filter((check) => check.ok).length;
	const failed = safeChecks.length - passed;
	return { passed, failed, ok: failed === 0 };
}

export function getVexaDiagnostics(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	return [
		"Vexa Diagnostics",
		"Diagnostics version: " + VEXA_DIAGNOSTICS_VERSION,
		"----------------",
		"App: " + VEXA_IDENTITY.NAME,
		"Version: " + valueOrUnknown(current.buildInfo.versionName),
		"Version code: " + valueOrUnknown(current.buildInfo.versionCode),
		"Package: " + getRuntimePackageName(current.buildInfo),
		"Android: " + valueOrUnknown(current.device.version),
		"Platform: " + valueOrUnknown(current.device.platform),
		"Model: " + valueOrUnknown(current.device.model),
		"Manufacturer: " + valueOrUnknown(current.device.manufacturer),
		"Language: " + valueOrUnknown(current.navigator.language),
		"Online: " + valueOrUnknown(current.navigator.onLine),
		"Migration phase: " + valueOrUnknown(VEXA_IDENTITY.MIGRATION_PHASE),
		"Open files: " + workspace.openFiles,
		"Unsaved files: " + workspace.dirtyFiles,
		"LSP providers: " +
			(workspace.lspProviders.length
				? workspace.lspProviders.join(", ")
				: "none"),
		"Product identity: Vexa",
		"Identity mode: " + VEXA_IDENTITY.IDENTITY_MODE,
		"Vexa repository: " + VEXA_IDENTITY.REPOSITORY_URL,
		"Report scope: runtime and workspace metadata only",
	].join("\n");
}

export function getVexaContextPack(runtime = {}) {
	const checks = getVexaHealthChecks(runtime);
	const summary = formatHealthSummary(checks);
	return [
		"Vexa Developer Context Pack",
		"===========================",
		getVexaWorkspaceReport(runtime),

		formatMigrationStatus(),

		formatVexaCapabilities(runtime),

		formatVexaHealthScore(runtime),

		formatVexaReadiness(runtime),

		"Vexa Health Summary",
		"-------------------",
		"Passed: " + summary.passed,
		"Failed: " + summary.failed,
		...checks.map(
			(check) =>
				(check.ok ? "PASS " : "FAIL ") +
				check.label +
				(check.detail ? " (" + check.detail + ")" : ""),
		),
	].join("\n");
}
export async function copyVexaText(text, runtime = {}) {
	const current = getRuntime(runtime);
	const value = String(text ?? "");
	if (!value) return false;
	if (current.clipboard?.writeText) {
		try {
			await current.clipboard.writeText(value);
			return true;
		} catch {
			// Fall through to the browser/Cordova clipboard.
		}
	}
	if (current.navigator?.clipboard?.writeText) {
		try {
			await current.navigator.clipboard.writeText(value);
			return true;
		} catch {
			// Fall through to Cordova.
		}
	}
	if (current.cordova?.plugins?.clipboard?.copy) {
		current.cordova.plugins.clipboard.copy(value);
		return true;
	}
	return false;
}

export async function copyVexaReadiness(runtime = {}) {
	return copyVexaText(formatVexaReadiness(runtime), runtime);
}

export async function copyVexaDoctorReport(runtime = {}) {
	return copyVexaText(formatVexaDoctorReport(runtime), runtime);
}

export async function copyVexaRuntimeProfile(runtime = {}) {
	return copyVexaText(formatVexaRuntimeProfile(runtime), runtime);
}

export async function copyVexaHealthSnapshot(runtime = {}) {
	return copyVexaText(formatVexaHealthSnapshot(runtime), runtime);
}

export async function copyVexaDiagnostics(runtime = {}) {
	return copyVexaText(
		getVexaWorkspaceReport(runtime) + "\n\n" + getVexaDiagnostics(runtime),
		runtime,
	);
}

export async function copyVexaWorkspaceSnapshot(runtime = {}) {
	return copyVexaText(formatVexaWorkspaceSnapshot(runtime), runtime);
}
export async function copyVexaContextPack(runtime = {}) {
	return copyVexaText(getVexaContextPack(runtime), runtime);
}

export const VEXA_DIAGNOSTICS_VERSION = 7;
