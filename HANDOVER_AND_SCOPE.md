# Ghana National AI Projects Registry & Monitoring System (GNAPRMS)
## Comprehensive Project Scope & Developer Handover Dossier

---

### Document Metadata
* **Document Title:** GNAPRMS Technical Scope & Engineering Handover Dossier
* **Version:** 1.0.0 (Production-Ready Architecture & Staging Prototype)
* **Date:** October 2026
* **Target Audience:** Incoming Technical Lead, Full-Stack Engineers, DevOps / SRE Engineers, Security Auditors
* **Custodian Institution:** National Information Technology Agency (NITA) / Ministry of Communications & Digitalisation (MOCD), Republic of Ghana
* **Legislative Foundations:** Data Protection Act, 2012 (Act 843); Cybersecurity Act, 2020 (Act 1038)
* **Current Status:** 
  - ✅ **Frontend Prototype & Interactive Portal:** 100% complete, fully styled, TypeScript validated (`npm run build` passing with zero errors)
  - ✅ **RBAC & Security Verification Engine:** 100% complete with 55/55 automated tests passing (`node src/tests/run_tests.js`)
  - ✅ **Enterprise Architecture Specifications:** Complete specification suite in `/architecture` (System, ERD, Security, DevOps, Governance, M&E)
  - 🔄 **Production Microservices Backend & Database Integration:** Handover specification prepared for Phase 2 implementation

---

## 1. Executive Summary & System Purpose

The **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)** is the sovereign digital single source of truth for all Artificial Intelligence (AI) and Machine Learning (ML) initiatives conceived, financed, developed, or deployed within the jurisdiction of the Republic of Ghana across Ministries, Departments, and Agencies (MDAs), Metropolitan, Municipal, and District Assemblies (MMDAs), State-Owned Enterprises (SOEs), and approved private sector entities.

### Sovereign Mandate
1. **National AI Governance & Registry:** Catalog all public and private AI workloads deployed across Ghana to avoid redundant expenditure and ensure national coordination.
2. **Statutory Compliance (Act 843 & Act 1038):** Ensure every automated decision-making system strictly protects citizen Personally Identifiable Information (PII) and complies with Critical Information Infrastructure (CII) security protocols.
3. **Algorithmic Ethics & Bias Auditing:** Systematically evaluate machine learning algorithms against the Ghana AI Ethics Framework (Fairness, Transparency, Accountability, Privacy, and Security).
4. **Geospatial & Edge Monitoring:** Track field AI deployments (hydrological radars, cocoa vision scanners, traffic sensors, healthcare diagnostics) across all 16 Ghanaian administrative regions via OGC-compliant spatial mapping and real-time edge telemetry.
5. **Executive Decision Isolation:** Provide dedicated, role-isolated portals for the Director General (DG) for national clearances and the Minister for Finance for fiscal monitoring.

---

## 2. In-Scope vs. Out-of-Scope Capabilities

### In-Scope (Delivered & Verified in Current Codebase)
* **Mandatory Institutional Verification Gate & User Classifier (`EntryGateModal.tsx`, `authService.ts`):**
  - **First-Timer / New User Onboarding:** Automatically directs first-time or new officers to an isolated orientation track giving access to **ONLY**:
    1. **Document & OCR (`documents`)** where they can upload required preliminary project and compliance files,
    2. **AI Readiness (`readiness`)** diagnostic service as an institutional maturity guide,
    3. **Governance & Ethics (`governance`)** compliance framework as an ethical auditing guide.
  - **Active Role Profile Activation (`ActiveRoleSelectorModal.tsx`):** Provides a dedicated in-app modal and header trigger for first-timers to select their permanent official role profile once oriented, immediately unlocking their authorized modules.
  - **Existing / Returning Official Mode:** Validates official institutional email credentials (`@*.gov.gh`, `@nita.gov.gh`, `@mocd.gov.gh`, etc.), remembers previously selected active roles, and strictly determines authorized module access per the chosen Active Role Profile.
  - Rejects unauthorized commercial email domains (`@gmail.com`, `@yahoo.com`) for privileged roles.
  - Generates verifiable session tokens, institution category tagging (MDA, MMDA, SOE), and login timestamps.
