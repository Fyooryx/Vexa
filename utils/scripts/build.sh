#!/usr/bin/env bash
set -Eeuo pipefail

app="paid"
mode="d"
fdroidFlag=""
packageType="apk"
webpackmode="development"

for arg in "$@"; do
    case "$arg" in
        free|paid)
            app="$arg"
            ;;
        p|prod)
            mode="p"
            ;;
        d|dev)
            mode="d"
            ;;
        fdroid)
            fdroidFlag="fdroid"
            ;;
        apk|bundle)
            packageType="$arg"
            ;;
        *)
            printf 'Warning: unknown argument %q ignored\n' "$arg" >&2
            ;;
    esac
done

root="$(npm prefix)"
cd "$root"

tmpdir=""
if [[ -n "${TMPDIR:-}" && -r "$TMPDIR" && -w "$TMPDIR" ]]; then
    tmpdir="$TMPDIR"
elif [[ -r "/tmp" && -w "/tmp" ]]; then
    tmpdir="/tmp"
fi

fdroidMarker=""
if [[ -n "$tmpdir" ]]; then
    fdroidMarker="$tmpdir/fdroid.bool"
    if [[ "$fdroidFlag" == "fdroid" ]]; then
        printf 'true\n' > "$fdroidMarker"
    else
        printf 'false\n' > "$fdroidMarker"
    fi
fi

cleanup() {
    if [[ -n "${fdroidMarker:-}" ]]; then
        rm -f -- "$fdroidMarker"
    fi
}
trap cleanup EXIT

run() {
    printf '→'
    printf ' %q' "$@"
    printf '\n'
    "$@"
}

if [[ "$fdroidFlag" == "fdroid" ]]; then
    if [[ -d "plugins/com.foxdebug.acode.rk.exec.proot" ]]; then
        run cordova plugin remove com.foxdebug.acode.rk.exec.proot
    fi
    if [[ -d "plugins/cordova-plugin-iap" ]]; then
        run cordova plugin remove cordova-plugin-iap
    fi
else
    if [[ -d "src/plugins/proot" && ! -d "plugins/com.foxdebug.acode.rk.exec.proot" ]]; then
        run cordova plugin add src/plugins/proot/
    fi
    if [[ -d "src/plugins/iap" && ! -d "plugins/cordova-plugin-iap" ]]; then
        run cordova plugin add src/plugins/iap/
    fi
fi

if [[ "$mode" == "p" ]]; then
    webpackmode="production"
fi

if [[ "$packageType" == "bundle" ]]; then
    echo "Building AAR library file..."
else
    echo "Building APK file..."
fi

run node ./utils/config.js "$mode" "$app"
run rspack --mode "$webpackmode"

cordovaArgs=(build android)
if [[ "$mode" == "p" ]]; then
    cordovaArgs+=(--release)
fi
cordovaArgs+=(-- "--packageType=$packageType")

run cordova "${cordovaArgs[@]}"
