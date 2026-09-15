# `.agent/rules/database-rules.md`

# METRIX Database Rules

## 1. Database Technology

Use:

**PostgreSQL**

Use:

**SQLAlchemy 2.x**

as the ORM.

Use:

**Alembic**

for schema migrations.

---

## 2. ORM Responsibility

SQLAlchemy is responsible for:

* ORM mapping
* database queries
* persistence
* relationships
* transactions

FastAPI is responsible for:

* HTTP
* routing
* request handling
* dependency injection
* API responses

FastAPI does not replace SQLAlchemy.

---

## 3. Models

SQLAlchemy models represent database entities.

Models should not be used as the application's public API schema.

Use Pydantic schemas for API requests and responses.

---

## 4. Naming

Use consistent naming conventions.

Prefer:

```text
snake_case
```

for database tables and columns.

Names should describe the domain clearly.

Avoid cryptic abbreviations.

---

## 5. Primary Keys

Every persistent entity should have a clear primary key.

Foreign keys must reference valid entities.

Do not use application-generated identifiers without understanding uniqueness requirements.

---

## 6. Relationships

Relationships should be explicitly modeled where required.

Examples:

```text
User
  ↓
VerificationApplication
  ↓
Instrument

VerificationApplication
  ↓
Inspection

VerificationApplication
  ↓
Certificate
```

Avoid unnecessary relationships.

---

## 7. Constraints

Use database constraints for important invariants where appropriate.

Examples:

* unique constraints
* foreign keys
* not-null constraints
* appropriate check constraints

Do not rely entirely on frontend validation for database integrity.

---

## 8. Indexes

Add indexes when they support real query patterns.

Likely candidates include:

* instrument identifiers
* application identifiers
* certificate numbers
* QR verification identifiers
* status fields when frequently queried
* expiry dates where appropriate

Do not add indexes everywhere without reason.

---

## 9. Timestamps

Important entities should have appropriate timestamps.

Examples:

```text
created_at
updated_at
submitted_at
verified_at
issued_at
expires_at
```

Only add timestamps that have a real purpose.

---

## 10. Migrations

Schema changes must be performed through Alembic.

Required workflow:

```text
Modify SQLAlchemy model
        ↓
Create migration
        ↓
Review migration
        ↓
Apply migration
        ↓
Test
```

Do not silently modify database structure manually.

---

## 11. Data Integrity

Agents must consider:

* duplicate records
* foreign-key violations
* invalid status transitions
* orphaned records
* invalid dates
* missing required information

Business-critical invariants should be enforced at the appropriate layer.

---

## 12. Transactions

Operations that modify multiple related records should use appropriate transaction boundaries.

Example:

```text
Verification result
    +
Certificate creation
```

should not leave the database in a partially completed state.

---

## 13. Deletion

Do not introduce destructive deletion without considering relationships and business requirements.

Where historical records are important, prefer an appropriate archival/soft-delete strategy if required by the documented workflow.

Do not add soft deletion to every table automatically.

---
