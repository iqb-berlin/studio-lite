FROM node:14.19-buster
WORKDIR /usr/src/app
RUN npm uninstall bcrypt --no-save
RUN npm i bcrypt --save
COPY ["package.json", "package-lock.json", "./"]
RUN npm install -g nx
RUN npm install
COPY . .
RUN chown -R node /usr/src/
USER node
CMD nx run-many --target=serve --projects=api,frontend --parallel 