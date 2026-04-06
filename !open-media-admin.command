#!/bin/zsh
DIR="/Users/aidar/Dropbox/Projects 2026/kazan-music-format"
PORT=8011
cd "$DIR" || exit 1

node ./local-preview-server.js >/tmp/kazan-music-preview.log 2>&1 &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT/media-admin.html"
echo $SERVER_PID > /tmp/kazan-music-preview.pid
