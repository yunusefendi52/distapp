## DistApp

Distribute Android and iOS app. Alternative App Center Distribution with option to self-hosted your self

![Deploy](https://github.com/yunusefendi52/distapp/actions/workflows/deploy.yml/badge.svg) [![Docker Pulls](https://img.shields.io/docker/pulls/5yunus2efendi/distapp)](https://hub.docker.com/repository/docker/5yunus2efendi/distapp)


## Docs

See docs https://docs-distapp.lhf.my.id

## Self Hosting

See https://docs-distapp.lhf.my.id/self-hosted/setup-self-hosted for more.

## CLI Usage

We updated how to use CLI. See https://docs-distapp.lhf.my.id/cli/cli-usage#cli-usage

## Setup Dev

#### Ensure you have the required .env

Copy contents of [docker-compose-base.env](public/docker/docker-compose-base.env) and [docker-compose.env](public/docker/docker-compose.env) to `.env`

#### Make sure to install the dependencies:

```bash
bun install
```

#### Development Server

```bash
bun run dev
```
