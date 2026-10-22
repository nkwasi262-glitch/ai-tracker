import React, { useState } from 'react';
import { 
  Upload, 
  Search, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  HelpCircle, 
  Award, 
  ArrowRight, 
  RotateCcw, 
  Sparkles,
  Clock,
  XCircle,
  Lock,
  Eye,
  Layers,
  ShieldAlert,
  X,
  FolderOpen,
  MessageSquare
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset, 
  DocumentReviewComment,
  ReviewWorkflowStatus, 
  ComplianceScore, 
  AutoAssessmentDetails, 
  ZeroAssumptionAudit 
} from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';
import { 
  generateAssessmentFromDocuments, 
  getDocumentOcrText, 
  registerUploadedDocumentOcr 
} from '../services/assessmentEngine';
import { DocumentReviewGradeModal } from './DocumentReviewGradeModal';

interface DocumentManagerProps {
  projects: AIProject[];
  onAddDocument: (projectId: string, newDoc: DocumentAsset) => void;
  onSignDocument: (projectId: string, docId: string, signerName: string) => void;
  currentRole: UserRole | string;
  session?: UserSession;
  onUpdateProjectStatus?: (projectId: string, newStatus: ReviewWorkflowStatus, notes?: string) => void;
  onUpdateProjectAssessment?: (
    projectId: string, 
    compliance: ComplianceScore, 
    readinessScore: number, 
    details: AutoAssessmentDetails,
    zeroAssumptionAudit?: ZeroAssumptionAudit
  ) => void;
  onReviewDocument?: (
    projectId: string,
    docId: string,
    reviewComment: DocumentReviewComment,
    newCompliance?: ComplianceScore,
    newReadinessScore?: number,
    newProjectStatus?: ReviewWorkflowStatus
  ) => void;
}

