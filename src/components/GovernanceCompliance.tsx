import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, AlertTriangle, Info } from 'lucide-react';
import { AIProject, ComplianceScore } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface GovernanceComplianceProps {
  projects: AIProject[];
  onUpdateCompliance: (projectId: string, newScore: ComplianceScore) => void;
  currentRole: UserRole;
}

interface AuditQuestion {
  id: string;
  category: 'fairness' | 'transparency' | 'privacy' | 'security';
  text: string;
  description: string;
}

const frameworkQuestions: Record<string, AuditQuestion[]> = {
  Ghana: [
    { id: 'f1', category: 'fairness', text: 'Training datasets evaluated and balanced across all 16 Ghanaian regions to prevent regional bias.', description: 'Ensures that agricultural, demographic, and financial models perform equally well across the Northern, Southern, Eastern, and Western zones of Ghana.' },
    { id: 'f2', category: 'fairness', text: 'Model algorithms tested for gender and tribal label parity (e.g. Twi/Fante speech samples equal representation).', description: 'Mitigates linguistic bias by validating that dialectal variations and gender voices are accurately recognized and represented.' },
    { id: 'f3', category: 'fairness', text: 'Socio-Economic Inclusivity features implemented (e.g. local language voice prompts for low-literacy segments).', description: 'Enables rural and low-literacy citizens to access benefits and services without facing tech-exclusion barriers.' },
    { id: 't1', category: 'transparency', text: 'Comprehensive Model Card detailing neural architecture, hyper-parameters, and limitations published.', description: 'Provides a standardized reference document for system design, training runs, and operational limits of the AI.' },
    { id: 't2', category: 'transparency', text: 'Source dataset origins and labeling metadata catalogued and accessible for civil audits.', description: 'Enables transparency by recording who gathered the data, who annotated it, and how consent was obtained.' },
    { id: 't3', category: 'transparency', text: 'Plain-English and local language summary explanations generated automatically for end-user decisions.', description: 'Translates complex decision nodes into local terms so citizens can understand why an automated action was taken.' },
    { id: 'p1', category: 'privacy', text: 'Data Protection Officer (DPO) appointed and officially registered under the Ghana Data Protection Commission.', description: 'Fulfills Act 843 requirements by registering a legal supervisor to handle data privacy compliance and citizen complaints.' },
    { id: 'p2', category: 'privacy', text: 'All personal records (PII) anonymized at database ingestion using salted cryptographic hashing (SHA-256).', description: 'Ensures that no identifiable citizen records are stored in plain text, securing database logs against privacy leaks.' },
    { id: 'p3', category: 'privacy', text: 'Verify database hosting meets sovereign localization rules (physically hosted inside Ghana\'s borders).', description: 'Mandated by local data residency rules to ensure all personal data remains within national jurisdiction.' },
    { id: 's1', category: 'security', text: 'System source code audited and certified against OWASP Top 10 vulnerabilities.', description: 'Ensures software defense layers are robust against common exploits like injection attacks and broken authentication.' },
    { id: 's2', category: 'security', text: 'Semi-annual third-party penetration testing program and CVE logging scheduled under Act 1038.', description: 'Guarantees periodic simulation of cyber-attacks to proactively discover and remediate security vulnerabilities.' },
    { id: 's3', category: 'security', text: 'Automatic telemetry integration configured with National Cyber Security Authority alert systems.', description: 'Allows real-time incident reporting and coordinated threat response during active DDoS or malware campaigns.' }
  ],
  'European Union': [
    { id: 'f1', category: 'fairness', text: 'Algorithmic bias assessments conducted on protected characteristics (gender, race, ethnicity) under EU AI Act.', description: 'Validates model compliance with high-risk system obligations to eliminate demographic discrimination.' },
    { id: 'f2', category: 'fairness', text: 'Representative dataset sampling to prevent discrimination against minority linguistic groups in Europe.', description: 'Ensures voice and text models support EU member states with smaller populations or distinct accents.' },
    { id: 'f3', category: 'fairness', text: 'Conformance audit completed for European Accessibility Act (EAA) software guidelines.', description: 'Verifies that assistive interfaces allow citizens with visual or physical impairments to use the system.' },
    { id: 't1', category: 'transparency', text: 'High-risk AI system registry filing completed and model documentation submitted to EU database.', description: 'Compliance registration under Article 51 of the EU AI Act before placing high-risk systems on the market.' },
    { id: 't2', category: 'transparency', text: 'Downstream user explainability interface provided, stating how output is generated and how to override it.', description: 'Provides a human-interpretable explanation of automated decisions, fulfilling right-to-explanation policies.' },
    { id: 't3', category: 'transparency', text: 'Cryptographic watermarks applied to all synthetic media to transparently label AI-generated content.', description: 'Prevents misinformation by identifying text, audio, and images created by generative algorithms.' },
    { id: 'p1', category: 'privacy', text: 'Data Protection Impact Assessment (DPIA) performed and GDPR-compliant consent flow implemented.', description: 'A detailed assessment of systemic risks to privacy, mandatory under Article 35 of the GDPR.' },
    { id: 'p2', category: 'privacy', text: 'Right to be forgotten (Article 17) mechanisms verified, enabling complete erasure of user records in 30 days.', description: 'Ensures citizen data can be purged from database indexes and backup logs on user demand.' },
    { id: 'p3', category: 'privacy', text: 'Cross-border data transfer impact evaluation signed off, confirming no unauthorized transfer outside the EEA.', description: 'Reviews compliance with Schrems II regulations for external API calls and cloud processing.' },
    { id: 's1', category: 'security', text: 'CE Mark security certification audit completed and compliance status active.', description: 'Certifies that the software conforms to mandatory European cybersecurity safety regulations.' },
    { id: 's2', category: 'security', text: 'Incident response protocols established, with 72-hour regulatory notification capability for breaches.', description: 'Fulfills supervisory reporting requirements in the event of an active cyber incident or data breach.' },
    { id: 's3', category: 'security', text: 'Software Bill of Materials (SBOM) compiled and continuously updated for third-party libraries.', description: 'Identifies security vulnerabilities across all nested packages to prevent supply chain exploits.' }
  ],
  'United States': [
    { id: 'f1', category: 'fairness', text: 'Algorithmic impact assessments performed to evaluate civil rights impacts and disparate treatment.', description: 'Assesses bias impact on hiring, lending, or public assistance scoring systems per US Federal guidelines.' },
    { id: 'f2', category: 'fairness', text: 'Disparate impact ratio tests executed for demographic parity using the Four-Fifths Rule.', description: 'Statistically measures whether selection rates for protected categories are within acceptable limits.' },
    { id: 'f3', category: 'fairness', text: 'ADA Section 508 accessibility compliance verified for all user interfaces.', description: 'Assures that US federal agencies and public systems are accessible to employees and citizens with disabilities.' },
    { id: 't1', category: 'transparency', text: 'AI system registry and public disclosure of generative model training dataset sources maintained.', description: 'Fulfills disclosure rules regarding the training data provenance and licensing status.' },
    { id: 't2', category: 'transparency', text: 'NIST AI Risk Management Framework (RMF) scorecard generated and made public.', description: 'A voluntary framework guiding organizations to identify, measure, and manage AI risks.' },
    { id: 't3', category: 'transparency', text: 'Model explainability logs (SHAP/LIME values) recorded for all automated decisions.', description: 'Maintains a mathematical record of which parameters most heavily influenced high-stakes model outputs.' },
    { id: 'p1', category: 'privacy', text: 'HIPAA-compliant Business Associate Agreements (BAA) signed, or CCPA/CPRA data mapping active.', description: 'Assures data handling contracts protect health datasets or fulfill California privacy directives.' },
    { id: 'p2', category: 'privacy', text: 'Opt-out registry for data sharing and machine learning training queries implemented.', description: 'Provides consumers a clear interface to restrict the sale or model-training use of their personal data.' },
    { id: 'p3', category: 'privacy', text: 'Children\'s Online Privacy Protection Rule (COPPA) review completed for under-13 age restrictions.', description: 'Limits the collection of personal information from children without explicit parental consent.' },
    { id: 's1', category: 'security', text: 'System meets NIST SP 800-53 security controls, with threat modeling performed on training pipelines.', description: 'Strict cybersecurity controls required for federal information systems and partners.' },
    { id: 's2', category: 'security', text: 'FedRAMP / SOC 2 Type II audit report filed, and red-teaming exercises conducted.', description: 'Independent verification of security, availability, and processing integrity of cloud architectures.' },
    { id: 's3', category: 'security', text: 'Adversarial ML attack defenses implemented (e.g. prompt injection mitigations).', description: 'Secures LLM endpoints and predictive nodes against specialized evasion or model extraction attacks.' }
  ],
  'Global Standards (ISO)': [
    { id: 'f1', category: 'fairness', text: 'Algorithmic Fairness management policies established per ISO/IEC 42001 Annex A controls.', description: 'Aligns AI management processes with global standards for managing bias and discrimination.' },
    { id: 'f2', category: 'fairness', text: 'Systematic bias monitoring systems operational in production pipelines to flag drifting predictions.', description: 'Ensures statistical fairness parameters do not degrade as real-world input distributions shift.' },
    { id: 'f3', category: 'fairness', text: 'Linguistic and cultural localization guidelines verified across international deployments.', description: 'Prevents structural discrimination when deploying AI systems across different cultural contexts.' },
    { id: 't1', category: 'transparency', text: 'System documentation and transparency statements published explaining AI capability boundaries.', description: 'Explicitly outlines what the AI system can and cannot do, preventing user over-reliance.' },
    { id: 't2', category: 'transparency', text: 'Explainability logs maintained, allowing traceability of algorithmic logic for audit trails.', description: 'Fulfills ISO auditability requirements by logging explanation paths alongside model predictions.' },
    { id: 't3', category: 'transparency', text: 'Third-party validation report generated verifying model generalization limits.', description: 'Proves the algorithm was tested on independent test sets and performs within declared boundaries.' },
    { id: 'p1', category: 'privacy', text: 'Privacy Information Management System (PIMS) audited against ISO/IEC 27701.', description: 'Extends ISO 27001 security controls to incorporate privacy management requirements.' },
    { id: 'p2', category: 'privacy', text: 'Cross-border data transfer compliance and automated data minimisation criteria active.', description: 'Restricts data storage to only necessary elements and ensures secure global transit.' },
    { id: 'p3', category: 'privacy', text: 'Regular privacy posture reviews scheduled and data retention limits enforced.', description: 'Ensures that databases automatically prune expired user telemetry records to minimize exposure.' },
    { id: 's1', category: 'security', text: 'Information Security Management System (ISMS) certified against ISO/IEC 27001.', description: 'The gold standard for establishing, implementing, and improving information security.' },
    { id: 's2', category: 'security', text: 'Threat vector analysis for adversarial attacks (data poisoning, model inversion) updated quarterly.', description: 'Proactively models threats specific to machine learning weights and dataset security.' },
    { id: 's3', category: 'security', text: 'Business continuity and disaster recovery drills simulated for AI outage vectors.', description: 'Ensures operations can fall back to non-AI or redundant systems during structural failures.' }
  ]
};

