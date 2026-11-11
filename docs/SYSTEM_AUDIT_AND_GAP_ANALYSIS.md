# Republic of Ghana — National AI Projects Registry & Monitoring System (GNAPRMS)
# Comprehensive System Audit, Gap Analysis & Architecture Evaluation Report

```
══════════════════════════════════════════════════════════════════════════════════════════════════════════
  STATUTORY AUTHORITY: National Information Technology Agency (NITA Act 771)
  DATA PRIVACY MANDATE: Data Protection Act, 2012 (Act 843)
  CYBERSECURITY FRAMEWORK: Cybersecurity Act, 2020 (Act 1038)
══════════════════════════════════════════════════════════════════════════════════════════════════════════
```

---

## 1. Executive Summary & Assessment Context

GNAPRMS is an active, production-grade enterprise system designed to serve as the sovereign central registry and continuous monitoring platform for Artificial Intelligence deployments across all Ministries, Departments, and Agencies (MDAs) and Metropolitan, Municipal, and District Assemblies (MMDAs) in the Republic of Ghana.

Following statutory directives, the system functions as a **downstream intake registry and active monitoring platform** receiving cleared project dossiers from the National Technical Clearance System, auto-grading submissions against ethical and capability frameworks, and presenting real-time operational analytics across three strictly defined role profiles.

This technical audit and gap analysis was conducted under the principle:
> **INSPECT FIRST, COMPARE SECOND, IMPLEMENT THIRD.**  
> Working features are preserved without regression, duplication, or destructive data alterations.

---

## 2. Phase One: Complete Existing System Audit

### A. System Architecture Inspection

| Architectural Layer | Implementation Technology | Status | Audit Findings |
| :--- | :--- | :---: | :--- |
| **Frontend Framework** | React 18.2.0 + TypeScript 5.2.2 + Vite 5.1.4 | **HEALTHY** | High-performance SPA with fast client bundling (7.9s build), modular Lucide icons, and Recharts analytics. |
| **Backend Service** | Node.js v22 (ESM) + Express 5.3.0 | **HEALTHY** | RESTful API service on port 5000 with CORS, JSON payload parsing up to 50MB for OCR multi-page dossiers. |
| **Database Engine** | Neon Serverless PostgreSQL 16+ | **CONNECTED** | Connected via `@neondatabase/serverless` using `DATABASE_URL` with SSL enforcement (`sslmode=require`). |
| **Ingress & Proxy** | Nginx Reverse Proxy / Docker Container | **CONFIGURED** | Containerized with multi-stage Dockerfile and Nginx routing (`/api` -> backend:5000, `/` -> static build). |
| **Authentication Gate** | Mandatory Statutory Gatekeeper Modal | **ACTIVE** | Enforces institutional email validation (`.gov.gh`), Act 843 statutory consent, and Postgres user caching. |
| **Role-Based Access** | Deterministic RBAC Policy Engine | **STRICT** | Strictly limits active profiles to `Super Admin`, `Technical Director`, and `Public User` (substance view-only). |

### B. Existing Database Structure Assessment

- **Connection**: `server/db.js` initializes `@neondatabase/serverless` driver using `process.env.DATABASE_URL`.
- **Connectivity Status**: Verified live connection to `neondb` on AWS `us-east-2`.
- **Existing Schema Tables** (in `server/schema.sql`):
  1. `projects` (12 rows): Central project catalog, budget allocations, compliance scores, readiness score, documents metadata.
  2. `documents` (0 rows in Postgres, populated via intake): Multi-page OCR transcripts, digital signatures, reviewer directives.
  3. `dg_verdicts` (3 rows): Executive clearance verdicts, statutory commentary, and cryptographic seals.
  4. `audit_logs` (3 rows): Cryptographically hashed (SHA-256) audit events with 5-year retention dates under Act 843.
  5. `internal_reports` (1 row): Classified defect and ethical drift reports with severity rankings and commentary.
  6. `user_sessions` (3 rows): Cached user accounts, active role assignments, and authentication timestamps.

### C. Existing Application Features Assessment

- **Multiple Institution Support**: Implemented via `STANDARD_INSTITUTIONS` catalogue in `src/data/authTypes.ts` covering 20 major MDAs, MMDAs, and SOEs.
- **Continuous Intake Path**: Implemented via `/api/technical-clearance/documents` with automated scanning against Governance & Ethics (5 pillars) and AI Readiness (including `Verified by NITA`).
- **Dashboard Analytics**: Implemented with real-time budget aggregations, sector focus filtering, readiness radar, and project monitoring table.
- **GIS Geospatial Map**: Implemented with regional distribution overlays, territorial boundaries, and edge telemetry simulation.
- **Audit Logging**: Implemented with SHA-256 block hashing and 5-year retention under Act 843.
- **Pre-Configured Test Accounts**: Implemented with 1-click auto-fill on the entry gate for Super Admin, Technical Director, and Public User.

### D. Code Quality & Vulnerability Identification

1. **Database Schema Enhancements Needed**:
   - `institutions` table currently lives as an in-memory array in TypeScript (`authTypes.ts`). Migrating and synchronizing registered institutions into a dedicated PostgreSQL table (`institutions`) enables institutional administrators, active/inactive status tracking, and database-level multi-tenancy.
   - `audit_logs` table records `action_details` as text, but lacks structured `previous_values` and `new_values` JSONB columns to capture forensic field-level diffs on updates.
   - Row-Level Security (RLS) policies are not yet explicitly declared on the PostgreSQL tables.
