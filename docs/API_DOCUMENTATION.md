# Republic of Ghana — GNAPRMS REST API Documentation
## Backend Endpoints & Neon PostgreSQL Integration

All API endpoints are served by the backend service on port `5000` (or proxied via `/api` in development and Nginx in production).

---

### 1. System Health & Database Diagnostics

#### `GET /api/health`
Returns system status and verified connection to the Neon PostgreSQL database.

**Sample Response (Connected)**:
```json
{
  "status": "ok",
  "service": "Ghana National AI Projects Registry & Monitoring System API",
  "timestamp": "2026-11-02T11:45:00.000Z",
  "database": {
    "provider": "Neon Serverless PostgreSQL",
    "connected": true,
    "configured": true,
    "database": "neondb",
    "serverTime": "2026-11-02T11:45:00.123Z",
    "driver": "@neondatabase/serverless"
  }
}
```

---

### 2. Project Portfolio Management

#### `GET /api/projects`
Retrieves all registered AI projects, ordered by creation date descending.

#### `POST /api/projects`
Registers a new project or updates an existing project in the Neon database.
**Request Body**:
```json
{
  "id": "proj-mda-onboard-ghs",
  "projectCode": "GN-AI-2026-GHS",
  "name": "Ghana Health Service (GHS)",
  "mda": "Ghana Health Service (GHS)",
  "mdaCode": "GHS",
  "budget": { "totalAllocated": 15000000, "disbursed": 0 },
  "compliance": { "fairness": 88, "privacy": 92, "overallGrade": "Good" },
  "readinessScore": 76,
  "status": "Active"
}
```

#### `PUT /api/projects/:id`
Updates specific attributes of a project (e.g. stage, review status, budget, or auto-assessment).

#### `POST /api/projects/:id/documents`
Attaches an uploaded document and its verbatim OCR transcript to a project.

---

### 3. Director General Statutory Verdicts

#### `GET /api/verdicts`
Retrieves all formal DG decisions and signed rationale.

#### `POST /api/verdicts`
Records an executive verdict (`Approve`, `Return for Further Review`, `Reject`).
**Request Body**:
```json
{
  "id": "verd-1730548800000",
  "projectId": "proj-1",
  "projectCode": "GN-AI-2026-001",
  "projectName": "GhanaPostGPS AI Delivery",
  "mda": "Ministry of Communications and Digitalisation",
  "verdict": "Approve",
  "finalStatusLabel": "Approved",
  "mandatoryComments": "Approved following verified compliance with NITA Act 771.",
  "reviewedByName": "Hon. Director General",
  "reviewedByRole": "Director General",
  "reviewedByEmail": "dg@nita.gov.gh"
}
```

---

### 4. Act 843 Statutory Audit Logs

#### `GET /api/audit-logs`
Fetches the immutable statutory audit trail (most recent 500 records), including forensic `previousValues`, `newValues`, and distributed `correlationId`.

#### `POST /api/audit-logs`
Appends an immutable audit log record with SHA-256 block integrity hash and optional field diff payload.

---

### 5. Classified Internal Reports

#### `GET /api/reports`
Retrieves all classified technical defect and drift monitoring reports.

#### `POST /api/reports`
Creates or updates an internal report dossier.

---

### 6. Institutions Directory (MDAs, MMDAs, SOEs)

#### `GET /api/institutions`
Retrieves registered public institutions across Ghana.
- **Query Parameters**:
  - `category`: Filter by `MDA`, `MMDA`, `SOE`, `Regulatory`
  - `region`: Filter by administrative region (e.g., `Greater Accra`, `Ashanti`)
  - `status`: Filter by `Active`, `Pending`, `Suspended`
  - `search`: Case-insensitive text query matching code, name, or head of institution

#### `POST /api/institutions`
Registers or updates a public institution.
- Automatically generates an immutable audit record in `audit_logs`.

---

### 7. Application Version & Release Management

#### `GET /api/system/versions`
Retrieves chronological software version releases, changelogs, feature additions, bug fixes, and security improvements.

#### `POST /api/system/versions`
Registers a new application release version.

---

### 8. System Backups & Disaster Recovery

#### `GET /api/system/backups`
Lists all available backup snapshot archives stored in the secure backup repository.

#### `POST /api/system/backup`
Triggers an immediate cryptographic snapshot export of all 8 core PostgreSQL tables, generating a timestamped JSON file with SHA-256 checksum and automated retention pruning.

#### `POST /api/system/dr-drill`
Executes an automated disaster recovery integrity drill against the latest backup snapshot, validating SHA-256 checksum signatures, schema completeness, referential foreign key sanity, and automated RTO/RPO SLA reporting.

---

### 9. Security Headers, Rate Limiting & Correlation IDs

Every response from the GNAPRMS API includes statutory security and traceability headers:
- `X-Request-ID` / `X-Correlation-ID`: Unique tracing token for end-to-end request lifecycle auditing.
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `X-RateLimit-Limit: 300` (Max 300 requests per minute per IP)
- `X-RateLimit-Remaining`: Remaining request quota in the active sliding window.
Retrieves all internal technical reports, categorized by severity.

#### `POST /api/reports`
Submits a classified issue report.

---

### 6. Authentication & Session Cache

#### `POST /api/auth/session`
Syncs the active user's institutional session and clearance tier.

