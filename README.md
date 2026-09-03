# SMOOTH

Cameroon's All-in-One Living, Services & Lifestyle Platform.

> **From finding your home to getting things done, we take care of it all.**
> « Du logement jusqu'aux démarches, nous nous occupons de tout. »

## Modules
- **Property** — buy / rent / short & long-term / commercial / land
- **Home Services** — cleaning, caregiving, house chefs
- **Concierge** — errands, delivery, airport services
- **Administration** — documents, NGO registration, bills, travel
- **Jobs** — employers & job seekers

## Tech Stack
- **Backend / API:** Node.js, Express, MongoDB (MERN)
- **Web Frontend:** React
- **Mobile App:** Flutter
- **Payments:** MTN Mobile Money, Orange Money
- **Contact:** WhatsApp + Phone

## Monorepo (Phase 1 MVP)
```
smooth/
├── server/   # Node.js + Express REST API (MERN backend)
├── web/      # React frontend (mobile-first, bilingual)
├── mobile/   # Flutter app (Android + iOS)
└── docs/     # SRS.md (spec), API.md (contract), TRELLO.md (board)
```
Requires: Node.js >= 18, MongoDB, Flutter SDK.

--- 

## Docs
- Full spec: [`docs/SRS.md`](docs/SRS.md)
- API contract: [`docs/API.md`](docs/API.md)
- Task breakdown: [`docs/TRELLO.md`](docs/TRELLO.md)
