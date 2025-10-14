# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""


FROM ${REGISTRY_PATH}node:lts-bookworm AS builder

# Check node and npm version - sometimes they do not match
RUN node --version
RUN npm --version

# Update npm to latest version
# Optional, sometimes latest npm is not supported by node lts !!!
#RUN --mount=type=cache,target=~/.npm \
#    npm install -g --no-fund npm
#RUN npm --version

WORKDIR /usr/src/studio-lite
COPY . .

# Install dependencies
RUN --mount=type=cache,target=~/.npm \
    npm ci --no-fund

# Build project
RUN npx nx --version
RUN --mount=type=cache,target=./.nx/cache \
    npx nx run-many --target=build --all --parallel
