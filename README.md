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
- PostgreSQL 14+ running locally

### Environment Configuration
Copy the safe `.env.example` to `.env` in both backend and frontend if needed:
```bash
cp .env.example backend/.env
```

### Backend Setup
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run migrations
alembic upgrade head

# Start backend server
uvicorn app.main:app --reload --port 8000
```
- API Health Endpoint: `http://localhost:8000/api/v1/health`
- Swagger Documentation: `http://localhost:8000/docs`

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
- Web Application: `http://localhost:3000`

### Running Tests
```bash
cd backend
pytest
```

---

## 6. Engineering Constraints

- **Backend Python files**: Maximum **500 lines** per file.
- **Frontend TypeScript/TSX files**: Maximum **300 lines** per file.
- **Strictly No**: Docker, Kubernetes, Microservices, Kafka, Redis, Blockchain, or AI/ML components.
