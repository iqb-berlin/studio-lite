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
ARG project
ARG apihost
ARG apiport

RUN sed -i "s/localhost.*$/${apihost}:${apiport}\",/" apps/${project}/proxy.conf.json

ENTRYPOINT ["nx"]


FROM nginx:stable AS base
ARG project

COPY apps/frontend/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /studio-lite/dist/apps/$project /usr/share/nginx/html


FROM base AS prod
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
