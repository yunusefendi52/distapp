## DistApp

Distribute Android and iOS app. Alternative App Center Distribution with option to self-hosted your self

![Deploy](https://github.com/yunusefendi52/distapp/actions/workflows/deploy.yml/badge.svg)


## Docs

See docs https://docs-distapp.lhf.my.id

## Self Hosting

See https://docs-distapp.lhf.my.id/self-hosted/setup-self-hosted

## CLI Usage

```sh
curl -Ls "https://github.com/yunusefendi52/distapp/raw/refs/heads/main/cli/cli.sh" | sh -s -- --distribute \
--file "$FILE_TO_ARTIFACT" \
--slug "$APP_SLUG" \
--apiKey "$API_KEY"
```

- `$FILE_TO_ARTIFACT` Can be apk, aab or ipa
- `$APP_SLUG` Is a combination of org and app name, e.g `yedev/habit-tool`. You can copy slug in `App Settings` -> `App Info`
- `$API_KEY` Add your API Key, created in `App Settings` -> `API Keys`

*node is required (tested on 20.17.0)*

See for more https://docs-distapp.lhf.my.id/cli/get-started-cli

## Setup Dev

#### Ensure you have the required .env

See `docker-compose.env` in the repo

#### Make sure to install the dependencies:

```bash
bun install
```

#### Development Server

```bash
bun run dev
```
