# todo_app_vue

## install
```bash
cd frontend
yarn install
yarn build
cd ..
cd .dockerfiles
docker compose -f docker-compose.dev.yml run frontend yarn install
docker compose -f docker-compose.dev.yml run backend yarn install
docker compose -f docker-compose.dev.yml run backend yarn prisma migrate dev
docker compose -f docker-compose.dev.yml run backend yarn prisma generate # migrateしたら必ず実行
```

## run locally
```bash
cd .dockerfiles
export DATABASE_URL="postgresql://todouser:tododb@db:5432/todo_db?schema=public"
docker compose up -d

# for windows
$Env:DATABASE_URL='postgresql://todouser:tododb@db:5432/todo_db?schema=public'
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
