#!/bin/zsh
DIR="/Users/aidar/Dropbox/Projects 2026/kazan-music-format"
PORT=8011
cd "$DIR" || exit 1

# Kill any existing process on this port
OLD_PID=$(lsof -ti :$PORT)
if [ -n "$OLD_PID" ]; then
  kill $OLD_PID 2>/dev/null
  sleep 1
fi

node ./local-preview-server.js >/tmp/kazan-music-preview.log 2>&1 &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT/preview.html"
echo $SERVER_PID > /tmp/kazan-music-preview.pid
