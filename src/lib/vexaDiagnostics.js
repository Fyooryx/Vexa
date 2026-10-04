import config from "./config";
import { getRuntimePackageName, VEXA_IDENTITY } from "./vexaIdentity";

export const VEXA_DIAGNOSTICS_VERSION = 4;

function valueOrUnknown(value) {
	return value === undefined || value === null || value === ""
		? "unknown"
		: String(value);
}

/**
 * Return structured, non-secret runtime metadata for support tooling.
 * This intentionally excludes tokens, file contents, credentials, and paths.
 */
export function getVexaDiagnosticData(runtime = {}) {
	const buildInfo = runtime.buildInfo ?? globalThis.BuildInfo ?? {};
	const deviceInfo = runtime.device ?? globalThis.device ?? {};
	const navigatorInfo = runtime.navigator ?? globalThis.navigator ?? {};

	return Object.freeze({
		diagnosticsVersion: VEXA_DIAGNOSTICS_VERSION,
		app: VEXA_IDENTITY.NAME,
		version: valueOrUnknown(buildInfo.versionName),
		versionCode: valueOrUnknown(buildInfo.versionCode),
		packageName: getRuntimePackageName(buildInfo),
		android: valueOrUnknown(deviceInfo.version),
		platform: valueOrUnknown(deviceInfo.platform),
		model: valueOrUnknown(deviceInfo.model),
		manufacturer: valueOrUnknown(deviceInfo.manufacturer),
		language: valueOrUnknown(navigatorInfo.language),
		online: valueOrUnknown(navigatorInfo.onLine),
		editor: valueOrUnknown(config.SUPPORTED_EDITOR),
		urlScheme: VEXA_IDENTITY.URL_SCHEME,
		legacyUrlScheme: VEXA_IDENTITY.LEGACY_URL_SCHEME,
		productBoundary: "Vexa application",
		serviceBoundary: "upstream service",
		repositoryUrl: VEXA_IDENTITY.REPOSITORY_URL,
		serviceUrl: config.BASE_URL,
		reportScope: "runtime metadata only",
	});
}

export function getVexaDiagnostics(runtime = {}) {
	const data = getVexaDiagnosticData(runtime);

	return [
		"Vexa Diagnostics",
		"Diagnostics version: " + data.diagnosticsVersion,
		"----------------",
		"App: " + data.app,
		"Version: " + data.version,
		"Version code: " + data.versionCode,
		"Package: " + data.packageName,
		"Android: " + data.android,
		"Platform: " + data.platform,
		"Model: " + data.model,
		"Manufacturer: " + data.manufacturer,
		"Language: " + data.language,
		"Online: " + data.online,
		"Editor: " + data.editor,
		"URL scheme: " +
			data.urlScheme +
			" (legacy: " +
			data.legacyUrlScheme +
			")",
		"Product boundary: " + data.productBoundary,
		"Service boundary: " + data.serviceBoundary,
		"Vexa repository: " + data.repositoryUrl,
		"Upstream service: " + data.serviceUrl,
		"Report scope: " + data.reportScope,
	].join("\n");
}

export async function copyVexaDiagnostics(runtime = {}) {
	const report = getVexaDiagnostics(runtime);
	const navigatorInfo = runtime.navigator ?? globalThis.navigator ?? {};
	const cordova = runtime.cordova ?? globalThis.cordova;

	if (navigatorInfo.clipboard?.writeText) {
		try {
			await navigatorInfo.clipboard.writeText(report);
			return true;
		} catch {
			// Fall back to the Cordova clipboard below.
		}
	}

	if (cordova?.plugins?.clipboard?.copy) {
		cordova.plugins.clipboard.copy(report);
		return true;
	}

	// Intentionally keep diagnostics side-effect free until copy is requested.
	return false;
}
