# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""
ARG BASE_IMAGE_NAME=studio-lite-base


FROM $BASE_IMAGE_NAME AS base


FROM ${REGISTRY_PATH}cypress/browsers:node-22.14.0-chrome-134.0.6998.165-1-ff-136.0.3-edge-134.0.3124.85-1

WORKDIR /usr/src/studio-lite

# Copy studio-lite monorepo
COPY . .

# Copy pre-installed dependencies
COPY --from=base /usr/src/studio-lite/node_modules ./node_modules

# Check nx workspace version
RUN npx nx --version

# Install cypress
RUN --mount=type=cache,target=./.nx/cache \
    npx cypress install && npx cypress version

ENTRYPOINT ["npx", "nx"]
CMD ["e2e", "frontend-e2e"]
