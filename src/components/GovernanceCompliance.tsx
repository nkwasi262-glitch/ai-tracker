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
}

const frameworkQuestions: Record<string, AuditQuestion[]> = {
  Ghana: [
    { id: 'f1', category: 'fairness', text: 'Training datasets evaluated and balanced across all 16 Ghanaian regions to prevent regional bias.' },
    { id: 'f2', category: 'fairness', text: 'Model algorithms tested for gender and tribal label parity (e.g. Twi/Fante speech samples equal representation).' },
    { id: 't1', category: 'transparency', text: 'Comprehensive Model Card detailing neural architecture, hyper-parameters, and limitations published.' },
    { id: 't2', category: 'transparency', text: 'Source dataset origins and labeling metadata catalogued and accessible for civil audits.' },
    { id: 'p1', category: 'privacy', text: 'Data Protection Officer (DPO) appointed and officially registered under the Ghana Data Protection Commission.' },
    { id: 'p2', category: 'privacy', text: 'All personal records (PII) anonymized at database ingestion using salted cryptographic hashing (SHA-256).' },
    { id: 's1', category: 'security', text: 'System source code audited and certified against OWASP Top 10 vulnerabilities.' },
    { id: 's2', category: 'security', text: 'Semi-annual third-party penetration testing program and CVE logging scheduled under Act 1038.' }
  ],
  'European Union': [
    { id: 'f1', category: 'fairness', text: 'Algorithmic bias assessments conducted on protected characteristics (gender, race, ethnicity) under EU AI Act guidelines.' },
    { id: 'f2', category: 'fairness', text: 'Representative dataset sampling to prevent discrimination against minority linguistic groups in Europe.' },
    { id: 't1', category: 'transparency', text: 'High-risk AI system registry filing completed and model documentation submitted to EU database.' },
    { id: 't2', category: 'transparency', text: 'Downstream user explainability interface provided, stating how output is generated and how to override it.' },
    { id: 'p1', category: 'privacy', text: 'Data Protection Impact Assessment (DPIA) performed and GDPR-compliant consent flow implemented.' },
    { id: 'p2', category: 'privacy', text: '"Right to be forgotten" mechanisms verified, enabling complete erasure of user records within 30 days.' },
    { id: 's1', category: 'security', text: 'Automated vulnerability reporting and CE mark certification workflows active.' },
    { id: 's2', category: 'security', text: 'Incident response protocols established, with 72-hour regulatory notification capability for breaches.' }
  ],
  'United States': [
    { id: 'f1', category: 'fairness', text: 'Algorithmic impact assessments performed to evaluate civil rights impacts and disparate treatment.' },
    { id: 'f2', category: 'fairness', text: 'Disparate impact ratio tests executed for hiring, lending, or public assistance scoring algorithms.' },
    { id: 't1', category: 'transparency', text: 'AI system registry and public disclosure of generative model training dataset sources maintained.' },
    { id: 't2', category: 'transparency', text: 'NIST AI RMF compliance card generated, explaining risk mitigation profiles and training data provenance.' },
    { id: 'p1', category: 'privacy', text: 'HIPAA-compliant Business Associate Agreements (BAA) signed, or CCPA/CPRA data mapping active.' },
    { id: 'p2', category: 'privacy', text: 'Opt-out registry for data sharing and machine learning training queries implemented.' },
    { id: 's1', category: 'security', text: 'System meets NIST SP 800-53 security controls, with threat modeling performed on training pipelines.' },
    { id: 's2', category: 'security', text: 'FedRAMP / SOC 2 Type II audit report filed, and red-teaming exercises conducted for prompt injection vulnerabilities.' }
  ],
  'Global Standards (ISO)': [
    { id: 'f1', category: 'fairness', text: 'Algorithmic Fairness management policies established per ISO/IEC 42001 Annex A controls.' },
    { id: 'f2', category: 'fairness', text: 'Systematic bias monitoring systems operational in production pipelines to flag drifting predictions.' },
    { id: 't1', category: 'transparency', text: 'System documentation and transparency statements published explaining AI capability boundaries.' },
    { id: 't2', category: 'transparency', text: 'Explainability logs maintained, allowing traceability of algorithmic logic for audit trails.' },
    { id: 'p1', category: 'privacy', text: 'Privacy Information Management System (PIMS) audited against ISO/IEC 27701.' },
    { id: 'p2', category: 'privacy', text: 'Cross-border data transfer compliance and automated data minimisation criteria active.' },
    { id: 's1', category: 'security', text: 'Information Security Management System (ISMS) certified against ISO/IEC 27001.' },
    { id: 's2', category: 'security', text: 'Threat vector analysis for adversarial attacks (data poisoning, model inversion) updated quarterly.' }
  ]
};

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
      f1: score.fairness >= 75 ? 'yes' : 'no',
      f2: score.fairness >= 90 ? 'yes' : 'no',
      t1: score.transparency >= 75 ? 'yes' : 'no',
      t2: score.transparency >= 90 ? 'yes' : 'no',
      p1: score.privacy >= 75 ? 'yes' : 'no',
      p2: score.privacy >= 90 ? 'yes' : 'no',
      s1: score.security >= 75 ? 'yes' : 'no',
      s2: score.security >= 90 ? 'yes' : 'no',
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

    const computeCategoryScore = (q1Id: string, q2Id: string) => {
      const q1Yes = newAnswers[q1Id] === 'yes';
      const q2Yes = newAnswers[q2Id] === 'yes';
      let score = 50;
      if (q1Yes) score += 25;
      if (q2Yes) score += 25;
      return score;
    };

    const fairness = computeCategoryScore('f1', 'f2');
    const transparency = computeCategoryScore('t1', 't2');
    const privacy = computeCategoryScore('p1', 'p2');
    const security = computeCategoryScore('s1', 's2');

    // New Weighted formula: Fairness (20%), Transparency (25%), Privacy (20%), Security (35%)
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
                    flex: 1
                  }}>
                    {q.text}
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
