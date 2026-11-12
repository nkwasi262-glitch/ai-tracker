# REPUBLIC OF GHANA
## NATIONAL INFORMATION TECHNOLOGY AGENCY (NITA)
### GN-AIRGMS: Ghana National AI Registry, Governance, Regulatory & Monitoring System
#### Comprehensive Regulatory Operations Manual & National Deployment Runbook (2026 Edition)

---

## 1. Executive Summary & Purpose

The **Ghana National AI Registry, Governance, Regulatory and Monitoring System (GN-AIRGMS)** serves as the sovereign national platform for registering, classifying, evaluating, approving, and monitoring all Artificial Intelligence (AI) and automated algorithmic decision systems deployed across Ministries, Departments and Agencies (MDAs), Metropolitan, Municipal and District Assemblies (MMDAs), State-Owned Enterprises (SOEs), and public universities in the Republic of Ghana.

Operating under the statutory authority of:
- **National Information Technology Agency Act, 2008 (Act 771)**
- **Data Protection Act, 2012 (Act 843)**
- **Cybersecurity Act, 2020 (Act 1038)**
- **Public Financial Management Act, 2016 (Act 921)**

GN-AIRGMS interfaces directly with the upstream **Technical Clearance System (TCS)** to ensure that ICT projects with embedded or standalone AI undergo rigorous specialized governance, algorithmic fairness vetting, data sovereignty verification, and continuous post-deployment monitoring.

---

## 2. Institutional Access Control & Two-Tier Internal Matrix

In accordance with national security directives and simplified administrative governance, internal system operations are restricted to **two internal tiers**, complemented by an open citizen transparency portal:

| Role Name | Identifier | Primary Responsibilities | Scope of Authority |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `super_admin` | Standing Alone Executive & Clearance Authority. Overall system supervision, final regulatory verdicts, policy elevation, and immutable forensic audit reviews. | Full Platform Authority across all 15 modules. |
| **Technical Unit** | `technical_unit` | Consolidated Technical Evaluations. Ingestion, 12-domain AI assessments, foundation model & dataset auditing, incident response, 8-point NITA inspections, and vendor risk analysis. | All technical, governance, risk, and inspection modules. |
| **Public User** | `public_user` | Citizen Open Oversight & Whistleblower Access. Browsing approved public AI deployments, viewing geographical adoption maps, and submitting algorithmic grievance reports. | M&E Dashboard, GIS Spatial Map, Chat Assistant, Public Transparency Portal. |

---

## 3. The 8-Step Statutory Operational Lifecycle

Every AI system transitioning through GN-AIRGMS executes through an 8-step statutory lifecycle:

```
[ Step 1: Secure API / Data Exchange ] ──> (Inbound referral from TCS with HMAC-SHA256 signature)
                 │
[ Step 2: National Registry Validation ] ──> (Completeness scoring & automated duplicate collision scan)
                 │
[ Step 3: Risk Classification ] ──────────> (14-vector risk evaluation: Minimal, Limited, High, Unacceptable)
                 │
[ Step 4: Regulatory Assessment ] ────────> (12-domain statutory rubrics: Ethics, Act 843, Cybersecurity)
                 │
[ Step 5: Project Implementation ] ───────> (Development, pilot trials, deployment milestone tracking)
                 │
[ Step 6: Continuous Regulatory Monitoring ] (Telemetry, model drift detection, incident reporting, budget burn)
                 │
[ Step 7: Audit & Impact Evaluation ] ────> (8-point NITA on-site inspection & citizen benefit reach analysis)
                 │
[ Step 8: Project Closure or Continued Oversight ] (Lifecycle renewal, retirement, or oversight archiving)
```

### Step-by-Step Operator Guide:

#### Step 1 – Secure API / Data Exchange
1. Inbound referrals are received via the secure REST endpoint `/api/tcs/referrals/inbound` or manually registered by authorized officers in the **TCS Referral Queue**.
2. The payload is verified using HMAC-SHA256 cryptographic signatures.
3. Supporting technical specifications, architectures, and data protection impact assessments (DPIAs) are ingested.

#### Step 2 – National Registry Validation
1. Navigate to the **8-Step Lifecycle Studio** -> Tab 2 (*Registry Validation*).
2. Click **"Run Automated Registry Completeness & Duplicate Scan"**.
3. The system assigns a unique national project ID (e.g., `GN-AI-2026-001`) and scans for cross-MDA duplicate proposals to prevent redundant public expenditure.

#### Step 3 – Risk Classification
1. Evaluate the project against Ghana's 14 risk vectors (e.g. citizen livelihood impact, critical national infrastructure, biometric identification).
2. Classify the system into one of four statutory tiers:
   - **Minimal Risk**: Basic automated workflows, administrative routing.
   - **Limited Risk**: Chatbots, conversational assistants (requires transparency notice).
   - **High Risk**: Healthcare diagnostics, credit scoring, judicial assistance, law enforcement (requires mandatory 12-domain clearance).
   - **Unacceptable Risk**: Real-time untargeted mass biometric surveillance, social scoring (prohibited under Act 843/771).

