import React, { useState } from 'react';
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
  Info
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset, 
  ComplianceScore, 
  AutoAssessmentDetails, 
  ZeroAssumptionAudit 
} from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';
import { 
  generateAssessmentFromDocuments, 
  getDocumentOcrText, 
  registerUploadedDocumentOcr 
} from '../services/assessmentEngine';

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
  onSubmitForApproval: () => void;
  onProceedToMonitoring: () => void;
  onSwitchRole: () => void;
}

export const FirstTimerOnboardingHub: React.FC<FirstTimerOnboardingHubProps> = ({
  session,
  projects,
  onAddDocument,
  onUpdateProjectAssessment,
  onSubmitForApproval,
  onProceedToMonitoring,
  onSwitchRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newFileName, setNewFileName] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);

  // Modal confirmation state
  const [showPendingModal, setShowPendingModal] = useState(false);

  // Active project assessment metrics
  const auto = activeProject ? generateAssessmentFromDocuments(activeProject, session) : null;
  const compliance = auto?.compliance || activeProject?.compliance;
  const readinessScore = auto?.readinessScore ?? activeProject?.readinessScore ?? 0;
  const zeroAudit = auto?.zeroAssumptionAudit || activeProject?.zeroAssumptionAudit;

  // Handle document upload with immediate grading by Governance & Ethics and AI Readiness
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !activeProject) return;

    const file = e.target.files[0];
    setNewFileName(file.name);
    setUploading(true);
    setUploadProgress(15);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          setUploading(false);

          const nextDocId = `doc-onboard-${Date.now()}`;
          const newDoc: DocumentAsset = {
            id: nextDocId,
            fileName: file.name,
            fileType: 'pdf',
            uploadedAt: new Date().toISOString().split('T')[0],
            version: 1,
            signedBy: ['First-Timer / New User']
          };

          // Register OCR extraction
          const ocrText = getDocumentOcrText(nextDocId, file.name, activeProject.name);
          registerUploadedDocumentOcr(nextDocId, ocrText);

          // Add document to project
          onAddDocument(activeProject.id, newDoc);

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
            actionDetails: `New Member uploaded "${file.name}" for ${activeProject.projectCode}. Triggered real-time Governance & Ethics (${newAssessment.compliance.overallGrade}) and AI Readiness (${newAssessment.readinessScore}%) evaluation.`
          });

          setUploadFeedback(`✓ "${file.name}" successfully parsed. Real-time Governance & Ethics grade: ${newAssessment.compliance.overallGrade} | AI Readiness capability: ${newAssessment.readinessScore}%.`);
          setNewFileName('');
          return 100;
        }
        return prev + 25;
      });
    }, 220);
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

      {/* Target Project Selection */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '14px',
        border: '1px solid var(--border-color)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Active Project Being Registered / Onboarded:
          </span>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>
            [{activeProject?.projectCode}] {activeProject?.name} ({activeProject?.mdaCode || activeProject?.mda})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Project:</span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              background: '#111b27',
              border: '1px solid var(--border-color)',
              color: '#fff',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                [{p.projectCode}] {p.name}
              </option>
            ))}
          </select>
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
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
            Attached Project Documents ({(activeProject?.documents || []).length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(activeProject?.documents || []).map((doc) => (
              <div
                key={doc.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <FileText size={20} className="text-amber-400" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff' }}>
                      {doc.fileName}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      Uploaded: {doc.uploadedAt} • Version {doc.version} • Format: {doc.fileType.toUpperCase()}
                    </div>
                  </div>
                </div>

                <span style={{
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#a7f3d0',
                  fontSize: '0.7rem',
                  fontWeight: 700
                }}>
                  ✓ OCR Parsed & Graded
                </span>
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
    </div>
  );
};
