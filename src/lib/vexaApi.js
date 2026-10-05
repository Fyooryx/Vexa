/**
 * Canonical runtime boundary for Vexa core access.
 *
 * New internal code should use this module instead of addressing the legacy
 * `acode` global directly. The fallback remains intentionally narrow so old
 * plugins can continue to work while the native/API migration is verified.
 */

function resolveCore() {
  return globalThis.vexa ?? globalThis.acode ?? null;
}

export function getVexaCore() {
  return resolveCore();
}

export function requireVexaCore() {
  const core = resolveCore();
  if (!core) throw new Error("[Vexa] core runtime unavailable");
  return core;
}

export function getVexaCoreBoundaryStatus() {
  const canonical = globalThis.vexa != null;
  const legacyFallback = !canonical && globalThis.acode != null;
  return Object.freeze({
    schemaVersion: 1,
    status: canonical
      ? "CANONICAL"
      : legacyFallback
        ? "LEGACY_FALLBACK"
        : "UNAVAILABLE",
    canonical,
    legacyFallback,
  });
}

export function vexaExec(...args) {
  return resolveCore()?.exec?.(...args);
}

export function vexaAddIcon(...args) {
  return resolveCore()?.addIcon?.(...args);
}

export function getVexaFormatters() {
  const formatters = resolveCore()?.formatters;
  return Array.isArray(formatters) ? formatters : [];
}

export function vexaGetFormatterFor(extensions) {
  return resolveCore()?.getFormatterFor?.(extensions) ?? [];
}

export default Object.freeze({
  getCore: getVexaCore,
  requireCore: requireVexaCore,
  exec: vexaExec,
  addIcon: vexaAddIcon,
  getFormatters: getVexaFormatters,
  getFormatterFor: vexaGetFormatterFor,
});
