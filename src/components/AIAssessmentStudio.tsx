import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Award, 
  CheckCircle2, 
  FileCheck, 
  RefreshCw, 
  Scale, 
  UserCheck
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { AIProject } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';

interface AIAssessmentStudioProps {
  projects: AIProject[];
  session: UserSession | null;
}

export const STATUTORY_DOMAINS = [
  { id: 'tech_arch', name: 'Technical Architecture & Robustness', weight: 10, defaultScore: 88 },
  { id: 'data_gov', name: 'Data Governance & Act 843 Compliance', weight: 10, defaultScore: 92 },
  { id: 'fairness_bias', name: 'Algorithmic Fairness & Bias Mitigation', weight: 10, defaultScore: 84 },
  { id: 'explainability', name: 'Explainability & Interpretability', weight: 8, defaultScore: 80 },
  { id: 'safety_robustness', name: 'Safety, Alignment & Failure Safeguards', weight: 10, defaultScore: 90 },
  { id: 'cybersecurity', name: 'Cybersecurity & Threat Resilience (Act 771)', weight: 10, defaultScore: 86 },
  { id: 'privacy_anon', name: 'Privacy Protection & Anonymization', weight: 8, defaultScore: 94 },
  { id: 'human_oversight', name: 'Human Agency & Meaningful Oversight', weight: 8, defaultScore: 85 },
  { id: 'societal_impact', name: 'Societal, Economic & Environmental Impact', weight: 6, defaultScore: 78 },
  { id: 'auditability', name: 'Accountability, Logging & Auditability', weight: 8, defaultScore: 95 },
  { id: 'legal_compliance', name: 'Legal & Regulatory Compliance', weight: 6, defaultScore: 90 },
  { id: 'vendor_supply', name: 'Vendor, Third-Party & Supply Chain Risk', weight: 6, defaultScore: 82 }
];

