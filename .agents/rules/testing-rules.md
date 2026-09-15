# `.agent/rules/testing-rules.md`

# METRIX Testing Rules

## 1. Testing Goal

Testing should provide confidence in the core METRIX workflow.

Testing must remain proportional to the project.

Do not spend the majority of the four-week project building an elaborate testing framework.

---

## 2. Backend Testing

Use:

**Pytest**

Backend features should have tests for important behavior.

---

## 3. Priority Testing Areas

Highest priority:

1. Authentication
2. Authorization
3. Instrument registration
4. Verification application
5. Status transitions
6. Scheduling
7. Inspection
8. Verification result
9. Certificate generation
10. QR verification
11. Expiry behavior

---

## 4. Unit Tests

Use unit tests for isolated business rules.

Examples:

* status transition validation
* certificate expiry calculation
* permission checks
* validation logic

---

## 5. Integration Tests

Use integration tests for important flows involving:

```text
API
↓
Service
↓
Repository
↓
Database
```

The golden workflow should have integration coverage where practical.

---

## 6. Frontend Testing

Frontend tests should focus on important user behavior.

Examples:

* login behavior
* form validation
* important workflow screens
* error handling
* certificate verification flow

Do not test implementation details unnecessarily.

---

## 7. Regression Testing

When fixing a bug:

1. reproduce the bug
2. fix the cause
3. add a regression test where practical
4. run relevant tests

---

## 8. Never Hide Failures

Agents must never:

* delete failing tests
* skip tests without reason
* disable linting to hide errors
* disable type checking to hide errors
* modify expected behavior merely to make tests pass

---

## 9. Test Claims

Agents must not say:

> "All tests pass."

unless the tests were actually executed and passed.

If tests could not be run, report that honestly.

---

## 10. Minimum Validation Before Completion

Before declaring a feature complete:

* run relevant backend tests
* run relevant frontend checks
* check for type errors
* check for lint errors where configured
* manually verify the important workflow when appropriate

---