#### Step 4 – Regulatory Assessment
1. Open the **12-Domain Assessment Studio**.
2. The Technical Unit evaluates all 12 domains: Justification, AI Tech, Data Governance, Fairness & Bias, Transparency, Human Oversight, Cybersecurity, Legal Compliance, Operational Readiness, Vendor Risk, Socioeconomic Impact, and Monitoring.
3. Verify that all 4 mandatory clearance gates pass (minimum score $\ge 60\%$).
4. The Super Admin records the regulatory decision (*Approved*, *Conditionally Approved*, *Deferred*, *Rejected*).
5. The system signs and transmits the decision back to TCS via the **TCS Outbound Adapter** (`/api/tcs/reports/return`).

#### Step 5 – Project Implementation
1. The managing institution updates milestones across:
   - Development & Training
   - Pilot & Sandboxing
   - Production Deployment
2. System logs date of commercial activation and verifies production baseline metrics.

#### Step 6 – Continuous Regulatory Monitoring
1. Monitor live operational telemetry:
   - Model accuracy drift and inference latency.
   - Uptime and cloud availability.
   - Financial burn rate against approved MoF budget warrants.
2. In the event of algorithmic bias or malfunction, log a formal incident in the **AI Incident Center**.

#### Step 7 – Audit & Impact Evaluation
1. NITA regulatory officers conduct on-site inspections using the statutory **8-point NITA inspection checklist**:
   - Access control and multi-factor authentication.
   - Training dataset provenance and Act 843 consent registers.
   - Model explainability and counterfactual audits.
   - Human-in-the-loop fallback procedures.
   - Disaster recovery, backup integrity, and failover drills.
2. Measure citizen reach, cost savings, and socioeconomic benefits.

#### Step 8 – Project Closure or Continued Oversight
1. Upon project maturity or technology obsolescence, choose one of three lifecycle paths:
   - **Renewed / Recertified**: Issues renewed 12-month operating warrant.
   - **Continued Active Oversight**: Remains in live monitoring.
   - **Suspended / Retired**: Safely decommissions model endpoints while archiving historical training and decision records for 7-year statutory retention.

---

## 4. Key Modules & Functional Guide

### 4.1 Executive AI Analytics & Heatmaps (Module 14 & 9)
- Visualizes AI concentration across Ghana's 16 administrative regions.
- Tracks sovereign cloud adoption: Ghana Government Data Centre (NITA) vs commercial cloud providers.
- Generates the official **Printable AI Assessment Clearance Dossier** featuring the Composite Governance Score and official NITA seal.

### 4.2 Public Transparency & Citizen Feedback Portal (Module 15)
- Open citizen-facing register of public algorithms.
- Plain-language explainer of citizens' rights under Act 843.
- Whistleblower grievance portal with cryptographic submission receipts (`CIT-WHISTLE-xxxxx`).

### 4.3 Foundation Models & Dataset Studio (Module 6)
- Inventories parameters, token architectures, and hosting sovereignty for LLMs, Computer Vision models, and predictive models.
- Audits training data provenance, consent compliance, and international data transfer authorization.

### 4.4 Vendor & Procurement Oversight (Module 6 & 14)
- Tracks third-party AI vendors, technology licensing terms, contract expiration dates, and vendor lock-in risk scores.

---

## 5. Security, Backup & Disaster Recovery Procedures

1. **Automated Daily Neon PostgreSQL Snapshots**:
   - Snapshot command: `node server/backup.js`
   - Backups are stored in `server/backups/` and hashed with SHA-256 signatures.
2. **Disaster Recovery Drill**:
   - Run verification drill: `node src/tests/multi_institution_and_version_tests.js`
   - Verified Recovery Time Objective (RTO): $<0.30$ seconds.
   - Recovery Point Objective (RPO): $0$ hours (Point-in-time recovery on Neon).
3. **Forensic Audit Integrity**:
   - All record mutations generate immutable diff rows in `audit_logs` storing `previous_values`, `new_values`, and `correlation_id` in compliance with Act 843.

---

## 6. Local Staging & Production Hosting Reference

| Service | Protocol / Port | Local URL | Primary Entry Command |
| :--- | :--- | :--- | :--- |
| **Backend Express API** | HTTP / 5000 | `http://localhost:5000` | `node server/index.js` |
| **Frontend React / Vite** | HTTP / 3000 | `http://localhost:3000` | `npx vite --port 3000 --host 0.0.0.0` |
| **Database Engine** | PostgreSQL 18.6 | Neon AWS `us-east-2` | Via `DATABASE_URL` in `.env` |
| **TCS Integration Adapter** | REST / HMAC-SHA256 | `http://localhost:5000/api/tcs/*` | Integrated in `server/adapters/tcsAdapter.js` |

---
*Republic of Ghana • National Information Technology Agency (NITA) • All Rights Reserved (2026)*
