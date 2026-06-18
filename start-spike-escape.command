#!/bin/zsh
cd "/Users/shengyufei/Desktop/小游戏" || exit 1
if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found"
  exit 1
fi
if lsof -ti tcp:5623 >/dev/null 2>&1; then
  echo "Port 5623 is already in use."
  exit 1
fi
echo "Starting Spike Escape on http://127.0.0.1:5623"
npm run dev