* **Granular Role-Based Access Control (RBAC) Engine (`rbacPolicy.ts`, `AccessDenied.tsx`):**
  - 8 distinct roles: `Super Admin`, `Director General`, `Technical Director`, `Technical Clearance Team`, `AI Manager`, `Finance Minister`, `Public User`, and `First-Timer / New User`.
  - Hardened tab-level routing and UI action gating preventing horizontal or vertical privilege escalation.
  - Dedicated `AccessDenied` barrier displaying security clearance ratings, attempted module, and elevation workflows.
* **Monitoring & Evaluation (M&E) Dashboard (`Dashboard.tsx`):**
  - High-level national KPI counters (Total Projects, Total Capital Allocated, Average NGS Score, Systemic Risk Exposure).
  - Dynamic Recharts visualizations: Sector budget allocation bars, AI readiness radar charts, compliance trajectory lines.
* **National AI Project Registry (`ProjectRegistry.tsx`):**
  - Filterable catalog (by sector, deployment status, risk level, region).
  - Drill-down milestone progress bars, ethical scores, and managing institution details.
  - Project registration modal with real-time field validation.
* **GIS Geospatial Intelligence & Spatial REST API Console (`GISGeospatial.tsx`, `gisSpatialApi.ts`):**
  - Interactive Leaflet.js map with 3 basemaps (CartoDB Dark Matter, ESRI Satellite Imagery, Voyager Streets).
  - Spatial density heatmap rings covering all 16 regions of Ghana.
  - Proximity radius filter using the Haversine formula (20km – 250km).
  - Simulated IoT edge telemetry mesh tracking remote sensors (Akosombo, Cocoa Board, Kumasi traffic, Bolgatanga drones).
  - Act 843 Sovereign Geo-Fencing validator ensuring coordinates fall within sovereign borders (`[4.5°, 11.5° N]`, `[-3.5°, 1.5° E]`).
  - Interactive GIS REST API Console simulating live endpoints (`/api/v1/gis/geojson/projects`, `/api/v1/gis/spatial-query`, etc.) with instant cURL command generation and formatted JSON viewer.
  - Spatial data export in GeoJSON (`.geojson`), CSV (`.csv`), and Google Earth KML (`.kml`).
* **AI Governance & Ethical Compliance Engine (`GovernanceCompliance.tsx`):**
  - 5-pillar ethical scorecard (Fairness, Transparency, Accountability, Privacy, Security).
  - Dynamic calculation of National Governance Score (NGS, 0–100%) and Letter Grades (A, B, C, D, F).
  - Real-time compliance update mutations and audit event triggering.
* **AI Readiness Maturity Wizard (`AIReadiness.tsx`):**
  - Multi-slider diagnostic evaluating Strategy, Infrastructure, Data Governance, Talent, and Ethical Policy.
  - Dynamic classification into 4 maturity levels (Emerging, Developing, Mature, Transformative) with actionable recommendations.
* **Systemic Risk Management Matrix (`RiskManagement.tsx`):**
  - Interactive 5x5 Likelihood vs. Impact heat grid.
  - Categorized threats (Algorithmic Bias, Model Drift, PII Exposure, Infrastructure Failure).
  - Cross-off resolution workflow moving threats from `Open` to `Mitigated` or `Escalated`.
* **Document Vault, Digital Signatures & OCR Search Engine (`DocumentManager.tsx`):**
  - MinIO S3 object storage simulation tracking document metadata and versioning.
  - Multi-party digital signature ledger.
  - Embedded Full-Text OCR Search Engine indexing and highlighting terms across compliance PDFs.
  - Technical Review submission flow forwarding eligible projects to the Director General.
