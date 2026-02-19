# 🚀 Backend Microservices Architecture Project

A fully Dockerized Microservices-based backend system built using **Node.js, Express, MongoDB, Redis, RabbitMQ, Cloudinary, and JWT Authentication** following scalable production-grade architecture.

This project consists of:

- 🧑‍💻 User Service (Authentication & Authorization)
- 🖼️ Media Service (Cloudinary + Event Publishing)
- 📝 Post Service (CRUD + Event Subscription)
- 🌐 API Gateway (Proxy-based routing)
- 🐳 Fully Dockerized with Docker Compose

---

# 🏗️ Architecture Overview

Client → API Gateway → Microservices

- API Gateway handles routing & rate limiting
- Services communicate via **RabbitMQ**
- Redis used for caching & rate limiting
- MongoDB used as database
- Cloudinary used for media storage

---

# 🛠️ Tech Stack

| Technology | Purpose |
|------------|----------|
| Node.js | Backend Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Redis | Caching & Rate Limiting |
| RabbitMQ | Event-driven communication |
| JWT | Authentication |
| Argon2 | Password Hashing |
| Cloudinary | Media Storage |
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Winston | Logging |
| AMQP (amqplib) | RabbitMQ integration |
| API Versioning | Scalable API management |
| Express Rate Limiter | Request throttling |
| Proxy Server | API Gateway routing |

---

# 📦 Services Breakdown

---

## 1️⃣ User Service (Authentication Service)

### Responsibilities
- User Registration
- Login
- JWT Access Token generation
- Refresh Token handling
- Token Rotation
- Secure password hashing using Argon2
- MongoDB Indexing for performance

### Features
- Access Token + Refresh Token architecture
- JWT based authentication
- Argon2 password hashing
- MongoDB indexing
- Redis for session/token caching
- Rate limiting
- Winston logging
- Dockerized

---

## 2️⃣ Media Service

### Responsibilities
- Media Upload
- Cloudinary Integration
- Event Publishing via RabbitMQ
- Like functionality (event-based)
- AMQP Publisher
- Route key-based communication

### Features
- Cloudinary file upload
- RabbitMQ publishing
- Redis caching
- Express rate limiter
- API versioning
- Winston logger
- Dockerized

---

## 3️⃣ Post Service

### Responsibilities
- Full CRUD operations
- Subscribe to RabbitMQ events
- Event-driven architecture
- Data synchronization
- Redis caching

### Features
- RabbitMQ consumer
- Event-driven updates
- MongoDB indexing
- Redis integration
- Rate limiting
- Versioned APIs
- Winston logging
- Dockerized

---

## 🌐 API Gateway

Acts as a reverse proxy server.

### Responsibilities
- Route requests to services
- Centralized rate limiting
- JWT validation middleware
- Version control
- Service isolation

### Tools Used
- http-proxy-middleware
- Express
- Redis
- Winston

---

# 🔐 Authentication Flow

1. User logs in
2. Server generates:
   - Access Token (short expiry)
   - Refresh Token (long expiry)
3. Access Token used for protected routes
4. Refresh Token used to generate new access token

---

# 📡 Event-Driven Communication (RabbitMQ)

- Publisher: Media Service
- Subscriber: Post Service
- Uses:
  - Exchange
  - Queues
  - Route Keys
  - amqplib

---

# ⚡ Caching & Rate Limiting

- Redis used for:
  - Rate limiting
  - Caching
  - Token storage
- Express rate limiter implemented in all services

---

# 🧠 Indexing

MongoDB indexes implemented for:
- Email uniqueness
- Performance optimization
- Query acceleration

---

# 📁 Project Structure
```bash
Microservices-Project/
│
├── api-gateway/
├── user-service/
├── media-service/
├── post-service/
├── docker-compose.yml
└── README.md
```

---

# 🐳 Docker Setup

Each service contains:
- Dockerfile
- Environment configs
- Connected via docker-compose

To run:

```bash
docker compose up --build
```

# 📊 Logging (Winston)

Centralized structured logging using Winston:

- Error logs
- Info logs
- Debug logs
- Production Ready logging

# 🚀 How to Run Locally
1️⃣ Clone Repo
```bash
git clone https://github.com/Nevin100/Microservices-Project.git
```

2️⃣ Setup Environment Variables
Create .env in each service:
```bash
PORT=
MONGO_URI=
REDIS_URL=
JWT_SECRET=
CLOUDINARY_CONFIG=
RABBITMQ_URL=
```

3️⃣ Start Services:
```bash
docker compose up --build
```
# 🔮 Production Ready Features

- ✅ Microservices architecture0
- ✅ Event-driven communication
- ✅ Dockerized services
- ✅ API Gateway
- ✅ JWT Authentication
- ✅ Refresh token mechanism
- ✅ Redis caching
- ✅ Rate limiting
- ✅ MongoDB indexing
- ✅ Cloudinary integration
- ✅ Structured logging
- ✅ Versioned APIs

📌 Why This Project?

- This project demonstrates:
- Advanced backend architecture
- Distributed system design
- Event-driven patterns
- Secure authentication implementation
- Scalable API design
- Real-world production practices
