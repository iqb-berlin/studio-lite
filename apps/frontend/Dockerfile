# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""
ARG BASE_IMAGE_NAME=studio-lite-base


FROM $BASE_IMAGE_NAME AS base


FROM base AS dev
ARG PROJECT

RUN sed -i "s/127.0.0.1.*$/backend:3333\",/" apps/${PROJECT}/proxy.conf.json

EXPOSE 8080

ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}nginxinc/nginx-unprivileged:stable AS prod
ARG PROJECT

USER root
RUN chown -R nginx:root /usr/share/nginx/html

USER nginx

COPY --chown=nginx:root config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --chown=nginx:root --from=base /usr/src/studio-lite-base/dist/apps/${PROJECT} /usr/share/nginx/html

EXPOSE 8080 8443

CMD ["nginx", "-g", "daemon off;"]
