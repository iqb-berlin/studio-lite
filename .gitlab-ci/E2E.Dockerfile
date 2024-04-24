# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
ARG BASE_IMAGE


FROM ${REGISTRY_PATH}${BASE_IMAGE}

RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends curl

RUN curl -fsSL https://get.docker.com -o get-docker.sh &&  \
    sh ./get-docker.sh \
