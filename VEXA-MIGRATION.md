# Vexa Identity and Development Policy

## Current state

The repository default branch is **main** and is the authoritative Vexa integration line.

The active release baseline is **Vexa 1.15.0** with Android versionCode **1020**.

## Canonical identity

- Application name: `Vexa`
- Android application package: `com.vexa.app`
- Free-build package: `com.vexa.appfree`
- Primary deep-link scheme: `vexa://`
- Repository: `https://github.com/Fyooryx/Vexa`

Product-facing surfaces must use Vexa naming, Vexa artwork, Vexa commands, Vexa diagnostics, and Vexa documentation.

## Identity rule

Vexa is the single product identity.

Technical compatibility may exist below the product boundary while it is being retired, but it must not create a second product identity, appear in user-facing copy, or be introduced into new Vexa-native code.

New code follows these rules:

1. Import and call Vexa-named modules and APIs.
2. Use `com.vexa.app` for the application identity.
3. Use `vexa://` as the canonical application deep link.
4. Use the supplied Vexa artwork as the canonical visual source.
5. Do not introduce new compatibility aliases or new alternate product branding.
6. Prefer root-cause fixes and bounded migrations over broad unverified rewrites.
7. Route new runtime access through `src/lib/vexaApi.js`; do not address the legacy `acode` global directly outside compatibility-boundary code.
2. Use `com.vexa.app` for the application identity.
3. Use `vexa://` as the canonical application deep link.
4. Use the supplied Vexa artwork as the canonical visual source.
5. Do not introduce new compatibility aliases or new alternate product branding.
6. Prefer root-cause fixes and bounded migrations over broad unverified rewrites.

## Advanced developer layer

The Vexa developer layer now provides:

- Workspace Report
- Workspace Snapshot
- Workspace Checkpoints
- Workspace Pulse
- Runtime Profile
- Health Check
- Health Score
- Health Snapshot
- Capability Matrix
- Identity Lock
- Developer Context Pack
- Vexa Doctor diagnostics and copy support
- Vexa Core Boundary API with explicit canonical/fallback state reporting
- Active Code Location
- Copy actions for diagnostics and safe metadata-only reports

All exported workspace reports remain metadata-only and must not include file contents or secrets.

## Validation gates

Run:

```bash
npm ci
npm run check:vexa
```

For an Android build:

```bash
npm run build paid dev apk
```

A source-level branding or type check is not proof of a successful APK build. The Android build itself must complete successfully.

## Branch policy

`main` is the single integration target for this evolution track.

Do not create replacement PRs for incremental Vexa development unless a future change genuinely requires isolated review. Direct main integration is used only when the change has been verified against the repository gates and the current task explicitly authorizes it.

## Completion criteria

A Vexa change is complete only when:

- the requested behavior exists on `main`;
- product identity remains Vexa-only at the user-facing boundary;
- static validation passes;
- unit/type validation passes where applicable;
- branding and asset checks pass;
- residual technical compatibility is documented rather than presented as product identity;
- remaining uncertainty is reported explicitly.
