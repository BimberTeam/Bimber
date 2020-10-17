FROM node:12-alpine AS BUILDER

WORKDIR /usr/src/app

COPY package.json package-lock.json ./
RUN npm install
COPY . .

RUN npm run build
RUN npm prune --production

FROM node:12-alpine

WORKDIR /usr/src/app

COPY --from=BUILDER /usr/src/app/dist ./dist
COPY --from=BUILDER /usr/src/app/node_modules ./node_modules

EXPOSE 4001
CMD ["node", "./dist/app.js"]

