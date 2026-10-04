import { VEXA_IDENTITY } from "lib/vexaIdentity";

const SCHEME_PATTERN = new RegExp(
	"^(?:" +
		VEXA_IDENTITY.URL_SCHEME +
		"|" +
		VEXA_IDENTITY.LEGACY_URL_SCHEME +
		"):\\/\\/",
	"i",
);

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

	const match = value.match(SCHEME_PATTERN);
	if (!match) return null;

	const path = value.slice(match[0].length).replace(/^\\/+/, "");
	const [module, action, ...valueParts] = path.split("/");
	if (!module || !action) return null;

	return {
		scheme: match[0].slice(0, -3).toLowerCase(),
		module,
		action,
		value: valueParts.length ? valueParts.join("/") : undefined,
	};
}
