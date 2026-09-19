# METRIX

> **Online Verification and Digital Certification System for Weighing and Measuring Instruments**  
> *Based on Smart India Hackathon Problem Statement SIH26036*

---

## 1. Project Summary

METRIX is a modern, modular web platform designed to streamline and digitize the end-to-end legal metrology verification lifecycle for weighing and measuring instruments. It enables business owners to register instruments and apply for verification/re-verification, allows Legal Metrology Officers (LMOs) and Government Approved Test Centres (GATCs) to review, inspect, and record metrological observations, and generates tamper-evident digital certificates with verifiable QR codes.

---

## 2. Key Lifecycle

```text
Instrument Owner / Business
        ↓
Instrument Registration
        ↓
Verification / Re-verification Application
        ↓
Application Review
        ↓
Scheduling / Officer Allocation
        ↓
Inspection / Verification
        ↓
Verification Result
        ↓
Digital Certificate Generation
        ↓
QR-based Certificate Verification
        ↓
Certificate Validity / Expiry Tracking
        ↓
Re-verification
```

---

## 3. Technology Stack

- **Backend**: Python 3, FastAPI, Pydantic, SQLAlchemy 2.x, Alembic, PostgreSQL, Pytest
- **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS, Redux Toolkit
- **Certificates & QR**: ReportLab, Python `qrcode`
- **Architecture**: Modular Monolith

---

## 4. Repository Structure

```text
Metrix/
├── .agents/
│   └── rules/                  # Persistent AI agent and architectural rules
├── AGENTS.md                   # AI Agent and developer guidelines
├── README.md                   # Project documentation
├── .gitignore                  # Git ignore definitions
├── .env.example                # Safe environment configuration template
├── backend/
│   ├── app/
│   │   ├── api/                # FastAPI routers (/api/v1)
│   │   ├── core/               # Configuration, security, logging, dependencies
│   │   ├── db/                 # SQLAlchemy database session & declarative base
│   │   ├── models/             # SQLAlchemy ORM models
│   │   ├── schemas/            # Pydantic validation schemas
│   │   ├── repositories/       # Data persistence & query layer
│   │   ├── services/           # Business logic & domain workflows
│   │   ├── utils/              # Utility helpers
│   │   └── main.py             # FastAPI entrypoint & middleware
│   ├── alembic/                # Database migrations
│   ├── tests/                  # Pytest test suite
│   └── requirements.txt        # Python dependencies
└── frontend/
    ├── src/
    │   ├── app/                # Next.js App Router pages and layouts
    │   ├── components/         # Reusable UI, layout, and form components
    │   ├── features/           # Feature-oriented modules
    │   ├── services/           # Centralized API clients
    │   ├── store/              # Redux Toolkit store & typed hooks
    │   └── types/              # TypeScript definitions
    ├── package.json            # Node.js dependencies & scripts
    ├── tsconfig.json           # TypeScript configuration
    └── tailwind.config.js      # Tailwind CSS configuration
```

---

## 5. Getting Started (Local Development)

### Prerequisites
- Python 3.8+ (Python 3.10+ recommended)
- Node.js 18+ (Node.js 20 recommended) & npm
- PostgreSQL 14+ database instance

### Setup Workflow
1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Metrix
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env` at the project root:
   ```bash
   cp .env.example .env
   ```
   > **Note**: `.env` contains private configuration and must NEVER be committed to version control. Open `.env` and configure your PostgreSQL connection string (`DATABASE_URL`) and application secrets.

3. **Install Backend Dependencies & Run Migrations**:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt

   # Apply database migrations
   alembic upgrade head
   ```

4. **Start Backend Server**:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   - Swagger Documentation: `http://localhost:8000/docs`
   - Health Check: `http://localhost:8000/api/v1/health`

5. **Start Frontend Client**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   - Web Application: `http://localhost:3000`
   - Authentication Page: `http://localhost:3000/login`

### Core API Endpoints (Phase 2)
- `GET  /api/v1/health`: System health and PostgreSQL connectivity status
- `POST /api/v1/auth/register`: Register new user account and stakeholder profile
- `POST /api/v1/auth/login`: Authenticate credentials and receive signed JWT
- `GET  /api/v1/auth/me`: Retrieve current authenticated user profile
- `POST /api/v1/instruments`: Register weighing/measuring instrument
- `GET  /api/v1/instruments`: List instruments (scoped by user role)
- `POST /api/v1/applications`: Submit verification/re-verification application
- `GET  /api/v1/applications`: List applications (with optional status filter)
- `PATCH /api/v1/applications/{id}/status`: Transition application status

### Running Tests
Execute the backend test suite:
```bash
cd backend
pytest -v
```

---

## 6. Engineering Constraints

- **Backend Python files**: Maximum **500 lines** per file.
- **Frontend TypeScript/TSX files**: Maximum **300 lines** per file.
- **Strictly No**: Docker, Kubernetes, Microservices, Kafka, Redis, Blockchain, or AI/ML components.