* **Executive Decision Queue (`DGDecisionQueue.tsx`):**
  - Isolated executive portal for the Director General.
  - One-click Approve, Conditional Clearance (with ministerial directives), or Rejection.
  - Direct ledger recording with immutable audit logs.
* **Ministry of Finance Fiscal Suite (`FinanceMinisterView.tsx`):**
  - Isolated financial portal for the Finance Minister.
  - Tracks national AI capital budgets, actual disbursements, variance analysis, and sector fiscal distribution.
  - Financial data export in CSV and JSON formats.
* **Classified Internal Reports Hub (`InternalReportsHub.tsx`):**
  - Inter-agency incident reporting and threat escalations.
  - Security classifications (`RESTRICTED`, `CONFIDENTIAL`, `SECRET`).
  - Discussion threads, comments, and PDF report export simulation.
* **Tamper-Evident Security Audit Log Viewer (`AuditLogViewer.tsx`, `auditService.ts`):**
  - Immutable, append-only log recording every security event (Logins, Verdicts, Risk Updates, Project Mutations).
  - Captures Timestamp, Actor, Email, IP Address, Action, Module, Details, and SHA-256 integrity hashes.
  - Filterable by date, action type, and status; exportable to CSV/JSON.
* **Statutory AI Chat Assistant (`AIChatAssistant.tsx`):**
  - Natural language assistant preloaded with Ghana Data Protection Act 2012 (Act 843), Cybersecurity Act 2020 (Act 1038), and national registry records.

### Out-of-Scope (To be Implemented in Phase 2 Backend Buildout)
* Physical connection to live external PostgreSQL and MongoDB database servers (currently driven by in-memory data, state mutations, and mock services).
* Live OpenID Connect (OIDC) / Keycloak single sign-on redirect server (currently simulated via institutional domain validation and session token generation).
* Live RabbitMQ / Kafka message broker orchestration.
* Native mobile client builds (Flutter codebase referenced in architecture documentation).
* Physical IoT LoRaWAN / 4G hardware gateway connections (currently simulated via GIS telemetry mesh).

---

## 3. Technology Stack & Key Dependencies

### Frontend (Interactive Prototype & Portal)
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Framework** | React | `^18.2.0` | Component-based UI rendering |
| **Language** | TypeScript | `^5.2.2` | Static typing, interface contracts |
| **Build Tool** | Vite | `^5.1.4` | Development server and Rollup production bundler |
| **Icons** | Lucide React | `^0.344.0` | Clean enterprise iconography |
| **Data Viz** | Recharts | `^2.12.2` | Interactive SVG charting (Bar, Radar, Line, Pie) |
| **Mapping** | Leaflet.js | CDN `1.9.4` | Open-source geospatial raster and vector map engine |
| **Styling** | Vanilla CSS | Custom tokens | Responsive, dark-themed, gold/emerald sovereign theme |

### Planned Production Backend Architecture (Per Architecture Specifications)
| Microservice / Component | Recommended Technology | Primary Responsibility |
|---|---|---|
| **API Gateway** | Kong Gateway / NGINX | SSL termination, rate limiting, token verification, routing |
| **Identity & SSO** | Keycloak / NestJS Auth | Sovereign SSO, OAuth2/OIDC, Act 843 consent logs |
| **Registry & Lifecycle** | NestJS / TypeScript | REST and GraphQL CRUD endpoints for AI projects |
| **GIS & Telemetry Service**| NestJS + PostGIS | OGC spatial queries, GeoJSON RFC 7946, edge telemetry |
| **Compliance & Analytics** | ASP.NET Core / C# | High-throughput ethical scoring, SEIS formulas, risk math |
| **Document & OCR Service** | FastAPI (Python) + Tesseract | PDF uploads, S3 presigned URLs, asynchronous OCR indexing |
| **Relational Database** | PostgreSQL 15 + PostGIS | Core schema, spatial coordinates, milestones, budgets |
| **Audit & Log Ledger** | MongoDB 6.0 (WORM replica) | Immutable append-only audit trail compliant with Act 1038 |
| **Object Storage** | MinIO (On-Prem S3) | Sovereign document hosting within Ghana borders |
| **Message Broker** | RabbitMQ / Apache Kafka | Asynchronous event publishing between microservices |

