#!/usr/bin/env sh
set -e

UUID=$(jq -r '.uuid' metadata.json)
COMMIT=$(git rev-parse HEAD)

rm -rf .build
mkdir .build
cp -r metadata.json *.js README.md LICENSE .build/

cd .build
jq ". + {commit: \"$COMMIT\"}" metadata.json > temp && mv temp metadata.json

zip -r ../$UUID.zip .
cd ..
