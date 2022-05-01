#!/usr/bin/env sh
set -eu

UUID=$(jq -r '.uuid' metadata.json)
COMMIT=$(git rev-parse HEAD)
BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)

YELLOW='\033[1;33m'
NO_COLOR='\033[0m'

# Warn about local branch different than remote branch
local_head_sha=$(git rev-parse HEAD)
origin_head_sha=$(git ls-remote origin -h refs/heads/$BRANCH_NAME | awk '{print $1}')
if [ "$local_head_sha" != "$origin_head_sha" ]; then
    echo "${YELLOW}Warning:${NO_COLOR} Local and remote branch are different"
fi

# Warn about staged changes
if ! git diff-index --quiet --cached HEAD --; then
    echo "${YELLOW}Warning:${NO_COLOR} There are staged but not committed changes"
fi

# Warn about files changed compared to index
if ! git diff-files --quiet; then
    echo "${YELLOW}Warning:${NO_COLOR} Files are changed compared to index"
fi

# Warn about version property not incremented compared to main branch
version_on_main=$(git show main:'metadata.json' | jq -r '.version')
local_version=$(jq -r '.version' metadata.json)
if [ "$BRANCH_NAME" != "main" -a "$local_version" = "$version_on_main" ]; then
    echo "${YELLOW}Warning:${NO_COLOR} Version in metadata.json hasn't been incremented compared to main branch"
fi

rm -rf .build
mkdir .build
cp -r metadata.json *.js README.md LICENSE assets/ .build/

cd .build
jq ". + {commit: \"$COMMIT\"}" metadata.json > temp && mv temp metadata.json

zip -r ../$UUID.zip .
cd ..