const tooltipStyles = `
  .tooltip-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    vertical-align: middle;
  }
  .tooltip-text {
    visibility: hidden;
    width: 280px;
    background-color: rgba(15, 23, 42, 0.95);
    color: #f1f5f9;
    text-align: left;
    border-radius: 8px;
    padding: 10px 14px;
    position: absolute;
    z-index: 9999;
    bottom: 130%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
    font-size: 0.76rem;
    line-height: 1.4;
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(8px);
    pointer-events: none;
    font-weight: normal;
  }
  .tooltip-text::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: rgba(15, 23, 42, 0.95) transparent transparent transparent;
  }
  .tooltip-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
    transform: translateX(-50%) translateY(-2px);
  }
`;

export const GovernanceCompliance: React.FC<GovernanceComplianceProps> = ({
  projects,
  onUpdateCompliance,
  currentRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const [framework, setFramework] = useState<string>('Ghana');
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>({});

  // Initialize metadata answers based on active project's current compliance scores
  useEffect(() => {
    if (!activeProject) return;
    const score = activeProject.compliance;
    const initialAnswers: Record<string, 'yes' | 'no'> = {
      f1: score.fairness >= 60 ? 'yes' : 'no',
      f2: score.fairness >= 80 ? 'yes' : 'no',
      f3: score.fairness >= 100 ? 'yes' : 'no',
      t1: score.transparency >= 60 ? 'yes' : 'no',
      t2: score.transparency >= 80 ? 'yes' : 'no',
      t3: score.transparency >= 100 ? 'yes' : 'no',
      p1: score.privacy >= 60 ? 'yes' : 'no',
      p2: score.privacy >= 80 ? 'yes' : 'no',
      p3: score.privacy >= 100 ? 'yes' : 'no',
      s1: score.security >= 60 ? 'yes' : 'no',
      s2: score.security >= 80 ? 'yes' : 'no',
      s3: score.security >= 100 ? 'yes' : 'no',
    };
    setAnswers(initialAnswers);
  }, [selectedProjectId]);

  const handleAnswerChange = (qId: string, val: 'yes' | 'no') => {
    const canAudit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);
    if (!canAudit) return;

    const newAnswers = {
      ...answers,
      [qId]: val
    };
    setAnswers(newAnswers);

    const computeCategoryScore = (q1Id: string, q2Id: string, q3Id: string) => {
      const q1Yes = newAnswers[q1Id] === 'yes';
      const q2Yes = newAnswers[q2Id] === 'yes';
      const q3Yes = newAnswers[q3Id] === 'yes';
      let score = 40;
      if (q1Yes) score += 20;
      if (q2Yes) score += 20;
      if (q3Yes) score += 20;
      return score;
    };

    const fairness = computeCategoryScore('f1', 'f2', 'f3');
    const transparency = computeCategoryScore('t1', 't2', 't3');
    const privacy = computeCategoryScore('p1', 'p2', 'p3');
    const security = computeCategoryScore('s1', 's2', 's3');

    const weightedNgs = (fairness * 0.20) + (transparency * 0.25) + (privacy * 0.20) + (security * 0.35);

    let overallGrade: 'Excellent' | 'Good' | 'Moderate' | 'High Risk' = 'Moderate';
    if (weightedNgs >= 90) overallGrade = 'Excellent';
    else if (weightedNgs >= 75) overallGrade = 'Good';
    else if (weightedNgs >= 50) overallGrade = 'Moderate';
    else overallGrade = 'High Risk';

    const newScore: ComplianceScore = {
      fairness,
      transparency,
      accountability: transparency, // Maintain compatibility
      privacy,
      security,
      overallGrade
    };

    onUpdateCompliance(selectedProjectId, newScore);
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      case 'Good':
        return <Award className="w-8 h-8 text-emerald-400" />;
      case 'Moderate':
        return <Info className="w-8 h-8 text-amber-400" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-400" />;
    }
  };

  const getGradeClass = (grade: string) => {
    switch (grade) {
      case 'Excellent': return 'badge-success';
      case 'Good': return 'badge-info';
      case 'Moderate': return 'badge-warning';
      default: return 'badge-danger';
    }
  };

  const getCategoryTitle = (cat: 'fairness' | 'transparency' | 'privacy' | 'security') => {
    if (cat === 'fairness') {
      return framework === 'Ghana' ? 'Fairness & Tribal Equity (20% Weight)' : 'Fairness & Demographic Equity (20% Weight)';
    }
    if (cat === 'transparency') {
      return 'Transparency & Explainability (25% Weight)';
    }
    if (cat === 'privacy') {
      if (framework === 'Ghana') return 'Citizen Privacy & Act 843 Compliance (20% Weight)';
      if (framework === 'European Union') return 'Citizen Privacy & GDPR Compliance (20% Weight)';
      if (framework === 'United States') return 'Citizen Privacy & HIPAA/CCPA Compliance (20% Weight)';
      return 'Citizen Privacy & ISO/IEC Compliance (20% Weight)';
    }
    if (cat === 'security') {
      if (framework === 'Ghana') return 'Cybersecurity & Act 1038 Prevention (35% Weight)';
      if (framework === 'European Union') return 'Cybersecurity & CE Certification (35% Weight)';
      if (framework === 'United States') return 'Cybersecurity & NIST Framework (35% Weight)';
      return 'Cybersecurity & Threat Prevention (35% Weight)';
    }
    return '';
  };

  const canAudit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);

  const renderQuestionGroup = (cat: 'fairness' | 'transparency' | 'privacy' | 'security') => {
    const colorMap = {
      fairness: 'var(--ghana-emerald)',
      transparency: '#38bdf8',
      privacy: '#fb7185',
      security: '#f43f5e'
    };

    return (
      <div key={cat} style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          fontSize: '0.82rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: colorMap[cat] || 'var(--ghana-emerald)', 
          marginBottom: '10px' 
        }}>
          {getCategoryTitle(cat)}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(frameworkQuestions[framework] || frameworkQuestions['Ghana'])
            .filter(q => q.category === cat)
            .map(q => {
              const isYes = answers[q.id] === 'yes';
              const isNo = answers[q.id] === 'no';
              return (
                <div 
                  key={q.id}
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '12px 16px', 
                    background: 'rgba(0,0,0,0.15)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '8px',
                    fontSize: '0.85rem'
                  }}
                >
                  <span style={{ 
                    color: isYes ? 'var(--text-primary)' : 'var(--text-secondary)',
                    lineHeight: '1.4',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap'
                  }}>
                    {q.text}
                    {/* Glassmorphic Tooltip on hover */}
                    <span className="tooltip-container">
                      <Info 
                        className="w-4 h-4 text-sky-400 cursor-help hover:text-sky-300" 
                        style={{ marginLeft: '6px', opacity: 0.7 }} 
                      />
                      <span className="tooltip-text">
                        <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Parameter Explanation:</strong>
                        {q.description}
                      </span>
                    </span>
                  </span>
                  
                  {/* Metadata Format Options (Yes/No Radio Buttons) */}
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button
                      onClick={() => handleAnswerChange(q.id, 'yes')}
                      disabled={!canAudit}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid ' + (isYes ? '#10b981' : 'rgba(255,255,255,0.08)'),
                        background: isYes ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.01)',
                        color: isYes ? '#34d399' : 'var(--text-muted)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: canAudit ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                        boxShadow: isYes ? '0 0 8px rgba(16, 185, 129, 0.2)' : 'none'
                      }}
                    >
                      YES
                    </button>
                    <button
                      onClick={() => handleAnswerChange(q.id, 'no')}
                      disabled={!canAudit}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid ' + (isNo ? '#f43f5e' : 'rgba(255,255,255,0.08)'),
                        background: isNo ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.01)',
                        color: isNo ? '#fb7185' : 'var(--text-muted)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: canAudit ? 'pointer' : 'default',
                        transition: 'all 0.15s ease',
                        boxShadow: isNo ? '0 0 8px rgba(244, 63, 94, 0.2)' : 'none'
                      }}
                    >
                      NO
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  const calculatedScore = activeProject
    ? (activeProject.compliance.fairness * 0.20) + 
      (activeProject.compliance.transparency * 0.25) + 
      (activeProject.compliance.privacy * 0.20) + 
      (activeProject.compliance.security * 0.35)
    : 0;

  return (
    <div>
      {/* Inject custom tooltip styles */}
      <style>{tooltipStyles}</style>

      {/* Target Selector */}
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Governance & Ethical Scorecard</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Audit algorithm compliance against dynamic legislative acts and global AI frameworks
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Select Project:
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="form-select"
            style={{ width: '220px', padding: '8px 12px' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeProject && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT PANEL: Ethical Question Checklists */}
          <div className="glass-card">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              borderBottom: '1px solid var(--border-color)', 
              paddingBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Audit Verification Checklist
                </h3>
                {!canAudit && (
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Read-only Mode</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Framework:</span>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="form-select"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.78rem', 
                    borderRadius: '6px', 
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    width: '180px'
                  }}
                >
                  <option value="Ghana">🇬🇭 Ghana (DPA / Cybersecurity)</option>
                  <option value="European Union">🇪🇺 European Union (EU AI Act / GDPR)</option>
                  <option value="United States">🇺🇸 United States (NIST / HIPAA)</option>
                  <option value="Global Standards (ISO)">🌐 Global Standards (ISO/IEC)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderQuestionGroup('fairness')}
              {renderQuestionGroup('transparency')}
              {renderQuestionGroup('privacy')}
              {renderQuestionGroup('security')}
            </div>
          </div>

          {/* RIGHT PANEL: Live NGS Scorecard gauge & summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                {getGradeIcon(activeProject.compliance.overallGrade)}
              </div>
              
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Compliance Grading
              </div>
              
              <div style={{ margin: '8px 0' }}>
                <span className={`badge ${getGradeClass(activeProject.compliance.overallGrade)}`} style={{ fontSize: '1rem', padding: '6px 18px' }}>
                  {activeProject.compliance.overallGrade}
                </span>
              </div>

              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: '12px' }}>
                {calculatedScore.toFixed(0)}%
              </div>
              
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Weighted National Governance Score (NGS)
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Pillar Statistics Breakdown</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Fairness indicator */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Fairness & Inclusivity (20%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.fairness}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.fairness}%`, height: '100%', background: 'var(--ghana-emerald)', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Transparency */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Transparency & Explainability (25%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.transparency}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.transparency}%`, height: '100%', background: '#38bdf8', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Privacy & Data Security (20%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.privacy}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.privacy}%`, height: '100%', background: '#fb7185', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Security & Threat Resistance (35%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.security}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.security}%`, height: '100%', background: '#f43f5e', borderRadius: '99px' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
