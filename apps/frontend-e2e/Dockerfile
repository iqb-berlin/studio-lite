# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
ARG BASE_IMAGE_NAME=studio-lite-base


FROM $BASE_IMAGE_NAME AS base


FROM ${REGISTRY_PATH}cypress/browsers:node-20.15.1-chrome-126.0.6478.114-1-ff-127.0.1-edge-126.0.2592.61-1

WORKDIR /usr/src/studio-lite

# Copy studio-lite monorepo
COPY . .

# Copy pre-installed dependencies
COPY --from=base /usr/src/studio-lite-base/node_modules ./node_modules

# Check nx workspace version
RUN npx nx --version

# Install cypress
RUN --mount=type=cache,target=./.nx/cache \
    npx cypress install && npx cypress version

ENTRYPOINT ["npx", "nx"]
CMD ["e2e", "frontend-e2e"]
