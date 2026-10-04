import { VEXA_IDENTITY } from "lib/vexaIdentity";

const SUPPORTED_SCHEMES = new Set([
	VEXA_IDENTITY.URL_SCHEME,
	VEXA_IDENTITY.LEGACY_URL_SCHEME,
]);

/**
 * Parse Vexa application deep links.
 *
 * Both the current Vexa scheme and the legacy Acode scheme are accepted so
 * existing integrations keep working after the package rebrand.
 *
 * @param {unknown} value
 * @returns {{scheme: string, module: string, action: string, value?: string} | null}
 */
export function parseAppIntentUrl(value) {
	if (typeof value !== "string") return null;

	const separatorIndex = value.indexOf("://");
	if (separatorIndex <= 0) return null;

	const scheme = value.slice(0, separatorIndex).toLowerCase();
	if (!SUPPORTED_SCHEMES.has(scheme)) return null;

	const path = value.slice(separatorIndex + 3).replace(/^\/+/, "");
	const [module, action, ...valueParts] = path.split("/");
	if (!module || !action) return null;

	return {
		scheme,
		module,
		action,
		value: valueParts.length ? valueParts.join("/") : undefined,
	};
}
