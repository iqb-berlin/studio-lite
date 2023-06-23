# syntax=docker/dockerfile:1

FROM cypress/browsers:node-18.16.0-chrome-114.0.5735.133-1-ff-114.0.2-edge-114.0.1823.51-1
RUN mkdir studio-lite
WORKDIR studio-lite

COPY package*.json decorate-angular-cli.js ./
RUN npm ci --silent && npm cache clean --force

RUN npx cypress install

COPY . .

RUN npm install -g --silent nx

ENTRYPOINT ["nx"]
CMD ["e2e", "frontend-e2e"]
