# syntax=docker/dockerfile:1

FROM node:16.15-bullseye-slim AS build
ARG project

RUN mkdir /studio-lite
WORKDIR /studio-lite

COPY package*.json decorate-angular-cli.js ./
RUN npm ci --silent && npm cache clean --force

COPY . .
RUN npm install -g --silent nx
RUN nx build $project --prod


FROM build AS dev

ENTRYPOINT ["nx"]


FROM node:16-bullseye-slim AS base
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
RUN npm install --only=production --silent && npm cache clean --force
RUN npm install install pg --save --silent && npm cache clean --force ## workaround nx bug


FROM base AS source
ARG project

# Copy the build artifacts from the previous stage
COPY --chown=node:node --from=build /studio-lite/dist/apps/$project .


FROM source AS prod
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "main.js"]
