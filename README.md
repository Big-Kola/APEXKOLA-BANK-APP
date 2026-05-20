# ApexKola Bank

Full-stack banking application with Node.js/Express backend and React frontend.

## Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, bcrypt
- **Frontend:** React 18, React Router, Vite, Axios, React Hot Toast
- **Auth:** JWT-based authentication with password hashing

## Features

- User registration & login
- Account management (savings/current)
- Real-time balance display with hide/show toggle
- Fund transfer between accounts
- Transaction history with pagination
- Recipient account lookup
- Responsive dashboard design

## Project Structure

```
ApexKola-Bank-App/
├── backend/
│   ├── config/db.js          # MongoDB connection
│   ├── models/               # Mongoose schemas
│   │   ├── User.js           # User model
│   │   ├── Account.js        # Account model
│   │   └── Transaction.js    # Transaction model
│   ├── controllers/          # Route handlers
│   │   ├── authController.js
│   │   ├── accountController.js
│   │   └── transactionController.js
│   ├── routes/               # Express routes
│   ├── middleware/auth.js     # JWT middleware
│   └── server.js             # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/axios.js      # Axios config + interceptors
│   │   ├── context/          # Auth context provider
│   │   └── components/       # React components
│   ├── index.html
│   └── vite.config.js
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

```bash
# Clone & install
git clone <repo-url> ApexKola-Bank-App
cd ApexKola-Bank-App

# Backend
cd backend
cp .env.example .env    # Edit MONGO_URI + JWT_SECRET
npm install
npm run dev             # Runs on :5000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # Runs on :3000, proxies /api to :5000
```

Open http://localhost:3000 and register a new account.

---

## DevOps Workflow

> **This section is for your DevOps learning journey.** Follow it in order.

### Stage 1: Containerize with Docker

```bash
# Dockerfile for backend
# Dockerfile for frontend (nginx serve)
# docker-compose.yml to orchestrate both + MongoDB
# Then: docker compose up --build
```

### Stage 2: Orchestrate with Kubernetes

```bash
# Write k8s manifests:
#   backend-deployment.yaml, backend-service.yaml
#   frontend-deployment.yaml, frontend-service.yaml
#   mongodb-statefulset.yaml, mongodb-service.yaml
#   ingress.yaml
# Then: kubectl apply -f k8s/
```

### Stage 3: Cloud Infrastructure with Terraform

```bash
# Terraform modules:
#   VPC + subnets, EKS cluster, RDS (MongoDB Atlas or DocumentDB)
#   ECR repos, IAM roles, Security Groups
# Then: terraform apply
```

### Stage 4: Deploy to AWS

```bash
# Push Docker images to ECR
# Update k8s manifests with ECR image URLs
# kubectl apply -f k8s/
# Set up Route53 + CloudFront for SSL
```

---

## API Reference

| Method | Endpoint                    | Auth | Description              |
|--------|-----------------------------|------|--------------------------|
| POST   | /api/auth/register          | No   | Register new user        |
| POST   | /api/auth/login             | No   | Login user               |
| GET    | /api/auth/profile           | Yes  | Get user + account info  |
| GET    | /api/accounts               | Yes  | List user's accounts     |
| GET    | /api/accounts/:id           | Yes  | Get account by ID        |
| POST   | /api/accounts               | Yes  | Create new account       |
| GET    | /api/accounts/number/:num   | Yes  | Lookup by account number |
| GET    | /api/transactions           | Yes  | List transactions (paginated) |
| POST   | /api/transactions/transfer  | Yes  | Transfer funds           |

## Design

Colors: Navy (#1a1a2e) + Gold (#D4AF37) — inspired by premium banking UI.
