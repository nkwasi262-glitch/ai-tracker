import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, AlertTriangle, CheckSquare, Square, Info } from 'lucide-react';
import { AIProject, ComplianceScore } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface GovernanceComplianceProps {
  projects: AIProject[];
  onUpdateCompliance: (projectId: string, newScore: ComplianceScore) => void;
  currentRole: UserRole;
}

interface ChecklistItem {
  id: string;
  category: 'fairness' | 'transparency' | 'accountability' | 'privacy' | 'security';
  text: string;
  points: number;
}

export const GovernanceCompliance: React.FC<GovernanceComplianceProps> = ({
  projects,
  onUpdateCompliance,
  currentRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Core assessment checklist items
  const auditQuestions: ChecklistItem[] = [
    // Fairness
    { id: 'f1', category: 'fairness', text: 'Training datasets evaluated and balanced across all 16 Ghanaian regions to prevent regional bias.', points: 10 },
    { id: 'f2', category: 'fairness', text: 'Model algorithms tested for gender and tribal label parity (e.g. Twi/Fante speech samples equal representation).', points: 10 },
    // Transparency
    { id: 't1', category: 'transparency', text: 'Comprehensive Model Card detailing neural architecture, hyper-parameters, and limitations published.', points: 10 },
    { id: 't2', category: 'transparency', text: 'Source dataset origins and labeling metadata catalogued and accessible for civil audits.', points: 10 },
    // Accountability
    { id: 'a1', category: 'accountability', text: 'Human-in-the-loop escalation workflow established with designated human operators (DHO) taking legal charge.', points: 10 },
    { id: 'a2', category: 'accountability', text: 'Model output explanation summaries generated automatically for end-users to prevent blind trust.', points: 10 },
    // Privacy
    { id: 'p1', category: 'privacy', text: 'Data Protection Officer (DPO) appointed and officially registered under the Ghana Data Protection Commission.', points: 10 },
    { id: 'p2', category: 'privacy', text: 'All personal records (PII) anonymized at database ingestion using salted cryptographic hashing (SHA-256).', points: 10 },
    // Security
    { id: 's1', category: 'security', text: 'System source code audited and certified against OWASP Top 10 vulnerabilities.', points: 10 },
    { id: 's2', category: 'security', text: 'Semi-annual third-party penetration testing program and CVE logging scheduled.', points: 10 }
  ];

  // Map checklist checked states
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // Automatically update checkboxes based on the selected project compliance score
  useEffect(() => {
    if (!activeProject) return;
    const score = activeProject.compliance;
    const initialChecked: string[] = [];

    // Fairness mapping
    if (score.fairness >= 80) { initialChecked.push('f1', 'f2'); }
    else if (score.fairness >= 50) { initialChecked.push('f1'); }

    // Transparency
    if (score.transparency >= 80) { initialChecked.push('t1', 't2'); }
    else if (score.transparency >= 50) { initialChecked.push('t1'); }

    // Accountability
    if (score.accountability >= 80) { initialChecked.push('a1', 'a2'); }
    else if (score.accountability >= 50) { initialChecked.push('a1'); }

    // Privacy
    if (score.privacy >= 80) { initialChecked.push('p1', 'p2'); }
    else if (score.privacy >= 50) { initialChecked.push('p1'); }

    // Security
    if (score.security >= 80) { initialChecked.push('s1', 's2'); }
    else if (score.security >= 50) { initialChecked.push('s1'); }

    setCheckedIds(initialChecked);
  }, [selectedProjectId]);

  // Recalculates compliance scores based on toggled checkboxes
  const handleToggle = (id: string) => {
    // Only administrators or auditors can perform audits
    const canAudit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);
    if (!canAudit) return;

    const newChecked = checkedIds.includes(id)
      ? checkedIds.filter(x => x !== id)
      : [...checkedIds, id];

    setCheckedIds(newChecked);

    // Compute category scores
    const computeCategoryScore = (cat: string) => {
      const catQuestions = auditQuestions.filter(q => q.category === cat);
      const checkedCatQuestions = catQuestions.filter(q => newChecked.includes(q.id));
      // Base score is 50, each checked item adds 25 points to cap at 100
      return 50 + (checkedCatQuestions.length * 25);
    };

    const fairness = computeCategoryScore('fairness');
    const transparency = computeCategoryScore('transparency');
    const accountability = computeCategoryScore('accountability');
    const privacy = computeCategoryScore('privacy');
    const security = computeCategoryScore('security');

    // Formula: weights * pillar scores
    const weightedNgs = (fairness * 0.20) + (accountability * 0.15) + (transparency * 0.15) + (privacy * 0.20) + (security * 0.30);

    let overallGrade: 'Excellent' | 'Good' | 'Moderate' | 'High Risk' = 'Moderate';
    if (weightedNgs >= 90) overallGrade = 'Excellent';
    else if (weightedNgs >= 75) overallGrade = 'Good';
    else if (weightedNgs >= 50) overallGrade = 'Moderate';
    else overallGrade = 'High Risk';

    const newScore: ComplianceScore = {
      fairness,
      transparency,
      accountability,
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

  // Check write permissions
  const canAudit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);

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
            Audit algorithm compliance against Ghanaian legislative acts and national AI policy guidelines
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                Audit Verification Checklist
              </h3>
              {!canAudit && (
                <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Read-only Mode</span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Category: Fairness */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ghana-emerald)', marginBottom: '10px' }}>
                  Fairness & Tribal Equity (20% Weight)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditQuestions.filter(q => q.category === 'fairness').map(q => (
                    <div 
                      key={q.id}
                      onClick={() => handleToggle(q.id)}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '12px', 
                        background: 'rgba(0,0,0,0.15)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px',
                        cursor: canAudit ? 'pointer' : 'default',
                        fontSize: '0.85rem',
                        alignItems: 'center'
                      }}
                    >
                      {checkedIds.includes(q.id) ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      )}
                      <span style={{ color: checkedIds.includes(q.id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Transparency */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ghana-emerald)', marginBottom: '10px' }}>
                  Transparency & Explainability (25% Weight)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditQuestions.filter(q => q.category === 'transparency' || q.category === 'accountability').slice(0,2).map(q => (
                    <div 
                      key={q.id}
                      onClick={() => handleToggle(q.id)}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '12px', 
                        background: 'rgba(0,0,0,0.15)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px',
                        cursor: canAudit ? 'pointer' : 'default',
                        fontSize: '0.85rem',
                        alignItems: 'center'
                      }}
                    >
                      {checkedIds.includes(q.id) ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      )}
                      <span style={{ color: checkedIds.includes(q.id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Privacy */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ghana-emerald)', marginBottom: '10px' }}>
                  Citizen Privacy & Act 843 Compliance (20% Weight)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditQuestions.filter(q => q.category === 'privacy').map(q => (
                    <div 
                      key={q.id}
                      onClick={() => handleToggle(q.id)}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '12px', 
                        background: 'rgba(0,0,0,0.15)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px',
                        cursor: canAudit ? 'pointer' : 'default',
                        fontSize: '0.85rem',
                        alignItems: 'center'
                      }}
                    >
                      {checkedIds.includes(q.id) ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      )}
                      <span style={{ color: checkedIds.includes(q.id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category: Security */}
              <div>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--ghana-emerald)', marginBottom: '10px' }}>
                  Cybersecurity & Damaging Threats Prevention (35% Weight)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditQuestions.filter(q => q.category === 'security' || q.category === 'accountability').slice(2, 4).map(q => (
                    <div 
                      key={q.id}
                      onClick={() => handleToggle(q.id)}
                      style={{ 
                        display: 'flex', 
                        gap: '12px', 
                        padding: '12px', 
                        background: 'rgba(0,0,0,0.15)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px',
                        cursor: canAudit ? 'pointer' : 'default',
                        fontSize: '0.85rem',
                        alignItems: 'center'
                      }}
                    >
                      {checkedIds.includes(q.id) ? (
                        <CheckSquare className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-500 flex-shrink-0" />
                      )}
                      <span style={{ color: checkedIds.includes(q.id) ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{q.text}</span>
                    </div>
                  ))}
                </div>
              </div>

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
                {((activeProject.compliance.fairness * 0.20) + 
                  (activeProject.compliance.transparency * 0.15) + 
                  (activeProject.compliance.accountability * 0.15) + 
                  (activeProject.compliance.privacy * 0.20) + 
                  (activeProject.compliance.security * 0.30)).toFixed(0)}%
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
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Fairness & Inclusivity</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.fairness}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.fairness}%`, height: '100%', background: 'var(--ghana-emerald)', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Transparency */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Transparency & Model Cards</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.transparency}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.transparency}%`, height: '100%', background: 'var(--ghana-emerald)', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Privacy & Data Anonymization</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.privacy}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.privacy}%`, height: '100%', background: 'var(--ghana-emerald)', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Security & Threat Resistance</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.security}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.security}%`, height: '100%', background: 'var(--ghana-emerald)', borderRadius: '99px' }}></div>
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
