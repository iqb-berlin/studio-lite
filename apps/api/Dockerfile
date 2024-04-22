# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
ARG BASE_IMAGE=${REGISTRY_PATH}node:20.12-bookworm-slim


FROM ${BASE_IMAGE} AS build
ARG PROJECT

RUN mkdir /studio-lite
WORKDIR /studio-lite

COPY . .

# Update npm to latest version
RUN npm --version
RUN --mount=type=cache,target=~/.npm \
    npm install -g --no-fund npm
RUN npm --version

# Install dependencies
RUN --mount=type=cache,target=~/.npm \
    npm ci --no-fund

# Build project
RUN npx nx --version
RUN --mount=type=cache,target=./.nx/cache \
    npx nx build ${PROJECT} --prod


FROM build AS dev

ENTRYPOINT ["npx", "nx"]


FROM ${BASE_IMAGE} AS base
RUN --mount=type=cache,target=/var/cache/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends tini

ARG PROJECT
ENV NODE_ENV=production

RUN mkdir /studio-lite-${PROJECT} && chown -R node:node /studio-lite-${PROJECT}
WORKDIR /studio-lite-${PROJECT}

USER node
EXPOSE 3333

COPY --chown=node:node --from=build /studio-lite/dist/apps/${PROJECT}/package.json .
RUN --mount=type=cache,target=~/.npm \
    npm install --only=production --no-fund
RUN --mount=type=cache,target=~/.npm \
    npm install pg --save --no-fund ## workaround nx bug


FROM base AS source
ARG PROJECT

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=build /studio-lite/dist/apps/${PROJECT} .
RUN mkdir packages && chown -R node:node packages
RUN mkdir profiles && chown -R node:node profiles
RUN mkdir profiles/vocabs && chown -R node:node profiles/vocabs


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
