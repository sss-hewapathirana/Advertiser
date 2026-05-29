# AdManager — Advertisement Management System

A full-stack advertisement management application built with **Spring Boot 4** (Java 17) and **React 19** (Vite + Tailwind CSS v4), powered by **PostgreSQL (Neon Cloud)**.

---

## Architecture

```
project-01/
├── sampleApp/              # Spring Boot 4 backend (REST API)
│   ├── src/main/java/.../
│   │   ├── AuthController.java
│   │   ├── CustomUserDetailsService.java
│   │   ├── SampleAppApplication.java
│   │   └── features/
│   │       ├── auth/           # JWT, refresh tokens, DTOs
│   │       ├── config/         # SecurityConfig, RateLimitFilter
│   │       ├── common/         # GlobalExceptionHandler, HealthController
│   │       ├── userRegister/   # User CRUD
│   │       ├── AdFeature/      # Ad CRUD, search, pagination
│   │       ├── ImageStore/     # Image CRUD
│   │       ├── VideoFeature/   # Video CRUD
│   │       └── fileStore/      # File upload / download
│   └── src/main/resources/
│       ├── application.properties
│       ├── application-dev.properties
│       ├── application-prod.properties
│       └── logback-spring.xml
│
└── frontend/advertiser/    # React 19 SPA
    └── src/
        ├── pages/           # Login, Register, Dashboard, AdList, AdForm
        ├── components/      # Navbar, ProtectedRoute
        ├── services/        # api.js (axios + JWT interceptor)
        ├── App.jsx          # React Router routes
        └── index.css        # Tailwind import
```

---

## Features

### Backend

| Feature | Details |
|---|---|
| **JWT Authentication** | Register, login, token refresh (with rotation), logout |
| **Role-based Access** | `ROLE_USER`, `ROLE_ADMIN` — enforced via Spring Security |
| **Full CRUD** | Users, Ads, Images, Videos — create, read, update, delete |
| **Pagination & Sorting** | `GET /ads?page=0&size=10&sort=id,desc` |
| **Search** | `GET /ads?q=keyword` — searches title + description |
| **File Upload** | `POST /files/upload` — stores to local `./uploads/` directory |
| **File Download** | `GET /files/{filename}` — serves stored files |
| **Rate Limiting** | 100 requests per minute per IP (429 response when exceeded) |
| **Global Error Handling** | Consistent JSON error responses via `@ControllerAdvice` |
| **Input Validation** | `spring-boot-starter-validation` on all request DTOs |
| **Swagger UI** | `GET /swagger-ui.html` — interactive API docs |
| **Health Check** | `GET /health` — returns `{"status":"UP"}` |
| **Profiles** | `dev` (verbose), `prod` (optimized, strict) |
| **Structured Logging** | Human-readable in dev, JSON format in prod |
| **Soft Deletes** | `deleted_at` timestamp — data recoverable |
| **Audit Fields** | `created_at`, `created_by`, `updated_at`, `updated_by` |
| **Ad Scheduling** | `scheduled_start` / `scheduled_end` — auto status changes |

### Frontend

| Page | Description |
|---|---|
| **Login** | Email/password authentication, JWT stored in localStorage |
| **Register** | New user registration with auto-login |
| **Dashboard** | User stats: ad count, level, account type |
| **Ad List** | Paginated grid with search, edit and delete actions |
| **Ad Form** | Create and edit ads with title, description, media counts, expiry |
| **Navigation** | Responsive top navbar with logout |
| **Route Protection** | Unauthenticated users redirected to login |
| **Auto Token Refresh** | 401 responses trigger silent refresh token rotation |

---

## Quick Start

### Prerequisites

- **Java 17+** (tested with Java 24)
- **Node.js 20+**
- **Maven** (bundled via `mvnw`)
- A **PostgreSQL** database (Neon or local)

### 1. Clone & Configure

```bash
git clone <repo-url> project-01
cd project-01
```

### 2. Environment Variables

Set these before starting the backend:

```bash
# PowerShell
$env:DATABASE_URL="jdbc:postgresql://host:5432/dbname?sslmode=require"
$env:DATABASE_USERNAME="your-username"
$env:DATABASE_PASSWORD="your-password"
$env:JWT_SECRET="Your256bitSecretKeyThatIsAtLeast32CharactersLong!!"
```

