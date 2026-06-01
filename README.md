# Railway Ticket Booking System

A full-featured railway ticket booking platform (similar to IRCTC) built with Spring Boot 3.2 and a **React frontend**, demonstrating distributed systems patterns at production scale.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Spring Boot 3.2.5, Java 17 |
| **Frontend** | React 19, Vite, TailwindCSS v4, shadcn/ui |
| **Database** | PostgreSQL 15 + Flyway migrations (V1–V8) |
| **Cache & Locking** | Redis 7 (distributed seat locks via Lua scripts, cache-aside, rate limiting) |
| **Search** | Elasticsearch 8 (CQRS read model, full-text station/train search) |
| **Messaging** | Apache Kafka (event choreography, retry topics, dead letter topics) |
| **Auth** | JWT (access + refresh tokens, role-based: USER / ADMIN) |
| **API Docs** | SpringDoc OpenAPI 3 (Swagger UI at `/swagger-ui.html`) |
| **Build** | Maven multi-module (7 modules) |
| **Infra** | Docker Compose (PostgreSQL, Redis, Kafka, Zookeeper, Elasticsearch, Kibana) |

## Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         railway-frontend                              │
│   React 19 + Vite + TailwindCSS + shadcn/ui                         │
│   Station autocomplete, Train search, Booking, Payment, PNR status   │
├──────────────────────────────────────────────────────────────────────┤
│                              REST API                                 │
├──────────────────────────────────────────────────────────────────────┤
│                    railway-app (Spring Boot main)                     │
│   Entry point, Security config, Kafka config, Swagger, Flyway        │
├────────┬────────┬──────────┬───────────┬────────────────────────────┤
│railway-│railway-│ railway- │ railway-  │ railway-                    │
│ user   │ train  │ booking  │ payment   │ notification                │
│        │        │          │           │                             │
│ Auth   │Stations│ Bookings │ Payments  │ Kafka consumer              │
│ JWT    │ Trains │ Seats    │ Mock GW   │ Logs all events             │
│ Users  │ Routes │ PNR      │ Refunds   │ Retry + DLT                │
│        │ Search │ Cancel   │           │                             │
│        │ ES/CQRS│ Waitlist │           │                             │
│        │        │ Scheduler│           │                             │
├────────┴────────┴──────────┴───────────┴────────────────────────────┤
│                    railway-common                                     │
│   Shared DTOs, events, exceptions, interfaces                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Features

### Full Booking Flow (End-to-End)
1. **Search** trains by station name/code and date (Elasticsearch-powered)
2. **Check availability** with real-time seat counts (Redis-cached)
3. **Book** with distributed seat locking (Redis Lua scripts, 10-min TTL)
4. **Pay** via mock payment gateway (80% success rate simulation)
5. **Auto seat assignment** — Kafka event triggers seat allocation on payment success
6. **PNR status** with passenger-level seat/coach details

### Indian Railways Model
- **Confirmed / RAC / Waitlisted** booking statuses
- Automatic **waitlist promotion** chain on cancellation (Waitlisted → RAC → Confirmed)
- Coach types: FIRST_AC, SECOND_AC, THIRD_AC, SLEEPER, GENERAL
- Berth preferences: Lower, Middle, Upper, Side Lower, Side Upper

### Event-Driven Architecture
```
Booking Created → Payment Initiated
  └─> PAYMENT_SUCCESS (Kafka)
        ├─> Booking module: confirms booking + assigns seats
        └─> Notification module: logs confirmation

Booking Cancelled
  └─> BOOKING_CANCELLED (Kafka)
        ├─> Payment module: initiates refund
        ├─> Booking module: promotes waitlisted passengers
        └─> Notification module: logs cancellation alert
```

### Frontend (React)
- **Home** — Station autocomplete search with popular routes
- **Search Results** — Train cards with per-class availability and fares
- **Booking Form** — Multi-passenger with berth preference
- **Payment** — UPI/Card/Net Banking with success/failure states
- **My Bookings** — All bookings with cancel/pay actions
- **PNR Status** — Full passenger status with seat assignments
- **Admin Panel** — Manage stations, trains, routes, schedules, generate runs

### Scheduled Jobs
| Job | Schedule | Purpose |
|-----|----------|---------|
| BookingCleanupJob | Every 60s | Auto-fail unpaid bookings after timeout |
| TrainRunGenerationJob | 2 AM daily | Generate train runs for next 7 days |
| SearchIndexRefreshJob | 3:30 AM daily | Nightly ES reindex safety net |
| StaleDataCleanupJob | 4 AM daily | Mark old train runs as COMPLETED |

### Admin Capabilities
- Create stations, trains, routes, schedules
- Generate train runs for date ranges
- Rebuild Elasticsearch index
- Manually trigger any scheduled job

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Docker & Docker Compose
- Node.js 18+ (for frontend)

### Run