---

## 4. Repository Structure & Directory Walkthrough

```text
Ghana-AI-Project-Tracker-1/
├── .dockerignore                     # Excludes node_modules, dist from container builds
├── Dockerfile                        # Multi-stage production container build (Vite -> NGINX)
├── nginx.conf                        # Production NGINX configuration with SPA fallback routing
├── package.json                      # Dependency declarations and build scripts
├── tsconfig.json                     # TypeScript strict mode and compiler configuration
├── vite.config.ts                    # Vite server configuration (Port 3000, React plugin)
├── index.html                        # HTML entry point loading Google Fonts (Outfit, Inter) and Leaflet
├── README.md                         # Project documentation and quickstart instructions
│
├── architecture/                     # Comprehensive enterprise architecture documentation
│   ├── system_architecture.md        # Microservices layout, Kong gateway, PostGIS, message broker
│   ├── database_erd.md               # PostgreSQL + PostGIS & MongoDB schemas with Mermaid ERD
│   ├── security_architecture.md      # OAuth2/SSO, RBAC matrix, Act 843 & Act 1038 compliance rules
│   ├── devops_architecture.md        # Docker Compose, Kubernetes manifests, CI/CD, Prometheus monitoring
│   ├── ai_governance_framework.md    # Ethical scoring calculations, pillar weights, NGS thresholds
│   ├── me_framework.md               # National KPIs, SEIS scorecard formulas, verification paths
│   ├── user_administrator_manual.md  # Detailed operator handbook for all 7 user roles
│   └── national_ai_regulatory_overview_2026.md # 2026 Regulatory briefing for Ghana IT regulators
│
└── src/                              # Application source code
    ├── main.tsx                      # Application entry point mounting App to #root
    ├── App.tsx                       # Master application coordinator, routing, and global state
    ├── index.css                     # Design system: variables, glassmorphic styling, GIS layouts
    │
    ├── api/                          # Sovereign API simulation layer
    │   └── gisSpatialApi.ts          # PostGIS queries, GeoJSON generation, telemetry, KML/CSV exporters
    │
    ├── services/                     # Business logic and state management services
    │   ├── authService.ts            # Session management, domain verification, role elevation
    │   ├── rbacPolicy.ts             # Central RBAC permission matrix (roles vs modules and actions)
    │   ├── auditService.ts           # Tamper-evident audit logging with SHA-256 hashes
    │   ├── reportsService.ts         # Internal reports and incident discussion management
    │   └── verdictService.ts         # DG executive decision and directive ledger
    │
    ├── data/                         # Data models, types, and sample datasets
    │   ├── authTypes.ts              # Roles, managing institutions, user session interfaces
    │   ├── auditTypes.ts             # Security audit log schemas and event definitions
    │   ├── reportTypes.ts            # Internal reports, severity levels, comment schemas
    │   ├── verdictTypes.ts           # DG verdict and ministerial directive interfaces
    │   └── sampleProjects.ts         # Comprehensive dataset of 12 Ghanaian AI projects across 16 regions
    │
    ├── components/                   # React presentation and interaction components
    │   ├── Layout.tsx                # Sidebar shell, sovereign branding, role-based nav filtering
    │   ├── EntryGateModal.tsx        # Mandatory institutional verification gate modal
    │   ├── AccessDenied.tsx          # Hardened access barrier with elevation request workflow
    │   ├── HeaderProfile.tsx         # User profile widget with session status and sign-out
    │   ├── RoleSwitcher.tsx          # Dynamic identity switcher for staging and evaluation
    │   ├── Dashboard.tsx             # M&E dashboard with Recharts KPIs and alert ticker
    │   ├── ProjectRegistry.tsx       # Searchable catalog, milestone drawer, and registration form
    │   ├── GISGeospatial.tsx         # Leaflet map, basemaps, regional density, IoT telemetry, API console
    │   ├── GovernanceCompliance.tsx  # 5-pillar ethical scoring matrix and NGS calculator
    │   ├── AIReadiness.tsx           # Multi-slider institutional maturity evaluation wizard
    │   ├── RiskManagement.tsx        # 5x5 threat matrix, risk mitigation checklists
    │   ├── DocumentManager.tsx       # S3 document vault, digital signatures, OCR search, technical review
    │   ├── DGDecisionQueue.tsx       # Isolated executive clearance portal for the Director General
    │   ├── FinanceMinisterView.tsx   # Isolated fiscal budget and disbursement suite for the Finance Minister
    │   ├── InternalReportsHub.tsx    # Inter-agency classified incident and intelligence report hub
    │   ├── AuditLogViewer.tsx        # Tamper-evident, filterable security transaction audit log
    │   └── AIChatAssistant.tsx       # Natural language chatbot preloaded with Act 843 and Act 1038
    │
    └── tests/                        # Automated testing suite
        ├── run_tests.js              # Standalone Node.js test runner (55 passing tests)
        └── rbac_compliance_tests.ts  # TypeScript test specifications for RBAC and verification
```

