# Software Requirements Specification (SRS)

## SMOOTH — Cameroon All-in-One Living, Services & Lifestyle Platform

| Field | Value |
|-------|-------|
| **Product Name** | SMOOTH |
| **Slogan (EN)** | "From finding your home to getting things done, we take care of it all." |
| **Slogan (FR)** | « Du logement jusqu'aux démarches, nous nous occupons de tout. » |
| **Version** | 1.0 (Draft) |
| **Date** | 2026-09-03 |
| **Platform** | Web (Responsive) + Mobile App |
| **Mobile Framework** | Flutter |
| **Tech Stack** | MERN (MongoDB, Express, React, Node.js) — Web/API; Flutter — Mobile |
| **Team** | 2 developers (shared breakdown into Trello tasks) |

**Core Promise:** *Find a home. Find trusted help. Get things done.*
**Positioning:** Cameroon's all-in-one living & lifestyle platform — PROPERTY | HOME SERVICES | CONCIERGE | ERRANDS | ADMINISTRATION | TRAVEL | JOBS

---

## 1. Introduction

### 1.1 Purpose
This document specifies the functional and non-functional requirements for **SMOOTH**, a web (React) and mobile (Flutter) platform connecting customers, property owners, agents, service providers, employers, and job seekers across Cameroon — and Cameroonians in the diaspora.

### 1.2 Scope — Core Modules
1. **Real Estate Marketplace** — buy, rent, short/long-term, commercial, land.
2. **Home & Living Services** — cleaning/janitorial, caregiving, house chefs/cooking.
3. **Concierge & Errands** — errands, delivery, airport transport, meet & greet.
4. **Travel & Ticketing Assistance** — reservations/coordination.
5. **Administrative & Document Assistance** — CNI, passport, documents, NGO registration support.
6. **Bill Payment Assistance** — ENEO, CAMWATER, MTN, Orange, internet.
7. **Job Marketplace** — vacancies, applications, CVs.
8. **Payments** — MTN Mobile Money + Orange Money in-app.

### 1.3 Definitions / Glossary
- **Client / Customer** — requests properties, services, errands, jobs.
- **Owner / Agent** — lists & manages properties.
- **Service Provider** — janitor, caregiver, chef, driver, errand runner.
- **Employer** — posts jobs, reviews applications.
- **Job Seeker** — applies to jobs.
- **Admin** — platform administrator.
- **Booking / Request** — a unified service/property request with unique reference.
- **Verification Badge** — trust marker (Verified Agent / Property / Provider / Employer).

### 1.4 User Roles
1. **Guest** — browse only.
2. **Client** — search/contact/book/request/pay/track/review.
3. **Property Owner / Agent** — create & manage listings, receive enquiries, manage leads.
4. **Service Provider** — profile, list services, availability, accept/reject bookings, track earnings.
5. **Employer** — post vacancies, review/contact applicants.
6. **Job Seeker** — profile, CV, apply, track.
7. **Administrator** — full control (users, listings, providers, bookings, payments, jobs, reviews, commissions, verification).

### 1.5 Operating Environment
- Backend: Node.js >= 18, MongoDB (Atlas/local).
- Web: React SPA (responsive, mobile-first).
- Mobile: Flutter — Android >= 8, iOS >= 14.
- Browsers: Chrome, Firefox, Safari, Edge.

---

## 2. Overall Description

### 2.1 Bilingual (Mandatory)
- Full **English** and **French** support, switchable from header/menu.
- Architecture must allow additional languages later.
- SEO optimization for both EN and FR pages.

### 2.2 Mobile-First
- Majority of users on smartphones; low-to-medium bandwidth.
- Fast loading, large buttons, easy navigation, WhatsApp contact, mobile-friendly booking & payment.

### 2.3 Trust & Verification
- Badges: ✓ Verified Agent, ✓ Verified Property, ✓ Verified Service Provider, ✓ Verified Employer.
- Admin approves/rejects/suspends listings, users, and providers; moderates reviews.

### 2.4 Payment
- In-app payments via **MTN Mobile Money** and **Orange Money**.
- Automatic confirmations, receipts, transaction references, refund records.
- Admin configures commissions; payment gateway architecture to be recommended (see §16).

