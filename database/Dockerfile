# syntax=docker/dockerfile:1

FROM liquibase/liquibase:4.15 AS db_change_management

FROM postgres:14.5-bullseye AS base

# Localization
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LANG de_DE.utf8

RUN mkdir /studio-lite-db
WORKDIR /studio-lite-db

# Install Liquibase
ENV JAVA_HOME /opt/java/openjdk
COPY --from=db_change_management $JAVA_HOME $JAVA_HOME
COPY --from=db_change_management /liquibase /opt/liquibase

# Updates base
COPY database/db_update.sh .
COPY database/db_entrypoint_hook.sh .
RUN chmod +x db_update.sh
RUN chmod +x db_entrypoint_hook.sh

EXPOSE 5432

ENTRYPOINT ["./db_entrypoint_hook.sh"]


FROM base AS prod

COPY database/changelog changelog
