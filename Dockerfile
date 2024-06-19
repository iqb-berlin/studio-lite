# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM ${REGISTRY_PATH}node:20.13-bookworm-slim AS builder

# Update npm to latest version
RUN npm --version
RUN --mount=type=cache,target=~/.npm \
    npm install -g --no-fund npm
RUN npm --version

USER node

WORKDIR /usr/src/studio-lite-base
COPY --chown=node:node . .

# Install dependencies
RUN --mount=type=cache,target=~/.npm \
    npm ci --no-fund

# Build project
RUN mkdir .angular
USER root
RUN npx nx --version
RUN --mount=type=cache,target=./.nx/cache \
    npx nx run-many --target=build --all --parallel
RUN chown -R node:node .angular
RUN chown -R node:node .nx
RUN chown -R node:node dist

USER node