A template is available at `sampleApp/.env.example`.

### 3. Start Backend

```bash
cd sampleApp
.\mvnw.cmd spring-boot:run
```

The API starts at `http://localhost:8080`.

### 4. Start Frontend

```bash
cd frontend/advertiser
npm install
npm run dev
```

The UI opens at `http://localhost:5173`.

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user |
| `POST` | `/auth/login` | Public | Login, returns JWT tokens |
| `POST` | `/auth/refresh` | Public | Rotate refresh token |
| `POST` | `/auth/logout` | Public | Revoke refresh token |

**Register request:**
```json
{
  "email": "user@example.com",
  "password": "securepass",
  "name": "John Doe",
  "telNumber": 1234567890
}
```

**Login response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzM4NCJ9...",
  "refreshToken": "eyJhbGciOiJIUzM4NCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ROLE_USER"
  }
}
```

### Ads

All ad endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/ads` | List ads (supports `?page`, `?size`, `?sort`, `?q`) |
| `GET` | `/ads/{id}` | Get single ad |
| `POST` | `/ads` | Create ad |
| `PUT` | `/ads/{id}` | Update ad |
| `DELETE` | `/ads/{id}` | Delete ad |

**Query parameters for `GET /ads`:**
```
?page=0          # page number (0-indexed)
&size=10         # items per page
&sort=id,desc    # sort field and direction
&q=ad title      # search keyword
```

### Files

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/files/upload` | Upload file (multipart/form-data) |
| `GET` | `/files/{filename}` | Download stored file |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check (no auth required) |

**Response:**
```json
{
  "status": "UP",
  "timestamp": "2026-05-26T12:00:00",
  "service": "Simple Advertisement System"
}
```

### Swagger

Browse interactive API documentation at:

```
http://localhost:8080/swagger-ui.html
```

---

## Database Schema

```
users (consumer_id PK, email, password, role, user_name, tel_no, age,
       advanced_or_not, level, register_date, no_of_advertisement)

ads (ad_info_id PK, consumer_id FK → users, ad_title, ad_information,
     no_of_picture, no_of_videos, expire_date, created_date)

images (image_id PK, ad_info_id FK → ads, no_of_picture, no_of_videos,
        expire_date, created_date)

videos (video_id PK, ad_info_id FK → ads, video_name, video_url,
        video_size, created_date, expire_date)

refresh_tokens (id PK, user_id, token, expiry_date, revoked)
```

Schema is auto-created by Hibernate (`ddl-auto=update`).

---

## Profiles

### Dev (default)
```bash
$env:SPRING_PROFILES_ACTIVE="dev"
```
- Verbose SQL logging (`show-sql=true`)
- DEBUG level for app package
- TRACE level for Hibernate bind parameters

### Production
```bash
$env:SPRING_PROFILES_ACTIVE="prod"
```
- Schema validation only (`ddl-auto=validate`)
- WARN+ logging level
- HikariCP connection pool tuned (max 10)
- JSON structured logging
- SQL logging disabled

---

## Common Issues

### "Driver claims to not accept jdbcUrl, ${DATABASE_URL}"
The `DATABASE_URL` environment variable is not set. Copy `.env.example` and set the required variables.

### 403 Forbidden on API calls
- Missing or expired JWT token — re-login
- Token not sent as `Authorization: Bearer <token>` header
- Endpoint requires a role you don't have

### Port 8080 already in use
```bash
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend Framework** | Spring Boot 4.0.6 (Spring Framework 7, Spring Security 7) |
| **Language** | Java 17 (compatible with 24) |
| **Database** | PostgreSQL (Neon Cloud) via Hibernate 7 + Spring Data JPA |
| **Auth** | JWT (jjwt 0.12.6), BCrypt |
| **API Docs** | Springdoc OpenAPI 3.0.3 (Swagger UI) |
| **Rate Limiting** | Custom in-memory sliding window (no external deps) |
| **Frontend** | React 19, Vite 8, React Router 7, Axios |
| **Styling** | Tailwind CSS v4 |
| **Build** | Maven (backend), npm (frontend) |
