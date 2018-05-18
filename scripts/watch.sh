#!/usr/bin/env bash

set -e

INPUT=index.bs

dir="$( dirname "$0" )"
cd "$dir/.."

prev=$( stat -c %Z "$INPUT" )
"$dir/build.sh"
while true; do
  curr=$( stat -c %Z "$INPUT" )
  if [[ $curr != $prev ]]; then
    echo "Change to $INPUT detected"
    "$dir/build.sh"
    prev=$curr
  fi
  sleep 1
done
