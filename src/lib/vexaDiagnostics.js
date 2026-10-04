import config from "./config";
import { getRuntimePackageName, VEXA_IDENTITY } from "./vexaIdentity";

function valueOrUnknown(value) {
	return value === undefined || value === null || value === ""
		? "unknown"
		: String(value);
}

export function getVexaDiagnostics(runtime = {}) {
	const buildInfo = runtime.buildInfo ?? globalThis.BuildInfo ?? {};
	const deviceInfo = runtime.device ?? globalThis.device ?? {};
	const navigatorInfo = runtime.navigator ?? globalThis.navigator ?? {};

	return [
		"Vexa Diagnostics",
		"Diagnostics version: " + VEXA_DIAGNOSTICS_VERSION,
		"----------------",
		"App: " + VEXA_IDENTITY.NAME,
		"Version: " + valueOrUnknown(buildInfo.versionName),
		"Version code: " + valueOrUnknown(buildInfo.versionCode),
		"Package: " + getRuntimePackageName(buildInfo),
		"Android: " + valueOrUnknown(deviceInfo.version),
		"Platform: " + valueOrUnknown(deviceInfo.platform),
		"Model: " + valueOrUnknown(deviceInfo.model),
		"Manufacturer: " + valueOrUnknown(deviceInfo.manufacturer),
		"Language: " + valueOrUnknown(navigatorInfo.language),
		"Online: " + valueOrUnknown(navigatorInfo.onLine),
		"Product boundary: Vexa application",
		"Service boundary: upstream service",
		"Vexa repository: " + VEXA_IDENTITY.REPOSITORY_URL,
		"Upstream service: " + config.BASE_URL,
		"Report scope: runtime metadata only",
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
export const VEXA_DIAGNOSTICS_VERSION = 3;