```bash
# 1. Start infrastructure
docker compose -f docker/docker-compose.yml up -d

# 2. Wait for all services to be healthy
docker compose -f docker/docker-compose.yml ps

# 3. Build and run backend
mvn install -DskipTests
mvn spring-boot:run -pl railway-app

# 4. Start frontend (separate terminal)
cd railway-frontend
npm install
npx vite --port 5173
```

### Seed Data (Auto-loaded)

The V8 Flyway migration automatically seeds the database on first run:
- **Admin user:** test@test.com / testadmin
- **10 stations:** New Delhi, Mumbai Central, Chennai Central, Howrah, Bangalore City, Jaipur, Bhopal, Nagpur, Prayagraj, Kanpur
- **3 trains:** Howrah Rajdhani (12301), Mumbai Rajdhani (12951), Chennai Mail (12657)
- **23 coaches** across all trains (1AC, 2AC, 3AC, Sleeper)
- **3 routes** with intermediate stops and timings
- **7 days of train runs** with full seat inventory

### Access Points

| URL | What |
|-----|------|
| http://localhost:5173 | Frontend (React app) |
| http://localhost:8080/swagger-ui.html | Swagger UI (test all APIs) |
| http://localhost:5601 | Kibana (Elasticsearch queries) |

### End-to-End Test Flow

1. Open http://localhost:5173
2. Register a new account or login as test@test.com / testadmin
3. Search: New Delhi → Mumbai Central, tomorrow's date
4. Select a coach class and click "Book Now"
5. Add passenger details, confirm booking
6. Complete payment (80% auto-success)
7. Check PNR status — seat assignment shows automatically

## API Endpoints

| Tag | Endpoints | Auth |
|-----|-----------|------|
| Auth | register, login, refresh | Public |
| User | get profile, get by ID | JWT |
| Stations | search (`GET /api/v1/stations?q=`), get by code, create | Public / Admin |
| Trains | list, get by number, create | Public / Admin |
| Train Search | search by route + date | Public |
| Availability | check seat availability | Public |
| Bookings | book, my bookings, get by PNR, cancel | JWT |
| PNR Status | check PNR | Public |
| Payments | initiate, get by booking, retry | JWT |
| Admin - Trains | create stations/trains/routes/schedules | Admin |
| Admin - Bookings | generate train runs | Admin |
| Admin - Search | reindex Elasticsearch | Admin |
| Admin - Scheduler | trigger scheduled jobs | Admin |

## Project Structure

```
railway-ticket-booking/
├── railway-common/          Shared DTOs, events, exceptions, interfaces
├── railway-user/            Auth (JWT), user management
├── railway-train/           Stations, trains, routes, schedules, ES search
├── railway-booking/         Bookings, seats, PNR, cancellation, schedulers
├── railway-payment/         Payments, refunds, mock gateway
├── railway-notification/    Kafka consumer for all event notifications
├── railway-app/             Spring Boot main app, configs, security, migrations
├── railway-frontend/        React 19 + Vite + TailwindCSS + shadcn/ui
└── docker/                  Docker Compose (infrastructure services)
```

## Key Patterns Demonstrated

- **Modular Monolith** — 7 Maven modules with strict dependency rules
- **CQRS** — PostgreSQL (write) + Elasticsearch (read) for search
- **Event Choreography** — Kafka events trigger cross-module workflows (no orchestrator)
- **Distributed Locking** — Redis Lua scripts for atomic seat reservation
- **Optimistic Locking** — `@Version` on SeatInventory for concurrent booking safety
- **Dependency Inversion** — Cross-module interfaces in common, implementations in feature modules
- **Idempotency** — Redis-based deduplication for bookings and waitlist promotion
- **Retry + DLT** — `@RetryableTopic` with dead letter topics for Kafka resilience
- **Cache Patterns** — Write-through (availability), cache-aside (PNR), TTL-based eviction

## Development Phases

| Phase | What | Key Technologies |
|-------|------|-----------------|
| 1 | Auth, users, stations, trains, routes | Spring Security, JWT, JPA, Flyway |
| 2 | Booking engine, seat locking, caching | Redis (Lua scripts), optimistic locking |
| 3 | Event-driven payment flow | Kafka, event choreography, retry topics |
| 4 | CQRS search pipeline | Elasticsearch, Kafka-triggered indexing |
| 5 | Cancellation, refund, waitlist promotion | Event chain, cross-module refund, RAC model |
| 6 | Scheduled jobs, Swagger annotations | @Scheduled, ThreadPoolTaskScheduler, cron |
| 7 | React frontend, seed data, UI polish | React 19, Vite, TailwindCSS, shadcn/ui |

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Backend runs stale code | `mvn install -DskipTests` then re-run |
| PNR shows old data | Clear Redis: `redis-cli DEL "pnr:{pnr}"` |
| Flyway migration fails on re-run | `DELETE FROM flyway_schema_history WHERE version = 'N'` |
| Station search returns all stations | Ensure frontend uses `q` param (not `keyword`) |
| Seat not assigned after payment | Check Kafka is running, verify `saveAndFlush()` in PaymentEventConsumer |

## License

This project is for educational purposes.
