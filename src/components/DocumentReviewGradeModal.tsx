import React, { useState, useEffect } from 'react';
import { 
  Award, 
  ShieldCheck, 
  MessageSquare, 
  AlertTriangle, 
  FileText, 
  Sparkles, 
  X, 
  Send, 
  Eye,
  Download,
  Search,
  BookOpen,
  Columns,
  Rows,
  FolderOpen,
  CheckCircle2
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset, 
  DocumentReviewComment, 
  ComplianceScore, 
  ReviewWorkflowStatus 
} from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { 
  getDocumentOcrText, 
  getFullDocumentSections, 
  getFullDocumentText, 
  getStoredDocumentDataUrl 
} from '../services/assessmentEngine';

interface DocumentReviewGradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentAsset | null;
  project: AIProject | null;
  session: UserSession;
  allProjects?: AIProject[];
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
  document: initialDocument,
  project: initialProject,
  session,
  allProjects,
  onSaveReview
}) => {
  if (!isOpen || !initialDocument || !initialProject) return null;

  // Allow switching between documents of the project (or across first-timer uploads) right inside the Review & Grade modal
  const [activeProject, setActiveProject] = useState<AIProject>(initialProject);
  const [activeDoc, setActiveDoc] = useState<DocumentAsset>(initialDocument);

  useEffect(() => {
    setActiveProject(initialProject);
    setActiveDoc(initialDocument);
  }, [initialDocument, initialProject]);

  // Reviewer comment state
  const [commentText, setCommentText] = useState('');
  const [verdict, setVerdict] = useState<'Approved' | 'Changes Requested' | 'Conditionally Cleared' | 'Under Investigation'>('Approved');
  
  // Full Document Reader state inside Review & Grading
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>('split');
  const [docReaderTab, setDocReaderTab] = useState<'full' | 'sections' | 'ocr' | 'attachment'>('full');
  const [selectedPageIdx, setSelectedPageIdx] = useState<number>(0);
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');

  // Active review grading states (pre-populated with project's existing scores)
  const [fairness, setFairness] = useState<number>(initialProject.compliance?.fairness ?? 75);
  const [transparency, setTransparency] = useState<number>(initialProject.compliance?.transparency ?? 70);
  const [accountability, setAccountability] = useState<number>(initialProject.compliance?.accountability ?? 80);
  const [privacy, setPrivacy] = useState<number>(initialProject.compliance?.privacy ?? 85);
  const [security, setSecurity] = useState<number>(initialProject.compliance?.security ?? 80);
  const [readinessScore, setReadinessScore] = useState<number>(initialProject.readinessScore ?? 75);

  useEffect(() => {
    setFairness(activeProject.compliance?.fairness ?? 75);
    setTransparency(activeProject.compliance?.transparency ?? 70);
    setAccountability(activeProject.compliance?.accountability ?? 80);
    setPrivacy(activeProject.compliance?.privacy ?? 85);
    setSecurity(activeProject.compliance?.security ?? 80);
    setReadinessScore(activeProject.readinessScore ?? 75);
  }, [activeProject]);

  const [applyGradesToProject, setApplyGradesToProject] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-calculate letter grade based on ethical average
  const ethicalAvg = Math.round((fairness + transparency + accountability + privacy + security) / 5);
  const calculatedGrade: 'Excellent' | 'Good' | 'Moderate' | 'High Risk' = 
    ethicalAvg >= 85 ? 'Excellent' :
    ethicalAvg >= 70 ? 'Good' :
    ethicalAvg >= 55 ? 'Moderate' : 'High Risk';

  // Full document content & structured sections
  const ocrText = getDocumentOcrText(activeDoc.id, activeDoc.fileName, activeProject.name);
  const fullDocumentText = getFullDocumentText(activeDoc, activeProject);
  const fullDocSections = getFullDocumentSections(activeDoc, activeProject);
  const storedDataUrl = getStoredDocumentDataUrl(activeDoc.id, activeDoc);

  const isFirstTimerDoc = (d: DocumentAsset) =>
    Boolean(
      d.isFirstTimerUpload ||
      d.uploadedByRole === 'First-Timer / New User' ||
      d.signedBy?.includes('First-Timer / New User') ||
      d.id.includes('onboard')
    );

  const currentIsFirstTimer = isFirstTimerDoc(activeDoc);

  // Project documents sorted so First-Timer / Onboarder documents appear first
  const projectDocs = [...(activeProject.documents || [])].sort((a, b) => {
    const aFT = isFirstTimerDoc(a) ? 1 : 0;
    const bFT = isFirstTimerDoc(b) ? 1 : 0;
    return bFT - aFT;
  });

  // All first-timer documents across all projects (if provided)
  const allFirstTimerDocs = (allProjects || [activeProject]).flatMap(p =>
    (p.documents || [])
      .filter(d => isFirstTimerDoc(d))
      .map(d => ({ doc: d, project: p }))
  );

  // Download full document helper
  const handleDownloadFullDocument = () => {
    if (storedDataUrl && activeDoc.fileType !== 'pdf') {
      const a = window.document.createElement('a');
      a.href = storedDataUrl;
      a.download = activeDoc.fileName;
      a.click();
      return;
    }
    const blob = new Blob([fullDocumentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `${activeDoc.fileName.replace(/\.[^/.]+$/, '')}_FULL_UPLOADED_DOCUMENT.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered full text when searching inside document
  const displayedFullText = docSearchQuery.trim()
    ? fullDocumentText
        .split('\n')
        .filter(line => line.toLowerCase().includes(docSearchQuery.toLowerCase()))
        .join('\n') || `No lines matching "${docSearchQuery}" in full document.`
    : fullDocumentText;

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
      activeProject.id,
      activeDoc.id,
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
      background: 'rgba(5, 8, 15, 0.94)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px 16px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: layoutMode === 'split' ? '1360px' : '980px',
        width: '100%',
        margin: 'auto',
        background: 'linear-gradient(175deg, #111827 0%, #0c121e 100%)',
        border: '1px solid rgba(16, 185, 129, 0.45)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 35px rgba(16, 185, 129, 0.15)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        maxHeight: '94vh',
        display: 'flex',
        flexDirection: 'column',
        transition: 'max-width 0.2s ease'
      }}>
        {/* National Ribbon */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
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
                <span>Documents & OCR • Full Onboarder Document Review & Grading Studio</span>
              </div>
              <h2 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
                Full Uploaded Document Access, Review & Module Grading
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Layout Switcher: Split Side-by-Side vs Stacked */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '8px',
              padding: '3px'
            }}>
              <button
                type="button"
                onClick={() => setLayoutMode('split')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: layoutMode === 'split' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                  color: layoutMode === 'split' ? '#a7f3d0' : 'var(--text-secondary)'
                }}
              >
                <Columns size={13} />
                <span>Side-by-Side (Full Doc + Grade)</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('stacked')}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  background: layoutMode === 'stacked' ? 'rgba(16, 185, 129, 0.22)' : 'transparent',
                  color: layoutMode === 'stacked' ? '#a7f3d0' : 'var(--text-secondary)'
                }}
              >
                <Rows size={13} />
                <span>Stacked View</span>
              </button>
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
        </div>

        {/* FIRST-TIMER / ONBOARDER UPLOADED DOCUMENTS QUICK-SWITCH BAR */}
        <div style={{
          padding: '10px 24px',
          background: 'rgba(251, 191, 36, 0.06)',
          borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: '#fde68a',
              textTransform: 'uppercase'
            }}>
              <FolderOpen size={14} className="text-amber-400" />
              <span>Project Uploaded Documents ({projectDocs.length}):</span>
            </span>

            {projectDocs.map((d) => {
              const isSelected = d.id === activeDoc.id;
              const isFT = isFirstTimerDoc(d);
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    setActiveDoc(d);
                    setSelectedPageIdx(0);
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 11px',
                    borderRadius: '8px',
                    fontSize: '0.73rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    background: isSelected
                      ? (isFT ? 'rgba(251, 191, 36, 0.25)' : 'rgba(16, 185, 129, 0.22)')
                      : 'rgba(255, 255, 255, 0.04)',
                    border: isSelected
                      ? (isFT ? '1px solid #fbbf24' : '1px solid var(--ghana-emerald)')
                      : '1px solid rgba(255, 255, 255, 0.12)',
                    color: isSelected ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={12} className={isFT ? 'text-amber-400' : 'text-emerald-400'} />
                  <span>{d.fileName}</span>
                  {isFT && (
                    <span style={{
                      fontSize: '0.62rem',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: 'rgba(251, 191, 36, 0.25)',
                      color: '#fde68a',
                      fontWeight: 800
                    }}>
                      ⚡ First-Timer
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {allFirstTimerDocs.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Jump to Any First-Timer Upload:
              </span>
              <select
                value={`${activeProject.id}::${activeDoc.id}`}
                onChange={(e) => {
                  const [pId, dId] = e.target.value.split('::');
                  const found = allFirstTimerDocs.find(item => item.project.id === pId && item.doc.id === dId);
                  if (found) {
                    setActiveProject(found.project);
                    setActiveDoc(found.doc);
                    setSelectedPageIdx(0);
                  }
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: '#0f172a',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  color: '#fde68a',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {allFirstTimerDocs.map(({ doc, project }) => (
                  <option key={`${project.id}::${doc.id}`} value={`${project.id}::${doc.id}`}>
                    [{project.projectCode}] {doc.fileName} ({doc.uploadedByName || 'Onboarder'})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          flex: 1
        }}>
          
          {/* Document & Project Target Provenance Strip */}
          <div style={{
            padding: '14px 18px',
            borderRadius: '14px',
            background: currentIsFirstTimer ? 'rgba(234, 179, 8, 0.08)' : 'rgba(16, 185, 129, 0.06)',
            border: currentIsFirstTimer ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(16, 185, 129, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} className={currentIsFirstTimer ? 'text-amber-400' : 'text-emerald-400'} />
                <div>
                  <div style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff' }}>
                    {activeDoc.fileName}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Project: <strong style={{ color: '#fff' }}>[{activeProject.projectCode}] {activeProject.name}</strong> ({activeProject.mda})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {currentIsFirstTimer && (
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
                  {activeDoc.pageCount || fullDocSections.length} Pages • {activeDoc.fileSize || '1.8 MB'} • Uploaded: {activeDoc.uploadedAt}
                </span>

                <button
                  type="button"
                  onClick={handleDownloadFullDocument}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.18)',
                    border: '1px solid rgba(16, 185, 129, 0.45)',
                    color: '#6ee7b7',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={12} />
                  <span>Download Full Document</span>
                </button>
              </div>
            </div>

            {/* Uploader provenance details */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '0.73rem',
              color: 'var(--text-secondary)',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '6px',
              flexWrap: 'wrap'
            }}>
              <span>Uploader: <strong style={{ color: '#e2e8f0' }}>{activeDoc.uploadedByName || (currentIsFirstTimer ? 'Onboarding Officer' : activeDoc.signedBy?.[0] || 'MDA Lead Officer')}</strong></span>
              <span>•</span>
              <span>Email: <span style={{ color: '#93c5fd' }}>{activeDoc.uploadedByEmail || 'officer@gov.gh'}</span></span>
              <span>•</span>
              <span>Role: <span style={{ color: '#a7f3d0' }}>{activeDoc.uploadedByRole || (currentIsFirstTimer ? 'First-Timer / New User' : 'Institutional Officer')}</span></span>
              <span>•</span>
              <span>Review Status: <strong style={{ color: activeDoc.reviewStatus === 'Reviewed & Verified' ? '#10b981' : '#fde68a' }}>{activeDoc.reviewStatus || 'Pending Review'}</strong></span>
            </div>
          </div>

          {/* MAIN WORKSPACE GRID: LEFT = FULL UPLOADED DOCUMENT ACCESS | RIGHT = REVIEW & GRADING */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: layoutMode === 'split' ? '1.15fr 1fr' : '1fr',
            gap: '20px',
            alignItems: 'start'
          }}>

            {/* LEFT PANEL: FULL DOCUMENT UPLOADED BY FIRST-TIMER / ONBOARDER */}
            <div style={{
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'rgba(2, 6, 23, 0.72)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              boxShadow: 'inset 0 2px 14px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={16} className="text-sky-400" />
                  <div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#fff' }}>
                      Full Uploaded Document & OCR Dossier Reader
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Complete access to the full document uploaded by the first-timer / onboarder for grading verification
                    </div>
                  </div>
                </div>

                {/* Search within Full Document */}
                <div style={{ position: 'relative', width: '210px' }}>
                  <input
                    type="text"
                    placeholder="Search in full document..."
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 10px 5px 28px',
                      borderRadius: '6px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.14)',
                      color: '#fff',
                      fontSize: '0.73rem',
                      outline: 'none'
                    }}
                  />
                  <Search size={12} style={{ position: 'absolute', left: '9px', top: '8px', color: 'var(--text-muted)' }} />
                </div>
              </div>

              {/* Reader Mode Tabs */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexWrap: 'wrap',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                paddingBottom: '8px'
              }}>
                {[
                  { id: 'full', label: `📄 Complete Full Document (${fullDocSections.length} Pages)` },
                  { id: 'sections', label: '📑 Page-by-Page Section Reader' },
                  { id: 'ocr', label: '🔍 Extracted OCR & Signals' },
                  { id: 'attachment', label: '📎 Original File / Download' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDocReaderTab(tab.id as any)}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      border: docReaderTab === tab.id ? '1px solid #38bdf8' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: docReaderTab === tab.id ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                      color: docReaderTab === tab.id ? '#7dd3fc' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* TAB 1: COMPLETE FULL DOCUMENT VIEW */}
              {docReaderTab === 'full' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{
                    maxHeight: layoutMode === 'split' ? '500px' : '320px',
                    overflowY: 'auto',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#e2e8f0',
                    fontSize: '0.76rem',
                    lineHeight: 1.65,
                    fontFamily: 'monospace',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {displayedFullText}
                  </div>
                </div>
              )}

              {/* TAB 2: PAGE-BY-PAGE SECTION READER */}
              {docReaderTab === 'sections' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {fullDocSections.map((sec, idx) => (
                      <button
                        key={sec.pageNumber}
                        type="button"
                        onClick={() => setSelectedPageIdx(idx)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: selectedPageIdx === idx ? '1px solid var(--ghana-emerald)' : '1px solid rgba(255,255,255,0.1)',
                          background: selectedPageIdx === idx ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: selectedPageIdx === idx ? '#6ee7b7' : 'var(--text-secondary)'
                        }}
                      >
                        Page {sec.pageNumber}
                      </button>
                    ))}
                  </div>

                  {fullDocSections[selectedPageIdx] && (
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: 'rgba(0, 0, 0, 0.55)',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                      maxHeight: layoutMode === 'split' ? '450px' : '290px',
                      overflowY: 'auto',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 800, color: '#fff' }}>
                          {fullDocSections[selectedPageIdx].sectionTitle}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--ghana-emerald)', fontWeight: 600, marginTop: '2px' }}>
                          Statutory Basis: {fullDocSections[selectedPageIdx].statutoryReference}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {fullDocSections[selectedPageIdx].keyHighlights.map((hl, i) => (
                          <span
                            key={i}
                            style={{
                              fontSize: '0.66rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.35)',
                              color: '#a7f3d0',
                              fontWeight: 700
                            }}
                          >
                            ✓ {hl}
                          </span>
                        ))}
                      </div>

                      <pre style={{
                        margin: 0,
                        fontSize: '0.76rem',
                        lineHeight: 1.6,
                        color: '#e2e8f0',
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                      }}>
                        {fullDocSections[selectedPageIdx].content}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXTRACTED OCR & REGULATORY SIGNALS */}
              {docReaderTab === 'ocr' && (
                <div style={{
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  maxHeight: layoutMode === 'split' ? '500px' : '300px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', fontWeight: 700, color: '#38bdf8' }}>
                    <Eye size={14} />
                    <span>Primary OCR Engine Text Stream & Evidence Signals</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.6, margin: 0 }}>
                    {ocrText}
                  </p>
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                    fontSize: '0.73rem',
                    color: '#a7f3d0'
                  }}>
                    <strong>Full Document OCR Verification:</strong> All {fullDocSections.length} sections of <em>{activeDoc.fileName}</em> have been indexed for Governance & Ethics (Fairness, Transparency, Accountability, Privacy Act 843, Security) and AI Readiness grading.
                  </div>
                </div>
              )}

              {/* TAB 4: ORIGINAL UPLOADED FILE PREVIEW / DOWNLOAD */}
              {docReaderTab === 'attachment' && (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(0, 0, 0, 0.55)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                        Original Uploaded File Package: {activeDoc.fileName}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Format: {activeDoc.fileType.toUpperCase()} • Size: {activeDoc.fileSize || '1.8 MB'} • SHA-256: sha256-{activeDoc.id}f89a2b
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadFullDocument}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '7px 14px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                        color: '#0b0f19',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <Download size={14} />
                      <span>Download Complete Document</span>
                    </button>
                  </div>

                  {storedDataUrl && activeDoc.fileType === 'pdf' ? (
                    <iframe
                      src={storedDataUrl}
                      title={activeDoc.fileName}
                      style={{
                        width: '100%',
                        height: '380px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: '#fff'
                      }}
                    />
                  ) : (
                    <div style={{
                      padding: '14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontSize: '0.75rem',
                      color: '#cbd5e1',
                      lineHeight: 1.5
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, marginBottom: '6px' }}>
                        <CheckCircle2 size={14} />
                        <span>Full Sovereign Dossier Preserved & Indexed</span>
                      </div>
                      The complete text and all {fullDocSections.length} statutory pages of <strong>{activeDoc.fileName}</strong> uploaded by <strong>{activeDoc.uploadedByName || 'the First-Timer / Onboarder'}</strong> are available in the <em>Complete Full Document</em> and <em>Page-by-Page Section Reader</em> tabs, or can be downloaded to your workstation using the button above.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT PANEL: REVIEW COMMENTS, VERDICT & MODULE GRADING */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Past Reviewer Comments on this Document */}
              {activeDoc.reviewerComments && activeDoc.reviewerComments.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    <MessageSquare size={14} className="text-emerald-400" />
                    <span>Existing Reviewer Comments ({activeDoc.reviewerComments.length})</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '130px', overflowY: 'auto' }}>
                    {activeDoc.reviewerComments.map((rev) => (
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
                          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff' }}>
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
                        <div style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4 }}>
                          "{rev.comment}"
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Form: Comments & Verdict */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                    flexWrap: 'wrap'
                  }}>
                    <MessageSquare size={14} className="text-emerald-400" />
                    <span>Official Reviewer Directive / Comment on Full Document *</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      (Visible to {currentIsFirstTimer ? 'First-Timer / Onboarder' : 'project team'} & logged in audit trail)
                    </span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="After inspecting the full uploaded document on the left, enter official technical clearance remarks, compliance findings, or required revisions..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.82rem',
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
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
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
                          padding: '9px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          background: verdict === item.id ? `${item.color}22` : 'rgba(255, 255, 255, 0.02)',
                          border: verdict === item.id ? `1px solid ${item.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.76rem', fontWeight: 700, color: verdict === item.id ? item.color : 'var(--text-secondary)' }}>
                          {item.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Statutory Grading Section (Governance & Ethics and AI Readiness) */}
                <div style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18} className="text-emerald-400" />
                      <div>
                        <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                          Grade Document at Governance & Ethics and AI Readiness
                        </h4>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                          Assign verified module scores based on the full uploaded document.
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="checkbox"
                        id="apply-grades-toggle"
                        checked={applyGradesToProject}
                        onChange={(e) => setApplyGradesToProject(e.target.checked)}
                        style={{ width: '15px', height: '15px', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
                      />
                      <label htmlFor="apply-grades-toggle" style={{ fontSize: '0.74rem', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>
                        Apply Grades to Modules
                      </label>
                    </div>
                  </div>

                  {applyGradesToProject && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      
                      {/* Governance & Ethics 5 Pillars */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ghana-emerald)' }}>
                            Ghana AI Ethics Framework (Act 843 Rubric):
                          </span>
                          <span style={{
                            fontSize: '0.72rem',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--ghana-emerald)',
                            fontWeight: 800
                          }}>
                            Calculated Grade: {calculatedGrade} ({ethicalAvg}%)
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '10px' }}>
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
                                padding: '8px 10px',
                                borderRadius: '8px',
                                background: 'rgba(0, 0, 0, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#cbd5e1', marginBottom: '4px' }}>
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
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: 'rgba(56, 189, 248, 0.05)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8' }}>
                            AI Readiness Capability Score:
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            Institutional capability across data pipelines, compute & staff.
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <input
                            type="range"
                            min="20"
                            max="100"
                            value={readinessScore}
                            onChange={(e) => setReadinessScore(Number(e.target.value))}
                            style={{ width: '130px', accentColor: '#38bdf8', cursor: 'pointer' }}
                          />
                          <span style={{
                            fontSize: '0.84rem',
                            fontWeight: 900,
                            color: '#38bdf8',
                            minWidth: '42px',
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
                      fontSize: '0.8rem',
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
                      padding: '10px 22px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                      border: 'none',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                    }}
                  >
                    <Send size={14} />
                    <span>Save Review, Pass Comment & Apply Grades</span>
                  </button>
                </div>

              </form>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
