# METRIX — Deployment & Environment Configuration

> **Document Status**: CURRENT STATE (Post-Phase 6 Verified)  
> **Master Index**: See [docs/DOCUMENTATION_INDEX.md](DOCUMENTATION_INDEX.md).

---

## 1. Deployment Model: Software-Only Bare-Metal

METRIX is intentionally designed for direct deployment on standard virtual or physical servers running Linux, macOS, or Windows without requiring container virtualization (Docker) or Kubernetes orchestration.

```text
               ┌────────────────────────────────────────────────────────┐
               │              Host Operating System (Linux)             │
               │                                                        │
               │  ┌──────────────────┐          ┌────────────────────┐  │
Clients ------>│  │  Next.js Build   │          │  FastAPI / Uvicorn │  │
(Port 80/443)  │  │   (Node.js 20)   │──HTTP───>│    (Python 3.10)   │  │
               │  │   Port 3000      │          │    Port 8000       │  │
               │  └──────────────────┘          └─────────┬──────────┘  │
               │                                          │             │
               │                            SQLAlchemy 2.x│             │
               │                                          ▼             │
               │                                ┌────────────────────┐  │
               │                                │  PostgreSQL 14+    │  │
               │                                │  Port 5432         │  │
               │                                └────────────────────┘  │
               └────────────────────────────────────────────────────────┘
```

---

## 2. Environment Variables Reference

METRIX loads runtime settings via `pydantic-settings` from `.env` in the root directory:

| Environment Variable | Default Value | Description & Production Guidance |
| :--- | :--- | :--- |
| `APP_NAME` | `METRIX` | Application display name in logs and Swagger docs |
| `APP_ENV` | `development` | Environment mode (`development`, `staging`, `production`). In production, auto-seeding is locked out |
| `DEBUG` | `True` | Set to `False` in staging and production to disable verbose error details |
| `API_V1_STR` | `/api/v1` | Base routing path for API controllers |
| `SECRET_KEY` | `metrix-insecure-...` | **CRITICAL**: Change to a strong cryptographic string (min 32 chars) generated via `openssl rand -hex 32` |
| `ALGORITHM` | `HS256` | JWT signing algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | JWT expiration duration in minutes (default 24 hours) |
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string (`postgresql://<user>:<password>@<host>:<port>/<db>`) |
| `CORS_ORIGINS` | `["http://localhost:3000"]`| Comma-separated list or JSON array of authorized client origins |
| `CERTIFICATE_VALIDITY_DAYS` | `365` | Default validity period for newly issued certificates |
| `CERTIFICATE_EXPIRY_WARNING_DAYS` | `30` | Lead time window for generating expiration alerts |
| `PUBLIC_VERIFICATION_BASE_URL`| `http://localhost:3000/verify`| Public domain URL embedded in generated QR codes |
| `CERTIFICATE_STORAGE_DIR` | `storage/certificates` | Absolute or relative filesystem directory where ReportLab writes PDF files |

---

## 3. Production Readiness & Security Checklist

When deploying METRIX to a production or staging host:
1. **Rotate Secrets**: Set a unique, unguessable `SECRET_KEY` in `.env`.
2. **Disable Debug Mode**: Ensure `DEBUG=False` and `APP_ENV=production`.
3. **Database Hardening**:
   - Create a dedicated PostgreSQL non-superuser account for METRIX.
   - Configure PostgreSQL `pg_hba.conf` to restrict socket or network access.
4. **CORS Restrictions**: Explicitly define production domain origins in `CORS_ORIGINS`.
5. **Process Supervision**: Run Uvicorn and Next.js under system service managers (e.g. `systemd` or `pm2`) with automatic restart policies.
6. **Reverse Proxy & TLS**: Place an Nginx or Caddy reverse proxy in front of Next.js and FastAPI to terminate TLS (HTTPS) certificates.
