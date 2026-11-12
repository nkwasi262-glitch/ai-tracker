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

### 10. Technical Clearance System (TCS) Integration & Data Exchange

#### `POST /api/tcs/referrals/inbound`
Ingests an upstream referral from Ghana's Technical Clearance System (TCS).
- **Authentication**: HMAC-SHA256 signature in `X-TCS-Signature` header verified against `TCS_SHARED_SECRET`.
- **Idempotency**: Prevents duplicate submissions using `tcsReferenceNumber`.
- **Payload**:
```json
{
  "tcsReferenceNumber": "TCS-GH-2026-8801",
  "institutionName": "Ministry of Health",
  "institutionCategory": "MDA",
  "projectTitle": "Radiology AI Triage Assistant",
  "projectDescription": "Chest X-ray automated anomaly detector",
  "projectOwner": "Head of Biomedical Informatics",
  "contactEmail": "biomed@moh.gov.gh",
  "aiTechnologyDeclared": "Deep Convolutional Neural Networks & Vision Transformers",
  "aiComponentDescription": "Automated diagnostic radiograph triage",
  "projectSector": "Health",
  "budgetGhs": 5500000,
  "fundingSource": "Consolidated Fund & Global Fund",
  "implementationTimeline": "2026 - 2028",
  "projectLocation": "Greater Accra & Ashanti",
  "screeningResult": { "containsAi": true, "confidence": 0.98 }
}
```

#### `GET /api/tcs/referrals`
Lists all inbound referrals with filtering by `status` (`pending_screening`, `accepted`, `rejected`, `returned`).

#### `GET /api/tcs/status`
Returns live health and handshake status of the TCS bidirectional integration adapter.

#### `POST /api/tcs/reports/return`
Transmits the final specialized AI assessment report and clearance decision back to upstream TCS.
- **Payload**:
```json
{
  "projectId": "proj-1",
  "tcsReferenceNumber": "TCS-GH-2026-8801",
  "decision": "Approved",
  "riskClassification": "High Risk",
  "assessmentFindings": { "compositeIndex": 89, "fairness": 86, "privacy": 95 },
  "conditions": ["Quarterly algorithmic drift audits required"],
  "officialReportUri": "/reports/gn-airgms-clearance-proj-1.pdf",
  "signedBy": "Dr. Kwaku Mensah (Super Administrator)"
}
```

---

### 11. AI Models & Foundation Weights Management

#### `GET /api/projects/:id/models`
Retrieves all registered AI model architectures, parameter sizes, and guardrail specifications for a project.

#### `POST /api/projects/:id/models`
Registers a new AI foundation model, architecture, or fine-tuning checkpoint.
- **Request Body**:
```json
{
  "modelName": "DeepSeek-R1-671B-MoE",
  "modelFamily": "DeepSeek-R1",
  "parameterCount": "671B (37B active)",
  "modality": "Text Reasoning",
  "deploymentType": "Self-Hosted (NITA Sovereign Cloud)",
  "vendor": "Open Source Fine-Tuned in Ghana",
  "contextWindow": "128k tokens",
  "hallucinationMitigation": "Deterministic RAG + verification guardrails"
}
```

---

### 12. Datasets Governance & Act 843 Sovereignty

#### `GET /api/projects/:id/datasets`
Retrieves all datasets associated with an AI project, including Data Protection Commission (DPC) registration numbers.

#### `POST /api/projects/:id/datasets`
Registers a training, fine-tuning, or evaluation dataset.
- **Request Body**:
```json
{
  "datasetName": "Ghana Health Services Clinical Scans 2025",
  "sourceEntity": "Ghana Health Service (GHS)",
  "recordsCount": "1,250,000",
  "containsPii": false,
  "consentBasis": "Statutory Mandate (Data Protection Act 843 Section 20)",
  "act843RegistrationNumber": "DPC-GH-2026-CERT-0199",
  "sovereignStorageLocation": "NITA Primary Data Centre, Accra"
}
```

---

### 13. 12-Domain Statutory AI Governance Assessment

#### `GET /api/projects/:id/assessments`
Retrieves scores, risk levels, and auditor findings across all 12 statutory domains.

#### `POST /api/projects/:id/assessments`
Records an auditor assessment for a specific statutory governance domain.
- **Domains**: Technical Architecture, Data Governance, Algorithmic Fairness, Explainability, Safety, Cybersecurity, Privacy, Human Oversight, Societal Impact, Auditability, Compliance, Vendor Risk.

---

### 14. Formal Regulatory Clearance Decisions

#### `GET /api/projects/:id/decisions`
Retrieves all formal regulatory decisions and conditions recorded for an AI project.

#### `POST /api/projects/:id/decisions`
Records an official regulatory clearance decision signed by Super Admin or Technical Unit.
- **Decisions**: `CLEARED`, `CONDITIONAL_CLEARANCE`, `PENDING_REMEDIATION`, `REJECTED`.

---

### 15. AI Incident, Drift & Anomaly Center

#### `GET /api/incidents`
Lists all reported AI incidents, categorized by severity (`P1`, `P2`, `P3`, `P4`) and status (`reported`, `investigating`, `remediating`, `resolved`, `closed`).

#### `POST /api/incidents`
Logs a new AI incident, safety anomaly, or algorithmic drift event.

#### `PUT /api/incidents/:id`
Updates incident investigation status, root cause analysis (RCA), and Corrective & Preventive Action Plan (CAPA).

---

### 16. Statutory AI Audits & Regulatory Inspections

#### `GET /api/audits`
Retrieves scheduled and completed statutory AI inspections.

#### `POST /api/audits`
Schedules a statutory audit with the mandatory 8-point NITA checklist under Act 771 and Act 843.

---

### 17. AI Vendor & Third-Party Technology Oversight

#### `GET /api/vendors`
Retrieves the national directory of accredited AI vendors and third-party technology providers.

#### `POST /api/vendors`
Accredits a new AI vendor, evaluating sovereign data residency, lock-in risk, and SLA guarantees.


