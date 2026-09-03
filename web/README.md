# SMOOTH Web (React + Vite)

Web frontend, mobile-first and bilingual (EN/FR). Consumes the API in `../server` (see `../docs/API.md`).

## Setup
```bash
npm install
npm run dev      # start dev server (port 3000, proxies /api to :5000)
```

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev`     | dev server with HMR |
| `npm run build`   | production build |
| `npm run preview` | preview build |
| `npm run lint`    | lint |

## Layout
```
src/
├── components/   # reusable UI
├── pages/        # route views
├── services/     # api client
├── hooks/        # custom hooks
└── assets/       # styles/css
```

Refer to `../docs/TRELLO.md` (FE-* cards) for what to implement.
