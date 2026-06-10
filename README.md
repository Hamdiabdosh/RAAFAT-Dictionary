# RAAFAT-Dictionary

**Harari Collaborative Dictionary & Language Preservation Platform**

A Progressive Web Application (PWA) that enables the Harari community to search, contribute to, review, and preserve a verified multilingual dictionary.

## Documentation

| Document | Description |
|----------|-------------|
| [Software Requirements Specification (SRS)](docs/SRS.md) | Functional and non-functional requirements, user roles, V1 scope |
| [Software Architecture Document (SAD)](docs/SAD.md) | System design, tech stack, database schema, deployment |

## Project Assets

| File | Description |
|------|-------------|
| `meshia_dictionary.json` | Seed dictionary data (~88k entries) |
| `meshia_dictionary.csv` | CSV export of dictionary data |
| `meshia_dictionary_review_tool.html` | Standalone review tool (prototype) |

## V1 Scope

1. Search
2. Entry page
3. Suggest correction
4. Voting
5. Review queue
6. Contributor profiles
7. PWA offline support

Everything else is deferred until the community is actively contributing.

## Stack (Summary)

- **Frontend:** Next.js, TypeScript, Tailwind, PWA
- **Backend:** Next.js API Routes (modular monolith)
- **Database:** PostgreSQL via Prisma
- **Auth:** Better Auth or Auth.js
- **Storage:** Cloudflare R2
- **Hosting:** Coolify (self-hosted)
- **Domain:** Namecheap

## Status

**Pre-development** — requirements and architecture documented. Implementation not yet started.
