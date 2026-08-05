# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""
ARG BASE_IMAGE_NAME=studio-lite-base


FROM $BASE_IMAGE_NAME AS base


FROM base AS dev
ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}node:lts-bookworm-slim AS build
ARG PROJECT
ENV NODE_ENV=production

RUN --mount=type=cache,target=/var/cache/apt \
    apt update && \
    apt install -y --no-install-recommends tini

USER node

WORKDIR /usr/src/studio-lite-${PROJECT}
RUN mkdir packages

# Install dependencies.
# --legacy-peer-deps: the generated package.json comes without a lockfile, so this
# install resolves against the registry every time. ioredis 6.0.0 (2026-07-31) is
# reachable through @nestjs/core's optional peer @nestjs/microservices, which allows
# any version, while typeorm's optional peer pins ^5.0.4 -- npm's strict peer
# resolution then fails the build although we use no Redis at all and neither package
# is a dependency of ours. Not installing optional peers is the npm 6 behaviour and
# the right one for a pruned production image (#1587).
COPY --chown=node:node --from=base /usr/src/studio-lite/dist/apps/${PROJECT}/package.json .
RUN --mount=type=cache,target=~/.npm \
    npm install --omit=dev --no-fund --legacy-peer-deps

# Install PostgreSQL client (missing in dist/apps/api/package.json - nx bug?)
RUN --mount=type=cache,target=~/.npm \
    npm install pg --save --no-fund --legacy-peer-deps

EXPOSE 3333


FROM build AS source
ARG PROJECT

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=base /usr/src/studio-lite/dist/apps/${PROJECT} .


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