2. **Application Version & Release Management**:
   - Application version is static in `package.json` (`1.0.0`). The system lacks a database-backed version tracking table (`app_versions`) and admin interface to review deployment history, changelogs, and rollback metadata.
3. **Automated Backup & Disaster Recovery**:
   - While `seedData.json` acts as an initial seed, there is no dedicated automated backup script (`server/backup.js`) to export snapshots with RPO/RTO metrics and verification tests.
4. **Security Enhancements**:
   - API endpoints lack rate limiting and explicit security headers (Helmet / security headers).

---

## 3. Phase Two: Gap Analysis Matrix

The following matrix compares current system capabilities against enterprise requirements:

| Requirement | Existing Status | Identified Gap | Recommended Action |
| :--- | :---: | :--- | :--- |
| **Neon PostgreSQL Integration** | **IMPLEMENTED** | Serverless connection verified and functioning. Lacks connection pooler documentation for heavy workloads. | Retain connection. Document connection pooler string and ensure failover resilience. |
| **MDA/MMDA Support** | **PARTIALLY IMPLEMENTED** | Institutions catalog exists in code; projects are tagged by MDA. Lacks dedicated DB table for institutional metadata and lifecycle. | Create `institutions` table in PostgreSQL; seed standard MDAs/MMDAs; add institutional registry endpoints. |
| **Institution Isolation** | **PARTIALLY IMPLEMENTED** | Frontend enforces role views; backend lacks institutional tenancy filtering for non-superadmin officers. | Add backend validation ensuring officers can only mutate projects belonging to their institution unless Super Admin. |
| **User Management** | **IMPLEMENTED** | Three active role profiles enforced; test accounts seeded in Neon DB; 1-click login auto-fill active. | Preserve existing user session architecture; link user accounts to `institution_id`. |
| **Audit Tracking** | **PARTIALLY IMPLEMENTED** | Audit log records actor, timestamp, hash, and action text. Lacks structured `previous_values` / `new_values` JSONB diffs. | Add `previous_values` and `new_values` columns to `audit_logs`; log field diffs on `PUT /api/projects/:id`. |
| **Update & Version Tracking** | **MISSING** | No table or API tracks application versions, releases, feature changelogs, or deployment rollback targets. | Create `app_versions` table in PostgreSQL; implement `/api/system/versions` API and admin version viewer. |
| **Role-Based Access Control (RBAC)** | **IMPLEMENTED** | Strictly enforces Super Admin, Technical Director, and Public User (substance view-only). | Retain existing RBAC engine; maintain 100% test pass rate. |
| **Row-Level Security (RLS)** | **MISSING** | PostgreSQL tables do not have RLS enabled or tenant isolation policies defined. | Prepare non-destructive migration enabling RLS with permissive policies for application role. |
| **Backup and Recovery** | **PARTIALLY IMPLEMENTED** | Fallback seed data exists. Automated snapshot utility, restoration test, and RPO/RTO metrics missing. | Implement `server/backup.js` and `server/restoreTest.js` with JSON/SQL dump and automated recovery test. |
| **Security Monitoring & Headers** | **PARTIALLY IMPLEMENTED** | Strict `.gov.gh` domain validation active. Lacks API rate limiting and security HTTP headers. | Implement rate limiting middleware and security headers on Express API. |
| **Central Admin Dashboard** | **PARTIALLY IMPLEMENTED** | Master project KPIs active. Lacks institutional summary widget (Total MDAs/MMDAs, Active vs Inactive). | Add Institutional Statistics & Version Status cards to the Administrator view. |
| **Notifications** | **IMPLEMENTED** | In-app monitoring notices active for delayed projects and newly cleared dossiers. | Retain and enrich existing notification banners. |
| **API Security** | **PARTIALLY IMPLEMENTED** | Large payload limits (50MB) active. Lacks body sanitization and request correlation IDs. | Add request correlation ID (`X-Request-ID`) and payload validation. |
| **Documentation** | **PARTIALLY IMPLEMENTED** | Multiple markdown files exist across `docs/` and root. Needs consolidation into unified guides. | Update documentation to accurately reflect actual architecture and new operational utilities. |

---

## 4. Phase Three: Safe Implementation Plan

To respect all development rules and avoid breaking changes, implementation proceeds in strict order:

1. **Database Schema Enhancements (Non-Destructive Migration)**:
   - Add `institutions` table with standard Ghanaian MDAs and MMDAs.
   - Add `app_versions` table for release tracking.
   - Add `previous_values` and `new_values` JSONB columns to `audit_logs`.
   - Add RLS enablement scripts.
2. **Backend Services & Endpoints**:
   - Add `GET /api/institutions` and `POST /api/institutions`.
   - Add `GET /api/system/versions` and `POST /api/system/versions`.
   - Add `X-Request-ID` correlation middleware and rate limiting to `server/index.js`.
   - Update `PUT /api/projects/:id` to record structured previous and new values in audit logs.
3. **Backup & Disaster Recovery Utilities**:
   - Create `server/backup.js` (automated backup generator with metadata and retention).
   - Create `server/restoreTest.js` (independent restoration verification).
4. **Frontend Enhancements (Preserving Design & Components)**:
   - Connect institutional analytics and version history widgets in the administrator view.
   - Connect API client to new endpoints while maintaining local fallback resilience.
5. **Quality Assurance & Verification**:
   - Run complete test suite and add verification tests for multi-institution and version tracking.
   - Verify production build (`tsc && vite build`).
6. **Documentation Unification**:
   - Update `docs/DATABASE_DOCUMENTATION.md` and `docs/API_DOCUMENTATION.md`.
   - Produce Final Implementation Report.

