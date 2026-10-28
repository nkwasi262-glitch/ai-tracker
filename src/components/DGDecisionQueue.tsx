import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  FileText, 
  ShieldCheck, 
  Clock, 
  FileCheck2,
  Stamp,
  AlertTriangle,
  MessageSquare,
  BookOpen
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset,
  DocumentReviewComment,
  ComplianceScore,
  ReviewWorkflowStatus 
} from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { DGVerdictDecision, DGVerdictRecord } from '../data/verdictTypes';
import { getDGVerdicts, recordDGVerdict } from '../services/verdictService';
import { canPerformAction } from '../services/rbacPolicy';
import { DocumentReviewGradeModal } from './DocumentReviewGradeModal';
import { getFullDocumentText } from '../services/assessmentEngine';

interface DGDecisionQueueProps {
  projects: AIProject[];
  session: UserSession;
  onUpdateProjectStatus: (projectId: string, newReviewStatus: ReviewWorkflowStatus, notes?: string) => void;
  onReviewDocument?: (
    projectId: string,
    docId: string,
    reviewComment: DocumentReviewComment,
    newCompliance?: ComplianceScore,
    newReadinessScore?: number,
    newProjectStatus?: ReviewWorkflowStatus
  ) => void;
}

export const DGDecisionQueue: React.FC<DGDecisionQueueProps> = ({
  projects,
  session,
  onUpdateProjectStatus,
  onReviewDocument
}) => {
  // Only projects that have been RECOMMENDED by technical clearance teams appear in the DG queue!
  const recommendedProjects = projects.filter(p => p.reviewStatus === 'Recommended');

  const [selectedProjectId, setSelectedProjectId] = useState<string>(recommendedProjects[0]?.id || '');
  const selectedProject = projects.find(p => p.id === selectedProjectId) || recommendedProjects[0];

  // Verdict state
  const [verdict, setVerdict] = useState<DGVerdictDecision>('Approve');
  const [mandatoryComments, setMandatoryComments] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'history'>('queue');
  const [verdictHistory, setVerdictHistory] = useState<DGVerdictRecord[]>(() => getDGVerdicts());
  const [reviewingDoc, setReviewingDoc] = useState<DocumentAsset | null>(null);
  const [expandedFullDocId, setExpandedFullDocId] = useState<string | null>(null);

  const canPassVerdict = canPerformAction(session.role, 'PASS_DG_VERDICT');

  const handleExecuteVerdict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;

    if (!mandatoryComments.trim() || mandatoryComments.trim().length < 20) {
      alert('Mandatory directive comments must contain at least 20 characters explaining the statutory rationale.');
      return;
    }

    setSubmitting(true);

    // Record formal verdict
    const newRecord = recordDGVerdict({
      projectId: selectedProject.id,
      projectCode: selectedProject.projectCode,
      projectName: selectedProject.name,
      mda: selectedProject.mda,
      verdict,
      mandatoryComments: mandatoryComments.trim(),
      reviewedByName: session.fullName,
      reviewedByRole: session.role === 'Super Admin' ? 'Super Admin' : 'Director General',
      reviewedByEmail: session.email,
      technicalRecommendationSummary: selectedProject.technicalReview?.recommendationNotes || 'Technical clearance validated.',
      complianceGradeAtReview: selectedProject.compliance.overallGrade,
      clearanceOfficer: selectedProject.technicalReview?.reviewerName || 'Technical Clearance Team'
    });

    // Update project state in central registry
    let targetStatus: AIProject['reviewStatus'] = 'Approved';
    if (verdict === 'Reject') targetStatus = 'Rejected';
    if (verdict === 'Return for Further Review') targetStatus = 'Returned';

    onUpdateProjectStatus(selectedProject.id, targetStatus);

    setVerdictHistory(prev => [newRecord, ...prev]);
    setSuccessFeedback(`Final Verdict "${verdict.toUpperCase()}" officially logged for ${selectedProject.projectCode}.`);
    setMandatoryComments('');
    setSubmitting(false);

    // Switch selection to next recommended item if available
    const remaining = recommendedProjects.filter(p => p.id !== selectedProject.id);
    if (remaining.length > 0) {
      setSelectedProjectId(remaining[0].id);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(251, 191, 36, 0.2)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ghana-gold)'
          }}>
            <Award size={28} />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ghana-gold)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              <span>Director General Executive Clearance Suite</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Recommended for Final Decision Queue
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Dossiers screened and recommended by Technical Clearance Teams awaiting statutory verdict.
            </p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveSubTab('queue')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeSubTab === 'queue' ? 'var(--ghana-gold)' : 'rgba(255, 255, 255, 0.05)',
              color: activeSubTab === 'queue' ? '#0b0f19' : 'var(--text-secondary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <FileCheck2 size={15} />
            <span>Active Queue ({recommendedProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: activeSubTab === 'history' ? 'var(--ghana-gold)' : 'rgba(255, 255, 255, 0.05)',
              color: activeSubTab === 'history' ? '#0b0f19' : 'var(--text-secondary)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Clock size={15} />
            <span>Verdict History ({verdictHistory.length})</span>
          </button>
        </div>
      </div>

      {/* Success Alert */}
      {successFeedback && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#a7f3d0',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle2 size={18} />
            <span>{successFeedback}</span>
          </div>
          <button
            onClick={() => setSuccessFeedback(null)}
            style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Mode 1: Active Decision Queue */}
      {activeSubTab === 'queue' && (
        <>
          {recommendedProjects.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--bg-card)',
              borderRadius: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <CheckCircle2 size={48} style={{ color: 'var(--ghana-emerald)', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>
                All Recommended Projects Cleared!
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '480px', margin: '0 auto' }}>
                There are currently no outstanding project dossiers awaiting Director General final verdict.
                Technical teams will push dossiers here once initial checks pass.
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px' }}>
              
              {/* Left Column: Dossier Selector */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Recommended Projects ({recommendedProjects.length})
                </div>

                {recommendedProjects.map((proj) => {
                  const isSelected = proj.id === selectedProject?.id;
                  return (
                    <div
                      key={proj.id}
                      onClick={() => setSelectedProjectId(proj.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(251, 191, 36, 0.1)' : 'var(--bg-card)',
                        border: isSelected ? '1px solid var(--ghana-gold)' : '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ghana-gold)' }}>
                          {proj.projectCode}
                        </span>
                        <span style={{
                          fontSize: '0.68rem',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: 'rgba(16, 185, 129, 0.15)',
                          color: '#10b981',
                          fontWeight: 700
                        }}>
                          {proj.compliance.overallGrade}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                        {proj.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {proj.mda}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Detailed Dossier & Decision Form */}
              {selectedProject && (
                <div style={{
                  background: 'var(--bg-card)',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '24px'
                }}>
                  {/* Dossier Header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        background: 'rgba(251, 191, 36, 0.15)',
                        color: 'var(--ghana-gold)',
                        fontWeight: 700,
                        fontSize: '0.76rem'
                      }}>
                        {selectedProject.projectCode}
                      </span>
                      <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                        {selectedProject.sector} Sector • {selectedProject.stage} Stage
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                      {selectedProject.name}
                    </h2>
                    <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.5 }}>
                      {selectedProject.description}
                    </p>
                  </div>

                  {/* Technical Clearance Officer Note */}
                  <div style={{
                    padding: '16px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={16} className="text-emerald-400" />
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a7f3d0' }}>
                          Technical Clearance Recommendation
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Cleared by: {selectedProject.technicalReview?.reviewerName || 'Technical Director'}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.82rem', color: '#e2e8f0', margin: 0, lineHeight: 1.4 }}>
                      "{selectedProject.technicalReview?.recommendationNotes || 'Statutory architecture validated against Act 843 and Ghana AI Ethical Guidelines.'}"
                    </p>
                  </div>

                  {/* Ethical Compliance Breakdown */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '12px'
                  }}>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Fairness</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{selectedProject.compliance.fairness}%</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Transparency</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{selectedProject.compliance.transparency}%</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Privacy (Act 843)</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{selectedProject.compliance.privacy}%</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Security</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>{selectedProject.compliance.security}%</div>
                    </div>
                    <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Allocated Capital</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
                        GHS {(selectedProject.budget.totalAllocated / 1000000).toFixed(1)}M
                      </div>
                    </div>
                  </div>

                  {/* Attached Documents */}
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      Attached Compliance Documents ({selectedProject.documents.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedProject.documents.map((doc) => {
                        const isFT = doc.isFirstTimerUpload || 
                          doc.uploadedByRole === 'First-Timer / New User' ||
                          doc.id.includes('onboard') ||
                          doc.signedBy?.includes('First-Timer / New User');

                        return (
                          <div
                            key={doc.id}
                            style={{
                              padding: '12px 14px',
                              borderRadius: '8px',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <FileText size={16} className="text-emerald-400 flex-shrink-0" />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>{doc.fileName}</span>
                                    {isFT && (
                                      <span style={{
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        background: 'rgba(251, 191, 36, 0.15)',
                                        border: '1px solid rgba(251, 191, 36, 0.35)',
                                        color: '#fde68a',
                                        fontSize: '0.64rem',
                                        fontWeight: 700
                                      }}>
                                        ⚡ Onboarder Submission
                                      </span>
                                    )}
                                    <span style={{
                                      padding: '1px 6px',
                                      borderRadius: '9999px',
                                      fontSize: '0.64rem',
                                      fontWeight: 700,
                                      background: doc.reviewStatus === 'Reviewed & Verified' ? 'rgba(16, 185, 129, 0.2)' :
                                                  doc.reviewStatus === 'Requires Re-submission' ? 'rgba(239, 68, 68, 0.2)' :
                                                  doc.reviewStatus === 'Under Review' ? 'rgba(59, 130, 246, 0.2)' :
                                                  'rgba(251, 191, 36, 0.2)',
                                      color: doc.reviewStatus === 'Reviewed & Verified' ? '#10b981' :
                                             doc.reviewStatus === 'Requires Re-submission' ? '#f87171' :
                                             doc.reviewStatus === 'Under Review' ? '#60a5fa' :
                                             '#fbbf24',
                                      border: '1px solid currentColor'
                                    }}>
                                      {doc.reviewStatus || 'Pending Review'}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    Uploaded {doc.uploadedAt} • Signed: {doc.signedBy.join(', ') || 'Pending'}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedFullDocId(expandedFullDocId === doc.id ? null : doc.id)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    background: expandedFullDocId === doc.id ? 'rgba(251, 191, 36, 0.22)' : 'rgba(59, 130, 246, 0.16)',
                                    border: expandedFullDocId === doc.id ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(59, 130, 246, 0.35)',
                                    color: expandedFullDocId === doc.id ? '#fde68a' : '#93c5fd',
                                    fontSize: '0.72rem',
                                    fontWeight: 700,
                                    cursor: 'pointer'
                                  }}
                                >
                                  <BookOpen size={13} />
                                  <span>{expandedFullDocId === doc.id ? 'Hide Full Document' : 'Read Full Uploaded Document'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setReviewingDoc(doc)}
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    padding: '5px 12px',
                                    borderRadius: '6px',
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.3))',
                                    border: '1px solid rgba(16, 185, 129, 0.5)',
                                    color: '#a7f3d0',
                                    fontSize: '0.74rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
                                  }}
                                >
                                  <Award size={13} />
                                  <span>Review, Grade & Comment (Full Doc)</span>
                                </button>
                              </div>
                            </div>

                            {expandedFullDocId === doc.id && (
                              <div style={{
                                marginTop: '6px',
                                padding: '12px 14px',
                                borderRadius: '8px',
                                background: 'rgba(5, 10, 20, 0.9)',
                                border: '1px solid rgba(251, 191, 36, 0.35)',
                                maxHeight: '280px',
                                overflowY: 'auto',
                                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                fontSize: '0.74rem',
                                lineHeight: 1.6,
                                color: '#e2e8f0',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {getFullDocumentText(doc, selectedProject)}
                              </div>
                            )}

                            {/* Existing Reviewer Comments */}
                            {doc.reviewerComments && doc.reviewerComments.length > 0 && (
                              <div style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                background: 'rgba(0, 0, 0, 0.35)',
                                border: '1px solid rgba(59, 130, 246, 0.25)',
                                fontSize: '0.74rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                                  <span style={{ color: '#93c5fd', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <MessageSquare size={12} />
                                    <span>{doc.reviewerComments[0].reviewerRole}: {doc.reviewerComments[0].reviewerName}</span>
                                  </span>
                                  <span style={{
                                    fontSize: '0.66rem',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    background: doc.reviewerComments[0].verdict === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: doc.reviewerComments[0].verdict === 'Approved' ? '#10b981' : '#f87171'
                                  }}>
                                    Verdict: {doc.reviewerComments[0].verdict}
                                  </span>
                                </div>
                                <div style={{ color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.4 }}>
                                  "{doc.reviewerComments[0].comment}"
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Zero-Assumption Pre-Clearance Audit Gate */}
                  <div style={{
                    padding: '16px 18px',
                    borderRadius: '12px',
                    background: selectedProject.budget?.hasAssumptionsFlag 
                      ? 'rgba(239, 68, 68, 0.08)' 
                      : 'rgba(16, 185, 129, 0.08)',
                    border: selectedProject.budget?.hasAssumptionsFlag 
                      ? '1px solid rgba(239, 68, 68, 0.35)' 
                      : '1px solid rgba(16, 185, 129, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {selectedProject.budget?.hasAssumptionsFlag ? (
                          <AlertTriangle size={18} className="text-red-400" />
                        ) : (
                          <ShieldCheck size={18} className="text-emerald-400" />
                        )}
                        <span style={{ 
                          fontSize: '0.82rem', 
                          fontWeight: 800, 
                          color: selectedProject.budget?.hasAssumptionsFlag ? '#fca5a5' : '#a7f3d0' 
                        }}>
                          {selectedProject.budget?.hasAssumptionsFlag 
                            ? '⚠️ Zero-Assumption Pre-Clearance Warning: Unverified Assumptions Present'
                            : '✓ Zero-Assumption Verified: All Statutory Evidence Confirmed'}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: selectedProject.zeroAssumptionAudit?.isFullyVerified ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: selectedProject.zeroAssumptionAudit?.isFullyVerified ? '#10b981' : '#f87171'
                      }}>
                        {selectedProject.zeroAssumptionAudit?.evidenceBackingScore ?? 45}% Primary Proof Ratio
                      </span>
                    </div>

                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.45 }}>
                      {selectedProject.budget?.hasAssumptionsFlag ? (
                        <>
                          <strong>Statutory Compliance Warning:</strong> This project contains self-reported financial disbursements or compliance metrics not yet validated by a Ministry of Finance Treasury Warrant or external audit. 
                          Under Ghana Public Financial Management Act (Act 921), unconditional approval without primary proof carries institutional liability.
                        </>
                      ) : (
                        <>
                          <strong>Statutory Certification:</strong> All capital expenditures are confirmed against MoF Treasury Warrant <code>{selectedProject.budget?.mofWarrantNumber}</code> and certified under Act 843. No self-reported assumptions remain.
                        </>
                      )}
                    </div>

                    {selectedProject.budget?.assumptionWarnings && selectedProject.budget.assumptionWarnings.length > 0 && (
                      <div style={{
                        fontSize: '0.72rem',
                        color: '#fca5a5',
                        background: 'rgba(0, 0, 0, 0.25)',
                        padding: '8px 12px',
                        borderRadius: '6px'
                      }}>
                        <strong>Unverified Claims to Resolve:</strong>
                        <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                          {selectedProject.budget.assumptionWarnings.map((warn, i) => (
                            <li key={i}>{warn}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedProject.budget?.hasAssumptionsFlag && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerdict('Return for Further Review');
                          setMandatoryComments(`Statutory clearance suspended under Act 921 / Act 843. Unverified assumptions detected: ${selectedProject.budget?.assumptionWarnings?.join('; ') || 'Disbursement claims and data protection filings lack primary documentary verification.'} Submitting MDA must provide official MoF Treasury Warrants and independent audit before final national registration.`);
                        }}
                        style={{
                          alignSelf: 'flex-start',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.2)',
                          border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#fca5a5',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Draft Return Directive: Demand MoF Warrant & Proof
                      </button>
                    )}
                  </div>

                  {/* Formal Decision Form */}
                  <form
                    onSubmit={handleExecuteVerdict}
                    style={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                      paddingTop: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '16px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                        Pass Statutory Verdict:
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: verdict === 'Approve' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: verdict === 'Approve' ? '1px solid var(--ghana-emerald)' : '1px solid rgba(255,255,255,0.1)',
                          color: verdict === 'Approve' ? '#a7f3d0' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          <input
                            type="radio"
                            name="verdict"
                            value="Approve"
                            checked={verdict === 'Approve'}
                            onChange={() => setVerdict('Approve')}
                            style={{ accentColor: 'var(--ghana-emerald)' }}
                          />
                          <CheckCircle2 size={16} className="text-emerald-400" />
                          <span>Approve for National Registry</span>
                        </label>

                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: verdict === 'Return for Further Review' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: verdict === 'Return for Further Review' ? '1px solid var(--ghana-gold)' : '1px solid rgba(255,255,255,0.1)',
                          color: verdict === 'Return for Further Review' ? '#fde68a' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          <input
                            type="radio"
                            name="verdict"
                            value="Return for Further Review"
                            checked={verdict === 'Return for Further Review'}
                            onChange={() => setVerdict('Return for Further Review')}
                            style={{ accentColor: 'var(--ghana-gold)' }}
                          />
                          <RotateCcw size={16} className="text-amber-400" />
                          <span>Return for Further Review</span>
                        </label>

                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '10px 16px',
                          borderRadius: '8px',
                          background: verdict === 'Reject' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                          border: verdict === 'Reject' ? '1px solid var(--ghana-red)' : '1px solid rgba(255,255,255,0.1)',
                          color: verdict === 'Reject' ? '#fca5a5' : 'var(--text-secondary)',
                          cursor: 'pointer',
                          fontWeight: 600,
                          fontSize: '0.85rem'
                        }}>
                          <input
                            type="radio"
                            name="verdict"
                            value="Reject"
                            checked={verdict === 'Reject'}
                            onChange={() => setVerdict('Reject')}
                            style={{ accentColor: 'var(--ghana-red)' }}
                          />
                          <XCircle size={16} className="text-red-400" />
                          <span>Statutory Rejection</span>
                        </label>
                      </div>
                    </div>

                    {/* Mandatory Comments */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                          Mandatory Directive Remarks (Minimum 20 characters) *
                        </label>
                        <span style={{ fontSize: '0.72rem', color: mandatoryComments.length >= 20 ? '#10b981' : '#f59e0b' }}>
                          {mandatoryComments.length} / 20 chars min
                        </span>
                      </div>
                      <textarea
                        required
                        rows={3}
                        value={mandatoryComments}
                        onChange={(e) => setMandatoryComments(e.target.value)}
                        placeholder="State executive observations, directives for implementation monitoring, or specific statutory reasons..."
                        style={{
                          width: '100%',
                          padding: '12px 14px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.85rem',
                          outline: 'none',
                          lineHeight: 1.4,
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    {/* Submit Button */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="submit"
                        disabled={submitting || !canPassVerdict}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '12px 28px',
                          borderRadius: '10px',
                          background: canPassVerdict
                            ? 'linear-gradient(135deg, var(--ghana-gold) 0%, #d97706 100%)'
                            : 'rgba(255, 255, 255, 0.1)',
                          color: canPassVerdict ? '#0b0f19' : 'var(--text-muted)',
                          fontWeight: 800,
                          fontSize: '0.88rem',
                          border: 'none',
                          cursor: canPassVerdict ? 'pointer' : 'not-allowed',
                          boxShadow: canPassVerdict ? '0 4px 15px rgba(251, 191, 36, 0.3)' : 'none'
                        }}
                      >
                        <Stamp size={18} />
                        <span>Sign & Record Executive Verdict</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Mode 2: Verdict History */}
      {activeSubTab === 'history' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          padding: '24px'
        }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
            Director General Executive Decision History
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {verdictHistory.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: item.verdict === 'Approve'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : item.verdict === 'Reject'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(251, 191, 36, 0.2)',
                      color: item.verdict === 'Approve' ? '#10b981' : item.verdict === 'Reject' ? '#ef4444' : '#fbbf24',
                      fontWeight: 800,
                      fontSize: '0.74rem'
                    }}>
                      {item.verdict.toUpperCase()}
                    </span>
                    <strong style={{ color: '#fff', fontSize: '0.88rem' }}>{item.projectCode}</strong>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>— {item.projectName}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontStyle: 'italic', paddingLeft: '8px', borderLeft: '2px solid rgba(255,255,255,0.1)' }}>
                  "{item.mandatoryComments}"
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', gap: '16px' }}>
                  <span>Executive Reviewer: <strong>{item.reviewedByName}</strong> ({item.reviewedByEmail})</span>
                  <span>Clearance Officer: {item.clearanceOfficer}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DOCUMENT REVIEW & GRADING MODAL FOR DIRECTOR GENERAL / ACTIVE PROFILES */}
      {reviewingDoc && selectedProject && (
        <DocumentReviewGradeModal
          isOpen={!!reviewingDoc}
          onClose={() => setReviewingDoc(null)}
          document={reviewingDoc}
          project={selectedProject}
          allProjects={projects}
          session={session}
          onSaveReview={(projectId, docId, comment, comp, read, stat) => {
            if (onReviewDocument) {
              onReviewDocument(projectId, docId, comment, comp, read, stat);
            }
            setReviewingDoc(null);
          }}
        />
      )}
    </div>
  );
};
