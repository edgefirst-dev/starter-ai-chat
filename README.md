# Edge-first Starter AI Chat

This is an Edge-first AI Chat app similar to ChatGPT but using Cloudflare Development Platform.

## Setup

To setup create a new D1, KV and R2, all named `ai-chat` then in `wrangler.toml` update the id for D1 and KV.

Then run your DB migrations with `bun run db:migrate:locaal ai-chat`.

Finally on GitHub create the secrets

- `CLOUDFLARE_API_TOKEN` with your Cloudflare API token
- `CLOUDFLARE_ACCOUNT_ID` with your Cloudflare account ID
- `CLOUDFLARE_DATABASE_NAME` with the name `ai-chat`

And in `.dev.vars` add:

```txt
APP_ENV="development"

CLOUDFLARE_ACCOUNT_ID=""
CLOUDFLARE_DATABASE_ID=""
CLOUDFLARE_API_TOKEN=""

GRAVATAR_API_TOKEN=""

VERIFIER_API_KEY=""
```

## Author

- [Sergio Xalambrí](https://sergiodxa.com)
