FROM node:24 AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/

RUN corepack enable

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter backend build

FROM node:24-slim

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/pnpm-workspace.yaml ./
COPY --from=builder /app/apps/backend ./apps/backend
COPY apps/backend/entrypoint.sh ./entrypoint.sh

RUN corepack enable

RUN pnpm install --prod --frozen-lockfile

RUN chmod +x /app/entrypoint.sh

CMD ["/app/entrypoint.sh"]
