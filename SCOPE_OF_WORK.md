# Republic of Ghana • National Information Technology Agency (NITA)
# Ghana National AI Projects Registry & Monitoring System (GNAPRMS)
## Official System Scope of Work (SOW) & Technical Specifications Dossier

* **Document Reference:** NITA-GNAPRMS-SOW-2026-V3
* **Issuing Authority:** National Information Technology Agency (NITA)
* **Parent Ministry:** Ministry of Communications and Digitalisation (MOCD), Republic of Ghana
* **Statutory Mandates:** NITA Act, 2008 (Act 771); Data Protection Act, 2012 (Act 843); Cybersecurity Act, 2020 (Act 1038)
* **National Policy:** Ghana National Artificial Intelligence Strategy (2023–2033)
* **Effective Date:** November 2026
* **Classification:** Sovereign Official Document • Public Service Distribution

---

## 1. Executive Summary & Purpose of the System

The **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)** is the definitive national repository and continuous oversight platform established by NITA to catalog, track, and monitor all Artificial Intelligence (AI) and Machine Learning (ML) deployments across the Republic of Ghana.

### 1.1 Core Strategic Orientation
Under the streamlined national architecture:
1. **Registry & Monitoring Focus:** GNAPRMS functions strictly as a centralized **Registry and Monitoring System** for all AI projects that have undergone technical clearance.
2. **Clear Ingestion Direction:** The system **receives** cleared project dossiers, architectural blueprints, and compliance filings from the National Technical Clearance System into active monitoring (projects are *received from* technical clearance, never sent upstream).
3. **Bureaucracy Elimination:** Direct executive operational sign-offs, redundant Director General verdict queues, and multi-tier approval bottlenecks are removed in favor of transparent, continuous compliance auditing.
4. **Permanent Single Source of Truth:** Every AI workload across Ministries, Departments, and Agencies (MDAs), Metropolitan, Municipal, and District Assemblies (MMDAs), and licensed private enterprises is indexed with verified budgets, readiness grades, and spatial telemetry.

---

## 2. Active Role-Based Access Control (RBAC) Architecture

To eliminate confusion and ensure strict operational clarity, access to GNAPRMS is consolidated into **strictly three (3) Active Role Profiles**:

| Role Profile | Operational Domain | Authorized Modules | Security Classification |
| :--- | :--- | :--- | :--- |
| **Super Admin** | Tier-1 System Administration, Security & Audit Oversight | All modules: Dashboard, Registry, GIS Spatial, Governance, Readiness, Risk, Documents & OCR, Finance, Reports, Audit Trail, AI Chat | NITA National Administrator |
| **Technical Director** | Clearance Leadership, Architectural Auditing & M&E Oversight | Technical & Oversight modules: Dashboard, Registry, GIS Spatial, Governance, Readiness, Risk, Documents & OCR, Finance, Reports, Audit Trail, AI Chat | NITA Technical Directorate |
| **Public User** | Open Citizen Transparency & Public Research Access | Open modules: M&E Dashboard, GIS Spatial Map, AI Chat Assistant (restricted from internal mutation modules) | Public Access |

### 2.1 Authentication & PostgreSQL Role Persistence
* **Streamlined Entry Gate:** Authentication is executed via official government email credentials (`@*.gov.gh`) and secure passwords. Redundant date prompts have been eliminated.
* **Database Role Persistence:** Upon initial login, user credentials and their selected active role profile are permanently stored in the PostgreSQL database (`user_sessions` table). Subsequent logins automatically recognize the user type and route directly to the main dashboard without intermediate membership branching.
* **In-Session Role Switcher:** Privileged officials can seamlessly switch between authorized active role profiles via the header profile dropdown.

---

## 3. Detailed Scope of System Modules

### 3.1 Monitoring & Evaluation (M&E) Dashboard
* **Sovereign KPI Counters:** Real-time counters displaying Total Cleared Projects, Cleared & Registered tally, Operational count, Active Monitoring count, and Projects Requiring Attention.
* **Cleared AI Projects Registry & Monitoring Board:**
  - Dedicated multi-tab board categorizing projects into:
    1. *All Projects*
    2. *Cleared & Registered*
    3. *Operational*
    4. *Active Monitoring*
    5. *Needs Attention*
  - Project cards render real-time operational status, approved budget allocations, readiness scores, and clearance review notes.
* **Technical Clearance Inbound Dossier Strip:**
  - Highlights dossiers received from the National Technical Clearance System with immediate deep-links into the full-document review drawer.
* **Dynamic Analytics:** Visualizes sector capital distribution, algorithmic compliance trends, and national AI readiness distribution using Recharts.

### 3.2 National AI Project Registry
* **Direct Registration Workflow:** Authorized officials register cleared AI systems with complete parameters (MDA name, MDA code, sector, approved budget, geographical coordinates, and Data Protection Commission certification).
* **Automatic M&E Enrollment:** Upon registry form submission, the system automatically:
  - Generates a unique national project code (`GN-AI-2026-XXX`),
  - Sets operational stage to `Operational` and review status to `Cleared & Registered`,
  - Synthesizes an initial verified registration dossier with multi-page full-text extraction,
  - Persists the record to PostgreSQL / local storage,
  - **Redirects immediately to the M&E Dashboard** where the newly registered project appears at the very top of the monitoring board.

### 3.3 Technical Clearance Inbound Path & Document Vault
* **Always-Ready Inbound Endpoint:** Dedicated REST API route (`/api/technical-clearance/documents`) continuously ready to receive external dossiers from the Technical Clearance System.
* **Autonomous Standards Scanner:** Upon intake, documents are instantly scanned against:
  - *Ghana AI Governance & Ethics Rubric* (Act 843 compliance, bias evaluation, transparency),
  - *Ghana AI Readiness Capability Framework* (infrastructure, technical talent, data governance).
