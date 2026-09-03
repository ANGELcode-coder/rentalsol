# SMOOTH — API Contract (Phase 1 MVP)

Shared contract for **Backend (Express)**, **Frontend (React)**, and **Mobile (Flutter)** to build against the same shapes in parallel.

## Conventions
- Base URL: `/api/v1`
- **Auth:** `Authorization: Bearer <jwt>` for protected routes.
- **Roles:** `client`, `owner`, `agent`, `provider`, `employer`, `admin`.
- **Responses:** uniform envelope → `{ success: true, data, message?, meta? }` or `{ success: false, error: { code, message, fields? } }`.
- **Pagination:** request `?page=1&limit=10` → `meta: { page, limit, total, pages }`.
- **Search:** `?q=` (keyword over title/city/description).
- **Dates:** ISO 8601. **Money:** integers in FCFA (no decimals).
- **Language:** accept `Accept-Language: en|fr` where applicable.

---

## 1. Auth

### POST /auth/register
Body: `{ name, email, phone, password, role }` (role ∈ client|owner|agent|provider|employer)
Res 201: `{ token, user }`

### POST /auth/login
Body: `{ email, password }`
Res 200: `{ token, user }`

### POST /auth/forgot-password
Body: `{ email }` → 200 `{ message }`

### POST /auth/reset-password
Body: `{ token, newPassword }` → 200

### GET /auth/me *(auth)*
Res 200: `{ user }`

---

## 2. Users

### GET /users/me *(auth)*
Res 200: `{ user }`

### PUT /users/me *(auth)*
Body: `{ name?, phone?, avatar?, language?, notifications? }`
Res 200: `{ user }`

### Admin
- `GET /admin/users?role=&status=` → `{ users[], meta }`
- `PUT /admin/users/:id/status` — body `{ status: active|suspended }`
- `PUT /admin/users/:id/verify` — body `{ verified, badge }`

---

## 3. Listings

### GET /listings (public, paginated)
Query: `q, city, neighbourhood, type, status(rent|sale|short|long), category, minPrice, maxPrice, minBeds, maxBeds, amenities[], featured, verified, sort(rent|newest|price_asc|price_desc), page, limit`
Res: `{ listings[], meta }`

### GET /listings/:id (public)
Res 200: `{ listing, owner }`

### POST /listings *(owner|agent)*
Body: `{ title, description, category, status, type, address, city, neighbourhood, size, bedrooms, bathrooms, amenities[], photos[], videos[], floorPlan, rent|price }`
Res 201: `{ listing }`

### PUT /listings/:id *(owner|agent of that listing)*
Body: partial of above → 200 `{ listing }`

### DELETE /listings/:id *(owner|agent)*
Res 200 `{ message }`

### POST /listings/:id/enquiry *(public)*
Body: `{ channel: whatsapp|phone|form, whatsappNumber?, phone?, message? }`
Res 201: `{ enquiry, contactInfo }`

### Owner stats
`GET /listings/mine/stats` *(owner|agent)* → `{ total, active, rented, views, leads }`

### Admin moderation
- `PUT /admin/listings/:id/status` — `{ status: pending|active|suspended|removed }`
- `PUT /admin/listings/:id/verify` — `{ verified: bool }`

---

## 4. Services & Providers

### GET /services/categories (public)
Res: `{ categories: [{ key, labelEn, labelFr, icon }] }` — cleaning, caregiving, chef, driver, errand, travel, admin, bills

### GET /services/providers (public, paginated)
Query: `type, city, verified, minRating, page, limit`
Res: `{ providers[], meta }`

### GET /services/providers/:id (public)
Res: `{ provider }`

### POST /services/providers *(provider)*
Body: `{ type, skills[], experience, availability[], serviceAreas[], languages[], pricing, references[], bio }`
Res 201: `{ provider }`

### PUT /services/providers/me *(provider)*
Body: partial → 200 `{ provider }`

---

## 5. Bookings

### POST /bookings *(client)*
Body: `{ serviceType, providerId?, listingId?, location, city, date, time, duration?, requirements, price }`
Res 201: `{ booking, ref, paymentIntent? }` — ref e.g. `SM-XXXXXX`

### GET /bookings/:ref *(owner of booking)*
Res 200: `{ booking }`

### GET /bookings/mine *(client)* — list & track
Query: `status, page, limit`

### GET /bookings/providers/mine *(provider)*
Query: `status, page, limit`

### PUT /bookings/:ref/status
Roles & transitions:
- provider/owner: `under_review`, `assigned`, `confirmed`, `in_progress`, `completed`, `cancelled`
- client: `cancelled`
Body: `{ status }` → 200 `{ booking }`

