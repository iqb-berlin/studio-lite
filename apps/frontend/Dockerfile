# syntax=docker/dockerfile:1

FROM node:20.3-bookworm-slim AS build
ARG project

RUN mkdir /studio-lite
WORKDIR /studio-lite

COPY package*.json decorate-angular-cli.js ./
RUN npm ci --silent && npm cache clean --force

COPY . .
RUN npm install -g --silent nx
RUN nx build $project --prod


FROM build AS dev
ARG project

RUN sed -i "s/localhost.*$/backend:3333\",/" apps/${project}/proxy.conf.json

EXPOSE 80

ENTRYPOINT ["nx"]


FROM nginx:stable AS base
ARG project

COPY config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --from=build /studio-lite/dist/apps/$project /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM base AS prod
EXPOSE 443
