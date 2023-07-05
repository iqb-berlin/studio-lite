# syntax=docker/dockerfile:1

FROM node:18.16-bookworm-slim AS build
ARG project

RUN mkdir /studio-lite
WORKDIR /studio-lite

COPY . .

# Update npm to latest version
RUN npm --version && \
    npm install -g --no-fund npm && \
    npm cache clean --force && \
    npm --version

# Install dependencies
RUN npm ci --no-fund && npm cache clean --force

# Build project
RUN npx nx --version && npx nx build $project --prod


FROM build AS dev
ARG project

RUN sed -i "s/localhost.*$/backend:3333\",/" apps/${project}/proxy.conf.json

EXPOSE 80

ENTRYPOINT ["npx", "nx"]


FROM nginx:stable AS base
ARG project

COPY config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --from=build /studio-lite/dist/apps/$project /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM base AS prod
EXPOSE 443
