import { VEXA_IDENTITY } from "lib/vexaIdentity";

const SUPPORTED_SCHEMES = new Set([
	VEXA_IDENTITY.URL_SCHEME,
	VEXA_IDENTITY.LEGACY_URL_SCHEME,
]);

/**
 * Parse a Vexa application deep link while preserving the legacy Acode scheme.
 *
 * @param {unknown} url
 * @returns {{scheme: string, module: string, action: string, value?: string} | null}
 */
export function parseAppDeepLink(url) {
	if (typeof url !== "string") return null;

	const match = /^([a-z][a-z0-9+.-]*):\\/\\/(.*)$/i.exec(url);
	if (!match) return null;

	const scheme = match[1].toLowerCase();
	if (!SUPPORTED_SCHEMES.has(scheme)) return null;

	const segments = match[2].split("/");
	const module = segments.shift() || "";
	const action = segments.shift() || "";
	if (!module || !action) return null;

	const value = segments.join("/") || undefined;
	return { scheme, module, action, value };
}
