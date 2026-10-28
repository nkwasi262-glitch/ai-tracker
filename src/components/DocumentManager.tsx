import React, { useState, useEffect } from 'react';
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
  MessageSquare,
  BookOpen,
  Download,
  Send
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset, 
  DocumentReviewComment,
  ReviewWorkflowStatus, 
  ComplianceScore, 
  AutoAssessmentDetails, 
  ZeroAssumptionAudit,
  getFirstTimerMdaProjectId,
  ensureFirstTimerMdaProject
} from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';
import { 
  generateAssessmentFromDocuments, 
  getDocumentOcrText, 
  getFullDocumentSections,
  getFullDocumentText,
  registerUploadedDocumentOcr,
  registerUploadedFullDocument,
  readAndStoreRealUploadedFile,
  downloadOriginalDocument,
  getRealDocumentPreviewUrl,
  onRealFilesHydrated
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
  // Role permissions checks
  const isFirstTimer = session?.role === 'First-Timer / New User' || currentRole === 'First-Timer / New User' || !!session?.isFirstTimer || session?.memberType === 'new_member';
  const firstTimerMdaProjectId = isFirstTimer && session?.institution
    ? getFirstTimerMdaProjectId(session.institution)
    : '';
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    firstTimerMdaProjectId || projects[0]?.id || ''
  );

  useEffect(() => {
    if (isFirstTimer && firstTimerMdaProjectId && selectedProjectId !== firstTimerMdaProjectId) {
      setSelectedProjectId(firstTimerMdaProjectId);
    }
  }, [isFirstTimer, firstTimerMdaProjectId, selectedProjectId]);

  const activeProject = (() => {
    if (isFirstTimer && session?.institution) {
      const mdaProj = projects.find(p => p.id === firstTimerMdaProjectId) ||
        projects.find(p => (p.mda || '').toLowerCase() === session.institution.toLowerCase());
      if (mdaProj) return mdaProj;
      const ensured = ensureFirstTimerMdaProject(projects, session.institution, session.fullName, session.email);
      return ensured.mdaProject;
    }
    return projects.find(p => p.id === selectedProjectId) || projects[0];
  })();
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

  // View mode: 'project' (current project vault), 'onboarders' (dedicated First-Timer / Onboarder Full Documents Review & Grading studio), 'all' (master document explorer)
  const [viewMode, setViewMode] = useState<'project' | 'onboarders' | 'all'>('project');

  // States for the dedicated First-Timer / Onboarder Full Document Review & Grading workspace inside Documents & OCR
  const [selectedOnboarderDocKey, setSelectedOnboarderDocKey] = useState<string>('');
  const [onboarderReaderMode, setOnboarderReaderMode] = useState<'full' | 'sections' | 'ocr'>('full');
  const [onboarderActiveSectionIdx, setOnboarderActiveSectionIdx] = useState<number>(0);
  const [onboarderDocSearch, setOnboarderDocSearch] = useState<string>('');
  const [onboarderListFilter, setOnboarderListFilter] = useState<string>('');
  const [inlineVerdict, setInlineVerdict] = useState<'Approved' | 'Changes Requested' | 'Conditionally Cleared' | 'Under Investigation'>('Approved');
  const [inlineComment, setInlineComment] = useState<string>('');
  const [inlineEnableGrading, setInlineEnableGrading] = useState<boolean>(true);
  const [inlineEthics, setInlineEthics] = useState<number>(85);
  const [inlineDataPrivacy, setInlineDataPrivacy] = useState<number>(88);
  const [inlineTransparency, setInlineTransparency] = useState<number>(80);
  const [inlineBiasAudit, setInlineBiasAudit] = useState<number>(82);
  const [inlineCybersecurity, setInlineCybersecurity] = useState<number>(90);
  const [inlineReadiness, setInlineReadiness] = useState<number>(84);
  const [inlineProjectStatus, setInlineProjectStatus] = useState<ReviewWorkflowStatus>('Under Technical Review');
  const [inlineReviewFeedback, setInlineReviewFeedback] = useState<string | null>(null);

  // Inspection Modal reader state
  const [inspectReaderTab, setInspectReaderTab] = useState<'full' | 'sections' | 'ocr'>('full');
  const [inspectSectionIdx, setInspectSectionIdx] = useState<number>(0);
  const [inspectSearchQuery, setInspectSearchQuery] = useState<string>('');

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

  const isDocFirstTimer = (doc: DocumentAsset) =>
    !!(
      doc.isFirstTimerUpload ||
      doc.uploadedByRole === 'First-Timer / New User' ||
      doc.id.includes('onboard') ||
      doc.signedBy?.includes('First-Timer / New User')
    );

  const firstTimerDocumentsList = allUploadedDocuments.filter(item => isDocFirstTimer(item.doc));
  const firstTimerUploadsCount = firstTimerDocumentsList.length;

  // Filtered list for the dedicated First-Timer / Onboarder Review & Grading Center
  const filteredOnboarderDocuments = (firstTimerDocumentsList.length > 0 ? firstTimerDocumentsList : allUploadedDocuments).filter(item => {
    if (!onboarderListFilter.trim()) return true;
    const q = onboarderListFilter.toLowerCase();
    return (
      item.doc.fileName.toLowerCase().includes(q) ||
      item.project.name.toLowerCase().includes(q) ||
      item.project.projectCode.toLowerCase().includes(q) ||
      item.project.mda.toLowerCase().includes(q) ||
      item.project.mdaCode.toLowerCase().includes(q) ||
      (item.doc.uploadedByName && item.doc.uploadedByName.toLowerCase().includes(q)) ||
      (item.doc.uploadedByEmail && item.doc.uploadedByEmail.toLowerCase().includes(q)) ||
      (item.doc.documentCategory && item.doc.documentCategory.toLowerCase().includes(q))
    );
  });

  // Resolve the currently selected First-Timer / Onboarder document in the studio
  const activeOnboarderItem =
    filteredOnboarderDocuments.find(item => `${item.project.id}::${item.doc.id}` === selectedOnboarderDocKey) ||
    firstTimerDocumentsList.find(item => `${item.project.id}::${item.doc.id}` === selectedOnboarderDocKey) ||
    filteredOnboarderDocuments[0] ||
    firstTimerDocumentsList[0] ||
    allUploadedDocuments[0] ||
    null;

  // Select an onboarder document and sync grading controls with its project
  const handleSelectOnboarderDocument = (doc: DocumentAsset, project: AIProject) => {
    setSelectedOnboarderDocKey(`${project.id}::${doc.id}`);
    setOnboarderActiveSectionIdx(0);
    setInlineEthics(project.compliance?.fairness ?? 85);
    setInlineDataPrivacy(project.compliance?.privacy ?? 88);
    setInlineTransparency(project.compliance?.transparency ?? 80);
    setInlineBiasAudit(project.compliance?.accountability ?? 82);
    setInlineCybersecurity(project.compliance?.security ?? 90);
    setInlineReadiness(project.readinessScore ?? 84);
    setInlineProjectStatus(project.reviewStatus || 'Under Technical Review');
  };

  const [, setHydrationTick] = useState(0);
  useEffect(() => {
    return onRealFilesHydrated(() => setHydrationTick(t => t + 1));
  }, []);

  // Download full uploaded document (always downloads the exact original uploaded file)
  const handleDownloadFullDocument = (doc: DocumentAsset, project: AIProject) => {
    downloadOriginalDocument(doc, project);
  };

  // Compute live inline overall grade
  const inlineAvgCompliance = Math.round(
    (inlineEthics + inlineDataPrivacy + inlineTransparency + inlineBiasAudit + inlineCybersecurity) / 5
  );
  const inlineCalculatedGrade: ComplianceScore['overallGrade'] =
    inlineAvgCompliance >= 85 ? 'Excellent' :
    inlineAvgCompliance >= 70 ? 'Good' :
    inlineAvgCompliance >= 50 ? 'Moderate' : 'High Risk';

  // Submit inline review & module grading directly from the First-Timer / Onboarder Full Document Studio
  const handleInlineSubmitReview = (doc: DocumentAsset, project: AIProject) => {
    if (!onReviewDocument) return;
    const defaultComment =
      inlineVerdict === 'Approved'
        ? `Full uploaded document "${doc.fileName}" reviewed and verified against Act 843 Data Protection mandates, NITA Act 771 interoperability standards, and Ghana National AI Strategy (2023-2033).`
        : inlineVerdict === 'Changes Requested'
        ? `Full document inspection of "${doc.fileName}" requires additional technical clarification on demographic subgroup fairness testing and Act 843 DPIA schedules before final clearance.`
        : `Critical compliance gap flagged during full-document review of "${doc.fileName}". Mandatory remediation required prior to production deployment.`;

    const finalComment = inlineComment.trim() || defaultComment;
    const newCompliance: ComplianceScore | undefined = inlineEnableGrading
      ? {
          fairness: inlineEthics,
          privacy: inlineDataPrivacy,
          transparency: inlineTransparency,
          accountability: inlineBiasAudit,
          security: inlineCybersecurity,
          overallGrade: inlineCalculatedGrade
        }
      : undefined;

    const newReadiness = inlineEnableGrading ? inlineReadiness : undefined;

    const commentObj: DocumentReviewComment = {
      id: `rev-inline-${Date.now()}`,
      reviewerName: session?.fullName || String(currentRole),
      reviewerRole: session?.role || (currentRole as UserRole),
      reviewerEmail: session?.email || 'reviewer@nita.gov.gh',
      comment: finalComment,
      verdict: inlineVerdict,
      governanceAdjustment: newCompliance,
      readinessAdjustment: newReadiness,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' GMT'
    };

    onReviewDocument(
      project.id,
      doc.id,
      commentObj,
      newCompliance,
      newReadiness,
      inlineEnableGrading ? inlineProjectStatus : undefined
    );

    if (session) {
      recordAuditEvent({
        eventType: 'TECH_REVIEW_TRANSITION',
        actorName: session.fullName,
        actorEmail: session.email,
        actorRole: session.role,
        actorInstitution: session.institution,
        targetModule: 'documents',
        targetEntityId: project.id,
        actionDetails: `Full-Document Review & Grading submitted for "${doc.fileName}" (${project.projectCode}). Verdict: ${inlineVerdict}. ${
          inlineEnableGrading ? `Governance Grade: ${inlineCalculatedGrade}, AI Readiness: ${inlineReadiness}%.` : ''
        } Comment: "${finalComment}"`
      });
    }

    setInlineComment('');
    setInlineReviewFeedback(
      `✓ Review & Module Grading saved for "${doc.fileName}" (${project.projectCode}): Verdict "${inlineVerdict}"${
        inlineEnableGrading ? ` • Governance Grade "${inlineCalculatedGrade}" • AI Readiness ${inlineReadiness}%` : ''
      }.`
    );
    setTimeout(() => setInlineReviewFeedback(null), 6500);
  };

  const filteredAllDocuments = allUploadedDocuments.filter(item => {
    if (onlyFirstTimerFilter) {
      if (!isDocFirstTimer(item.doc)) return false;
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

  // Run full-text search across full uploaded documents and OCR transcripts
  const handleOcrSearch = () => {
    if (!ocrSearchQuery) return [];
    
    const results: { doc: DocumentAsset; project: AIProject; snippet: string }[] = [];
    projects.forEach(proj => {
      (proj.documents || []).forEach(doc => {
        const fullText = getFullDocumentText(doc, proj) + '\n' + getDocumentOcrText(doc.id, doc.fileName, proj.name);
        if (fullText.toLowerCase().includes(ocrSearchQuery.toLowerCase())) {
          const idx = fullText.toLowerCase().indexOf(ocrSearchQuery.toLowerCase());
          const start = Math.max(0, idx - 25);
          const end = Math.min(fullText.length, idx + ocrSearchQuery.length + 50);
          const snippet = '...' + fullText.substring(start, end).replace(/\s+/g, ' ') + '...';
          results.push({ doc, project: proj, snippet });
        }
      });
    });
    return results;
  };

  const searchResults = handleOcrSearch();

  // Handles file upload sequence and captures the REAL uploaded document content & binary
  const triggerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && activeProject) {
      const file = e.target.files[0];
      setNewFileName(file.name);
      setUploading(true);
      setUploadProgress(20);

      const fileSizeStr =
        file.size >= 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
          : `${Math.max(1, Math.round(file.size / 1024))} KB`;

      const nextDocId = `doc-new-${Date.now()}`;
      const ext = (file.name.split('.').pop() || 'pdf').toLowerCase();
      const resolvedType: 'pdf' | 'docx' | 'xlsx' | string =
        ext === 'docx' || ext === 'doc' ? 'docx' : ext === 'xlsx' || ext === 'xls' ? 'xlsx' : ext;

      const { dataUrl: capturedDataUrl, extractedText: capturedText } = await readAndStoreRealUploadedFile(file, nextDocId);
      setUploadProgress(80);
      setUploading(false);
      setOcrWorking(true);

      setTimeout(() => {
        setOcrWorking(false);
        setUploadProgress(100);

        const estimatedPages = capturedText
          ? Math.max(1, Math.ceil(capturedText.length / 3000))
          : 1;

        const doc: DocumentAsset = {
          id: nextDocId,
          fileName: file.name,
          fileType: resolvedType,
          fileSize: fileSizeStr,
          pageCount: estimatedPages,
          documentCategory: isFirstTimer
            ? 'First-Timer / Onboarder Full Submission Dossier'
            : 'Institutional Compliance & Technical Dossier',
          uploadedAt: new Date().toISOString().split('T')[0],
          version: 1,
          signedBy: [currentRole],
          uploadedByRole: session?.role || currentRole,
          uploadedByName: session?.fullName || 'Registry User',
          uploadedByEmail: session?.email || '',
          uploadedByMda: session?.institution || activeProject.mda,
          isFirstTimerUpload: isFirstTimer,
          reviewStatus: 'Pending Review',
          fullDocumentText: capturedText || undefined,
          fileDataUrl: capturedDataUrl && capturedDataUrl.length < 350000 ? capturedDataUrl : undefined
        };

        registerUploadedFullDocument(nextDocId, capturedText, capturedDataUrl || undefined);

        // Register OCR text for the newly uploaded document
        const simulatedOcr = getDocumentOcrText(nextDocId, file.name, activeProject.name);
        registerUploadedDocumentOcr(nextDocId, capturedText ? `${capturedText.slice(0, 4000)} ${simulatedOcr}` : simulatedOcr);

        onAddDocument(activeProject.id, doc);
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
            actionDetails: `Full Document "${file.name}" (${fileSizeStr}) uploaded by ${session.role} for project ${activeProject.projectCode}. Exact original file stored & indexed for Review & Grading.`
          });
        }

        setAssessmentFeedback(`✓ Original Document "${file.name}" (${fileSizeStr}) stored & parsed. System synchronized: AI Readiness (${auto.readinessScore}%), Governance & Ethics (${auto.compliance.overallGrade}), Zero-Assumption Provenance (${auto.zeroAssumptionAudit.evidenceBackingScore}%).`);
        setTimeout(() => setAssessmentFeedback(null), 7000);
      }, 450);
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            onClick={() => {
              if (firstTimerDocumentsList.length > 0 && !selectedOnboarderDocKey) {
                handleSelectOnboarderDocument(firstTimerDocumentsList[0].doc, firstTimerDocumentsList[0].project);
              }
              setViewMode('onboarders');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              border: viewMode === 'onboarders' ? '1px solid #fbbf24' : '1px solid rgba(251, 191, 36, 0.45)',
              background: viewMode === 'onboarders' ? 'rgba(251, 191, 36, 0.22)' : 'rgba(251, 191, 36, 0.08)',
              color: '#fde68a',
              boxShadow: viewMode === 'onboarders' ? '0 0 14px rgba(251, 191, 36, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <BookOpen size={14} className="text-amber-400" />
            <span>⚡ First-Timer / Onboarder Full Documents (Review & Grading: {firstTimerUploadsCount})</span>
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

      {/* VIEW MODE 0: FIRST-TIMER / ONBOARDER FULL DOCUMENTS REVIEW & GRADING STUDIO */}
      {viewMode === 'onboarders' ? (
        <div className="glass-card" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          background: 'linear-gradient(145deg, rgba(251, 191, 36, 0.04), rgba(15, 23, 42, 0.96))'
        }}>
          {/* Studio Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: '1px solid rgba(251, 191, 36, 0.25)',
            paddingBottom: '14px'
          }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#fde68a', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                <BookOpen size={14} />
                <span>First-Timer & Onboarder Full Document Access • Review & Module Grading Studio</span>
              </div>
              <h2 style={{ fontSize: '1.18rem', fontWeight: 800, margin: '4px 0 0 0', color: '#fff' }}>
                Full Documents Uploaded by First-Timers / Onboarders (Review & Grading Workspace)
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
                Read the complete multi-page statutory submissions uploaded by First-Timers and Onboarders side-by-side while reviewing, commenting, and grading Governance & Ethics and AI Readiness.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', width: '250px' }}>
                <input
                  type="text"
                  placeholder="Filter onboarder documents or MDA..."
                  value={onboarderListFilter}
                  onChange={(e) => setOnboarderListFilter(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '32px', fontSize: '0.76rem', height: '34px' }}
                />
                <Search style={{ position: 'absolute', left: '10px', top: '9px', width: '14px', height: '14px', color: 'var(--text-muted)' }} />
              </div>

              {activeOnboarderItem && (
                <button
                  type="button"
                  onClick={() => handleDownloadFullDocument(activeOnboarderItem.doc, activeOnboarderItem.project)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '7px 14px',
                    borderRadius: '8px',
                    background: 'rgba(59, 130, 246, 0.16)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#93c5fd',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={13} />
                  <span>Download Full Document</span>
                </button>
              )}
            </div>
          </div>

          {inlineReviewFeedback && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.18)',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              color: '#a7f3d0',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{inlineReviewFeedback}</span>
            </div>
          )}

          {/* 3-Column / Split Studio: Left (Onboarder Document Queue), Center (Full Multi-Page Document Reader), Right (Review & Grading Controls) */}
          <div style={{ display: 'grid', gridTemplateColumns: '310px 1.35fr 1fr', gap: '16px', alignItems: 'start' }}>
            {/* Column 1: First-Timer / Onboarder Uploaded Documents Queue */}
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '720px',
              overflowY: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#fde68a', letterSpacing: '0.04em' }}>
                  Onboarder Submissions ({filteredOnboarderDocuments.length})
                </span>
                <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                  Click to Read & Grade
                </span>
              </div>

              {filteredOnboarderDocuments.map(({ doc, project }) => {
                const isSelected = activeOnboarderItem?.doc.id === doc.id && activeOnboarderItem?.project.id === project.id;
                const sections = getFullDocumentSections(doc, project);
                return (
                  <div
                    key={`${project.id}-${doc.id}`}
                    onClick={() => handleSelectOnboarderDocument(doc, project)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #fbbf24' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: isSelected ? 'rgba(251, 191, 36, 0.14)' : 'rgba(255, 255, 255, 0.02)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isSelected ? '#fde68a' : '#fff', lineHeight: 1.3 }}>
                        {doc.fileName}
                      </span>
                      <span style={{
                        fontSize: '0.62rem',
                        padding: '1px 6px',
                        borderRadius: '999px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                        background: doc.reviewStatus === 'Reviewed & Verified' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                        color: doc.reviewStatus === 'Reviewed & Verified' ? '#10b981' : '#fbbf24'
                      }}>
                        {doc.reviewStatus || 'Pending Review'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.68rem', color: 'var(--ghana-emerald)', fontWeight: 700 }}>
                      {project.projectCode} • {project.mdaCode}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      Uploader: <strong style={{ color: '#e2e8f0' }}>{doc.uploadedByName || 'First-Timer Onboarder'}</strong> ({doc.uploadedByRole || 'First-Timer / New User'})
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      <span>{doc.pageCount || sections.length} Pages • {doc.fileSize || '1.8 MB'}</span>
                      <span>Grade: <strong style={{ color: '#a7f3d0' }}>{project.compliance.overallGrade}</strong> ({project.readinessScore}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Column 2: Complete Multi-Page Full Document Reader */}
            {activeOnboarderItem ? (
              <div style={{
                background: 'rgba(0, 0, 0, 0.38)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '720px',
                overflow: 'hidden'
              }}>
                {/* Document Metadata Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff' }}>
                        {activeOnboarderItem.doc.fileName}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(251, 191, 36, 0.18)',
                        border: '1px solid rgba(251, 191, 36, 0.45)',
                        color: '#fde68a',
                        fontSize: '0.65rem',
                        fontWeight: 700
                      }}>
                        ⚡ FULL ONBOARDER SUBMISSION
                      </span>
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                      Project: <strong style={{ color: 'var(--ghana-emerald)' }}>{activeOnboarderItem.project.projectCode}</strong> ({activeOnboarderItem.project.name}) • Uploaded by <strong style={{ color: '#fde68a' }}>{activeOnboarderItem.doc.uploadedByName || 'Onboarder'}</strong> {activeOnboarderItem.doc.uploadedByEmail ? `<${activeOnboarderItem.doc.uploadedByEmail}>` : ''}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setInspectingItem(activeOnboarderItem)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.18)',
                        color: '#fff',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Eye size={12} /> Full-Screen Reader
                    </button>
                  </div>
                </div>

                {/* Reader Mode Tabs & Search Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setOnboarderReaderMode('full')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.71rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: onboarderReaderMode === 'full' ? '1px solid var(--ghana-emerald)' : '1px solid var(--border-color)',
                        background: onboarderReaderMode === 'full' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: onboarderReaderMode === 'full' ? '#a7f3d0' : 'var(--text-secondary)'
                      }}
                    >
                      Complete Full Document (All Pages)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboarderReaderMode('sections')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.71rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: onboarderReaderMode === 'sections' ? '1px solid #fbbf24' : '1px solid var(--border-color)',
                        background: onboarderReaderMode === 'sections' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: onboarderReaderMode === 'sections' ? '#fde68a' : 'var(--text-secondary)'
                      }}
                    >
                      Page-by-Page Reader ({getFullDocumentSections(activeOnboarderItem.doc, activeOnboarderItem.project).length} Pages)
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboarderReaderMode('ocr')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        fontSize: '0.71rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        border: onboarderReaderMode === 'ocr' ? '1px solid #60a5fa' : '1px solid var(--border-color)',
                        background: onboarderReaderMode === 'ocr' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                        color: onboarderReaderMode === 'ocr' ? '#93c5fd' : 'var(--text-secondary)'
                      }}
                    >
                      Extracted OCR Summary
                    </button>
                  </div>

                  <div style={{ position: 'relative', width: '200px' }}>
                    <input
                      type="text"
                      placeholder="Search inside full document..."
                      value={onboarderDocSearch}
                      onChange={(e) => setOnboarderDocSearch(e.target.value)}
                      className="form-input"
                      style={{ paddingLeft: '28px', fontSize: '0.72rem', height: '30px' }}
                    />
                    <Search style={{ position: 'absolute', left: '8px', top: '8px', width: '13px', height: '13px', color: 'var(--text-muted)' }} />
                  </div>
                </div>

                {/* Page selector pills when in Page-by-Page mode */}
                {onboarderReaderMode === 'sections' && (
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {getFullDocumentSections(activeOnboarderItem.doc, activeOnboarderItem.project).map((sec, idx) => (
                      <button
                        key={sec.pageNumber}
                        type="button"
                        onClick={() => setOnboarderActiveSectionIdx(idx)}
                        style={{
                          padding: '4px 9px',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: onboarderActiveSectionIdx === idx ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                          background: onboarderActiveSectionIdx === idx ? 'rgba(251, 191, 36, 0.22)' : 'rgba(255,255,255,0.03)',
                          color: onboarderActiveSectionIdx === idx ? '#fde68a' : 'var(--text-secondary)'
                        }}
                      >
                        Page {sec.pageNumber}: {sec.sectionTitle.substring(0, 24)}...
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Scrollable Full Document Content */}
                {(() => {
                  const previewUrl = getRealDocumentPreviewUrl(activeOnboarderItem.doc.id, activeOnboarderItem.doc);
                  const isPdf = activeOnboarderItem.doc.fileType.toLowerCase() === 'pdf' || activeOnboarderItem.doc.fileName.toLowerCase().endsWith('.pdf');
                  const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(activeOnboarderItem.doc.fileType.toLowerCase());
                  const sections = getFullDocumentSections(activeOnboarderItem.doc, activeOnboarderItem.project);
                  const activeSec = sections[onboarderActiveSectionIdx] || sections[0];
                  const rawText =
                    onboarderReaderMode === 'full'
                      ? getFullDocumentText(activeOnboarderItem.doc, activeOnboarderItem.project)
                      : onboarderReaderMode === 'sections' && activeSec
                      ? `--- PAGE ${activeSec.pageNumber} OF ${sections.length}: ${activeSec.sectionTitle} ---\n\n${activeSec.content}`
                      : getDocumentOcrText(activeOnboarderItem.doc.id, activeOnboarderItem.doc.fileName, activeOnboarderItem.project.name);

                  const displayStr = (() => {
                    if (!onboarderDocSearch.trim()) return rawText;
                    const lines = rawText.split('\n');
                    const matchingLines = lines.filter(line =>
                      line.toLowerCase().includes(onboarderDocSearch.toLowerCase())
                    );
                    return matchingLines.length > 0
                      ? `=== SEARCH MATCHES FOR "${onboarderDocSearch}" (${matchingLines.length} lines matched in Full Document) ===\n\n` +
                          matchingLines.join('\n\n') +
                          `\n\n=== COMPLETE DOCUMENT TRANSCRIPT BELOW ===\n\n` +
                          rawText
                      : `No exact matches for "${onboarderDocSearch}". Showing complete full document:\n\n` + rawText;
                  })();

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
                      {onboarderReaderMode === 'full' && previewUrl && isPdf && (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.35)', background: '#fff' }}>
                          <iframe
                            src={previewUrl}
                            title={`Uploaded PDF: ${activeOnboarderItem.doc.fileName}`}
                            style={{ width: '100%', height: '460px', border: 'none', display: 'block' }}
                          />
                        </div>
                      )}
                      {onboarderReaderMode === 'full' && previewUrl && isImg && (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.35)', background: '#0f172a', padding: '12px', textAlign: 'center' }}>
                          <img src={previewUrl} alt={activeOnboarderItem.doc.fileName} style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '6px' }} />
                        </div>
                      )}
                      <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        background: 'rgba(5, 10, 20, 0.85)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        padding: '16px',
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: '0.78rem',
                        lineHeight: 1.65,
                        color: '#e2e8f0',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {displayStr}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : null}

            {/* Column 3: Inline Review, Comment & Module Grading Panel */}
            {activeOnboarderItem ? (
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '10px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                maxHeight: '720px',
                overflowY: 'auto'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--ghana-emerald)', textTransform: 'uppercase' }}>
                      Review & Module Grading
                    </div>
                    <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                      Grade While Reading Full Document
                    </div>
                  </div>
                  {canReviewAndGrade && (
                    <button
                      type="button"
                      onClick={() => setReviewingItem(activeOnboarderItem)}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.2)',
                        border: '1px solid rgba(16, 185, 129, 0.45)',
                        color: '#a7f3d0',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Pop-Out Studio
                    </button>
                  )}
                </div>

                {canReviewAndGrade ? (
                  <>
                    {/* Verdict Selector */}
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                        1. Document Review Verdict
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                        {(['Approved', 'Changes Requested', 'Under Investigation'] as const).map(v => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setInlineVerdict(v)}
                            style={{
                              padding: '6px 4px',
                              borderRadius: '6px',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: inlineVerdict === v ? '1px solid currentColor' : '1px solid var(--border-color)',
                              background:
                                inlineVerdict === v
                                  ? v === 'Approved'
                                    ? 'rgba(16, 185, 129, 0.22)'
                                    : v === 'Changes Requested'
                                    ? 'rgba(251, 191, 36, 0.22)'
                                    : 'rgba(239, 68, 68, 0.22)'
                                  : 'rgba(255,255,255,0.03)',
                              color:
                                v === 'Approved'
                                  ? '#10b981'
                                  : v === 'Changes Requested'
                                  ? '#fbbf24'
                                  : '#f87171'
                            }}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reviewer Comment */}
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                        2. Reviewer Directive & Finding on Full Document
                      </label>
                      <textarea
                        rows={3}
                        value={inlineComment}
                        onChange={(e) => setInlineComment(e.target.value)}
                        placeholder="Enter statutory review findings from the onboarder's full uploaded document..."
                        className="form-input"
                        style={{ width: '100%', fontSize: '0.74rem', padding: '8px', resize: 'vertical' }}
                      />
                    </div>

                    {/* Module Grading Sliders */}
                    <div style={{
                      padding: '10px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', fontWeight: 700, color: '#fde68a', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={inlineEnableGrading}
                            onChange={(e) => setInlineEnableGrading(e.target.checked)}
                          />
                          <span>3. Grade Modules from Full Document</span>
                        </label>
                        <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#10b981' }}>
                          {inlineCalculatedGrade} ({inlineAvgCompliance}%)
                        </span>
                      </div>

                      {inlineEnableGrading && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.7rem' }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Ethics & Human Rights</span>
                              <strong>{inlineEthics}%</strong>
                            </div>
                            <input type="range" min={0} max={100} value={inlineEthics} onChange={(e) => setInlineEthics(Number(e.target.value))} style={{ width: '100%' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Act 843 Data Privacy</span>
                              <strong>{inlineDataPrivacy}%</strong>
                            </div>
                            <input type="range" min={0} max={100} value={inlineDataPrivacy} onChange={(e) => setInlineDataPrivacy(Number(e.target.value))} style={{ width: '100%' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Algorithmic Transparency</span>
                              <strong>{inlineTransparency}%</strong>
                            </div>
                            <input type="range" min={0} max={100} value={inlineTransparency} onChange={(e) => setInlineTransparency(Number(e.target.value))} style={{ width: '100%' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Bias & Fairness Audit</span>
                              <strong>{inlineBiasAudit}%</strong>
                            </div>
                            <input type="range" min={0} max={100} value={inlineBiasAudit} onChange={(e) => setInlineBiasAudit(Number(e.target.value))} style={{ width: '100%' }} />
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span>Cybersecurity Posture</span>
                              <strong>{inlineCybersecurity}%</strong>
                            </div>
                            <input type="range" min={0} max={100} value={inlineCybersecurity} onChange={(e) => setInlineCybersecurity(Number(e.target.value))} style={{ width: '100%' }} />
                          </div>
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#93c5fd' }}>
                              <span>AI Readiness Score</span>
                              <strong>{inlineReadiness}%</strong>
                            </div>
                            <input type="range" min={0} max={100} value={inlineReadiness} onChange={(e) => setInlineReadiness(Number(e.target.value))} style={{ width: '100%' }} />
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInlineSubmitReview(activeOnboarderItem.doc, activeOnboarderItem.project)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                        color: '#06130e',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                    >
                      <Send size={14} />
                      <span>Submit Full-Document Review & Grade</span>
                    </button>
                  </>
                ) : (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    You can read and download the complete uploaded document here. Statutory module grading is reserved for Super Admin, Director General, Technical Director, and Technical Clearance Team.
                  </div>
                )}

                {/* Previous Review Comments History on this Document */}
                {activeOnboarderItem.doc.reviewerComments && activeOnboarderItem.doc.reviewerComments.length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: '#93c5fd' }}>
                      Recorded Review Directives ({activeOnboarderItem.doc.reviewerComments.length})
                    </div>
                    {activeOnboarderItem.doc.reviewerComments.map(c => (
                      <div key={c.id} style={{ padding: '8px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.7rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#fde68a' }}>
                          <span>{c.reviewerRole}: {c.reviewerName}</span>
                          <span>{c.verdict}</span>
                        </div>
                        <div style={{ color: '#e2e8f0', marginTop: '3px', fontStyle: 'italic' }}>"{c.comment}"</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : viewMode === 'all' ? (
        /* VIEW MODE 1: ALL UPLOADED DOCUMENTS (MASTER REPOSITORY) */
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
                Super Admin can inspect full multi-page uploaded documents, OCR content, cryptographic hashes, and compliance tags for all uploaded dossiers.
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
                    const isFT = isDocFirstTimer(doc);

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
                                Version {doc.version} • {doc.fileType.toUpperCase()} • {doc.pageCount || 6} Pages • {doc.fileSize || '1.8 MB'} • {doc.uploadedAt}
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
                                  <span>⚡ First-Timer Full Dossier: {doc.uploadedByName || 'Onboarder'}</span>
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
                                <span>Review & Grade (Full Doc)</span>
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
                              <BookOpen size={13} />
                              <span>Read Full Doc</span>
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
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    {isFirstTimer ? 'Logged-In MDA:' : 'Project:'}
                  </span>
                  {isFirstTimer ? (
                    <div style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      background: 'rgba(16, 185, 129, 0.14)',
                      border: '1px solid rgba(16, 185, 129, 0.45)',
                      color: '#6ee7b7',
                      fontSize: '0.78rem',
                      fontWeight: 800
                    }}>
                      🏛️ {session?.institution || activeProject?.mda} ({activeProject?.projectCode})
                    </div>
                  ) : (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value);
                        setSelectedDoc(null);
                      }}
                      className="form-select"
                      style={{ width: '250px', padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      {projects.map(p => (
                        <option key={p.id} value={p.id}>{p.projectCode} - {p.name} ({p.mdaCode})</option>
                      ))}
                    </select>
                  )}
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
                    {/* Dedicated First-Timer / Onboarder Full Document Access Banner inside Project Vault */}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.14), rgba(16, 185, 129, 0.08))',
                      border: '1px solid rgba(251, 191, 36, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '10px',
                      marginBottom: '6px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <BookOpen size={16} className="text-amber-400" />
                        <div>
                          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#fde68a' }}>
                            First-Timer & Onboarder Full Document Access (Review & Grading)
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                            Full multi-page uploaded documents are preserved verbatim for side-by-side inspection while grading Governance & Ethics and AI Readiness.
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const projectFTDoc = activeProject.documents.find(d => isDocFirstTimer(d)) || activeProject.documents[0];
                          if (projectFTDoc) {
                            handleSelectOnboarderDocument(projectFTDoc, activeProject);
                          }
                          setViewMode('onboarders');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(251, 191, 36, 0.22)',
                          border: '1px solid rgba(251, 191, 36, 0.5)',
                          color: '#fde68a',
                          fontSize: '0.72rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <BookOpen size={13} />
                        <span>Open Onboarder Full Documents Studio ({firstTimerUploadsCount})</span>
                      </button>
                    </div>

                    <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>
                      Uploaded Files ({activeProject.documents.length})
                    </div>

                    {activeProject.documents.length === 0 ? (
                      <div style={{ padding: '32px', border: '1px dashed var(--border-color)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        No documents uploaded for this project yet. Use upload tool below to add compliance files.
                      </div>
                    ) : (
                      activeProject.documents.map(d => {
                        const isFT = isDocFirstTimer(d);

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
                                        ⚡ Onboarder Full Document
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
                                    Version {d.version} • {d.pageCount || 6} Pages • {d.fileSize || '1.8 MB'} • Uploaded {d.uploadedAt} {d.uploadedByName ? `by ${d.uploadedByName}` : ''}
                                  </div>
                                </div>
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
                                    <span>Review & Grade (Full Doc)</span>
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
                                    setInspectReaderTab('full');
                                    setInspectSectionIdx(0);
                                    setInspectingItem({ doc: d, project: activeProject });
                                  }}
                                  title="Read complete uploaded document & extracted OCR text"
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    background: 'rgba(59, 130, 246, 0.16)',
                                    border: '1px solid rgba(59, 130, 246, 0.35)',
                                    color: '#93c5fd',
                                    fontSize: '0.7rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <BookOpen size={12} /> Read Full Document
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDownloadFullDocument(d, activeProject);
                                  }}
                                  title="Download full uploaded document"
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
                                  <Download size={12} />
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
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '16px' }}>Digital Auditing & Full Document Drawer</h3>
              
              {selectedDoc ? (
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {selectedDoc.fileName}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Pre-signed URL: bucket/secure/{selectedDoc.id}.{selectedDoc.fileType || 'pdf'} • {selectedDoc.pageCount || 6} Pages • {selectedDoc.fileSize || '1.8 MB'}
                  </span>
                  {selectedDoc.uploadedByName && (
                    <div style={{ fontSize: '0.72rem', color: '#fde68a', marginTop: '4px', fontWeight: 600 }}>
                      Uploaded by: {selectedDoc.uploadedByName} ({selectedDoc.uploadedByRole || 'Registry User'})
                    </div>
                  )}

                  {activeProject && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      background: 'rgba(0, 0, 0, 0.35)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      maxHeight: '110px',
                      overflowY: 'auto',
                      fontFamily: 'monospace',
                      fontSize: '0.68rem',
                      color: '#cbd5e1',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {getFullDocumentText(selectedDoc, activeProject).substring(0, 620)}...
                    </div>
                  )}

                  <div style={{ margin: '12px 0 10px 0' }}>
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
                      onClick={() => {
                        if (activeProject) {
                          setInspectReaderTab('full');
                          setInspectSectionIdx(0);
                          setInspectingItem({ doc: selectedDoc, project: activeProject });
                        }
                      }}
                      style={{
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(59, 130, 246, 0.16)',
                        border: '1px solid rgba(59, 130, 246, 0.35)',
                        color: '#93c5fd',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px'
                      }}
                    >
                      <BookOpen size={13} /> Read Complete Uploaded Document
                    </button>

                    {canReviewAndGrade && activeProject && (
                      <button
                        type="button"
                        onClick={() => setReviewingItem({ doc: selectedDoc, project: activeProject })}
                        style={{
                          padding: '8px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.45)',
                          color: '#a7f3d0',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <Award size={13} /> Review & Grade with Full Document
                      </button>
                    )}

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
                  <span>Select a document in the vault above to read its full uploaded content, view signatures, and verify authenticity.</span>
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* DOCUMENT INSPECTION MODAL (COMPLETE FULL UPLOADED DOCUMENT & MULTI-PAGE READER) */}
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
            maxWidth: '940px',
            width: '100%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
            padding: '24px',
            overflow: 'hidden'
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', gap: '12px' }}>
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
                  <BookOpen size={22} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#fff' }}>
                      {inspectingItem.doc.fileName}
                    </h3>
                    {isDocFirstTimer(inspectingItem.doc) && (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(251, 191, 36, 0.18)',
                        border: '1px solid rgba(251, 191, 36, 0.45)',
                        color: '#fde68a',
                        fontSize: '0.66rem',
                        fontWeight: 700
                      }}>
                        ⚡ First-Timer / Onboarder Full Uploaded Document
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Project: <strong style={{ color: 'var(--ghana-emerald)' }}>{inspectingItem.project.projectCode}</strong> — {inspectingItem.project.name} • Uploaded by <strong style={{ color: '#fde68a' }}>{inspectingItem.doc.uploadedByName || 'Onboarder'}</strong> ({inspectingItem.doc.uploadedByRole || 'First-Timer / New User'})
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => handleDownloadFullDocument(inspectingItem.doc, inspectingItem.project)}
                  style={{
                    background: 'rgba(59, 130, 246, 0.16)',
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    color: '#93c5fd',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    cursor: 'pointer',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Download size={14} />
                  <span>Download Full Document</span>
                </button>

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
            </div>

            {/* Metadata bar */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
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
                <span style={{ color: 'var(--text-muted)' }}>Pages & Size:</span>
                <div style={{ fontWeight: 600, color: '#fde68a' }}>{inspectingItem.doc.pageCount || getFullDocumentSections(inspectingItem.doc, inspectingItem.project).length} Pages • {inspectingItem.doc.fileSize || '1.8 MB'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Integrity Seal:</span>
                <div style={{ fontWeight: 600, color: '#10b981' }}>Act 843 Verified</div>
              </div>
            </div>

            {/* Reader Mode Tabs & Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setInspectReaderTab('full')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: inspectReaderTab === 'full' ? '1px solid var(--ghana-emerald)' : '1px solid var(--border-color)',
                    background: inspectReaderTab === 'full' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: inspectReaderTab === 'full' ? '#a7f3d0' : 'var(--text-secondary)'
                  }}
                >
                  Complete Full Document (All Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setInspectReaderTab('sections')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: inspectReaderTab === 'sections' ? '1px solid #fbbf24' : '1px solid var(--border-color)',
                    background: inspectReaderTab === 'sections' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: inspectReaderTab === 'sections' ? '#fde68a' : 'var(--text-secondary)'
                  }}
                >
                  Page-by-Page Reader ({getFullDocumentSections(inspectingItem.doc, inspectingItem.project).length} Pages)
                </button>
                <button
                  type="button"
                  onClick={() => setInspectReaderTab('ocr')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: inspectReaderTab === 'ocr' ? '1px solid #60a5fa' : '1px solid var(--border-color)',
                    background: inspectReaderTab === 'ocr' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.04)',
                    color: inspectReaderTab === 'ocr' ? '#93c5fd' : 'var(--text-secondary)'
                  }}
                >
                  Extracted OCR Summary
                </button>
              </div>

              <div style={{ position: 'relative', width: '240px' }}>
                <input
                  type="text"
                  placeholder="Search inside full document..."
                  value={inspectSearchQuery}
                  onChange={(e) => setInspectSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '30px', fontSize: '0.74rem', height: '32px' }}
                />
                <Search style={{ position: 'absolute', left: '9px', top: '9px', width: '13px', height: '13px', color: 'var(--text-muted)' }} />
              </div>
            </div>

            {inspectReaderTab === 'sections' && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {getFullDocumentSections(inspectingItem.doc, inspectingItem.project).map((sec, idx) => (
                  <button
                    key={sec.pageNumber}
                    type="button"
                    onClick={() => setInspectSectionIdx(idx)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: inspectSectionIdx === idx ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)',
                      background: inspectSectionIdx === idx ? 'rgba(251, 191, 36, 0.22)' : 'rgba(255,255,255,0.03)',
                      color: inspectSectionIdx === idx ? '#fde68a' : 'var(--text-secondary)'
                    }}
                  >
                    Page {sec.pageNumber}: {sec.sectionTitle}
                  </button>
                ))}
              </div>
            )}

            {/* Full Document Text Content Viewer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, minHeight: 0 }}>
              {(() => {
                const previewUrl = getRealDocumentPreviewUrl(inspectingItem.doc.id, inspectingItem.doc);
                const isPdf = inspectingItem.doc.fileType.toLowerCase() === 'pdf' || inspectingItem.doc.fileName.toLowerCase().endsWith('.pdf');
                const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(inspectingItem.doc.fileType.toLowerCase());
                const sections = getFullDocumentSections(inspectingItem.doc, inspectingItem.project);
                const activeSec = sections[inspectSectionIdx] || sections[0];
                const content =
                  inspectReaderTab === 'full'
                    ? getFullDocumentText(inspectingItem.doc, inspectingItem.project)
                    : inspectReaderTab === 'sections' && activeSec
                    ? `--- PAGE ${activeSec.pageNumber} OF ${sections.length}: ${activeSec.sectionTitle} ---\n\n${activeSec.content}`
                    : getDocumentOcrText(inspectingItem.doc.id, inspectingItem.doc.fileName, inspectingItem.project.name);

                const displayStr = (() => {
                  if (!inspectSearchQuery.trim()) return content;
                  const matched = content
                    .split('\n')
                    .filter(line => line.toLowerCase().includes(inspectSearchQuery.toLowerCase()));
                  return matched.length > 0
                    ? `=== MATCHING LINES FOR "${inspectSearchQuery}" (${matched.length}) ===\n\n${matched.join('\n\n')}\n\n=== FULL DOCUMENT BELOW ===\n\n${content}`
                    : content;
                })();

                return (
                  <>
                    {inspectReaderTab === 'full' && previewUrl && isPdf && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.35)', background: '#fff' }}>
                        <iframe
                          src={previewUrl}
                          title={`Uploaded PDF: ${inspectingItem.doc.fileName}`}
                          style={{ width: '100%', height: '480px', border: 'none', display: 'block' }}
                        />
                      </div>
                    )}
                    {inspectReaderTab === 'full' && previewUrl && isImg && (
                      <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.35)', background: '#0f172a', padding: '12px', textAlign: 'center' }}>
                        <img src={previewUrl} alt={inspectingItem.doc.fileName} style={{ maxWidth: '100%', maxHeight: '420px', borderRadius: '6px' }} />
                      </div>
                    )}
                    <div style={{
                      flex: 1,
                      overflowY: 'auto',
                      background: 'rgba(0, 0, 0, 0.45)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      padding: '16px',
                      fontSize: '0.8rem',
                      lineHeight: 1.65,
                      color: '#e2e8f0',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {displayStr}
                    </div>
                  </>
                );
              })()}
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
                    <span>Review, Grade & Comment (Side-by-Side Full Doc)</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setInspectingItem(null)}
                  className="btn btn-primary"
                  style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                >
                  Done Reading Full Document
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
          allProjects={projects}
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
