#!/usr/bin/env bash
set -euo pipefail

REPO="bicheka/gommit"
INSTALL_DIR="/usr/local/bin"
TMP_DIR="$(mktemp -d)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

get_latest_version() {
  if command -v jq >/dev/null 2>&1; then
    curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" | jq -r '.tag_name'
  else
    curl -fsSI "https://github.com/$REPO/releases/latest" \
      | awk -F'/' '/^location:/I {gsub("\r", "", $NF); print $NF}'
  fi
}

VERSION="${VERSION:-$(get_latest_version)}"

OS="$(uname | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

case "$OS/$ARCH" in
  linux/x86_64)
    BIN_NAME="gommit-linux-amd64"
    INSTALL_NAME="gommit"
    ;;
  darwin/x86_64)
    BIN_NAME="gommit-macos-amd64"
    INSTALL_NAME="gommit"
    ;;
  darwin/arm64|darwin/aarch64)
    BIN_NAME="gommit-macos-arm64"
    INSTALL_NAME="gommit"
    ;;
  mingw*/x86_64|msys*/x86_64|cygwin*/x86_64)
    BIN_NAME="gommit-windows-amd64.exe"
    INSTALL_NAME="gommit.exe"
    INSTALL_DIR="${HOME}/bin"
    mkdir -p "$INSTALL_DIR"
    ;;
  *)
    echo "Unsupported OS/ARCH: $OS/$ARCH"
    exit 1
    ;;
esac

BASE_URL="https://github.com/$REPO/releases/download/$VERSION"
BIN_URL="$BASE_URL/$BIN_NAME"
CHECKSUM_URL="$BASE_URL/checksums.txt"

BIN_PATH="$TMP_DIR/$BIN_NAME"
CHECKSUM_PATH="$TMP_DIR/checksums.txt"

echo "Installing gommit $VERSION..."
echo "Downloading $BIN_NAME..."
curl -fL "$BIN_URL" -o "$BIN_PATH"

echo "Downloading checksums..."
curl -fL "$CHECKSUM_URL" -o "$CHECKSUM_PATH"

echo "Verifying checksum..."
EXPECTED_SUM="$(awk -v file="$BIN_NAME" '$2 == file {print $1}' "$CHECKSUM_PATH")"

if [[ -z "$EXPECTED_SUM" ]]; then
  echo "Could not find checksum for $BIN_NAME in checksums.txt"
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  ACTUAL_SUM="$(sha256sum "$BIN_PATH" | awk '{print $1}')"
elif command -v shasum >/dev/null 2>&1; then
  ACTUAL_SUM="$(shasum -a 256 "$BIN_PATH" | awk '{print $1}')"
elif command -v certutil >/dev/null 2>&1; then
  ACTUAL_SUM="$(certutil -hashfile "$BIN_PATH" SHA256 | awk 'NR==2 {print tolower($1)}')"
  EXPECTED_SUM="$(printf '%s' "$EXPECTED_SUM" | tr '[:upper:]' '[:lower:]')"
else
  echo "No SHA-256 tool found. Install sha256sum, shasum, or certutil."
  exit 1
fi

if [[ "$ACTUAL_SUM" != "$EXPECTED_SUM" ]]; then
  echo "Checksum verification failed!"
  echo "Expected: $EXPECTED_SUM"
  echo "Actual:   $ACTUAL_SUM"
  exit 1
fi

echo "Checksum OK"

mkdir -p "$INSTALL_DIR"
install -m 0755 "$BIN_PATH" "$INSTALL_DIR/$INSTALL_NAME"

echo "Installed to $INSTALL_DIR/$INSTALL_NAME"

case "$OS" in
  mingw*|msys*|cygwin*)
    echo "Make sure $INSTALL_DIR is in your PATH"
    echo "Run: $INSTALL_NAME --help"
    ;;
  *)
    echo "Run: gommit --help"
    ;;
esac