---

## 3. Functional Requirements (FR)

### 3.1 Authentication & Accounts
- **FR-1.1** Guest registers as Client / Owner-Agent / Service Provider / Employer / Job Seeker (email + password; role-based).
- **FR-1.2** Login / logout; JWT session.
- **FR-1.3** Password reset via email.
- **FR-1.4** Edit profile (name, phone, email, avatar, language preference).
- **FR-1.5** Role-based access control (RBAC).
- **FR-1.6** (Suggestion) Two-factor authentication where appropriate.

### 3.2 Real Estate Module
- **FR-2.1** Listings for Rent / Sale / Short-term / Long-term.
- **FR-2.2** Categories: apartment, flat, studio, house, villa, duplex, furnished, guest house, commercial, office, shop, land, other.
- **FR-2.3** Search by city, neighbourhood, type, price range, bedrooms, bathrooms, amenities.
- **FR-2.4** Amenities: furnished, parking, security, water, electricity, generator, internet/Wi-Fi, pool, A/C; floor plan, video tour, map.
- **FR-2.5** Owner/Agent dashboard: create/edit/delete listings, upload photos/videos, prices, availability, enquiries, leads, statistics, promote listings.
- **FR-2.6** Verified Property badge for admin-approved listings.
- **FR-2.7** Contact via **WhatsApp**, **phone call**, or enquiry form (§3.7).
- **FR-2.8** Admin can approve/reject/suspend/remove listings.
- **FR-2.9** Initial cities: Douala, Yaoundé, Bamenda, Buea, Limbe, Bafoussam, Kribi + more.

### 3.3 Home & Living Services
- **FR-3.1** Cleaning/janitorial: general, office, deep, daily/weekly/monthly, post-construction, move-in/out, floor, windows, carpet, upholstery, kitchen, bathroom sanitation, waste management.
- **FR-3.2** Request service by location, date, time, type, property size, frequency, additional requirements.
- **FR-3.3** Caregiving: elderly care, childcare, home assistance, companion, household assistance; live-in or live-out.
- **FR-3.4** Caregiver profiles: experience, skills, availability, location, languages, references, verification status.
- **FR-3.5** House chefs / cooking: daily meals, family, private events, parties, weddings, corporate; profile with cuisine, experience, area, availability, pricing, sample photos.
- **FR-3.6** Provider dashboard to manage services, availability, accept/reject bookings, track earnings.

### 3.4 Concierge & Errands
- **FR-4.1** Task request submission: parcel pickup/delivery, document delivery, shopping/grocery, medicine (where legal), personal shopping, local deliveries.
- **FR-4.2** Airport services: pickup, drop-off, meet & greet, elderly/visitor assistance, airport-to-hotel coordination.
- **FR-4.3** "YOU REQUEST IT. WE HANDLE IT." — unified concierge request flow with tracking.

### 3.5 Travel & Ticketing / Administrative / Bills
- **FR-5.1** Travel: bus/train ticket assistance, domestic travel, airport transport, coordination; confirmation notifications.
- **FR-5.2** Administrative: CNI, passport application, birth certificate, document collection/delivery, legalization (legit only).
- **FR-5.3** **Compliance guardrail:** platform provides legitimate assistance/facilitation only; must NOT imply bypassing procedures, influencing officials, or guaranteeing approval. Strong privacy for sensitive documents (passports/IDs).
- **FR-5.4** NGO/Association registration assistance: documentation prep, application files, administrative follow-up, connect to qualified legal professionals; clearly distinguished from legal services.
- **FR-5.5** Bill payment assistance: ENEO, CAMWATER, MTN, Orange, internet; via secure authorized channels.

### 3.6 Job Marketplace
- **FR-6.1** Categories: hospitality, admin, sales, IT, construction, healthcare, domestic, security, transport, customer service, other.
- **FR-6.2** Employers: create profile, post vacancies, set requirements, receive applications, review CVs, contact candidates, close vacancies.
- **FR-6.3** Job seekers: profile, upload CV + certificates, search jobs, apply, save jobs, track applications.

