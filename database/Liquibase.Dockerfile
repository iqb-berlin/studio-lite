# syntax=docker/dockerfile:1

FROM liquibase/liquibase:4.23 AS base

FROM base AS prod

COPY database/changelog changelog
