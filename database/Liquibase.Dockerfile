# syntax=docker/dockerfile:1

ARG REGISTRY_PATH


FROM ${REGISTRY_PATH}liquibase/liquibase:4.28 AS base

FROM base AS prod

COPY database/changelog changelog
