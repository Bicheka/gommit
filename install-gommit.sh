#!/usr/bin/env bash

VERSION="v1.0.0"

OS="$(uname | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

# Determine the binary name based on OS and ARCH
if [[ "$OS" == "linux" && "$ARCH" == "x86_64" ]]; then
    BIN="gommit-linux-x64"
elif [[ "$OS" == "darwin" && "$ARCH" == "x86_64" ]]; then
    BIN="gommit-darwin-x64"
elif [[ "$OS" == "darwin" && "$ARCH" == "arm64" ]]; then
    BIN="gommit-darwin-arm64"
else
    echo "Unsupported OS/ARCH: $OS/$ARCH"
    exit 1
fi

URL="https://github.com/bicheka/gommit/releases/download/$VERSION/$BIN"

# Download the binary
curl -Lo /usr/local/bin/gommit "$URL"
chmod +x /usr/local/bin/gommit

echo "Gommit installed! Run 'gommit --help'"