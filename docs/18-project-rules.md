# METRIX — Engineering Rules & Development Guidelines

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Core Engineering Principles

METRIX is an online verification system for weighing and measuring instruments developed under a four-week college timeline. Engineering decisions must always prioritize:
$$\text{Correctness} \longrightarrow \text{Simplicity} \longrightarrow \text{Maintainability} \longrightarrow \text{Delivery}$$

Technological sophistication must never take precedence over maintainable, working code.

---

## 2. Hard Technology & Scope Constraints

### Approved Technologies
- **Backend**: Python 3.8+, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, PostgreSQL, Pytest.
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Redux Toolkit.
- **Certificates**: ReportLab PDF, Python `qrcode`, SHA-256 integrity digests.

### Explicitly Forbidden Technologies
Agents and developers must **NOT** introduce:
- Docker, Docker Compose, or Kubernetes
- Microservices or distributed multi-application architectures
- Message brokers (Celery, Kafka, RabbitMQ)
- External caching layers (Redis, Memcached)
- Blockchain or distributed ledger technology
- AI, Machine Learning, or LLM-driven core application workflows

---

## 3. Mandatory Line Limits

To preserve modularity and prevent unmaintainable code dumps, all files must observe strict size boundaries:
- **Backend Python Files**: Maximum **500 lines** per file.
- **Frontend TS/TSX Files**: Maximum **300 lines** per file.
- **Test Files**: Maximum **500 lines** per file.
- **Documentation Files**: Target **≤300 lines** where practical. If a document legitimately exceeds this limit and splitting it would reduce clarity, retain the document and record the reason rather than artificially compressing or fragmenting content.

If a code file approaches its limit, decompose it logically by responsibility. Do not artificially compress formatting or create meaningless one-line abstractions.

---

## 4. Architectural Layering Discipline

1. **Thin Routers**: Route handlers handle HTTP matching, validation, and authorization dependencies. Business logic belongs in the service layer.
2. **Service Layer**: Business rules, state transitions, domain validation, and notification dispatching live in dedicated services.
3. **Repository Layer**: All direct database interaction, queries, and ORM aggregations live in repositories.
4. **Pydantic vs. Model Separation**: Never expose SQLAlchemy ORM models directly to the API client. Request and response payloads must use explicit Pydantic schemas.
5. **Alembic Schema Discipline**: Every database change requires an Alembic migration script. Never modify production database schemas manually.

---

## 5. Agent Workflow Rules & Protection Policy

- **Inspect Before Editing**: Always inspect related files, dependencies, and database schemas before writing code.
- **Smallest Correct Change**: Implement the smallest change that satisfies the requirement. Avoid unrelated refactoring.
- **No Requirement Invention**: Do not invent complex features (e.g. external SMS gateways or payment portals) unless explicitly requested.
- **Protection of Rule Files**: The persistent rules in `.agents/rules/*` and `AGENTS.md` govern developer and AI behavior. They must not be modified during documentation consolidation tasks. Any discrepancies discovered between rules and implementation are recorded in `docs/DOCUMENTATION_DECISIONS.md`.
