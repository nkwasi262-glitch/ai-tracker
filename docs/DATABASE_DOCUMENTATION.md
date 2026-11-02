# Republic of Ghana — GNAPRMS Database Documentation
## Neon Serverless PostgreSQL Database Architecture

### 1. Overview
The Ghana National AI Projects Registry & Monitoring System (GNAPRMS) utilizes **Neon Serverless PostgreSQL** for centralized persistence across all government Ministries, Departments, and Agencies (MDAs).

- **Database Provider**: [Neon](https://neon.tech)
- **Engine**: PostgreSQL 16+ (Serverless with Auto-scaling and Branching)
- **Driver**: `@neondatabase/serverless` (HTTP/WebSocket serverless driver)
- **Statutory Authority**: National Information Technology Agency (NITA Act 771)
- **Compliance Mandate**: Ghana Data Protection Act, 2012 (Act 843)

---

### 2. Connection Configuration

The application reads the connection string via the standard `DATABASE_URL` environment variable:

```bash
# In .env or Dokploy Environment Variables
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
```

#### Automatic Failover & Offline Tolerance
If `DATABASE_URL` is omitted or temporarily unreachable, GNAPRMS maintains zero downtime by automatically falling back to an in-memory/localStorage synchronized cache. As soon as the Neon database is reachable, synchronization resumes automatically.

---

### 3. Database Schema Specification

The schema is defined in [`server/schema.sql`](file:///server/schema.sql).

#### 3.1. `projects`
Stores the central catalog of national AI projects across all MDAs.
- `id` (VARCHAR(100), PK)
- `project_code` (VARCHAR(100), UNIQUE): Statutory project code (e.g., `GN-AI-2026-001`)
- `name` (VARCHAR(255)): Project title
- `description` (TEXT): High-level operational summary
- `category` (VARCHAR(100)): ML, Generative AI, Computer Vision, etc.
- `sector` (VARCHAR(100)): Health, Agriculture, Transport, Finance, etc.
- `stage` (VARCHAR(50)): Concept, Planning, Pilot, Operational, etc.
- `status` (VARCHAR(50)): Active, Delayed, Suspended, Completed
- `start_date` / `end_date` / `expected_completion_date` (DATE)
- `latitude` / `longitude` (DOUBLE PRECISION): Spatial GIS coordinates
- `mda` (VARCHAR(255)): Full MDA title (e.g., *Ghana Health Service*)
- `mda_code` (VARCHAR(50)): Institutional shortcode (e.g., *GHS*)
- `budget` (JSONB): Allocated, disbursed, utilized, and MoF warrant verification
- `compliance` (JSONB): 5-pillar Ethics scores (Fairness, Transparency, Accountability, Privacy, Security)
- `readiness_score` (INTEGER): AI readiness score (0-100%)
- `review_status` (VARCHAR(100)): Statutory clearance status
- `documents` (JSONB): Array of attached document metadata
- `created_at` / `updated_at` (TIMESTAMPTZ)

#### 3.2. `documents`
Tracks all uploaded project documents, technical specifications, and ethical charters.
- `id` (VARCHAR(100), PK)
- `project_id` (VARCHAR(100), FK -> projects.id)
- `file_name` (VARCHAR(255))
- `file_type` (VARCHAR(50)): pdf, docx, etc.
- `uploaded_at` (VARCHAR(50))
- `version` (INTEGER)
- `signed_by` (JSONB): Applied digital signatures
- `uploaded_by_mda` (VARCHAR(255))
- `review_status` (VARCHAR(100))
- `document_category` (VARCHAR(255))
- `full_document_text` (TEXT): Verbatim transcript extracted from original upload
- `reviewer_comments` (JSONB): Review directives from clearance authorities

#### 3.3. `dg_verdicts`
Official statutory clearance decisions issued by the Director General of NITA.
- `id` (VARCHAR(100), PK)
- `project_id` (VARCHAR(100))
- `project_code` (VARCHAR(100))
- `projectName` (VARCHAR(255))
- `mda` (VARCHAR(255))
- `verdict` (VARCHAR(100)): `Approve`, `Return for Further Review`, `Reject`
- `final_status_label` (VARCHAR(100)): `Approved`, `Requires More Understanding`, `Rejected`
- `mandatory_comments` (TEXT): Statutory reason or correction directive
- `reviewed_by_name` / `reviewed_by_role` / `reviewed_by_email` (VARCHAR)
- `timestamp` (TIMESTAMPTZ)
- `signature_seal` (VARCHAR(100)): Cryptographic seal identifier

#### 3.4. `audit_logs`
Cryptographically chained, immutable audit trail under Act 843.
- `id` (VARCHAR(100), PK)
- `timestamp` (TIMESTAMPTZ)
- `event_type` (VARCHAR(100)): GATE_SUBMISSION, DOCUMENT_UPLOAD, TECH_REVIEW, DG_VERDICT, etc.
- `actor_name` / `actor_email` / `actor_role` / `actor_institution` (VARCHAR)
- `target_module` / `target_entity_id` (VARCHAR)
- `action_details` (TEXT)
- `integrity_hash` (VARCHAR(255)): SHA-256 block hash
- `retention_until` (TIMESTAMPTZ): Mandatory 5-year retention date

#### 3.5. `internal_reports` & `report_comments`
Classified technical defect, ethics disparity, and drift monitoring reports.
- `id` (VARCHAR(100), PK)
- `report_code` (VARCHAR(100))
- `title` (VARCHAR(255))
- `summary` (TEXT)
- `severity` (VARCHAR(50)): Routine, Advisory, Urgent, Critical Escalation
- `status` (VARCHAR(50)): Open, Under Investigation, Resolved
- `comments` (JSONB): Threaded commentary between clearance officers

#### 3.6. `user_sessions`
Authenticated sessions and institutional role assignments.
- `id` (VARCHAR(100), PK)
- `email` (VARCHAR(255), UNIQUE)
- `full_name` (VARCHAR(255))
- `institution` (VARCHAR(255))
- `role` (VARCHAR(100))
- `onboarding_status` (VARCHAR(50)): `onboarding`, `pending_approval`, `approved`
- `last_active_at` (TIMESTAMPTZ)

---

### 4. Database Commands

```bash
# Start the API server and auto-initialize Neon DB schema:
npm run server

# Manually trigger schema verification and seed initial data:
npm run server:init
```

