# `.agent/rules/backend-rules.md`

# METRIX Backend Rules

## 1. Technology

Backend must use:

* Python
* FastAPI
* Pydantic
* SQLAlchemy 2.x
* Alembic
* PostgreSQL
* Pytest

---

## 2. Backend File Limit

Every backend source file should remain at or below:

**500 lines**

If approaching the limit:

1. identify separate responsibilities
2. extract logically related code
3. keep imports and dependencies clear
4. do not split arbitrarily

---

## 3. FastAPI Routers

Routers must remain thin.

A router should generally:

1. receive request
2. authenticate
3. authorize
4. validate request
5. call service
6. return response

Avoid putting large business workflows inside route handlers.

Bad:

```python
@router.post("/applications")
def create_application(...):
    # 100+ lines of business logic
```

Preferred:

```python
@router.post("/applications")
def create_application(...):
    return application_service.create(...)
```

---

## 4. Services

Services contain business logic.

Examples:

```text
InstrumentService
VerificationService
InspectionService
CertificateService
AuthService
```

Services may coordinate multiple repositories.

Services must not become giant catch-all classes.

---

## 5. Repositories

Repositories handle persistence.

Examples:

```text
InstrumentRepository
ApplicationRepository
InspectionRepository
CertificateRepository
UserRepository
```

Repositories should not contain UI concerns.

Repositories should not determine HTTP response formats.

---

## 6. Pydantic Schemas

Use Pydantic schemas for API contracts.

Separate schemas should be created when request and response structures differ.

Examples:

```text
InstrumentCreate
InstrumentUpdate
InstrumentResponse

ApplicationCreate
ApplicationResponse

InspectionCreate
InspectionResponse
```

Do not expose SQLAlchemy models directly as public API contracts.

---

## 7. Error Handling

Use meaningful HTTP errors.

Examples:

```text
400 → invalid request
401 → unauthenticated
403 → unauthorized
404 → resource not found
409 → conflict
422 → validation error
500 → unexpected server error
```

Do not return generic `"Something went wrong"` when the application can provide a useful safe explanation.

Do not expose stack traces or internal database errors to users.

---

## 8. Authentication

Authentication must be centralized.

Do not implement custom login logic separately inside every router.

Use:

* password hashing
* JWT authentication
* dependency-based current-user retrieval
* role-based authorization

---

## 9. Authorization

Authentication answers:

> Who is the user?

Authorization answers:

> What is this user allowed to do?

Both must be enforced.

Do not rely only on frontend route protection.

Backend authorization is mandatory for protected operations.

---

## 10. Configuration

Configuration must come from environment/configuration mechanisms.

Do not hard-code:

* database passwords
* JWT secrets
* API keys
* credentials
* private storage credentials

Provide safe development defaults only where appropriate.

---

## 11. Database Access

Do not create database connections inside individual route functions.

Use a centralized database configuration and dependency/session pattern.

Transactions must be handled deliberately.

---

## 12. Migrations

Every database schema change must have an Alembic migration.

Agents must not assume that changing a SQLAlchemy model automatically changes the PostgreSQL database.

Never use manual production database modification as the normal workflow.

---

## 13. Logging

Use structured, useful application logging.

Do not log:

* passwords
* JWT tokens
* secrets
* sensitive authentication data

Logs should help developers diagnose failures without exposing credentials.

---

## 14. Type Hints

Use Python type hints for:

* function parameters
* return values
* important variables
* service/repository interfaces

Avoid unnecessary untyped code.

---

## 15. Backend Testing

New backend functionality should have corresponding tests.

Critical workflows should have integration coverage.

At minimum, test:

* authentication
* authorization
* instrument creation
* application creation
* status transitions
* inspection
* certificate generation
* QR verification
* important validation failures

---

