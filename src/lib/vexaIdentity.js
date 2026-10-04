/**
 * Canonical Vexa application identity.
 *
 * Keep product identity separate from upstream service/repository endpoints so
 * rebranding does not accidentally break services that are still hosted upstream.
 */
export const VEXA_IDENTITY = Object.freeze({
	NAME: "Vexa",
	PACKAGE_NAME: "com.vexa.app",
	FREE_PACKAGE_NAME: "com.vexa.appfree",
	URL_SCHEME: "vexa",
	LEGACY_URL_SCHEME: "acode",
	REPOSITORY_URL: "https://github.com/Fyooryx/Vexa",
	UPSTREAM_REPOSITORY_URL: "https://github.com/Acode-Foundation/Acode",
	UPSTREAM_SERVICE_URL: "https://acode.app",
	VEXA_RELEASE_API_URL:
		"https://api.github.com/repos/Fyooryx/Vexa/releases/latest",
	UPSTREAM_RELEASE_API_URL:
		"https://api.github.com/repos/Acode-Foundation/Acode/releases/latest",
});

export function getRuntimePackageName(buildInfo = globalThis.BuildInfo) {
	return buildInfo?.packageName || VEXA_IDENTITY.PACKAGE_NAME;
}


export function isVexaDeepLink(value) {
	if (typeof value !== "string" || !value.trim()) return false;
	try {
		const { protocol } = new URL(value);
		return (
			protocol === `${VEXA_IDENTITY.URL_SCHEME}:` ||
			protocol === `${VEXA_IDENTITY.LEGACY_URL_SCHEME}:`
		);
	} catch {
		return false;
	}
}

export function isUpstreamApiUrl(value) {
	if (typeof value !== "string" || !value.trim()) return false;
	try {
		const target = new URL(value);
		const upstream = new URL(VEXA_IDENTITY.UPSTREAM_SERVICE_URL);
		return (
			target.origin === upstream.origin &&
			(target.pathname === "/api" || target.pathname.startsWith("/api/"))
		);
	} catch {
		return false;
	}
}
