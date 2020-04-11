#!/bin/bash
CONFIGFILE=${OPENMCT_CONFIG:=eva.js}
OPENMCT_ROOT=${OPENMCT_ROOT:=node_modules/openmct/dist}
DICT=dict/dictionaries.json

while true; do
  node config/${OPENMCT_CONFIG} &
  PID=$!
  echo "Starting OpenMCT with config $OPENMCT_CONFIG at $OPENMCT_ROOT"
  inotifywait -q -e close_write,delete_self $DICT
  echo "File changes detected for $DICT, killing PID $PID"
  while kill $PID; do
    sleep 1
    echo "Server process killed (PID $PID)"
  done
  sleep 5
done

