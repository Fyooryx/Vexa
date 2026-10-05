import config from "./config";
import { getRuntimePackageName, VEXA_IDENTITY } from "./vexaIdentity";

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
		legacyNamespace: VEXA_IDENTITY.LEGACY_NATIVE_NAMESPACE,
		vexaNamespace: VEXA_IDENTITY.VEXA_NATIVE_NAMESPACE,
		nativeMigrationEnabled:
			VEXA_IDENTITY.LEGACY_PLUGIN_NAMESPACE_MIGRATION_ENABLED === true,
		legacyDeepLink: VEXA_IDENTITY.LEGACY_URL_SCHEME + "://",
		primaryDeepLink: VEXA_IDENTITY.URL_SCHEME + "://",
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
		"Vexa namespace: " + status.vexaNamespace,
		"Legacy namespace: " + status.legacyNamespace,
		"Native migration enabled: " + status.nativeMigrationEnabled,
		"Primary deep link: " + status.primaryDeepLink,
		"Legacy deep link: " + status.legacyDeepLink,
	].join("\n");
}

export function getVexaCapabilities(runtime = {}) {
	const current = getRuntime(runtime);
	const workspace = getWorkspaceSnapshot(runtime);
	const capabilities = {
		codemirror: Boolean(current.editorManager?.editor?.state),
		lsp: workspace.lspProviders.length > 0,
		multiPane: Number(workspace.paneCount || 0) > 1,
		terminal: Boolean(
			globalThis.vexa?.require?.("terminal") ||
				globalThis.acode?.require?.("terminal"),
		),
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
			label: "Vexa identity",
			ok:
				VEXA_IDENTITY.NAME === "Vexa" &&
				VEXA_IDENTITY.PACKAGE_NAME === "com.vexa.app",
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
	return JSON.stringify(getVexaHealthSnapshot(runtime), null, 2);
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
		"Product boundary: Vexa application",
		"Service boundary: upstream service",
		"Vexa repository: " + VEXA_IDENTITY.REPOSITORY_URL,
		"Upstream service: " + VEXA_IDENTITY.UPSTREAM_SERVICE_URL,
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

export const VEXA_DIAGNOSTICS_VERSION = 4;
