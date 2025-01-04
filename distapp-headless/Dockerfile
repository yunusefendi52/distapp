FROM oven/bun:1.1.42

WORKDIR /app

RUN apt-get update && \
    apt-get install -y openjdk-11-jre-headless

RUN apt-get install -y unzip

COPY dist/distapp-headless.js .

EXPOSE 3010

CMD ["bun", "distapp-headless.js"]
