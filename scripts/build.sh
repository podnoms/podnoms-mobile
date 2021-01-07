#!/usr/bin/env bash

echo "Cleaning caches"
rm android/app/src/main/assets/index.android.bundle
rm -rf ./android/app/src/main/res/raw
rm -rf ./android/app/build
rm -rf ./android/build

echo "Bundling react app"
npx react-native bundle \
    --platform android \
    --dev false \
    --entry-file index.js \
    --bundle-output android/app/src/main/assets/index.android.bundle \
    --assets-dest android/app/src/main/res/

echo "Creating release"
cd android && ./gradlew assembleRelease && ./gradlew bundleRelease

echo "Uploading to web"
ARTEFACT="$HOME/dev/podnoms/podnoms-mobile/android/app/build/outputs/apk/release/app-release.apk"
if [ -f $ARTEFACT ]; then
    az storage blob upload \
        --account-name podnomscdn \
        --container-name '$web' \
        --name assets/podnoms-mobile.apk \
        --file $ARTEFACT \
        --auth-mode key
else
    echo "$ARTEFACT does not exist"
fi
