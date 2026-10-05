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
	PRO_STORAGE_KEY: "vexa_pro",
	LEGACY_PRO_STORAGE_KEYS: Object.freeze(["acode_pro"]),
	// Google Play product IDs are external billing identifiers; keep the legacy
	// SKU stable so existing purchases remain recoverable after rebranding.
	PRO_PRODUCT_IDS: Object.freeze(["acode_pro_new"]),
	REPOSITORY_URL: "https://github.com/Fyooryx/Vexa",
	UPSTREAM_REPOSITORY_URL: "https://github.com/Acode-Foundation/Acode",
	UPSTREAM_SERVICE_URL: "https://acode.app",
	VEXA_RELEASE_API_URL:
		"https://api.github.com/repos/Fyooryx/Vexa/releases/latest",
	UPSTREAM_RELEASE_API_URL:
		"https://api.github.com/repos/Acode-Foundation/Acode/releases/latest",
	// Technical identifiers are migrated only after a compatibility bridge is verified.
	MIGRATION_PHASE: 1,
	LEGACY_NATIVE_NAMESPACE: "com.foxdebug",
	VEXA_NATIVE_NAMESPACE: "com.vexa.app",
	LEGACY_PLUGIN_NAMESPACE_MIGRATION_ENABLED: false,
});

export function getRuntimePackageName(buildInfo = globalThis.BuildInfo) {
	return buildInfo?.packageName || VEXA_IDENTITY.PACKAGE_NAME;
}
