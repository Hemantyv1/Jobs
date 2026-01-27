# Jobs - Job Application Tracker

A full-stack job application tracking system built with React, Node.js, and PostgreSQL, deployed on AWS.

## Features

- Track job applications with company, position, status, salary, and notes
- Log interview questions and answers
- Track required technical skills
- Dashboard with status breakdown and analytics

## Prerequisites

- AWS Account
- AWS CLI configured
- Terraform installed
- Docker installed
- Node.js 20+
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/Hemantyv1/Jobs.git
cd Jobs
```

### 2. Build Docker Images

```bash
cd backend
docker build -t jobs-backend .
cd ../frontend
docker build -t jobs-frontend .
```

### 3. Deploy Infrastructure

```bash
cd infrastructure/terraform
terraform init
terraform apply
```

### 4. Deploy Application

```bash
cd ../../deploy
# Set environment variables: DB_PASSWORD, ADMIN_PASSWORD, COOKIE_SECRET
.\deploy.ps1
```

## Live Demo (Resume)

To share the live app URL on your resume:

1. **Use a dedicated demo password** (e.g. `JobsDemo2025!`) and **publish it** — e.g. in this README:  
   `Live demo: https://your-alb-url — Password: JobsDemo2025!`  
   Otherwise recruiters cannot log in (the app prompts for a password).

2. **Use dummy data only** — no real companies, interviews, or notes. Replace real data with dummy data before making the URL public.

3. **Relax rate limiting** so recruiters can click around without hitting "Too many requests":
   ```powershell
   $env:RATE_LIMIT_MAX = "50"
   .\deploy\deploy.ps1
   ```
   Redeploy after changing.

4. **HTTPS** is optional but better. Use a domain and Terraform `domain_name` if you have one.

5. **No default secrets** — production requires `ADMIN_PASSWORD` and `COOKIE_SECRET`; the app exits if they are missing.

## Project Structure

```
Jobs/
├── backend/              # Node.js API server
├── frontend/             # React application
├── infrastructure/       # Terraform IaC
│   └── terraform/       # AWS infrastructure definitions
├── deploy/              # Deployment scripts
└── README.md
```
