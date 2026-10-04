/**
 * Return true only for requests whose origin and path are inside the trusted API base.
 *
 * @param {string} requestUrl
 * @param {string} apiBaseUrl
 * @param {string} [documentUrl="https://vexa.invalid/"]
 * @returns {boolean}
 */
export function isTrustedApiRequest(
\trequestUrl,
\tapiBaseUrl,
\tdocumentUrl = "https://vexa.invalid/",
) {
\ttry {
\t\tconst request = new URL(requestUrl, documentUrl);
\t\tconst base = new URL(apiBaseUrl, documentUrl);
\t\tconst basePath = base.pathname.replace(/\/$/, "");

\t\treturn (
\t\t\trequest.origin === base.origin &&
\t\t\t(request.pathname === basePath || request.pathname.startsWith(`${basePath}/`))
\t\t);
\t} catch {
\t\treturn false;
\t}
}
