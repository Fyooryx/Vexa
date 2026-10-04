const VEXA_PRO_CACHE_KEY = "vexa_pro";
const LEGACY_PRO_CACHE_KEY = "acode_pro";

/**
 * Return the locally cached Pro state.
 *
 * The legacy cache key is still read during migration so existing installs
 * do not lose their locally cached entitlement after the rebrand.
 *
 * @returns {boolean}
 */
export function getCachedPro() {
	try {
		if (localStorage.getItem(VEXA_PRO_CACHE_KEY) === "true") return true;

		if (localStorage.getItem(LEGACY_PRO_CACHE_KEY) === "true") {
			localStorage.setItem(VEXA_PRO_CACHE_KEY, "true");
			return true;
		}
	} catch (error) {
		console.warn("Unable to read cached Pro state", error);
	}

	return false;
}

/** Persist local Pro entitlement under the Vexa namespace. */
export function setCachedPro() {
	try {
		localStorage.setItem(VEXA_PRO_CACHE_KEY, "true");
	} catch (error) {
		console.warn("Unable to cache Vexa Pro state", error);
	}
}