export const DocumentManager: React.FC<DocumentManagerProps> = ({
  projects,
  onAddDocument,
  onSignDocument,
  currentRole,
  session,
  onUpdateProjectStatus,
  onUpdateProjectAssessment,
  onReviewDocument
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Role permissions checks
  const isFirstTimer = session?.role === 'First-Timer / New User' || currentRole === 'First-Timer / New User' || !!session?.isFirstTimer;
  const isSuperAdmin = session?.role === 'Super Admin' || currentRole === 'Super Admin';
  const canAccessTechnicalClearanceGate = !isFirstTimer && (
    currentRole === 'Technical Director' ||
    currentRole === 'Technical Clearance Team' ||
    currentRole === 'Super Admin' ||
    session?.role === 'Technical Director' ||
    session?.role === 'Technical Clearance Team' ||
    session?.role === 'Super Admin'
  );

  // Statutory authority to review documents, grade modules, and pass comments on first-timer uploads
  const canReviewAndGrade = !isFirstTimer && (
    session?.role === 'Director General' ||
    session?.role === 'Super Admin' ||
    session?.role === 'Technical Clearance Team' ||
    session?.role === 'Technical Director' ||
    currentRole === 'Director General' ||
    currentRole === 'Super Admin' ||
    currentRole === 'Technical Clearance Team' ||
    currentRole === 'Technical Director'
  );

  // Review & Grade modal state
  const [reviewingItem, setReviewingItem] = useState<{ doc: DocumentAsset; project: AIProject } | null>(null);

  // Filter for first-timer uploads only
  const [onlyFirstTimerFilter, setOnlyFirstTimerFilter] = useState(false);

  // View mode: 'project' (current project vault) vs 'all' (super admin master document explorer)
  const [viewMode, setViewMode] = useState<'project' | 'all'>('project');

  // Search states
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');
  const [allDocsFilter, setAllDocsFilter] = useState('');
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [ocrWorking, setOcrWorking] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Selected document for right-hand preview
  const [selectedDoc, setSelectedDoc] = useState<DocumentAsset | null>(null);

  // Document Inspection Modal (for full OCR reading & dossier deep-dive)
  const [inspectingItem, setInspectingItem] = useState<{ doc: DocumentAsset; project: AIProject } | null>(null);

  // Assessment auto-generation state
  const [generatingAssessment, setGeneratingAssessment] = useState(false);
  const [assessmentFeedback, setAssessmentFeedback] = useState<string | null>(null);

  // Technical review states
  const [techNotes, setTechNotes] = useState('');
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Super Admin Registration Clearance states
  const [superAdminDirectiveNotes, setSuperAdminDirectiveNotes] = useState('');
  const [regFeedback, setRegFeedback] = useState<string | null>(null);

  // Flattened master list of all uploaded documents across all projects
  const allUploadedDocuments = projects.flatMap(p => 
    (p.documents || []).map(doc => ({
      doc,
      project: p
    }))
  );

  const firstTimerUploadsCount = allUploadedDocuments.filter(item => 
    item.doc.isFirstTimerUpload || 
    item.doc.uploadedByRole === 'First-Timer / New User' ||
    item.doc.id.includes('onboard') ||
    item.doc.signedBy?.includes('First-Timer / New User')
  ).length;

  const filteredAllDocuments = allUploadedDocuments.filter(item => {
    if (onlyFirstTimerFilter) {
      const isFT = item.doc.isFirstTimerUpload || 
        item.doc.uploadedByRole === 'First-Timer / New User' ||
        item.doc.id.includes('onboard') ||
        item.doc.signedBy?.includes('First-Timer / New User');
      if (!isFT) return false;
    }
    if (!allDocsFilter) return true;
    const q = allDocsFilter.toLowerCase();
    return (
      item.doc.fileName.toLowerCase().includes(q) ||
      item.project.name.toLowerCase().includes(q) ||
      item.project.projectCode.toLowerCase().includes(q) ||
      item.project.mda.toLowerCase().includes(q) ||
      item.project.mdaCode.toLowerCase().includes(q) ||
      (item.doc.uploadedByName && item.doc.uploadedByName.toLowerCase().includes(q)) ||
      (item.doc.reviewStatus && item.doc.reviewStatus.toLowerCase().includes(q))
    );
  });

  // Run mock full-text search across documents
  const handleOcrSearch = () => {
    if (!ocrSearchQuery) return [];
    
    const results: { doc: DocumentAsset; project: AIProject; snippet: string }[] = [];
    projects.forEach(proj => {
      (proj.documents || []).forEach(doc => {
        const fullText = getDocumentOcrText(doc.id, doc.fileName, proj.name);
        if (fullText.toLowerCase().includes(ocrSearchQuery.toLowerCase())) {
          const idx = fullText.toLowerCase().indexOf(ocrSearchQuery.toLowerCase());
          const start = Math.max(0, idx - 20);
          const end = Math.min(fullText.length, idx + ocrSearchQuery.length + 40);
          const snippet = '...' + fullText.substring(start, end) + '...';
          results.push({ doc, project: proj, snippet });
        }
      });
    });
    return results;
  };

  const searchResults = handleOcrSearch();

  // Handles simulated upload sequence
  const triggerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeProject) {
      const file = e.target.files[0];
      setNewFileName(file.name);
      setUploading(true);
      setUploadProgress(10);

      const uploadInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(uploadInterval);
            setUploading(false);
            setOcrWorking(true);
            
            setTimeout(() => {
              setOcrWorking(false);
              const nextDocId = `doc-new-${Date.now()}`;
              const doc: DocumentAsset = {
                id: nextDocId,
                fileName: file.name,
                fileType: 'pdf',
                uploadedAt: new Date().toISOString().split('T')[0],
                version: 1,
                signedBy: [currentRole],
                uploadedByRole: session?.role || currentRole,
                uploadedByName: session?.fullName || 'Registry User',
                uploadedByEmail: session?.email || '',
                isFirstTimerUpload: isFirstTimer,
                reviewStatus: 'Pending Review'
              };

              // Register simulated OCR text for the newly uploaded document
              const simulatedOcr = getDocumentOcrText(nextDocId, file.name, activeProject.name);
              registerUploadedDocumentOcr(nextDocId, simulatedOcr);

              onAddDocument(selectedProjectId, doc);
              setNewFileName('');

              // Auto-generate assessments immediately upon document upload
              const updatedDocs = [doc, ...activeProject.documents];
              const tempProject = { ...activeProject, documents: updatedDocs };
              const auto = generateAssessmentFromDocuments(tempProject, session);
              if (onUpdateProjectAssessment) {
                onUpdateProjectAssessment(
                  activeProject.id,
                  auto.compliance,
                  auto.readinessScore,
                  auto.details,
                  auto.zeroAssumptionAudit
                );
              }

              if (session) {
                recordAuditEvent({
                  eventType: 'DOCUMENT_UPLOAD',
                  actorName: session.fullName,
                  actorEmail: session.email,
                  actorRole: session.role,
                  actorInstitution: session.institution,
                  targetModule: 'documents',
                  targetEntityId: activeProject.id,
                  actionDetails: `Document "${file.name}" uploaded by ${session.role} for project ${activeProject.projectCode}. Triggered immediate automated regulatory assessment & system-wide synchronization.`
                });
              }

              setAssessmentFeedback(`✓ Document "${file.name}" parsed. System synchronized: AI Readiness (${auto.readinessScore}%), Governance & Ethics (${auto.compliance.overallGrade}), Zero-Assumption Provenance (${auto.zeroAssumptionAudit.evidenceBackingScore}%), and National Registry updated.`);
              setTimeout(() => setAssessmentFeedback(null), 7000);
            }, 1600);

            return 100;
          }
          return prev + 25;
        });
      }, 250);
    }
  };

  const handleDigitalSign = (docId: string) => {
    const canSign = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor', 'Super Admin'].includes(currentRole as string);
    if (!canSign || !activeProject) return;

    onSignDocument(selectedProjectId, docId, currentRole as string);
    if (selectedDoc?.id === docId) {
      setSelectedDoc(prev => prev ? { ...prev, signedBy: [...prev.signedBy, currentRole as string] } : null);
    }
  };

  // Automated Assessment Generation trigger
  const handleAutoGenerateAssessment = () => {
    if (!activeProject) return;
    setGeneratingAssessment(true);

    setTimeout(() => {
      const result = generateAssessmentFromDocuments(activeProject, session);
      if (onUpdateProjectAssessment) {
        onUpdateProjectAssessment(
          activeProject.id,
          result.compliance,
          result.readinessScore,
          result.details
        );
      }
      setGeneratingAssessment(false);
      setAssessmentFeedback(
        `✓ Assessment Generated: Governance Grade "${result.compliance.overallGrade}" • AI Readiness: ${result.readinessScore}%`
      );
      setTimeout(() => setAssessmentFeedback(null), 5000);
    }, 500);
  };

  // Super Admin Registration Decision: Approve, Pend, Reject
  const handleRegistrationDecision = (verdict: 'Approved' | 'Pending' | 'Rejected') => {
    if (!activeProject || !onUpdateProjectStatus) return;

    const defaultNotes = verdict === 'Approved'
      ? 'Statutory project registration officially approved under NITA Act 771 and Ghana AI Framework 2026. All uploaded compliance documents validated.'
      : verdict === 'Pending'
      ? 'Project registration pended. Dossier requires additional Act 843 DPC certifications or technical clarifications before final clearance.'
      : 'Project registration rejected due to failure to satisfy mandatory Ghana National AI Ethics and data security requirements.';

    const finalNotes = superAdminDirectiveNotes.trim() || defaultNotes;
    onUpdateProjectStatus(activeProject.id, verdict, finalNotes);

    if (session) {
      const eventType = verdict === 'Approved' 
        ? 'PROJECT_REGISTRATION_APPROVED' 
        : verdict === 'Pending' 
        ? 'PROJECT_REGISTRATION_PENDED' 
        : 'PROJECT_REGISTRATION_REJECTED';

      recordAuditEvent({
        eventType,
        actorName: session.fullName,
        actorEmail: session.email,
        actorRole: session.role,
        actorInstitution: session.institution,
        targetModule: 'documents',
        targetEntityId: activeProject.id,
        actionDetails: `Super Admin issued registration verdict [${verdict.toUpperCase()}] for project ${activeProject.projectCode} (${activeProject.name}). Directive: ${finalNotes}`
      });
    }

    setRegFeedback(`Registration for ${activeProject.projectCode} officially marked as "${verdict.toUpperCase()}".`);
    setSuperAdminDirectiveNotes('');
    setTimeout(() => setRegFeedback(null), 6000);
  };

  // Technical Clearance Gate update handler
  const handleUpdateStatus = (newStatus: ReviewWorkflowStatus) => {
    if (!activeProject || !onUpdateProjectStatus) return;
    onUpdateProjectStatus(activeProject.id, newStatus, techNotes.trim() || undefined);
    
    if (session) {
      recordAuditEvent({
        eventType: 'TECH_REVIEW_TRANSITION',
        actorName: session.fullName,
        actorEmail: session.email,
        actorRole: session.role,
        actorInstitution: session.institution,
        targetModule: 'documents',
        targetEntityId: activeProject.id,
        actionDetails: `Technical status updated to "${newStatus}" for project ${activeProject.projectCode}. Notes: ${techNotes || 'Standard evaluation'}`
      });
    }

    setStatusFeedback(`Project ${activeProject.projectCode} status updated to: ${newStatus}`);
    setTechNotes('');
    setTimeout(() => setStatusFeedback(null), 4000);
  };

  const canEdit = ['Super Administrator', 'Institution Administrator', 'Project Manager', 'Super Admin'].includes(currentRole as string) || isFirstTimer;
  const canSign = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor', 'Super Admin'].includes(currentRole as string);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Banner for First-Timer Onboarding */}
      {isFirstTimer && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(16, 185, 129, 0.08))',
          border: '1px solid rgba(251, 191, 36, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(251, 191, 36, 0.2)',
              border: '1px solid rgba(251, 191, 36, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              flexShrink: 0
            }}>
              <FolderOpen size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fde68a' }}>
                First-Timer Document Submission & Guided OCR
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Upload your project proposal, model specifications, and Act 843 data protection certificates. 
                The system automatically extracts OCR text and feeds it into the regulatory engine. 
                Super Admin will inspect all uploaded files, auto-generate Governance & Ethics and AI Readiness ratings, and approve project registration.
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '8px',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            color: '#fde68a',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            <Lock size={13} className="text-amber-400" />
            <span>Clearance & Role Selection Locked</span>
          </div>
        </div>
      )}

      {/* Super Admin Top Control Bar: Master Vault Toggle */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '12px 18px',
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FilesIconHeader />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
              National AI Documents & Compliance Vault
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Ghana Act 843 compliant encrypted repository with automated OCR and regulatory assessment
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setViewMode('project')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: viewMode === 'project' ? '1px solid var(--ghana-emerald)' : '1px solid var(--border-color)',
              background: viewMode === 'project' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: viewMode === 'project' ? '#a7f3d0' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            Project Documents Vault
          </button>

          <button
            type="button"
            onClick={() => setViewMode('all')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              border: viewMode === 'all' ? '1px solid #ef4444' : '1px solid var(--border-color)',
              background: viewMode === 'all' ? 'rgba(239, 68, 68, 0.18)' : 'rgba(255, 255, 255, 0.04)',
              color: viewMode === 'all' ? '#fca5a5' : 'var(--text-secondary)',
              transition: 'all 0.15s ease'
            }}
          >
            <Layers size={14} className={viewMode === 'all' ? 'text-red-400' : 'text-slate-400'} />
            <span>All Uploaded Documents (Master Dossier: {allUploadedDocuments.length})</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 1: ALL UPLOADED DOCUMENTS (MASTER REPOSITORY) */}
      {viewMode === 'all' ? (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fca5a5', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase' }}>
                <ShieldAlert size={14} />
                <span>Super Admin Audit View • Complete Document Dossier</span>
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '4px 0 0 0' }}>
                All Uploaded Documents Across National AI Registry
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Super Admin can inspect full OCR content, cryptographic hashes, and compliance tags for all uploaded dossiers.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setOnlyFirstTimerFilter(false)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: !onlyFirstTimerFilter ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                    color: !onlyFirstTimerFilter ? '#fff' : 'var(--text-muted)'
                  }}
                >
                  All Files ({allUploadedDocuments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOnlyFirstTimerFilter(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    background: onlyFirstTimerFilter ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                    color: onlyFirstTimerFilter ? '#fde68a' : 'var(--text-muted)'
                  }}
                >
                  <span>⚡ First-Timer Uploads ({firstTimerUploadsCount})</span>
                </button>
              </div>

              <div style={{ position: 'relative', width: '240px' }}>
                <input
                  type="text"
                  placeholder="Filter by filename, project, MDA..."
                  value={allDocsFilter}
                  onChange={(e) => setAllDocsFilter(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '34px', fontSize: '0.78rem', height: '34px' }}
                />
                <Search style={{ position: 'absolute', left: '10px', top: '9px', width: '14px', height: '14px', color: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>

          <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px 16px' }}>Document Name & Type</th>
                  <th style={{ padding: '12px 16px' }}>Associated AI Project</th>
                  <th style={{ padding: '12px 16px' }}>MDA Affiliation</th>
                  <th style={{ padding: '12px 16px' }}>Review & Regulatory Status</th>
                  <th style={{ padding: '12px 16px' }}>Signatures</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Dossier Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No uploaded documents match query.
                    </td>
                  </tr>
                ) : (
                  filteredAllDocuments.map(({ doc, project }) => {
                    const isFT = doc.isFirstTimerUpload || 
                      doc.uploadedByRole === 'First-Timer / New User' ||
                      doc.id.includes('onboard') ||
                      doc.signedBy?.includes('First-Timer / New User');

                    return (
                      <tr 
                        key={`${project.id}-${doc.id}`}
                        style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.15s ease' }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                            <FileText className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
                            <div>
                              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{doc.fileName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                Version {doc.version} • {doc.fileType.toUpperCase()} • {doc.uploadedAt}
                              </div>
                              {isFT && (
                                <div style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  background: 'rgba(251, 191, 36, 0.15)',
                                  border: '1px solid rgba(251, 191, 36, 0.35)',
                                  color: '#fde68a',
                                  fontSize: '0.66rem',
                                  fontWeight: 700,
                                  marginTop: '4px'
                                }}>
                                  <span>⚡ First-Timer Dossier: {doc.uploadedByName || 'Onboarder'}</span>
                                  {doc.uploadedByEmail && (
                                    <span style={{ color: 'var(--text-muted)' }}>({doc.uploadedByEmail})</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--ghana-emerald)', fontSize: '0.75rem' }}>{project.projectCode}</div>
                          <div style={{ color: 'var(--text-primary)', fontSize: '0.78rem' }}>{project.name}</div>
                        </td>
                        <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                          <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{project.mdaCode}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              width: 'fit-content',
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

                            {doc.reviewerComments && doc.reviewerComments.length > 0 ? (
                              <div 
                                onClick={() => setInspectingItem({ doc, project })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  color: '#93c5fd',
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                              >
                                <MessageSquare size={11} />
                                <span>{doc.reviewerComments.length} Review Directive{doc.reviewerComments.length > 1 ? 's' : ''}</span>
                              </div>
                            ) : (
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>No comments yet</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {doc.signedBy.length > 0 ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontWeight: 600, fontSize: '0.72rem' }}>
                              <ShieldCheck size={14} />
                              <span>Signed ({doc.signedBy.length})</span>
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Pending</span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {canReviewAndGrade && (
                              <button
                                type="button"
                                onClick={() => setReviewingItem({ doc, project })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '6px 12px',
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
                                <span>Review & Grade</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setInspectingItem({ doc, project })}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#93c5fd',
                                fontSize: '0.74rem',
                                fontWeight: 700,
                                cursor: 'pointer'
                              }}
                            >
                              <Eye size={13} />
                              <span>Inspect</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedProjectId(project.id);
                                setSelectedDoc(doc);
                                setViewMode('project');
                              }}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                color: '#e2e8f0',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                            >
                              <span>Vault</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: PROJECT SPECIFIC VAULT & REGULATORY CLEARANCE */
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '24px', alignItems: 'stretch' }}>
          
          {/* LEFT COLUMN: Project documents grid, OCR uploads & Automated Assessment card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Project Selector & Document Vault */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Project Document Vault</h3>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
                    Uploaded compliance dossiers, technical specs, and Act 843 data protection certificates.
                  </p>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>Project:</span>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => {
                      setSelectedProjectId(e.target.value);
                      setSelectedDoc(null);
                    }}
                    className="form-select"
                    style={{ width: '220px', padding: '6px 12px', fontSize: '0.8rem' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.projectCode} - {p.mdaCode}</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeProject && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  
                  {/* Active Project Header Summary */}
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    marginBottom: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 700 }}>
                        {activeProject.projectCode} • {activeProject.mda}
                      </div>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
                        {activeProject.name}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        padding: '3px 10px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        background: activeProject.reviewStatus === 'Approved'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : activeProject.reviewStatus === 'Pending'
                          ? 'rgba(251, 191, 36, 0.2)'
                          : activeProject.reviewStatus === 'Rejected'
                          ? 'rgba(239, 68, 68, 0.2)'
                          : 'rgba(59, 130, 246, 0.2)',
                        color: activeProject.reviewStatus === 'Approved'
                          ? '#10b981'
                          : activeProject.reviewStatus === 'Pending'
                          ? '#fbbf24'
                          : activeProject.reviewStatus === 'Rejected'
                          ? '#f87171'
                          : '#60a5fa',
                        border: '1px solid currentColor'
                      }}>
                        Registration: {activeProject.reviewStatus || 'Under Technical Review'}
                      </span>
                    </div>
                  </div>

                  {/* List of documents for active project */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Uploaded Files ({activeProject.documents.length})
                    </div>

                    {activeProject.documents.length === 0 ? (
                      <div style={{ padding: '32px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        No documents uploaded for this project yet. Use upload tool below to add compliance files.
                      </div>
                    ) : (
                      activeProject.documents.map(d => {
                        const isFT = d.isFirstTimerUpload || 
                          d.uploadedByRole === 'First-Timer / New User' ||
                          d.id.includes('onboard') ||
                          d.signedBy?.includes('First-Timer / New User');

                        return (
                          <div 
                            key={d.id}
                            onClick={() => setSelectedDoc(d)}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              padding: '12px 16px',
                              background: selectedDoc?.id === d.id ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.01)',
                              border: '1px solid',
                              borderColor: selectedDoc?.id === d.id ? 'rgba(16,185,129,0.35)' : 'var(--border-color)',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{d.fileName}</span>
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
                                      background: d.reviewStatus === 'Reviewed & Verified' ? 'rgba(16, 185, 129, 0.2)' :
                                                  d.reviewStatus === 'Requires Re-submission' ? 'rgba(239, 68, 68, 0.2)' :
                                                  d.reviewStatus === 'Under Review' ? 'rgba(59, 130, 246, 0.2)' :
                                                  'rgba(251, 191, 36, 0.2)',
                                      color: d.reviewStatus === 'Reviewed & Verified' ? '#10b981' :
                                             d.reviewStatus === 'Requires Re-submission' ? '#f87171' :
                                             d.reviewStatus === 'Under Review' ? '#60a5fa' :
                                             '#fbbf24',
                                      border: '1px solid currentColor'
                                    }}>
                                      {d.reviewStatus || 'Pending Review'}
                                    </span>
                                  </div>
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                    Version {d.version} • Uploaded {d.uploadedAt} {d.uploadedByName ? `by ${d.uploadedByName}` : ''}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {canReviewAndGrade && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setReviewingItem({ doc: d, project: activeProject });
                                    }}
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(5, 150, 105, 0.3))',
                                      border: '1px solid rgba(16, 185, 129, 0.5)',
                                      color: '#a7f3d0',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer'
                                    }}
                                  >
                                    <Award size={12} />
                                    <span>Review & Grade</span>
                                  </button>
                                )}

                                {d.signedBy.length > 0 ? (
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', color: 'var(--ghana-emerald)', fontWeight: 600 }}>
                                    <ShieldCheck className="w-4 h-4" />
                                    <span>Signed ({d.signedBy.length})</span>
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Unsigned</span>
                                )}

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setInspectingItem({ doc: d, project: activeProject });
                                  }}
                                  title="Inspect full extracted OCR text"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: 'rgba(255, 255, 255, 0.08)',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    color: '#fff',
                                    fontSize: '0.7rem',
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Eye size={12} /> Read OCR
                                </button>
                              </div>
                            </div>

                            {/* Direct Reviewer Feedback Snippet */}
                            {d.reviewerComments && d.reviewerComments.length > 0 && (
                              <div style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                background: 'rgba(0, 0, 0, 0.35)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                fontSize: '0.74rem'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                                  <span style={{ color: '#93c5fd', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                    <MessageSquare size={12} />
                                    <span>{d.reviewerComments[0].reviewerRole}: {d.reviewerComments[0].reviewerName}</span>
                                  </span>
                                  <span style={{
                                    fontSize: '0.66rem',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontWeight: 700,
                                    background: d.reviewerComments[0].verdict === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                                    color: d.reviewerComments[0].verdict === 'Approved' ? '#10b981' : '#f87171'
                                  }}>
                                    Verdict: {d.reviewerComments[0].verdict}
                                  </span>
                                </div>
                                <p style={{ color: '#e2e8f0', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>
                                  "{d.reviewerComments[0].comment}"
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Upload panel simulation */}
                  <div style={{ background: 'rgba(0,0,0,0.25)', padding: '20px', borderRadius: '10px', border: '1px dashed var(--border-color)', textAlign: 'center' }}>
                    {uploading ? (
                      <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--ghana-gold)', marginBottom: '8px' }}>
                          Uploading {newFileName} to sovereign S3 encrypted storage...
                        </div>
                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--ghana-gold)', transition: 'width 0.2s ease' }} />
                        </div>
                      </div>
                    ) : ocrWorking ? (
                      <div style={{ animation: 'fadeIn 0.3s ease' }}>
                        <div className="badge badge-warning" style={{ fontSize: '0.65rem', marginBottom: '8px', textTransform: 'uppercase' }}>OCR & Assessment Engine Active</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          Extracting text, verifying Act 843 clauses, and auto-calculating Governance & Readiness...
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label style={{ cursor: canEdit ? 'pointer' : 'default', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                          <Upload className="w-8 h-8 text-emerald-400" />
                          <div>
                            <span style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                              Click to upload project compliance dossier (PDF/DOCX)
                            </span>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                              Triggers automated OCR text extraction and immediate Governance & AI Readiness generation.
                            </div>
                          </div>
                          {canEdit ? (
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={triggerUpload}
                              style={{ display: 'none' }}
                            />
                          ) : (
                            <span className="badge badge-danger" style={{ fontSize: '0.65rem', marginTop: '6px' }}>Upload Blocked</span>
                          )}
                        </label>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

            {/* AUTOMATED GOVERNANCE & AI READINESS GENERATION CARD */}
            {activeProject && (
              <div className="glass-card" style={{
                border: '1px solid rgba(16, 185, 129, 0.3)',
                background: 'linear-gradient(145deg, rgba(16, 185, 129, 0.05), rgba(17, 24, 39, 0.9))',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ghana-emerald)'
                    }}>
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                        Automated Regulatory Assessment (AI Engine)
                      </h4>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                        System automatically generated from {activeProject.documents.length} uploaded document(s)
                      </p>
                    </div>
                  </div>

                  {/* Auto-generate / Re-evaluate button */}
                  <button
                    type="button"
                    onClick={handleAutoGenerateAssessment}
                    disabled={generatingAssessment}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                      border: 'none',
                      color: '#000',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Sparkles size={14} />
                    <span>{generatingAssessment ? 'Scanning Dossiers...' : 'Re-Evaluate from Documents'}</span>
                  </button>
                </div>

                {assessmentFeedback && (
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    color: '#a7f3d0',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}>
                    {assessmentFeedback}
                  </div>
                )}

                {/* Scorecards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  
                  {/* Governance & Ethics Card */}
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Governance & Ethics
                      </span>
                      <span style={{
                        fontSize: '0.72rem',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        background: activeProject.compliance.overallGrade === 'Excellent'
                          ? 'rgba(16, 185, 129, 0.2)'
                          : activeProject.compliance.overallGrade === 'Good'
                          ? 'rgba(59, 130, 246, 0.2)'
                          : 'rgba(239, 68, 68, 0.2)',
                        color: activeProject.compliance.overallGrade === 'Excellent'
                          ? '#10b981'
                          : activeProject.compliance.overallGrade === 'Good'
                          ? '#60a5fa'
                          : '#f87171'
                      }}>
                        Grade: {activeProject.compliance.overallGrade}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.74rem' }}>
                      <ScoreBar label="Fairness" value={activeProject.compliance.fairness} />
                      <ScoreBar label="Transparency" value={activeProject.compliance.transparency} />
                      <ScoreBar label="Accountability" value={activeProject.compliance.accountability} />
                      <ScoreBar label="Privacy (Act 843)" value={activeProject.compliance.privacy} />
                      <ScoreBar label="Security (OWASP)" value={activeProject.compliance.security} />
                    </div>
                  </div>

                  {/* AI Readiness Card */}
                  <div style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        AI Readiness Capability
                      </span>
                      <span style={{
                        fontSize: '0.85rem',
                        fontWeight: 800,
                        color: 'var(--ghana-gold)'
                      }}>
                        {activeProject.readinessScore}%
                      </span>
                    </div>

                    <div style={{ width: '100%', height: '8px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${activeProject.readinessScore}%`,
                        height: '100%',
                        background: 'linear-gradient(90deg, var(--ghana-gold), var(--ghana-emerald))',
                        borderRadius: '99px'
                      }} />
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '2px' }}>
                      {activeProject.autoAssessment?.readinessSummary || (
                        activeProject.documents.length > 0
                          ? `Evaluated from ${activeProject.documents.length} project files. Infrastructure and data governance structures satisfy statutory baseline.`
                          : 'Awaiting project documentation upload to evaluate compute, data, and policy pillars.'
                      )}
                    </div>

                    {/* Detected Regulatory Signals */}
                    <div style={{ marginTop: 'auto', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {(activeProject.autoAssessment?.keySignals || ['Ghana Act 843 Baseline', 'Model Spec Validated']).map((sig, i) => (
                        <span key={i} style={{
                          fontSize: '0.66rem',
                          padding: '2px 7px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#e2e8f0'
                        }}>
                          ✓ {sig}
                        </span>
                      ))}
                    </div>

                  </div>

                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Digital Auditing Drawer, OCR Search, Clearance Gates */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SUPER ADMIN REGISTRATION CLEARANCE SUITE (APPROVE / PEND / REJECT) */}
            {isSuperAdmin && activeProject && (
              <div className="glass-card" style={{
                border: '1px solid rgba(239, 68, 68, 0.35)',
                background: 'linear-gradient(145deg, rgba(239, 68, 68, 0.08), rgba(17, 24, 39, 0.95))',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <div>
                      <h3 style={{ fontSize: '0.98rem', fontWeight: 700, margin: 0, color: '#fca5a5' }}>
                        Super Admin Registration Clearance
                      </h3>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Statutory authority to Approve, Pend, or Reject project registration
                      </div>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.7rem',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontWeight: 700,
                    background: activeProject.reviewStatus === 'Approved'
                      ? 'rgba(16, 185, 129, 0.25)'
                      : activeProject.reviewStatus === 'Pending'
                      ? 'rgba(251, 191, 36, 0.25)'
                      : activeProject.reviewStatus === 'Rejected'
                      ? 'rgba(239, 68, 68, 0.25)'
                      : 'rgba(59, 130, 246, 0.25)',
                    color: activeProject.reviewStatus === 'Approved'
                      ? '#10b981'
                      : activeProject.reviewStatus === 'Pending'
                      ? '#fbbf24'
                      : activeProject.reviewStatus === 'Rejected'
                      ? '#f87171'
                      : '#60a5fa'
                  }}>
                    {activeProject.reviewStatus || 'Under Review'}
                  </span>
                </div>

                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                  After reviewing all uploaded documents and the auto-generated Governance & Ethics and AI Readiness ratings above, execute the final registration decree:
                </p>

                <textarea
                  rows={2}
                  value={superAdminDirectiveNotes}
                  onChange={(e) => setSuperAdminDirectiveNotes(e.target.value)}
                  placeholder="Enter official Super Admin registration directive, required amendments, or statutory approval comments..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    fontSize: '0.78rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />

                {/* 3 Executive Registration Actions: Approve, Pend, Reject */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleRegistrationDecision('Approved')}
                    style={{
                      padding: '9px 8px',
                      borderRadius: '6px',
                      background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                      color: '#0b0f19',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <CheckCircle2 size={13} /> Approve
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRegistrationDecision('Pending')}
                    style={{
                      padding: '9px 8px',
                      borderRadius: '6px',
                      background: 'rgba(245, 158, 11, 0.18)',
                      border: '1px solid rgba(245, 158, 11, 0.4)',
                      color: '#fde68a',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Clock size={13} /> Pend
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRegistrationDecision('Rejected')}
                    style={{
                      padding: '9px 8px',
                      borderRadius: '6px',
                      background: 'rgba(239, 68, 68, 0.18)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      color: '#fca5a5',
                      fontWeight: 700,
                      fontSize: '0.74rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <XCircle size={13} /> Reject
                  </button>
                </div>

                {regFeedback && (
                  <div style={{ fontSize: '0.72rem', color: '#10b981', textAlign: 'center', fontWeight: 600 }}>
                    ✓ {regFeedback}
                  </div>
                )}
              </div>
            )}

            {/* TECHNICAL CLEARANCE GATE (Strictly Restricted for First-Timers) */}
            {canAccessTechnicalClearanceGate ? (
              activeProject && (
                <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award className="w-4 h-4 text-emerald-400" />
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Technical Clearance Gate</h3>
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontWeight: 700,
                      background: activeProject.reviewStatus === 'Approved'
                        ? 'rgba(16, 185, 129, 0.2)'
                        : activeProject.reviewStatus === 'Recommended'
                        ? 'rgba(251, 191, 36, 0.2)'
                        : 'rgba(59, 130, 246, 0.2)',
                      color: activeProject.reviewStatus === 'Approved'
                        ? '#10b981'
                        : activeProject.reviewStatus === 'Recommended'
                        ? '#fbbf24'
                        : '#60a5fa'
                    }}>
                      {activeProject.reviewStatus || 'Under Technical Review'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Technical clearance officers screen uploaded documents and forward validated dossiers to the Director General queue.
                  </p>

                  {onUpdateProjectStatus && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <textarea
                        rows={2}
                        value={techNotes}
                        onChange={(e) => setTechNotes(e.target.value)}
                        placeholder="Enter technical clearance notes or recommendation summary..."
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: '#fff',
                          fontSize: '0.78rem',
                          outline: 'none',
                          resize: 'none'
                        }}
                      />

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus('Recommended')}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                            color: '#0b0f19',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <ArrowRight size={13} /> Recommend to DG
                        </button>

                        <button
                          type="button"
                          onClick={() => handleUpdateStatus('Needs Correction')}
                          style={{
                            padding: '8px 10px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.15)',
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            color: '#fde68a',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCcw size={13} /> Needs Correction
                        </button>
                      </div>

                      {statusFeedback && (
                        <div style={{ fontSize: '0.72rem', color: '#10b981', textAlign: 'center' }}>
                          ✓ {statusFeedback}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            ) : isFirstTimer ? (
              /* Notice explaining that Technical Clearance Gate is strictly restricted for First-Timers */
              <div className="glass-card" style={{
                border: '1px solid rgba(251, 191, 36, 0.3)',
                background: 'rgba(251, 191, 36, 0.05)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fde68a' }}>
                  <Lock size={16} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Technical Clearance Gate: Access Restricted</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                  First-Timer Onboarding Mode does not have access to Technical Clearance Gate controls or role activation. 
                  Super Admin will review your uploaded documents and decide project registration.
                </p>
              </div>
            ) : null}

            {/* OCR Full-Text Search Card */}
            <div className="glass-card">
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search className="w-4 h-4 text-emerald-400" />
                <span>Full-Text OCR Search</span>
              </h3>

              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <input
                  type="text"
                  placeholder="Query words like 'Act 843', 'OWASP', 'PII'..."
                  value={ocrSearchQuery}
                  onChange={(e) => setOcrSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingRight: '36px', fontSize: '0.82rem' }}
                />
              </div>

              {ocrSearchQuery && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--ghana-emerald)' }}>
                    Found {searchResults.length} occurrences in uploaded files:
                  </div>
                  {searchResults.length === 0 ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '10px 0' }}>No occurrences located.</div>
                  ) : (
                    searchResults.map((res, idx) => (
                      <div 
                        key={idx}
                        onClick={() => {
                          setSelectedProjectId(res.project.id);
                          setSelectedDoc(res.doc);
                          setInspectingItem({ doc: res.doc, project: res.project });
                        }}
                        style={{ padding: '8px', borderRadius: '6px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{res.doc.fileName}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem' }}>Project: {res.project.projectCode} ({res.project.mdaCode})</div>
                        <div style={{ color: 'var(--ghana-gold)', fontStyle: 'italic', marginTop: '4px', background: 'rgba(0,0,0,0.2)', padding: '4px' }}>
                          {res.snippet}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Document Details & Signature Panel */}
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '240px' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '16px' }}>Digital Auditing Drawer</h3>
              
              {selectedDoc ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selectedDoc.fileName}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Pre-signed URL: bucket/secure/{selectedDoc.id}.pdf
                  </span>

                  <div style={{ margin: '14px 0 10px 0' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                      Authenticity Signatures ({selectedDoc.signedBy.length})
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {selectedDoc.signedBy.map((signer, idx) => (
                        <span key={idx} className="badge badge-success" style={{ fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{signer}</span>
                        </span>
                      ))}
                      {selectedDoc.signedBy.length === 0 && (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>Pending regulatory signatures.</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => activeProject && setInspectingItem({ doc: selectedDoc, project: activeProject })}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.08)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <Eye size={13} /> Inspect Full Document Dossier
                    </button>

                    <button
                      onClick={() => handleDigitalSign(selectedDoc.id)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '9px', fontSize: '0.8rem' }}
                      disabled={!canSign || selectedDoc.signedBy.includes(currentRole as any)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Apply Signature Identity</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center', padding: '10px' }}>
                  <HelpCircle className="w-10 h-10 text-slate-500 mb-8" />
                  <span>Select a document in the vault above to view signatures and verify authenticity.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL (FULL OCR TEXT & REGULATORY ARTIFACT VIEWER) */}
      {inspectingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          background: 'rgba(5, 8, 15, 0.88)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card" style={{
            maxWidth: '740px',
            width: '100%',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
            padding: '24px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ghana-emerald)'
                }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                    {inspectingItem.doc.fileName}
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Project: <strong style={{ color: 'var(--ghana-emerald)' }}>{inspectingItem.project.projectCode}</strong> — {inspectingItem.project.name}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Metadata bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              fontSize: '0.74rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>MDA Affiliation:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{inspectingItem.project.mdaCode}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Uploaded Date:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>{inspectingItem.doc.uploadedAt}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Version & Type:</span>
                <div style={{ fontWeight: 600, color: '#fff' }}>v{inspectingItem.doc.version} • {inspectingItem.doc.fileType.toUpperCase()}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Integrity Seal:</span>
                <div style={{ fontWeight: 600, color: '#10b981' }}>Act 843 Verified</div>
              </div>
            </div>

            {/* Extracted OCR Text Content Viewer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, minHeight: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ghana-emerald)', letterSpacing: '0.05em' }}>
                  Extracted OCR Document Text
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Indexed via MinIO & Tesseract OCR Pipeline
                </span>
              </div>

              <div style={{
                flex: 1,
                overflowY: 'auto',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '0.82rem',
                lineHeight: 1.6,
                color: '#e2e8f0',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {getDocumentOcrText(inspectingItem.doc.id, inspectingItem.doc.fileName, inspectingItem.project.name)}
              </div>
            </div>

            {/* Modal Footer with Review & Grade Action */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '12px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>SHA-256 Checksum: sha256-{inspectingItem.doc.id}f89a2b</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {canReviewAndGrade && (
                  <button
                    type="button"
                    onClick={() => {
                      setReviewingItem({ doc: inspectingItem.doc, project: inspectingItem.project });
                      setInspectingItem(null);
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                      color: '#0b0f19',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Award size={14} />
                    <span>Review, Grade & Comment</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                >
                  Done Reading Dossier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT REVIEW & GRADING MODAL FOR ACTIVE ROLE PROFILES */}
      {reviewingItem && (
        <DocumentReviewGradeModal
          isOpen={!!reviewingItem}
          onClose={() => setReviewingItem(null)}
          document={reviewingItem.doc}
          project={reviewingItem.project}
          session={session as any}
          onSaveReview={(projectId, docId, comment, comp, read, stat) => {
            if (onReviewDocument) {
              onReviewDocument(projectId, docId, comment, comp, read, stat);
            }
            setReviewingItem(null);
          }}
        />
      )}

    </div>
  );
};

// Sub-component for Score Bars
const ScoreBar: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const getColor = (v: number) => {
    if (v >= 80) return 'var(--ghana-emerald)';
    if (v >= 65) return '#60a5fa';
    if (v >= 50) return 'var(--ghana-gold)';
    return '#f87171';
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontWeight: 700, color: getColor(value) }}>{value}%</span>
      </div>
      <div style={{ width: '100%', height: '5px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          width: `${value}%`,
          height: '100%',
          background: getColor(value),
          borderRadius: '99px'
        }} />
      </div>
    </div>
  );
};

// Sub-component icon
const FilesIconHeader: React.FC = () => (
  <div style={{
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--ghana-emerald)'
  }}>
    <FileText size={18} />
  </div>
);
