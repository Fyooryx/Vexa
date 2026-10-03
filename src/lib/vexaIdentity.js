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
});

export function getRuntimePackageName(buildInfo = globalThis.BuildInfo) {
	return buildInfo?.packageName || VEXA_IDENTITY.PACKAGE_NAME;
}
