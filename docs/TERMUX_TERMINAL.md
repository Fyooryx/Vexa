# Vexa Termux Terminal

Vexa's user-facing terminal is delegated to the official Termux application instead of installing an embedded Alpine/AXS runtime.

## Setup

1. Install Termux.
2. In Android Settings, grant Vexa the additional permission to run commands in the Termux environment.
3. In Termux, enable the `allow-external-apps` property.
4. Restart Vexa and open **Terminal**.

The Vexa terminal tab launches a real interactive Termux shell. Vexa does not attempt to embed Termux's activity inside the editor.

## Architecture

The Cordova terminal plugin exposes a small `TermuxBridge` native layer. Vexa can launch a Termux shell and dispatch shell commands through the documented `RUN_COMMAND` interface.

Interactive shell UI remains owned by Termux. This avoids maintaining a second shell runtime inside Vexa and keeps the terminal environment, packages, permissions, and updates under Termux's control.

## Compatibility

Legacy Acode URL schemes and SAF paths may still be recognized where required for existing projects. The old embedded Alpine/AXS terminal service is no longer packaged by the user-facing terminal plugin.

The built-in Alpine-based LSP runtime is a separate execution path and is intentionally not claimed as migrated until it has an equivalent persistent stdio transport through Termux.
