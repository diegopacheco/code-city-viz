#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
if [ -n "$1" ]; then
    python3 analyze.py "$1"
    if [ $? -ne 0 ]; then
        exit 1
    fi
fi
PORT=8080
while lsof -i :$PORT > /dev/null 2>&1; do
    PORT=$((PORT + 1))
done
echo "Starting server on http://localhost:$PORT"
python3 -m http.server $PORT
