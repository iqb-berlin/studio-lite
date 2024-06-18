# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM studio-lite-base AS dev
ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}node:20.13-bookworm-slim AS base
ARG PROJECT
ENV NODE_ENV=production

RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends tini

USER node

WORKDIR /usr/src/studio-lite-${PROJECT}
RUN mkdir packages

# Install dependencies
COPY --chown=node:node --from=studio-lite-base /usr/src/studio-lite-base/dist/apps/${PROJECT}/package.json .
RUN --mount=type=cache,target=~/.npm \
    npm install --omit=dev --no-fund

# Install PostgreSQL client (missing in dist/apps/api/package.json - nx bug?)
RUN --mount=type=cache,target=~/.npm \
    npm install pg --save --no-fund

EXPOSE 3333


FROM base AS source
ARG PROJECT

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=studio-lite-base /usr/src/studio-lite-base/dist/apps/${PROJECT} .


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
