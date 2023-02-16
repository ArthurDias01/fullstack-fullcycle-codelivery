FROM node:alpine

USER root

RUN apk add --no-cache bash

WORKDIR /home/node/app

COPY package.json .

RUN npm i -g pnpm

COPY . .

RUN pnpm install --frozen-lockfile

## EXPOSE [Port you mentioned in the vite.config file]
EXPOSE 5432

CMD ["pnpm", "dev"]