---

## 5. Local Setup, Execution & Testing Runbook

### Prerequisites
1. **Node.js:** v18.0.0 or higher (v20 LTS recommended). Check with `node -v`.
2. **Git:** Installed and configured. Check with `git --version`.
3. **Shell / Terminal Notes (Windows Specific):**
   > [!IMPORTANT]
   > On Windows machines where PowerShell script execution is restricted (`Execution_Policies`), prefix npm commands with `cmd /c` or run directly in Command Prompt (`cmd.exe`).
   > Example: `cmd /c "npm run dev"` or `cmd.exe /c "npm run build"`.

### Step-by-Step Local Deployment

#### 1. Clone & Enter Repository
```bash
git clone https://github.com/nkwasi262-glitch/ai-tracker.git
cd Ghana-AI-Project-Tracker-1
```

#### 2. Install Dependencies
```bash
cmd /c "npm install"
```

#### 3. Run Automated RBAC & Security Test Suite
Before starting the development server, verify system integrity:
```bash
node src/tests/run_tests.js
```
*Expected Output:*
```text
====================================================================
   REPUBLIC OF GHANA - GNAPRMS RBAC & ENTRY GATE TEST EXECUTION     
====================================================================
1. Testing Institutional Email Verification Gate:
  ✓ PASS: NITA official domain (@nita.gov.gh) is verified
  ...
TOTAL TESTS: 55 | PASSED: 55 | FAILED: 0
STATUS: ALL CRITERIA VERIFIED ✓
====================================================================
```

