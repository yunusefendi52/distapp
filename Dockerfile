FROM oven/bun:1 as builder
WORKDIR /builder

COPY package.json bun.lock /builder/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build --preset=bun

FROM oven/bun:1
WORKDIR /app
COPY --from=builder /builder/.output .

ENTRYPOINT [ "bun", "run", "server/index.mjs" ]
