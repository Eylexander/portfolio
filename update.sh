#!/bin/bash
set -e

# Runs dependency updates inside the same images the Dockerfiles use,
# so the lockfiles always match what CI builds with (Linux + same Node/Go).
# Keep these in sync with docker/frontend.Dockerfile and docker/backend.Dockerfile
NODE_IMAGE="node:lts-bookworm-slim"
GO_IMAGE="golang:trixie"

FRONTEND=false
BACKEND=false

for arg in "$@"; do
    case "$arg" in
    -frontend) FRONTEND=true ;;
    -backend) BACKEND=true ;;
    -h | --help)
        echo "Usage: ./update.sh [options]"
        echo "Options:"
        echo "  -frontend : Update only the frontend (npm)"
        echo "  -backend  : Update only the backend (go)"
        exit 0
        ;;
    *)
        echo "Error: Unknown option '$arg'"
        exit 1
        ;;
    esac
done

if [ "$FRONTEND" = false ] && [ "$BACKEND" = false ]; then
    FRONTEND=true
    BACKEND=true
fi

# Git Bash on Windows mangles paths like /app, and docker wants C:/... paths
export MSYS_NO_PATHCONV=1
ROOT=$(cd "$(dirname "$0")" && (pwd -W 2>/dev/null || pwd))

if [ "$FRONTEND" = true ]; then
    echo "Updating Frontend ($NODE_IMAGE)..."
    # Work on a copy in /app so the host's node_modules (Windows binaries) is never touched,
    # then copy only package.json + package-lock.json back. npm ci checks the result like the Dockerfile does.
    docker run --rm -v "$ROOT/frontend:/src" "$NODE_IMAGE" sh -c '
        set -e
        mkdir /app && cp /src/package.json /src/package-lock.json /app/ && cd /app
        npm update --save
        npm ci
        cp package.json package-lock.json /src/
    '
fi

if [ "$BACKEND" = true ]; then
    echo "Updating Backend ($GO_IMAGE)..."
    docker run --rm -v "$ROOT/backend:/app" -w /app "$GO_IMAGE" sh -c '
        set -e
        go get -u ./...
        go mod tidy
        go build ./...
    '
fi

echo "Done! Review with: git diff --stat"
if [ "$FRONTEND" = true ]; then
    # npm install on Windows rewrites the lockfile and drops Linux-only deps; npm ci never touches it
    echo "Then run 'npm ci' (NOT npm install) in ./frontend to refresh your local node_modules."
fi
