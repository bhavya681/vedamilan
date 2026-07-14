# Chat & Realtime (Module 8)

Mongo-backed messaging with optional Pusher fan-out.

## Features

- Thread create/list (`pairKey` unique per user pair)
- Text / image / voice message types
- Read receipts (`readBy`)
- Typing indicators (Pusher `typing` event)
- AI ice breakers (profile-contextual, not astrology invention)
- Private channel auth: `/api/pusher/auth`

## APIs

| Method   | Path                          | Purpose              |
| -------- | ----------------------------- | -------------------- |
| GET/POST | `/api/chats`                  | List / create chat   |
| GET/POST | `/api/chats/:chatId/messages` | List / send          |
| POST     | `/api/chats/:chatId/typing`   | Typing signal        |
| GET      | `/api/chats/ice-breakers`     | Suggested openers    |
| POST     | `/api/pusher/auth`            | Private channel auth |

## Env

```
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=ap2
NEXT_PUBLIC_PUSHER_KEY=
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

Without Pusher credentials, chat still works over HTTP (polling/refresh on send); realtime events are skipped safely.

## Wired pages

- `/dashboard/chat`
- `/dashboard/messages`
- Match profile **Message** button creates a chat
