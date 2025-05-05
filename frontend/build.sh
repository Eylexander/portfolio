#!/bin/sh

# Parse eventual options
DEV=false
OPTIONS=""
for arg in "$@"; do
    shift
    case "$arg" in
    -dev) DEV=true ;;
    -nc) OPTIONS="$OPTIONS --no-cache" ;;
    -h | --help)
        echo "Options:\n-dev : build using Dockerfile.dev\n-nc : build with --no-cache"\n
        exit 1
        ;;
    *)
        echo "Option doesn't exist"
        exit 1
        ;;
    esac
done

if [ $DEV = true ]; then
    DOCKER_BUILDKIT=1 docker build $OPTIONS -f ../docker/Dockerfile.frontend.dev --tag backend-dev .
fi