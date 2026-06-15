import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquareCode } from 'lucide-react';
import { AIProject } from '../data/sampleProjects';

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
    "What is the total registry budget and active project count?",
    "Show details for project GN-AI-2026-002 (Akosombo)",
    "Explain Ghana Data Protection Act 2012 (Act 843) rules",
    "How does the system enforce Cybersecurity Act 2020 (Act 1038)?",
    "Describe the microservices system architecture & databases",
    "How do M&E Officers perform an ethical compliance audit?",
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

      // Check categories
      if (matchedProject) {
        const p = matchedProject;
        const budgetTotal = (p.budget.totalAllocated / 1000000).toFixed(2);
        const budgetDisbursed = (p.budget.disbursed / 1000000).toFixed(2);
        const budgetUtilized = (p.budget.utilized / 1000000).toFixed(2);
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

### 💰 Financing Details (GHS Millions)
- **Total Allocated**: GHS ${budgetTotal}M
- **Disbursed**: GHS ${budgetDisbursed}M
- **Utilized**: GHS ${budgetUtilized}M (Utilization Rate: **${utilRate}%**)
- **Remaining**: GHS ${budgetRemaining}M
- **Funding Source**: ${p.budget.primaryFundingSource} (${p.budget.currency})

### ⚖️ Ethical Scorecard (NGS Breakdown)
| Governance Pillar | Score | Weight | Weighted Score |
|---|---|---|---|
| **Fairness** | ${p.compliance.fairness}% | 20% | ${(p.compliance.fairness * 0.2).toFixed(1)}% |
| **Accountability** | ${p.compliance.accountability}% | 15% | ${(p.compliance.accountability * 0.15).toFixed(1)}% |
| **Transparency** | ${p.compliance.transparency}% | 15% | ${(p.compliance.transparency * 0.15).toFixed(1)}% |
| **Explainability** | ${p.compliance.privacy}% | 10% | ${(p.compliance.privacy * 0.1).toFixed(1)}% |
| **Privacy (Act 843)** | ${p.compliance.privacy}% | 20% | ${(p.compliance.privacy * 0.2).toFixed(1)}% |
| **Security (Act 1038)** | ${p.compliance.security}% | 20% | ${(p.compliance.security * 0.2).toFixed(1)}% |
| **OVERALL GRADE** | **${p.compliance.overallGrade}** | **100%** | **${p.readinessScore}%** |

### 🚀 Implementation Milestones
${milestonesStr}

### ⚠️ Active Threats & Mitigation Plan
${risksStr}

### 🗄️ Uploaded Documents & Electronic Signs
${docsStr}
`;
      }
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

### 💰 Budget & Financing Summary (GHS Millions)
| Financial Indicator | Approved Amount (GHS) | Utilized Amount (GHS) | Remaining (GHS) | Utilization Rate |
|---|---|---|---|---|
| **Overall Registry Portfolio** | GHS ${(totalAllocated / 1000000).toFixed(2)}M | GHS ${(totalUtilized / 1000000).toFixed(2)}M | GHS ${(totalRemaining / 1000000).toFixed(2)}M | **${((totalUtilized / (totalDisbursed || 1)) * 100).toFixed(1)}%** |

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
      else if (query.includes('act 843') || query.includes('privacy') || query.includes('data protection') || query.includes('data commission')) {
        replyText = `## 🛡️ Data Protection Act, 2012 (Act 843) Requirements
The **Ghana Data Protection Act, 2012 (Act 843)** establishes the legal limits for collecting, hosting, and processing citizen records. All AI systems registered in GNAPRMS must meet the following:

### 🔑 Critical System Requirements
1. **Appoint a Certified Data Protection Officer (DPO)**: MDA project managers must designate a registered DPO responsible for logging reviews.
2. **Enforce Data Minimization**: Systems must collect only technical and essential contact parameters; no unnecessary citizen personally identifiable information (PII) may be collected.
3. **Sovereign Hosting Restriction**: In compliance with Act 843, all production databases and object stores hosting citizen records must be physically hosted on servers located inside Ghana's national borders to prevent unauthorized overseas processing.
4. **Consent Logs**: Digital consent workflows and signature audits must be recorded inside the document registry.
5. **PII Anonymization & Hashing**: Citizen records must be anonymized before ingestion, utilizing robust hashing protocols (such as SHA-256) and transparent database volume encryption (AES-256).
`;
      }
      else if (query.includes('act 1038') || query.includes('cybersecurity') || query.includes('cyber') || query.includes('security') || query.includes('cert') || query.includes('cii')) {
        replyText = `## 🔒 Cybersecurity Act, 2020 (Act 1038) Requirements
The **Cybersecurity Act, 2020 (Act 1038)** regulates secure infrastructure and cyber-defense readiness in Ghana. Under this Act, GNAPRMS registers AI projects and enforces the following security standards:

### 🔑 Key Compliance Controls
1. **Critical National Information Infrastructure (CII)**: Essential national AI installations (like Akosombo Dam Smart Gates or GNAPRMS itself) are classified as CII. This requires strict network isolation and physical air-gaps.
2. **Immutable Audit Trail**: In accordance with Act 1038, all database edits trigger database-level triggers that append immutable logs to MongoDB. These capture the timestamp, operator, IP address, and schema diff, and cannot be deleted or modified, even by the Super Administrator.
3. **National CERT-GH Integration**: The system mandates direct alert linkages between local operational hubs and the National Computer Emergency Response Team (CERT-GH) during critical system threats.
4. **Independent Auditing**: Semi-annual independent technical audits, pen testing, and vulnerability disclosures are mandatory for projects targeting operational stages.
`;
      }
      else if (query.includes('ethics') || query.includes('governance') || query.includes('pillar') || query.includes('fairness') || query.includes('transparency') || query.includes('accountability') || query.includes('explainability') || query.includes('scorecard') || query.includes('ngs') || query.includes('weight') || query.includes('seis') || query.includes('impact') || query.includes('roi')) {
        replyText = `## ⚖️ National AI Ethics Framework, NGS Scorecard & SEIS
To evaluate AI safety and socio-economic value, GNAPRMS applies the **National AI Governance Score (NGS)** scorecard and the **Socio-Economic Impact Score (SEIS)**:

### 📊 NGS Scoring Formula & Weights
The final NGS grade is computed as a weighted average:
$$\\text{NGS} = 0.20(Fairness) + 0.15(Accountability) + 0.15(Transparency) + 0.10(Explainability) + 0.20(Privacy) + 0.20(Security)$$

| Pillar | Weight | Description |
|---|---|---|
| **Fairness (F)** | **20%** | Zero discrimination by region, tribe, language, or socioeconomic class. |
| **Accountability (A)** | **15%** | Appointed human operator and legal responsibility paths. |
| **Transparency (T)** | **15%** | Documented model cards, dataset lineages, and code visibility. |
| **Explainability (E)** | **10%** | Non-technical explanations for model decisions (no "black box" in health or justice). |
| **Privacy (P)** | **20%** | Strict Act 843 adherence, anonymization, and encryption. |
| **Security (S)** | **20%** | Act 1038 adherence, pen testing, and CERT coordination. |

### 📈 Compliance Grades & Risk Bands
- **Excellent** (NGS 90-100%): Safe for national production deployment.
- **Good** (NGS 75-89%): Minor improvements required in explainability.
- **Moderate** (NGS 50-74%): Notable gaps detected. Requires mandatory review.
- **High Risk** (NGS < 50%): Suspended licenses. Immediate technical mitigations required.

---

### 📊 Socio-Economic Impact Scorecard (SEIS)
Calculated for projects in operational or completed stages across three pillars:
1. **Economic Impact (35% weight)**:
   - **Cost Savings Indicator (CSI)**: Percentage decrease in operating expenses.
   - **Efficiency Gains**: Reduction in average processing time.
   - **Return on Investment (ROI)**:
     $$\\text{ROI} = \\frac{\\text{Net Financial Value Generated} - \\text{Total Disbursed Budget}}{\\text{Total Disbursed Budget}} \\times 100$$
2. **Social Impact (35% weight)**:
   - **Citizen Accessibility**: Supports local languages (Twi, Ga, Ewe) or offers offline caches.
   - **Job Upskilling**: Count of local IT specialists and operators trained.
   - **Regional Inclusion**: Deployment to rural assemblies (MMDAs).
3. **Innovation & Intellectual Property (30% weight)**:
   - **Local Code Ownership**: Percentage of algorithms trained or customized in Ghana vs. licensed from abroad.
   - **Academic Integration**: Collaborations, internships, and research papers with **Ashesi University**, **KNUST**, and **University of Ghana**.
`;
      }
      else if (query.includes('architecture') || query.includes('microservice') || query.includes('nest') || query.includes('asp.net') || query.includes('gateway') || query.includes('kong') || query.includes('rabbitmq') || query.includes('database') || query.includes('postgres') || query.includes('sql') || query.includes('mongo') || query.includes('redis') || query.includes('elasticsearch') || query.includes('s3') || query.includes('minio') || query.includes('hybrid') || query.includes('erd') || query.includes('index') || query.includes('table') || query.includes('collection') || query.includes('schema')) {
        replyText = `## ⚙️ GNAPRMS Enterprise System Architecture & Databases
The platform is designed with a state-of-the-art **Microservices Topology** and a **Hybrid Database Strategy**:

### 🌐 Microservice Topology
1. **Kong API Gateway**: Single entry point handling rate limiting, SSL termination (TLS 1.3), and path routing.
2. **Auth Service (NestJS)**: Manages authentication, SSO OIDC integration, and session blacklists.
3. **Registry Service (NestJS)**: Transactional REST/GraphQL APIs for project lifecycle registries.
4. **Governance Service (ASP.NET Core)**: Implements C# engines for calculating compliance scorecards.
5. **AI Analytics Service (Python/FastAPI)**: Conducts Scikit-learn predictive modeling for project success, budget overrun margins, and delay estimates.
6. **RabbitMQ Event Bus**: Facilitates asynchronous, event-driven integrations (e.g. triggering notifications, background OCR indexing).

### 🗄️ Hybrid Database Stack & Table Schemas
- **PostgreSQL (Transactional Store)**: Handles relational integrity across:
  - \`MDAs\`: uuid primary key, ministry name, department code, sector, headquarters.
  - \`USERS\`: uuid primary key, name, email, password_hash, role, mda_id foreign key, mfa.
  - \`PROJECTS\`: uuid primary key, code, name, category, stage, status, GIS lat/long coordinates.
  - \`MILESTONES\`: uuid primary key, project_id, title, progress_percent, status.
  - \`BUDGETS\`: uuid primary key, project_id, total_allocated, disbursed, utilized, remaining.
  - \`COMPLIANCE_ASSESSMENTS\`: fairness, transparency, accountability, privacy, security scores.
  - \`RISKS\`: project_id, category, severity, description, status.
  - \`AUDIT_LOGS\`: user_id, action, details, timestamp.
- **MongoDB (Document Store)**: Handles fast-changing unstructured records:
  - \`documents_metadata\` collection: holds S3 paths, file sizes, OCR-extracted texts, digital signature histories.
  - \`readiness_evaluations\` collection: holds readiness maturity sliders history and recommendations.
- **Redis (Token Cache)**: Stores JWT session keys and revoked token blocklists.
- **Elasticsearch**: Indexes OCR text extracted via Tesseract from project contract PDFs.
- **MinIO**: Sovereign S3 object storage vault.

### ⚡ Query Optimization & Indexing Strategies
- **PostgreSQL**:
  1. Partial index on status: \`CREATE INDEX idx_active_projects ON projects (status) WHERE status = 'Active';\` (speeds up map load).
  2. Compound index: \`CREATE INDEX idx_project_compliance ON compliance_assessments (project_id, grade);\`.
  3. Budget join index: \`CREATE INDEX idx_project_budget ON budgets (project_id) INCLUDE (total_allocated, disbursed, utilized);\`.
- **MongoDB**:
  1. Full-text search index: \`db.documents_metadata.createIndex({ ocr_text: "text" });\`.
  2. Compound index: \`db.readiness_evaluations.createIndex({ mda_id: 1, submittedAt: -1 });\`.
`;
      }
      else if (query.includes('devops') || query.includes('docker') || query.includes('kubernetes') || query.includes('k8s') || query.includes('ci/cd') || query.includes('prometheus') || query.includes('hpa') || query.includes('scaling') || query.includes('pgbouncer') || query.includes('canary') || query.includes('port') || query.includes('compose') || query.includes('metrics')) {
        replyText = `## 🚀 DevOps, Deployment & Scalability Plan
GNAPRMS is built for national-scale production workloads, operating on sovereign cloud infrastructure:

### 🐳 Docker Compose Services Stack (\`docker-compose.yml\`)
- **postgres**: image \`postgres:15-alpine\` on Port \`5432\` (database: \`gnaprms_registry\`).
- **mongodb**: image \`mongo:6.0\` on Port \`27017\`.
- **minio**: S3 storage on Port \`9000\` (API) and Port \`9001\` (console admin).
- **redis**: image \`redis:7-alpine\` on Port \`6379\`.
- **kong**: gateway image \`kong:3.3\` on Ports \`8000\` (proxy) and \`8443\` (SSL).

### ⚙️ Kubernetes (K8s) Orchestration
- **Cluster Topology**: 3 master nodes and minimum 4 worker nodes spanning separate availability zones.
- **Namespaces**:
  - \`gnaprms-core\`: Registry, Auth, and Frontend UI.
  - \`gnaprms-data\`: PostgreSQL StatefulSet, MongoDB cluster, Redis.
  - \`gnaprms-sec\`: Kong Gateway, Vault secrets manager.
- **Auto-Scaling (HPA)**: Pods scale dynamically when:
  \`Metric: CPU Utilization > 75% OR Memory Utilization > 80%\`
- **Availability**: \`PodDisruptionBudget\` guarantees a minimum of 2 active replicas per service (99.99% uptime).

### 🛠️ CI/CD Pipeline & Deploy Strategy
- **SAST Scanning**: Pre-merge code runs through static scanners (e.g. SonarQube) to block SQL injections or hardcoded keys.
- **Snyk Scanning**: Scans container images for dependency vulnerability hazards.
- **Canary Release Strategy**: gateway directs **5%** of requests to new releases, scaling up to 100% over a 4-hour window if errors remain below **0.01%**.

### 📊 System Observability & Alerting
- **Prometheus**: Scrapes numerical performance indicators from endpoints (\`/metrics\`).
- **Grafana**: Visualizes CPU/RAM limits, latency, DB connections, and queue lengths.
- **FluentBit & Elasticsearch**: Daemon-sets parse stdout logs from pods and index them in Elasticsearch for Kibana dashboard searches.
- **Alerting Rules**: Slack and SMS alerts notify stand-by DevOps staff when memory exceeds 95% or DB replicas fail.
`;
      }
      else if (query.includes('role') || query.includes('permission') || query.includes('auth') || query.includes('rbac') || query.includes('abac') || query.includes('access') || query.includes('user') || query.includes('switcher')) {
        replyText = `## 🔑 Access Control: RBAC & ABAC Architecture
The registry protects data integrity and ministerial boundaries through a hybrid authorization model:

### 👤 Role-Based Access Control (RBAC)
- **Super Administrator**: Configure system, manage staff accounts, override compliance status, and inspect system audit logs.
- **National AI Authority**: Global read access to review national AI pipelines, analyze budgets, and evaluate M&E trends.
- **Government Administrator**: Sector-wide oversight (e.g., MoCD, MoH). Pulls agency reports and approves registry sub-entries.
- **Institution Administrator**: Local agency management. Registers new AI projects and manages local milestones.
- **Project Manager**: Manages specific assigned projects, adjusts milestone progress, logs risks, and uploads agreements.
- **M&E Officer**: Regional inspector. Updates compliance scoring, logs GIS verification points, and uploads site evidence.
- **Auditor**: Global read-only auditor for projects, budgets, and compliance registers.
- **Public User**: Read-only access to GIS maps, public dashboard metrics, and approved open-data exports.

### 🛡️ Attribute-Based Access Control (ABAC) Rules
- **Ministerial Isolation**: Users of 'MoH' can only read or edit projects where \`project.mda_owner == 'MoH'\`. Accessing other ministries (e.g. 'MoFA') is blocked.
- **Regional Isolation**: M&E officers can only log inspections if their assigned region matches the project region.
- **Classification Separation**: Draft, conceptual, or security-sensitive projects are hidden from public views unless \`is_public_approved == true\`.
`;
      }
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
      else if (query.includes('observatory') || query.includes('synergy') || query.includes('recommendation') || query.includes('partnership') || query.includes('university') || query.includes('ashesi') || query.includes('knust')) {
        replyText = `## 🌌 National AI Observatory & Synergy Engine
The **National AI Observatory** acts as a coordination hub for research and cross-agency collaborations:

### ⚙️ Main Capabilities
1. **Academic Collaboration Tracking**: Indexes publications and collaborations with top-tier Ghanaian research institutes (including KNUST, University of Ghana, and Ashesi University) to link academic innovations with public infrastructure.
2. **Synergy Recommendation Engine**: Analyzes registered project datasets and highlights collaborations. For example, if two agencies are training computer vision models (e.g., satellite farm analysis under COCOBOD and satellite illegal mining checks under EPA), the engine flags them and recommends sharing pre-trained weights and pipeline specs to save budget.
3. **Emerging Tech Monitoring**: Logs active implementations of GenAI, computer vision, and expert networks to measure sector concentrations and avoid duplication.
`;
      }
      else {
        replyText = `## 🇬🇭 GNAPRMS AI Governance & Policy Assistant
Welcome! I am the National AI Governance Assistant. I can help you answer questions about the GNAPRMS platform, its registered projects, legislative requirements, technical architecture, and user workflows.

### ❓ What you can ask me:
1. **Registered Projects**: Ask about a project directly, e.g. "tell me about COCOBOD pest predictor" or "explain the Akosombo Hydrology system status".
2. **System Statistics**: Ask "what is the total budget allocated?" or "show a summary of active projects".
3. **Legislation**: Inquire about data privacy regulations: "what are the rules under Act 843?" or "how does Act 1038 apply to critical AI systems?".
4. **Ethics Pillars**: Ask "what are the six ethical pillars?" or "how is the National Governance Score (NGS) calculated?".
5. **System Architecture**: Ask "describe the microservices architecture" or "what databases are used in the backend?".
6. **Access Control**: Ask "describe user roles and RBAC/ABAC rules".
7. **Operator Guides**: Ask "how do I audit compliance?" or "how do I register a new project?".
8. **Observatory**: Ask "what is the National AI Observatory?" or "how does the synergy engine work?".
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
