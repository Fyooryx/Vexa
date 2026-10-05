package com.vexa.app.rk.exec.terminal;

import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;

import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;

/**
 * Optional native bridge from Vexa to the official Termux app.
 *
 * Vexa keeps its built-in terminal runtime for local compatibility, while
 * this bridge allows advanced users to delegate interactive shells/commands
 * to an installed Termux environment.
 */
public class TermuxBridge extends CordovaPlugin {
    private static final String TERMUX_PACKAGE = "com.termux";
    private static final String RUN_COMMAND_SERVICE = "com.termux.app.RunCommandService";
    private static final String ACTION_RUN_COMMAND = "com.termux.RUN_COMMAND";
    private static final String EXTRA_COMMAND_PATH = "com.termux.RUN_COMMAND_PATH";
    private static final String EXTRA_ARGUMENTS = "com.termux.RUN_COMMAND_ARGUMENTS";
    private static final String EXTRA_WORKDIR = "com.termux.RUN_COMMAND_WORKDIR";
    private static final String EXTRA_BACKGROUND = "com.termux.RUN_COMMAND_BACKGROUND";
    private static final String EXTRA_SESSION_ACTION = "com.termux.RUN_COMMAND_SESSION_ACTION";
    private static final String EXTRA_COMMAND_LABEL = "com.termux.RUN_COMMAND_LABEL";
    private static final String EXTRA_COMMAND_DESCRIPTION = "com.termux.RUN_COMMAND_DESCRIPTION";
    private static final String EXTRA_COMMAND_HELP = "com.termux.RUN_COMMAND_HELP";
    private static final String TERMUX_BASH = "/data/data/com.termux/files/usr/bin/bash";

    private boolean isTermuxInstalled() {
        Context context = cordova.getContext();
        try {
            context.getPackageManager().getPackageInfo(TERMUX_PACKAGE, 0);
            return true;
        } catch (PackageManager.NameNotFoundException ignored) {
            return false;
        }
    }

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        switch (action) {
            case "isInstalled":
                callbackContext.success(isTermuxInstalled() ? 1 : 0);
                return true;

            case "open":
                openTermux(callbackContext);
                return true;

            case "openSession":
                if (!requireTermux(callbackContext)) return true;
                dispatchShell(
                    callbackContext,
                    args.optString(0, "~"),
                    false,
                    null,
                    "Vexa → Termux",
                    "Open an interactive Termux shell for Vexa.",
                    "The interactive terminal is hosted by Termux."
                );
                return true;

            case "runShell":
                if (!requireTermux(callbackContext)) return true;
                String command = args.optString(0, "");
                String workdir = args.optString(1, "~");
                boolean background = args.optBoolean(2, true);
                if (command.trim().isEmpty()) {
                    callbackContext.error("Termux command cannot be empty.");
                    return true;
                }
                dispatchShell(
                    callbackContext,
                    workdir,
                    background,
                    command,
                    "Vexa → Termux command",
                    "Run a shell command in the Termux environment.",
                    "Vexa delegates command execution to Termux."
                );
                return true;

            default:
                callbackContext.error("Unknown TermuxBridge action: " + action);
                return false;
        }
    }

    private boolean requireTermux(CallbackContext callbackContext) {
        if (isTermuxInstalled()) return true;
        callbackContext.error("Termux is not installed.");
        return false;
    }

    private void openTermux(CallbackContext callbackContext) {
        if (!requireTermux(callbackContext)) return;

        try {
            Intent launchIntent =
                cordova.getContext().getPackageManager().getLaunchIntentForPackage(TERMUX_PACKAGE);
            if (launchIntent == null) {
                callbackContext.error("Termux launcher activity could not be found.");
                return;
            }
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            cordova.getContext().startActivity(launchIntent);
            callbackContext.success("Termux opened");
        } catch (Exception error) {
            callbackContext.error("Failed to open Termux: " + error.getMessage());
        }
    }

    private void dispatchShell(
        CallbackContext callbackContext,
        String workdir,
        boolean background,
        String command,
        String label,
        String description,
        String help
    ) {
        try {
            Intent intent = new Intent();
            intent.setClassName(TERMUX_PACKAGE, RUN_COMMAND_SERVICE);
            intent.setAction(ACTION_RUN_COMMAND);
            intent.putExtra(EXTRA_COMMAND_PATH, TERMUX_BASH);
            intent.putExtra(EXTRA_WORKDIR, workdir);
            intent.putExtra(EXTRA_BACKGROUND, background);
            intent.putExtra(EXTRA_SESSION_ACTION, "0");
            intent.putExtra(EXTRA_COMMAND_LABEL, label);
            intent.putExtra(EXTRA_COMMAND_DESCRIPTION, description);
            intent.putExtra(EXTRA_COMMAND_HELP, help);

            if (command != null && !command.isEmpty()) {
                intent.putExtra(EXTRA_ARGUMENTS, new String[] {"-lc", command});
            }

            cordova.getContext().startService(intent);
            callbackContext.success("dispatched");
        } catch (SecurityException error) {
            callbackContext.error(
                "Termux rejected the command. Grant Vexa the "
                    + "com.termux.permission.RUN_COMMAND permission and enable "
                    + "allow-external-apps in Termux. " + error.getMessage()
            );
        } catch (Exception error) {
            callbackContext.error("Failed to dispatch command to Termux: " + error.getMessage());
        }
    }
}
