# SMOOTH — Technical Documentation

Technical reference for the SMOOTH platform: architecture, database design, and implementation status. Pairs with `SRS.md` (what we build) and `API.md` (the API contract).

---

## 1. System Architecture

**Monorepo layout:**
```
smooth/
├── server/   # Node.js + Express + MongoDB REST API (MERN backend)
├── web/      # React frontend (mobile-first, bilingual EN/FR)
├── mobile/   # Flutter app (Android + iOS)
├── docs/     # SRS.md, API.md, TRELLO.md, TECH.md (this file)
└── scripts/  # trello-create-board.mjs
```

- **API**: REST, base `/api/v1`, Express + Mongoose.
- **Database**: MongoDB (document store), collection `smooth`.
- **Mobile + Web share the same backend/API contract** (`docs/API.md`).
- **Payments**: MTN Mobile Money + Orange Money (in-app).
- **Contact**: WhatsApp + phone calling.

---

## 2. Database Design (MongoDB)

**12 collections**, wired by ObjectId references. `User` is the hub for all roles.

```
┌─────────────┐     ┌──────────────┐
│   User      │◄────┤  Listing     │  ownerId (owner/agent)
│ (all roles) │     ├──────────────┤
│             │     │ ServiceProvider│  userId
│             │◄────┤              │
└──┬──────┬──┘     └──────┬───────┘
   │      │               │
   │   ┌──▼────────────┐  │
   │   │ Listing (owner)│ │
   │   │ Booking (cust) │ │
   │   │ Concierge(user)│ │
   │   │ JobApp (seeker)│ │
   │   │ Payment(user)  │ │
   │   │ Review(user)   │ │
   │   │ Notification   │ │
   │   │ Ticket(user)   │ │
   └───┴────────────────┘ │
                          ▼
              ┌──────────────────────┐
              │  ServiceBooking       │  customerId → User
              │                       │  providerId → ServiceProvider
              │  ConciergeRequest     │  userId → User, assigneeId → Provider
              │  Payment              │  bookingRef / conciergeRef (string refs)
              │  Job / JobApplication │  employerId / seekerId → User
              │  Review (polymorphic) │  targetId + targetModel
              │  Enquiry              │  listingId → Listing, userId → User
              │  Notification         │  userId → User
              │  SupportTicket        │  userId → User
              └──────────────────────┘
```

### 2.1 Entity reference

| Model (file) | Purpose | Key relationships |
|---|---|---|
| **User** | All roles (client/owner/agent/provider/employer/admin) | referenced by most collections |
| **Listing** | Properties for rent/sale/short/long, 13 categories | `ownerId → User`; enquiry `listingId` |
| **ServiceProvider** | Provider profiles (janitor/caregiver/chef/driver/errand/...) | `userId → User`; bookings `providerId` |
| **ServiceBooking** | Unified service booking with status lifecycle | `customerId → User`, `providerId → ServiceProvider` |
| **ConciergeRequest** | Errands/delivery/airport/admin/travel/bill | `userId → User`, `assigneeId → ServiceProvider` |
| **Job** | Vacancies posted by employers | `employerId → User`; applications `jobId` |
| **JobApplication** | Applications with CV/certs | `jobId → Job`, `seekerId → User` (unique pair) |
| **Payment** | MTN/Orange payments + webhooks/refunds | `userId → User`, links via `bookingRef`/`conciergeRef` (string refs) |
| **Review** | Polymorphic ratings/reviews | `targetId` + `targetModel` (`Listing`/`ServiceProvider`/`User`) |
| **Notification** | In-app (+email/SMS/WhatsApp later) | `userId → User` |
| **Enquiry** | Listing contact/leads (whatsapp/phone/form) | `listingId → Listing`, `userId → User` |
| **SupportTicket** | Complaints/questions/refunds | `userId → User`, threaded messages |

### 2.2 Key design decisions

