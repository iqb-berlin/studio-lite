FROM node:14.19-buster
WORKDIR /usr/src/app
COPY package.json /usr/src/app/package.json
RUN npm install -g nx
RUN npm install
COPY . .
RUN chown -R node /usr/src/
USER node
EXPOSE 4200
CMD nx run-many --target=serve --projects=api,frontend --parallel
