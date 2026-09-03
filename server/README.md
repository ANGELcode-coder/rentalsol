# SMOOTH Server (Express + MongoDB)

REST API backend. See `../docs/API.md` for the shared contract.

## Setup
```bash
npm install
cp .env.example .env      # configure MONGODB_URI, JWT_SECRET
npm run seed              # optional: load sample data
npm run dev               # start with auto-reload
```

## Scripts
| Command | Description |
|---------|-------------|
| `npm run dev`  | start dev server (watch) |
| `npm start`    | start server |
| `npm run seed` | seed sample data |
| `npm test`     | run tests |

## Layout
```
src/
├── config/       # env & app config
├── models/       # Mongoose schemas (see API.md entities)
├── routes/       # endpoint routers
├── controllers/  # request handlers
├── middleware/   # auth, RBAC, validation, errors
├── utils/        # helpers (jwt, ref generation, response envelope)
├── seed/         # sample data loader
└── index.js      # app entry
```

Refer to `../docs/TRELLO.md` (DB-* and BE-* cards) for what to implement.
