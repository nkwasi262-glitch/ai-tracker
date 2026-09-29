# National AI Project Tracking and Clearance System (NAPTCS / GNAPRMS)
# Comprehensive System Handover & Technical Architecture Documentation

> **Document Version**: 2.5.0  
> **Classification**: Statutory Sovereign Technical Documentation  
> **Target Audience**: Incoming Lead Engineers, Full-Stack Developers, Cloud Architects, DevOps Engineers, System Auditors  
> **Workspace Root**: `c:\Users\N1TA\Ghana-AI-Project-Tracker-1`  
> **Status**: Verified against Codebase Commit `8e31aca`  
> **Legal Jurisdiction**: Republic of Ghana — Data Protection Act 2012 (Act 843) & Cybersecurity Act 2020 (Act 1038)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [System Purpose & Problem Statement](#3-system-purpose--problem-statement)
4. [Current System Status: Implemented vs Target Architecture](#4-current-system-status-implemented-vs-target-architecture)
5. [Technology Stack (Verified)](#5-technology-stack-verified)
6. [Project Structure](#6-project-structure)
7. [System Architecture](#7-system-architecture)
8. [Architecture Diagrams](#8-architecture-diagrams)
9. [Application Components Breakdown](#9-application-components-breakdown)
10. [Frontend Documentation](#10-frontend-documentation)
11. [Backend Documentation & API Simulation Engine](#11-backend-documentation--api-simulation-engine)
12. [Database Documentation](#12-database-documentation)
13. [API Documentation (Spatial & Telemetry Engine)](#13-api-documentation-spatial--telemetry-engine)
14. [Authentication & Authorization (RBAC Model)](#14-authentication--authorization-rbac-model)
15. [AI/ML Architecture & Governance Engine](#15-aiml-architecture--governance-engine)
16. [AI & Agent Workflows](#16-ai--agent-workflows)
17. [Data Flows & Gating Logic](#17-data-flows--gating-logic)
18. [Business Workflows](#18-business-workflows)
19. [Configuration & Environment Variables](#19-configuration--environment-variables)
20. [Local Development Setup](#20-local-development-setup)
21. [Testing Architecture & Coverage Status](#21-testing-architecture--coverage-status)
22. [Deployment Architecture](#22-deployment-architecture)
23. [CI/CD Pipelines](#23-cicd-pipelines)
24. [Security Architecture & Statutory Compliance](#24-security-architecture--statutory-compliance)
25. [Logging & Monitoring](#25-logging--monitoring)
26. [Backup & Disaster Recovery](#26-backup--disaster-recovery)
27. [Integrations & External Dependencies](#27-integrations--external-dependencies)
28. [File-by-File Technical Code Reference](#28-file-by-file-technical-code-reference)
29. [Known Issues & Edge Cases](#29-known-issues--edge-cases)
30. [Technical Debt Register](#30-technical-debt-register)
31. [Troubleshooting Guide](#31-troubleshooting-guide)
32. [Developer Handover Guide (20-Point Briefing)](#32-developer-handover-guide-20-point-briefing)
33. [Continuation Roadmap](#33-continuation-roadmap)
34. [Verification Required (Target vs Actual Audit)](#34-verification-required-target-vs-actual-audit)
35. [Glossary of Terms](#35-glossary-of-terms)

---

## 1. Executive Summary

The **National AI Project Tracking and Clearance System (NAPTCS)** — also referenced in institutional documentation as the **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)** — is a sovereign web application commissioned to govern, track, assess, clear, and monitor all Artificial Intelligence (AI) initiatives across the Republic of Ghana.

The platform provides regulatory authorities (National Information Technology Agency - NITA, Ministry of Communications and Digitalisation - MoCD, and the Data Protection Commission - DPC) with an authoritative, unified source of truth while providing government ministries, departments, and agencies (MDAs), state-owned enterprises (SOEs), and private sector technology enterprises with a structured, predictable path to statutory AI compliance.

### Current Reality vs. Blueprint
* **Current Codebase Reality**: The existing application in this repository is a **production-compiled, highly responsive, single-page React 18 / TypeScript / Vite application** running client-side state management. It models all national registries, risk pre-classification wizards, spatial PostGIS queries, IoT telemetry feeds, and regulatory clearance gatekeeper rules in memory with high fidelity.
* **Target Enterprise Specification**: The `architecture/` directory outlines a broader planned **distributed microservices topology** (NestJS, ASP.NET Core, FastAPI, PostgreSQL + PostGIS, MongoDB, MinIO, Redis, RabbitMQ, and Kong Gateway). This document explicitly differentiates between what is **currently running in code** and what is **specified as the future target state**.

---

## 2. System Overview

### Core Philosophy: The Organization Clearance Gatekeeper
Unlike traditional post-hoc IT registries, NAPTCS implements an immutable statutory **Gatekeeper Rule**:
$$\text{isPublished} = \text{isOrganizationCleared} \land (\text{clearanceStatus} \in \{\text{'Cleared'}, \text{'Conditional'}\})$$

An organization (whether a public MDA or a private commercial tech firm) **must first register and receive a verified Organization Sovereign Clearance Certificate** before any of its AI systems, technical models, or spatial telemetry nodes appear on the national system, public map, or public verification portal. Unaccredited entities have their systems held in **Statutory Regulatory Quarantine** (`⛔ Org Quarantined`).

### Dual-Sector Parity
The system treats both public and private sectors with structural parity while applying tailored regulatory scrutiny:
* **Government Track**: Covers public sector deployments across MDAs, MMDAs, and SOEs (e.g. GhanaCard Biometric AFIS, Cocoa Board Crop CMS, Akosombo Dam Hydrological AI, GRA Tax Fraud Intelligence).
* **Private Sector Track**: Covers commercial firms, startups, and international vendors (e.g. mPharma clinical decision support, Zeepay mobile money AML, Farmerline Mergdata AgTech).

---

## 3. System Purpose & Problem Statement

### Business & Sovereign Problem Statement
Prior to NAPTCS, the Ghanaian AI ecosystem faced several critical challenges:
1. **Proliferation of "Shadow AI"**: Departments and enterprises deploying commercial machine learning models and automated decision engines without data protection impact assessments or institutional registration.
2. **Citizen Rights & Algorithmic Bias**: Unvetted biometric and automated decision-making engines impacting citizen rights, credit eligibility, and public benefits without demographic fairness audits.
3. **Cross-Border Data Leakage**: Critical national datasets uploaded to foreign cloud infrastructure in direct violation of the **Ghana Data Protection Act, 2012 (Act 843)** Section 45.
4. **Fragmented Spending & Redundancy**: Public funds disbursed on duplicative AI models across separate ministries without centralized architectural interoperability (eGIF).

### Key Beneficiaries & User Roles
* **Regulator / Clearance Authority**: National oversight, policy weighting, certificate issuance, and compliance revocation.
* **Technical Review Committee (TCC)**: Multi-disciplinary technical evaluations of neural architectures, VAPT reports, and data lineage cards.
* **Data Protection Reviewers (DPC)**: DPIA verification and Act 843 compliance validation.
* **Project Owners & Applicants**: Both public sector focal persons and private enterprise compliance officers submitting applications and closing conditional requirements.
* **Auditors**: Read-only oversight with full historical audit trails.
* **Public Users**: Open-access verification of clearance certificates and public AI registers.

---

## 4. Current System Status: Implemented vs Target Architecture

To enable an incoming development team to take over immediately without confusion, the table below provides an honest, rigorous mapping between what exists in the repository code versus what exists in architectural documentation:

| Architectural Area | Implemented in Source Code (`src/`) | Specified in `architecture/` (Target State) | Status |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React 18.2.0, TypeScript 5.2.2, Vite 5.1.4 | Next.js 14 / React SPA | **IMPLEMENTED** (as React+Vite SPA) |
| **Styling & Design System** | Vanilla CSS (`src/index.css`) with custom tokens, dark mode | TailwindCSS or CSS Modules | **IMPLEMENTED** (Vanilla CSS Design System) |
| **Client-Side State** | In-memory React `useState` coordinated in `App.tsx` | Redux Toolkit / React Query | **IMPLEMENTED** (Centralized in `App.tsx`) |
| **Data Persistence** | In-memory pre-seeded dataset (`src/data/sampleProjects.ts`) | PostgreSQL 15 + MongoDB 6.0 | **PARTIALLY IMPLEMENTED** (Mock in-memory) |
| **Backend API Engine** | Client-side API simulation (`src/api/gisSpatialApi.ts`) | NestJS + ASP.NET Core + FastAPI | **PARTIALLY IMPLEMENTED** (Client simulated) |
| **GIS Mapping** | Leaflet.js 1.9.4 via CDN, 16 Ghanaian regions, PostGIS queries | PostGIS running in Docker / Cloud | **IMPLEMENTED** (Leaflet + In-memory PostGIS) |
| **Spatial Data Export** | GeoJSON (RFC 7946), CSV, KML generation in TypeScript | GeoServer / PostGIS `ST_AsGeoJSON` | **IMPLEMENTED** (Client serialization engine) |
| **Clearance Gatekeeper** | Dynamic state cascading: Org approval unlocks AI projects | Backend Database Trigger / Event Bus | **IMPLEMENTED** (State cascading logic) |
| **8-Stage Clearance Engine** | Wizard forms, risk tiering, evidence gates, scoring | Distributed Workflow (Temporal / Camunda) | **IMPLEMENTED** (Component interactive UI) |
| **Document Vault & OCR** | In-memory document manager with simulated text search | MinIO S3 + Tesseract OCR + Elasticsearch | **PARTIALLY IMPLEMENTED** (UI mock simulation) |
| **AI Assistant** | Deterministic regex / token pattern matcher for Act 843 | Local LLM / RAG Pipeline (FastAPI) | **IMPLEMENTED** (Deterministic NLP engine) |
| **Authentication** | `RoleSwitcher.tsx` updating active identity profile in state | OAuth 2.0 / OpenID Connect / Gov-SSO | **PARTIALLY IMPLEMENTED** (Mock RBAC switcher) |
| **Containerization** | Multi-stage `Dockerfile` (Node 20 + Nginx) & `nginx.conf` | Kubernetes manifests & Helm charts | **IMPLEMENTED** (Docker + Nginx single-pod) |
| **Automated Tests** | No test files found (`*.test.ts`, `*.spec.tsx` missing) | Jest / Playwright test suites | **NOT FOUND** (Testing framework omitted) |
| **CI/CD Automation** | No `.github/workflows` directory present | Canary deployments, SonarQube, Snyk | **NOT FOUND** (Pipeline to be configured) |

---

## 5. Technology Stack (Verified)

### Core Technologies Present in Codebase
* **Runtime Environment**: Node.js $\ge 18.0.0$
* **Programming Language**: TypeScript 5.2.2 (strict mode enabled, zero implicit returns, strict null checks)
* **Frontend Library**: React 18.2.0 (`react`, `react-dom`)
* **Build System & Dev Server**: Vite 5.1.4 (`@vitejs/plugin-react`)
* **Vector Icons**: Lucide React 0.344.0
* **Data Visualization**: Recharts 2.12.2 (SVG Responsive Charts: Bar, Line, Radar)
* **Mapping Engine**: Leaflet 1.9.4 (Injected via CDN in `index.html`)
* **Styling**: Vanilla CSS3 (`src/index.css`, 1,200+ lines of custom utility classes, CSS variables, keyframe animations, glassmorphism)
* **Containerization**: Docker (Node:20-alpine build stage $\rightarrow$ Nginx:stable-alpine serve stage)
* **Web Server**: Nginx (configured in `nginx.conf` for SPA fallback routing `try_files $uri $uri/ /index.html`)

### Dependencies Audit (`package.json`)
```json
{
  "name": "gnaprms",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.344.0",
    "recharts": "^2.12.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.1.4"
  }
}
```

---

## 6. Project Structure

Below is the verified project directory tree as inspected on the file system:

```text
c:\Users\N1TA\Ghana-AI-Project-Tracker-1\
├── .dockerignore                     # Docker build exclusions (node_modules, dist, etc.)
├── .gitignore                        # Git exclusion rules
├── Dockerfile                        # Multi-stage production container manifest
├── README.md                         # Project overview and scope documentation
├── index.html                        # HTML entry point (loads fonts & Leaflet CDN)
├── link.txt                          # Production preview link (Netlify deployment)
├── nginx.conf                        # Production Nginx reverse-proxy / SPA fallback configuration
├── package.json                      # NPM package manifest
├── package-lock.json                 # Lockfile for reproducible dependency resolution
├── tsconfig.json                     # TypeScript strict configuration
├── vite.config.ts                    # Vite build configuration (Port 3000)
│
├── architecture/                     # Enterprise Target Architecture Specifications
│   ├── ai_governance_framework.md    # Ethical scoring calculations & maturity levels
│   ├── database_erd.md               # PostgreSQL + PostGIS & MongoDB hybrid schemas
│   ├── devops_architecture.md        # Kubernetes, Docker Compose, Prometheus observability
│   ├── me_framework.md               # National M&E indicators, SEIS formulas, verification workflows
│   ├── national_ai_regulatory_overview_2026.md # Sectoral landscape & statutory mandates
│   ├── security_architecture.md      # OAuth2/OIDC, RBAC/ABAC models, Act 843 & Act 1038
│   ├── system_architecture.md        # Microservices layout, Kong gateway, event bus
│   └── user_administrator_manual.md  # Step-by-step user & administrator operations guide
│
├── src/                              # Application Source Code
│   ├── App.tsx                       # Master orchestrator, state coordination & tab routing
│   ├── main.tsx                      # React root DOM mount node
│   ├── vite-env.d.ts                 # Vite environment type declarations
│   ├── index.css                     # Complete responsive design system (17 KB)
│   │
│   ├── api/                          # Spatial API & Telemetry Engine
│   │   └── gisSpatialApi.ts          # GeoJSON RFC 7946, PostGIS queries, telemetry, exports (28 KB)
│   │
│   ├── components/                   # Interactive User Interface Modules
│   │   ├── AIChatAssistant.tsx       # Act 843 & Act 1038 natural language assistant (48 KB)
│   │   ├── AIReadiness.tsx           # 5-Pillar institutional maturity scoring wizard (52 KB)
│   │   ├── Dashboard.tsx             # Dual-track M&E analytics, clearance funnel, Recharts (33 KB)
│   │   ├── DocumentManager.tsx       # S3 object storage simulation, signatures, OCR search (18 KB)
│   │   ├── GISGeospatial.tsx         # Multi-layer Leaflet GIS map, PostGIS API console (68 KB)
│   │   ├── GovernanceCompliance.tsx  # Act 843 ethical scorecard & NGS calculator (83 KB)
│   │   ├── Layout.tsx                # Sidebar shell, top bar, dynamic navigation (5 KB)
│   │   ├── OrganizationClearance.tsx # Gatekeeper accreditation & sovereign certificates (40 KB)
│   │   ├── ProjectRegistry.tsx       # Dual-sector registry, risk classification, adjudication (58 KB)
│   │   ├── PublicVerification.tsx    # SOW Section 5.7 certificate lookup & redaction (16 KB)
│   │   ├── RiskManagement.tsx        # 5x5 Likelihood vs Impact threat matrix (25 KB)
│   │   └── RoleSwitcher.tsx          # Dynamic 8-role identity switcher (4 KB)
│   │
│   └── data/                         # Data Models & Seed Data
│       └── sampleProjects.ts         # TypeScript interfaces & preloaded data (80 KB)
│
└── dist/                             # Compiled Production Build Bundle (from npm run build)
    ├── index.html                    # Minified production HTML
    └── assets/
        ├── index-D18dCRIe.css        # Minified CSS bundle (12.88 KB)
        └── index-B8P7YIol.js         # Minified JS bundle (955.05 KB)
```

---

## 7. System Architecture

### A. Current Runtime Architecture (Implemented)
The application operates entirely within the browser client after initial asset delivery from Nginx or static hosting:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   CLIENT BROWSER (SPA)                                 │
│                                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                               Layout Shell (Layout.tsx)                          │  │
│  │  ┌─────────────────────────┐  ┌───────────────────────────────────────────────┐  │  │
│  │  │  Sidebar Navigation     │  │  Top Bar (RoleSwitcher: 8 Roles)              │  │  │
│  │  └───────────┬─────────────┘  └──────────────────────┬────────────────────────┘  │  │
│  └──────────────┼───────────────────────────────────────┼───────────────────────────┘  │
│                 ▼                                       ▼                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                       Central State Coordinator (App.tsx)                        │  │
│  │  - projects: AIProject[]                   - organizations: Organization[]       │  │
│  │  - currentRole: UserRole                   - activeTab: string                   │  │
│  │  - handleUpdateOrganizationClearance()     - handleUpdateProjectClearance()      │  │
│  └──────────────────────────────────────┬───────────────────────────────────────────┘  │
│                                         │                                              │
│          ┌──────────────────────────────┼──────────────────────────────┐               │
│          ▼                              ▼                              ▼               │
│  ┌────────────────────┐      ┌────────────────────┐      ┌────────────────────┐        │
│  │  Registry & Gates  │      │ GIS & Telemetry    │      │  Public Portal     │        │
│  │  - Organization-   │      │ - Leaflet Engine   │      │  - Certificate-    │        │
│  │    Clearance.tsx   │      │ - gisSpatialApi.ts │      │    Lookup (QR)     │        │
│  │  - Project-        │      │ - Spatial Queries  │      │  - Act 843-        │        │
│  │    Registry.tsx    │      │ - GeoJSON Export   │      │    Redaction       │        │
│  └────────────────────┘      └────────────────────┘      └────────────────────┘        │
│          │                              │                              │               │
│          └──────────────────────────────┼──────────────────────────────┘               │
│                                         ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                     In-Memory Sovereign Data Store (sampleProjects.ts)            │  │
│  │  - 18 Organizations (12 Gov, 6 Private)   - 18 AI Projects                       │  │
│  │  - 16 Regional Geospatial Polygons        - Telemetry Sensor Array               │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### B. Target Microservices Architecture (Blueprint in `architecture/`)
When the system transitions from frontend prototype to distributed enterprise deployment, the components will map to distinct microservices:

```text
                         ┌──────────────────────────────────────────┐
                         │   Client Layer (Web, Mobile, Public)     │
                         └────────────────────┬─────────────────────┘
                                              │ TLS 1.3 / HTTPS
                                              ▼
                         ┌──────────────────────────────────────────┐
                         │      Kong API Gateway / Reverse Proxy    │
                         │      (Rate Limiting, WAF, Routing)       │
                         └──────┬─────────────┬─────────────┬───────┘
                                │             │             │
        ┌───────────────────────┘             │             └───────────────────────┐
        ▼                                     ▼                                     ▼
┌───────────────┐                     ┌───────────────┐                     ┌───────────────┐
│  Auth Service │                     │ Registry Svc  │                     │  GIS Service  │
│   (NestJS)    │                     │   (NestJS)    │                     │(NestJS+PostGIS│
└───────┬───────┘                     └───────┬───────┘                     └───────┬───────┘
        │                                     │                                     │
        ▼                                     ▼                                     ▼
┌───────────────┐                     ┌───────────────┐                     ┌───────────────┐
│ Redis Sessions│                     │  PostgreSQL   │                     │  PostGIS DB   │
│ & Token Cache │                     │ (Relational)  │                     │(Spatial Index)│
└───────────────┘                     └───────┬───────┘                     └───────────────┘
                                              │
                                     RabbitMQ Event Bus
                                              │
        ┌─────────────────────────────────────┼─────────────────────────────────────┐
        ▼                                     ▼                                     ▼
┌───────────────┐                     ┌───────────────┐                     ┌───────────────┐
│Compliance Svc │                     │ Document MS   │                     │Analytics Svc  │
│(ASP.NET Core) │                     │ (Tesseract)   │                     │(Python/FastAPI│
└───────┬───────┘                     └───────┬───────┘                     └───────┬───────┘
        │                                     │                                     │
        ▼                                     ▼                                     ▼
┌───────────────┐                     ┌───────────────┐                     ┌───────────────┐
│  MongoDB      │                     │   MinIO S3    │                     │ Elasticsearch │
│(Audit Logs)   │                     │(Object Store) │                     │ (Full-Text)   │
└───────────────┘                     └───────────────┘                     └───────────────┘
```

---

## 8. Architecture Diagrams

### The Organization Clearance Gatekeeper Flow
This diagram illustrates the mandatory regulatory sequence implemented in `OrganizationClearance.tsx` and `App.tsx`:

```text
                  ┌──────────────────────────────────────────────┐
                  │ 1. Organization Submits Registration Dossier │
                  │    - GRA Tax Identification Number (TIN)     │
                  │    - Data Protection Comm (DPC) Act 843 Reg  │
                  │    - Designated Data Protection Officer (DPO)│
                  │    - Sovereign Hosting Commitment            │
                  └──────────────────────┬───────────────────────┘
                                         │
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │  2. Regulator Review & Vetting Evaluation    │
                  └──────────────────────┬───────────────────────┘
                                         │
                         ┌───────────────┴───────────────┐
                 APPROVED│                               │REJECTED / SUSPENDED
                         ▼                               ▼
     ┌──────────────────────────────────────┐  ┌──────────────────────────────────────┐
     │ 3A. Issue Sovereign Clearance Cert   │  │ 3B. Maintain Regulatory Quarantine   │
     │     (e.g., GH-NAPTCS-ORG-2026-MOCD)  │  │     - Status: 'Not Cleared'          │
     │     - Status: 'Cleared'              │  │     - isOrganizationCleared: false   │
     │     - isOrganizationCleared: true    │  │     - All AI Projects Withheld       │
     └───────────────────┬──────────────────┘  └──────────────────────────────────────┘
                         │
                         ▼
     ┌──────────────────────────────────────────────────────────┐
     │ 4. System Cascading State Mutation (App.tsx)             │
     │    - AI Projects managed by Organization Unquarantined   │
     │    - If Project is Cleared/Conditional: isPublished=true │
     │    - Visible on Public Register, GIS Map, & Verification │
     └──────────────────────────────────────────────────────────┘
```

---

## 9. Application Components Breakdown

The application features 12 primary React components located in `src/components/`:

### 1. `Layout.tsx`
* **Purpose**: Master shell layout providing the docked sidebar navigation, responsive header, NAPTCS logo branding, dynamic fiscal year display, and viewport canvas.
* **State Filter**: Filters navigation tabs based on `currentRole`. If a user selects `Public User`, internal modules are hidden, displaying only public-authorized modules (`dashboard`, `verification`, `gis`, `chat`).
* **Props**: `currentRole`, `onRoleChange`, `activeTab`, `setActiveTab`, `children`.

### 2. `RoleSwitcher.tsx`
* **Purpose**: Dynamic role selector mounted in the top navigation bar enabling staging reviewers and developers to swap identities and test role-based permissions in real-time.
* **Supported Roles**:
  1. `Regulator / Clearance Authority` (Default active identity)
  2. `Technical Review Committee (TCC)`
  3. `Super Administrator`
  4. `Government Applicant (MDA/SOE)`
  5. `Private Sector Applicant`
  6. `Institution Administrator`
  7. `Auditor`
  8. `Public User`

### 3. `Dashboard.tsx`
* **Purpose**: National executive analytics and M&E dashboard.
* **Key Features**:
  * **Dual-Track Toggle**: Switch between *All Tracks*, *🏛️ Government (MDAs/SOEs)*, and *🏢 Private Sector*.
  * **Statutory Clearance Funnel**: Live counters for *Cleared (≥85%)*, *Conditional (60–84%)*, *Under TCC Review*, and *Quarantined / Prohibited*.
  * **Interactive KPI Cards**: Hover/click drawers revealing active, delayed, and completed systems.
  * **Budget & Utilization Visualization**: Recharts Bar chart showing allocations vs utilized funds in millions of GHS.
  * **Economic Domain Radar Chart**: Visualizes project density across 10 economic sectors.
  * **Ethical Compliance Trend Line**: Longitudinal trajectory chart plotting national governance progress.
  * **Regulatory Advisories Feed**: Real-time notifications for overdue audits, security flags, and VAPT re-testing.

### 4. `OrganizationClearance.tsx` *(Gatekeeper Module)*
* **Purpose**: The statutory accreditation gateway for public and private organizations.
* **Key Features**:
  * Entity register browsing with multi-status tabs (*All Entities*, *Cleared*, *Pending Review*, *Conditional*, *Suspended*).
  * Accreditation review drawer showing GRA TIN, DPC registration number, DPO details, and sovereign cloud hosting.
  * One-click regulator actions: **Authorize & Issue Certificate**, **Issue Conditional Clearance**, **Suspend Accreditation**.
  * Dynamic certificate modal displaying the official **Organization Sovereign Clearance Certificate** with cryptographic QR code seal and PDF download trigger.
  * Registration modal allowing new entities to apply for national accreditation.

### 5. `ProjectRegistry.tsx`
* **Purpose**: Comprehensive AI project registry and clearance adjudication engine.
* **Key Features**:
  * Dual-sector search and filtering by Sector Track, Clearance Status, Risk Tier, and Lifecycle Stage.
  * Visual quarantine indicators (`⛔ Org Quarantined`) if the parent entity is unaccredited.
  * Project details drawer displaying GIS coordinates, budget allocation, milestones, and required evidence checklists (DPIA, VAPT, Model Docs, SLA, Bias Testing).
  * **Regulator Clearance Action Panel**: Allows authorized roles to evaluate conformity scores, set clearance status, record scope limits, and issue certificate numbers.
  * **Project Submission Form**: Incorporates the EU AI Act 4-tier risk pre-classification wizard and enforces mandatory statutory gates (automatic block if high-risk without DPIA).

### 6. `PublicVerification.tsx`
* **Purpose**: Implementation of SOW Section 5.7 — Public Verification Portal.
* **Key Features**:
  * Instant certificate lookup by identifier (e.g. `NAPTCS-CLR-2026-001`, `GH-NAPTCS-ORG-2026-MOCD`).
  * Cryptographic QR code verification simulation.
  * Displays certified project parameters, score grades, and permitted operational scope limits.
  * **Act 843 Section 23 Redaction**: Internal penetration testing vulnerabilities, source code hashes, and internal risk matrices are withheld from public view.
  * **Public Register of Cleared AI Systems**: Searchable, open-access table of all authorized AI systems.

### 7. `GISGeospatial.tsx`
* **Purpose**: Sovereign GIS spatial map, telemetry monitoring, and interactive PostGIS API console.
* **Key Features**:
  * **Leaflet Map Engine**: Centered on Ghana (`7.9465, -1.0232`), rendering CartoDB Dark Matter, ESRI Satellite, and Voyager basemaps.
  * **Spatial Overlays**: Sovereign border polygon, regional density heatmap circles across all 16 regions, live IoT sensor markers, and project deployment markers.
  * **Sector & Clearance Filters**: Filter nodes by Government vs Private Sector, or Cleared vs Quarantined.
  * **Proximity Radius Tool**: Interactive slider (20km to 250km) computing Haversine distances to filter projects within spatial zones.
  * **Interactive GIS API Console**: Real-time REST console executing spatial queries with instant latency counters, cURL generation, and JSON inspection.
  * **Data Export**: One-click client serialization to GeoJSON (RFC 7946), CSV, and KML (Google Earth).

### 8. `GovernanceCompliance.tsx`
* **Purpose**: National AI governance scoring tool assessing models against Act 843 and international standards.
* **Key Features**:
  * Evaluates models across 5 pillars: Fairness, Accountability, Transparency, Privacy, and Security.
  * Computes the **National Governance Score (NGS)**: $\text{NGS} = 0.20 F + 0.25 T\&E + 0.20 P + 0.35 C$.
  * Assigns compliance grades (*Excellent*, *Good*, *Moderate*, *High Risk*).
  * Allows reviewers to update compliance scores which immediately reflect across the national dashboard.

### 9. `AIReadiness.tsx`
* **Purpose**: Institutional AI maturity assessment wizard.
* **Key Features**:
  * Sliders assessing 5 organizational pillars: Infrastructure, Skills, Data Availability, Funding, and Governance.
  * Classifies institutions into 4 Maturity Levels: *Initial (0-25%)*, *Defined (26-50%)*, *Managed (51-75%)*, and *Optimized (76-100%)*.
  * Generates automated recommendations and institutional next steps.

### 10. `RiskManagement.tsx`
* **Purpose**: 5x5 Likelihood vs. Impact Risk Matrix.
* **Key Features**:
  * Plots project risks on a 25-cell interactive grid.
  * Color-coded threat zones (Low, Medium, High, Critical).
  * Operators can click threat nodes, view descriptions and mitigations, and toggle risk status (*Open*, *Mitigated*, *Escalated*).

### 11. `DocumentManager.tsx`
* **Purpose**: Object storage vault simulation and Full-Text OCR search.
* **Key Features**:
  * Simulates S3/MinIO bucket storage with document versioning and file sizes.
  * Digital signature workflow (operators sign documents with cryptographic hash simulation).
  * **OCR Keyword Search**: Full-text indexing simulation searching inside proposal documents and highlighting matching paragraphs.

### 12. `AIChatAssistant.tsx`
* **Purpose**: In-browser natural language regulatory assistant.
* **Key Features**:
  * Grounded in the **Ghana Data Protection Act 2012 (Act 843)**, **Cybersecurity Act 2020 (Act 1038)**, and the active projects registry.
  * Interprets natural language queries regarding projects, budgets, legal compliance, and roles.
  * Renders responses in rich markdown with inline tables and callouts.
  * 100% offline and deterministic — zero external LLM API costs or token data leakage.

---

## 10. Frontend Documentation

### Design System & Styling Architecture (`src/index.css`)
The application uses a custom Vanilla CSS design system engineered specifically for institutional and sovereign applications.

#### CSS Variables & Color Tokens
```css
:root {
  --bg-primary: #0b0f19;       /* Deep space slate */
  --bg-card: #111b27;          /* Card container */
  --border-color: #1e293b;     /* Slate border */
  --ghana-emerald: #10b981;    /* Primary sovereign accent */
  --ghana-gold: #fbbf24;       /* Secondary sovereign accent */
  --ghana-red: #f43f5e;       /* Critical alert / quarantine */
  --text-primary: #f8fafc;     /* Clean readable white */
  --text-secondary: #94a3b8;   /* Muted body text */
  --text-muted: #64748b;       /* Subtle metadata text */
}
```

#### Key Visual Patterns
1. **Glassmorphism (`.glass-card`)**: Layered backgrounds with `backdrop-filter: blur(12px)` and subtle `rgba(255, 255, 255, 0.05)` borders.
2. **Interactive Markers (`.custom-map-marker`)**: Dynamic SVG and HTML markers injected into Leaflet with CSS pulse animations and box-shadow glows.
3. **Typography**: Google Fonts loaded in `index.html`:
   * Header & Display Font: **Outfit** (Weights 400, 500, 600, 700, 800)
   * Body & Data Font: **Inter** (Weights 300, 400, 500, 600, 700)

---

## 11. Backend Documentation & API Simulation Engine

### Code Reality: Client-Side Simulation Architecture
In the current repository state, **there is no standalone Node.js/Express or NestJS process running on a separate port**. 

Instead, the application implements a high-performance **in-browser REST simulation engine** in [`src/api/gisSpatialApi.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/api/gisSpatialApi.ts). This engine exposes realistic asynchronous endpoints, returns standard HTTP envelopes (`GisApiResponse<T>`), simulates realistic network latency (5ms to 25ms), and provides RFC-compliant GeoJSON payloads.

### API Response Envelope Format
```typescript
export interface GisApiResponse<T> {
  status: 200 | 400 | 404 | 500;
  ok: boolean;
  endpoint: string;
  method: 'GET' | 'POST';
  timestamp: string;
  latencyMs: number;
  headers: {
    'content-type': string;
    'x-sovereign-jurisdiction': string;
    'x-rate-limit-remaining': string;
    'x-cache': string;
  };
  data: T;
}
```

---

## 12. Database Documentation

### A. Implemented Data Models (`src/data/sampleProjects.ts`)
The primary data entities are defined as TypeScript interfaces:

#### 1. Entity: `Organization`
Represents an accredited public ministry or private technology company:
```typescript
export interface Organization {
  id: string;                                // Primary Key (e.g. "org-1")
  name: string;                              // Full legal entity name
  acronym: string;                           // Short code (e.g. "MoCD", "mPharma")
  entityType: EntitySectorType;              // 'Government (MDA/MMDA/SOE)' | 'Private Sector...'
  tinOrRegNumber: string;                    // GRA Tax Identification Number
  dpcRegNumber: string;                      // Data Protection Commission Certificate No.
  sector: 'Health' | 'Agriculture' | ...;   // Primary economic domain
  region: string;                            // Operating region in Ghana
  district: string;                          // District / Municipality
  dpoName: string;                           // Designated Data Protection Officer
  dpoEmail: string;                          // Official contact email of DPO
  contactEmail: string;                      // Entity contact email
  website: string;                           // Entity web URL
  clearanceStatus: OrganizationClearanceStatus; // 'Cleared' | 'Pending Review' | 'Conditional' | 'Suspended'
  clearanceCertificateId?: string;           // Sovereign Cert ID (e.g. "GH-NAPTCS-ORG-2026-MOCD")
  clearedDate?: string;                      // ISO date string
  expiryDate?: string;                       // ISO date string
  submittedAt: string;                       // Registration timestamp
  sovereignDataHosting: string;              // 'In-Country (National Data Centre)' | ...
}
```

#### 2. Entity: `AIProject`
Represents an individual AI system or model deployment:
```typescript
export interface AIProject {
  id: string;                                // Primary Key (e.g. "proj-1")
  projectCode: string;                       // Sovereign Project Code (e.g. "GN-AI-2026-001")
  name: string;                              // Project / System Name
  description: string;                       // Technical and functional description
  category: 'Machine Learning' | 'Generative AI' | 'Computer Vision' | ...;
  sector: 'Health' | 'Agriculture' | 'Finance' | 'Security' | ...;
  stage: 'Concept' | 'Planning' | 'Development' | 'Pilot' | 'Deployment' | 'Operational';
  status: 'Active' | 'Completed' | 'Delayed' | 'Suspended';
  startDate: string;
  endDate: string;
  expectedCompletionDate: string;
  latitude: number;                          // WGS84 GIS coordinate
  longitude: number;                         // WGS84 GIS coordinate
  mda: string;                               // Managing entity name
  mdaCode: string;                           // Managing entity acronym
  organizationId: string;                    // Foreign Key -> Organization.id
  organizationName: string;                  // Denormalized organization name
  entitySectorType: EntitySectorType;        // Sector classification
  riskTier: RiskTier;                        // 'Minimal Risk' | 'Limited Risk' | 'High Risk' | 'Prohibited'
  clearanceStatus: ProjectClearanceStatus;   // 'Cleared' | 'Conditional' | 'Pending Review' | 'Not Cleared'
  clearanceCertificateId?: string;           // Project Cert ID (e.g. "NAPTCS-CLR-2026-001")
  clearanceScore: number;                    // 0 to 100 percentage
  clearanceEvidence: ClearanceEvidence;      // Checklist of uploaded DPIA, VAPT, SLA, Model Docs
  clearanceDecision?: ClearanceDecision;      // Decision payload with scope limits and conditions
  isOrganizationCleared: boolean;            // Gatekeeper flag (derived from Organization)
  isPublished: boolean;                      // Gatekeeper flag: true only if Org & Project cleared
  region: string;
  district: string;
  budget: Budget;                            // Total allocated, disbursed, utilized, funding source
  compliance: ComplianceScore;               // Fairness, transparency, privacy, security scores
  readinessScore: number;                    // 0 to 100 percentage
  milestones: Milestone[];                   // Array of milestone objects
  risks: RiskItem[];                         // Array of risk items for 5x5 matrix
  documents: DocumentAsset[];                // Array of uploaded document assets
}
```

### B. Target Relational Schema (PostgreSQL Blueprint)
When migrating to production PostgreSQL, the tables map directly to the interfaces above:

```text
ORGANIZATIONS (PK: id)
     │
     │ 1:N (has many)
     ▼
PROJECTS (PK: id, FK: organization_id)
     │
     ├── 1:N ──> MILESTONES (PK: id, FK: project_id)
     ├── 1:1 ──> BUDGETS (PK: id, FK: project_id)
     ├── 1:N ──> RISKS (PK: id, FK: project_id)
     ├── 1:N ──> COMPLIANCE_SCORES (PK: id, FK: project_id)
     └── 1:N ──> CLEARANCE_DECISIONS (PK: id, FK: project_id)
```

---

## 13. API Documentation (Spatial & Telemetry Engine)

All spatial endpoints are implemented in [`src/api/gisSpatialApi.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/api/gisSpatialApi.ts):

### 1. `GET /api/v1/gis/geojson/projects`
* **Purpose**: Retrieves all AI project deployment coordinates formatted as an RFC 7946 compliant GeoJSON `FeatureCollection`.
* **Authentication**: None (Open Spatial Data).
* **Response Format**:
```json
{
  "status": 200,
  "ok": true,
  "endpoint": "/api/v1/gis/geojson/projects",
  "method": "GET",
  "latencyMs": 8,
  "data": {
    "type": "FeatureCollection",
    "crs": {
      "type": "name",
      "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" }
    },
    "features": [
      {
        "type": "Feature",
        "id": "proj-1",
        "geometry": {
          "type": "Point",
          "coordinates": [-0.1870, 5.6037]
        },
        "properties": {
          "projectCode": "GN-AI-2026-001",
          "name": "GhanaPostGPS Digital Address Intelligence Engine",
          "organizationName": "Ministry of Communications and Digitalisation",
          "entitySectorType": "Government (MDA/MMDA/SOE)",
          "riskTier": "Limited Risk",
          "clearanceStatus": "Cleared",
          "clearanceCertificateId": "NAPTCS-CLR-2026-001",
          "isOrganizationCleared": true,
          "isPublished": true,
          "totalAllocatedBudget": 4200000,
          "utilizedBudget": 1850000,
          "sovereignBorderVerified": true
        }
      }
    ]
  }
}
```

### 2. `GET /api/v1/gis/spatial-query`
* **Purpose**: Executes spatial proximity radius filtering using the Haversine formula ($d \le R$).
* **Query Parameters**:
  * `lat` (number, required): Latitude of query hub (e.g. `5.6037`)
  * `lng` (number, required): Longitude of query hub (e.g. `-0.1870`)
  * `radiusKm` (number, optional, default `50`): Search radius in kilometers.
* **Response**: Returns matching projects sorted by distance ascending with computed `distanceKm`.

### 3. `GET /api/v1/gis/regions/density`
* **Purpose**: Returns aggregate statistics across all 16 administrative regions of Ghana.
* **Response**: Array of `RegionalDensityStats` with project counts, regional centroids, utilized budgets, and density classifications (*High Hub*, *Emerging Corridor*, *Expansion Node*, *Baseline*).

### 4. `GET /api/v1/gis/telemetry/live`
* **Purpose**: Ingests real-time IoT edge telemetry from physical sensor arrays.
* **Response**: Array of `EdgeTelemetryNode` entries tracking battery health, uptime percentages, and protocol status (MQTT, CoAP, HTTPS).

### 5. `GET /api/v1/gis/compliance/sovereign-boundary`
* **Purpose**: Automated compliance check validating that all registered project coordinates reside within Ghana's sovereign territorial bounding box (Lat 4.70°N - 11.20°N, Lng -3.30°W - 1.30°E).
* **Response**: Audit payload confirming Act 843 Section 45 territorial compliance.

### 6. `POST /api/v1/gis/export` (Client-side handler `exportSpatialData`)
* **Purpose**: Serializes spatial datasets to downloadable files.
* **Supported Formats**:
  * `geojson`: `application/geo+json` (`.geojson`)
  * `csv`: `text/csv` (`.csv`) with WGS84 coordinate columns
  * `kml`: `application/vnd.google-earth.kml+xml` (`.kml`) for Google Earth / QGIS

---

## 14. Authentication & Authorization (RBAC Model)

### Role-Based Access Control Matrix
The system enforces strict permission boundaries across the 8 defined user roles:

| Functionality / Action | Super Admin | Regulator / Clearance Auth | Technical Review (TCC) | Govt Applicant | Private Applicant | Inst Admin | Auditor | Public User |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **View Public Registry & Map** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Search Certificates (Public)** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Interact with AI Chatbot** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Submit New AI Project** | ✓ | ✓ | - | ✓ | ✓ | ✓ | - | - |
| **Register New Organization** | ✓ | ✓ | - | ✓ | ✓ | ✓ | - | - |
| **Adjudicate Project Clearance** | ✓ | ✓ | ✓ | - | - | - | - | - |
| **Approve / Suspend Organization**| ✓ | ✓ | - | - | - | - | - | - |
| **Access Internal Evidence Vault** | ✓ | ✓ | ✓ | Owned | Owned | Owned | ✓ (Read) | - |
| **Access 5x5 Risk Matrix & Edit** | ✓ | ✓ | ✓ | Owned | Owned | Owned | ✓ (Read) | - |
| **Reset Database (Wipe Test Data)**| ✓ | ✓ | - | - | - | - | - | - |

---

## 15. AI/ML Architecture & Governance Engine

### A. The Act 843 Deterministic Regulatory Assistant
The AI assistant in [`src/components/AIChatAssistant.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/components/AIChatAssistant.tsx) is implemented as a **deterministic, rule-based natural language processing engine**. It parses user queries against keyword and token regex patterns:

```typescript
const query = text.toLowerCase().trim();

// 1. Project Code / Name matching
const foundProject = findProject(query);

// 2. Legal Acts & Statutory Frameworks
if (query.includes('act 843') || query.includes('data protection')) { ... }
if (query.includes('act 1038') || query.includes('cybersecurity')) { ... }
if (query.includes('strategy') || query.includes('initiatives')) { ... }

// 3. Quantitative Financial & Registry Metrics
if (query.includes('budget') || query.includes('total allocation')) { ... }
```

#### Why Deterministic Client-Side AI?
1. **Zero External Dependency**: Operates 100% offline without requiring external API keys (OpenAI, Anthropic, Gemini).
2. **Absolute Privacy by Design (Act 843)**: Zero risk of sensitive Ghanaian public sector data or project descriptions being transmitted to overseas LLM inference providers.
3. **No Hallucination**: Outputs verified statutory clauses, exact budgetary numbers, and certified certificate IDs.

### B. National AI Governance Score (NGS) Algorithm
Implemented in `GovernanceCompliance.tsx`:
$$\text{NGS} = (F \times 0.20) + (T\&E \times 0.25) + (P \times 0.20) + (C \times 0.35)$$
* $F$: Fairness & Bias Score (0 to 100)
* $T\&E$: Transparency & Explainability Score (0 to 100)
* $P$: Privacy & Act 843 Compliance Score (0 to 100)
* $C$: Cybersecurity & Threat Resilience Score (0 to 100)

---

## 16. AI & Agent Workflows

### Clearance Risk Pre-Classification Workflow (EU AI Act & SOW)
Implemented in `ProjectRegistry.tsx`, this automated wizard evaluates systems into risk tiers before technical review:

```text
User Selects System Use Case Attributes
                  │
                  ├── Is it subliminal manipulation, social scoring, or public mass surveillance?
                  │   └── YES ──> [ PROHIBITED ] (Automatic Block)
                  │
                  ├── Does it process biometric identity, health diagnostic, credit scoring, or critical infrastructure?
                  │   └── YES ──> [ HIGH RISK ] (Mandatory DPIA + VAPT + Bias Audit required)
                  │
                  ├── Is it a citizen-facing chatbot or synthetic content generator?
                  │   └── YES ──> [ LIMITED RISK ] (Transparency disclosures required)
                  │
                  └── None of the above (Optimization, analytics, internal processing)
                      └── YES ──> [ MINIMAL RISK ] (Standard registration)
```

---

## 17. Data Flows & Gating Logic

### Cascading State Mutation in `App.tsx`
When a regulator updates an organization's clearance status in `OrganizationClearance.tsx`, the callback executes in `App.tsx`:

```typescript
const handleUpdateOrganizationClearance = (orgId: string, newStatus: OrganizationClearanceStatus, certId?: string) => {
  // 1. Update the organization record
  setOrganizations(prev => prev.map(org => {
    if (org.id === orgId) {
      return {
        ...org,
        clearanceStatus: newStatus,
        clearanceCertificateId: certId || (newStatus === 'Cleared' ? `GH-NAPTCS-ORG-2026-${org.acronym}` : undefined),
        clearedDate: newStatus === 'Cleared' ? today : org.clearedDate
      };
    }
    return org;
  }));

  // 2. Cascade gatekeeper effect to all projects belonging to this organization
  setProjects(prev => prev.map(p => {
    if (p.organizationId === orgId) {
      const isOrgCleared = newStatus === 'Cleared';
      const isPublishedNow = isOrgCleared && (p.clearanceStatus === 'Cleared' || p.clearanceStatus === 'Conditional');
      return {
        ...p,
        isOrganizationCleared: isOrgCleared,
        isPublished: isPublishedNow
      };
    }
    return p;
  }));
};
```

---

## 18. Business Workflows

### Workflow 1: Organization Accreditation & Gatekeeper Clearance
* **Actor**: Private Sector Applicant or MDA Focal Person $\rightarrow$ Regulator / Clearance Authority.
* **Precondition**: Organization has valid GRA TIN and DPC registration number.
* **Steps**:
  1. Applicant navigates to `Organization Clearance` and clicks `Register New Entity`.
  2. Submits organization name, acronym, sector track, GRA TIN, DPC number, DPO details, and sovereign cloud hosting choice.
  3. Entity is stored in state with `clearanceStatus = 'Pending Review'`.
  4. Regulator reviews dossier and clicks `Authorize & Issue Certificate`.
  5. System generates unique ID `GH-NAPTCS-ORG-2026-[ACRONYM]`.
  6. All previously quarantined AI projects under this entity are unlocked.

### Workflow 2: AI Project Submission & Statutory Gating
* **Actor**: Project Manager or Institution Administrator.
* **Precondition**: User role allows project creation; managing entity selected.
* **Steps**:
  1. Navigates to `Project Registry` $\rightarrow$ fills in title, description, category, and sector.
  2. Selects parent organization. If unaccredited, warning is displayed that project will be quarantined.
  3. Completes Risk Pre-Classification checklist.
  4. Selects required evidence documents (DPIA, VAPT, Model Docs, SLA).
  5. **Gate Check**: If Risk Tier is `High Risk` and DPIA is unchecked, form submission is blocked with statutory warning.
  6. On successful submission, project enters state with `clearanceStatus = 'Pending Review'`.

### Workflow 3: Public Certificate Verification (SOW Section 5.7)
* **Actor**: Public Citizen, Investigative Journalist, or Enterprise Client.
* **Precondition**: No authentication required (`Public User` role).
* **Steps**:
  1. Navigates to `Public Verification Portal`.
  2. Enters Certificate ID (e.g. `NAPTCS-CLR-2026-001`) or clicks a quick-verify pill.
  3. System matches against `clearanceCertificateId` across projects and organizations.
  4. If verified, displays official green seal, operational scope limits, and validity dates.
  5. Redacts internal vulnerability logs and sensitive source hashes.
  6. If invalid or unaccredited, displays red unapproved warning.

---

## 19. Configuration & Environment Variables

### Existing Configuration Files
* **`vite.config.ts`**: Configured on port `3000` with `@vitejs/plugin-react`.
* **`tsconfig.json`**: ES2020 target, ESNext modules, bundler resolution, strict linting rules (`noUnusedLocals: true`, `noUnusedParameters: true`).
* **`nginx.conf`**: Single server block listening on port `80`, handling client-side SPA routing (`try_files $uri $uri/ /index.html`).

### Production Backend Environment Schema (`.env` Blueprint)
When transitioning to a live database and API gateway, the following environment variables will be required:

| Variable Name | Description | Required | Example Format | Sensitive |
| :--- | :--- | :---: | :--- | :---: |
| `NODE_ENV` | Application environment | Yes | `production` / `development` | No |
| `PORT` | Local dev server port | Yes | `3000` | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes (Target) | `postgresql://user:pass@localhost:5432/naptcs` | Yes |
| `MONGODB_URI` | MongoDB audit ledger string | Yes (Target) | `mongodb://user:pass@localhost:27017/naptcs_audit` | Yes |
| `REDIS_URL` | Redis session cache URL | Yes (Target) | `redis://:pass@localhost:6379` | Yes |
| `MINIO_ENDPOINT`| S3/MinIO document endpoint | Yes (Target) | `https://s3.nita.gov.gh` | No |
| `MINIO_ACCESS_KEY`| MinIO API access key | Yes (Target) | `<REDACTED_ACCESS_KEY>` | Yes |
| `MINIO_SECRET_KEY`| MinIO API secret key | Yes (Target) | `<REDACTED_SECRET_KEY>` | Yes |
| `JWT_SECRET` | Cryptographic secret for signing | Yes (Target) | `<REDACTED_256_BIT_SECRET>` | Yes |
| `VITE_API_URL` | Base REST API Gateway URL | Optional | `https://api.naptcs.gov.gh/v1` | No |

---

## 20. Local Development Setup

Follow these exact steps to run the system locally from a clean machine:

### Prerequisites
1. **Operating System**: Windows 10/11, macOS, or Linux.
2. **Node.js**: Version $\ge 18.0.0$ (LTS recommended).
3. **NPM**: Version $\ge 9.0.0$.
4. **Git**: Installed and on system PATH.

### Step-by-Step Instructions

```bash
# 1. Clone the repository
git clone https://github.com/nkwasi262-glitch/ai-tracker.git
cd ai-tracker

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

*Note for Windows PowerShell Users*: If script execution policies prevent running npm directly, run via command shell:
```powershell
cmd /c npm run dev
```

Open your browser to `http://localhost:3000`.

### Production Build Validation
```bash
cmd /c npm run build
```
This runs `tsc` for TypeScript type verification followed by `vite build`. Output is bundled into `dist/`.

---

## 21. Testing Architecture & Coverage Status

### Current Status: ZERO AUTOMATED TESTS
An inspection of the repository confirms that **no test files (`.test.ts`, `.spec.tsx`) or test runners (Vitest, Jest, Cypress, Playwright) are currently configured**.

### Testing Table
| Test Type | Framework | Location | Command | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Type Checking** | TypeScript Compiler (`tsc`) | `tsconfig.json` | `npm run build` | **PASSED (0 Errors)** |
| **Unit Tests** | Not Installed | Missing | N/A | **NOT IMPLEMENTED** |
| **Component Tests** | Not Installed | Missing | N/A | **NOT IMPLEMENTED** |
| **E2E Integration** | Not Installed | Missing | N/A | **NOT IMPLEMENTED** |
| **VAPT Pen-Test** | External Manual | SOW Section 6 | External | **REQUIRED BEFORE GO-LIVE** |

### Recommended Test Configuration
To establish professional quality assurance, install Vitest and React Testing Library:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## 22. Deployment Architecture

### A. Docker Containerization (Verified)
The repository includes a production-ready `Dockerfile`:
```dockerfile
# Build Stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve Stage
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Build and Run with Docker
```bash
docker build -t naptcs-portal:latest .
docker run -d -p 8080:80 --name naptcs-container naptcs-portal:latest
```
Access at `http://localhost:8080`.

### B. Static Hosting (Netlify)
The repository includes `link.txt` pointing to an active Netlify deployment:  
`https://spontaneous-travesseiro-47e455.netlify.app/`

---

## 23. CI/CD

### Current Status
* **Automated CI/CD Workflows**: **NOT FOUND** (No `.github/workflows` in repository).
* **Manual Delivery**: Code is currently built locally and committed/pushed to GitHub `main` branch.

### Recommended GitHub Actions Workflow (`.github/workflows/ci.yml`)
```yaml
name: NAPTCS Continuous Integration
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

---

## 24. Security Architecture & Statutory Compliance

### Security Controls Status
* **Authentication**: Simulated client-side via `RoleSwitcher.tsx` (**PARTIAL / MOCK**).
* **Authorization (RBAC)**: Role checks enforced in React state and Layout filters (**IMPLEMENTED**).
* **XSS Protection**: React virtual DOM auto-escaping prevents script injection in rendered text (**IMPLEMENTED**).
* **Public Data Redaction**: SOW Section 5.7 and Act 843 Section 23 redaction of penetration reports and internal risk logs in `PublicVerification.tsx` (**IMPLEMENTED**).
* **CSRF Protection**: Not required for current client-only state; required once backend cookies/sessions are added (**TARGET**).
* **Secrets Management**: No API keys or passwords hardcoded in source code (**IMPLEMENTED**).

### Statutory Compliance Matrix
* **Data Protection Act, 2012 (Act 843)**: Enforced via mandatory DPC registration checks and Data Protection Officer declarations.
* **Cybersecurity Act, 2020 (Act 1038)**: Modeled via VAPT penetration report requirements and Critical Information Infrastructure (CII) risk classifications.
* **EU AI Act & ISO/IEC 42001**: 4-tier risk classification engine (*Minimal*, *Limited*, *High*, *Prohibited*).

---

## 25. Logging & Monitoring

### Current Status
* **Client-Side**: Browser `console.error` and `console.log` during operations.
* **Target Observability**: As documented in `architecture/devops_architecture.md`, the production target requires **Prometheus** metrics scraping (`/metrics`), **FluentBit** log collectors, and an **Elasticsearch + Kibana** central dashboard.

---

## 26. Backup & Recovery

### Current Status
* Since data is currently held in in-memory React state, refreshing the browser window resets mutations back to `sampleProjects.ts`.
* **Target RPO / RTO**: Section 6 of the SOW mandates 99.5% availability with Recovery Point Objective (RPO) $\le 1\text{ hour}$ and Recovery Time Objective (RTO) $\le 4\text{ hours}$. Production PostgreSQL requires automated WAL archiving and pg_dump snapshots.

---

## 27. Integrations & External Dependencies

### External Network Dependencies
1. **Unpkg CDN (`unpkg.com`)**: Injects Leaflet 1.9.4 CSS (`leaflet.css`) and JavaScript (`leaflet.js`) dynamically in `index.html`.
2. **Google Fonts (`fonts.googleapis.com`)**: Injects `Inter` and `Outfit` font families.
3. **CartoDB & ESRI Tile Servers**: Leaflet maps stream basemap tiles over HTTPS from CartoDB and ESRI World Imagery.

---

## 28. File-by-File Technical Code Reference

| File Path | Primary Function / Purpose | Key Exports / Components | Dependencies | Architectural Notes |
| :--- | :--- | :--- | :--- | :--- |
| `src/App.tsx` | Master application state coordinator | `App` | React, all components, sample data | Owns `projects`, `organizations`, cascading gatekeeper mutation |
| `src/main.tsx` | Client DOM mounting | None (root execution) | `react-dom/client`, `App.tsx` | Renders `<App />` inside `#root` |
| `src/index.css` | Complete design system | CSS classes & variables | Google Fonts | 17KB custom glassmorphic stylesheet |
| `src/data/sampleProjects.ts` | Data models & preloaded records | `AIProject`, `Organization`, `sampleOrganizations`, `sampleProjects`, `ghanaRegions` | None | Single source of truth for in-memory data |
| `src/api/gisSpatialApi.ts` | PostGIS simulation & spatial exports | `getProjectsGeoJSON`, `querySpatialRadius`, `exportSpatialData` | `sampleProjects.ts` | RFC 7946 GeoJSON, Haversine, KML/CSV |
| `src/components/Layout.tsx` | Application shell & navigation | `Layout` | `RoleSwitcher.tsx`, `lucide-react` | Restricts navigation tabs for Public User |
| `src/components/RoleSwitcher.tsx` | Role selector | `RoleSwitcher`, `UserRole` | `lucide-react` | 8 NAPTCS stakeholder roles |
| `src/components/Dashboard.tsx` | Executive M&E analytics | `Dashboard` | `recharts`, `lucide-react` | Dual-sector toggle, clearance funnel |
| `src/components/OrganizationClearance.tsx`| Gatekeeper accreditation | `OrganizationClearance` | `lucide-react` | Certificate issuance, entity unlocking |
| `src/components/ProjectRegistry.tsx` | AI project registry & wizard | `ProjectRegistry` | `lucide-react` | Risk pre-classification & statutory gates |
| `src/components/PublicVerification.tsx` | Public certificate lookup | `PublicVerification` | `lucide-react` | SOW Section 5.7 lookup & redaction |
| `src/components/GISGeospatial.tsx` | Leaflet map & API console | `GISGeospatial` | `gisSpatialApi.ts`, `leaflet.js` | 16 regions density, radius tool, exports |
| `src/components/GovernanceCompliance.tsx`| Act 843 scorecard | `GovernanceCompliance` | `lucide-react` | NGS score calculation ($0.2F+0.25T+0.2P+0.35C$) |
| `src/components/AIReadiness.tsx` | Institutional maturity | `AIReadiness` | `lucide-react` | 5-pillar maturity sliders (Initial to Optimized) |
| `src/components/RiskManagement.tsx` | 5x5 threat matrix | `RiskManagement` | `lucide-react` | Interactive Likelihood vs Impact grid |
| `src/components/DocumentManager.tsx` | Document vault & OCR | `DocumentManager` | `lucide-react` | S3 versioning & full-text search simulation |
| `src/components/AIChatAssistant.tsx` | Regulatory assistant | `AIChatAssistant` | `lucide-react` | Deterministic offline NLP engine |

---

## 29. Known Issues & Edge Cases

1. **State Ephemerality**: In-memory state mutations (adding projects, clearing entities) reset on full page reload because no persistent database or `localStorage` sync is attached.
2. **Leaflet CDN Failure in Offline Environments**: Because Leaflet 1.9.4 CSS/JS are imported from `unpkg.com` in `index.html`, running the application in an air-gapped environment without internet access will cause map rendering errors.
3. **Large JavaScript Chunk Warning**: Production build generates a single bundle `dist/assets/index-B8P7YIol.js` (955 kB minified). Rollup warns that chunk exceeds 500 kB. Code splitting using `React.lazy()` is recommended.
4. **Mock File Uploads**: Uploading documents in `DocumentManager.tsx` accepts file metadata but does not physically transmit binary streams to an object store.

---

## 30. Technical Debt Register

| Priority | Component | Issue Description | Impact | Recommended Resolution |
| :---: | :--- | :--- | :--- | :--- |
| **High** | `App.tsx` | Lack of persistent storage adapter | Data lost on refresh | Connect to PostgreSQL REST API or fallback to `localStorage` |
| **High** | `package.json` | Missing automated testing suite | Regressions undetected | Install Vitest + React Testing Library |
| **Medium** | `index.html` | External CDN dependencies (Leaflet) | Breaks in air-gapped environments | Install `leaflet` via npm and bundle locally |
| **Medium** | `vite.config.ts` | Single large bundle (> 900 kB) | Initial load time increased | Configure `manualChunks` in `rollupOptions` |
| **Low** | `RoleSwitcher.tsx` | Client-side role spoofing | Insecure in multi-user prod | Replace with OAuth2 / JWT backend token validation |

---

## 31. Troubleshooting Guide

### Issue 1: `npm run build` fails with PowerShell security error
* **Symptom**: `File ...\npm.ps1 cannot be loaded because running scripts is disabled on this system.`
* **Solution**: Execute the build via Windows command shell:
  ```powershell
  cmd /c npm run build
  ```

### Issue 2: Leaflet Map does not render or shows blank tiles
* **Symptom**: Grey box inside the GIS component; map tiles missing.
* **Causes**:
  1. No internet connection to reach `unpkg.com` or CartoDB tile servers.
  2. Map container dimensions not initialized before Leaflet mount.
* **Solution**: Ensure internet access is active. In `GISGeospatial.tsx`, Leaflet already executes `map.invalidateSize()` after DOM mount to guarantee correct sizing.

### Issue 3: TypeScript unused variables error (`TS6133`)
* **Symptom**: `error TS6133: 'xyz' is declared but its value is never read.`
* **Cause**: `tsconfig.json` has `noUnusedLocals: true` and `noUnusedParameters: true`.
* **Solution**: Remove unused variables or prefix parameter names with an underscore (`_param`).

---

## 32. Developer Handover Guide (20-Point Briefing)

If you are a new engineer taking over this repository today, memorize these 20 points:

1. **System Identity**: This is the **National AI Project Tracking and Clearance System (NAPTCS)** for Ghana.
2. **Current Form**: It is currently an interactive **React 18 + TypeScript + Vite Single Page Application**.
3. **No External Backend Yet**: Business logic, spatial queries, and clearance gates run in TypeScript on the client.
4. **The Gatekeeper Rule**: Projects cannot be published or displayed publicly until their parent organization is cleared (`isOrganizationCleared === true`).
5. **Dual Sector Support**: Handles both Government MDAs/SOEs and Private Tech Firms.
6. **Statutory Anchors**: Governed by Ghana Data Protection Act 2012 (Act 843) and Cybersecurity Act 2020 (Act 1038).
7. **Where Data Lives**: All initial seed data is in [`src/data/sampleProjects.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/data/sampleProjects.ts).
8. **Where Master State Lives**: Coordinated centrally in [`src/App.tsx`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/App.tsx).
9. **Where Spatial API Lives**: Simulated PostGIS queries and GeoJSON RFC 7946 exports live in [`src/api/gisSpatialApi.ts`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/api/gisSpatialApi.ts).
10. **Where Design System Lives**: 100% custom Vanilla CSS in [`src/index.css`](file:///c:/Users/N1TA/Ghana-AI-Project-Tracker-1/src/index.css) (no Tailwind).
11. **Leaflet Ingestion**: Injected via CDN in `index.html` and accessed via `(window as any).L`.
12. **AI Chatbot**: Runs offline deterministically in `AIChatAssistant.tsx` (no API key required).
13. **Role Testing**: Change user roles via the top-bar dropdown (`RoleSwitcher.tsx`).
14. **Public Verification**: SOW Section 5.7 certificate lookup lives in `PublicVerification.tsx`.
15. **Local Port**: Runs on `http://localhost:3000` via `npm run dev`.
16. **Build Command**: Validated via `cmd /c npm run build`. Must compile with 0 TypeScript errors.
17. **Docker Ready**: Build container with `docker build -t naptcs .` and run on port 80.
18. **Target Architecture**: The `architecture/` folder contains the specifications for the future NestJS/PostgreSQL backend.
19. **What Not to Break**: Never remove the gatekeeper invariant check in `App.tsx` or `ProjectRegistry.tsx`.
20. **Security Mandate**: Never commit real API keys, passwords, or citizen PII to Git.

---

## 33. Continuation Roadmap

### Phase 1: Critical (Persistence & Backend Foundations)
1. **Develop REST API Backend**: Build a Node.js / NestJS or Go REST service matching the simulated endpoints in `gisSpatialApi.ts`.
2. **PostgreSQL + PostGIS Database**: Deploy PostgreSQL 15 with the PostGIS extension; migrate models from `sampleProjects.ts` to relational DDL.
3. **State Sync**: Replace in-memory state in `App.tsx` with asynchronous API calls (`fetch` / React Query).

### Phase 2: Important (Security & Quality Assurance)
1. **Automated Testing Suite**: Configure Vitest and React Testing Library; achieve $\ge 80\%$ test coverage on clearance gatekeeper logic.
2. **Localize Leaflet**: Install `leaflet` and `@types/leaflet` via npm; remove CDN links from `index.html` to support air-gapped government networks.
3. **Code Splitting**: Implement `React.lazy()` for heavy components (`GISGeospatial`, `AIChatAssistant`, `GovernanceCompliance`) to reduce bundle size under 500 kB.

### Phase 3: Enhancements (National Scale & Integrations)
1. **Government SSO Integration**: Connect OAuth2/OIDC provider to Ghana Gov-SSO portal.
2. **Physical Object Storage**: Connect `DocumentManager.tsx` to a real MinIO or AWS S3 bucket using pre-signed upload URLs.
3. **Live WebSockets**: Replace polling telemetry stream with live WebSocket feed (`/ws/telemetry`).

---

## 34. Verification Required (Target vs Actual Audit)

The incoming engineering team must note the following specifications found in documentation that represent **planned target designs requiring verification and construction**:

* **Backend Frameworks**: NestJS, ASP.NET Core, and Python/FastAPI mentioned in `system_architecture.md` are **architectural specifications, not current code**.
* **Database Clusters**: PostgreSQL, MongoDB, Redis, and MinIO instances are currently modeled as in-memory TypeScript structures.
* **External Government APIs**: Integrations with the Registrar General's Department, GRA TIN database, and National CERT are currently validated via simulated client-side logic.

---

## 35. Glossary of Terms

* **NAPTCS**: National AI Project Tracking and Clearance System
* **GNAPRMS**: Ghana National AI Projects Registry & Monitoring System
* **MDA**: Ministry, Department, or Agency (Ghana Public Sector)
* **MMDA**: Metropolitan, Municipal, and District Assembly
* **SOE**: State-Owned Enterprise
* **NITA**: National Information Technology Agency (Ghana IT Regulator)
* **MoCD**: Ministry of Communications and Digitalisation
* **DPC**: Data Protection Commission
* **Act 843**: Ghana Data Protection Act, 2012
* **Act 1038**: Ghana Cybersecurity Act, 2020
* **TCC**: Technical Review Committee
* **DPIA**: Data Protection Impact Assessment
* **VAPT**: Vulnerability Assessment and Penetration Testing
* **NGS**: National Governance Score ($0.20F + 0.25T + 0.20P + 0.35C$)
* **SEIS**: Socio-Economic Impact Score
* **eGIF**: Ghana e-Government Interoperability Framework
* **WGS84**: World Geodetic System 1984 (EPSG:4326) coordinate standard

---
*Documentation compiled and verified by Senior AI Software Engineer & System Documentation Architect.*