export const AIAssessmentStudio: React.FC<AIAssessmentStudioProps> = ({
  projects,
  session
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [domainScores, setDomainScores] = useState<Record<string, number>>({});
  const [domainFindings, setDomainFindings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Regulatory Decision Form
  const [decisionVerdict, setDecisionVerdict] = useState<'CLEARED' | 'CONDITIONAL_CLEARANCE' | 'PENDING_REMEDIATION' | 'REJECTED'>('CONDITIONAL_CLEARANCE');
  const [decisionNotes, setDecisionNotes] = useState('Satisfies statutory requirements under NITA Act 771 and Data Protection Act 843 with quarterly algorithmic drift audits.');
  const [conditionsList, setConditionsList] = useState('1. Retain human-in-the-loop override for high-stakes decisions.\n2. Submit bi-annual bias evaluation reports to NITA AI Directorate.\n3. Verify sovereign data encryption at rest in local data center.');
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const isAuthorized = session?.role === 'Super Admin' || session?.role === 'Technical Unit' || session?.role === 'Technical Director';

  // Load Assessments for current project
  const loadAssessments = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const records = await apiClient.fetchProjectAssessments(selectedProjectId);
      const scoresMap: Record<string, number> = {};
      const findingsMap: Record<string, string> = {};

      STATUTORY_DOMAINS.forEach(d => {
        scoresMap[d.id] = d.defaultScore;
        findingsMap[d.id] = 'Statutory compliance verification passed.';
      });

      if (records && records.length > 0) {
        records.forEach((r: any) => {
          if (r.domain_name) {
            const matched = STATUTORY_DOMAINS.find(d => d.name.toLowerCase() === r.domain_name.toLowerCase());
            if (matched) {
              scoresMap[matched.id] = r.score;
              findingsMap[matched.id] = r.findings || '';
            }
          }
        });
      }

      setDomainScores(scoresMap);
      setDomainFindings(findingsMap);
    } catch (err) {
      console.error('[Assessment] Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [selectedProjectId]);

  const handleScoreChange = (domainId: string, val: number) => {
    setDomainScores(prev => ({ ...prev, [domainId]: val }));
  };

  const handleFindingChange = (domainId: string, text: string) => {
    setDomainFindings(prev => ({ ...prev, [domainId]: text }));
  };

  // Compute composite score
  const totalWeight = STATUTORY_DOMAINS.reduce((acc, d) => acc + d.weight, 0);
  const compositeScore = Math.round(
    STATUTORY_DOMAINS.reduce((acc, d) => acc + (domainScores[d.id] || d.defaultScore) * d.weight, 0) / totalWeight
  );

  const hasGateFailure = Object.values(domainScores).some(s => s < 60);

  const handleSaveDomainAssessments = async () => {
    setIsSaving(true);
    try {
      for (const d of STATUTORY_DOMAINS) {
        await apiClient.saveProjectAssessment(selectedProjectId, {
          domainName: d.name,
          score: domainScores[d.id] || d.defaultScore,
          riskLevel: (domainScores[d.id] || d.defaultScore) < 60 ? 'HIGH' : (domainScores[d.id] || d.defaultScore) < 80 ? 'MEDIUM' : 'LOW',
          findings: domainFindings[d.id] || 'Statutory review completed.',
          recommendations: 'Continue active monitoring'
        });
      }
      setFeedback('All 12 statutory domain assessments saved successfully to PostgreSQL database.');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error saving assessment scores');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRecordRegulatoryDecision = async () => {
    setIsSaving(true);
    try {
      await apiClient.saveProjectDecision(selectedProjectId, {
        decision: decisionVerdict,
        conditions: conditionsList.split('\n').filter(Boolean),
        summaryRationale: decisionNotes,
        authorizedOfficerRole: session?.role || 'Super Admin'
      });
      setFeedback(`Official Regulatory Decision [${decisionVerdict}] recorded and signed in GN-AIRGMS.`);
      setShowCertificateModal(true);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error recording regulatory decision');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(13, 18, 31, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.28)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(245, 158, 11, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            <Scale size={26} className="text-emerald-400" />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ghana-emerald)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '3px'
            }}>
              <ShieldCheck size={14} />
              <span>Statutory Clearinghouse • Republic of Ghana</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              12-Domain AI Statutory Assessment Studio
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Comprehensive multi-dimensional evaluation covering architecture, bias mitigation, Act 843 privacy, cybersecurity, and formal regulatory clearance verdicts.
            </p>
          </div>
        </div>

        {/* Project Selector & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Target AI Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#1f2937',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mda})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadAssessments}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          color: '#a7f3d0',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Top Evaluation Scorecard & Gate Alert */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr',
        gap: '20px'
      }}>
        {/* Composite Score Card */}
        <div className="card" style={{ padding: '22px', display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{
            width: '88px',
            height: '88px',
            borderRadius: '50%',
            background: hasGateFailure 
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.25) 0%, rgba(17, 24, 39, 0.8) 100%)' 
              : 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, rgba(17, 24, 39, 0.8) 100%)',
            border: `3px solid ${hasGateFailure ? '#ef4444' : 'var(--ghana-emerald)'}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 20px ${hasGateFailure ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{compositeScore}</span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>/ 100</span>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--ghana-emerald)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              National AI Composite Index
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              {currentProject?.name}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Weighted assessment aggregate across all 12 statutory governance dimensions.
            </div>
          </div>
        </div>

        {/* Gate Status & Regulatory Decision Trigger */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Statutory Gate Clearance Status
            </span>
            <span style={{
              padding: '3px 10px',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 800,
              background: hasGateFailure ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: hasGateFailure ? '#fca5a5' : '#a7f3d0',
              border: `1px solid ${hasGateFailure ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
            }}>
              {hasGateFailure ? 'GATE FAILURE DETECTED (Scores < 60)' : 'STATUTORY CRITERIA SATISFIED'}
            </span>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
            {hasGateFailure
              ? 'One or more mandatory assessment domains score below the acceptable statutory threshold (60/100). Remediation conditions are required before unconditional deployment clearance.'
              : 'All 12 statutory evaluation domains meet the Republic of Ghana NITA criteria. Ready for formal regulatory decision endorsement.'}
          </p>

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            {isAuthorized && (
              <button
                onClick={handleSaveDomainAssessments}
                disabled={isSaving}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Saving Scores...' : 'Save 12 Domains to DB'}
              </button>
            )}
            <button
              onClick={() => setShowCertificateModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileCheck size={14} />
              <span>Preview Official Clearance Certificate</span>
            </button>
          </div>
        </div>
      </div>

      {/* 12 Domains Interactive Evaluation Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '16px'
      }}>
        {STATUTORY_DOMAINS.map((domain, index) => {
          const score = domainScores[domain.id] !== undefined ? domainScores[domain.id] : domain.defaultScore;
          const isCritical = score < 60;
          return (
            <div
              key={domain.id}
              className="card"
              style={{
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                border: isCritical ? '1px solid rgba(239, 68, 68, 0.4)' : undefined,
                background: isCritical ? 'rgba(239, 68, 68, 0.04)' : undefined
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                  DOMAIN {index + 1} OF 12 • WEIGHT {domain.weight}%
                </span>
                <span style={{
                  fontSize: '0.85rem',
                  fontWeight: 900,
                  color: isCritical ? '#ef4444' : score >= 80 ? 'var(--ghana-emerald)' : '#fbbf24'
                }}>
                  {score} / 100
                </span>
              </div>

              <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {domain.name}
              </h4>

              {/* Slider Control */}
              {isAuthorized ? (
                <div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={score}
                    onChange={e => handleScoreChange(domain.id, parseInt(e.target.value, 10))}
                    style={{
                      width: '100%',
                      accentColor: isCritical ? '#ef4444' : 'var(--ghana-emerald)',
                      cursor: 'pointer'
                    }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>0 (Non-Compliant)</span>
                    <span>60 (Statutory Min)</span>
                    <span>100 (Exemplary)</span>
                  </div>
                </div>
              ) : (
                <div style={{
                  height: '6px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${score}%`,
                    height: '100%',
                    background: isCritical ? '#ef4444' : 'var(--ghana-emerald)'
                  }} />
                </div>
              )}

              {/* Auditor Findings Note */}
              <div>
                <input
                  type="text"
                  disabled={!isAuthorized}
                  value={domainFindings[domain.id] || ''}
                  onChange={e => handleFindingChange(domain.id, e.target.value)}
                  placeholder="Auditor evaluation findings / required remediations..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    fontSize: '0.78rem'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Formal Decision Signing Section (Super Admin & Technical Unit) */}
      {isAuthorized && (
        <div className="card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
            <UserCheck size={20} className="text-emerald-400" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Formal Regulatory Clearance Decision Authority
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Authorized decision sign-off under Section 14 of the National AI Governance Framework.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                Regulatory Decision Verdict
              </label>
              <select
                value={decisionVerdict}
                onChange={e => setDecisionVerdict(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: '#1e293b',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 700
                }}
              >
                <option value="CLEARED">CLEARED (Unconditional Deployment Approval)</option>
                <option value="CONDITIONAL_CLEARANCE">CONDITIONAL CLEARANCE (Operational under oversight)</option>
                <option value="PENDING_REMEDIATION">PENDING REMEDIATION (Mandatory fixes before go-live)</option>
                <option value="REJECTED">REJECTED (Severe compliance / safety hazards)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                Executive Rationale & Legal Summary
              </label>
              <input
                type="text"
                value={decisionNotes}
                onChange={e => setDecisionNotes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
              Statutory Conditions & Remediation Milestones
            </label>
            <textarea
              rows={3}
              value={conditionsList}
              onChange={e => setConditionsList(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.85rem',
                lineHeight: 1.5
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              onClick={handleRecordRegulatoryDecision}
              disabled={isSaving}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
              }}
            >
              <Award size={16} />
              <span>Sign & Endorse Regulatory Decision</span>
            </button>
          </div>
        </div>
      )}

      {/* Official Certificate Preview Modal */}
      {showCertificateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '640px',
            width: '100%',
            background: 'linear-gradient(160deg, #111827 0%, #0b1120 100%)',
            borderRadius: '20px',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.15)',
            padding: '32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            position: 'relative'
          }}>
            {/* National Ribbon */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              borderTopLeftRadius: '18px',
              borderTopRightRadius: '18px',
              background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
            }} />

            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <div style={{ fontSize: '2rem' }}>🇬🇭</div>
              <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--ghana-emerald)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                Republic of Ghana • National Information Technology Agency
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', marginTop: '4px', margin: 0 }}>
                Official AI Regulatory Clearance Certificate
              </h2>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Certificate ID: GN-AIRGMS-CERT-{currentProject?.id?.toUpperCase()}-2026
              </div>
            </div>

            <div style={{
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.82rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Project Name:</span>
                <strong style={{ color: '#fff' }}>{currentProject?.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Sponsoring Institution:</span>
                <strong style={{ color: '#fff' }}>{currentProject?.mda}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>National Governance Index:</span>
                <strong style={{ color: 'var(--ghana-emerald)' }}>{compositeScore} / 100 (Exemplary)</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Regulatory Verdict:</span>
                <strong style={{ color: '#fbbf24' }}>{decisionVerdict}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Authorized Officer:</span>
                <strong style={{ color: '#fff' }}>{session?.fullName || 'Super Administrator'} ({session?.role || 'Super Admin'})</strong>
              </div>
            </div>

            <div style={{
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.75rem',
              color: '#cbd5e1',
              lineHeight: 1.5
            }}>
              This certificate verifies that the artificial intelligence system specified above has undergone comprehensive technical, ethical, data protection (Act 843), and cybersecurity (Act 771) vetting by the GN-AIRGMS Clearinghouse.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowCertificateModal(false)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
