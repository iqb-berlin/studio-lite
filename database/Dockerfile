# syntax=docker/dockerfile:1

FROM postgres:14.4-bullseye AS base

# Localization
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LANG de_DE.utf8

RUN mkdir /studio-lite-db
WORKDIR /studio-lite-db

# Updates base
COPY database/db_update.sh .
RUN chmod +x db_update.sh

EXPOSE 5432


FROM base AS prod

COPY database/updates updates
COPY database/init /docker-entrypoint-initdb.d
