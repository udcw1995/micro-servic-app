# User Management Microservices

A Node.js microservices project with a **user-service** and an **auth-service**, connected via **RabbitMQ** and orchestrated with **Docker Compose**.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (HTTP)                      │
└────────────┬───────────────────────┬────────────────────┘
             │                       │
             ▼                       ▼
   ┌─────────────────┐     ┌─────────────────┐
   │   auth-service  │     │   user-service  │
   │   (port 3001)   │     │   (port 3000)   │
   └────────┬────────┘     └────────┬────────┘
            │  RabbitMQ RPC         │
            │  (user_service_rpc)   │
            └──────────────────────►│
                                    │
   ┌─────────────────┐     ┌────────┴────────┐
   │ auth-service-db │     │ user-service-db │
   │ (PostgreSQL)    │     │ (PostgreSQL)    │
   └─────────────────┘     └─────────────────┘
                    └─────────────────┘
                         RabbitMQ
```

- **auth-service** owns authentication: registration, login, JWT issuance.
- **user-service** owns user profiles and exposes a protected REST API.
- The two services **never call each other over HTTP**. All cross-service communication goes through a RabbitMQ **RPC queue** (`user_service_rpc`).
- Each service has its **own isolated PostgreSQL database**.

---

## Project Structure

```
Project/
├── docker-compose.yml
├── .env.example                      # Root secrets for Docker Compose
├── .gitignore
├── api-requests/                     # VS Code REST Client request files
│   ├── create-user.http
│   ├── login.http
│   ├── logout.http                   # Get users
│   ├── edit-user.http
│   └── delete-user.http
└── backend/
    ├── auth-service/
    │   ├── config/
    │   │   ├── database.js           # Sequelize connection (auth_service_db)
    │   │   └── rabbitmq.js           # RabbitMQ connection singleton
    │   ├── entities/
    │   │   └── Credential.js         # Domain entity
    │   ├── models/
    │   │   └── CredentialModel.js    # Sequelize model (credentials table)
    │   ├── services/
    │   │   ├── CredentialRepository.js
    │   │   └── UserServiceClient.js  # RabbitMQ RPC client → user-service
    │   ├── use-cases/
    │   │   ├── register.js
    │   │   ├── login.js
    │   │   └── refreshToken.js
    │   ├── controllers/
    │   │   └── AuthController.js
    │   ├── routes/
    │   │   └── authRoutes.js
    │   ├── Dockerfile
    │   ├── .env.example
    │   └── index.js
    └── user-service/
        ├── config/
        │   └── database.js           # Sequelize connection (user_service_db)
        ├── entities/
        │   └── User.js               # Domain entity with validate()
        ├── models/
        │   └── UserModel.js          # Sequelize model (users table)
        ├── services/
        │   ├── UserRepository.js
        │   ├── rabbitmq.js           # RabbitMQ connection singleton
        │   └── UserMessageHandler.js # Listens on user_service_rpc queue
        ├── middleware/
        │   └── authenticate.js       # JWT verification middleware
        ├── use-cases/
        │   ├── createUser.js
        │   ├── getUserById.js
        │   ├── getAllUsers.js
        │   ├── updateUser.js
        │   └── deleteUser.js
        ├── controllers/
        │   └── UserController.js
        ├── routes/
        │   └── userRoutes.js
        ├── Dockerfile
        ├── .env.example
        └── index.js
```

---

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2
- (Optional, for local dev) Node.js 22+, PostgreSQL, RabbitMQ

---

## Getting Started

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd Project

# Copy the root env file and fill in your secrets
cp .env.example .env
```

The root `.env` is consumed by Docker Compose. Edit the following values before running in production:

