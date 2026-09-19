# METRIX — Development & Local Setup Guide

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Prerequisites

Before installing METRIX, ensure the following software is installed on your local host:
- **Operating System**: Linux (Ubuntu 20.04+ recommended), macOS, or Windows (WSL2 recommended).
- **Python**: Version 3.8 or higher (Python 3.10+ recommended).
- **Node.js**: Version 18.x or higher (Node.js 20 LTS recommended) with `npm`.
- **PostgreSQL**: Version 14 or higher running locally on port 5432.

---

## 2. Step-by-Step Installation

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd Metrix
```

### Step 2: Configure Environment Variables
Create a `.env` configuration file in the project root:
```bash
cp .env.example .env
```
Ensure your PostgreSQL database connection string is properly configured:
```ini
APP_NAME=METRIX
APP_ENV=development
DEBUG=True
SECRET_KEY=your-secure-development-secret-key-min-32-chars
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/metrix_db
```

### Step 3: Set Up Python Backend Virtual Environment
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 4: Run Database Migrations
Apply the Alembic schema migrations to initialize all tables:
```bash
alembic upgrade head
```

### Step 5: Seed Demonstration Accounts
Run the idempotent seeding script to provision standard demo accounts across all four system roles:
```bash
python seed.py
```

#### Seeded Demonstration Credentials
| Role | Email Address | Default Password |
| :--- | :--- | :--- |
| **ADMIN** | `admin@metrix.gov.in` | `AdminPass123!` |
| **LMO** | `lmo@metrix.gov.in` | `LmoPass123!` |
| **GATC** | `gatc@testinglab.org` | `GatcPass123!` |
| **INSTRUMENT_OWNER** | `owner@example.com` | `OwnerPass123!` |

### Step 6: Install Frontend Dependencies
In a separate terminal:
```bash
cd frontend
npm install
```

---

## 3. Launching Local Servers

### Running the Backend
From the `backend/` directory (with `.venv` activated):
```bash
uvicorn app.main:app --reload --port 8000
```
- **API Swagger Documentation**: `http://localhost:8000/docs`
- **Health Check Endpoint**: `http://localhost:8000/api/v1/health`

### Running the Frontend
From the `frontend/` directory:
```bash
npm run dev
```
- **Web Application Portal**: `http://localhost:3000`
- **Sign In / Registration**: `http://localhost:3000/login`

---

## 4. Running Validation & Test Suites

### Backend Automated Tests
```bash
cd backend
.venv/bin/pytest -v
```

### Frontend Type Safety Check
```bash
cd frontend
npm run type-check
```

### Frontend Production Build
```bash
cd frontend
npm run build
```
