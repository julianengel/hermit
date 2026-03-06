# hermit

A Discord bot built with [Carbon](https://carbon.buape.com).

Repository: https://github.com/openclaw/hermit

## Setup

1. Create a `.env` file with the following variables:
```env
BASE_URL="your-base-url"
DEPLOY_SECRET="your-deploy-secret"
DISCORD_CLIENT_ID="your-client-id"
DISCORD_PUBLIC_KEY="discord-public-key"
DISCORD_BOT_TOKEN="your-bot-token"
HELPER_COMMAND_WEBHOOK_URL="https://your-worker.example.workers.dev"
HELPER_COMMAND_WEBHOOK_SECRET="your-shared-secret"
HELPER_THREAD_WELCOME_PARENT_ID="123456789012345678"
HELPER_THREAD_WELCOME_TEMPLATE="Welcome to helpers. Please include expected vs actual behavior, what you already tried, and relevant logs/code."
```

2. Install dependencies:
```bash
bun install
```

3. Start the development server:
```bash
bun run dev
```

## Commands

- `/github` - Look up an issue or PR (defaults to openclaw/hermit)
- `/helper warn-new-thread` - Post a helper-channel warning for long threads
- `/helper close` - Post a close notice and archive/lock the current thread
- `/helper close-thread` - Post a close notice and archive/lock the current thread

If `HELPER_COMMAND_WEBHOOK_SECRET` is set, Hermit sends it as the `x-helper-webhook-secret` header on helper webhook requests.

Hermit sends a welcome message for every newly created thread under the configured helper parent channel (`HELPER_THREAD_WELCOME_PARENT_ID`).

## Gateway Events

The bot listens for the following Gateway events:
- AutoModeration Action Execution - Sends keyword-based responses

## AutoMod Responses

Edit `src/config/automod-messages.json` to map keywords to messages. Use `{user}` to mention the triggering user.

## License

MIT
