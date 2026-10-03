# Vexa Repository Migration

## Current state

The repository default branch is **main** and is the authoritative Vexa branch.

The previous pre-rebrand `main` snapshot is preserved at:

`legacy-main-2026-10-04`

Snapshot commit:

`640a472682398f25eac3a259b1784c7a16bd2a90`

## Vexa identity

- Application name: `Vexa`
- Android application package: `com.vexa.app`
- Free-build package: `com.vexa.appfree`
- Primary deep-link scheme: `vexa://`
- Legacy deep-link scheme: `acode://`
- Repository: `https://github.com/Fyooryx/Vexa`

## Migration policy

The current `main` branch contains the complete repository tree from the previous main history plus the Vexa migration and subsequent hardening changes. No second branch named `main` is needed or possible while `main` already exists; Git references are unique by name.

The legacy snapshot is intentionally retained as a reversible recovery point until the Vexa migration is considered stable.

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
