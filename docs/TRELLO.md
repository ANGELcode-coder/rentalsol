# SMOOTH — Trello Board Breakdown (Phase 1 MVP)

Split by **Backend**, **Database**, **Frontend**, **Mobile**. Each card = one scoped, independently completable task. Create these as cards on the Trello board. Two developers pick their own cards.

Team collaboration rules:
- **Backend + Database** must land before **Frontend + Mobile** can consume those APIs.
- Agree on the **API contract / endpoint signatures first** (see `docs/API.md` once created) so both sides build in parallel.
- Each person self-assigns; don't take a card someone else is already on.

---

## LIST 1 — DATABASE (MongoDB schema & seed)
> Prereq for Backend. Models mirror `docs/SRS.md §5`.

- [DB-1] Define & create MongoDB **User** model (role enum, verification flags, private KYC docs).
- [DB-2] Define & create **Listing** model (categories, amenities, status, verified flag).
- [DB-3] Define & create **ServiceProvider** model (type, skills, availability, pricing, verified).
- [DB-4] Define & create **ServiceBooking** model (ref, status lifecycle, payment ref).
- [DB-5] Define & create **ConciergeRequest** model (types, assignee, status).
- [DB-6] Define & create **Job / JobApplication** model.
- [DB-7] Define & create **Payment** model (provider: MTN/Orange, status, transactionId).
- [DB-8] Define & create **Review**, **Notification**, **Enquiry/Lead**, **SupportTicket** models.
- [DB-9] Build **seed script** with sample Douala/Yaoundé listings, providers, jobs.
- [DB-10] Indexes on hot query fields (city, price, status, createdAt) + data validation rules.
- [DB-11] Write DB layer / repository access functions used by backend routes.

---

## LIST 2 — BACKEND (Express REST API)
> Depends on Database. Must expose stable API contract.

- [BE-1] Express server scaffold, env config, MongoDB connection, CORS, error handling.
- [BE-2] **Auth**: register (role-based), login, JWT, password hash, `/me`, password reset.
- [BE-3] **RBAC middleware** (client/owner/agent/provider/employer/admin).
- [BE-4] **Users API**: profile get/update, verify flags, suspend (admin).
- [BE-5] **Listings API**: CRUD, search/filters, detail, enquiry/lead create.
- [BE-6] **Listings moderation** (admin approve/reject/suspend) + verified badge.
- [BE-7] **Services API**: categories, providers CRUD, availability, request flow.
- [BE-8] **Bookings API**: create (ref generation), status lifecycle, provider accept/reject.
- [BE-9] **Concierge API**: request CRUD, assignee assignment, status tracking.
- [BE-10] **Jobs API**: post vacancy (employer), apply (seeker, with CV/cert upload), list/track.
- [BE-11] **Payments API**: MTN Mobile Money + Orange Money initiation, **webhooks**, receipts, refund records.
- [BE-12] **Reviews API**: create, list, verified-booking flag, moderation (admin).
- [BE-13] **Notifications API**: list, unread count, mark-read; email/SMS/WhatsApp hooks.
- [BE-14] **Support/tickets API**: submit, track, resolve (admin).
- [BE-15] **Admin dashboard API**: stats (users/listings/revenue/commissions/bookings), reports.
- [BE-16] **Image/video/file upload** handling (cloud storage CDN) + secure doc storage (never public).
- [BE-17] Security hardening: input validation, rate limiting, OWASP protections, audits.
- [BE-18] Seed a shared **API docs** (Postman/OpenAPI) for the team contract.

---

## LIST 3 — FRONTEND (React web)
> Consumes Backend. Mobile-first, bilingual (EN/FR).

- [FE-1] React scaffold (Vite/CRA), routing, state mgmt, Axios/Fetch client.
- [FE-2] **i18n setup** (EN/FR) + language switcher + extendable architecture.
- [FE-3] Design system: colors (deep green/brown/gold), typography, components, theme.
- [FE-4] **Auth UI**: register (role select), login, logout, profile, password reset.
- [FE-5] **Homepage**: hero, service icons, concierge CTA, diaspora section, WhatsApp button.
- [FE-6] **Listing feed**: search + filters (city, type, price, beds, amenities).
- [FE-7] **Listing detail**: gallery, amenities, map, agent + WhatsApp/phone contact.
- [FE-8] **Owner/Agent dashboard**: create/edit listings, photos/videos, availability, leads, stats.
- [FE-9] **Service provider dashboard**: profile, services, availability, bookings, earnings.
- [FE-10] **Booking/request flow**: service → location → date/time → requirements → price → payment → ref.
- [FE-11] **Payment UI**: MTN + Orange prompts, confirmations, receipts, tracking.
- [FE-12] **Concierge request form** + tracking with status.
- [FE-13] **Job board**: search, detail, apply (CV upload), employer post/manage.
- [FE-14] **User dashboard**: bookings, requests, messages, payments, saved, reviews.
- [FE-15] **Notifications** UI + unread badge.
- [FE-16] **Admin dashboard** UI (stats, moderation, users, listings, commissions).
- [FE-17] **WhatsApp floating button** + phone contact components.
- [FE-18] SEO: titles, meta, structured data, sitemap, robots, EN+FR pages.
- [FE-19] Performance: lazy loading, image compression/optimization.

---

## LIST 4 — MOBILE APP (Flutter)
> Consumes same Backend. Reuses backend contract. Mobile-first.

- [MO-1] Flutter scaffold, routing, state mgmt, API client, env config.
- [MO-2] i18n (EN/FR) + locale switch.
- [MO-3] Design system + theme matching web branding.
- [MO-4] Auth screens (register w/ role, login, profile, reset).
- [MO-5] Home screen: service categories, search bar, WhatsApp button.
- [MO-6] Listing feed + filters + list/detail screens.
- [MO-7] Booking/request flow + status tracking with reference.
- [MO-8] Payment integration (MTN + Orange) + confirmations/receipts.
- [MO-9] Concierge request + tracking.
- [MO-10] Job board: browse, apply (CV upload), employer post/manage.
- [MO-11] Notifications + deep links.
- [MO-12] WhatsApp integration + phone dial.
- [MO-13] Profiles & dashboards (client/provider/owner).
- [MO-14] Admin app screens (optional — could be web-only for v1).
- [MO-15] Performance: fast image loading, low-bandwidth optimization.

---

## LIST 5 — INTEGRATION & QA (shared / by module owner)
- [QA-1] API contract review + versioning.
- [QA-2] Payments end-to-end test (MTN/Orange sandbox).
- [QA-3] Bilingual accuracy pass (EN/FR).
- [QA-4] Responsive + device testing (web + Flutter).
- [QA-5] Security review (auth, role access, uploads, payments).
- [QA-6] Performance / low-bandwidth pass.
- [QA-7] End-to-end user-acceptance flows (per SRS §10 success criteria).
- [QA-8] Deployment: hosting, SSL, DB, email, analytics, SEO, backups.
- [QA-9] Admin training + documentation + credentials handover.

---

## Suggested first-sprint split (so nobody blocks anyone)
1. **Developer A starts:** DB-1..DB-11 → then BE-1..BE-9.
2. **Developer B starts:** FE-1..FE-5 (using mock/seed data) → FE-6..FE-19.
3. **Once backend is ready:** developer B wires FE to BE; developer A moves to BE-10..BE-18.
4. **Mobile (Flutter):** can be picked up by whoever finishes early, or split — one does auth/home, other does listings/booking (reusing same API contract).

**Shared API contract:** `docs/API.md` — Backend, Frontend, and Mobile must build against this first. Any change → update API.md + announce on Trello.
