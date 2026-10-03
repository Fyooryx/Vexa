/**
 * Canonical Vexa application identity.
 *
 * Keep this separate from upstream service endpoints so a rebrand does not
 * accidentally break services that are still hosted by the upstream project.
 */
export const VEXA_IDENTITY = Object.freeze({
	NAME: "Vexa",
	PACKAGE_NAME: "com.vexa.app",
	FREE_PACKAGE_NAME: "com.vexa.appfree",
	URL_SCHEME: "vexa",
	LEGACY_URL_SCHEME: "acode",
	REPOSITORY_URL: "https://github.com/Fyooryx/Vexa",
	UPSTREAM_SERVICE_URL: "https://acode.app",
});

export function getRuntimePackageName() {
	return globalThis.BuildInfo?.packageName || VEXA_IDENTITY.PACKAGE_NAME;
}