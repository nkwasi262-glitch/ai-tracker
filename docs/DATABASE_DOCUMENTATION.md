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
Cryptographically chained, immutable audit trail under Act 843 with field-level forensic diffing.
- `id` (VARCHAR(100), PK)
- `timestamp` (TIMESTAMPTZ)
- `event_type` (VARCHAR(100)): GATE_SUBMISSION, DOCUMENT_UPLOAD, PROJECT_FIELD_UPDATE, TECH_REVIEW, DG_VERDICT, etc.
- `actor_name` / `actor_email` / `actor_role` / `actor_institution` (VARCHAR)
- `target_module` / `target_entity_id` (VARCHAR)
- `action_details` (TEXT)
- `integrity_hash` (VARCHAR(255)): SHA-256 block hash
- `retention_until` (TIMESTAMPTZ): Mandatory statutory retention date (7 years)
- `previous_values` (JSONB): Pre-modification snapshot of altered record attributes
- `new_values` (JSONB): Post-modification patch values
- `correlation_id` (VARCHAR(100)): Distributed request correlation identifier (`X-Request-ID`)

#### 3.5. `internal_reports` & `report_comments`
Classified technical defect, ethics disparity, and drift monitoring reports.
- `id` (VARCHAR(100), PK)
- `report_code` (VARCHAR(100))
- `title` (VARCHAR(255))
- `summary` (TEXT)
- `severity` (VARCHAR(50)): Routine, Advisory, Urgent, Critical Escalation
- `project_id` / `project_code` / `document_id` (VARCHAR)
- `assigned_role` (VARCHAR(100))
- `read_by` (JSONB)
- `comments` (JSONB)

#### 3.6. `institutions`
Directory of public institutions covering Ministries, Departments, Agencies (MDAs), Metropolitan, Municipal, and District Assemblies (MMDAs), and State-Owned Enterprises (SOEs) across Ghana.
- `id` (VARCHAR(100), PK)
- `code` (VARCHAR(50), UNIQUE): Official short identifier (e.g., `NITA`, `MOCD`, `AMA`, `KMA`)
- `name` (VARCHAR(255)): Full statutory name
- `category` (VARCHAR(50)): Classification (`MDA`, `MMDA`, `SOE`, `Regulatory`)
- `sector` (VARCHAR(100)): Primary functional sector
- `status` (VARCHAR(50)): Operational status (`Active`, `Pending`, `Suspended`)
- `contact_email` (VARCHAR(255)): Official administrative contact email
- `region` (VARCHAR(100)): Administrative region (16 regions of Ghana)
- `district` (VARCHAR(100)): Local administrative district
- `active_projects_count` (INTEGER): Cached number of live AI projects

#### 3.7. `app_versions`
Application version and release lifecycle tracking registry.
- `id` (VARCHAR(100), PK)
- `version` (VARCHAR(50), UNIQUE): Semantic version number (e.g., `1.2.0`)
- `release_number` (INTEGER): Sequential build/release counter
- `release_date` (DATE): Formal rollout date
- `title` (VARCHAR(255)): Strategic milestone title
- `release_notes` (TEXT): High-level operational release notes
- `new_features` (JSONB): Structured array of added functional capabilities
- `bug_fixes` (JSONB): Structured array of resolved bugs
- `security_improvements` (JSONB): Hardened security and cryptographic controls
- `deployed_by` (VARCHAR(255)): Responsible engineering lead or directorate
- `deployment_status` (VARCHAR(50)): `Deployed`, `Staged`, or `Rollback`

---

### 4. Row-Level Security (RLS) Policies

All primary operational tables enforce PostgreSQL Row-Level Security:
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```
Permissive application role access policies ensure seamless querying by the authenticated backend connection pool while preventing unauthorized cross-tenant row traversal.

---

### 5. Automated Backup & Recovery Architecture

- **Engine**: JSON snapshot serialization with SHA-256 cryptographic checksums (`server/backup.js`).
- **Storage Location**: `server/backups/gnaprms_backup_<timestamp>.json`
- **Retention Schedule**: Automated retention retaining the latest 30 snapshots with automated file pruning.
- **Disaster Recovery Validation**: Automated verification script (`server/restoreTest.js`) testing schema conformity, cryptographic integrity, referential foreign key sanity, and automated RTO/RPO SLA reporting.
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

