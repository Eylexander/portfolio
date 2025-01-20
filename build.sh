#!/bin/bash

DIRS="frontend backend"

for dir in $DIRS; do
    cd $dir
    bash build.sh $@
    cd ..
done