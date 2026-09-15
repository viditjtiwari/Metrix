# `.agent/rules/api-rules.md`

# METRIX API Rules

## 1. API Style

Use REST-style HTTP APIs.

Base path:

```text
/api/v1
```

---

## 2. Resource Naming

Use plural resource names.

Examples:

```text
/api/v1/users
/api/v1/instruments
/api/v1/applications
/api/v1/inspections
/api/v1/certificates
```

Avoid inconsistent naming.

---

## 3. HTTP Methods

Use HTTP methods according to their intended purpose.

```text
GET     retrieve
POST    create
PUT     replace/update where appropriate
PATCH   partial update
DELETE  delete where explicitly supported
```

---

## 4. Request and Response Contracts

Every meaningful endpoint should have an explicit request/response schema.

Do not return arbitrary dictionaries when a stable response model is appropriate.

---

## 5. API Versioning

All application endpoints should initially live under:

```text
/api/v1
```

Do not create unnecessary versions.

---

## 6. Authentication

Protected endpoints must require authentication.

Authorization must also be checked according to the user's role.

Never rely solely on frontend access control.

---

## 7. Error Responses

Errors should be consistent and useful.

Example structure:

```json
{
  "detail": "Verification application cannot be scheduled in its current status."
}
```

Do not expose:

* stack traces
* SQL queries
* passwords
* tokens
* internal implementation details

---

## 8. Status Codes

Use appropriate HTTP status codes.

Examples:

```text
200 OK
201 Created
204 No Content
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
500 Internal Server Error
```

---

## 9. Pagination

Large collection endpoints should support pagination where required.

Do not return thousands of records by default simply because the current dataset is small.

Keep pagination simple.

Example:

```text
?page=1&page_size=20
```

---

## 10. Filtering

Use predictable query parameters.

Example:

```text
/applications?status=SUBMITTED
```

Do not create separate endpoints for every possible filter combination.

---

## 11. API Changes

Agents must not silently change:

* endpoint paths
* request fields
* response fields
* field meanings
* status values

If an existing API must change, update the relevant frontend usage and documentation.

---

## 12. API Documentation

FastAPI's generated OpenAPI documentation should remain useful.

Endpoint names, schemas, and descriptions should be understandable.

---

