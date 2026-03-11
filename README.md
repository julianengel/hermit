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
ANSWER_OVERFLOW_API_KEY="your-answer-overflow-api-key"
ANSWER_OVERFLOW_API_BASE_URL="https://www.answeroverflow.com"
HELPER_THREAD_WELCOME_PARENT_ID="123456789012345678"
HELPER_THREAD_WELCOME_TEMPLATE="Welcome to helpers. Please include expected vs actual behavior, what you already tried, and relevant logs/code."
THREAD_LENGTH_CHECK_INTERVAL_HOURS="2"
DB_PATH="data/hermit.sqlite"
HELPER_LOGS_HOST="127.0.0.1"
HELPER_LOGS_PORT="8787"
```

2. Install dependencies:
```bash
bun install
```

3. Apply database migrations:
```bash
bun run db:migrate
```

4. Start the development server:
```bash
bun run dev
```

## Commands

- `/github` - Look up an issue or PR (defaults to openclaw/hermit)
- `Solved (Mod)` - Moderator-only message context menu item that marks the current thread as solved in Answer Overflow
- `/helper warn-new-thread` - Post a helper-channel warning for long threads
- `/helper close` - Post a close notice and archive/lock the current thread
- `/helper close-thread` - Post a close notice and archive/lock the current thread

Hermit sends a welcome message for every newly created thread under the configured helper parent channel (`HELPER_THREAD_WELCOME_PARENT_ID`).

Hermit also registers those welcome threads directly in SQLite before posting the welcome message. Registration failures are logged but do not block the Discord welcome message.

## Thread Length Monitoring

Hermit now owns both the thread-length policy and the SQLite persistence layer.

When `THREAD_LENGTH_CHECK_INTERVAL_HOURS` is set to a positive number, Hermit starts a background polling loop on startup that:

- requests active tracked threads from SQLite
- fetches each Discord thread directly
- checks whether the thread is already archived or locked
- sends warning messages or auto-closes the thread based on live Discord message counts
- writes the latest thread state back to SQLite

Thresholds:

- more than `100` messages: first warning
- more than `150` messages: second warning asking users to close solved threads and move new issues to a new thread
- more than `200` messages: automatic close notice, then archive + lock

Messages are stored in git-tracked files:

- `src/config/threadLengthMessages.ts`

Hermit tracks the following persisted fields for each thread:

- `threadId`
- `createdAt`
- `lastChecked`
- `solved`
- `warningLevel`
- `closed`
- `lastMessageCount`

Notes:

- If `THREAD_LENGTH_CHECK_INTERVAL_HOURS` is unset, the poller stays disabled.
- Threads that are already archived or locked are marked as closed in SQLite state and skipped on future passes.

## Helper Logs API

Hermit starts a local Bun HTTP server for the former `helper-logs` functionality. By default it listens on `http://127.0.0.1:8787`.

Available routes:

- `GET /` dashboard UI
- `GET /api/events` browse normalized event rows
- `GET /api/threads` browse tracked-thread rows

Set `HELPER_LOGS_PORT=0` to disable the local helper logs server entirely.

## Gateway Events

The bot listens for the following Gateway events:
- AutoModeration Action Execution - Sends keyword-based responses

## AutoMod Responses

Edit `src/config/automod-messages.json` to map keywords to messages. Use `{user}` to mention the triggering user.

## License

MIT
