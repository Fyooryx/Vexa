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
