# todo_app_vue

## install
```bash
cd frontend
yarn install
yarn build
cd ..
cd .dockerfiles
docker compose -f docker-compose.dev.yml run frontend yarn install
docker compose run backend yarn install
docker compose run backend yarn prisma migrate dev
docker compose run backend yarn prisma generate # migrateしたら必ず実行
```

## run
```bash
cd .dockerfiles
docker compose up -d
```

### serve with frontend vite proxy
```bash
cd .dockerfiles
docker compose up -f docker-compose.dev.yml up -d
```

### serve dev only app
```bash
cd frontend
yarn dev
```

### stop service
```bash
cd .dockerfiles
docker compose down -t 3
```
