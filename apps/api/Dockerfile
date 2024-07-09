# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
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

# Install dependencies
COPY --chown=node:node --from=base /usr/src/studio-lite-base/dist/apps/${PROJECT}/package.json .
RUN --mount=type=cache,target=~/.npm \
    npm install --omit=dev --no-fund

# Install PostgreSQL client (missing in dist/apps/api/package.json - nx bug?)
RUN --mount=type=cache,target=~/.npm \
    npm install pg --save --no-fund

EXPOSE 3333


FROM build AS source
ARG PROJECT

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=base /usr/src/studio-lite-base/dist/apps/${PROJECT} .


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
