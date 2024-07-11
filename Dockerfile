# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""


FROM ${REGISTRY_PATH}node:lts-bookworm AS builder

# Update npm to latest version
RUN npm --version
RUN --mount=type=cache,target=~/.npm \
    npm install -g --no-fund npm
RUN npm --version

WORKDIR /usr/src/studio-lite-base
COPY . .

# Install dependencies
RUN --mount=type=cache,target=~/.npm \
    npm ci --no-fund

# Build project
RUN npx nx --version
RUN --mount=type=cache,target=./.nx/cache \
    npx nx run-many --target=build --all --parallel
