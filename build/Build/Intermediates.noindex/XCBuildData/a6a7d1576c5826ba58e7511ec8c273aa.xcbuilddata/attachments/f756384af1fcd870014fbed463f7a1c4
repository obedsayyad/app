#!/bin/sh
echo "Target architectures: $ARCHS"

APP_PATH="${TARGET_BUILD_DIR}/${WRAPPER_NAME}"

# For Mac Catalyst/macOS builds, skip thinning and just normalize + sign nested frameworks.
if [ "${PLATFORM_NAME}" = "macosx" ]; then
  find "$APP_PATH" -type d -name "*.framework" | while read -r FRAMEWORK; do
    echo "Catalyst normalize/sign: $FRAMEWORK"
    # If framework has a non-symlink Versions layout, remove it to avoid 'unsealed contents' errors.
    if [ -d "$FRAMEWORK/Versions" ] && [ ! -L "$FRAMEWORK/Versions/Current" ]; then
      echo "Removing non-symlinked Versions directory from $FRAMEWORK"
      rm -rf "$FRAMEWORK/Versions"
    fi
    # Sign the framework if allowed.
    if [ "${CODE_SIGNING_ALLOWED}" = "YES" ] && [ -n "${EXPANDED_CODE_SIGN_IDENTITY}" ]; then
      /usr/bin/codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" --timestamp=none --deep "$FRAMEWORK" || exit 1
      echo "Re-signed $FRAMEWORK"
    fi
  done
  exit 0
fi

# iOS (device) builds: thin frameworks and re-sign
find "$APP_PATH" -type d -name "*.framework" | while read -r FRAMEWORK; do
  echo "Found framework: $FRAMEWORK"

  # Resolve Info.plist location
  INFO_PLIST=""
  if [ -f "$FRAMEWORK/Info.plist" ]; then
    INFO_PLIST="$FRAMEWORK/Info.plist"
  elif [ -f "$FRAMEWORK/Resources/Info.plist" ]; then
    INFO_PLIST="$FRAMEWORK/Resources/Info.plist"
  elif [ -f "$FRAMEWORK/Versions/A/Resources/Info.plist" ]; then
    INFO_PLIST="$FRAMEWORK/Versions/A/Resources/Info.plist"
  fi

  # Resolve executable name
  FRAMEWORK_EXECUTABLE_NAME=""
  if [ -n "$INFO_PLIST" ]; then
    FRAMEWORK_EXECUTABLE_NAME=$(defaults read "$INFO_PLIST" CFBundleExecutable 2>/dev/null || /usr/libexec/PlistBuddy -c "Print :CFBundleExecutable" "$INFO_PLIST" 2>/dev/null)
  fi
  if [ -z "$FRAMEWORK_EXECUTABLE_NAME" ]; then
    FRAMEWORK_EXECUTABLE_NAME="$(basename "$FRAMEWORK" .framework)"
  fi

  # Resolve binary path (handle macOS-style Versions layout)
  FRAMEWORK_EXECUTABLE_PATH=""
  if [ -f "$FRAMEWORK/$FRAMEWORK_EXECUTABLE_NAME" ]; then
    FRAMEWORK_EXECUTABLE_PATH="$FRAMEWORK/$FRAMEWORK_EXECUTABLE_NAME"
  elif [ -f "$FRAMEWORK/Versions/A/$FRAMEWORK_EXECUTABLE_NAME" ]; then
    FRAMEWORK_EXECUTABLE_PATH="$FRAMEWORK/Versions/A/$FRAMEWORK_EXECUTABLE_NAME"
  fi

  echo "Executable path: ${FRAMEWORK_EXECUTABLE_PATH:-not found}"

  if [ -n "$FRAMEWORK_EXECUTABLE_PATH" ] && [ -f "$FRAMEWORK_EXECUTABLE_PATH" ]; then
    case "${TARGET_BUILD_DIR}" in
      *"iphonesimulator")
        echo "No need to remove archs (simulator build)"
        ;;
      *)
        if lipo "$FRAMEWORK_EXECUTABLE_PATH" -verify_arch i386 >/dev/null 2>&1 ; then
          lipo -output "${FRAMEWORK_EXECUTABLE_PATH}-tmp" -remove i386 "$FRAMEWORK_EXECUTABLE_PATH" && mv "${FRAMEWORK_EXECUTABLE_PATH}-tmp" "$FRAMEWORK_EXECUTABLE_PATH"
          echo "Removed i386"
        fi
        if lipo "$FRAMEWORK_EXECUTABLE_PATH" -verify_arch x86_64 >/dev/null 2>&1 ; then
          if ! echo "$ARCHS" | grep -q "x86_64" ; then
            lipo -output "${FRAMEWORK_EXECUTABLE_PATH}-tmp" -remove x86_64 "$FRAMEWORK_EXECUTABLE_PATH" && mv "${FRAMEWORK_EXECUTABLE_PATH}-tmp" "$FRAMEWORK_EXECUTABLE_PATH"
            echo "Removed x86_64"
          fi
        fi
        ;;
    esac
    echo "$(lipo -info "$FRAMEWORK_EXECUTABLE_PATH" 2>/dev/null || echo "lipo info unavailable")"
  else
    echo "Skipping lipo; executable not found for $FRAMEWORK"
  fi

  if [ "${CODE_SIGNING_ALLOWED}" = "YES" ] && [ -n "${EXPANDED_CODE_SIGN_IDENTITY}" ]; then
    /usr/bin/codesign --force --sign "${EXPANDED_CODE_SIGN_IDENTITY}" --timestamp=none "$FRAMEWORK" || exit 1
    echo "Re-signed $FRAMEWORK"
  fi

done

