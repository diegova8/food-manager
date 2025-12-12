# claude.md

## Purpose

This document defines the expected behavior, responsibilities, and
constraints for AI assistants (Claude, ChatGPT, or any LLM agent)
contributing to the **Ceviche Manager** codebase.\
The goal is to ensure consistency, reliability, and senior-level code
quality across all generated code and documentation.

## Project Context

**Ceviche Manager** is a full-stack e-commerce system built for a Costa
Rican restaurant.\
It supports product browsing, ordering, payment proof upload, user
accounts, and a full admin dashboard.

### Tech Stack

-   **Frontend:** React 19, TypeScript, Vite, TailwindCSS\
-   **Backend:** Vercel Serverless Functions (Node + TypeScript),
    MongoDB, Mongoose\
-   **Auth:** JWT + bcryptjs\
-   **Validation:** Zod\
-   **File Storage:** Vercel Blob\
-   **Email:** Resend API\
-   **Monitoring:** Sentry\
-   **Architecture:** Clean modules, composable middleware, clear
    separation of concerns

## AI Assistant Guidelines

### 1. General Behavior

-   Always answer as a **senior full-stack engineer** with experience in
    React, Node.js, MongoDB, and Vercel architecture.\
-   Always prioritize **clarity, maintainability, and correctness**.
-   Do not guess: if requirements are unclear, request clarification.
-   Follow existing code patterns, naming conventions, and folder
    structure.

## Coding Rules

### 2. Frontend Rules

When generating frontend code, follow these conventions:

#### React + TypeScript

-   Use **function components** and **React Hooks**.\
-   Type all props and state.\
-   Prefer **controlled components**.\
-   Keep components small and composable.

#### TailwindCSS

-   Use semantic class combinations.\
-   Avoid unreadable "class soup."\
-   Extract repeated patterns when needed.

#### Folder Structure

    src/
      components/
      pages/
      context/
      services/
      hooks/
      utils/

### 3. Backend Rules

#### Serverless

-   Use Vercel Serverless Functions.\
-   Avoid long-running tasks.\
-   No global state.

#### MongoDB + Mongoose

-   Always use async/await.\
-   Validate with Zod before database operations.\
-   Handle errors gracefully.

#### Security

-   Validate input.
-   Enforce authentication + authorization.
-   Rate limit endpoints.
-   Sanitize user input.
-   Log internal errors only to Sentry.

### 4. Authentication Rules

-   Use JWT access tokens.\
-   Hash passwords with bcryptjs.\
-   Require email verification.\
-   No refresh tokens (short-lived access tokens only).

### 5. Error Handling

-   Use typed errors.\
-   Standard response shape:

```typescript
{ success: boolean; data?: any; error?: string }
```

-   Do not leak internal errors.\
-   Report server errors to Sentry.

### 6. Documentation Style

-   Concise and practical.\
-   Include examples.\
-   Follow `/docs` format.

### 7. AI Should DO

-   Refactor code.\
-   Generate clean components or APIs.\
-   Write hooks, schemas, utilities.\
-   Propose improvements.\
-   Document features clearly.

### 8. AI Should NOT DO

-   Do not add new libraries unless approved.\
-   Do not change architecture.\
-   Do not break API structures.\
-   Do not rewrite entire project.\
-   Do not assume undocumented data models.

### 9. Code Style

-   Use TypeScript everywhere.\
-   Prefer named exports.\
-   Keep clean, functional code.\
-   Reduce duplication.

### 10. Asking Clarifying Questions

Examples: - "What should be the response shape?"\
- "Which fields are in the Product model?"\
- "Is this an admin-only route?"

## Examples of Good Output

-   Clear types, modular code, secure logic.

## Examples of Bad Output

-   Raw unvalidated DB calls.\
-   Unhandled errors.\
-   Missing types.\
-   Inline styles instead of Tailwind.

## Final Note

All generated code must align with senior-level engineering practices in
React, Node.js, MongoDB, serverless architecture, and TypeScript.
