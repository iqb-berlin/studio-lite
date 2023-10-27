# syntax=docker/dockerfile:1

FROM postgres:14.8-bookworm

# Localization
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LANG de_DE.utf8

COPY database/healthcheck/postgres-healthcheck /usr/local/bin/
HEALTHCHECK \
    --interval=10s \
    --timeout=3s \
    --start-period=60s \
    --start-interval=1s \
    --retries=5 \
    CMD ["postgres-healthcheck"]

EXPOSE 5432