#### 4. Launch Local Development Server
```bash
cmd /c "npm run dev"
```
*The local Vite development server will start on [http://localhost:3000](http://localhost:3000).*

#### 5. Verify Production Build
```bash
cmd /c "npm run build"
```
*Expected Result:* Clean TypeScript compilation (`tsc`) and Rollup bundling into `dist/` with zero errors.

---

## 6. Core Business Logic & Technical Implementation Guide

### A. Institutional Email & Identity Verification Gate
* **Files:** [`src/services/authService.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/services/authService.ts), [`src/components/EntryGateModal.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/EntryGateModal.tsx)
* **Logic:**
  - Official government domains are verified automatically (`.gov.gh`, `nita.gov.gh`, `mocd.gov.gh`, `mof.gov.gh`, `cocobod.gh`, etc.).
  - Privileged roles (`Super Admin`, `Director General`, `Technical Director`, `Technical Clearance Team`, `Finance Minister`, `AI Manager`) **require** an approved institutional domain.
  - If a user enters a commercial email (`@gmail.com`, `@yahoo.com`) while requesting a privileged role, the verification gate blocks submission with a statutory Act 843 violation message.
  - Public users are exempt and can enter with standard email credentials.
  - Once verified, a `UserSession` is stored in browser `localStorage` under `gnaprms_user_session`.

### B. Role-Based Access Control (RBAC) Matrix
* **File:** [`src/services/rbacPolicy.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/services/rbacPolicy.ts)
* **Access Rules Summary:**
  1. **Super Admin & Technical Director:** Full access across all 12 modules.
  2. **Technical Clearance Team:** Access to technical, governance, documents, reports, and audit modules; blocked from DG Executive Decision Queue.
  3. **AI Manager:** Access to project registry, documents, readiness, and reports; blocked from DG decision queue and audit log explorer.
  4. **Director General (Executive Isolation):** Strictly restricted to executive modules: `Dashboard`, `DG Decision Queue`, `GIS Map`, `Financial Suite`, `Internal Reports`, `Audit Trail`, and `AI Chat Assistant`. **Strictly blocked** from editing raw registry projects, governance scores, risk pins, or technical documents.
  5. **Finance Minister (Fiscal Isolation):** Strictly restricted to `Dashboard`, `Financial Suite`, and `AI Chat Assistant`. **Strictly blocked** from all technical, registry, risk, governance, and audit modules.
  6. **Public User:** Strictly restricted to citizen modules: `Public Dashboard`, `GIS Map`, and `AI Chat Assistant`. **Strictly blocked** from all internal data, registry forms, document vaults, and reports.
  7. **First-Timer / New User (Guided Orientation Track):** Restricted to **ONLY** `Documents & OCR` (uploading required files), `AI Readiness` (maturity diagnostic guide), and `Governance & Ethics` (compliance framework guide). **Strictly blocked** from all other 9 modules. Once oriented, can activate their official Active Role Profile via [`ActiveRoleSelectorModal.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/ActiveRoleSelectorModal.tsx).

### C. Technical Clearance & Executive Decision Lifecycle
* **Files:** [`src/components/DocumentManager.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/DocumentManager.tsx), [`src/components/DGDecisionQueue.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/DGDecisionQueue.tsx), [`src/services/verdictService.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/services/verdictService.ts)
* **Workflow:**
  ```mermaid
  stateDiagram-v2
      [*] --> SUBMITTED : Project Registered
      SUBMITTED --> UNDER_TECHNICAL_REVIEW : Technical Team Assigned
      UNDER_TECHNICAL_REVIEW --> RECOMMENDED_FOR_DG_DECISION : Technical Clearance Passed
      RECOMMENDED_FOR_DG_DECISION --> APPROVED : DG Executive Clearance
      RECOMMENDED_FOR_DG_DECISION --> CONDITIONAL_APPROVAL : DG Issues Directives
      RECOMMENDED_FOR_DG_DECISION --> REJECTED : DG Denies Approval
      CONDITIONAL_APPROVAL --> UNDER_TECHNICAL_REVIEW : Remediation Submitted
  ```
  1. An MDA registers a project (initial state: `SUBMITTED`).
  2. The Technical Clearance Team conducts technical compliance reviews, digital signature checks, and full-text OCR audits in `DocumentManager.tsx`.
  3. Upon passing technical scrutiny, the Technical Clearance Team sets the status to `RECOMMENDED_FOR_DG_DECISION` with formal recommendation notes.
  4. The project appears in the Director General's isolated queue (`DGDecisionQueue.tsx`).
  5. The Director General reviews the dossier and records a formal verdict:
     - **Approve:** Project cleared for national deployment.
     - **Conditional Approval:** Mandatory ministerial directives issued with compliance deadlines.
     - **Reject:** Project denied national clearance.
  6. Every action creates an immutable entry in `verdictService.ts` and `auditService.ts`.

### D. Governance & Ethical Scoring Math
* **File:** [`src/components/GovernanceCompliance.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/GovernanceCompliance.tsx)
* **Formula:**
  $$\text{NGS} = \frac{\text{Fairness} + \text{Transparency} + \text{Accountability} + \text{Privacy} + \text{Security}}{5}$$
* **Grading Thresholds:**
  - $\ge 85\%$: **Grade A** (Full Compliance)
  - $70\% - 84\%$: **Grade B** (Acceptable, Minor Remediation)
  - $55\% - 69\%$: **Grade C** (Moderate Risk, Conditional Clearance)
  - $40\% - 54\%$: **Grade D** (Substantial Risk, Remediation Required)
  - $< 40\%$: **Grade F** (Non-Compliant, Deployment Prohibited)

### E. GIS Spatial Engine, Sovereign Geofencing & Telemetry
* **Files:** [`src/api/gisSpatialApi.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/api/gisSpatialApi.ts), [`src/components/GISGeospatial.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/GISGeospatial.tsx)
* **Capabilities:**
  - **Haversine Distance Formula:** Calculates spherical distance in kilometers between selected hubs and project deployment coordinates.
  - **Act 843 Sovereign Bounding Box Validation:** Validates that coordinates fall within `Latitude: [4.5°, 11.5°]` and `Longitude: [-3.5°, 1.5°]`.
  - **RFC 7946 GeoJSON Exporter:** Dynamically serializes project node records into FeatureCollection objects with PostGIS-compliant properties.
  - **Live IoT Edge Telemetry:** Simulates real-time telemetry streams from 4 remote edge deployments (Akosombo Dam, Cocoa Board, Kumasi Traffic, Bolgatanga Drone Port).

### F. Tamper-Evident Audit Logging
* **File:** [`src/services/auditService.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/services/auditService.ts)
* **Implementation:**
  - Every security-relevant event (`LOGIN`, `VERDICT_PASSED`, `PROJECT_CREATED`, `RISK_STATUS_CHANGE`, `DOCUMENT_SIGNED`, `REPORT_CREATED`) triggers `recordAuditEvent()`.
  - Computes a deterministic pseudo-SHA-256 hash chaining event attributes (actor, timestamp, event type, metadata) to provide tamper-evidence.
  - Log entries are stored in memory and persisted in `localStorage`.

---

## 7. Phase 2 Engineering Roadmap (Immediate Next Steps)

For the incoming engineer continuing development, the following prioritized roadmap outlines the transition from prototype to production deployment:

### Sprint 1: Database Provisioning & Schema Migration
- [ ] Spin up PostgreSQL 15 with the PostGIS extension enabled using `docker-compose.yml`.
- [ ] Implement database migrations matching the schema defined in [`architecture/database_erd.md`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/architecture/database_erd.md) (`projects`, `milestones`, `compliance_scores`, `gis_locations`, `risks`).
- [ ] Spin up MongoDB 6.0 as an append-only replica set for security audit records and incident logs.

### Sprint 2: NestJS & ASP.NET Microservices Implementation
- [ ] Implement the **Registry Service** in NestJS:
  - Migrate endpoints from [`src/api/gisSpatialApi.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/api/gisSpatialApi.ts) to live TypeORM / PostGIS queries.
  - Implement CRUD routes matching `AIProject` interfaces.
- [ ] Implement the **Compliance & Analytics Engine** in ASP.NET Core:
  - Implement endpoints for NGS score calculation and SEIS evaluation formulas.
- [ ] Implement the **Audit Service** in NestJS connecting to MongoDB:
  - Replace client-side `auditService.ts` with server-side write-once-read-many (WORM) audit endpoints.

### Sprint 3: Identity & Keycloak SSO Integration
- [ ] Deploy Keycloak on-premise configured for government realm authentication.
- [ ] Replace `EntryGateModal.tsx` simulated verification with OpenID Connect (OIDC) Authorization Code flow with PKCE.
- [ ] Enforce JWT validation and RBAC claims extraction at the Kong API Gateway level.

### Sprint 4: Sovereign Object Storage & Asynchronous OCR
- [ ] Deploy MinIO S3 cluster at the NITA Tier-3 Data Center.
- [ ] Replace client-side document simulation in `DocumentManager.tsx` with presigned S3 upload URLs.
- [ ] Deploy a Python FastAPI worker running Tesseract OCR and Celery to process uploaded compliance PDFs asynchronously and stream OCR tokens to Elasticsearch.

### Sprint 5: Sovereign Deployment & Infrastructure Hardening
- [ ] Deploy the complete stack to the NITA Sovereign Cloud via Kubernetes Helm charts as outlined in [`architecture/devops_architecture.md`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/architecture/devops_architecture.md).
- [ ] Configure Prometheus and Grafana dashboards for cluster telemetry, API latency, and uptime monitoring.

---

## 8. Known Quirks, Caveats & Development Notes

1. **PowerShell Script Execution Policy on Windows:**
   - PowerShell often blocks `npm` scripts due to execution policy (`PSSecurityException`).
   - **Remedy:** Always execute npm commands via `cmd /c` or using Command Prompt directly (`cmd /c "npm run dev"`, `cmd /c "npm run build"`).
2. **Client-Side Bundle Size Warning:**
   - The production Vite build produces a single JavaScript bundle (~966 kB uncompressed, ~254 kB gzipped) because dynamic code-splitting has not yet been applied across the 12 tabs.
   - **Recommended Optimization:** Convert tab imports in `src/App.tsx` to `React.lazy()` and `React.Suspense` to split chunks by route/module.
3. **Session Persistence in Local Development:**
   - Session credentials and mutated project data reside in browser `localStorage`.
   - To completely reset state to defaults, click the user profile pill in the header and choose **"Sign Out / Switch Role"**, or clear `localStorage` via browser developer tools.
4. **Leaflet Map Container Invalidation:**
   - When switching tabs to `gis` and back, ensure `map.invalidateSize()` is invoked if the map container dimensions change dynamically.

---

## 9. Key Contacts, Governance Bodies & Statutory Glossary

### Key Stakeholder Institutions
* **NITA (National Information Technology Agency):** Primary regulatory body overseeing public sector IT systems, standards, and digital infrastructure in Ghana.
* **MOCD (Ministry of Communications and Digitalisation):** Supervisory ministry setting national policy on digital transformation, AI adoption, and sovereign data management.
* **DPC (Data Protection Commission):** Statutory commission enforcing compliance with the Data Protection Act, 2012 (Act 843).
* **Cybersecurity Authority (CSA):** Authority regulating cybersecurity practices, designating Critical Information Infrastructure (CII) under Act 1038.
* **Ministry of Finance (MOF):** Oversees fiscal allocations, disbursement approvals, and value-for-money audits for public digital investments.

### Statutory & Technical Acronyms Glossary
* **Act 843:** Data Protection Act, 2012 (Republic of Ghana).
* **Act 1038:** Cybersecurity Act, 2020 (Republic of Ghana).
* **CII:** Critical Information Infrastructure (designated under Act 1038).
* **DPO:** Data Protection Officer (mandated by Act 843).
* **MDA:** Ministries, Departments, and Agencies of Ghana.
* **MMDA:** Metropolitan, Municipal, and District Assemblies.
* **SOE:** State-Owned Enterprise (e.g., COCOBOD, VRA, ECG, GPHA).
* **NGS:** National Governance Score (weighted ethical and compliance index).
* **OGC:** Open Geospatial Consortium (specifications for GeoJSON, WMS, WFS).
* **PostGIS:** Spatial database extender for PostgreSQL object-relational database.
* **WORM:** Write Once, Read Many (immutable storage model for audit logs).

---

*This Handover Dossier is officially approved for engineering transition across the National Information Technology Agency (NITA) and participating technical teams.*
