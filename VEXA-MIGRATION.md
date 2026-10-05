# Vexa Repository Migration

## Current state

The repository default branch is **main** and remains the authoritative Vexa branch.

The previous pre-rebrand `main` snapshot is preserved at:

`legacy-main-2026-10-04`

Snapshot commit:

`640a472682398f25eac3a259b1784c7a16bd2a90`

The active Vexa development line uses the 1.14.6 branding baseline and keeps legacy technical identifiers where removing them immediately would break compatibility.

## Vexa identity

- Application name: `Vexa`
- Android application package: `com.vexa.app`
- Free-build package: `com.vexa.appfree`
- Primary deep-link scheme: `vexa://`
- Legacy deep-link scheme: `acode://`
- Repository: `https://github.com/Fyooryx/Vexa`
- Upstream repository: `https://github.com/Acode-Foundation/Acode`
- Upstream service endpoint: `https://acode.app`

## Migration principle

Vexa is migrated **progressively**, not by a blind global search-and-replace.

The rule is:

> Change product identity first, preserve technical compatibility second, migrate technical internals only when a replacement path has been verified.

A legacy identifier may remain when it is an external contract, persisted data key, deep-link scheme, SAF authority, Play Billing SKU, upstream endpoint, plugin API surface, or other compatibility boundary.

A legacy identifier must not remain merely because it is convenient when it is user-visible product branding.

## Migration phases

### Phase 1 — Product branding convergence

Target:

- Visible product name becomes **Vexa**.
- User-facing settings, startup screens, diagnostics, labels, documentation and icon previews use Vexa branding.
- Canonical Vexa logo assets are centralized and verified.
- Application package remains `com.vexa.app`.
- Legacy technical namespaces and compatibility identifiers are intentionally retained.
- Upstream URLs remain upstream until Vexa-owned infrastructure exists.

Gate:

`npm run verify:branding`

### Phase 2 — Internal API convergence

Incremental feature additions in this phase may introduce Vexa-native modules that sit above existing runtime contracts. The Workspace Checkpoint feature is one such bounded layer: it stores only file metadata and cursor location in a Vexa-namespaced local key, with a small fixed history and the existing `openFile` path used for restore.

Target:

- New application code imports and calls Vexa-named modules/APIs.
- Compatibility aliases remain available for existing plugins and old integrations.
- New code must not introduce fresh user-visible Acode branding.
- Deprecated aliases receive explicit migration comments/tests.

Gate:

`npm run check:vexa`

### Phase 3 — Native/package migration

Target:

- Migrate native plugin namespaces one plugin at a time.
- Introduce compatibility bridges where package/class/resource references cross the migration boundary.
- Update generated Android references only after each plugin builds and its tests pass.
- Never replace all `com.foxdebug.*` namespaces in one unverified operation.

Gate:

Android build + plugin-specific verification.

### Phase 4 — Legacy retirement

Target:

- Remove legacy identifiers only after compatibility usage reaches zero or an explicit breaking-change policy permits removal.
- Remove temporary aliases, migration code and legacy test fixtures.
- Remove obsolete technical namespaces and resource names.

Gate:

Full regression suite + release candidate verification.

## Compatibility rules

The following are compatibility identifiers unless explicitly migrated with a replacement:

- `acode://`
- legacy SAF authorities
- legacy persisted storage keys
- Google Play Billing product IDs
- Acode plugin API aliases
- upstream Acode repository/service URLs
- native plugin namespaces that have not yet completed a controlled migration

Do not treat the presence of these identifiers alone as evidence of failed branding.

## Verification

Run:

```bash
npm ci
npm run check:vexa
```

For an Android build:

```bash
npm run build paid dev apk
```

Do not treat a source-level verification pass as proof that a release APK was successfully built; the Android build itself must complete successfully.