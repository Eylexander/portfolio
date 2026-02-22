#!/bin/bash

# Parse eventual options
DEV=false
OPTIONS=""
FRONTEND=false
BACKEND=false
PUSH=false
for arg in "$@"; do
    shift
    case "$arg" in
    -dev) DEV=true ;;
    -frontend) FRONTEND=true ;;
    -backend) BACKEND=true ;;
    -nc) OPTIONS="$OPTIONS --no-cache" ;;
    -push) PUSH=true ;;
    -h | --help)
        echo "Options:"
        echo "  -dev: Build development images"
        echo "  -frontend: Build only the frontend image"
        echo "  -backend: Build only the backend image"
        echo "  -nc: Build images without cache"
        echo "  -push: Push images to Docker Hub after building"
        exit 1
        ;;
    *)
        echo "Option doesn't exist"
        exit 1
        ;;
    esac
done

if [ $DEV = true ]; then
    if [ $BACKEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
        DOCKER_BUILDKIT=1 docker build $OPTIONS -f ./docker/backend.dev.Dockerfile --tag portfolio-backend-dev ./backend
    fi
    if [ $FRONTEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
        DOCKER_BUILDKIT=1 docker build $OPTIONS -f ./docker/frontend.dev.Dockerfile --tag portfolio-frontend-dev ./frontend
    fi
else
    # if [ $BACKEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
    #     DOCKER_BUILDKIT=1 docker build $OPTIONS -f ./docker/backend.Dockerfile --tag eylexander/portfolio-backend:latest ./backend
    # fi
    # if [ $FRONTEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
    #     DOCKER_BUILDKIT=1 docker build $OPTIONS -f ./docker/frontend.Dockerfile --tag eylexander/portfolio-frontend:latest ./frontend
    # fi

    if [ $BACKEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
        DOCKER_BUILDKIT=1 docker build $OPTIONS -f ./docker/backend.Dockerfile --tag eylexander/beta-portfolio-backend:latest ./backend
    fi
    if [ $FRONTEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
        DOCKER_BUILDKIT=1 docker build $OPTIONS -f ./docker/frontend.Dockerfile --tag eylexander/beta-portfolio-frontend:latest ./frontend
    fi
fi

# if [ $PUSH = true ]; then
#     if [ $BACKEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
#         docker push eylexander/portfolio-backend:latest
#     fi
#     if [ $FRONTEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
#         docker push eylexander/portfolio-frontend:latest
#     fi
# fi

if [ $PUSH = true ]; then
    if [ $BACKEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
        docker push eylexander/beta-portfolio-backend:latest
    fi
    if [ $FRONTEND = true ] || [ $FRONTEND = false ] && [ $BACKEND = false ]; then
        docker push eylexander/beta-portfolio-frontend:latest
    fi
fi