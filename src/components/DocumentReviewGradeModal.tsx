import React, { useState } from 'react';
import { 
  Award, 
  ShieldCheck, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  X, 
  Send, 
  Eye
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset, 
  DocumentReviewComment, 
  ComplianceScore, 
  ReviewWorkflowStatus 
} from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { getDocumentOcrText } from '../services/assessmentEngine';

interface DocumentReviewGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentAsset | null;
  project: AIProject | null;
  session: UserSession;
  onSaveReview: (
    projectId: string,
    docId: string,
    reviewComment: DocumentReviewComment,
    newCompliance?: ComplianceScore,
    newReadinessScore?: number,
    newProjectStatus?: ReviewWorkflowStatus
  ) => void;
}

export const DocumentReviewGradeModal: React.FC<DocumentReviewGradeModalProps> = ({
  isOpen,
  onClose,
  document,
  project,
  session,
  onSaveReview
}) => {
  if (!isOpen || !document || !project) return null;

  // Reviewer comment state
  const [commentText, setCommentText] = useState('');
  const [verdict, setVerdict] = useState<'Approved' | 'Changes Requested' | 'Conditionally Cleared' | 'Under Investigation'>('Approved');
  
  // OCR Preview toggle
  const [showFullOcr, setShowFullOcr] = useState(false);

  // Active review grading states (pre-populated with project's existing scores)
  const [fairness, setFairness] = useState<number>(project.compliance?.fairness ?? 75);
  const [transparency, setTransparency] = useState<number>(project.compliance?.transparency ?? 70);
  const [accountability, setAccountability] = useState<number>(project.compliance?.accountability ?? 80);
  const [privacy, setPrivacy] = useState<number>(project.compliance?.privacy ?? 85);
  const [security, setSecurity] = useState<number>(project.compliance?.security ?? 80);
  const [readinessScore, setReadinessScore] = useState<number>(project.readinessScore ?? 75);

  const [applyGradesToProject, setApplyGradesToProject] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-calculate letter grade based on ethical average
  const ethicalAvg = Math.round((fairness + transparency + accountability + privacy + security) / 5);
  const calculatedGrade: 'Excellent' | 'Good' | 'Moderate' | 'High Risk' = 
    ethicalAvg >= 85 ? 'Excellent' :
    ethicalAvg >= 70 ? 'Good' :
    ethicalAvg >= 55 ? 'Moderate' : 'High Risk';

  // Get full extracted text
  const ocrText = getDocumentOcrText(document.id, document.fileName, project.name);

  const isFirstTimerDoc = document.isFirstTimerUpload || 
    document.uploadedByRole === 'First-Timer / New User' ||
    document.signedBy?.includes('First-Timer / New User') ||
    document.id.includes('onboard');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!commentText.trim()) {
      setValidationError('Please enter a substantive review comment or directive on this uploaded document.');
      return;
    }

    setSubmitting(true);

    const newComment: DocumentReviewComment = {
      id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      reviewerName: session.fullName,
      reviewerRole: session.role,
      reviewerEmail: session.email,
      comment: commentText.trim(),
      createdAt: new Date().toISOString(),
      verdict,
      governanceAdjustment: applyGradesToProject ? {
        fairness,
        transparency,
        accountability,
        privacy,
        security,
        overallGrade: calculatedGrade
      } : undefined,
      readinessAdjustment: applyGradesToProject ? readinessScore : undefined
    };

    const updatedCompliance: ComplianceScore | undefined = applyGradesToProject ? {
      fairness,
      transparency,
      accountability,
      privacy,
      security,
      overallGrade: calculatedGrade
    } : undefined;

    // Determine workflow update if reviewer is DG or TC Team
    let updatedWorkflowStatus: ReviewWorkflowStatus | undefined = undefined;
    if (session.role === 'Director General') {
      if (verdict === 'Approved') updatedWorkflowStatus = 'Approved';
      else if (verdict === 'Changes Requested') updatedWorkflowStatus = 'Returned';
      else if (verdict === 'Under Investigation') updatedWorkflowStatus = 'Needs Correction';
    } else if (session.role === 'Technical Clearance Team' || session.role === 'Technical Director') {
      if (verdict === 'Approved' || verdict === 'Conditionally Cleared') updatedWorkflowStatus = 'Recommended';
      else if (verdict === 'Changes Requested') updatedWorkflowStatus = 'Needs Correction';
    } else if (session.role === 'Super Admin') {
      if (verdict === 'Approved') updatedWorkflowStatus = 'Approved';
      else if (verdict === 'Changes Requested') updatedWorkflowStatus = 'Needs Correction';
    }

    onSaveReview(
      project.id,
      document.id,
      newComment,
      updatedCompliance,
      applyGradesToProject ? readinessScore : undefined,
      updatedWorkflowStatus
    );

    setSubmitting(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100000,
      background: 'rgba(5, 8, 15, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '920px',
        width: '100%',
        margin: 'auto',
        background: 'linear-gradient(175deg, #111827 0%, #0c121e 100%)',
        border: '1px solid rgba(16, 185, 129, 0.45)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(16, 185, 129, 0.15)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* National Ribbon */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(251, 191, 36, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ghana-emerald)'
            }}>
              <Award size={22} />
            </div>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ghana-emerald)',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                <ShieldCheck size={12} />
                <span>Statutory Clearance & Document Review Suite</span>
              </div>
              <h2 style={{ fontSize: '1.22rem', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
                Review, Grade & Comment on Uploaded Document
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            title="Close review modal"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '24px 28px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          
          {/* Document & Project Target Strip */}
          <div style={{
            padding: '16px 20px',
            borderRadius: '14px',
            background: isFirstTimerDoc ? 'rgba(234, 179, 8, 0.08)' : 'rgba(16, 185, 129, 0.06)',
            border: isFirstTimerDoc ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} className={isFirstTimerDoc ? 'text-amber-400' : 'text-emerald-400'} />
                <div>
                  <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#fff' }}>
                    {document.fileName}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Project: <strong style={{ color: '#fff' }}>[{project.projectCode}] {project.name}</strong> ({project.mda})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isFirstTimerDoc && (
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    background: 'rgba(234, 179, 8, 0.18)',
                    border: '1px solid rgba(234, 179, 8, 0.45)',
                    color: '#fde68a',
                    fontWeight: 800,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Sparkles size={11} />
                    <span>Uploaded by First-Timer / Onboarder</span>
                  </span>
                )}

                <span style={{
                  fontSize: '0.7rem',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: 'var(--text-secondary)',
                  border: '1px solid rgba(255, 255, 255, 0.12)'
                }}>
                  Uploaded: {document.uploadedAt}
                </span>
              </div>
            </div>

            {/* Uploader provenance details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '0.74rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '8px',
              flexWrap: 'wrap'
            }}>
              <span>Uploader: <strong style={{ color: '#e2e8f0' }}>{document.uploadedByName || 'Onboarding Officer'}</strong></span>
              <span>•</span>
              <span>Email: <span style={{ color: '#93c5fd' }}>{document.uploadedByEmail || 'officer@gov.gh'}</span></span>
              <span>•</span>
              <span>Role: <span style={{ color: '#a7f3d0' }}>{document.uploadedByRole || 'First-Timer / New User'}</span></span>
              <span>•</span>
              <span>Review Status: <strong style={{ color: document.reviewStatus === 'Reviewed & Verified' ? '#10b981' : '#fde68a' }}>{document.reviewStatus || 'Pending Review'}</strong></span>
            </div>
          </div>

          {/* OCR Extracted Text Preview Drawer */}
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: showFullOcr ? '8px' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
                <Eye size={14} className="text-cyan-400" />
                <span>Extracted OCR Technical Dossier Content</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFullOcr(!showFullOcr)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--ghana-emerald)',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showFullOcr ? 'Collapse Full Text ▲' : 'Expand Full Text ▼'}
              </button>
            </div>

            <p style={{
              fontSize: '0.76rem',
              color: '#cbd5e1',
              lineHeight: 1.5,
              margin: 0,
              maxHeight: showFullOcr ? '180px' : '44px',
              overflowY: 'auto'
            }}>
              {ocrText}
            </p>
          </div>

          {/* Past Reviewer Comments on this Document */}
          {document.reviewerComments && document.reviewerComments.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                <MessageSquare size={14} className="text-emerald-400" />
                <span>Existing Reviewer Comments ({document.reviewerComments.length})</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                {document.reviewerComments.map((rev) => (
                  <div
                    key={rev.id}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>
                        {rev.reviewerName} <span style={{ color: '#94a3b8', fontWeight: 500 }}>({rev.reviewerRole})</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {rev.verdict && (
                          <span style={{
                            fontSize: '0.64rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: rev.verdict === 'Approved' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                            color: rev.verdict === 'Approved' ? '#a7f3d0' : '#fde68a',
                            fontWeight: 700
                          }}>
                            {rev.verdict}
                          </span>
                        )}
                        <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                      "{rev.comment}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Review Form: Comments & Verdict */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '6px'
              }}>
                <MessageSquare size={14} className="text-emerald-400" />
                <span>Official Reviewer Directive / Comment on Document *</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                  (Visible to {isFirstTimerDoc ? 'First-Timer / Onboarder' : 'project team'} and stored in statutory audit trail)
                </span>
              </label>
              <textarea
                required
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Enter official technical clearance remarks, compliance findings, required revisions, or praise on the uploaded dossier..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Verdict Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '6px'
              }}>
                Document Statutory Verdict:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { id: 'Approved', label: 'Approved & Verified', color: '#10b981' },
                  { id: 'Conditionally Cleared', label: 'Conditionally Cleared', color: '#38bdf8' },
                  { id: 'Changes Requested', label: 'Changes Requested', color: '#f59e0b' },
                  { id: 'Under Investigation', label: 'Under Investigation', color: '#ef4444' }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setVerdict(item.id as any)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      textAlign: 'center',
                      background: verdict === item.id ? `${item.color}22` : 'rgba(255, 255, 255, 0.02)',
                      border: verdict === item.id ? `1px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.78rem', fontWeight: 700, color: verdict === item.id ? item.color : 'var(--text-secondary)' }}>
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Grading Section (Governance & Ethics and AI Readiness) */}
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award size={18} className="text-emerald-400" />
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                      Grade Document at Governance & Ethics and AI Readiness
                    </h4>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                      After reviewing the uploaded document, assign updated scores to reflect verified evidence in the central modules.
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="apply-grades-toggle"
                    checked={applyGradesToProject}
                    onChange={(e) => setApplyGradesToProject(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
                  />
                  <label htmlFor="apply-grades-toggle" style={{ fontSize: '0.76rem', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                    Apply Grades to Project Modules
                  </label>
                </div>
              </div>

              {applyGradesToProject && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  {/* Governance & Ethics 5 Pillars */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--ghana-emerald)' }}>
                        Ghana AI Ethics Framework (Act 843 Rubric):
                      </span>
                      <span style={{
                        fontSize: '0.74rem',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--ghana-emerald)',
                        fontWeight: 800
                      }}>
                        Calculated Grade: {calculatedGrade} ({ethicalAvg}%)
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                      {[
                        { label: 'Fairness & Bias', val: fairness, set: setFairness },
                        { label: 'Transparency', val: transparency, set: setTransparency },
                        { label: 'Accountability', val: accountability, set: setAccountability },
                        { label: 'Privacy (Act 843)', val: privacy, set: setPrivacy },
                        { label: 'Security & Safety', val: security, set: setSecurity }
                      ].map((pillar) => (
                        <div
                          key={pillar.label}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: 'rgba(0, 0, 0, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.08)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '4px' }}>
                            <span>{pillar.label}</span>
                            <strong>{pillar.val}%</strong>
                          </div>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={pillar.val}
                            onChange={(e) => pillar.set(Number(e.target.value))}
                            style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI Readiness Capability Score */}
                  <div style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.05)',
                    border: '1px solid rgba(56, 189, 248, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8' }}>
                        AI Readiness Capability Score:
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Institutional capability across data pipelines, compute infrastructure, and staff skills.
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={readinessScore}
                        onChange={(e) => setReadinessScore(Number(e.target.value))}
                        style={{ width: '140px', accentColor: '#38bdf8', cursor: 'pointer' }}
                      />
                      <span style={{
                        fontSize: '0.86rem',
                        fontWeight: 900,
                        color: '#38bdf8',
                        minWidth: '45px',
                        textAlign: 'right'
                      }}>
                        {readinessScore}%
                      </span>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {validationError && (
              <div style={{ color: '#f87171', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <AlertTriangle size={14} />
                <span>{validationError}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 26px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                <Send size={15} />
                <span>Save Review, Pass Comment & Apply Grades</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
};
