FROM oven/bun:1.2.0 as builder
WORKDIR /builder

COPY package.json bun.lock /builder/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build --preset=bun

FROM oven/bun:1.2.0
WORKDIR /app
RUN mkdir -p /app/distapp-headless

RUN apt-get update && \
    apt-get install -y openjdk-11-jre-headless

RUN apt-get install -y unzip
RUN apt-get install -y curl

ARG DISTAPP_BUNDLETOOL_PATH=/app/bundletool.jar
ENV DISTAPP_BUNDLETOOL_PATH=${DISTAPP_BUNDLETOOL_PATH}

RUN [ -f ${DISTAPP_BUNDLETOOL_PATH} ] || curl -L -o ${DISTAPP_BUNDLETOOL_PATH} "https://github.com/google/bundletool/releases/download/1.17.2/bundletool-all-1.17.2.jar"

COPY --from=builder /builder/.output .

ENTRYPOINT [ "bun", "run", "server/index.mjs" ]