Status enum: `submitted → under_review → assigned → confirmed → in_progress → completed`, any → `cancelled`.

---

## 6. Concierge

### POST /concierge *(client)*
Body: `{ type: errand|delivery|airport|admin|travel|bill, details, location, date, time, cost }`
Res 201: `{ request, ref }`

### GET /concierge/mine *(client)* — list & track; query `status, page, limit`
### GET /concierge/providers/mine *(provider)*
### PUT /concierge/:ref/status *(admin|provider)*
Body `{ status, assigneeId? }` (same status enum as bookings)

---

## 7. Jobs

### GET /jobs (public, paginated)
Query: `q, category, location, type, status, page, limit`
Res: `{ jobs[], meta }`

### GET /jobs/:id (public)
Res: `{ job, employer }`

### POST /jobs *(employer)*
Body: `{ title, category, location, description, requirements, type, salary, featured }`
Res 201: `{ job }`

### PUT /jobs/:id, DELETE /jobs/:id *(employer of that job)*

### POST /jobs/:id/apply *(seeker)*
Body (multipart): `cv: File, certificates?: File[], message?`
Res 201: `{ application }`

### GET /jobs/mine/applications *(seeker)* — track
### GET /jobs/:id/applications *(employer)* — review candidates

---

## 8. Payments (MTN + Orange)

### POST /payments/initiate *(auth)*
Body: `{ provider: mtn|orange, amount, phone, bookingRef?, conciergeRef?, description }`
Res 201: `{ paymentRef, provider, status: pending, redirect? }`

### POST /payments/confirm *(auth)*
Body: `{ paymentRef, otp }` *(flows per provider gateway; adjust to actual gateway API)*
Res 200: `{ payment, status }`

### POST /payments/webhook *(provider → platform)*
Provider-signed callback; no auth.
Res 200: `{ received: true }`

### GET /payments/:ref *(auth)*
Res 200: `{ payment, receiptUrl? }`

### GET /payments/mine *(auth)* — query `page, limit`
### Admin
`GET /admin/payments?status=&provider=` → data for revenue/commissions/reports.

Status enum: `pending → processing → success | failed | refunded`.

---

## 9. Reviews

### POST /reviews *(auth, verified booking or purchase)*
Body: `{ targetType: listing|agent|provider|employer, targetId, rating(1-5), comment }`
Res 201: `{ review }`

### GET /reviews?targetType=&targetId= (public, paginated)
Res: `{ reviews[], meta, averageRating, count }`

### Admin moderation
`PUT /admin/reviews/:id/status` — `{ status: active|hidden }`

---

## 10. Notifications

### GET /notifications *(auth)* — query `page, limit`
Res: `{ notifications[], meta, unreadCount }`
Shape: `{ id, type, title, message, link, read, createdAt }`

### PUT /notifications/:id/read *(auth)*
### PUT /notifications/read-all *(auth)*

---

## 11. Support Tickets

### POST /tickets *(auth)*
Body: `{ subject, message, category }`
Res 201: `{ ticket, ref }`

### GET /tickets/mine *(auth)* — query `status, page, limit`
### PUT /tickets/:id/status *(admin)* — `{ status }`; reply via `POST /tickets/:id/reply`

---

## 12. Uploads

### POST /uploads (multipart) *(auth)*
Accept: irrelevant but interact with restricted mime types for images/videos/docs.
Body: `file: File`
Res 201: `{ url, publicId, type, size }`
- Public bucket: images/videos for listings & profiles.
- **Private bucket:** identity/CV documents (KYC, passport, certificates) — never served from public URLs.

---

## 13. Admin Dashboard

- `GET /admin/stats` → `{ users, listings, providers, bookings, revenue, commissions, jobs, applications, concierge, transactions, complaints }`
- `GET /admin/reports?range=weekly|monthly` → CSV/JSON.

---

## Error Codes (subset)
| Code | Meaning |
|------|---------|
| UNAUTHORIZED | missing/invalid token |
| FORBIDDEN | role not permitted |
| NOT_FOUND | resource missing |
| VALIDATION | bad input (`fields` detail) |
| CONFLICT | e.g. duplicate email, listing with active booking |
| RATE_LIMITED | too many requests |
| PAYMENT_FAILED | transaction declined/expired |

---

## Versioning & Change Control
- Additive changes only within `v1`.
- Any breaking change → bump to `v2` and document migration.
- Update this file first, then announce on Trello so BE/FE/Mobile stay in sync.
