# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
ARG BASE_IMAGE


FROM ${REGISTRY_PATH}${BASE_IMAGE}

RUN apt-get update && \
    apt-get install -y --no-install-recommends git && \
    rm -rf /var/lib/apt/lists/*
