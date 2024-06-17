# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM studio-lite-base AS dev
ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}node:20.13-bookworm-slim AS base
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends tini

ARG PROJECT
ENV NODE_ENV=production

RUN mkdir /studio-lite-${PROJECT} && chown -R node:node /studio-lite-${PROJECT}
WORKDIR /studio-lite-${PROJECT}

USER node
EXPOSE 3333

COPY --chown=node:node --from=studio-lite-base /studio-lite/dist/apps/${PROJECT}/package.json .
RUN --mount=type=cache,target=~/.npm \
    npm install --only=production --no-fund
RUN --mount=type=cache,target=~/.npm \
    npm install pg --save --no-fund ## workaround nx bug


FROM base AS source
ARG PROJECT

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=studio-lite-base /studio-lite/dist/apps/${PROJECT} .
RUN mkdir packages && chown -R node:node packages


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
