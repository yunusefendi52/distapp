FROM oven/bun:1.2.8 as builder
WORKDIR /builder

ENV NUXT_DISTAPP_SELF_HOST=true

COPY package.json bun.lock /builder/
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build --preset=bun

FROM eclipse-temurin:25-jre
WORKDIR /app
RUN mkdir -p /app/distapp-headless

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
RUN curl -fsSL https://bun.sh/install | bash -s "bun-v1.2.8"
ENV PATH="/root/.bun/bin:${PATH}"

ARG DISTAPP_BUNDLETOOL_PATH=/app/bundletool.jar
ENV DISTAPP_BUNDLETOOL_PATH=${DISTAPP_BUNDLETOOL_PATH}

RUN [ -f ${DISTAPP_BUNDLETOOL_PATH} ] || curl -L -o ${DISTAPP_BUNDLETOOL_PATH} "https://github.com/google/bundletool/releases/download/1.18.3/bundletool-all-1.18.3.jar"

COPY --from=builder /builder/.output .

ARG NUXT_PUBLIC_UPLOAD_WITH_BUILD_APK=true
ENV NUXT_PUBLIC_UPLOAD_WITH_BUILD_APK=${NUXT_PUBLIC_UPLOAD_WITH_BUILD_APK}

LABEL org.opencontainers.image.title="DistApp"
LABEL org.opencontainers.image.description="Manage and distribute Android, iOS and Desktop apps"
LABEL org.opencontainers.image.authors="Yunus"
LABEL org.opencontainers.image.url="https://distapp.app"
LABEL org.opencontainers.image.source="https://github.com/yunusefendi52/distapp"
LABEL org.opencontainers.image.licenses="https://github.com/yunusefendi52/distapp/blob/main/LICENSE-hosting.txt"

ENTRYPOINT [ "bun", "run", "server/index.mjs" ]
