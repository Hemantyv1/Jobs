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

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Nginx
- **Backend**: Node.js, Express, PostgreSQL
- **Infrastructure**: AWS (VPC, ALB, EC2, RDS), Terraform
- **Packaging & Deploy**: Docker, PowerShell deploy script

## Live Demo

If you deploy this project publicly, you can add a line like this here:

```text
Live demo: https://your-domain.example.com  (demo password: JobsDemo2025!)
```

For a public demo:
- **Use dummy data only** – no real companies or personal notes.
- Use a **dedicated demo admin password** (not reused anywhere else).

## Getting Started

### 1. Clone Repository

```bash
git clone https://github.com/Hemantyv1/Jobs.git
cd Jobs
```

### 2. Build Docker Images (local or for deployment)

```bash
cd backend
docker build -t jobs-backend .

cd ../frontend
docker build -t jobs-frontend .
```

### 3. Environment Variables

The deployment expects these environment variables to be set:

- `DB_PASSWORD`: PostgreSQL database password
- `ADMIN_PASSWORD`: password for the admin user in the app
- `COOKIE_SECRET`: secret used to sign cookies / sessions

There are **no default secrets** in production – the app will exit if they are missing.

### 4. Provision Infrastructure (AWS via Terraform)

```bash
cd infrastructure/terraform
terraform init
terraform apply
```

This creates the VPC, load balancer, security groups, EC2 instances, RDS, and other required resources.

### 5. Deploy Application

```bash
cd ../../deploy
.\deploy.ps1
```

The script builds/pushes Docker images, updates the running services, and wires them up behind the load balancer created by Terraform.

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
