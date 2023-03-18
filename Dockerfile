FROM docker.io/node:19-alpine

COPY ./ /app

WORKDIR /app

RUN npm install

CMD node /app/mqtt-pushover.js

