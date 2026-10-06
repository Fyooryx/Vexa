# Vexa Branch Consolidation Record

**Authoritative line:** `main`

**Audit date:** 2026-10-06

## Result

All 22 non-main branch refs were rechecked against `main`. Every audited branch reports `ahead_by=0`, so no branch currently contains commits that are ahead of the authoritative mainline.

This means the branch work is already represented in main history. Branch refs are therefore historical pointers, not unintegrated worktrees.

## Branches

| Branch | State vs main | Action |
| --- | --- | --- |
| legacy-main-2026-10-04 | behind | superseded |
| main-legacy-2026-10-04 | behind | superseded |
| main-vexa | behind | superseded |
| vexa/next-hardening-2026-10-04 | behind | consolidated |
| vexa/nightfall-1.14.4-hardening-2026-10-04 | behind | consolidated |
| vexa/nightfall-hardening-2026-10-04 | behind | consolidated |
| vexa/nightfall-wave-2026-10-04 | behind | consolidated |
| vexa/owner-contact-polish | behind | consolidated / stale metadata excluded |
| vexa/post-migration-hardening | behind | consolidated |
| vexa/rebrand-logo-package-upgrade | behind | superseded |
| vexa/runtime-hardening-2026-10-04 | behind | consolidated |
| vexa/security-auth-hardening-2026-10-04 | behind | consolidated |
| vexa/termux-native-terminal | behind | consolidated |
| vexa/upgrade-wave-2026-10-04 | behind | consolidated |
| vexa/1.14.2-auth-admob-hardening | behind | consolidated |
| vexa/1.14.3-nightfall-hardening | behind | consolidated |
| vexa/1.14.4-hardening | behind | consolidated |
| vexa-1.14.6-branding-refresh | behind | superseded |
| vexa-advanced-phase-2 | behind | superseded |
| vexa-branding | behind | superseded |
| vexa-complete-identity-migration | behind | consolidated |
| vexa-gradual-branding-phase-1 | behind | superseded |

## Consolidation policy

Older release metadata was not replayed over the current 1.15.0 baseline. Legacy technical identifiers were preserved only where compatibility evidence requires them. Useful hardening was integrated through current mainline equivalents rather than replacing the main tree with stale branch snapshots.

## Deletion status

The current GitHub connector exposes branch/ref update operations but no branch/ref delete operation. No fake deletion or force-reset is used as a substitute. The branch refs can be removed only when a real delete-ref capability is available.