1. **Money = integers in XAF** — no floating-point currency bugs. `currency` field default `XAF`.
2. **Human-readable refs**: `SM-`, `BOK-`, `CON-`, `PAY-`, `TCK-` prefixes generated in `utils/generateRef.js`.
3. **Unified request status lifecycle** (shared in `config/constants.js`):
   `submitted → under_review → assigned → confirmed → in_progress → completed`, any → `cancelled`.
4. **Security-first fields**: `passwordHash`, `resetPasswordToken`, and `kycDocs` use `select: false`; stripped in `toJSON`, so they never leak in API responses. KYC docs stored privately (never public URLs/CDN).
5. **Indexes on hot query paths**: email unique, listing (city/status/state, price, createdAt, 2dsphere for geo), booking (customer/provider/status/date), payment (user/status/provider), job apps unique `(jobId, seekerId)`, reviews unique `(targetType, targetId, userId)`.
6. **Single source of truth for enums** in `config/constants.js` — shared across models and validation.

### 2.3 Status enums (reference)

| Domain | Values |
|---|---|
| User roles | `client, owner, agent, provider, employer, admin` |
| User status | `active, suspended, pending` |
| Listing status | `rent, sale, short, long` |
| Listing state | `pending, active, suspended, removed` |
| Request/booking status | `submitted, under_review, assigned, confirmed, in_progress, completed, cancelled` |
| Payment status | `pending, processing, success, failed, refunded` |
| Payment provider | `mtn, orange` |
| Booking payment | `unpaid, pending, paid, refunded` |
| Job status | `active, closed` |
| Application status | `pending, reviewed, shortlisted, rejected, accepted` |
| Review status | `active, hidden` |
| Ticket status | `open, in_progress, resolved, closed` |

---

## 3. Implementation Status

| Module | Status | Files |
|---|---|---|
| **Database models** | ✅ COMPLETE (Trello DB-1..DB-11 in DONE) | `server/src/models/*.js`, `config/constants.js`, `utils/generateRef.js`, `seed/seed.js` |
| Backend API | ⬜ Pending (BE-1..BE-18) | `server/src/routes|controllers|middleware/` |
| Web frontend | ⬜ Pending (FE-1..FE-19) | `web/src/` |
| Mobile app | ⬜ Pending (MO-1..MO-15) | `mobile/lib/` |
| Integration & QA | ⬜ Pending (QA-1..QA-9) | — |

### Verified
- ✅ Server boots (Express on :5000, graceful when Mongo offline).
- ✅ 12 models import & compile (`model.init()` clean).
- ✅ Web production build passes (`npm run build`).
- ✅ Dependencies: express, mongoose@9, cors, dotenv, bcryptjs.

---

## 4. Getting Started (dev)

```bash
# Server
cd server
npm install
cp .env.example .env     # set MONGODB_URI, JWT_SECRET
npm run seed             # load sample data
npm run dev              # start API on :5000

# Web
cd web
npm install
npm run dev              # start on :3000, proxies /api -> :5000

# Mobile (Flutter)
cd mobile
flutter pub get
flutter run
```

**Seed accounts** (password for all: `Password123!`):
- admin@smooth.cm / owner@smooth.cm / owner (2nd) / agent@smooth.cm / client@smooth.cm / client (2nd) / provider (3x) / employer@smooth.cm / seeker@smooth.cm
- Sample data: 4 listings (Douala/Yaoundé/Buea), 3 providers, 2 bookings, 2 concierge requests, 2 jobs + 1 application, 1 payment, 2 reviews, notifications, enquiries, tickets.

---

## 5. Team Workflow Notes (Trello)

Board: `https://trello.com/b/5WXH30Mr` (lists: Database, Backend, Frontend, Mobile, Integration & QA, ✅ DONE).
- Both devs self-assign cards; ⚠️ never duplicate an in-progress card.
- Backend contract is `docs/API.md` — any change: update API.md + announce on Trello.
- Database layer is done → Backend (BE-1..BE-18) is the current active front-runner (BE-1..BE-9 = API core + main marketplaces; BE-10..BE-18 = jobs/payments/reviews/notifications/security/upload).