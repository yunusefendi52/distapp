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

test_temp_folder="tests/.temp"
mkdir -p $test_temp_folder
# Extract tests_artifacts
echo "Extracting tests_artifacts"
function extract_test_artifacts() {
    zip_file="$test_temp_folder/tests_artifacts.zip"
    if [ -f "$zip_file" ]; then
        echo "File $zip_file already exists. Skipping download."
    else
        curl -L -o $zip_file https://github.com/yunusefendi52/distapp_artifactory/releases/download/v1/tests_artifacts.zip
        tar -xzf $zip_file -C "tests"
    fi
}
extract_test_artifacts

echo "Finish setup test"

bun run build --preset=bun
HOST=localhost bun run .output/server/index.mjs