* **Full-Document Inspection Drawer:** Multi-page document viewer displaying verbatim original uploaded dossiers (PDF/DOCX) side-by-side with statutory checklists.
* **Full-Text OCR Search Engine:** Live keyword search scanning inside uploaded compliance files for statutory terms (e.g., "Act 843", "OWASP", "PII").
* **Digital Signatures:** Multi-signatory authenticity ledger verifying official signatures.

### 3.4 AI Readiness Capability Framework
* **National AI Readiness Index (NARI):** Evaluates institutional capability across 4 maturity tiers:
  - *Level 4: Optimized* (Score >= 76%)
  - *Level 3: Managed* (Score 51% – 75%)
  - *Level 2: Defined* (Score 26% – 50%)
  - *Level 1: Initial* (Score < 26%)
* **Diagnostic Checklists:** 10 Institutional Parameters and 10 Market/Ecosystem Parameters.
* **NITA Statutory Clearance Parameter (Verified by NITA):**
  - Integrated parameter: **`Verified by NITA (verified by NITA)`**
  - Three distinct approval sub-parameters with interactive YES/NO audit toggles:
    1. **`Approved by technical director (approved by technical director)`** — Evaluates technical viability and architectural integrity.
    2. **`Approved by technical clearance team (approved by technical clearance team)`** — Evaluates compliance verification and model card documentation.
    3. **`Approved by director general (approved by director general)`** — Evaluates statutory mandate clearance and national alignment.
* **Live Score Recalculation:** Interactive YES/NO responses immediately recalculate the institutional readiness percentage and overall NARI score.

### 3.5 Governance & Ethical Compliance Engine
* **5 Statutory Pillars:**
  1. *Fairness & Demographic Subgroup Auditing*
  2. *Data Privacy & Act 843 Compliance*
  3. *Algorithmic Transparency & Model Card Specification*
  4. *Accountability & Institutional Oversight*
  5. *Cybersecurity Resilience (Act 1038 & OWASP Top 10 for LLMs)*
* **Interactive Verification Checklist:** Editable audit toggles enabling compliance officers to verify statutory questions and dynamically adjust project governance ratings.

### 3.6 GIS Geospatial Intelligence System
* **16 Administrative Regions Mapping:** Interactive Leaflet.js mapping rendering deployed AI systems with custom coordinate node mapping.
* **Act 843 Sovereign Geo-Fencing:** Automatic boundary validator verifying coordinates fall within sovereign Ghanaian territory (`[4.5°, 11.5° N]`, `[-3.5°, 1.5° E]`).
* **IoT Edge Telemetry Mesh:** Real-time simulation of remote field sensors across key sites (Akosombo Dam, Kumasi Traffic Control, Cocoa Vision Scanners, Health Logistics).
* **Spatial REST API Console:** Developer console demonstrating live GeoJSON endpoints with cURL generation and export in `.geojson`, `.csv`, and Google Earth `.kml`.

### 3.7 Systemic Risk Management Matrix
* **5x5 Likelihood vs. Impact Grid:** Visualizes project risks mapped across operational, ethical, infrastructure, and legal dimensions.
* **Threat Mitigation Workflow:** Supports moving identified risks from `Open` to `Mitigated` or `Escalated` with timestamped audit notes.

### 3.8 Tamper-Evident Security Audit Trail
* **Immutable Event Ledger:** Records every system action (logins, role transitions, document reviews, project updates, and monitoring changes).
* **Cryptographic Integrity:** Generates simulated SHA-256 integrity hashes for every event.
* **Statutory Data Retention:** Enforces Ghana Act 843 5-year retention countdowns on all audit logs.

### 3.9 Statutory AI Chat Assistant
* **National AI Advisor:** Preloaded with the Ghana National AI Strategy (2023–2033), Data Protection Act (Act 843), Cybersecurity Act (Act 1038), and live registry data.
* **Instant Regulatory Guidance:** Provides instant answers to MDA officers on compliance requirements, model card standards, and procurement criteria.

---

## 4. Technical Architecture & Technology Stack

* **Frontend Framework:** React 18 with TypeScript 5
* **Build System & Tooling:** Vite 5.4, ES Modules
* **Styling & Design System:** Custom Glassmorphism CSS with Ghana National Palette (Emerald Green, Gold, Midnight Navy, White Star Slate)
* **Visualizations & Charts:** Recharts 2.x
* **Spatial Mapping:** Leaflet 1.9, React-Leaflet
* **Iconography:** Lucide-React
* **Backend Runtime:** Node.js Express Server (`server/index.js`)
* **Database & Persistence:** Neon PostgreSQL Serverless (`@neondatabase/serverless`) with client-side localStorage fallback cache
* **Testing & Quality Assurance:** Comprehensive Node.js assertion suites (92 RBAC tests, 7 Technical Clearance Intake tests, 16 Onboarding tests)

---

## 5. Verification & Compliance Sign-Off

* **Build Status:** Production Vite bundle verified with **0 TypeScript and bundling errors**.
* **Test Status:** **115 / 115 tests passing (100% test pass rate)**.
* **Deployment Readiness:** Staging and production container configurations ready (Nginx reverse proxy, Dockerfile).
* **Version Control:** All source code committed and pushed to sovereign repository (`origin/main`).

---
*Republic of Ghana • National Information Technology Agency (NITA) • All Rights Reserved (2026)*

