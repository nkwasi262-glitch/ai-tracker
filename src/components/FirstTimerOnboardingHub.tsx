import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  ArrowRight, 
  Clock, 
  Send,
  Info,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset, 
  DocumentReviewComment,
  ReviewWorkflowStatus,
  ComplianceScore, 
  AutoAssessmentDetails, 
  ZeroAssumptionAudit,
  ensureFirstTimerMdaProject,
  getFirstTimerMdaProjectId
} from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';
import { 
  generateAssessmentFromDocuments, 
  getDocumentOcrText, 
  getFullDocumentText,
  registerUploadedDocumentOcr,
  registerUploadedFullDocument,
  readAndStoreRealUploadedFile,
  downloadOriginalDocument,
  getRealDocumentPreviewUrl,
  hasRealUploadedFile,
  onRealFilesHydrated
} from '../services/assessmentEngine';
import { DocumentReviewGradeModal } from './DocumentReviewGradeModal';

interface FirstTimerOnboardingHubProps {
  session: UserSession;
  projects: AIProject[];
  onAddDocument: (projectId: string, newDoc: DocumentAsset) => void;
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
  onSubmitForApproval: () => void;
  onProceedToMonitoring: () => void;
  onSwitchRole: () => void;
}

export const FirstTimerOnboardingHub: React.FC<FirstTimerOnboardingHubProps> = ({
  session,
  projects,
  onAddDocument,
  onUpdateProjectAssessment,
  onReviewDocument,
  onSubmitForApproval,
  onProceedToMonitoring,
  onSwitchRole
}) => {
  // Resolve the active project strictly to the MDA the First-Timer logged in with (session.institution)
  const mdaProjectId = getFirstTimerMdaProjectId(session.institution);
  const { mdaProject: ensuredMdaProject } = ensureFirstTimerMdaProject(
    projects,
    session.institution,
    session.fullName,
    session.email
  );
  const activeProject = projects.find(p => p.id === mdaProjectId) || ensuredMdaProject;

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newFileName, setNewFileName] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Modal confirmation state
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [reviewingDoc, setReviewingDoc] = useState<DocumentAsset | null>(null);
  const [expandedFullDocId, setExpandedFullDocId] = useState<string | null>(null);
  const [, setHydrationTick] = useState(0);

  useEffect(() => {
    return onRealFilesHydrated(() => setHydrationTick(t => t + 1));
  }, []);

  const canReview = session.role === 'Super Admin' || session.role === 'Director General' || session.role === 'Technical Clearance Team' || session.role === 'Technical Director';

  // Active project assessment metrics
  const auto = activeProject ? generateAssessmentFromDocuments(activeProject, session) : null;
  const compliance = auto?.compliance || activeProject?.compliance;
  const avgGovernance = compliance
    ? Math.round((compliance.fairness + compliance.transparency + compliance.accountability + compliance.privacy + compliance.security) / 5)
    : 0;
  const readinessScore = auto?.readinessScore ?? activeProject?.readinessScore ?? 0;
  const zeroAudit = auto?.zeroAssumptionAudit || activeProject?.zeroAssumptionAudit;

  // Handle document upload with immediate grading by Governance & Ethics and AI Readiness
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeProject) return;

    const file = e.target.files[0];
    setNewFileName(file.name);
    setUploading(true);
    setUploadProgress(25);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
    const formattedSize = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(1, Math.round(file.size / 1024))} KB`;

    const nextDocId = `doc-onboard-${Date.now()}`;

    // Read & persist the REAL uploaded file (binary Blob + DataURL + extracted text from .pdf / .docx / .txt)
    const { dataUrl: capturedDataUrl, extractedText: capturedText } = await readAndStoreRealUploadedFile(file, nextDocId);
    setUploadProgress(75);

    setTimeout(() => {
      setUploading(false);
      setUploadProgress(100);

      const estimatedPages = capturedText
        ? Math.max(1, Math.ceil(capturedText.length / 3000))
        : 1;

      const newDoc: DocumentAsset = {
        id: nextDocId,
        fileName: file.name,
        fileType: ext,
        uploadedAt: new Date().toISOString().split('T')[0],
        version: 1,
        signedBy: ['First-Timer / New User'],
        uploadedByRole: session.role || 'First-Timer / New User',
        uploadedByName: session.fullName,
        uploadedByEmail: session.email,
        uploadedByMda: session.institution,
        isFirstTimerUpload: true,
        reviewStatus: 'Pending Review',
        fileSize: formattedSize,
        pageCount: estimatedPages,
        documentCategory: 'First-Timer / Onboarder Full Compliance Dossier',
        fullDocumentText: capturedText || undefined,
        fileDataUrl: capturedDataUrl && capturedDataUrl.length < 350000 ? capturedDataUrl : undefined
      };

      // Register OCR extraction & real uploaded document content
      const fallbackOcr = getDocumentOcrText(nextDocId, file.name, activeProject.name);
      registerUploadedDocumentOcr(nextDocId, capturedText ? `${capturedText.slice(0, 4000)} ${fallbackOcr}` : fallbackOcr);
      registerUploadedFullDocument(
        nextDocId,
        capturedText,
        capturedDataUrl
      );

      // Add document to project
      onAddDocument(activeProject.id, newDoc);
      setExpandedFullDocId(nextDocId);

      // Real-time re-grading by Governance & Ethics and AI Readiness
      const updatedDocs = [newDoc, ...(activeProject.documents || [])];
      const tempProj = { ...activeProject, documents: updatedDocs };
      const newAssessment = generateAssessmentFromDocuments(tempProj, session);

      if (onUpdateProjectAssessment) {
        onUpdateProjectAssessment(
          activeProject.id,
          newAssessment.compliance,
          newAssessment.readinessScore,
          newAssessment.details,
          newAssessment.zeroAssumptionAudit
        );
      }

      recordAuditEvent({
        eventType: 'DOCUMENT_UPLOAD',
        actorName: session.fullName,
        actorEmail: session.email,
        actorRole: session.role,
        actorInstitution: session.institution,
        targetModule: 'documents',
        targetEntityId: activeProject.id,
        actionDetails: `New Member uploaded "${file.name}" (${formattedSize}) for ${activeProject.projectCode}. Triggered real-time Governance & Ethics (${newAssessment.compliance.overallGrade}) and AI Readiness (${newAssessment.readinessScore}%) evaluation.`
      });

      setUploadFeedback(`✓ "${file.name}" (${formattedSize}) saved & indexed in original format. Real-time Governance & Ethics grade: ${newAssessment.compliance.overallGrade} | AI Readiness capability: ${newAssessment.readinessScore}%.`);
      setNewFileName('');
    }, 280);
  };

  const handleCompleteSubmission = () => {
    onSubmitForApproval();
    setShowPendingModal(true);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(17, 24, 39, 0.98) 100%)',
        border: '1px solid rgba(234, 179, 8, 0.35)',
        borderRadius: '18px',
        padding: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'rgba(234, 179, 8, 0.2)',
            border: '1px solid rgba(234, 179, 8, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            🇬🇭
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ghana-gold)',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.06em'
            }}>
              <Sparkles size={14} /> New Member Orientation & Document Onboarding
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: '4px 0 0 0' }}>
              Welcome, {session.fullName} ({session.institution})
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              Upload your project documentation below. The system automatically grades your submission using the <strong>Ghana AI Governance & Ethics</strong> rubric and <strong>AI Readiness</strong> capability framework.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            padding: '6px 14px',
            borderRadius: '9999px',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.3)',
            color: '#fde68a',
            fontSize: '0.74rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock size={13} /> Onboarding Status: In Progress
          </span>
          <button
            onClick={onSwitchRole}
            style={{
              padding: '6px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: 'var(--text-secondary)',
              fontSize: '0.74rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out / Switch
          </button>
        </div>
      </div>

      {/* Target MDA / Active Project Being Registered */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Active Project Being Registered / Onboarded (Logged-In MDA):
          </span>
          <div style={{ fontSize: '1.08rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            [{activeProject?.projectCode}] {session.institution} ({activeProject?.mdaCode})
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
            Onboarding Officer: <strong style={{ color: '#e2e8f0' }}>{session.fullName}</strong> ({session.email}) • All uploaded documents are stored & automatically graded under <strong style={{ color: '#6ee7b7' }}>{session.institution}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#6ee7b7',
            fontSize: '0.76rem',
            fontWeight: 700
          }}>
            🏛️ MDA Workspace: {session.institution}
          </span>
          <span style={{
            padding: '7px 14px',
            borderRadius: '8px',
            background: 'rgba(56, 189, 248, 0.14)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#7dd3fc',
            fontSize: '0.76rem',
            fontWeight: 700
          }}>
            📄 {(activeProject?.documents || []).length} Document(s) Under {activeProject?.mdaCode}
          </span>
        </div>
      </div>

      {/* Upload Feedback */}
      {uploadFeedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#a7f3d0',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{uploadFeedback}</span>
          </div>
          <button onClick={() => setUploadFeedback(null)} style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Real-Time Grading & Guidance Section (Powered by Governance & Ethics and AI Readiness) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Panel 1: Governance & Ethics Live Grading */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--ghana-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  Governance & Ethics Assessment
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Statutory Rubric Evaluation (Ghana AI Framework)
                </span>
              </div>
            </div>

            <span style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: compliance?.overallGrade === 'Excellent' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(234, 179, 8, 0.2)',
              color: compliance?.overallGrade === 'Excellent' ? '#10b981' : '#fde68a',
              fontSize: '0.74rem',
              fontWeight: 800
            }}>
              {compliance?.overallGrade || 'Under Evaluation'}
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
            {auto?.details.ethicsSummary || 'Uploaded documentation is automatically analyzed against Fairness, Transparency, Accountability, Privacy (Act 843), and Security.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Fairness & Non-Bias', val: compliance?.fairness ?? 75 },
              { label: 'Transparency & Explainability', val: compliance?.transparency ?? 70 },
              { label: 'Accountability & Auditability', val: compliance?.accountability ?? 80 },
              { label: 'Privacy & Data Protection (Act 843)', val: compliance?.privacy ?? 85 },
              { label: 'System Security & Robustness', val: compliance?.security ?? 80 }
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>{item.label}</span>
                  <strong>{item.val}%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.val}%`,
                    background: item.val >= 80 ? 'var(--ghana-emerald)' : item.val >= 60 ? 'var(--ghana-gold)' : '#ef4444'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel 2: AI Readiness Capability Live Grading */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Award size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  AI Readiness Capability Score
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Infrastructure, Data, Staff, & Policy Capability
                </span>
              </div>
            </div>

            <span style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
              fontSize: '0.84rem',
              fontWeight: 800
            }}>
              {readinessScore}%
            </span>
          </div>

          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
            {auto?.details.readinessSummary || 'Capability pillars are continuously scored based on primary technical documentation submitted in the document vault.'}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { label: 'Computing & Cloud Infrastructure', val: auto?.details.readinessPillars?.infrastructure ?? 80 },
              { label: 'Data Governance & Architecture', val: auto?.details.readinessPillars?.dataGovernance ?? 85 },
              { label: 'Technical Engineering Talent', val: auto?.details.readinessPillars?.technicalStaff ?? 75 },
              { label: 'Policy & Institutional Leadership', val: auto?.details.readinessPillars?.policyLeadership ?? 80 }
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#cbd5e1', marginBottom: '3px' }}>
                  <span>{item.label}</span>
                  <strong>{item.val}%</strong>
                </div>
                <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.val}%`,
                    background: '#38bdf8'
                  }} />
                </div>
              </div>
            ))}
          </div>

          {zeroAudit && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Evidence Backing Assurance:
              </span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--ghana-emerald)' }}>
                {zeroAudit.evidenceBackingScore}% Provenance
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Document Vault Upload Section */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Statutory Project Documentation Vault
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Upload mandatory project files to eliminate assumptions and elevate statutory clearance readiness.
            </p>
          </div>

          <label style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
            color: '#0b0f19',
            fontWeight: 800,
            fontSize: '0.84rem',
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
          }}>
            <Upload size={16} />
            <span>{uploading ? `Parsing ${newFileName || 'document'} (${uploadProgress}%)...` : 'Upload New Project Document'}</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              disabled={uploading}
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Upload Checklist */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '12px'
        }}>
          {[
            { title: 'Project Charter & Scope', desc: 'Outlines business case, MDA sponsors & milestones.' },
            { title: 'Technical Architecture & Model Card', desc: 'Algorithms, libraries, hosting & latency specs.' },
            { title: 'Ethical Risk Assessment', desc: 'Evaluates fairness, bias mitigations & accountability.' },
            { title: 'Data Protection Commission Filing', desc: 'DPC registration certificate under Act 843.' }
          ].map((check, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                <CheckCircle2 size={15} className="text-emerald-400" />
                <span>{check.title}</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                {check.desc}
              </div>
            </div>
          ))}
        </div>

        {/* Uploaded Documents Table */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Attached Project Documents Under {session.institution} ({(activeProject?.documents || []).length})
            </div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#a7f3d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>All documents grouped under MDA: {session.institution} • Auto-Graded: {compliance?.overallGrade || 'Moderate'} ({avgGovernance}%) & Readiness {readinessScore}%</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(activeProject?.documents || []).map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FileText size={20} className="text-amber-400 flex-shrink-0" />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
                          {doc.fileName}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          background: 'rgba(16, 185, 129, 0.16)',
                          color: '#6ee7b7',
                          border: '1px solid rgba(16, 185, 129, 0.4)'
                        }}>
                          🏛️ MDA: {doc.uploadedByMda || activeProject?.mda || session.institution}
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.65rem',
                          fontWeight: 700,
                          background: 'rgba(56, 189, 248, 0.15)',
                          color: '#7dd3fc',
                          border: '1px solid rgba(56, 189, 248, 0.35)'
                        }}>
                          ⚡ Auto-Graded: {compliance?.overallGrade || 'Moderate'} ({avgGovernance}%) • Readiness {readinessScore}%
                        </span>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '0.66rem',
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
                        MDA: {doc.uploadedByMda || activeProject?.mda || session.institution} ({activeProject?.projectCode}) • Uploaded: {doc.uploadedAt} • Version {doc.version} • Format: {doc.fileType.toUpperCase()}
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
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: expandedFullDocId === doc.id ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.12)',
                        border: '1px solid rgba(56, 189, 248, 0.45)',
                        color: '#7dd3fc',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      <Eye size={13} />
                      <span>{expandedFullDocId === doc.id ? 'Hide Full Document ▲' : 'View Full Document ▼'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadOriginalDocument(doc, activeProject)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '5px 12px',
                        borderRadius: '6px',
                        background: 'rgba(16, 185, 129, 0.16)',
                        border: '1px solid rgba(16, 185, 129, 0.42)',
                        color: '#6ee7b7',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                      title={`Download original file: ${doc.fileName}`}
                    >
                      <Download size={13} />
                      <span>Download ({doc.fileName})</span>
                    </button>

                    {canReview && (
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
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <Award size={13} />
                        <span>Review & Grade Document</span>
                      </button>
                    )}

                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#a7f3d0',
                      fontSize: '0.7rem',
                      fontWeight: 700
                    }}>
                      {hasRealUploadedFile(doc.id, doc) ? '✓ Original File Stored & Graded' : '✓ OCR Parsed & Graded'}
                    </span>
                  </div>
                </div>

                {/* Expandable Full Uploaded Document Viewer */}
                {expandedFullDocId === doc.id && (() => {
                  const previewUrl = getRealDocumentPreviewUrl(doc.id, doc);
                  const isPdf = doc.fileType.toLowerCase() === 'pdf' || doc.fileName.toLowerCase().endsWith('.pdf');
                  const isImg = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(doc.fileType.toLowerCase());
                  return (
                    <div style={{
                      padding: '14px 16px',
                      borderRadius: '8px',
                      background: 'rgba(2, 6, 23, 0.78)',
                      border: '1px solid rgba(56, 189, 248, 0.35)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                          📄 {hasRealUploadedFile(doc.id, doc) ? 'Original Uploaded Document' : 'Full Uploaded Document & OCR Dossier'} — {doc.fileName} ({doc.fileSize || 'Original File'})
                        </span>
                        <button
                          type="button"
                          onClick={() => downloadOriginalDocument(doc, activeProject)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            background: 'rgba(16, 185, 129, 0.18)',
                            border: '1px solid rgba(16, 185, 129, 0.4)',
                            color: '#6ee7b7',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          <Download size={12} />
                          <span>Download Original File ({doc.fileName})</span>
                        </button>
                      </div>

                      {previewUrl && isPdf && (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)', background: '#fff' }}>
                          <iframe
                            src={previewUrl}
                            title={`Uploaded PDF: ${doc.fileName}`}
                            style={{ width: '100%', height: '520px', border: 'none', display: 'block' }}
                          />
                        </div>
                      )}

                      {previewUrl && isImg && (
                        <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(56, 189, 248, 0.3)', background: '#0f172a', padding: '12px', textAlign: 'center' }}>
                          <img
                            src={previewUrl}
                            alt={doc.fileName}
                            style={{ maxWidth: '100%', maxHeight: '480px', borderRadius: '6px' }}
                          />
                        </div>
                      )}

                      <pre style={{
                        margin: 0,
                        maxHeight: previewUrl && isPdf ? '220px' : '380px',
                        overflowY: 'auto',
                        padding: '12px',
                        borderRadius: '6px',
                        background: 'rgba(0, 0, 0, 0.45)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        color: '#e2e8f0',
                        fontSize: '0.74rem',
                        lineHeight: 1.55,
                        whiteSpace: 'pre-wrap',
                        fontFamily: 'monospace'
                      }}>
                        {getFullDocumentText(doc, activeProject)}
                      </pre>
                    </div>
                  );
                })()}

                {/* Reviewer Directives & Official Comments Card */}
                {doc.reviewerComments && doc.reviewerComments.length > 0 ? (
                  <div style={{
                    marginTop: '4px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(0, 0, 0, 0.4)',
                    border: '1px solid rgba(59, 130, 246, 0.35)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                      <span style={{ fontSize: '0.76rem', fontWeight: 700, color: '#93c5fd', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <MessageSquare size={14} className="text-sky-400" />
                        <span>Official Review Directives & Comments from Authorities ({doc.reviewerComments.length})</span>
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Reviewed by Director General / Super Admin / Technical Clearance Team
                      </span>
                    </div>

                    {doc.reviewerComments.map((comm) => (
                      <div key={comm.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.76rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ color: '#fde68a', fontWeight: 700 }}>
                            {comm.reviewerRole}: {comm.reviewerName} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({comm.reviewerEmail})</span>
                          </span>
                          <span style={{
                            fontSize: '0.66rem',
                            padding: '1px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            background: comm.verdict === 'Approved' ? 'rgba(16, 185, 129, 0.25)' :
                                        comm.verdict === 'Changes Requested' ? 'rgba(239, 68, 68, 0.25)' :
                                        comm.verdict === 'Conditionally Cleared' ? 'rgba(251, 191, 36, 0.25)' :
                                        'rgba(59, 130, 246, 0.25)',
                            color: comm.verdict === 'Approved' ? '#10b981' :
                                   comm.verdict === 'Changes Requested' ? '#f87171' :
                                   comm.verdict === 'Conditionally Cleared' ? '#fbbf24' :
                                   '#60a5fa'
                          }}>
                            Verdict: {comm.verdict}
                          </span>
                        </div>

                        <div style={{ color: '#e2e8f0', background: 'rgba(255,255,255,0.02)', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #3b82f6', lineHeight: 1.4 }}>
                          "{comm.comment}"
                        </div>

                        {comm.governanceAdjustment && (
                          <div style={{ fontSize: '0.7rem', color: '#a7f3d0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            <span>🏛️ Governance & Ethics Grade: <strong>{comm.governanceAdjustment.overallGrade}</strong></span>
                            <span>Fairness: {comm.governanceAdjustment.fairness}%</span>
                            <span>Privacy: {comm.governanceAdjustment.privacy}%</span>
                            <span>Security: {comm.governanceAdjustment.security}%</span>
                          </div>
                        )}

                        {comm.readinessAdjustment !== undefined && (
                          <div style={{ fontSize: '0.7rem', color: '#fde68a' }}>
                            🚀 AI Readiness Capability Graded: <strong>{comm.readinessAdjustment}%</strong>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
                    Awaiting official directive comments from Director General or Technical Clearance Team reviewers.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion & Submit Button */}
        <div style={{
          marginTop: '12px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
              Finished Uploading Required Files?
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Submitting advances your project registration to NITA statutory technical clearance.
            </div>
          </div>

          <button
            onClick={handleCompleteSubmission}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 28px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
              color: '#0b0f19',
              fontWeight: 800,
              fontSize: '0.88rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span>Complete Onboarding & Submit Request</span>
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* STATUTORY CONFIRMATION MODAL: (request pendind will send you email when approved,THANK YOU) */}
      {showPendingModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: 'rgba(3, 7, 18, 0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '560px',
            width: '100%',
            background: 'linear-gradient(175deg, #111827 0%, #0d1424 100%)',
            border: '1px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.25)',
            borderRadius: '20px',
            padding: '36px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* National Crest Badge */}
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(251, 191, 36, 0.2))',
              border: '1px solid rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              color: 'var(--ghana-emerald)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <div>
              <span style={{
                fontSize: '0.72rem',
                padding: '4px 12px',
                borderRadius: '9999px',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                color: '#fde68a',
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase'
              }}>
                Statutory Filing Confirmed
              </span>

              {/* Exact user-requested message string prominently featured */}
              <h2 style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                color: '#fff',
                marginTop: '14px',
                marginBottom: '8px',
                lineHeight: 1.3
              }}>
                Request pending will send you email when approved, THANK YOU
              </h2>

              <p style={{
                fontSize: '0.84rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
                margin: '0 auto',
                maxWidth: '460px'
              }}>
                Your project documents have been submitted to the National Information Technology Agency (NITA) & Ministry of Communications and Digitalisation. Our technical clearance taskforce will review your submission and email you at <strong style={{ color: '#fff' }}>{session.email}</strong> once approved.
              </p>
            </div>

            <div style={{
              padding: '14px 18px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              textAlign: 'left',
              fontSize: '0.78rem',
              color: '#cbd5e1',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ghana-emerald)', fontWeight: 700 }}>
                <Info size={16} /> Accessible Monitoring Services:
              </div>
              <div>
                While your executive clearance is under review, you have full access to view national progress on the <strong>M&E Dashboard</strong>, explore regional deployments on the <strong>GIS Spatial Map</strong>, and consult the <strong>AI Chat Assistant</strong>.
              </div>
            </div>

            <button
              onClick={() => {
                setShowPendingModal(false);
                onProceedToMonitoring();
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '13px 28px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                color: '#0b0f19',
                fontWeight: 900,
                fontSize: '0.92rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <span>Proceed to National Monitoring Overview</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENT REVIEW & GRADING MODAL FOR ACTIVE ROLE PROFILES */}
      {reviewingDoc && activeProject && (
        <DocumentReviewGradeModal
          isOpen={!!reviewingDoc}
          onClose={() => setReviewingDoc(null)}
          document={reviewingDoc}
          project={activeProject}
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
