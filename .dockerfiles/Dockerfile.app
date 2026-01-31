FROM node:25.4.0-bullseye-slim AS builder

WORKDIR /app

COPY ./frontend/package.json ./package.json
COPY ./frontend/yarn.lock ./yarn.lock
COPY ./frontend/src/ ./src
COPY ./frontend/index.html ./index.html
COPY ./frontend/vite.config.ts ./vite.config.ts
COPY ./frontend/tsconfig* ./
RUN yarn install --frozen-lockfile && yarn cache clean
RUN yarn build

# for runner
COPY ./frontend/package.json /tmp/package.json
COPY ./frontend/yarn.lock /tmp/yarn.lock
WORKDIR /tmp
ENV NODE_ENV=production
RUN yarn install --frozen-lockfile

FROM nginx:1.25-alpine

# nginxのデフォルト設定を削除
RUN rm /etc/nginx/conf.d/default.conf

# nginx設定をコピー
COPY ./frontend/nginx/default.conf /etc/nginx/conf.d/default.conf

# build成果物を配置
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