| Variable | Description |
|---|---|
| `USER_DB_PASSWORD` | Password for the user-service PostgreSQL instance |
| `AUTH_DB_PASSWORD` | Password for the auth-service PostgreSQL instance |
| `JWT_ACCESS_SECRET` | Secret used to sign/verify access tokens |
| `JWT_REFRESH_SECRET` | Secret used to sign/verify refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token lifetime (default `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (default `7d`) |

### 2. Build and run

```bash
docker compose up --build
```

| Container | Port | Description |
|---|---|---|
| `user-service` | 3000 | User profile REST API |
| `auth-service` | 3001 | Authentication REST API |
| `rabbitmq` | 5672 / 15672 | AMQP + Management UI (guest/guest) |
| `user-service-db` | — | PostgreSQL for user-service (internal) |
| `auth-service-db` | — | PostgreSQL for auth-service (internal) |

> Tables are created automatically via Sequelize `sync({ alter: true })` on startup.

### 3. Stop

```bash
docker compose down          # stop containers
docker compose down -v       # stop and remove volumes (wipes databases)
```

---

## API Reference

### Auth Service — `http://localhost:3001`

#### `POST /api/auth/register`
Register a new account. Creates the user profile (via RabbitMQ) and stores hashed credentials.

**Request**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "secret123"
}
```

**Response `201`**
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com"
}
```

---

#### `POST /api/auth/login`
Login and receive JWT tokens.

**Request**
```json
{
  "email": "john.doe@example.com",
  "password": "secret123"
}
```

**Response `200`**
```json
{
  "user": { "id": "uuid", "firstName": "John", "lastName": "Doe", "email": "john.doe@example.com" },
  "accessToken": "<jwt>",
  "refreshToken": "<jwt>"
}
```

---

#### `POST /api/auth/refresh`
Exchange a refresh token for a new access token.

**Request**
```json
{ "token": "<refresh-token>" }
```

**Response `200`**
```json
{ "accessToken": "<new-jwt>" }
```

---

### User Service — `http://localhost:3000`

All routes except `POST /` require a valid access token:

```
Authorization: Bearer <accessToken>
```

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/users` | Required | Get all users |
| `GET` | `/api/users/:id` | Required | Get user by UUID |
| `PUT` | `/api/users/:id` | Required | Update user fields |
| `DELETE` | `/api/users/:id` | Required | Delete user |

#### `PUT /api/users/:id` — Request body (all fields optional)
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com"
}
```

#### `GET /health` / auth: `GET /health`
Health check endpoints — no auth required, return `{ "status": "ok" }`.

---

## RabbitMQ Communication

The auth-service sends RPC messages to the `user_service_rpc` queue. Each message has an `action` and a `payload`:

| Action | Payload | Description |
|---|---|---|
| `CREATE` | `{ firstName, lastName, email }` | Create a new user profile |
| `FIND_BY_EMAIL` | `{ email }` | Look up user by email |
| `FIND_BY_ID` | `{ id }` | Look up user by UUID |

RPC replies use exclusive per-request queues with a `correlationId`, with a 10 s timeout.

---

## Local Development (without Docker)

```bash
# Terminal 1 — user-service
cd backend/user-service
cp .env.example .env   # edit DB and RabbitMQ settings
npm install
npm run dev            # uses node --watch

# Terminal 2 — auth-service
cd backend/auth-service
cp .env.example .env
npm install
npm run dev
```

Make sure PostgreSQL and RabbitMQ are running locally and the `.env` values point to them.

---

## API Request Files

The `api-requests/` folder contains `.http` files for the [VS Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension.

| File | Requests |
|---|---|
| `create-user.http` | `POST /api/auth/register` |
| `login.http` | `POST /api/auth/login`, `POST /api/auth/refresh` |
| `logout.http` | `GET /api/users`, `GET /api/users/:id` |
| `edit-user.http` | `PUT /api/users/:id` |
| `delete-user.http` | `DELETE /api/users/:id` |

Replace `<your-access-token-here>` with the `accessToken` returned from the login request, and `<user-id-here>` with the user's UUID.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 22 |
| Framework | Express 5 |
| ORM | Sequelize 6 |
| Database | PostgreSQL 16 |
| Messaging | RabbitMQ 3.13 (AMQP via amqplib) |
| Auth | JSON Web Tokens (jsonwebtoken), bcryptjs |
| Containers | Docker, Docker Compose v2 |
