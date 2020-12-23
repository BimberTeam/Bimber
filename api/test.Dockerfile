FROM node:12-alpine AS BUILDER

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

CMD yarn run test