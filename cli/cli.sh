#!/usr/bin/env sh

scriptUrl="https://github.com/yunusefendi52/distapp/raw/refs/heads/main/cli/cli.mjs"
scriptPath="/tmp/distapp-cli.mjs"
curl -L -o $scriptPath "$scriptUrl"
node $scriptPath "$@"
