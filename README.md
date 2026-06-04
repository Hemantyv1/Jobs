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

### 5. Deploy Application

```bash
cd ../../deploy
.\deploy.ps1
```

