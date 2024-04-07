FROM oven/bun:1 as builder
WORKDIR /builder

COPY package.json bun.lockb /builder/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run prisma:generate

RUN bun run build

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /builder/.output .

ENTRYPOINT [ "bun" "run" "server/index.mjs" ]
