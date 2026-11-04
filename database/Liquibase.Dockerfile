# syntax=docker/dockerfile:1

ARG REGISTRY_PATH=""


FROM ${REGISTRY_PATH}liquibase/liquibase:4.33 AS base

FROM base AS prod

# lpm (Liquibase Package Manager) is only called by the entrypoint when INSTALL_MYSQL is set,
# which we never do. 4.33 is the last 4.x release and its lpm binary carries a critical Go CVE (#1892).
USER root
RUN rm /liquibase/bin/lpm /usr/local/bin/lpm
USER liquibase:liquibase

COPY database/changelog changelog
