# Software Requirements Specification (SRS)

**Project:** RAAFAT-Dictionary  
**Subtitle:** Harari Collaborative Dictionary & Language Preservation Platform  
**Version:** 1.0  
**Status:** Draft — Pre-development

---

## Table of Contents

1. [Purpose](#1-purpose)
2. [Scope](#2-scope)
3. [User Roles](#3-user-roles)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Requirements](#6-data-requirements)
7. [Version 1 Scope](#7-version-1-scope)
8. [Deferred Features](#8-deferred-features)

---

## 1. Purpose

RAAFAT-Dictionary is a Progressive Web Application (PWA) that enables the Harari community to:

- Search multilingual dictionary entries
- Submit corrections
- Review proposed changes
- Vote on language accuracy
- Preserve Harari vocabulary
- Build a verified language resource

The platform's primary goal is **language preservation through community collaboration**.

### Existing Assets

The project begins with seed data derived from the Meshia dictionary corpus:

- `meshia_dictionary.json` — structured entry data
- `meshia_dictionary.csv` — tabular export
- `meshia_dictionary_review_tool.html` — prototype review interface

These assets inform the initial data model and import pipeline but are not the production application.

---

## 2. Scope

### 2.1 Dictionary Search

Users can search across four languages:

| Language | Searchable Fields |
|----------|-------------------|
| Harari | Primary term |
| English | Translation |
| Amharic | Translation |
| Oromo | Translation |

### 2.2 Contribution System

Authenticated contributors can:

- Suggest corrections to existing entries
- Add new entries
- Add example sentences
- Report mistakes

### 2.3 Review System

Reviewers can:

- Accept changes
- Reject changes
- Comment on suggestions
- Vote on proposals

### 2.4 Reputation System

Users earn recognition through:

- Points for accepted contributions
- Badges for milestones
- Reviewer levels based on activity

### 2.5 Offline Access

Users can:

- Install the app as a PWA
- Search cached entries offline
- Save review and submission drafts locally

---

## 3. User Roles

### 3.1 Guest

| Allowed | Not Allowed |
|---------|-------------|
| Search dictionary | Edit entries |
| Browse entries | Vote |
| View entry details | Comment |

### 3.2 Contributor

Inherits guest permissions, plus:

- Suggest edits
- Add entries
- Add examples
- Comment on entries and suggestions

### 3.3 Reviewer

Inherits contributor permissions, plus:

- Approve submissions
- Reject submissions
- Vote on proposals
- Access review queue

### 3.4 Admin

Inherits reviewer permissions, plus:

- Manage users and roles
- Manage content (override decisions)
- Export datasets
- Configure system settings

---

## 4. Functional Requirements

### FR-01 — Search Dictionary

| Attribute | Value |
|-----------|-------|
| **Description** | Search words across all supported languages |
| **Actor** | Guest, Contributor, Reviewer, Admin |
| **Input** | Search query (string) |
| **Output** | Paginated list of matching entries |
| **Acceptance Criteria** | Results returned in under 500ms; supports partial and exact match |

---

### FR-02 — View Entry

| Attribute | Value |
|-----------|-------|
| **Description** | Display full details for a single dictionary entry |
| **Actor** | All roles |
| **Output** | Entry record including: Harari, English, Amharic, Oromo, examples, status, source |
| **Acceptance Criteria** | All language fields visible; verification status clearly indicated |

---

### FR-03 — Add Entry

| Attribute | Value |
|-----------|-------|
| **Description** | Submit a new dictionary entry for review |
| **Actor** | Contributor, Reviewer, Admin |
| **Input** | Harari, English, Amharic, Oromo, category, examples |
| **Output** | Entry created with status `pending_review` |
| **Acceptance Criteria** | Entry not publicly verified until approved by a reviewer |

---

### FR-04 — Suggest Edit

| Attribute | Value |
|-----------|-------|
| **Description** | Propose a change to an existing entry field |
| **Actor** | Contributor, Reviewer, Admin |
| **Input** | Entry ID, field name, proposed value |
| **Stored** | Current value, proposed value, user ID, timestamp |
| **Output** | Suggestion created with status `pending` |
| **Acceptance Criteria** | Original entry unchanged until suggestion is approved |

---

### FR-05 — Vote

| Attribute | Value |
|-----------|-------|
| **Description** | Cast a vote on a suggestion or entry accuracy |
| **Actor** | Reviewer, Admin |
| **Input** | Suggestion ID, vote type |
| **Vote Types** | `correct`, `incorrect`, `needs_discussion` |
| **Acceptance Criteria** | One vote per user per suggestion; votes are auditable |

---

### FR-06 — Discussion

| Attribute | Value |
|-----------|-------|
| **Description** | Threaded comments on entries and suggestions |
| **Actor** | Contributor, Reviewer, Admin |
| **Input** | Entry or suggestion ID, comment content |
| **Output** | Comment with replies, author, timestamp |
| **Acceptance Criteria** | Comments visible on entry page; replies nested one level |

---

### FR-07 — Notification System

| Attribute | Value |
|-----------|-------|
| **Description** | Notify users of relevant activity |
| **Actor** | System |
| **Triggers** | Suggestion approved, suggestion rejected, new review needed |
| **Delivery** | In-app notifications (email deferred to post-V1) |
| **Acceptance Criteria** | User sees unread count; notifications link to relevant item |

---

### FR-08 — Reputation

| Attribute | Value |
|-----------|-------|
| **Description** | Award points and badges for community contributions |
| **Actor** | System |
| **Point Events** | Accepted edits, new entries approved, reviews completed |
| **Output** | Updated reputation score, badge awards, reviewer level |
| **Acceptance Criteria** | Points visible on contributor profile; levels unlock review privileges |

---

### FR-09 — Export Data

| Attribute | Value |
|-----------|-------|
| **Description** | Export verified dictionary data |
| **Actor** | Admin |
| **Formats** | JSON, CSV |
| **Acceptance Criteria** | Export includes all verified entries with metadata |

---

### FR-10 — Offline Mode

| Attribute | Value |
|-----------|-------|
| **Description** | Core functionality available without network |
| **Actor** | All roles |
| **Capabilities** | Search cached entries, browse cached entries, save submission drafts |
| **Acceptance Criteria** | PWA installable; offline search works on previously cached data |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Metric | Target |
|--------|--------|
| Search response time | < 500ms (p95) |
| Entry page load | < 1s (p95) |
| API availability during peak | No degradation below targets |

### 5.2 Availability

| Metric | Target |
|--------|--------|
| Uptime | 99% monthly |

### 5.3 Scalability

| Resource | Target |
|----------|--------|
| Dictionary entries | 100,000+ |
| Registered users | 50,000 |

### 5.4 Security

| Concern | Requirement |
|---------|-------------|
| Authentication | JWT-based sessions |
| Password hashing | Argon2 |
| Authorization | Role-based access control (RBAC) |
| Transport | HTTPS only (enforced at reverse proxy) |

### 5.5 Accessibility

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Screen reader support for search and entry views

### 5.6 Localization

UI available in:

- Harari
- English
- Amharic
- Oromo

Default UI language: English. User preference persisted in profile.

### 5.7 Deployment

| Concern | Requirement |
|---------|-------------|
| Hosting | Self-hosted via [Coolify](https://coolify.io) |
| Domain | Registered via Namecheap; DNS pointed to Coolify server |
| Environments | `production`, `staging` (minimum) |

---

## 6. Data Requirements

### 6.1 Dictionary Entry

```json
{
  "id": "uuid",
  "harari": "string",
  "english": "string",
  "amharic": "string",
  "oromo": "string",
  "category": "string",
  "partOfSpeech": "string",
  "exampleHarari": "string",
  "exampleEnglish": "string",
  "status": "verified | pending_review | rejected",
  "source": "string",
  "createdBy": "uuid",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### 6.2 Suggestion

```json
{
  "id": "uuid",
  "entryId": "uuid",
  "fieldName": "string",
  "oldValue": "string",
  "newValue": "string",
  "userId": "uuid",
  "status": "pending | approved | rejected",
  "createdAt": "ISO-8601"
}
```

### 6.3 User Profile

```json
{
  "id": "uuid",
  "name": "string",
  "email": "string",
  "role": "guest | contributor | reviewer | admin",
  "reputation": 0,
  "badges": [],
  "createdAt": "ISO-8601"
}
```

### 6.4 Seed Data Mapping

Existing `meshia_dictionary.json` fields map to the entry model as follows:

| Source Field | Target Field |
|--------------|--------------|
| `id` | Import reference (new UUID assigned) |
| `harari` | `harari` |
| `english` | `english` |
| `amharic` | `amharic` |
| `oromo` | `oromo` |
| `section` | `category` |
| `verified` | `status` (`true` → `verified`, `false` → `pending_review`) |
| `page` | `source` metadata |

---

## 7. Version 1 Scope

V1 is intentionally narrow. A small team should be able to build and launch within a few months.

| # | Feature | Included |
|---|---------|----------|
| 1 | Search | Yes |
| 2 | Entry page | Yes |
| 3 | Suggest correction | Yes |
| 4 | Voting | Yes |
| 5 | Review queue | Yes |
| 6 | Contributor profiles | Yes |
| 7 | PWA offline support | Yes |
| — | Add new entry (FR-03) | Yes (via suggestion flow) |
| — | Discussion (FR-06) | Minimal — comments on suggestions only |
| — | Notifications (FR-07) | In-app only |
| — | Reputation (FR-08) | Basic points; badges deferred |
| — | Export (FR-09) | Admin CSV/JSON export |
| — | Full localization | English UI first; i18n framework in place |

---

## 8. Deferred Features

The following are explicitly **out of V1 scope**. Build them only after the community is actively contributing.

| Module | Description |
|--------|-------------|
| Audio pronunciation | Record and play native speaker pronunciations |
| Example sentence corpus | Community-generated usage examples at scale |
| Language learning | Flashcards, quizzes, spaced repetition |
| AI assistant | Harari translation, grammar assistance |
| Email notifications | Digest and real-time email alerts |
| Advanced reputation | Badges, leaderboards, reviewer certification |
| Full trilingual UI | Complete Harari, Amharic, Oromo interface translations |

---

*See [SAD.md](./SAD.md) for architecture, technology choices, and deployment details.*
