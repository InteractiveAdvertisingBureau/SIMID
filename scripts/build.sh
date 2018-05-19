#!/usr/bin/env bash

set -e

INPUT=index.bs
OUTPUT=index.html

cd "$( dirname "$0" )/.."

echo -n "Linting $INPUT ..."
errors="$( curl https://api.csswg.org/bikeshed/ -F file=@"$INPUT" -F force=1 -F output=err --silent )"

if [[ -n $errors ]]; then
  echo " Errors found."
  echo -e "\n=== LINTER OUTPUT ===\n$errors\n=== END OF LINTER OUTPUT ===\n"
else
  echo " No errors found."
fi

echo -n "Building $OUTPUT ..."
curl https://api.csswg.org/bikeshed/ -F file=@"$INPUT" -F force=1 --silent >"$OUTPUT"
echo " Done."
