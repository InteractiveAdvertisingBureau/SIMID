#!/usr/bin/env bash

set -e

INPUT=index.bs
OUTPUT=index.html

cd "$( dirname "$0" )/.."

echo -n "Building $OUTPUT ..."
if curl https://api.csswg.org/bikeshed/ -F file=@"$INPUT" -F force=1 --silent >"$OUTPUT"; then
  echo " Succeeded"
else
  echo " Failed"
fi
