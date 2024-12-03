#!/bin/bash

dotenv() {
    set -a
    [ -f .env ] && . .env.test
    set +a
}

dotenv

echo "Setup test"

tempFolder=".temp"
rm -rf $tempFolder
mkdir -p $tempFolder

minioFolder="$tempFolder/minio"
mkdir -p "$minioFolder/distapp"
minio server --address 127.0.0.1:9000 "$minioFolder" &

for i in {1..10}; do
    curl -s -IL 127.0.0.1:9000
    if [ $? -eq 0 ]; then
        break
    fi
    sleep 1
done

mkdir -p "$tempFolder/sqld"
pushd "$tempFolder/sqld"
sqld --http-listen-addr "127.0.0.1:8888" --http-auth "basic:c3FsZDppOHJ3ZXlzNzBkN2Zh" &
for i in {1..10}; do
    curl -s -IL 127.0.0.1:8888
    if [ $? -eq 0 ]; then
        break
    fi
    sleep 1
done

popd

echo "Finish setup test"

bun run dev
