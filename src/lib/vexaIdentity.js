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
	RELEASES_API_URL:
		"https://api.github.com/repos/Fyooryx/Vexa/releases",
	CHANGELOG_URL:
		"https://raw.githubusercontent.com/Fyooryx/Vexa/main/CHANGELOG.md",
	UPSTREAM_RELEASES_API_URL:
		"https://api.github.com/repos/Acode-Foundation/Acode/releases",
	UPSTREAM_CHANGELOG_URL:
		"https://raw.githubusercontent.com/Acode-Foundation/Acode/main/CHANGELOG.md",
	UPSTREAM_RELEASE_API_URL:
		"https://api.github.com/repos/Acode-Foundation/Acode/releases/latest",
});

export function getRuntimePackageName(buildInfo = globalThis.BuildInfo) {
	return buildInfo?.packageName || VEXA_IDENTITY.PACKAGE_NAME;
}
