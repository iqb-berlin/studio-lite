# syntax=docker/dockerfile:1

ARG BASE_IMAGE=node:18.16-bookworm-slim

FROM ${BASE_IMAGE} AS build
ARG project

RUN mkdir /studio-lite
WORKDIR /studio-lite

COPY . .

RUN npm install -g --no-fund npm@9.7.2 nx && \
    npm ci --no-fund && \
    npm cache clean --force

RUN nx build $project --prod


FROM build AS dev

ENTRYPOINT ["nx"]


FROM ${BASE_IMAGE} AS base
RUN apt-get update && \
    apt-get install -y --no-install-recommends tini && \
    rm -rf /var/lib/apt/lists/*

ARG project
ENV NODE_ENV=production

RUN mkdir /studio-lite-${project} && chown -R node:node /studio-lite-${project}
WORKDIR /studio-lite-${project}

USER node
EXPOSE 3333

COPY --chown=node:node --from=build /studio-lite/dist/apps/$project/package.json .
RUN npm install --only=production --no-fund && npm cache clean --force


FROM base AS source
ARG project

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=build /studio-lite/dist/apps/$project .
RUN mkdir packages && chown -R node:node packages

FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
