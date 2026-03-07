FROM node:25.4.0-bullseye-slim AS builder

COPY ./backend/package.json /app/package.json
COPY ./backend/yarn.lock /app/yarn.lock
COPY ./backend/tsconfig.json /app/tsconfig.json
COPY ./backend/src /app/src
COPY ./backend/prisma /app/prisma
COPY ./backend/generated /app/generated

WORKDIR /app
RUN yarn install --frozen-lockfile
RUN yarn build

WORKDIR /tmp
ENV NODE_ENV=production
COPY ./backend/package.json /tmp/package.json
COPY ./backend/yarn.lock /tmp/yarn.lock
RUN yarn install --frozen-lockfile


FROM node:25.4.0-bullseye-slim

COPY --from=builder /app/dist /app/dist
COPY --from=builder /tmp/node_modules /app/node_modules

CMD ["node", "/app/dist/src/main.js"]