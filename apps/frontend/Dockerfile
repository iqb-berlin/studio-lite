# syntax=docker/dockerfile:1

ARG REGISTRY_PATH
ARG BASE_IMAGE_NAME=studio-lite-base


FROM $BASE_IMAGE_NAME AS base


FROM base AS dev
ARG PROJECT

RUN sed -i "s/localhost.*$/backend:3333\",/" apps/${PROJECT}/proxy.conf.json

EXPOSE 80

ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}nginx:stable AS prod
ARG PROJECT

COPY config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --from=base /usr/src/studio-lite-base/dist/apps/${PROJECT} /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
