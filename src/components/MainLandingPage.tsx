import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  LayoutDashboard, 
  FilePlus2, 
  FileCheck, 
  Map, 
  Award, 
  AlertOctagon, 
  Files, 
  MessageSquareCode, 
  History, 
  ChevronDown,
  Layers,
  Activity,
  Check,
  Search,
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';
import { UserRole, RoleSwitcher } from './RoleSwitcher';
import { PageLogEntry } from '../types/pageLog';
import { AIProject, Organization } from '../data/sampleProjects';

interface MainLandingPageProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onNavigateToModule: (moduleId: string, moduleName: string, path: string) => void;
  pageLogs: PageLogEntry[];
  onOpenAuditLog: () => void;
  projects?: AIProject[];
  organizations?: Organization[];
}

export const MainLandingPage: React.FC<MainLandingPageProps> = ({
  currentRole,
  onRoleChange,
  onNavigateToModule,
  pageLogs,
  onOpenAuditLog,
  projects = [],
  organizations = []
}) => {
  // State for expanded "Explain More" details
  const [expandedStageId, setExpandedStageId] = useState<number | null>(null);
  const [expandedTierId, setExpandedTierId] = useState<string | null>(null);
  const [modalStage, setModalStage] = useState<any | null>(null);
  const [modalTier, setModalTier] = useState<any | null>(null);

  // Dynamic system metrics
  const totalProjects = projects.length || 10;
  const clearedProjects = projects.filter(p => p.clearanceStatus === 'Cleared').length || 6;
  const totalOrgs = organizations.length || 6;
  const clearedOrgs = organizations.filter(o => o.clearanceStatus === 'Cleared').length || 4;
  const highRiskProjects = projects.filter(p => p.riskTier === 'High Risk' || p.riskTier === 'Prohibited').length || 3;

  // ---------------------------------------------------------------------------
  // 7 STATUTORY AI CLEARANCE WORKFLOW STAGES (Fully expanded with "Explain More")
  // ---------------------------------------------------------------------------
  const stagesList = [
    {
      id: 1,
      badge: '01',
      title: 'Stage 1: Institutional Accreditation & Gatekeeper Registration',
      subtitle: 'Mandatory prerequisite for all public (MDAs/SOEs) and private technology vendors.',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeText: '#6ee7b7',
      sla: '5 Business Days',
      summary: 'Implementing MDAs and private tech enterprises register institutional charters, governance structures, and upload minimum 3 to 5 verified PDF clearance documents.',
      objective: 'Establish corporate legitimacy, compliance accountability, and legal liability under NITA Act 771 and Data Protection Act 843 before any AI systems are registered.',
      deliverables: [
        'Institutional AI Governance Charter & Board Directive',
        'Certified Data Protection Officer (DPO) Appointment Notice',
        'Minimum 3 to 5 verified PDF clearance documents (Tax Clearance, Incorporation, Ethics Policy)',
        'Institutional Risk Management & Whistleblower Charter'
      ],
      authority: 'NITA Compliance Directorate & Statutory Intake Secretariat',
      legalBasis: 'National Information Technology Agency Act, 2008 (Act 771) § 3 & Data Protection Act 2012 (Act 843) § 27',
      gatekeeperEffect: 'Unaccredited entities have all downstream AI systems quarantined from public registers and geospatial maps.',
      exitCriteria: 'Issuance of Sovereign Organization Accreditation Certificate with Unique Accreditation ID (e.g. GH-NAPTCS-ORG-2026-NITA).'
    },
    {
      id: 2,
      badge: '02',
      title: 'Stage 2: Terms of Reference (ToR) & Business Case Scrutiny',
      subtitle: 'Technical feasibility, public value justification, and procurement alignment.',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#fcd34d',
      sla: '7 Business Days',
      summary: 'Detailed evaluation of AI problem justification, procurement terms, data sourcing, options analysis, and preliminary budget allocation.',
      objective: 'Prevent redundant public expenditure, avoid vendor lock-in, verify technical necessity, and align with the Ghana National Enterprise Architecture (GGEA).',
      deliverables: [
        'Comprehensive Terms of Reference (ToR) with functional requirements',
        'Structured Business Case & Options Analysis (Buy vs Build vs Open Source)',
        'Budgetary allocation breakdown & funding source verification (GHS)',
        'Data source lineage and initial training corpus inventory'
      ],
      authority: 'Ministry of Communications and Digitalisation (MoCD) & NITA Technical Evaluation Taskforce',
      legalBasis: 'Public Financial Management Act, 2016 (Act 921) & eGIF Standards Framework',
      gatekeeperEffect: 'Projects lacking clear public value or technical justification are returned for scope revision.',
      exitCriteria: 'Formal ToR Technical Endorsement Memo authorizing proceed-to-audit status.'
    },
    {
      id: 3,
      badge: '03',
      title: 'Stage 3: Data Sovereignty & Act 843 Privacy Impact Audit',
      subtitle: 'Mandatory verification of data protection safeguards and sovereign residency.',
      badgeColor: '#3b82f6',
      badgeBg: 'rgba(59, 130, 246, 0.15)',
      badgeText: '#93c5fd',
      sla: '10 Business Days',
      summary: 'Data Protection Commission (DPC) compliance audit, DPIA verification, consent frameworks, and cross-border safeguards.',
      objective: 'Guarantee that all citizen personally identifiable information (PII) used in model training and inference adheres strictly to Ghana Data Protection Act 843.',
      deliverables: [
        'Formal Data Protection Impact Assessment (DPIA) filed with DPC',
        'Data flow diagrams verifying sovereign data residency within Ghana borders',
        'Cross-border data transfer safeguards under Act 843 Section 45',
        'Citizen consent mechanisms and Right to Explanation protocols'
      ],
      authority: 'Data Protection Commission (DPC) & Sovereign Data Governance Directorate',
      legalBasis: 'Ghana Data Protection Act, 2012 (Act 843) § 17-21, § 45 (Cross-Border Transfer Restrictions)',
      gatekeeperEffect: 'Violations of cross-border data residency trigger immediate statutory suspension and referral to DPC enforcement.',
      exitCriteria: 'DPC Statutory DPIA Clearance Certificate authorizing data processing for model training.'
    },
    {
      id: 4,
      badge: '04',
      title: 'Stage 4: Technical & Algorithmic Review (TCC Review)',
      subtitle: 'Multi-disciplinary algorithmic audit, demographic fairness, and cybersecurity testing.',
      badgeColor: '#ec4899',
      badgeBg: 'rgba(236, 72, 153, 0.15)',
      badgeText: '#f472b6',
      sla: '14 Business Days',
      summary: 'Technical Review Committee (TCC) audit of neural architecture, demographic fairness, vulnerability penetration testing (VAPT), and explainability.',
      objective: 'Eliminate algorithmic bias across gender/ethnicity/geography, ensure adversarial robustness, and verify that machine learning models perform reliably.',
      deliverables: [
        'Vulnerability Assessment & Penetration Testing (VAPT) audit report',
        'Model Card and Dataset Lineage Documentation (ISO/IEC 42001)',
        'Demographic Fairness & Parity Scorecard (Fairness Index > 85%)',
        'Model explainability metrics (SHAP/LIME feature importances for adverse decisions)'
      ],
      authority: 'Technical Clearance Committee (TCC) Multi-Disciplinary Panel (NITA, Academia, DPC)',
      legalBasis: 'Cybersecurity Act, 2020 (Act 1038) & Ghana National AI Ethical Framework',
      gatekeeperEffect: 'Models with severe demographic bias or unpatched critical vulnerabilities receive conditional/rejected status.',
      exitCriteria: 'TCC Final Technical Audit Dossier with Adjudication Grade (Cleared / Conditional).'
    },
    {
      id: 5,
      badge: '05',
      title: 'Stage 5: Statutory Clearance Approval & TCC Certificate Issuance',
      subtitle: 'Executive authorization by Director-General of NITA with cryptographic QR seal.',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeText: '#6ee7b7',
      sla: '3 Business Days',
      summary: 'The Director-General of NITA reviews TCC committee recommendations and issues the official Sovereign Technical Clearance Certificate (TCC).',
      objective: 'Provide statutory executive certification authorizing public procurement, operational deployment, and interconnectivity with GovNet.',
      deliverables: [
        'Executive Directive signed by Director-General of NITA',
        'Statutory Technical Clearance Certificate (TCC) with SHA-256 seal',
        'Cryptographic Public Verification QR Code linked to central portal',
        'Gazetted listing in the Ghana National AI Projects Registry'
      ],
      authority: 'Director-General, National Information Technology Agency (NITA)',
      legalBasis: 'Electronic Transactions Act, 2008 (Act 772) § 35 & NITA Act 2008 (Act 771)',
      gatekeeperEffect: 'No public funds may be disbursed without a valid statutory Technical Clearance Certificate.',
      exitCriteria: 'TCC Certificate ID issued (e.g. NAPTCS-CLR-2026-001) and public registry publication.'
    },
    {
      id: 6,
      badge: '06',
      title: 'Stage 6: User Acceptance Testing (UAT) & Non-Functional Verification',
      subtitle: 'Staging environment implementation oversight, failover testing, and CoC issuance.',
      badgeColor: '#8b5cf6',
      badgeBg: 'rgba(139, 92, 246, 0.15)',
      badgeText: '#c4b5fd',
      sla: '10 Business Days',
      summary: 'NITA oversees implementation fidelity in government staging environments, conducts stress tests, and issues the preliminary Certificate of Conformity.',
      objective: 'Confirm that production deployment matches the approved architecture and that failover, backup, and latency SLAs perform under load.',
      deliverables: [
        'User Acceptance Testing (UAT) Multi-Party Sign-Off Protocol',
        'Stress and load test reports under peak public usage conditions',
        'Incident response playbook and model rollback protocols',
        'Preliminary Certificate of Conformity (CoC) before production go-live'
      ],
      authority: 'Joint NITA Technical Quality Assurance Unit & Deploying Ministry Implementation Team',
      legalBasis: 'Ghana Standards Authority (GSA) Digital Services Standards & eGIF Interoperability',
      gatekeeperEffect: 'System cannot be transferred from staging to live public IP networks until UAT sign-off is completed.',
      exitCriteria: 'Certificate of Conformity (CoC) authorizing live production DNS and gateway routing.'
    },
    {
      id: 7,
      badge: '07',
      title: 'Stage 7: Sovereign GIS Mapping, Continuous Drift & M&E Oversight',
      subtitle: 'Continuous nationwide post-market surveillance across Ghana’s 16 administrative regions.',
      badgeColor: '#06b6d4',
      badgeBg: 'rgba(6, 182, 212, 0.15)',
      badgeText: '#67e8f9',
      sla: 'Continuous Lifecycle',
      summary: 'Central registry publication, live geospatial mapping across Ghana’s 16 regions, real-time drift telemetry, and annual re-certification.',
      objective: 'Ensure long-term operational integrity, detect data drift, track regional technology equity, and ensure continuous statutory conformance.',
      deliverables: [
        'Active telemetry node registration on the Sovereign GIS Spatial Map',
        'Automated drift alert feed tracking model degradation over time',
        'Annual statutory re-evaluation and audit renewal dossier',
        'Public transparency scorecard on the Public Verification Portal'
      ],
      authority: 'Monitoring & Evaluation (M&E) Directorate & Sovereign Geospatial Intelligence Center',
      legalBasis: 'National AI Policy Continuous Monitoring Mandate & Act 843 Annual Compliance Audit',
      gatekeeperEffect: 'Unreported model architectural modifications trigger immediate clearance suspension.',
      exitCriteria: 'Active sovereign monitoring status with annual Certificate of Recertification.'
    }
  ];

  // ---------------------------------------------------------------------------
  // 4 AI GOVERNANCE TIERS (Fully expanded with "Explain More")
  // ---------------------------------------------------------------------------
  const tiersList = [
    {
      id: 'tier-1',
      title: 'TIER 1: Critical Sovereign AI Infrastructure',
      level: 'Level 4 (Critical)',
      badgeColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.15)',
      badgeText: '#fca5a5',
      heading: 'Critical Sovereign AI',
      summary: 'Biometrics, national security, electrical grid automation, and tax fraud detection (GhanaCard AFIS, GridCo, GRA Tax Intelligence).',
      objective: 'Protect critical national infrastructure, citizen constitutional rights, and economic sovereignty from systemic technological disruption.',
      governance: 'Enhanced full review with direct NITA participation in governance and steering committee oversight.',
      sla: '21 Business Days TCC Review',
      examples: [
        'GhanaCard Biometric Automated Fingerprint Identification System (AFIS)',
        'GridCo Smart Electrical Transmission & Load Forecasting Neural Network',
        'GRA Automated Tax Fraud & Customs Under-Invoicing Detection Engine'
      ],
      requirements: [
        'Mandatory on-premise sovereign data residency within Ghana Tier III Data Centers',
        'Direct NITA representative on the Project Steering and Governance Board',
        'Quarterly adversarial penetration testing and red-teaming audits',
        'Zero-tolerance demographic bias verification with statistical parity across all 16 regions',
        'Mandatory manual human-in-the-loop override for all automated enforcement actions'
      ],
      sanctions: 'Unauthorized deployment constitutes a national cybersecurity infraction under Act 1038 with immediate administrative shutdown and severe statutory sanctions.',
      recertification: 'Annual mandatory full re-audit by the Technical Clearance Committee.'
    },
    {
      id: 'tier-2',
      title: 'TIER 2: Automated Decision-Making & Diagnostic Engines',
      level: 'Level 3 (High Impact)',
      badgeColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.15)',
      badgeText: '#fcd34d',
      heading: 'Automated Decision Engines',
      summary: 'Fintech credit scoring, mobile money AML, clinical diagnostic algorithms, and social benefit eligibility screening.',
      objective: 'Safeguard citizen economic welfare, health outcomes, and algorithmic fairness in high-stakes automated decisions.',
      governance: 'Standard Full Review across all technical domains by the Technical Clearance Committee (TCC).',
      sla: '14 Business Days TCC Review',
      examples: [
        'Mobile Money Anti-Money Laundering (AML) & Fraud Detection Models (Zeepay / Telecel Cash)',
        'Clinical Decision Support & Disease Diagnostics (Ministry of Health / Korle Bu)',
        'DVLA Automated Driving License Verification & Vehicle Computer Vision',
        'LEAP Social Welfare Automated Eligibility Scoring Engine'
      ],
      requirements: [
        'Comprehensive Data Protection Impact Assessment (DPIA) approved by DPC',
        'Algorithmic demographic fairness audit (Fairness Parity Index must exceed 85%)',
        'Full explainability protocol providing meaningful reasons for adverse decisions',
        'Cryptographic audit trail for all inference decisions retained for minimum 5 years'
      ],
      sanctions: 'Failure to secure clearance results in suspension of commercial operation and restriction from public payment gateways.',
      recertification: 'Mandatory re-certification every 18 months or upon major model retraining.'
    },
    {
      id: 'tier-3',
      title: 'TIER 3: Institutional Decision Support & NLP Systems',
      level: 'Level 2 (Institutional)',
      badgeColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.15)',
      badgeText: '#6ee7b7',
      heading: 'Decision Support & NLP',
      summary: 'Public service customer chatbots, agricultural advisory systems (Cocoa Board CMS), and administrative document synthesis.',
      objective: 'Ensure institutional operational efficiency, prevent information hallucination, and maintain public data privacy standards.',
      governance: 'Expedited Review with targeted technical evaluations focusing on data boundaries and security baselines.',
      sla: '7 Business Days Expedited Review',
      examples: [
        'Cocoa Board Agronomic Advisory CMS & Pest Detection AI (Mergdata)',
        'Public Service Ministry Conversational Chatbots and Citizen Q&A Portals',
        'Municipal Solid Waste Logistics and Route Optimization AI',
        'Automated Public Sector Document OCR and Translation Copilots'
      ],
      requirements: [
        'Clear data boundary verification ensuring no citizen PII enters external LLM APIs',
        'Standard cybersecurity baseline vulnerability scanning',
        'Hallucination and guardrail testing for public-facing information responses',
        'Transparent AI disclosure clearly notifying users that they are interacting with an AI agent'
      ],
      sanctions: 'Revocation of GovNet interconnectivity and listing on the NITA non-compliance notice board.',
      recertification: 'Every 24 months with simplified compliance renewal.'
    },
    {
      id: 'tier-4',
      title: 'TIER 4: Research, Sandboxes & Minimal Impact AI',
      level: 'Level 1 (Sandbox)',
      badgeColor: '#64748b',
      badgeBg: 'rgba(100, 116, 139, 0.15)',
      badgeText: '#cbd5e1',
      heading: 'Research & Sandboxes',
      summary: 'Academic sandbox pilots, experimental research models, and internal operational analytics.',
      objective: 'Encourage domestic Ghanaian AI innovation and academic research without imposing burdensome regulatory overhead.',
      governance: 'Simplified Notice of Compliance report submitted to NITA for central register visibility.',
      sla: '3 Business Days Fast-Track Listing',
      examples: [
        'University of Ghana / KNUST Computer Science AI Research Sandboxes',
        'Internal MDA Workflow Analytics and Predictive Facilities Energy Models',
        'Early-stage AgTech Computer Vision prototypes in controlled farm testing',
        'Academic Language Translation datasets and Twi/Fante speech recognition pilots'
      ],
      requirements: [
        'Signed self-declaration of non-production containment and sandbox boundaries',
        'Prohibition against ingesting live citizen identification records without explicit consent',
        'Listing in the National AI Sandbox Register for statistical and tracking visibility'
      ],
      sanctions: 'Immediate reclassification to Tier 2 or Tier 3 if the system is transitioned to live commercial or citizen-facing use.',
      recertification: 'Upon transition from academic/pilot sandbox to production deployment.'
    }
  ];

  // 10 NAPTCS Regulatory Modules Configuration
  const modulesList = [
    {
      id: 'dashboard',
      name: 'NAPTCS Analytics & M&E',
      badge: 'National Oversight',
      badgeColor: '#059669',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-6 h-6 text-emerald-400" />,
      description: 'Real-time statutory clearance velocity, nationwide KPIs, MDA vs Private sector breakdowns, and deployment pipeline analytics.',
      roleRequired: 'All Roles',
      stat: `${totalProjects} Projects Monitored`
    },
    {
      id: 'organizations',
      name: 'Organization Clearance Gate',
      badge: 'Gatekeeper Rule',
      badgeColor: '#10b981',
      path: '/organizations',
      icon: <Building2 className="w-6 h-6 text-teal-400" />,
      description: 'MDA & vendor accreditation portal with statutory multi-document upload (3–5 PDFs/images) and prerequisite accreditation vetting.',
      roleRequired: 'Clearance Authority / Applicant',
      stat: `${clearedOrgs}/${totalOrgs} Entities Cleared`
    },
    {
      id: 'registry',
      name: 'AI Projects National Registry',
      badge: 'Central AI Repository',
      badgeColor: '#3b82f6',
      path: '/registry',
      icon: <FilePlus2 className="w-6 h-6 text-blue-400" />,
      description: 'Authoritative national register of public sector and enterprise AI systems with statutory Technical Clearance Certification.',
      roleRequired: 'Clearance Authority / Applicant',
      stat: `${clearedProjects} Certified Systems`
    },
    {
      id: 'verification',
      name: 'Public Verification Portal',
      badge: 'Citizen Trust & QR Seal',
      badgeColor: '#8b5cf6',
      path: '/verification',
      icon: <FileCheck className="w-6 h-6 text-purple-400" />,
      description: 'Citizen and auditor verification engine for validating statutory Technical Clearance Certificates (TCC), QR signatures, and accreditation validity.',
      roleRequired: 'Public Access',
      stat: 'Instant QR Validation'
    },
    {
      id: 'gis',
      name: 'Sovereign GIS Spatial Map',
      badge: '16 Administrative Regions',
      badgeColor: '#06b6d4',
      path: '/gis',
      icon: <Map className="w-6 h-6 text-cyan-400" />,
      description: 'Interactive geospatial distribution of government AI deployments, sovereign data infrastructure, and regional technology readiness across Ghana.',
      roleRequired: 'Public Access',
      stat: '16 Regions Active'
    },
    {
      id: 'governance',
      name: 'Governance & Ethics (Act 843)',
      badge: 'Data Protection Conformance',
      badgeColor: '#f59e0b',
      path: '/governance',
      icon: <ShieldCheck className="w-6 h-6 text-amber-400" />,
      description: 'Algorithmic bias auditing, Data Protection Act (Act 843) compliance verification, DPIA validation, and ethical scorecards.',
      roleRequired: 'Regulator / Clearance Authority',
      stat: '94.2% Compliance Score'
    },
    {
      id: 'readiness',
      name: 'AI Readiness & Scoring',
      badge: 'Sovereign Compute & Talent',
      badgeColor: '#6366f1',
      path: '/readiness',
      icon: <Award className="w-6 h-6 text-indigo-400" />,
      description: 'Institutional AI maturity assessment, national GPU/compute capacity metrics, institutional talent grading, and infrastructure index.',
      roleRequired: 'Regulator / Applicant',
      stat: 'National Index: 78.4'
    },
    {
      id: 'risk',
      name: 'Risk Matrix & Threat Tiers',
      badge: '5x5 ISO 42001 Grid',
      badgeColor: '#ef4444',
      path: '/risk',
      icon: <AlertOctagon className="w-6 h-6 text-rose-400" />,
      description: 'Multi-domain AI threat classification, automated decision risk evaluation, threat vector modeling, and mandatory statutory mitigation.',
      roleRequired: 'Regulator / Clearance Authority',
      stat: `${highRiskProjects} High-Risk Monitored`
    },
    {
      id: 'documents',
      name: 'Document Vault & Cryptographic OCR',
      badge: 'Encrypted Repository',
      badgeColor: '#14b8a6',
      path: '/documents',
      icon: <Files className="w-6 h-6 text-teal-300" />,
      description: 'Secure statutory vault for Terms of Reference (ToR), architectural dossiers, DPIAs, VAPT reports, and cryptographic digital signatures.',
      roleRequired: 'Regulator / Applicant',
      stat: 'Multi-PDF & Digital Seals'
    },
    {
      id: 'chat',
      name: 'Regulator AI Policy Assistant',
      badge: 'Ghana AI Strategy Copilot',
      badgeColor: '#ec4899',
      path: '/chat',
      icon: <MessageSquareCode className="w-6 h-6 text-pink-400" />,
      description: 'Intelligent regulatory assistant providing instant guidance on statutory clearance guidelines, Act 843 citations, and GGEA standards.',
      roleRequired: 'All Roles',
      stat: '24/7 Regulatory Copilot'
    }
  ];

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0b0f19', 
      color: '#f8fafc', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      
      {/* =========================================================================
          TOP NAVIGATION BAR (Matching System Header Theme)
          ========================================================================= */}
      <header style={{
        backgroundColor: 'rgba(11, 15, 25, 0.95)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          {/* Official Emblem & Portal Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
              fontWeight: 900,
              fontSize: '1rem',
              color: '#ffffff',
              letterSpacing: '0.04em'
            }}>
              NAPT
            </div>
            <div>
              <div style={{ 
                fontSize: '0.96rem', 
                fontWeight: 800, 
                color: '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span>REPUBLIC OF GHANA</span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '999px', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  GNAPRMS / NAPTCS
                </span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                National AI Project Tracking & Clearance System • Act 843 & Act 771
              </div>
            </div>
          </div>

          {/* Nav Jumps & Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a 
              href="#clearance-workflow" 
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, padding: '6px 12px', borderRadius: '6px' }}
              className="hover:text-emerald-400"
            >
              7-Stage Workflow
            </a>
            <a 
              href="#ai-risk-framework" 
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, padding: '6px 12px', borderRadius: '6px' }}
              className="hover:text-emerald-400"
            >
              Risk Tiers
            </a>
            <a 
              href="#naptcs-modules" 
              style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.82rem', fontWeight: 600, padding: '6px 12px', borderRadius: '6px' }}
              className="hover:text-emerald-400"
            >
              10 Modules
            </a>

            {/* Page Audit Log Trigger */}
            <button
              onClick={onOpenAuditLog}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(16, 185, 129, 0.12)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#6ee7b7',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="View immutable system navigation and audit trail"
            >
              <History className="w-3.5 h-3.5 text-emerald-400" />
              <span>Page Audit Log</span>
              <span style={{
                background: '#047857',
                color: '#ffffff',
                fontSize: '0.65rem',
                padding: '1px 6px',
                borderRadius: '999px',
                marginLeft: '2px'
              }}>
                {pageLogs.length}
              </span>
            </button>

            {/* Role Switcher */}
            <RoleSwitcher currentRole={currentRole} onRoleChange={onRoleChange} />
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION (Consistent Dark Sovereign Styling)
          ========================================================================= */}
      <section style={{
        background: 'linear-gradient(180deg, #09121d 0%, #0b0f19 100%)',
        position: 'relative',
        overflow: 'hidden',
        padding: '64px 24px 80px 24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        {/* Subtle background ambient glows */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '5%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '10%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(251, 191, 36, 0.05) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.15fr) minmax(0, 0.85fr)',
          gap: '48px',
          alignItems: 'center'
        }}>
          
          {/* Left Column: Headline, Description, CTAs, Real Metrics */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#34d399',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              marginBottom: '20px'
            }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL SOVEREIGN AI REGULATORY GATEWAY</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.3rem, 4.2vw, 3.6rem)',
              lineHeight: 1.1,
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.03em',
              marginBottom: '24px'
            }}>
              Sovereign <span style={{ color: '#fbbf24' }}>Artificial Intelligence</span><br />
              <span style={{ color: '#10b981' }}>Clearance & Oversight</span> for<br />
              the Republic of Ghana
            </h1>

            <p style={{
              fontSize: '1.02rem',
              lineHeight: 1.6,
              color: '#94a3b8',
              maxWidth: '560px',
              marginBottom: '32px',
              fontWeight: 400
            }}>
              The central statutory regulatory gateway governing public sector (MDAs/SOEs) and private 
              enterprise AI deployments across Ghana. Enforcing mandatory organizational accreditation, 
              algorithmic impact audits, and statutory compliance under the Data Protection Act (Act 843).
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '44px' }}>
              <button
                onClick={() => onNavigateToModule('organizations', 'Organization Clearance Gate', '/organizations')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.96rem',
                  padding: '14px 26px',
                  borderRadius: '10px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#047857'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              >
                <span>Apply for Organization Clearance</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateToModule('registry', 'AI Projects National Registry', '/registry')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '0.96rem',
                  padding: '14px 24px',
                  borderRadius: '10px',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <span>Register AI Project</span>
              </button>

              <button
                onClick={() => onNavigateToModule('verification', 'Public Verification Portal', '/verification')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'transparent',
                  color: '#fbbf24',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  cursor: 'pointer'
                }}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Verify Certificate (Public)</span>
              </button>
            </div>

            {/* Live Stats Triple Bar */}
            <div style={{
              display: 'flex',
              gap: '32px',
              paddingTop: '20px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              flexWrap: 'wrap'
            }}>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>
                  7 Stages
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  Statutory AI Review Lifecycle
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>
                  {clearedOrgs} of {totalOrgs} Orgs
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  Accredited Organizations (Gatekeeper)
                </div>
              </div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>
                  4 Tiers
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 500 }}>
                  National AI Risk Classification
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Hero 7-Stage Overview Card */}
          <div>
            <div style={{
              backgroundColor: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: '18px',
              padding: '24px',
              boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.6), 0 0 30px rgba(16, 185, 129, 0.08)',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34d399', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  7-STAGE STATUTORY AI CLEARANCE WORKFLOW
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                  Click to Explain More
                </span>
              </div>

              {/* Scrollable / Spaced 7 Stages in Hero Card */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
                {stagesList.map((stage) => (
                  <div
                    key={stage.id}
                    onClick={() => setModalStage(stage)}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center',
                      padding: '10px 12px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    className="hover:border-emerald-500/40 hover:bg-slate-800/60"
                  >
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      background: stage.badgeColor,
                      color: stage.id === 2 ? '#000000' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {stage.id}
                    </div>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stage.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        SLA: {stage.sla}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#34d399', fontWeight: 600 }}>
                      Explain →
                    </span>
                  </div>
                ))}
              </div>

              {/* View all requirements link */}
              <div style={{ textAlign: 'right', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                <a
                  href="#clearance-workflow"
                  style={{
                    color: '#fbbf24',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span>Explore all 7 stages in full statutory detail ↓</span>
                </a>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 7-STAGE SOVEREIGN AI CLEARANCE WORKFLOW + "EXPLAIN MORE"
          Consistent Dark Theme: #0b0f19, Cards: rgba(17, 24, 39, 0.75)
          ========================================================================= */}
      <section id="clearance-workflow" style={{
        padding: '80px 24px',
        backgroundColor: '#0b0f19',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#10b981',
              marginBottom: '10px'
            }}>
              STATUTORY AI CLEARANCE WORKFLOW (7 STAGES)
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
              marginBottom: '14px'
            }}>
              How the 7-Stage Ghana AI Clearance Lifecycle Operates
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#94a3b8',
              maxWidth: '740px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              The Republic of Ghana digital governance framework mandates that public and private AI solutions 
              traverse seven formal stages before deployment. <strong>Click any stage or "Explain More" to inspect statutory requirements.</strong>
            </p>
          </div>

          {/* 7 Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px'
          }}>
            {stagesList.map((stage) => {
              const isExpanded = expandedStageId === stage.id;

              return (
                <div 
                  key={stage.id}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.75)',
                    border: isExpanded ? `2px solid ${stage.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease'
                  }}
                  className="hover:border-emerald-500/40 hover:bg-slate-900/90"
                >
                  {/* Top Badge & SLA Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: stage.badgeBg,
                      color: stage.badgeText,
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      padding: '4px 14px',
                      borderRadius: '999px'
                    }}>
                      {stage.badge}
                    </div>

                    <span style={{
                      fontSize: '0.72rem',
                      color: '#94a3b8',
                      backgroundColor: 'rgba(255, 255, 255, 0.04)',
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}>
                      SLA: {stage.sla}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 style={{
                    fontSize: '1.08rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                    lineHeight: 1.35,
                    marginBottom: '8px'
                  }}>
                    {stage.title}
                  </h3>
                  
                  <div style={{ fontSize: '0.78rem', color: stage.badgeColor, fontWeight: 600, marginBottom: '12px' }}>
                    {stage.subtitle}
                  </div>

                  <p style={{
                    fontSize: '0.86rem',
                    lineHeight: 1.6,
                    color: '#94a3b8',
                    marginBottom: '20px',
                    flexGrow: 1
                  }}>
                    {stage.summary}
                  </p>

                  {/* Interactive "Explain More" Click Button */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <button
                      onClick={() => setExpandedStageId(isExpanded ? null : stage.id)}
                      style={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: isExpanded ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: isExpanded ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isExpanded ? '#34d399' : '#f8fafc',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Explain More'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setModalStage(stage)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                      title="Open full statutory breakdown in modal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline Expanded "Explain More" Drawer */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div>
                        <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '2px' }}>
                          Statutory Objective:
                        </div>
                        <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>
                          {stage.objective}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '4px' }}>
                          Mandatory Deliverables:
                        </div>
                        <ul style={{ paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
                          {stage.deliverables.map((item, dIdx) => (
                            <li key={dIdx}>{item}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Governing Body:</div>
                          <div style={{ color: '#f8fafc', fontWeight: 600 }}>{stage.authority}</div>
                        </div>
                        <div>
                          <div style={{ color: '#64748b', fontSize: '0.7rem' }}>Legal Basis:</div>
                          <div style={{ color: '#f8fafc', fontWeight: 600 }}>{stage.legalBasis}</div>
                        </div>
                      </div>

                      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)', padding: '8px 10px', borderRadius: '6px', borderLeft: `3px solid ${stage.badgeColor}` }}>
                        <span style={{ color: '#34d399', fontWeight: 700 }}>Exit Milestone: </span>
                        <span style={{ color: '#cbd5e1' }}>{stage.exitCriteria}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 3: NATIONAL AI RISK CLASSIFICATION TIERS + "EXPLAIN MORE"
          Consistent Dark Theme: #0b0f19, Cards: rgba(17, 24, 39, 0.75)
          ========================================================================= */}
      <section id="ai-risk-framework" style={{
        padding: '80px 24px',
        backgroundColor: '#0e1422',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <div style={{
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#fbbf24',
              marginBottom: '10px'
            }}>
              STATUTORY AI RISK CLASSIFICATION
            </div>
            <h2 style={{
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.02em',
              marginBottom: '14px'
            }}>
              National AI Classification & Governance Tiers
            </h2>
            <p style={{
              fontSize: '1rem',
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Statutory risk classification bands under the National AI Governance Framework and ISO 42001 standard. 
              <strong> Click "Explain More" on any tier to inspect controls and sanctions.</strong>
            </p>
          </div>

          {/* 4 Cards Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px'
          }}>
            {tiersList.map((tier) => {
              const isExpanded = expandedTierId === tier.id;

              return (
                <div 
                  key={tier.id}
                  style={{
                    backgroundColor: 'rgba(17, 24, 39, 0.75)',
                    border: isExpanded ? `2px solid ${tier.badgeColor}` : '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '16px',
                    padding: '28px 24px',
                    boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.25s ease'
                  }}
                  className="hover:border-emerald-500/40 hover:bg-slate-900/90"
                >
                  {/* Top Badge Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', color: '#f8fafc' }}>
                      {tier.title.split(':')[0]}
                    </span>
                    <span style={{
                      backgroundColor: tier.badgeBg,
                      color: tier.badgeText,
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      padding: '3px 10px',
                      borderRadius: '999px'
                    }}>
                      {tier.level}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '1.2rem',
                    fontWeight: 800,
                    color: '#f8fafc',
                    marginBottom: '12px',
                    letterSpacing: '-0.01em'
                  }}>
                    {tier.heading}
                  </div>

                  <p style={{
                    fontSize: '0.84rem',
                    lineHeight: 1.55,
                    color: '#94a3b8',
                    flexGrow: 1,
                    marginBottom: '18px'
                  }}>
                    {tier.summary}
                  </p>

                  <div style={{
                    marginBottom: '18px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderLeft: `3px solid ${tier.badgeColor}`,
                    fontSize: '0.74rem',
                    color: '#cbd5e1'
                  }}>
                    <span style={{ fontWeight: 700, color: tier.badgeText }}>Governance: </span>
                    {tier.governance}
                  </div>

                  {/* "Explain More" Click Button */}
                  <div style={{ display: 'flex', gap: '8px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <button
                      onClick={() => setExpandedTierId(isExpanded ? null : tier.id)}
                      style={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 14px',
                        borderRadius: '8px',
                        backgroundColor: isExpanded ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                        border: isExpanded ? '1px solid rgba(251, 191, 36, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isExpanded ? '#fbbf24' : '#f8fafc',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <span>{isExpanded ? 'Hide Controls' : 'Explain More'}</span>
                      {isExpanded ? <ChevronDown className="w-4 h-4 rotate-180" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => setModalTier(tier)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#94a3b8',
                        cursor: 'pointer'
                      }}
                      title="Open full tier breakdown in modal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline Expanded Tier Breakdown */}
                  {isExpanded && (
                    <div style={{
                      marginTop: '16px',
                      padding: '16px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.78rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div>
                        <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>
                          Ghana Operational Examples:
                        </div>
                        <ul style={{ paddingLeft: '16px', color: '#cbd5e1', lineHeight: 1.5 }}>
                          {tier.examples.map((ex, exIdx) => (
                            <li key={exIdx}>{ex}</li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '4px' }}>
                          Mandatory Statutory Requirements:
                        </div>
                        <ul style={{ paddingLeft: '16px', color: '#94a3b8', lineHeight: 1.5 }}>
                          {tier.requirements.map((req, rIdx) => (
                            <li key={rIdx}>{req}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', padding: '8px 10px', borderRadius: '6px', borderLeft: `3px solid ${tier.badgeColor}` }}>
                        <span style={{ color: '#f87171', fontWeight: 700 }}>Statutory Sanctions: </span>
                        <span style={{ color: '#cbd5e1' }}>{tier.sanctions}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8', paddingTop: '6px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span>SLA: {tier.sla}</span>
                        <span>Renewal: {tier.recertification}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 4: ALL 10 NAPTCS MODULES (Single-Click Gateway to Any Module)
          ========================================================================= */}
      <section id="naptcs-modules" style={{
        padding: '84px 24px',
        backgroundColor: '#0b0f19',
        color: '#f8fafc',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: '#34d399',
              padding: '4px 14px',
              borderRadius: '999px',
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              marginBottom: '12px'
            }}>
              <Layers className="w-3.5 h-3.5" />
              <span>NAPTCS STATUTORY MODULES DIRECTORY</span>
            </div>
            <h2 style={{
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.025em',
              marginBottom: '16px'
            }}>
              Sovereign AI Oversight & Regulatory Modules
            </h2>
            <p style={{
              fontSize: '1.05rem',
              color: '#94a3b8',
              maxWidth: '740px',
              margin: '0 auto',
              lineHeight: 1.6
            }}>
              Select any of the 10 statutory modules below. Every module opens directly, and provides a 
              <strong> single-click return button</strong> to navigate straight back to this national gateway.
            </p>
          </div>

          {/* 10 Modules Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {modulesList.map((mod, idx) => (
              <div
                key={mod.id}
                onClick={() => onNavigateToModule(mod.id, mod.name, mod.path)}
                style={{
                  backgroundColor: 'rgba(17, 24, 39, 0.75)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '16px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.25s ease',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                }}
                className="hover:border-emerald-500/50 hover:bg-slate-900/95 hover:-translate-y-1 hover:shadow-2xl"
              >
                {/* Header row inside card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {mod.icon}
                  </div>
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.06)',
                    color: mod.badgeColor,
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '999px',
                    border: `1px solid ${mod.badgeColor}33`
                  }}>
                    {mod.badge}
                  </span>
                </div>

                {/* Module Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 800 }}>
                    M0{idx + 1}
                  </span>
                  <h3 style={{ fontSize: '1.12rem', fontWeight: 700, color: '#ffffff' }}>
                    {mod.name}
                  </h3>
                </div>

                {/* Module Description */}
                <p style={{
                  fontSize: '0.85rem',
                  color: '#94a3b8',
                  lineHeight: 1.55,
                  marginBottom: '16px',
                  flexGrow: 1
                }}>
                  {mod.description}
                </p>

                {/* Live Stat Pill */}
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: '#6ee7b7',
                  fontWeight: 600,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{mod.stat}</span>
                </div>

                {/* Card Footer: Role + Direct Launch button */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    {mod.roleRequired}
                  </span>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#34d399',
                    fontSize: '0.82rem',
                    fontWeight: 700
                  }}>
                    <span>Open Module</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================================
          SECTION 5: REAL-TIME AUDIT LOG TICKER & TELEMETRY
          ========================================================================= */}
      <section style={{
        padding: '60px 24px',
        backgroundColor: '#070b14',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399'
              }}>
                <Activity className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  Live Sovereign AI Page Navigation & Access Trail
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  Immutable audit records tracking page visits, module actions, and user roles in compliance with Ghana Data Protection Act (Act 843).
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAuditLog}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#059669',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.88rem',
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <History className="w-4 h-4" />
              <span>Open Complete Page Audit Log ({pageLogs.length} Records)</span>
            </button>
          </div>

          {/* Quick Recent Activity Table */}
          <div style={{
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            overflowX: 'auto'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <th style={{ padding: '12px 16px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px' }}>Page / Module</th>
                  <th style={{ padding: '12px 16px' }}>Route Path</th>
                  <th style={{ padding: '12px 16px' }}>User Role</th>
                  <th style={{ padding: '12px 16px' }}>Action</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageLogs.slice(0, 5).map((log) => (
                  <tr 
                    key={log.id} 
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#cbd5e1' }}
                  >
                    <td style={{ padding: '12px 16px', fontFamily: 'monospace', color: '#94a3b8' }}>
                      {log.timestamp}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#ffffff' }}>
                      {log.pageName}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#34d399', fontFamily: 'monospace' }}>
                      {log.path}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {log.userRole}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        color: '#10b981',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.75rem'
                      }}>
                        <Check className="w-3.5 h-3.5" />
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER (Matching Dark Sovereign Theme)
          ========================================================================= */}
      <footer style={{
        backgroundColor: '#05080e',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '40px 24px',
        color: '#64748b',
        fontSize: '0.82rem'
      }}>
        <div style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem', marginBottom: '4px' }}>
              National AI Project Tracking & Clearance System (NAPTCS / GNAPRMS)
            </div>
            <div>
              National Information Technology Agency (NITA) • Ministry of Communications and Digitalisation (MoCD)
            </div>
            <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#94a3b8' }}>
              Enacted under Data Protection Act 2012 (Act 843), NITA Act 2008 (Act 771), and the Ghana National AI Strategy.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            <button 
              onClick={onOpenAuditLog}
              style={{ background: 'none', border: 'none', color: '#6ee7b7', cursor: 'pointer', fontSize: '0.82rem' }}
            >
              System Page Logs
            </button>
            <button 
              onClick={() => onNavigateToModule('verification', 'Public Verification Portal', '/verification')}
              style={{ background: 'none', border: 'none', color: '#cbd5e1', cursor: 'pointer', fontSize: '0.82rem' }}
            >
              Verify Certificate
            </button>
            <span style={{ color: '#475569' }}>|</span>
            <span style={{ color: '#94a3b8' }}>© 2026 NITA Ghana. All Rights Reserved.</span>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL: EXPLAIN MORE FOR WORKFLOW STAGE
          ========================================================================= */}
      {modalStage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalStage(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: modalStage.badgeColor,
                color: modalStage.id === 2 ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem'
              }}>
                {modalStage.id}
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: modalStage.badgeColor, textTransform: 'uppercase' }}>
                  STAGE 0{modalStage.id} STATUTORY BREAKDOWN
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                  {modalStage.title}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div>
                <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>
                  Statutory Purpose & Objective:
                </div>
                <div>{modalStage.objective}</div>
              </div>

              <div>
                <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>
                  Mandatory Submission Deliverables:
                </div>
                <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                  {modalStage.deliverables.map((item: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Governing Authority:</div>
                  <div style={{ color: '#ffffff', fontWeight: 700 }}>{modalStage.authority}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Statutory SLA:</div>
                  <div style={{ color: modalStage.badgeColor, fontWeight: 700 }}>{modalStage.sla}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Governing Legislation:</div>
                  <div style={{ color: '#ffffff' }}>{modalStage.legalBasis}</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderLeft: `4px solid ${modalStage.badgeColor}`
              }}>
                <span style={{ fontWeight: 800, color: '#34d399' }}>Exit Milestone: </span>
                <span>{modalStage.exitCriteria}</span>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderLeft: '4px solid #ef4444',
                fontSize: '0.8rem',
                color: '#fca5a5'
              }}>
                <span style={{ fontWeight: 800 }}>Gatekeeper Impact: </span>
                <span>{modalStage.gatekeeperEffect}</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalStage(null)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: EXPLAIN MORE FOR GOVERNANCE TIER
          ========================================================================= */}
      {modalTier && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: `1px solid ${modalTier.badgeColor}66`,
            borderRadius: '16px',
            maxWidth: '680px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            position: 'relative'
          }}>
            <button
              onClick={() => setModalTier(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                borderRadius: '8px',
                padding: '6px',
                cursor: 'pointer'
              }}
            >
              <X className="w-5 h-5" />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: modalTier.badgeBg,
                color: modalTier.badgeText,
                fontWeight: 800,
                fontSize: '0.85rem'
              }}>
                {modalTier.level}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc' }}>
                {modalTier.title}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', fontSize: '0.86rem', color: '#cbd5e1', lineHeight: 1.6 }}>
              <div>
                <div style={{ color: '#fbbf24', fontWeight: 700, marginBottom: '4px' }}>
                  Risk Profile & Sovereign Objective:
                </div>
                <div>{modalTier.objective}</div>
              </div>

              <div>
                <div style={{ color: '#34d399', fontWeight: 700, marginBottom: '6px' }}>
                  Active Ghana Operational Deployments:
                </div>
                <ul style={{ paddingLeft: '20px', color: '#cbd5e1' }}>
                  {modalTier.examples.map((ex: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{ex}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div style={{ color: '#60a5fa', fontWeight: 700, marginBottom: '6px' }}>
                  Mandatory Statutory Compliance Controls:
                </div>
                <ul style={{ paddingLeft: '20px', color: '#94a3b8' }}>
                  {modalTier.requirements.map((req: string, idx: number) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{req}</li>
                  ))}
                </ul>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                padding: '14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Review SLA:</div>
                  <div style={{ color: '#ffffff', fontWeight: 700 }}>{modalTier.sla}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Recertification Cycle:</div>
                  <div style={{ color: modalTier.badgeText, fontWeight: 700 }}>{modalTier.recertification}</div>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <div style={{ color: '#64748b', fontSize: '0.72rem', fontWeight: 600 }}>Governance Level:</div>
                  <div style={{ color: '#ffffff' }}>{modalTier.governance}</div>
                </div>
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                borderLeft: `4px solid ${modalTier.badgeColor}`,
                color: '#fca5a5'
              }}>
                <span style={{ fontWeight: 800 }}>Non-Compliance Sanctions: </span>
                <span>{modalTier.sanctions}</span>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setModalTier(null)}
                style={{
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
