#!/bin/bash
cd "$(dirname "$0")"
gh workflow run deploy.yml
echo "Деплой запущен. Прогресс: https://github.com/aidarkhusnutdinov/kazan-music-history/actions"
