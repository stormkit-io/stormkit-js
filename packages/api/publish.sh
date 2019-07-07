#!/usr/bin/env bash

VERSION=`grep '"version"' package.json | cut -d '"' -f 4`
HASH=`git rev-parse HEAD`

echo "Publishing $VERSION. Commit hash: $HASH"

git tag -a v$VERSION $HASH -m "Release v$VERSION"
npm publish