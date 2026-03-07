FROM node:25.4.0-bullseye-slim AS builder

COPY ./frontend/package.json /app/package.json
COPY ./frontend/yarn.lock /app/yarn.lock
COPY ./frontend/vite.config.ts /app/vite.config.ts
COPY ./frontend/tsconfig.json /app/tsconfig.json
COPY ./frontend/tsconfig.app.json /app/tsconfig.app.json
COPY ./frontend/tsconfig.node.json /app/tsconfig.node.json
COPY ./frontend/src /app/src
COPY ./frontend/public /app/public
COPY ./frontend/index.html /app/index.html

WORKDIR /app
RUN yarn install --frozen-lockfile
RUN yarn build

FROM nginx:stable-alpine3.23-perl

COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./frontend/nginx/default.conf /etc/nginx/conf.d/default.conf