#!/usr/bin/env bash

set -e

INPUT=index.bs

dir="$( dirname "$0" )"
cd "$dir/.."

# If we can't invoke `stat` as GNU stat, fall back to BSD-style (incl. macOS)
statopt='-c %Z'
stat $statopt "$INPUT" >/dev/null 2>&1 || statopt='-f %Sm'

prev=$( stat $statopt "$INPUT" )
"$dir/build.sh"
while true; do
  curr=$( stat $statopt "$INPUT" )
  if [[ $curr != $prev ]]; then
    echo "Change to $INPUT detected."
    "$dir/build.sh"
    prev=$curr
  fi
  sleep 1
done
