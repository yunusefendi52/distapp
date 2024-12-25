#!/bin/bash

dotenv() {
    set -a
    [ -f .env.test ] && . .env.test
    set +a
}

dotenv

echo "Setup test"

tempFolder=".temp"
rm -rf $tempFolder
mkdir -p $tempFolder

seawFolder="$tempFolder/seaw"
mkdir -p "$seawFolder/distapp"
weed server -dir="$seawFolder" -s3 -s3.port=8333 -volume.preStopSeconds=0 -s3.allowedOrigins="*" -master.raftHashicorp &

# for i in {1..10}; do
#     curl -s -IL 127.0.0.1:8333
#     if [ $? -eq 0 ]; then
#         break
#     fi
#     sleep 1
# done

mkdir -p "$tempFolder/sqld"
pushd "$tempFolder/sqld"
sqld --http-listen-addr "127.0.0.1:8889" --http-auth "basic:c3FsZDppOHJ3ZXlzNzBkN2Zh" &
for i in {1..10}; do
    curl -s -IL 127.0.0.1:8889
    if [ $? -eq 0 ]; then
        break
    fi
    sleep 1
done

popd

echo "Finish setup test"

bun run build --preset=bun
HOST=localhost bun run .output/server/index.mjs
