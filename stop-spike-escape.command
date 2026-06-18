#!/bin/zsh
if pids=$(lsof -ti tcp:5623 2>/dev/null); then
  if [ -n "$pids" ]; then
    echo "$pids" | xargs kill
    echo "Stopped process on port 5623."
  else
    echo "No process found on port 5623."
  fi
else
  echo "Unable to inspect port 5623."
fi
