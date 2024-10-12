#!/usr/bin/env sh
set -e

scriptUrl="https://github.com/yunusefendi52/distapp/raw/refs/heads/main/cli/cli.mjs"
scriptPath="/tmp/distapp-cli.mjs"
curl -sL -o $scriptPath -H 'Cache-Control: no-cache' "$scriptUrl"
node $scriptPath "$@"
