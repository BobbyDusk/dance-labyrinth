#!/bin/bash

if [[ "$1" == "local" ]]; then
    docker compose -f local.docker-compose.yml up --build -d
    if [[ "$2" == "stop" ]]; then
        docker compose -f local.docker-compose.yml down
        exit 0
    fi
else
    docker compose -f docker-compose.yml up -d
    if [[ "$1" == "stop" ]]; then
        docker compose -f docker-compose.yml down
        exit 0
    fi
fi