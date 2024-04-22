# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM ${REGISTRY_PATH}node:20.12-bookworm-slim AS build
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
ARG PROJECT

RUN sed -i "s/localhost.*$/backend:3333\",/" apps/${PROJECT}/proxy.conf.json

EXPOSE 80

ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}nginx:stable AS base
ARG PROJECT

COPY config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --from=build /studio-lite/dist/apps/${PROJECT} /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM base AS prod
EXPOSE 443
