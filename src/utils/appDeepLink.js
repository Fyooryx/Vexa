import { parseAppIntentUrl } from "./appIntent";

/**
 * Compatibility alias for the historic deep-link helper.
 *
 * New code should import `parseAppIntentUrl`; existing call sites keep the
 * old helper name without maintaining a second parser implementation.
 */
export function parseAppDeepLink(url) {
	return parseAppIntentUrl(url);
}