### 3.7 Contact / Communication
- **FR-7.1** **WhatsApp** integration throughout: chat on WhatsApp, service enquiries, booking assistance, support, provider communication, floating WhatsApp button (web + candidate mobile).
- **FR-7.2** **Phone calling** as an alternative contact method (both supported).
- **FR-7.3** Enquiry/contact forms.
- **FR-7.4** Notifications: email, SMS where supported, WhatsApp where supported, in-app. Events: registration, booking, payment, provider assignment, reminders, completion, job application, new message, status update.

### 3.8 Booking / Request System
- **FR-8.1** Unified flow: Service → Location → Date → Time → Requirements → Price → Payment → Confirmation.
- **FR-8.2** Unique reference number per request.
- **FR-8.3** Status tracking: Request Submitted → Under Review → Provider Assigned → Confirmed → In Progress → Completed → Cancelled.

### 3.9 Payments (MTN + Orange)
- **FR-9.1** Pay in-app via MTN Mobile Money and Orange Money.
- **FR-9.2** Auto-generate: payment confirmations, booking receipts, transaction references, refund records.
- **FR-9.3** Reliable Cameroon payment gateway architecture must be recommended during planning.

### 3.10 Reviews & Trust
- **FR-10.1** Rate & review: properties, agents, janitors, caregivers, chefs, drivers, service providers.
- **FR-10.2** Star ratings, written reviews, verified-booking reviews, provider badges, complaint reporting.
- **FR-10.3** Admin moderates fake/abusive reviews.

### 3.11 Admin Dashboard
- **FR-11.1** Overview: total/active users, listings, pending listings, providers, pending verification, bookings (active/completed/cancelled), revenue, commissions, job postings, applications, concierge requests, transactions, complaints.
- **FR-11.2** Full control over users, listings, providers, bookings, payments, jobs, reviews, verification, content, reports, commissions, settings.
- **FR-11.3** Configurable commission/revenue models (activate/deactivate individually).
- **FR-11.4** Reporting & analytics.

### 3.12 Communications / Customer Support
- **FR-12.1** Support: submit complaints, questions, track tickets, report suspicious listings/providers, request refunds.
- **FR-12.2** Live chat / WhatsApp support.

---

## 4. Non-Functional Requirements (NFR)

- **NFR-1 Performance:** listings feed ~2s; API p95 < 500ms reads; optimize images (compress, serve responsive sizes) & video.
- **NFR-2 Security:** bcrypt password hashing; JWT; RBAC; SSL/HTTPS; secure payment processing; input validation; rate limiting; 2FA where appropriate; secure doc storage (never public folders for ID documents); DB encryption where appropriate; backups; audit logs; protect against OWASP common attacks; privacy controls; data deletion/export.
- **NFR-3 Usability:** mobile-first, intuitive flows (web + Flutter app).
- **NFR-4 Reliability:** high availability; graceful errors; low-bandwidth friendly.
- **NFR-5 Scalability:** stateless API, horizontal scaling; backend built to later power native apps.
- **NFR-6 Bilingual:** full EN/FR; switchable; extendable.
- **NFR-7 SEO:** SEO-friendly URLs, titles, meta descriptions, structured data, XML sitemap, robots.txt, image optimization, page speed, local SEO, heading structure; EN + FR.
- **NFR-8 Auditability:** admin actions logged.

---

## 5. Data Requirements / Entities

| Entity | Key Fields |
|--------|-----------|
| **User** | name, email, phone, passwordHash, role, avatar, language, verified, status, kycDocs[] (private), createdAt |
| **Listing** | ownerId, title, description, category, status(rent/sale/short/long), type, address, city, neighbourhood, size, bedrooms, bathrooms, amenities[], photos[], videos[], floorPlan, rent/price, verified, status, createdAt |
| **Enquiry / Lead** | listingId, userId, channel(whatsapp/phone/form), message, createdAt |
| **ServiceProvider** | userId, type(janitor/caregiver/chef/driver/errand), skills[], experience, availability[], serviceAreas[], languages[], pricing, references[], verified, earnings |
| **ServiceBooking** | ref, customerId, providerId, serviceType, location, date, time, requirements, price, paymentStatus, status, createdAt |
| **ConciergeRequest** | ref, userId, type(errand/delivery/airport/admin/travel/bill), details, location, assigneeId, status, createdAt |
| **Job** | employerId, title, category, location, description, requirements, type, salary, status(open/closed), featured |
| **JobApplication** | jobId, seekerId, cvUrl, certificates[], status, createdAt |
| **Payment** | ref, userId, provider(mtn/orange), amount, bookingRef, status, phone, transactionId, createdAt |
| **Review** | targetType, targetId, userId, rating, comment, verifiedBooking, status |
| **Notification** | userId, type, channel, title, message, link, read, createdAt |
| **Ticket** | userId, subject, message, status, resolution |

