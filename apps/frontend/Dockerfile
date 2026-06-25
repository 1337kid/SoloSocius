FROM node:24

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/

RUN pnpm install

COPY . .

RUN pnpm --filter frontend build

CMD ["pnpm", "--filter", "frontend", "start"]