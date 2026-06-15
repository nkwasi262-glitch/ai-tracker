# Ghana National AI Projects Registry & Monitoring System (GNAPRMS)

Welcome to the **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)**. This platform acts as the sovereign single source of truth for Artificial Intelligence initiatives being developed or deployed across Ghana. It supports national AI governance, transparency, monitoring, ethical compliance, regional GIS tracking, budget optimization, and predictive risk management.

---

## 🚀 Interactive Portal Features

GNAPRMS is implemented as a premium, highly interactive **React, TypeScript, and Vite** Single Page Application styled with a custom vanilla CSS design system (slate, emerald, and gold colorways, smooth micro-animations, glowing forms, and glassmorphic overlays).

1. **M&E Dashboard**: National KPI counters tracking total projects, budget caps, compliance grades, and readiness indices with dynamic Recharts plots (Budget utilization bars, sector radars, ethical trend lines) and active alerts.
2. **Project Registry**: List browser on the left (drill-down to milestones and details) and a formal project submission form on the right with live validation rules.
3. **GIS Spatial Map**: Interactive open-data map using **Leaflet.js** and CartoDB Dark Matter tile arrays centered on Ghana. Displays project markers, popups, and translucent regional heat circles depicting project density.
4. **Governance & Ethics**: Multi-dimensional ethical scorecard assessing algorithms against Fairness, Transparency, Accountability, Privacy, and Security, yielding dynamic National Governance Scores (NGS) and compliance grades.
5. **AI Readiness maturity wizard**: Wizard sliders measuring institutional skills, infrastructure, data, funding, and policies to classify departments into 4 maturity levels alongside dynamic action guidelines.
6. **Risk Management Matrix**: Classic 5x5 threat matrix mapping likelihood vs impact. Interactive grids allow operators to click on critical threat pins, read mitigations, and cross them off (moving from "Open" to "Mitigated").
7. **Document Management & OCR**: Sovereign object storage (MinIO simulation) tracking document revisions, digital signatures, and a **Full-Text OCR Search Engine** indexing and highlighting search terms inside uploaded PDFs.
8. **AI Chat Assistant**: Conversational agent preloaded with the **Ghana Data Protection Act 2012 (Act 843)**, **Cybersecurity Act 2020 (Act 1038)**, and the active registry data to answer natural language queries.
9. **AI Observatory & Recommendation Engine**: Synthesizes emerging technologies, tracks collaborative university papers (KNUST, UG, Ashesi), and computes agency synergies to advice cross-agency partnerships.
10. **Dynamic Role Switcher**: Quick selector in the header permitting staging testers to switch identities (Super Admin, Ministry Auditor, PM, Public User) and watch the interface restrict options, tabs, and write permissions in real-time.

---

## 📂 Repository Directory Layout

The repository is structured into two primary divisions:

```text
/
├── architecture/                     # Enterprise Architecture & Compliance Suites
│   ├── system_architecture.md        # Microservices layout, Kong API gateway, event buses
│   ├── database_erd.md               # PostgreSQL and MongoDB Dual-DB schemas & Mermaid ERD
│   ├── security_architecture.md      # OAuth2/SSO, RBAC/ABAC models, Act 843 & Act 1038 guidelines
│   ├── devops_architecture.md        # Docker Compose, K8s orchestration, CI/CD, Prometheus telemetry
│   ├── ai_governance_framework.md    # Ethical scoring calculations, pillar matrices
│   ├── me_framework.md               # National KPIs, SEIS scorecard formulas, verification paths
│   └── user_administrator_manual.md  # Detailed operator handbook
│
├── src/                              # React + TypeScript Frontend Prototype
│   ├── components/                   # Interactive portal view sub-modules
│   │   ├── Layout.tsx                # Sidebar shell & role-based tab filters
│   │   ├── RoleSwitcher.tsx          # Dynamic identity context swapper
│   │   ├── Dashboard.tsx             # M&E statistics & Recharts plotting
│   │   ├── ProjectRegistry.tsx       # Search browsers and validation entry forms
│   │   ├── GISGeospatial.tsx         # Leaflet.js dark map wrapper
│   │   ├── GovernanceCompliance.tsx  # Ethical checklist scorecards
│   │   ├── AIReadiness.tsx           # Multi-slider maturity calculators
│   │   ├── RiskManagement.tsx        # 5x5 Likelihood vs Impact Matrix
│   │   ├── DocumentManager.tsx       # S3 vault, digital signatures & OCR search
│   │   ├── AIChatAssistant.tsx       # Natural Language conversational chatbot
│   │   └── NationalObservatory.tsx   # Synergy recommendation engine & trends
│   ├── data/
│   │   └── sampleProjects.ts         # Preloaded cocoa, Akosombo, translation, and tax datasets
│   ├── App.tsx                       # Master central orchestrator and state coordinator
│   ├── main.tsx                      # Client DOM mount node
│   └── index.css                     # Complete responsive CSS design system
│
├── package.json                      # Workspace dependencies
├── vite.config.ts                    # Vite compiler server options
├── tsconfig.json                     # TypeScript compilation specifications
├── index.html                        # Main HTML entry carrying Outfit/Inter fonts & Leaflet links
└── README.md                         # Product index guide
```

---

## ⚡ Quick Start: Running Locally

To launch the interactive GNAPRMS prototype dashboard in your local web browser, execute the following commands in your shell:

### 1. Retrieve dependencies
```bash
npm install
```

### 2. Launch local compiler and dev server
```bash
npm run dev
```
*The local development server launches instantly on [http://localhost:3000](http://localhost:3000).*

---

## 📜 Legal & Legislative Alignment

The platform is designed in strict compliance with crucial Ghanaian sovereign regulations:
* **Data Protection Act, 2012 (Act 843)**: Mandates sovereign hosting limits inside Ghana's borders, appointed Data Protection Officers (DPO), and automated PII anonymization pipelines.
* **Cybersecurity Act, 2020 (Act 1038)**: Defines registry databases as Critical Information Infrastructure (CII), enforcing immutable, append-only security transaction audit trails (MongoDB models) and direct National CERT integration alerts.
