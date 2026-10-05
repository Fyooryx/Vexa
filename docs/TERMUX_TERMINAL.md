# Vexa Termux Bridge

Vexa includes an optional native bridge to the official Termux application.

## What it adds

- `Terminal.isTermuxInstalled()`
- `Terminal.openTermux()`
- `Terminal.openTermuxSession(workdir)`
- `Terminal.runTermuxCommand(command, { workdir, background })`

The existing Vexa/Alpine terminal runtime remains available. The Termux bridge is additive and does not replace the built-in runtime.

## Setup

Install the official Termux application, grant Vexa the `com.termux.permission.RUN_COMMAND` permission in Android Settings, and enable `allow-external-apps=true` in Termux. Vexa also declares package visibility for `com.termux` for modern Android targets.

## Security boundary

Commands are delegated only through the dedicated `TermuxBridge` Cordova feature and Termux `RunCommandService`. Treat the RUN_COMMAND capability as privileged because it allows a third-party app to execute commands in the Termux context.

Vexa's bridge does not grant itself direct access to Termux private application storage.

## Compatibility

Legacy Vexa/Acode URL and storage identifiers remain handled separately from the Termux bridge. Native namespace migration is controlled independently so compatibility can be retired only after verification.
