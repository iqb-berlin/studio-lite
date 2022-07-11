# syntax=docker/dockerfile:1

FROM cypress/browsers:node16.14.2-slim-chrome100-ff99-edge
RUN mkdir studio-lite
WORKDIR studio-lite

COPY package*.json decorate-angular-cli.js ./
RUN npm ci --silent && npm cache clean --force

RUN npx cypress install

COPY . .

RUN npm install -g --silent nx

ENTRYPOINT ["nx", "e2e", "frontend-e2e"]
