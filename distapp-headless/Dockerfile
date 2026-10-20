FROM eclipse-temurin:25-jre

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
ARG BUN_VERSION=1.2.8
ARG BUN_SHA256_AMD64=1d48ae3f4649d281b14efd723e49b69a44e5da9a8d7341d611a3ea58ec478ec1
ARG BUN_SHA256_ARM64=23083f256f2a1d155c456e12e39c51e31dc41b97c63420d9915f43bb86abeab1
RUN set -eu; \
    case "$(dpkg --print-architecture)" in \
        amd64) \
            BUN_ARCH="x64-baseline"; \
            BUN_SHA256="${BUN_SHA256_AMD64}"; \
            ;; \
        arm64) \
            BUN_ARCH="aarch64"; \
            BUN_SHA256="${BUN_SHA256_ARM64}"; \
            ;; \
        *) \
            echo "Unsupported architecture" >&2; \
            exit 1; \
            ;; \
    esac; \
    curl -fsSL \
        "https://github.com/oven-sh/bun/releases/download/bun-v${BUN_VERSION}/bun-linux-${BUN_ARCH}.zip" \
        -o /tmp/bun.zip; \
    echo "${BUN_SHA256}  /tmp/bun.zip" | sha256sum -c -; \
    unzip /tmp/bun.zip -d /tmp/bun; \
    install -m 755 "/tmp/bun/bun-linux-${BUN_ARCH}/bun" /usr/local/bin/bun; \
    rm -rf /tmp/bun /tmp/bun.zip; \
    bun --version

ARG DISTAPP_BUNDLETOOL_PATH=/app/bundletool.jar
ENV DISTAPP_BUNDLETOOL_PATH=${DISTAPP_BUNDLETOOL_PATH}

RUN [ -f ${DISTAPP_BUNDLETOOL_PATH} ] || curl -L -o ${DISTAPP_BUNDLETOOL_PATH} "https://github.com/google/bundletool/releases/download/1.18.3/bundletool-all-1.18.3.jar"

COPY src/keys/ src/keys/
COPY dist/distapp-headless.js .

EXPOSE 3010

CMD ["bun", "distapp-headless.js"]
