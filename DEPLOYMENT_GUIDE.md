# ApexKola Bank - Complete Deployment Guide

This guide walks you through the full DevOps pipeline: **Docker → Kubernetes → Terraform → AWS**.

---

## Prerequisites

| Tool      | Purpose              | Install                            |
|-----------|----------------------|-------------------------------------|
| Docker    | Containerization     | `sudo apt install docker.io`       |
| kubectl   | K8s cluster mgmt     | `snap install kubectl --classic`   |
| minikube  | Local K8s            | `curl -LO ...` (see minikube docs) |
| Terraform | IaC for cloud infra  | `sudo apt install terraform`       |
| AWS CLI   | AWS interactions     | `pip install awscli`               |

---

## Stage 1 — Docker (Containerization)

### 1.1 Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

### 1.2 Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
# Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 1.3 Nginx Config

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    location /api {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 1.4 Docker Compose

Create `docker-compose.yml` at the root:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    container_name: apexkola-mongo
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    networks:
      - apexkola-net

  backend:
    build: ./backend
    container_name: apexkola-backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://mongodb:27017/apexkola_bank
      - JWT_SECRET=change_this_in_prod
      - NODE_ENV=production
    depends_on:
      - mongodb
    networks:
      - apexkola-net

  frontend:
    build: ./frontend
    container_name: apexkola-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - apexkola-net

volumes:
  mongo_data:

networks:
  apexkola-net:
    driver: bridge
```

### 1.5 Build & Run

```bash
docker compose up --build
# App at http://localhost
```

---

## Stage 2 — Kubernetes (Orchestration)

### 2.1 Start Minikube

```bash
minikube start --cpus 4 --memory 8192
minikube addons enable ingress
```

### 2.2 MongoDB StatefulSet

Create `k8s/mongodb.yaml`:

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
spec:
  serviceName: mongodb
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongo-data
          mountPath: /data/db
  volumeClaimTemplates:
  - metadata:
      name: mongo-data
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 1Gi
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
spec:
  ports:
  - port: 27017
  clusterIP: None
  selector:
    app: mongodb
```

### 2.3 Backend Deployment

Create `k8s/backend.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: apexkola-backend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 5000
        env:
        - name: MONGO_URI
          value: mongodb://mongodb:27017/apexkola_bank
        - name: JWT_SECRET
          value: "change_this_in_prod"
        - name: NODE_ENV
          value: production
---
apiVersion: v1
kind: Service
metadata:
  name: backend
spec:
  ports:
  - port: 5000
  selector:
    app: backend
```

### 2.4 Frontend Deployment

Create `k8s/frontend.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: apexkola-frontend:latest
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: NodePort
  ports:
  - port: 80
    nodePort: 30080
  selector:
    app: frontend
```

### 2.5 Ingress

Create `k8s/ingress.yaml`:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: apexkola-ingress
spec:
  rules:
  - http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 5000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### 2.6 Deploy

```bash
kubectl apply -f k8s/
minikube service frontend --url
# Or: minikube ip → http://<ip>:30080
```

---

## Stage 3 — Terraform (AWS Infrastructure)

### 3.1 Project Structure

```
terraform/
├── main.tf          # Provider + modules
├── variables.tf     # Input variables
├── outputs.tf       # Output values
├── vpc/
│   ├── main.tf
│   └── outputs.tf
├── eks/
│   ├── main.tf
│   └── outputs.tf
├── rds/
│   ├── main.tf
│   └── outputs.tf
└── ecr/
    └── main.tf
```

### 3.2 Provider Setup (`terraform/main.tf`)

```hcl
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
}

provider "aws" {
  region = var.aws_region
}

module "vpc" {
  source = "./vpc"
  vpc_cidr = var.vpc_cidr
  environment = var.environment
}

module "eks" {
  source = "./eks"
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnet_ids
  cluster_name = "${var.environment}-apexkola-eks"
  depends_on = [module.vpc]
}

module "ecr" {
  source = "./ecr"
  repos = ["apexkola-backend", "apexkola-frontend"]
}

module "rds" {
  source = "./rds"
  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnet_ids
  db_name         = "apexkola_bank"
  db_username     = var.db_username
  db_password     = var.db_password
  depends_on      = [module.vpc]
}
```

### 3.3 Apply Terraform

```bash
cd terraform
terraform init
terraform plan
terraform apply
# Outputs: EKS cluster endpoint, ECR URLs, RDS endpoint
```

---

## Stage 4 — Deploy to AWS

### 4.1 Push Images to ECR

```bash
aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com

docker tag apexkola-backend:latest <account>.dkr.ecr.<region>.amazonaws.com/apexkola-backend:latest
docker tag apexkola-frontend:latest <account>.dkr.ecr.<region>.amazonaws.com/apexkola-frontend:latest

docker push <account>.dkr.ecr.<region>.amazonaws.com/apexkola-backend:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/apexkola-frontend:latest
```

### 4.2 Configure kubectl for EKS

```bash
aws eks update-kubeconfig --region <region> --name <cluster-name>
```

### 4.3 Update k8s manifests

Edit `k8s/backend.yaml`:
- Change `image` to ECR URL
- Update `MONGO_URI` to RDS endpoint

Edit `k8s/frontend.yaml`:
- Change `image` to ECR URL

### 4.4 Deploy to EKS

```bash
kubectl apply -f k8s/
kubectl get all
kubectl get ingress
```

### 4.5 Set up Domain + SSL

```bash
# In Route53, point domain to ALB (from ingress)
# Request ACM certificate for HTTPS
# Update ingress with tls section
```

---

## DevOps Workflow Summary

```
[Code] → [Docker] → [K8s (Minikube)] → [Terraform/AWS] → [K8s (EKS)]
   │          │             │                   │               │
   │     Containerize  Local orchestrate    Provision infra   Production
   │     images        with k8s manifests   with Terraform    deploy to EKS
   │
 git push triggers CI/CD
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: Deploy
on: push to main
jobs:
  build:
    - Checkout code
    - Build & tag Docker images
    - Push to ECR
  deploy:
    - Update k8s manifests with new image tags
    - kubectl apply -f k8s/
```

---

## Architecture Diagram

```
┌─────────────┐        ┌──────────────┐        ┌─────────────┐
│   Browser   │ ───→   │  Ingress/NLB │ ───→   │  Frontend   │
└─────────────┘        └──────────────┘        │  (React)    │
                                               └──────┬──────┘
                                                      │ /api
                                                      ↓
                                               ┌──────────────┐
                                               │  Backend     │
                                               │  (Express)   │
                                               └──────┬──────┘
                                                      │
                                                      ↓
                                               ┌──────────────┐
                                               │  MongoDB     │
                                               │  (Atlas/RDS) │
                                               └──────────────┘
```

---

## Security Checklist for Production

- [ ] Change JWT_SECRET to a strong random value
- [ ] Enable MongoDB authentication
- [ ] Use HTTPS with ACM certificate
- [ ] Set up WAF (Web Application Firewall)
- [ ] Implement rate limiting on API
- [ ] Add proper CORS origins
- [ ] Use Secrets Manager for sensitive data
- [ ] Enable CloudTrail + monitoring
- [ ] Set up backup for MongoDB data
- [ ] Configure auto-scaling policies

---

Happy building!
