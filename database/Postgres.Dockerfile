# syntax=docker/dockerfile:1

FROM postgres:14.5-bullseye

# Localization
RUN localedef -i de_DE -c -f UTF-8 -A /usr/share/locale/locale.alias de_DE.UTF-8
ENV LANG de_DE.utf8

EXPOSE 5432
