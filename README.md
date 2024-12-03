## DistApp

Distribute Android and iOS app. Alternative App Center Distribution with option to self-hosted your self

```
Still in development, see roadmap
```

### Roadmap
- [x] API Key
- [x] Manage user access
- [x] Manage groups
- [ ] Auto convert aab to apk

### Screenshots

[See here](./screenshots)

## Setup

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

### CLI Usage

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