---

## 6. API Overview (REST) — high-level

| Area | Sample Endpoints |
|------|------------------|
| Auth | `/api/auth/register|login|me` |
| Users | `/api/users/me` |
| Listings | `/api/listings` CRUD, `/api/listings/:id`, search/filter, `/api/listings/:id/enquiry`, `/api/listings/verify` (admin) |
| Services | `/api/services`, `/api/services/categories`, providers CRUD, availability |
| Bookings | `/api/bookings`, `/api/bookings/:ref`, status updates |
| Concierge | `/api/concierge`, `/api/concierge/:id` |
| Admin/Documents | `/api/documents/requests`, `/api/travel`, `/api/bills` |
| Jobs | `/api/jobs`, `/api/jobs/:id/apply`, `/api/jobs/mine` |
| Payments | `/api/payments/mtn|orange`, `/api/payments/webhook`, `/api/payments/:ref` |
| Reviews | `/api/reviews` |
| Notifications | `/api/notifications` |
| Admin | `/api/admin/*` |

---

## 7. Revenue / Business Model
1. Property listing fees
2. Featured property promotions
3. Service booking commissions
4. Concierge/service fees
5. Delivery charges
6. Job posting fees
7. Featured job ads
8. Provider subscriptions
9. Business advertising
10. Premium accounts
11. Property management services
12. Corporate service packages
> Each model individually activatable/deactivatable by admin.

---

## 8. Development Phases (Risk-controlled)

**PHASE 1 — MVP**
Homepage, property marketplace + search, owner/agent accounts, service marketplace (cleaning + caregiving), concierge requests, job board, user accounts, WhatsApp contact, basic payments (MTN/Orange), admin dashboard.

**PHASE 2**
Advanced booking, more providers, reviews, provider subscriptions, advanced payment, property management tools, diaspora services.

**PHASE 3**
Mobile apps (Flutter), advanced analytics, AI recommendations, automated support, advanced logistics, corporate accounts, more payment options.

---

## 9. Deliverables / Milestones
1. **Discovery & Planning** — consultation, sitemap, user flows, DB architecture, feature spec, **payment gateway recommendation**.
2. **UI/UX** — wireframes, mobile + desktop designs, prototype, design system, **clickable prototype before full development**.
3. **Development** — frontend, backend, database, accounts, dashboards, marketplaces, booking, job board, payments, notifications, admin.
4. **Testing** — mobile, desktop, security, payment, performance, UAT.
5. **Launch** — domain, hosting, SSL, DB, email, analytics, SEO, backups.
6. **Training & Handover** — admin training, credentials, source code, docs.

---

## 10. Success Criteria
A user can easily: find a property → contact owner/agent (WhatsApp/phone) → book a service → request an errand → request admin assistance → arrange airport transport → search & apply for a job → pay securely (MTN/Orange) → track request → communicate via WhatsApp. All understandable by a first-time user.

---

## 11. Design Direction
- **Style:** Professional + Modern + African + Trustworthy + Premium + User-Friendly.
- **Colors:** Primary deep/forest green + earthy brown; secondary gold + warm neutrals; accent corporate red (sparingly, for important actions).
- **Visuals:** high-quality photography, clean icons, modern cards, clear typography, spacious layouts, strong CTAs, trust badges, simple nav, floating WhatsApp button.
- **Not** a traditional classified-ads look.

---

## 12. Out of Scope (initial / future decisions TBD)
- Live chat (WhatsApp serves this first).
- Full MLS integrations.
- (To confirm with team) e-signatures / leases.
