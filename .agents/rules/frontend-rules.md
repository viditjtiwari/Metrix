# `.agent/rules/frontend-rules.md`

# METRIX Frontend Rules

## 1. Technology

Frontend must use:

* Next.js
* TypeScript
* Tailwind CSS
* Redux Toolkit

RTK Query may be used for server/API state.

---

## 2. Frontend File Limit

Every frontend source file should remain at or below:

**300 lines**

If a component becomes too large, split it into logical components.

Do not artificially split components that are already small and cohesive.

---

## 3. TypeScript

Use TypeScript throughout the frontend.

Avoid:

```typescript
any
```

unless there is a documented and legitimate reason.

Prefer explicit types and shared API types.

---

## 4. Component Responsibilities

Components should have focused responsibilities.

Avoid giant components that contain:

* API calls
* business logic
* form logic
* table rendering
* modal rendering
* state management
* navigation
* validation

all in one file.

Extract logical responsibilities.

---

## 5. Pages

Pages should primarily compose:

* layout
* feature components
* data/state
* navigation

Do not make pages giant implementation files.

---

## 6. Feature Organization

Feature-specific code should live near its feature.

Example:

```text
features/
├── instruments/
├── applications/
├── inspections/
├── certificates/
└── auth/
```

Shared UI belongs in:

```text
components/
```

---

## 7. Redux

Redux Toolkit is for genuinely shared client state.

Good examples:

* authenticated user
* session information
* application-wide UI state where appropriate

Do not put every form field into Redux.

Do not use Redux merely because Redux is installed.

---

## 8. API State

Prefer RTK Query or the established API service layer for server state.

Avoid manually duplicating:

* loading state
* caching
* refetch logic
* error state

across many components when the API-state layer can handle it.

---

## 9. API Calls

Components should not scatter raw HTTP configuration throughout the application.

Centralize API communication.

Example:

```text
services/
features/
    ↓
API layer
    ↓
FastAPI
```

Authentication headers and common API behavior should be centralized where practical.

---

## 10. Styling

Tailwind CSS is the primary styling system.

Do not introduce another CSS framework.

Avoid excessive inline styles.

Use reusable components for repeated UI patterns.

---

## 11. Forms

Forms should:

* validate input
* show useful errors
* prevent invalid submissions
* provide loading states
* handle API errors clearly

User-facing errors should be understandable.

---

## 12. Loading and Error States

Every important asynchronous operation should consider:

* loading
* success
* failure
* empty state

Do not leave users staring at an unchanged page while a request is running.

---

## 13. Authentication UI

Frontend authentication is responsible for user experience.

Backend authentication remains authoritative.

Do not assume that hiding a button provides authorization.

Protected operations must also be checked by the backend.

---

## 14. Accessibility

Use:

* semantic HTML
* labels for form controls
* keyboard-accessible controls
* meaningful button text
* appropriate focus behavior
* useful error messages

Accessibility should be implemented without unnecessarily complicating the application.

---

## 15. Responsive Design

The application should be usable on:

* desktop
* tablet
* mobile browser

A dedicated mobile application is not required for the MVP.

The responsive web application is sufficient unless explicitly requested otherwise.

---

## 16. Reuse

Before creating a new component, check whether an existing component can be reused.

Avoid multiple visually different implementations of the same basic UI element.

---

## 17. Frontend Security

Never assume frontend validation is sufficient.

Frontend validation improves UX.

Backend validation provides security and correctness.
