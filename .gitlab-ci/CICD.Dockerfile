# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
ARG BASE_IMAGE


FROM ${REGISTRY_PATH}${BASE_IMAGE}

# ca-certificates is only a recommendation of git: without it, git in a job cannot fetch over
# HTTPS, as test-app and lint-app do in a pull request (#1659)
RUN --mount=type=cache,target=/var/cache/apt \
    apt update && \
    apt install -y --no-install-recommends git ca-certificates
