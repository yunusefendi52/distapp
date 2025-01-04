FROM oven/bun:1.1.42

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openjdk-11-jre-headless

RUN apt-get install -y unzip
RUN apt-get install -y curl

ARG DISTAPP_BUNDLETOOL_PATH=/app/bundletool.jar
ENV DISTAPP_BUNDLETOOL_PATH=${DISTAPP_BUNDLETOOL_PATH}

RUN [ -f ${DISTAPP_BUNDLETOOL_PATH} ] || curl -L -o ${DISTAPP_BUNDLETOOL_PATH} "https://github.com/google/bundletool/releases/download/1.17.2/bundletool-all-1.17.2.jar"

COPY dist/distapp-headless.js .

EXPOSE 3010

CMD ["bun", "distapp-headless.js"]
