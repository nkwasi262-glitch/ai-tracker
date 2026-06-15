# Database Schema & Entity Relationship Diagram (ERD): GNAPRMS

This document outlines the database design for the **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)**, deploying a hybrid strategy that leverages **PostgreSQL** for strict relational transactions and **MongoDB** for unstructured audits, document trees, and dynamic risk logs.

---

## 1. Hybrid Storage Strategy

* **PostgreSQL (Transactional Engine)**: Handles standard records with foreign key constraints where reliability, mathematical accuracy, and relationship structures are critical (e.g., funding disbursements, user identity, project stages, governance scorecards, and regulatory compliance logs).
* **MongoDB (Document Store)**: Houses unstructured, high-frequency, or evolving documents (e.g., detailed Risk Registers, OCR-extracted full texts, version histories of uploaded files, AI recommendation cache, and system audit logs).

---

## 2. PostgreSQL Relational Entity Relationship Diagram

The following Mermaid ERD models the primary PostgreSQL relations. Foreign key constraints guarantee structural integrity across institutional, project, financial, and regulatory records.

```mermaid
erDiagram
    MDAs ||--o{ USERS : "employs"
    MDAs ||--o{ PROJECTS : "executes"
    USERS ||--o{ PROJECTS : "creates"
    PROJECTS ||--o{ MILESTONES : "tracks"
    PROJECTS ||--|| BUDGETS : "allocates"
    PROJECTS ||--o{ COMPLIANCE_ASSESSMENTS : "evaluates"
    PROJECTS ||--o{ RISKS : "identifies"
    USERS ||--o{ AUDIT_LOGS : "triggers"

    MDAs {
        uuid id PK
        varchar name "Ministry Name"
        varchar code UNIQUE "e.g., MoCD, MoH"
        varchar sector "Health, Agriculture, etc."
        varchar headquarters "Accra"
        timestamp created_at
    }

    USERS {
        uuid id PK
        varchar full_name
        varchar email UNIQUE
        varchar password_hash
        varchar role "SuperAdmin, Auditor, etc."
        uuid mda_id FK
        boolean mfa_enabled
        timestamp last_login
        timestamp created_at
    }

    PROJECTS {
        uuid id PK
        varchar project_code UNIQUE "GN-AI-XXXX"
        varchar name
        text description
        varchar category "Machine Learning, GenAI, etc."
        varchar sector "Health, Education, Agriculture"
        varchar stage "Concept, Development, Deployment"
        varchar status "Active, Completed, Delayed"
        date start_date
        date end_date
        date expected_completion_date
        double latitude "GIS Coordinate"
        double longitude "GIS Coordinate"
        uuid mda_id FK
        uuid created_by FK
        timestamp updated_at
    }

    MILESTONES {
        uuid id PK
        uuid project_id FK
        varchar title
        text description
        date due_date
        integer progress_percent "0 to 100"
        varchar status "Pending, Completed, Delayed"
        timestamp updated_at
    }

    BUDGETS {
        uuid id PK
        uuid project_id FK
        decimal total_allocated "Approved budget"
        decimal disbursed "Disbursed amount"
        decimal utilized "Utilized amount"
        decimal remaining "Generated column"
        varchar primary_funding_source "Government, Donors, NGO"
        varchar currency "GHS, USD"
        timestamp updated_at
    }

    COMPLIANCE_ASSESSMENTS {
        uuid id PK
        uuid project_id FK
        integer fairness_score "0 to 100"
        integer transparency_score "0 to 100"
        integer accountability_score "0 to 100"
        integer privacy_score "0 to 100"
        integer security_score "0 to 100"
        varchar grade "Excellent, Good, Moderate, High Risk"
        uuid assessed_by FK
        timestamp assessed_at
    }

    RISKS {
        uuid id PK
        uuid project_id FK
        varchar category "Technical, Legal, Financial"
        varchar severity "Low, Medium, High, Critical"
        text description
        text mitigation_plan
        varchar status "Open, Mitigated, Escalated"
        timestamp created_at
    }

    AUDIT_LOGS {
        uuid id PK
        uuid user_id FK
        varchar action "CREATE_PROJECT, APPROVE_BUDGET"
        varchar ip_address
        varchar user_agent
        text details "JSON snapshot of old/new values"
        timestamp timestamp
    }
```

---

## 3. MongoDB Collection Schemas

MongoDB stores unstructured data models that change frequently or require horizontal clustering.

### A. Collection: `documents_metadata`
Stores metadata and version trees of project plans, approval letters, and financial agreements. Includes full-text OCR references.
```json
{
  "_id": "ObjectId",
  "project_id": "UUID",
  "fileName": "Project_Proposal_V2.pdf",
  "s3Path": "bucket/mda-mocd/proposal_v2.pdf",
  "uploadedBy": "UUID",
  "fileSize": 4120300,
  "fileType": "application/pdf",
  "ocr_text": "Full text extracted from PDF for indexing and search...",
  "versions": [
    { "version": 1, "s3Path": "bucket/mda-mocd/proposal_v1.pdf", "timestamp": "2026-04-01T10:00:00Z" },
    { "version": 2, "s3Path": "bucket/mda-mocd/proposal_v2.pdf", "timestamp": "2026-05-12T14:30:00Z" }
  ],
  "digitalSignatures": [
    { "signerId": "UUID", "signatureHash": "0x4f3e7a...", "signedAt": "2026-05-15T09:12:00Z" }
  ]
}
```

### B. Collection: `readiness_evaluations`
Captures multi-dimensional AI maturity data for government departments.
```json
{
  "_id": "ObjectId",
  "mda_id": "UUID",
  "completedBy": "UUID",
  "scores": {
    "infrastructure": 65,
    "skills": 40,
    "dataAvailability": 80,
    "funding": 30,
    "governance": 50
  },
  "overallReadinessScore": 53,
  "maturityLevel": "Defined",
  "recommendations": [
    "Upgrade GPU computational infrastructure",
    "Partner with local universities (e.g., KNUST) for data science training",
    "Establish institutional data protection officers"
  ],
  "submittedAt": "2026-05-20T11:45:00Z"
}
```

---

## 4. Query Optimization & Indexing Strategies

### PostgreSQL Indexes
1. **Partial Search Index on Status**:
   `CREATE INDEX idx_active_projects ON projects (status) WHERE status = 'Active';`
   *Crucial for fast loading of the national active dashboard map.*
2. **Compound Index for Compliance Tracking**:
   `CREATE INDEX idx_project_compliance ON compliance_assessments (project_id, grade);`
   *Speeds up sector-wide and nationwide regulatory grading queries.*
3. **Budget Joining Index**:
   `CREATE INDEX idx_project_budget ON budgets (project_id) INCLUDE (total_allocated, disbursed, utilized);`
   *Enables instant dashboard KPI cards assembly via index-only scans.*

### MongoDB Indexes
1. **Full-Text Index for Document Search**:
   `db.documents_metadata.createIndex({ ocr_text: "text" });`
   *Provides high-speed keyword search inside project proposals.*
2. **Compound Index for Quick Audits**:
   `db.readiness_evaluations.createIndex({ mda_id: 1, submittedAt: -1 });`
   *Optimizes timeline loading of institution AI maturity over time.*
