#!/usr/bin/env sh
if ! [ -x "$(command -v node)" ]; then
    echo 'Error: node is not installed.' >&2
    exit 1
fi

set -e

scriptUrl="https://github.com/yunusefendi52/distapp/raw/refs/heads/main/cli/cli.mjs"
scriptPath="/tmp/distapp-cli.mjs"
curl -sL -o $scriptPath -H 'Cache-Control: no-cache' "$scriptUrl"
DISTAPP_CLI_URL="https://distapp.lhf.my.id" node $scriptPath "$@"
