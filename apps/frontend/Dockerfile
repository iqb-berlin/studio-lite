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
# nginx-unprivileged:stable lags behind Debian's security updates, and each fixed CVE it still carries
# fails the image scan (libbrotli1, CVE-2026-111497). Release builds always run this layer; develop builds
# take it from the cache of :latest until the base image changes.
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/* && \
    chown -R nginx:root /usr/share/nginx/html

USER nginx

COPY --chown=nginx:root config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --chown=nginx:root --from=base /usr/src/studio-lite/dist/apps/${PROJECT} /usr/share/nginx/html

EXPOSE 8080 8443

CMD ["nginx", "-g", "daemon off;"]
