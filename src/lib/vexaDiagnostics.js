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
		lspProviders: providers.map((provider) => provider?.id).filter(Boolean),
	};
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
		healthCheck: true,
		migrationStatus: true,
		clipboard: Boolean(
			current.clipboard?.writeText ||
				current.navigator?.clipboard?.writeText ||
				current.cordova?.plugins?.clipboard?.copy,
		),
	};
	return Object.freeze(capabilities);
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

export async function copyVexaDiagnostics(runtime = {}) {
	const report =
		getVexaWorkspaceReport(runtime) + "\n\n" + getVexaDiagnostics(runtime);
	return copyVexaText(report, runtime);
}

export const VEXA_DIAGNOSTICS_VERSION = 4;
