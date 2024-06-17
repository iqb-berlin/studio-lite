# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM studio-lite-base AS dev
ARG PROJECT

RUN sed -i "s/localhost.*$/backend:3333\",/" apps/${PROJECT}/proxy.conf.json

EXPOSE 80

ENTRYPOINT ["npx", "nx"]


FROM ${REGISTRY_PATH}nginx:stable AS base
ARG PROJECT

COPY config/frontend/default.conf.http-template /etc/nginx/templates/default.conf.template
COPY --from=studio-lite-base /studio-lite/dist/apps/${PROJECT} /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]


FROM base AS prod
EXPOSE 443
