FROM node:12-alpine AS BUILDER

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN rm -rf tests

RUN yarn run build

FROM node:12-alpine

WORKDIR /usr/src/app

COPY --from=BUILDER /usr/src/app/dist ./dist
COPY --from=BUILDER /usr/src/app/node_modules ./node_modules

EXPOSE 4001
CMD ["node", "./dist/app.js"]

