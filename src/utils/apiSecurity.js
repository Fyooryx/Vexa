/**
 * Return true only for requests whose origin and path are inside the trusted API base.
 *
 * @param {string} requestUrl
 * @param {string} apiBaseUrl
 * @param {string} [documentUrl="https://vexa.invalid/"]
 * @returns {boolean}
 */
export function isTrustedApiRequest(
  requestUrl,
  apiBaseUrl,
  documentUrl = "https://vexa.invalid/",
) {
  try {
    const request = new URL(requestUrl, documentUrl);
    const base = new URL(apiBaseUrl, documentUrl);
    const basePath = base.pathname.endsWith("/")
      ? base.pathname.slice(0, -1)
      : base.pathname;

    return (
      request.origin === base.origin &&
      (request.pathname === basePath ||
        request.pathname.startsWith(basePath + "/"))
    );
  } catch {
    return false;
  }
}
