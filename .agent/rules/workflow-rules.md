# `.agent/rules/workflow-rules.md`

# METRIX AI Agent Workflow Rules

## 1. Purpose

This file defines how AI coding agents must operate when modifying METRIX.

Agents are implementers, not architects acting without permission.

Agents may make reasonable local implementation decisions but must respect the project's established architecture and constraints.

---

## 2. Rule Loading

Before making changes, the agent must identify the applicable rules.

For backend work, read:

```text
project-rules.md
architecture-rules.md
backend-rules.md
database-rules.md
api-rules.md
testing-rules.md
workflow-rules.md
```

For frontend work, read:

```text
project-rules.md
architecture-rules.md
frontend-rules.md
api-rules.md
testing-rules.md
workflow-rules.md
```

For database work, additionally prioritize:

```text
database-rules.md
```

---

## 3. Rule Priority

The agent must follow this priority order:

```text
1. Explicit human instruction
2. project-rules.md
3. architecture-rules.md
4. Domain requirements
5. Backend / Frontend / Database / API rules
6. Testing rules
7. Existing code conventions
8. Agent preference
```

Agent preference is the lowest priority.

An agent must not override project constraints because it personally prefers another technology or architecture.

---

## 4. Understand Before Editing

Before changing code:

1. understand the task
2. inspect the relevant files
3. inspect related existing code
4. identify dependencies
5. identify API/database implications
6. determine which rules apply

Do not immediately start rewriting files.

---

## 5. Search Before Creating

Before creating:

* a component
* utility
* service
* repository
* API helper
* hook
* validation function

search the existing project for similar functionality.

Reuse existing code where appropriate.

---

## 6. Plan Before Implementing

For non-trivial tasks, create a short implementation plan.

The plan should identify:

```text
Task
Affected files
Database changes
API changes
Frontend changes
Tests
```

Do not produce a massive design document for a small change.

---

## 7. Smallest Correct Change

Implement the smallest change that correctly satisfies the requirement.

Do not:

* refactor unrelated code
* redesign unrelated screens
* rename unrelated variables
* reorganize the entire project
* introduce new architecture

unless explicitly requested.

---

## 8. Do Not Invent Requirements

If the task says:

> Add certificate expiry tracking.

Do not automatically add:

* email service
* SMS
* Redis
* background worker
* notification microservice

unless those are actually required.

---

## 9. No Silent Architecture Changes

Agents must not independently introduce:

* Docker
* microservices
* new databases
* Redis
* queues
* cloud infrastructure
* AI
* blockchain
* new frontend frameworks

without explicit approval.

---

## 10. Database Change Workflow

If a task changes the database:

```text
1. Inspect current model
2. Modify SQLAlchemy model
3. Create Alembic migration
4. Review migration
5. Update affected services
6. Update API schemas
7. Update frontend if required
8. Run tests
```

Do not modify only the model and assume the database is updated.

---

## 11. API Change Workflow

If an API changes:

```text
1. Identify existing contract
2. Determine whether change is necessary
3. Update backend schema
4. Update endpoint
5. Update frontend API usage
6. Update types
7. Update tests
8. Verify both sides
```

Never silently break the frontend.

---

## 12. Frontend Change Workflow

For frontend tasks:

```text
1. Inspect existing page
2. Inspect reusable components
3. Inspect API/service layer
4. Inspect relevant types
5. Implement feature
6. Keep components under line limit
7. Test loading/error/success states
8. Run frontend checks
```

---

## 13. Backend Change Workflow

For backend tasks:

```text
1. Inspect router
2. Inspect schema
3. Inspect service
4. Inspect repository
5. Inspect model
6. Determine whether migration is required
7. Implement
8. Add tests
9. Run tests
```

---

## 14. File Size Enforcement

Before completing a task, check:

```text
Backend files <= 500 lines
Frontend files <= 300 lines
```

If a file exceeds the limit:

* split by logical responsibility
* preserve readability
* preserve behavior

Do not simply remove functionality.

---

## 15. Dependency Discipline

Before adding a dependency, ask:

```text
Can the existing stack solve this reasonably?
```

If yes, use the existing stack.

If no, explain why the dependency is necessary.

---

## 16. Error Handling

When an error occurs:

1. identify the root cause
2. fix the cause
3. do not hide the error
4. do not weaken validation just to make the error disappear
5. add a regression test where appropriate

---

## 17. Verification Before Completion

Before reporting completion:

```text
[ ] Relevant rules followed
[ ] Existing code inspected
[ ] No unnecessary files changed
[ ] File-size limits checked
[ ] Backend tests run
[ ] Frontend checks run
[ ] API contract checked
[ ] Database migration checked if needed
[ ] No secrets introduced
[ ] No forbidden technology introduced
[ ] Golden workflow not broken
```

---

## 18. Reporting

After implementation, the agent should report:

### Changed

What was implemented.

### Files

Which important files were changed.

### Database

Whether a migration was required.

### API

Whether the API contract changed.

### Tests

Which tests/checks were run and their actual result.

### Notes

Any limitation, ambiguity, or follow-up item.

Do not claim work was completed if it was not actually completed.

---

## 19. Human Approval Required

Ask for human approval before making major architectural changes, including:

* changing the database technology
* changing FastAPI
* changing Next.js
* introducing Docker
* introducing microservices
* introducing AI
* introducing blockchain
* introducing a new infrastructure service
* changing authentication architecture
* changing the core workflow
* changing established API contracts in a breaking manner

---

## 20. Core Agent Principle

The agent must optimize for:

```text
Correctness
    ↓
Requirement compliance
    ↓
Simplicity
    ↓
Maintainability
    ↓
Testability
    ↓
Speed
```

Do not optimize for technological sophistication.

METRIX is a college project with a four-week deadline.

A simple working feature is better than an elaborate unfinished architecture.