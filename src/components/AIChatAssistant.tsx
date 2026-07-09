import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquareCode } from 'lucide-react';
import { AIProject, formatNumberToWords } from '../data/sampleProjects';

interface AIChatAssistantProps {
  projects: AIProject[];
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
}

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const elements: React.ReactNode[] = [];

  const parseInline = (str: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    const splitParts = str.split(regex);

    splitParts.forEach((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        parts.push(<strong key={index}>{part.slice(2, -2)}</strong>);
      } else if (part.startsWith('`') && part.endsWith('`')) {
        parts.push(
          <code key={index} style={{
            background: 'rgba(255,255,255,0.08)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '0.85em',
            border: '1px solid rgba(255,255,255,0.05)',
            color: '#fbbf24'
          }}>
            {part.slice(1, -1)}
          </code>
        );
      } else {
        parts.push(part);
      }
    });

    return parts;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith('|')) {
      if (line.includes('---')) {
        continue;
      }
      const cols = line.split('|').map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (!inTable) {
        inTable = true;
        tableHeaders = cols;
        tableRows = [];
      } else {
        tableRows.push(cols);
      }
      continue;
    } else {
      if (inTable) {
        const currentHeaders = [...tableHeaders];
        const currentRows = [...tableRows];
        elements.push(
          <div key={`table-${i}`} style={{ overflowX: 'auto', margin: '14px 0', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
                  {currentHeaders.map((h, idx) => (
                    <th key={idx} style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentRows.map((row, rowIdx) => (
                  <tr key={rowIdx} style={{ borderBottom: rowIdx < currentRows.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: rowIdx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                    {row.map((col, colIdx) => (
                      <td key={colIdx} style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                        {parseInline(col)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
    }

    if (line === '') {
      elements.push(<div key={`br-${i}`} style={{ height: '8px' }} />);
      continue;
    }

    if (line.startsWith('### ')) {
      elements.push(<h4 key={`h3-${i}`} style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '14px', marginBottom: '6px' }}>{parseInline(line.slice(4))}</h4>);
    } else if (line.startsWith('## ')) {
      elements.push(<h3 key={`h2-${i}`} style={{ fontSize: '1.05rem', fontWeight: 700, color: '#10b981', marginTop: '16px', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '4px' }}>{parseInline(line.slice(3))}</h3>);
    } else if (line.startsWith('# ')) {
      elements.push(<h2 key={`h1-${i}`} style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', marginTop: '18px', marginBottom: '10px' }}>{parseInline(line.slice(2))}</h2>);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <ul key={`ul-${i}`} style={{ margin: '4px 0 4px 16px', padding: 0, listStyleType: 'disc' }}>
          <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {parseInline(line.slice(2))}
          </li>
        </ul>
      );
    } else if (/^\d+\.\s/.test(line)) {
      const dotIndex = line.indexOf('.');
      elements.push(
        <ol key={`ol-${i}`} style={{ margin: '4px 0 4px 16px', padding: 0, listStyleType: 'decimal' }}>
          <li style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {parseInline(line.slice(dotIndex + 2))}
          </li>
        </ol>
      );
    } else if (line.startsWith('> ')) {
      let quoteText = line.slice(2);
      let alertStyle: React.CSSProperties = {
        padding: '10px 14px',
        borderRadius: '8px',
        borderLeft: '4px solid var(--border-color)',
        background: 'rgba(255,255,255,0.02)',
        fontSize: '0.8rem',
        margin: '10px 0',
        lineHeight: 1.4
      };

      if (quoteText.startsWith('[!NOTE]')) {
        quoteText = quoteText.slice(7).trim();
        alertStyle.borderLeftColor = 'var(--text-muted)';
      } else if (quoteText.startsWith('[!TIP]')) {
        quoteText = quoteText.slice(6).trim();
        alertStyle.borderLeftColor = '#10b981';
        alertStyle.background = 'rgba(16,185,129,0.03)';
      } else if (quoteText.startsWith('[!WARNING]')) {
        quoteText = quoteText.slice(10).trim();
        alertStyle.borderLeftColor = '#f59e0b';
        alertStyle.background = 'rgba(245,158,11,0.03)';
      } else if (quoteText.startsWith('[!IMPORTANT]')) {
        quoteText = quoteText.slice(12).trim();
        alertStyle.borderLeftColor = '#3b82f6';
        alertStyle.background = 'rgba(59,130,246,0.03)';
      } else if (quoteText.startsWith('[!CAUTION]')) {
        quoteText = quoteText.slice(10).trim();
        alertStyle.borderLeftColor = '#ef4444';
        alertStyle.background = 'rgba(239,68,68,0.03)';
      }

      elements.push(
        <div key={`quote-${i}`} style={alertStyle}>
          {parseInline(quoteText)}
        </div>
      );
    } else {
      elements.push(
        <p key={`p-${i}`} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '4px 0' }}>
          {parseInline(line)}
        </p>
      );
    }
  }

  if (inTable) {
    const currentHeaders = [...tableHeaders];
    const currentRows = [...tableRows];
    elements.push(
      <div key={`table-last`} style={{ overflowX: 'auto', margin: '14px 0', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid var(--border-color)' }}>
              {currentHeaders.map((h, idx) => (
                <th key={idx} style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderBottom: rowIdx < currentRows.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', background: rowIdx % 2 === 1 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                {row.map((col, colIdx) => (
                  <td key={colIdx} style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                    {parseInline(col)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <>{elements}</>;
};

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ projects }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'assistant', text: 'Welcome to the National AI Governance Assistant! 🇬🇭 I can answer inquiries regarding Ghana\'s Cybersecurity Act 2020 (Act 1038), Data Protection Act 2012 (Act 843), or pull real-time budget, compliance, and risk metrics for all registered projects.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scrolls chat window on new bubbles
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sampleQuestions = [
    "What is the GNAPRMS platform and its key interactive features?",
    "Explain the 2026 Ghana National AI Strategy & Initiatives",
    "Describe the microservices system IT architecture & databases",
    "What are the security standards, encryption, and MFA details?",
    "Which legal Acts and Bills govern AI systems in Ghana?",
    "What is the total registry budget and active project count?",
    "What are the 8 user roles and access boundaries (RBAC/ABAC)?"
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    setTimeout(() => {
      let replyText = '';
      const query = text.toLowerCase().trim();

      // Helper function to find a project dynamically in the projects array
      const findProject = (q: string): AIProject | undefined => {
        // Direct match code or ID
        let p = projects.find(proj => proj.projectCode.toLowerCase() === q || proj.id.toLowerCase() === q);
        if (p) return p;

        // Partial match code or ID
        p = projects.find(proj => proj.projectCode.toLowerCase().includes(q) || proj.id.toLowerCase().includes(q));
        if (p) return p;

        // Match MDA code
        p = projects.find(proj => proj.mdaCode.toLowerCase() === q);
        if (p) return p;

        // Match name keywords
        p = projects.find(proj => proj.name.toLowerCase().includes(q));
        if (p) return p;

        // Match description/category/sector keywords
        p = projects.find(proj => 
          proj.description.toLowerCase().includes(q) || 
          proj.category.toLowerCase().includes(q) || 
          proj.sector.toLowerCase().includes(q)
        );
        if (p) return p;

        // Semantic maps for common user phrases
        const keywordsMap: Record<string, string[]> = {
          'cocoa': ['cocoa', 'pest', 'disease', 'farm', 'agri', 'cobod', 'cocobod'],
          'akosombo': ['akosombo', 'dam', 'hydrology', 'vra', 'flood', 'spillway'],
          'twi': ['twi', 'medical', 'translation', 'nlp', 'speech', 'moh'],
          'justice': ['e-justice', 'justice', 'judicial', 'legal', 'court', 'moj'],
          'tax': ['tax', 'fraud', 'gra', 'revenue', 'evasion'],
          'galamsey': ['galamsey', 'satellite', 'epa', 'mining', 'canopy']
        };

        for (const [key, keywords] of Object.entries(keywordsMap)) {
          if (keywords.some(k => q.includes(k))) {
            const found = projects.find(proj => 
              proj.name.toLowerCase().includes(key) || 
              proj.mdaCode.toLowerCase().includes(key) || 
              proj.description.toLowerCase().includes(key)
            );
            if (found) return found;
          }
        }

        return undefined;
      };

      const matchedProject = findProject(query);

      // Helper matching functions with word boundaries for general terms
      const matchesKeyword = (kw: string) => {
        if (kw.includes(' ')) {
          return query.includes(kw);
        }
        return new RegExp(`\\b${kw}\\b`, 'i').test(query);
      };
      const matchesAnyKeyword = (kws: string[]) => kws.some(matchesKeyword);

      const isProjectSpecificQuery = (q: string) => {
        const projectTerms = [
          'gps', 'postgps', 'card', 'biometric', 'cocoa', 'cobod', 'cocobod',
          'justice', 'court', 'nhis', 'nhia', 'leap', 'aicare', 'bawa', 'bawahealth',
          'sesi', 'agritech', 'oze', 'kudigo', 'regulon', 'khaya', 'bloop', 'nexus',
          'gn-ai', 'proj-', 'claims', 'insurance', 'beneficiary', 'poverty'
        ];
        return projectTerms.some(term => q.includes(term));
      };

      const containsGeneralSystem = matchesAnyKeyword(['system', 'gnaprms', 'platform', 'software', 'app', 'portal', 'tracker', 'website', 'about the project', 'what is this']);
      const containsGeneralIT = matchesAnyKeyword(['it', 'technology', 'infrastructure', 'backend', 'frontend', 'server', 'hardware']);
      const containsGeneralSecurity = matchesAnyKeyword(['security', 'cyber', 'cybersecurity', 'encrypt', 'protect', 'auth', 'mfa', 'otp', 'token', 'jwt', 'rbac', 'abac', 'role', 'permission', 'access', 'audit', 'cert', 'cii', 'switcher']);
      const containsGeneralAct = matchesAnyKeyword(['act', 'law', 'legislation', 'regulation', 'bill', 'legal', 'act 843', 'act 1038', 'data protection', 'privacy']);
      const containsGeneralAI = matchesAnyKeyword(['ai', 'artificial intelligence', 'strategy', 'roadmap', 'national ai strategy', 'national strategy', 'observatory', 'synergy', 'responsible ai authority']);

      // 1. Strong Project Specific matches first
      if (matchedProject && isProjectSpecificQuery(query)) {
        const p = matchedProject;
        const budgetDisbursed = (p.budget.disbursed / 1000000).toFixed(2);
        const budgetRemaining = (p.budget.remaining / 1000000).toFixed(2);
        const utilRate = ((p.budget.utilized / (p.budget.disbursed || 1)) * 100).toFixed(1);

        const milestonesStr = p.milestones.length > 0
          ? p.milestones.map(m => `- **${m.title}**: ${m.progressPercent}% progress (${m.status}) - Due: \`${m.dueDate}\``).join('\n')
          : '*No milestones logged for this project.*';

        const risksStr = p.risks.length > 0
          ? p.risks.map(r => `- [${r.severity}] **${r.category}**: ${r.description} (Status: \`${r.status}\`) \n  *Mitigation*: ${r.mitigationPlan}`).join('\n')
          : '*No active risks logged for this project.*';

        const docsStr = p.documents.length > 0
          ? p.documents.map(d => `- **${d.fileName}** (v${d.version}, uploaded \`${d.uploadedAt}\`) - Signed: ${d.signedBy.join(', ') || 'Unsigned'}`).join('\n')
          : '*No documents uploaded yet.*';

        replyText = `## Project Details: ${p.name}
### Code: \`${p.projectCode}\` | Status: \`${p.status}\` | Stage: \`${p.stage}\`

**Description**: ${p.description}

### 📋 Registry Metadata
| Attribute | Details |
|---|---|
| **MDA Owner** | ${p.mda} (${p.mdaCode}) |
| **Sector / Category** | ${p.sector} / ${p.category} |
| **GIS Location** | ${p.region} Region, ${p.district} District |
| **Coordinates** | \`Lat: ${p.latitude}, Long: ${p.longitude}\` |
| **Timeline** | ${p.startDate} to ${p.expectedCompletionDate} |
| **NARI Score** | **${p.readinessScore}%** |

### 💰 Financing Details
- **Total Allocated**: ${formatNumberToWords(p.budget.totalAllocated)} GHS (GHS ${p.budget.totalAllocated.toLocaleString('en-US')})
- **Disbursed**: GHS ${budgetDisbursed}M
- **Utilized**: ${formatNumberToWords(p.budget.utilized)} GHS (GHS ${p.budget.utilized.toLocaleString('en-US')}) (Utilization Rate: **${utilRate}%**)
- **Remaining**: GHS ${budgetRemaining}M
- **Funding Source**: ${p.budget.primaryFundingSource} (${p.budget.currency})

### ⚖️ Ethical Scorecard (NGS Breakdown)
| Governance Pillar | Score | Weight | Weighted Score |
|---|---|---|---|
| **Fairness & Tribal Equity** | ${p.compliance.fairness}% | 20% | ${(p.compliance.fairness * 0.2).toFixed(1)}% |
| **Transparency & Explainability** | ${p.compliance.transparency}% | 25% | ${(p.compliance.transparency * 0.25).toFixed(1)}% |
| **Privacy (Act 843)** | ${p.compliance.privacy}% | 20% | ${(p.compliance.privacy * 0.2).toFixed(1)}% |
| **Security (Act 1038)** | ${p.compliance.security}% | 35% | ${(p.compliance.security * 0.35).toFixed(1)}% |
| **OVERALL GRADE** | **${p.compliance.overallGrade}** | **100%** | **${((p.compliance.fairness * 0.2) + (p.compliance.transparency * 0.25) + (p.compliance.privacy * 0.2) + (p.compliance.security * 0.35)).toFixed(0)}%** |

### 🚀 Implementation Milestones
${milestonesStr}

### ⚠️ Active Threats & Mitigation Plan
${risksStr}

### 🗄️ Uploaded Documents & Electronic Signs
${docsStr}
`;
      }
      // 2. System / Platform Overview General Topic
      else if (containsGeneralSystem) {
        replyText = `## 🇬🇭 Ghana National AI Projects Registry & Monitoring System (GNAPRMS)
GNAPRMS is the sovereign single source of truth for Artificial Intelligence initiatives being developed or deployed across the Republic of Ghana. Designed for IT Regulators, M&E Officers, and Ministry Auditors, it ensures complete ethical compliance, financial tracking, and secure record keeping.

### 🚀 Key Interactive Portal Features
1. **M&E Dashboard**: Real-time KPI counters tracking registered projects, budgets, and compliance distribution with dynamic Recharts plots.
2. **Project Registry**: Drill-down project browser and project submission form with live validation rules.
3. **GIS Geospatial Map**: Interactive open-data map centered on Ghana utilizing **Leaflet.js** and CartoDB Dark Matter.
4. **Governance & Ethics Scorecard**: Calculates the **National Governance Score (NGS)** based on Fairness, Transparency, Privacy, and Security.
5. **AI Readiness Maturity Wizard**: Measures institutional capabilities to classify departments into 4 maturity levels.
6. **Risk Management Matrix**: Classic 5x5 threat matrix mapping likelihood vs impact with interactive mitigations.
7. **Document Management & OCR**: Sovereign object storage (MinIO simulation) and a **Full-Text OCR Search Engine** using Tesseract.
8. **National AI Observatory**: Coordination hub for academic partnerships (KNUST, UG, Ashesi) and synergy recommendations.
9. **Dynamic Role Switcher**: Identity swapper to simulate Super Admin, Authority, PM, Auditor, or Public User access in real-time.
`;
      }
      // 3. IT, Architecture & Backend Technologies
      else if (containsGeneralIT || query.includes('architecture') || query.includes('microservice') || query.includes('nest') || query.includes('asp.net') || query.includes('gateway') || query.includes('kong') || query.includes('rabbitmq') || query.includes('database') || query.includes('postgres') || query.includes('sql') || query.includes('mongo') || query.includes('redis') || query.includes('elasticsearch') || query.includes('s3') || query.includes('minio') || query.includes('hybrid') || query.includes('erd') || query.includes('index') || query.includes('table') || query.includes('collection') || query.includes('schema') || query.includes('devops') || query.includes('docker') || query.includes('kubernetes') || query.includes('k8s') || query.includes('ci/cd') || query.includes('prometheus') || query.includes('hpa') || query.includes('scaling') || query.includes('pgbouncer') || query.includes('canary') || query.includes('compose') || query.includes('metrics')) {
        replyText = `## ⚙️ GNAPRMS Enterprise System Architecture & Databases
The platform is designed with a state-of-the-art **Microservices Topology**, a **Hybrid Database Strategy**, and sovereign scaling deployments:

### 🌐 Microservice Topology
1. **Kong API Gateway**: Single entry point handling rate limiting, SSL termination (TLS 1.3), and path routing.
2. **Auth Service (NestJS)**: Manages authentication, SSO OIDC integration, and session blacklists cached in Redis.
3. **Registry Service (NestJS)**: Transactional REST/GraphQL APIs for project lifecycle registries.
4. **Governance Service (ASP.NET Core)**: Implements C# engines for calculating compliance scorecards.
5. **AI Analytics Service (Python/FastAPI)**: Conducts Scikit-learn predictive modeling for project success, budget overrun margins, and delay estimates.
6. **RabbitMQ Event Bus**: Facilitates asynchronous, event-driven integrations (e.g. triggering notifications, background OCR indexing).

### 🗄️ Hybrid Database Stack & Table Schemas
- **PostgreSQL (Transactional Store)**: Handles relational integrity across \`MDAs\`, \`USERS\`, \`PROJECTS\`, \`MILESTONES\`, \`BUDGETS\`, \`COMPLIANCE_ASSESSMENTS\`, \`RISKS\`, and \`AUDIT_LOGS\`.
- **MongoDB (Document Store)**: Handles fast-changing unstructured records, including \`documents_metadata\` (S3 paths, OCR text, digital signature trees) and \`readiness_evaluations\` history.
- **Redis (Token Cache)**: Stores JWT session keys and revoked token blocklists.
- **Elasticsearch**: Indexes OCR text extracted via Tesseract from project contract PDFs for full-text search.
- **MinIO**: Sovereign S3 object storage vault.

### 🐳 DevOps, K8s & Scalability
- **Docker Compose**: Orchestrates PostgreSQL (port 5432), MongoDB (27017), MinIO (9000/9001), Redis (6379), and Kong Gateway (8000/8443) locally.
- **Kubernetes**: 3 master and 4 worker nodes spanning separate availability zones.
- **Auto-Scaling (HPA)**: Pods scale dynamically when CPU > 75% or Memory > 80%.
- **CI/CD & Canary Deployments**: Enforces SAST scans (SonarQube) and dependency scanning (Snyk), routing 5% of traffic to canary releases, scaling up to 100% over 4 hours.
`;
      }
      // 4. Security, Auth, MFA & Access Control
      else if (containsGeneralSecurity) {
        replyText = `## 🔒 Security Architecture, Cryptography & Access Control
GNAPRMS is built for national-scale production workloads, enforcing robust cryptographic standards and fine-grained data isolation in accordance with Ghana's Cybersecurity Act 2020 (Act 1038).

### 🔑 Authentication & MFA
- **OIDC & OAuth 2.0**: Centralized identity system integrating with the **Ghanaian Government Single Sign-On (Gov-SSO)** portal.
- **Argon2id Hashing**: Password hashes are computed with Argon2id (64MB memory, 3 iterations, 4 parallelism).
- **MFA Challenge**: Enforced OTP via local SMS gateways or Google Authenticator (TOTP ciphers).
- **Brute-Force Protection**: IP/username-based rate limiting at Kong API Gateway (max 5 failed login attempts in 10 minutes).

### 👥 Access Control: RBAC & ABAC
- **Role-Based Access Control (RBAC)**:
  - **Super Administrator**: Configure system, manage staff accounts, override compliance status, and inspect system audit logs.
  - **National AI Authority**: Global read access to review national AI pipelines, analyze budgets, and evaluate M&E trends.
  - **Government Administrator**: Sector-wide oversight (e.g., MoCD, MoH). Pulls agency reports and approves registry sub-entries.
  - **Project Manager**: Manages specific assigned projects, adjusts milestone progress, logs risks, and uploads agreements.
  - **M&E Officer**: Regional inspector. Updates compliance scoring, logs GIS verification points, and uploads site evidence.
  - **Auditor**: Global read-only auditor for projects, budgets, and compliance registers.
  - **Public User**: Read-only access to GIS maps, public dashboard metrics, and approved open-data exports.
- **Attribute-Based Access Control (ABAC)**:
  - *Ministerial Isolation*: Users of 'MoH' can only read or edit projects where \`project.mda_owner == 'MoH'\`. Accessing other ministries is blocked.
  - *Geospatial Boundary*: Regional M&E Officers can only log inspections inside their assigned region.

### 🛡️ Cryptographic Data Protection
- **Transit Encryption**: Enforced TLS 1.3 across all endpoints; weak ciphers are disabled at the Kong Gateway.
- **Rest Encryption**: PostgreSQL database volumes encrypted via AES-256-XTS; MinIO S3 document store encrypted server-side with AES-256-GCM.
- **Immutable Audit Trails**: Edits trigger database-level triggers that append immutable, append-only logs to MongoDB, capturing operator, timestamp, and diffs (immutable even for Super Admins).
`;
      }
      // 5. Legislative Acts & Bills (Act 843, Act 1038, Emerging Tech Bill)
      else if (containsGeneralAct) {
        replyText = `## ⚖️ National Legislative Framework & AI Compliance Acts
GNAPRMS directly enforces compliance with Ghana's sovereign legislative mandates:

### 🛡️ Data Protection Act, 2012 (Act 843) Requirements
- **Sovereign Hosting Restriction**: In compliance with Act 843, all production databases and object stores hosting citizen records must be physically hosted on servers located inside Ghana's national borders to prevent unauthorized overseas processing.
- **Data Minimization & Anonymization**: Systems collect only technical parameters; no unnecessary personally identifiable information (PII) is kept. Citizen records are anonymized using SHA-256 hashing.
- **Data Protection Officer (DPO)**: Project teams must designate a certified, registered DPO responsible for logging reviews.
- **Consent Logs**: Digital consent workflows and signature audits are recorded inside the document registry.

### 🔒 Cybersecurity Act, 2020 (Act 1038) Requirements
- **Critical National Information Infrastructure (CII)**: Essential national AI installations (like Akosombo Dam Smart Gates or GNAPRMS itself) are classified as CII under Act 1038, requiring network isolation and CERT-GH integration.
- **Immutable Audit Trail**: All database edits trigger database-level triggers that append immutable, append-only logs to MongoDB, capturing the precise timestamp, operator, IP address, and schema diff.
- **Independent Auditing**: Semi-annual independent technical audits, pen testing, and vulnerability disclosures are mandatory for projects targeting operational stages.

### 🏛️ Emerging Technologies Bill (Draft)
- Sets legal boundaries, data protection guidelines, and accountability mechanisms for advanced systems (AI, Blockchain, Robotics).
- Governs AI risk categorization, model card registrations, and biometric verification workflows.
`;
      }
      // 6. AI & Strategy Details
      else if (containsGeneralAI || query.includes('strategy') || query.includes('national ai strategy') || query.includes('roadmap') || query.includes('mahama') || query.includes('authority') || query.includes('fund') || query.includes('computing centre') || query.includes('coders') || query.includes('omcp') || query.includes('bill') || query.includes('ethics') || query.includes('governance') || query.includes('pillar') || query.includes('fairness') || query.includes('transparency') || query.includes('accountability') || query.includes('explainability') || query.includes('scorecard') || query.includes('ngs') || query.includes('weight') || query.includes('seis') || query.includes('impact') || query.includes('roi') || query.includes('readiness') || query.includes('maturity') || query.includes('observatory') || query.includes('synergy') || query.includes('recommendation') || query.includes('partnership') || query.includes('university') || query.includes('ashesi') || query.includes('knust')) {
        
        // Sub-route specifically to Ethics & Scorecard if keywords match
        if (query.includes('ethics') || query.includes('governance') || query.includes('scorecard') || query.includes('ngs') || query.includes('weight') || query.includes('seis') || query.includes('readiness') || query.includes('maturity')) {
          replyText = `## ⚖️ National AI Ethics Framework, NGS Scorecard & SEIS
To evaluate AI safety and socio-economic value, GNAPRMS applies the **National AI Governance Score (NGS)** scorecard and the **Socio-Economic Impact Score (SEIS)**:

### 📊 NGS Scoring Formula & Weights
The final NGS grade is computed as a weighted average:
$$\\text{NGS} = 0.20(Fairness) + 0.25(Transparency) + 0.20(Privacy) + 0.35(Security)$$

- **Fairness & Tribal Equity (F) - 20%**: Zero discrimination by region, tribe, language, or socioeconomic class.
- **Transparency & Explainability (T&E) - 25%**: Documented model cards, dataset lineages, and non-technical explanations.
- **Privacy (P) - 20%**: Strict Act 843 adherence, anonymization, and encryption.
- **Security (S) - 35%**: Act 1038 adherence, pen testing, and threat prevention.

### 📈 Compliance Grades & Risk Bands
- **Excellent** (NGS 90-100%): Safe for national production deployment.
- **Good** (NGS 75-89%): Minor improvements required in explainability.
- **Moderate** (NGS 50-74%): Notable gaps detected. Requires mandatory review.
- **High Risk** (NGS < 50%): Suspended licenses. Immediate technical mitigations required.

---

### 📊 Socio-Economic Impact Scorecard (SEIS)
Calculated for projects in operational or completed stages across three pillars:
1. **Economic Impact (35% weight)**: Operating cost savings and Return on Investment (ROI).
2. **Social Impact (35% weight)**: Citizen accessibility (local language support), job upskilling, and regional inclusion.
3. **Innovation & Intellectual Property (30% weight)**: Local code ownership percentage and collaboration with top universities (**Ashesi University**, **KNUST**, and **University of Ghana**).
`;
        } 
        // Sub-route specifically to Observatory if keywords match
        else if (query.includes('observatory') || query.includes('synergy')) {
          replyText = `## 🌌 National AI Observatory & Synergy Engine
The **National AI Observatory** acts as a coordination hub for research and cross-agency collaborations:

### ⚙️ Main Capabilities
1. **Academic Collaboration Tracking**: Indexes publications and collaborations with top-tier Ghanaian research institutes (including KNUST, University of Ghana, and Ashesi University) to link academic innovations with public infrastructure.
2. **Synergy Recommendation Engine**: Analyzes registered project datasets and highlights collaborations. For example, if two agencies are training computer vision models (e.g., satellite farm analysis under COCOBOD and satellite illegal mining checks under EPA), the engine flags them and recommends sharing pre-trained weights and pipeline specs to save budget.
3. **Emerging Tech Monitoring**: Logs active implementations of GenAI, computer vision, and expert networks to measure sector concentrations and avoid duplication.
`;
        }
        // General AI Initiatives overview
        else {
          replyText = `## 🇬🇭 Ghana National AI Strategy (2025–2035) & Key Initiatives
The **Ghana National AI Strategy (2025–2035)** sets out a ten-year roadmap to build a responsible, human-centred AI ecosystem in Ghana.

### 🏛️ Core National Initiatives
1. **Responsible AI Authority**: An independent authority designed to monitor ethics, data collection, and governance benchmarks across public and private AI projects, informed by Singapore's National AI Office precedent.
2. **National AI Fund**: Capitalized at **GH₵5 billion** for 2025–2030 (scaling to **GH₵15 billion** for 2030–2035), drawn from royalties on mining and oil, to fund start-ups, scale innovations, and build local computational capacity.
3. **AI Computing Centre**: A **$270 million** high-performance hardware hub (including $250 million dedicated capital) providing GPU capacity for academic research and public-sector model training.
4. **One Million Coders Programme (OMCP)**: Equipped learning hubs across all 16 regions aiming to train one million citizens in AI, software coding, and cybersecurity starting in April 2026.
5. **Emerging Technologies Bill**: Draft legislation setting legal boundaries, data protection guidelines, and accountability mechanisms for advanced systems (AI, Blockchain, Robotics).
`;
        }
      }
      // 7. Aggregated Registry Stats/KPIs
      else if (query.includes('stat') || query.includes('summary') || query.includes('total') || query.includes('aggregate') || query.includes('report') || query.includes('overview') || query.includes('kpi') || query.includes('how many') || query.includes('budget') || query.includes('funding') || query.includes('cost') || query.includes('spent') || query.includes('delayed project') || query.includes('delay')) {
        const totalProjects = projects.length;
        const active = projects.filter(p => p.status === 'Active').length;
        const delayed = projects.filter(p => p.status === 'Delayed').length;
        const completed = projects.filter(p => p.status === 'Completed').length;
        const suspended = projects.filter(p => p.status === 'Suspended').length;

        const totalAllocated = projects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
        const totalDisbursed = projects.reduce((acc, p) => acc + p.budget.disbursed, 0);
        const totalUtilized = projects.reduce((acc, p) => acc + p.budget.utilized, 0);
        const totalRemaining = projects.reduce((acc, p) => acc + p.budget.remaining, 0);

        const avgReadiness = Math.round(projects.reduce((acc, p) => acc + p.readinessScore, 0) / (totalProjects || 1));

        const complianceGrades: Record<string, number> = { Excellent: 0, Good: 0, Moderate: 0, 'High Risk': 0 };
        projects.forEach(p => {
          complianceGrades[p.compliance.overallGrade] = (complianceGrades[p.compliance.overallGrade] || 0) + 1;
        });

        const delayedList = projects.filter(p => p.status === 'Delayed');
        const delayedStr = delayedList.length > 0
          ? delayedList.map(p => `- **${p.name}** (${p.projectCode}) - Stage: \`${p.stage}\`. Delayed milestone: *${p.milestones.find(m => m.status === 'Delayed')?.title || 'Verification audit'}*`).join('\n')
          : '*None. All projects are proceeding according to schedule.*';

        replyText = `## 📊 Registry M&E Aggregated KPI Summary
Here is the real-time aggregated dashboard status of the **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)**:

### ⚙️ Main Registry Status
- **Total Registered AI Projects**: **${totalProjects}**
- **Active Projects**: **${active}** | **Delayed**: **${delayed}** | **Completed**: **${completed}** | **Suspended**: **${suspended}**
- **National AI Readiness Index (NARI)**: **${avgReadiness}%**
- **Governance Compliance Rate (Excellent/Good)**: **${(((complianceGrades['Excellent'] + complianceGrades['Good']) / totalProjects) * 100).toFixed(0)}%** (${complianceGrades['Excellent'] + complianceGrades['Good']} of ${totalProjects} projects)

### 💰 Budget & Financing Summary
- **Overall Approved Budget Portfolio**: ${formatNumberToWords(totalAllocated)} GHS (GHS ${totalAllocated.toLocaleString('en-US')})
- **Overall Utilized Funds Portfolio**: ${formatNumberToWords(totalUtilized)} GHS (GHS ${totalUtilized.toLocaleString('en-US')})
- **Overall Remaining Funds Portfolio**: GHS ${(totalRemaining / 1000000).toFixed(2)}M
- **Utilization Rate**: **${((totalUtilized / (totalDisbursed || 1)) * 100).toFixed(1)}%**

> [!NOTE]
> Funding efficiency is calculated as utilized funds divided by disbursed budget (**GHS ${(totalDisbursed / 1000000).toFixed(2)}M** disbursed portfolio wide).

### 🚨 Delayed Projects & Timeline Blockers
${delayedStr}

### 🛡️ National Compliance Grade Distribution
- **Excellent Grade** (NGS 90-100%): **${complianceGrades['Excellent']}** projects
- **Good Grade** (NGS 75-89%): **${complianceGrades['Good']}** projects
- **Moderate Grade** (NGS 50-74%): **${complianceGrades['Moderate']}** projects
- **High Risk Grade** (NGS < 50%): **${complianceGrades['High Risk']}** projects
`;
      }
      // 8. Regulators Table
      else if (query.includes('table') || query.includes('regulator') || query.includes('regulon') || query.includes('partnership')) {
        replyText = `## 📊 Ghana AI Projects & Key Regulators
Here is a summary of registered projects and their oversight bodies under the **Responsible AI Authority**:

| Category | No. of Projects | Key Regulator |
|---|---|---|
| **Government Strategy & Policy** | 6 | Ministry of Communication, Digital Technology & Innovation (MoCD) / Responsible AI Authority |
| **Healthcare AI** | 3 | Ministry of Health (MoH) / WHO-UNDP |
| **Agriculture AI** | 1 | Ministry of Food & Agriculture (MoFA) |
| **Fintech & Financial AI** | 3 | Bank of Ghana (BoG) / NCA |
| **Regulatory/Compliance AI** | 1 | NCA / Regulon |
| **Language & NLP AI** | 1 | Ghana NLP / MoCD |
| **Education AI** | 3 | GES / UNICEF |
| **Data & Analytics** | 3 | Data Protection Commission (DPC) |
| **International Partnerships** | 4 | Multiple Ministries / International Partners |

> **Regulatory Note:** Key oversight bodies include the **National Communications Authority (NCA)**, the **Data Protection Commission (DPC)**, and the forthcoming **Responsible AI Authority**. The **Emerging Technologies Bill** will serve as the primary legal framework for data use and accountability.
`;
      }
      // 9. Guides & Workflows
      else if (query.includes('how to') || query.includes('how do i') || query.includes('guide') || query.includes('workflow') || query.includes('register') || query.includes('audit') || query.includes('mitigate') || query.includes('upload') || query.includes('sign') || query.includes('ocr')) {
        replyText = `## 📖 GNAPRMS Step-by-Step Operator Guide
Here is how to perform core actions inside the Single Page Application:

### 1. Register a New AI Project
1. Navigate to the **Project Registry** from the sidebar.
2. Click **"Register New AI Project"** to open the creation card.
3. Complete the form details (Name, Sector, expected completion, and GIS Coordinates e.g., Accra: \`5.6037, -0.1870\`).
4. Enter budget allocations and click **"Submit Project for Review"**. The project starts in the **Concept** stage.

### 2. Update Project Milestones
1. Select your project from the browser sidebar in **Project Registry**.
2. Scroll to the **Milestones** container.
3. Adjust the progress slider (0% to 100%) on active milestones. Save to log progress.

### 3. Conduct an Ethical Audit (M&E / Auditor)
1. Go to the **Governance & Compliance** panel.
2. Select your targeted project from the dropdown.
3. Audit details across the 5 checkboxes (Fairness, Accountability, Transparency, Privacy, Security).
4. The system calculates the National Governance Score (NGS) and applies a compliance grade dynamically. Save the report.

### 4. Mitigate a Risk Threat
1. Go to the **Risk Management** matrix from the sidebar.
2. Inspect the 5x5 matrix mapping Likelihood vs Impact.
3. Click any plot marker to view the description and mitigation strategy.
4. Update the threat status dropdown from "Open" to "Mitigated" or "Escalated" to instantly update risk charts.

### 5. Document Upload, OCR Search & Signing
1. Navigate to the **Document Manager** panel.
2. Drag and drop a project PDF. The system stores it in the sovereign MinIO mock vault.
3. The Tesseract OCR engine index automatically parses text. Type terms in the **OCR Search bar** to find matching documents.
4. Click **"Sign Document"** to append your digital signature and role parameters to the PDF's version tree.
`;
      }
      // 10. Fallback Project Match (if no general topic is matched)
      else if (matchedProject) {
        const p = matchedProject;
        const budgetDisbursed = (p.budget.disbursed / 1000000).toFixed(2);
        const budgetRemaining = (p.budget.remaining / 1000000).toFixed(2);
        const utilRate = ((p.budget.utilized / (p.budget.disbursed || 1)) * 100).toFixed(1);

        const milestonesStr = p.milestones.length > 0
          ? p.milestones.map(m => `- **${m.title}**: ${m.progressPercent}% progress (${m.status}) - Due: \`${m.dueDate}\``).join('\n')
          : '*No milestones logged for this project.*';

        const risksStr = p.risks.length > 0
          ? p.risks.map(r => `- [${r.severity}] **${r.category}**: ${r.description} (Status: \`${r.status}\`) \n  *Mitigation*: ${r.mitigationPlan}`).join('\n')
          : '*No active risks logged for this project.*';

        const docsStr = p.documents.length > 0
          ? p.documents.map(d => `- **${d.fileName}** (v${d.version}, uploaded \`${d.uploadedAt}\`) - Signed: ${d.signedBy.join(', ') || 'Unsigned'}`).join('\n')
          : '*No documents uploaded yet.*';

        replyText = `## Project Details: ${p.name}
### Code: \`${p.projectCode}\` | Status: \`${p.status}\` | Stage: \`${p.stage}\`

**Description**: ${p.description}

### 📋 Registry Metadata
| Attribute | Details |
|---|---|
| **MDA Owner** | ${p.mda} (${p.mdaCode}) |
| **Sector / Category** | ${p.sector} / ${p.category} |
| **GIS Location** | ${p.region} Region, ${p.district} District |
| **Coordinates** | \`Lat: ${p.latitude}, Long: ${p.longitude}\` |
| **Timeline** | ${p.startDate} to ${p.expectedCompletionDate} |
| **NARI Score** | **${p.readinessScore}%** |

### 💰 Financing Details
- **Total Allocated**: ${formatNumberToWords(p.budget.totalAllocated)} GHS (GHS ${p.budget.totalAllocated.toLocaleString('en-US')})
- **Disbursed**: GHS ${budgetDisbursed}M
- **Utilized**: ${formatNumberToWords(p.budget.utilized)} GHS (GHS ${p.budget.utilized.toLocaleString('en-US')}) (Utilization Rate: **${utilRate}%**)
- **Remaining**: GHS ${budgetRemaining}M
- **Funding Source**: ${p.budget.primaryFundingSource} (${p.budget.currency})

### ⚖️ Ethical Scorecard (NGS Breakdown)
| Governance Pillar | Score | Weight | Weighted Score |
|---|---|---|---|
| **Fairness & Tribal Equity** | ${p.compliance.fairness}% | 20% | ${(p.compliance.fairness * 0.2).toFixed(1)}% |
| **Transparency & Explainability** | ${p.compliance.transparency}% | 25% | ${(p.compliance.transparency * 0.25).toFixed(1)}% |
| **Privacy (Act 843)** | ${p.compliance.privacy}% | 20% | ${(p.compliance.privacy * 0.2).toFixed(1)}% |
| **Security (Act 1038)** | ${p.compliance.security}% | 35% | ${(p.compliance.security * 0.35).toFixed(1)}% |
| **OVERALL GRADE** | **${p.compliance.overallGrade}** | **100%** | **${((p.compliance.fairness * 0.2) + (p.compliance.transparency * 0.25) + (p.compliance.privacy * 0.2) + (p.compliance.security * 0.35)).toFixed(0)}%** |

### 🚀 Implementation Milestones
${milestonesStr}

### ⚠️ Active Threats & Mitigation Plan
${risksStr}

### 🗄️ Uploaded Documents & Electronic Signs
${docsStr}
`;
      }
      // 11. Default instructions fallback
      else {
        replyText = `## 🇬🇭 GNAPRMS AI Governance & Policy Assistant
Welcome! I am the National AI Governance Assistant. I can help you answer questions about the GNAPRMS platform, its registered projects, legislative requirements, technical architecture, and user workflows.

### ❓ What you can ask me:
1. **The System**: Ask "what is this system?" or "what are the key features of the platform?"
2. **AI & Strategy**: Ask "explain the National AI Strategy" or "what are the AI initiatives in Ghana?"
3. **IT & Architecture**: Ask "describe the microservices system architecture" or "what databases are used?"
4. **Security & Roles**: Ask "how is data secured?" or "what are the user roles and RBAC/ABAC rules?"
5. **Legislative Acts**: Ask "what is the Data Protection Act (Act 843)?" or "how does Cybersecurity Act (Act 1038) apply?"
6. **Registered Projects**: Ask about a specific project, e.g. "tell me about the LEAP registry" or "explain the Akosombo Hydrology system status".
7. **System Statistics**: Ask "what is the total budget allocated?" or "show a summary of active projects".
`;
      }

      const assistantMessage: Message = { sender: 'assistant', text: replyText };
      setMessages(prev => [...prev, assistantMessage]);
    }, 800);

  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Governance Chat Assistant</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Ask questions about National AI Policies, compliance scores, and registry projects
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Chat dialogue window */}
        <div className="glass-card chat-window" style={{ minHeight: '500px' }}>
          {/* Chat bubbles list */}
          <div className="chat-messages">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`chat-bubble ${m.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
                style={m.sender === 'user' ? { whiteSpace: 'pre-line' } : undefined}
              >
                {m.sender === 'user' ? m.text : renderMarkdown(m.text)}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Typing area */}
          <div className="chat-input-area">
            <input
              type="text"
              placeholder="Query acts or project codes..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              className="form-input"
              style={{ flex: 1, borderRadius: '8px' }}
            />
            <button 
              onClick={() => handleSend(inputValue)}
              className="btn btn-primary"
              style={{ padding: '0 20px', borderRadius: '8px', height: '42px' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: suggested helper queries list */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareCode className="w-5 h-5 text-emerald-400" />
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>helper questions</h3>
          </div>
          
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
            Click on any baseline helper query to immediately run policy and status checks.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.015)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  lineHeight: 1.4
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)';
                  e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
