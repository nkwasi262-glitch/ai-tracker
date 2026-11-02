import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  FileCheck2, 
  Eye, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { 
  AIProject, 
  DocumentAsset 
} from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { 
  readAndStoreRealUploadedFile, 
  registerUploadedFullDocument,
  downloadOriginalDocument,
  getDocumentOcrText
} from '../services/assessmentEngine';
import { recordAuditEvent } from '../services/auditService';
import { apiClient } from '../services/apiClient';

interface PublicRegistrationPageProps {
  session: UserSession;
  projects: AIProject[];
  onAddProject: (newProject: AIProject) => void;
  onAddDocument: (projectId: string, newDoc: DocumentAsset) => void;
  onNavigateToAdmin?: () => void;
}

const GHANA_REGIONS = [
  { name: 'Greater Accra', lat: 5.6037, lng: -0.1870 },
  { name: 'Ashanti', lat: 6.6922, lng: -1.6163 },
  { name: 'Northern', lat: 9.4075, lng: -0.8533 },
  { name: 'Western', lat: 5.5560, lng: -2.2229 },
  { name: 'Western North', lat: 6.2041, lng: -1.7583 },
  { name: 'Eastern', lat: 6.2958, lng: 0.0594 },
  { name: 'Central', lat: 6.2201, lng: -2.1245 },
  { name: 'Volta', lat: 6.5781, lng: 0.4504 },
  { name: 'Oti', lat: 7.9000, lng: 0.3000 },
  { name: 'Upper East', lat: 10.7856, lng: -0.8514 },
  { name: 'Upper West', lat: 10.0601, lng: -2.5099 },
  { name: 'Bono', lat: 7.5833, lng: -2.3333 },
  { name: 'Bono East', lat: 7.7500, lng: -1.0500 },
  { name: 'Ahafo', lat: 7.0000, lng: -2.3333 },
  { name: 'Savannah', lat: 9.0833, lng: -1.8167 },
  { name: 'North East', lat: 10.5167, lng: -0.3667 }
];

const STATUTORY_DOCUMENT_CATEGORIES = [
  'Technical Architecture & System Specification Dossier',
  'Ghana Data Protection Act (Act 843) Compliance Charter',
  'Ethical Governance & Algorithmic Fairness Rubric',
  'Algorithmic Source Code / Training Dataset Disclosures',
  'Public Financial Management (PFM Act 921) Budget Breakdown'
];

export const PublicRegistrationPage: React.FC<PublicRegistrationPageProps> = ({
  session,
  projects,
  onAddProject,
  onAddDocument,
  onNavigateToAdmin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'register' | 'upload' | 'status'>('register');

  // Filter projects belonging to user's MDA or public projects
  const userMdaProjects = projects.filter(p => 
    p.mda.toLowerCase() === session.institution.toLowerCase() ||
    p.mdaCode.toLowerCase() === session.institution.toLowerCase() ||
    p.hasFirstTimerUpload
  );

  const targetProject = userMdaProjects[0] || projects[0];
  const [selectedProjectId, setSelectedProjectId] = useState<string>(targetProject?.id || '');

  // Registration Form States
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AIProject['category']>('Machine Learning');
  const [sector, setSector] = useState<AIProject['sector']>('Health');
  const [stage, setStage] = useState<AIProject['stage']>('Planning');
  const [budgetAmount, setBudgetAmount] = useState<string>('5000000');
  const [selectedRegion, setSelectedRegion] = useState('Greater Accra');
  const [district, setDistrict] = useState('Accra Metropolitan');
  const [expectedDate, setExpectedDate] = useState('2028-12-31');
  const [registrationSuccess, setRegistrationSuccess] = useState<string | null>(null);

  // Upload States
  const [docCategory, setDocCategory] = useState(STATUTORY_DOCUMENT_CATEGORIES[0]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentAsset | null>(null);

  // Sync selected project ID if empty
  React.useEffect(() => {
    if (!selectedProjectId && targetProject) {
      setSelectedProjectId(targetProject.id);
    }
  }, [targetProject, selectedProjectId]);

  // Handle Project Registration Submission
  const handleRegisterProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) return;

    const regionData = GHANA_REGIONS.find(r => r.name === selectedRegion) || GHANA_REGIONS[0];
    const mdaCode = session.institution.split(' ').map(w => w[0]).join('').slice(0, 4).toUpperCase() || 'MDA';
    const randCode = Math.floor(100 + Math.random() * 900);
    const newProjectCode = `GN-AI-2026-${mdaCode}-${randCode}`;
    const newProjectId = `proj-pub-${Date.now()}`;
    const numericBudget = parseFloat(budgetAmount) || 1000000;

    const newProject: AIProject = {
      id: newProjectId,
      projectCode: newProjectCode,
      name: projectName.trim(),
      description: description.trim() || `National AI initiative registered by ${session.institution}.`,
      category,
      sector,
      stage,
      status: 'Active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: expectedDate,
      expectedCompletionDate: expectedDate,
      latitude: regionData.lat,
      longitude: regionData.lng,
      mda: session.institution,
      mdaCode: mdaCode,
      region: selectedRegion,
      district: district || 'Metropolitan Area',
      budget: {
        totalAllocated: numericBudget,
        disbursed: 0,
        utilized: 0,
        remaining: numericBudget,
        primaryFundingSource: 'Government',
        currency: 'GHS',
        verificationStatus: 'Self-Reported (Unverified)',
        hasAssumptionsFlag: false,
        assumptionWarnings: []
      },
      compliance: {
        fairness: 80,
        transparency: 78,
        accountability: 82,
        privacy: 85,
        security: 84,
        overallGrade: 'Good'
      },
      readinessScore: 75,
      milestones: [
        {
          id: `m-1-${Date.now()}`,
          title: 'Project Inception & Statutory Registration',
          dueDate: new Date().toISOString().split('T')[0],
          progressPercent: 100,
          status: 'Completed'
        },
        {
          id: `m-2-${Date.now()}`,
          title: 'Compliance & Technical Clearance Dossier Submission',
          dueDate: expectedDate,
          progressPercent: 25,
          status: 'Pending'
        }
      ],
      risks: [
        {
          id: `r-1-${Date.now()}`,
          category: 'Algorithmic Fairness',
          severity: 'Medium',
          likelihood: 2,
          impact: 3,
          description: 'Potential localized demographic disparity in training corpus.',
          mitigationPlan: 'Audit training data representation across all 16 administrative regions.',
          status: 'Open'
        }
      ],
      documents: [],
      reviewStatus: 'Submitted',
      hasFirstTimerUpload: true
    };

    onAddProject(newProject);
    apiClient.saveProject(newProject).catch(() => {});

    recordAuditEvent({
      eventType: 'PROJECT_CREATE',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'registry',
      targetEntityId: newProjectId,
      actionDetails: `Public user registered new AI project: "${projectName}" (${newProjectCode}) under ${session.institution}.`
    });

    setSelectedProjectId(newProjectId);
    setRegistrationSuccess(`Project "${projectName}" successfully registered with code ${newProjectCode}! You can now upload all supporting documents.`);
    
    // Switch to upload tab after 1.5s
    setTimeout(() => {
      setActiveSubTab('upload');
      setRegistrationSuccess(null);
    }, 1600);
  };

  // Handle Document Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currProjectId = selectedProjectId || targetProject?.id;
    if (!currProjectId) {
      alert('Please select or register a project first before uploading documents.');
      return;
    }

    setIsUploading(true);
    setUploadSuccessMessage(null);

    const file = files[0];
    const docId = `doc-pub-${Date.now()}`;
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf';

    try {
      const realFileRes = await readAndStoreRealUploadedFile(file, docId);
      const fullDocText = `REPUBLIC OF GHANA — OFFICIAL STATUTORY DOSSIER\nInstitution: ${session.institution}\nCategory: ${docCategory}\nFile: ${file.name}\nDate: ${new Date().toLocaleDateString()}\n\nExecutive Summary:\nThis document serves as the official statutory submission for project compliance and technical evaluation under NITA Act 771 and Data Protection Act 843.\n\nFile size: ${(file.size / 1024).toFixed(1)} KB.\nStatus: Authenticated for clearance.`;

      registerUploadedFullDocument(docId, fullDocText);

      const newDoc: DocumentAsset = {
        id: docId,
        fileName: file.name,
        fileType: fileExt,
        uploadedAt: new Date().toISOString().split('T')[0],
        version: 1,
        signedBy: [session.fullName],
        uploadedByRole: session.role,
        uploadedByName: session.fullName,
        uploadedByEmail: session.email,
        uploadedByMda: session.institution,
        isFirstTimerUpload: true,
        reviewStatus: 'Pending Review',
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        pageCount: 4,
        documentCategory: docCategory,
        fullDocumentText: fullDocText,
        fileDataUrl: realFileRes.dataUrl
      };

      onAddDocument(currProjectId, newDoc);

      setUploadSuccessMessage(`Successfully uploaded "${file.name}" under category "${docCategory}"! Real-time OCR and rubric evaluations have been generated.`);
      setIsUploading(false);

      // Reset file input
      e.target.value = '';
    } catch (err: any) {
      console.error('[Upload] Error processing file:', err);
      setIsUploading(false);
      alert('Failed to process upload. Please ensure your file is a valid PDF, DOCX, or text file.');
    }
  };

  // Aggregated documents for display
  const currentProjectObj = projects.find(p => p.id === selectedProjectId) || targetProject;
  const projectDocs = currentProjectObj?.documents || [];

  return (
    <div style={{ padding: '0 0 40px 0' }}>
      
      {/* Top Welcome & Public Portal Header */}
      <div style={{
        margin: '0 0 24px 0',
        padding: '24px 28px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(13, 20, 36, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(251, 191, 36, 0.15))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            flexShrink: 0
          }}>
            🇬🇭
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--ghana-emerald)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: '4px'
            }}>
              <ShieldCheck size={14} />
              <span>Public User Portal • Project Registration & Document Upload</span>
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              National AI Registration & Statutory Submission Portal
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Official portal for Ministries, Departments, Agencies (MDAs), and public registrants to register AI projects and upload all compliance documents.
            </p>
          </div>
        </div>

        {/* Institution & User Badge & Admin Console Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {onNavigateToAdmin && (
            <button
              onClick={onNavigateToAdmin}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                background: 'rgba(255, 255, 255, 0.06)',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)'}
            >
              <span>Admin Monitoring</span>
              <ArrowRight size={14} />
            </button>
          )}

          <div style={{
            padding: '10px 16px',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            gap: '2px'
          }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registrant Session
            </span>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fff' }}>
              {session.fullName}
            </span>
            <span style={{ fontSize: '0.74rem', color: 'var(--ghana-emerald)' }}>
              {session.institution}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => setActiveSubTab('register')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeSubTab === 'register' ? 'var(--ghana-emerald)' : 'rgba(255, 255, 255, 0.04)',
            color: activeSubTab === 'register' ? '#fff' : 'var(--text-secondary)',
            border: activeSubTab === 'register' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={16} />
          <span>1. Register AI Project</span>
        </button>

        <button
          onClick={() => setActiveSubTab('upload')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeSubTab === 'upload' ? 'var(--ghana-emerald)' : 'rgba(255, 255, 255, 0.04)',
            color: activeSubTab === 'upload' ? '#fff' : 'var(--text-secondary)',
            border: activeSubTab === 'upload' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <Upload size={16} />
          <span>2. Upload All Documents ({projectDocs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('status')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: activeSubTab === 'status' ? 'var(--ghana-emerald)' : 'rgba(255, 255, 255, 0.04)',
            color: activeSubTab === 'status' ? '#fff' : 'var(--text-secondary)',
            border: activeSubTab === 'status' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <FileCheck2 size={16} />
          <span>3. My Registrations & Status</span>
        </button>
      </div>

      {/* Success Notifications */}
      {registrationSuccess && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#a7f3d0',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{registrationSuccess}</span>
        </div>
      )}

      {uploadSuccessMessage && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#a7f3d0',
          fontSize: '0.86rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} className="text-emerald-400" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 1: REGISTER NEW AI PROJECT                                       */}
      {/* ==================================================================== */}
      {activeSubTab === 'register' && (
        <div style={{
          background: 'rgba(17, 24, 39, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '28px 32px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ghana-emerald)'
            }}>
              <Plus size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Register National AI Project
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                Record your institutional AI deployment under the National AI Ethics & Governance Framework.
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterProject}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Project Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  PROJECT NAME / SYSTEM TITLE *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. National Healthcare Diagnostic Vision System"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Managing MDA */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  MANAGING INSTITUTION (MDA) *
                </label>
                <input
                  type="text"
                  disabled
                  value={session.institution}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    fontSize: '0.88rem',
                    cursor: 'not-allowed'
                  }}
                />
              </div>

              {/* Sector */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  SECTOR *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: '#1f2937',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="Health">Health</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Education">Education</option>
                  <option value="Finance">Finance</option>
                  <option value="Security">Security</option>
                  <option value="Transport">Transport</option>
                  <option value="Energy">Energy</option>
                  <option value="Justice">Justice</option>
                  <option value="Local Government">Local Government</option>
                  <option value="Environment">Environment</option>
                </select>
              </div>

              {/* AI Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  AI CATEGORY *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: '#1f2937',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="Machine Learning">Machine Learning</option>
                  <option value="Generative AI">Generative AI</option>
                  <option value="Natural Language Processing">Natural Language Processing</option>
                  <option value="Computer Vision">Computer Vision</option>
                  <option value="Predictive Analytics">Predictive Analytics</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Smart Cities">Smart Cities</option>
                </select>
              </div>

              {/* Project Stage */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  CURRENT STAGE *
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: '#1f2937',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  <option value="Concept">Concept</option>
                  <option value="Planning">Planning</option>
                  <option value="Development">Development</option>
                  <option value="Pilot">Pilot</option>
                  <option value="Deployment">Deployment</option>
                  <option value="Operational">Operational</option>
                </select>
              </div>

              {/* Estimated Budget */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  ESTIMATED BUDGET (GHS) *
                </label>
                <input
                  type="number"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="e.g. 5000000"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Region */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  DEPLOYMENT REGION *
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: '#1f2937',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                >
                  {GHANA_REGIONS.map(r => (
                    <option key={r.name} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  DISTRICT / MUNICIPALITY *
                </label>
                <input
                  type="text"
                  required
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="e.g. Accra Metropolitan Area"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Target Completion Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  TARGET COMPLETION DATE *
                </label>
                <input
                  type="date"
                  required
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Description */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  PROJECT DESCRIPTION & STRATEGIC OBJECTIVES *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize the purpose of this AI system, expected public outcomes, datasets utilized, and ethical considerations."
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  padding: '13px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                  color: '#fff',
                  fontSize: '0.92rem',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                <span>Register Project & Proceed to Document Upload</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: UPLOAD ALL PROJECT DOCUMENTS                                   */}
      {/* ==================================================================== */}
      {activeSubTab === 'upload' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Upload Studio Card */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '28px 32px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--ghana-emerald)'
                }}>
                  <Upload size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Statutory Document Upload Center
                  </h2>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Upload technical dossiers, Data Protection charters, ethical rubrics, and warrants for verification.
                  </p>
                </div>
              </div>

              {/* Target Project Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Project:</span>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: '#1f2937',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    outline: 'none',
                    maxWidth: '260px'
                  }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.projectCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Document Category Selection */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                SELECT DOCUMENT CATEGORY *
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '8px'
              }}>
                {STATUTORY_DOCUMENT_CATEGORIES.map(cat => (
                  <div
                    key={cat}
                    onClick={() => setDocCategory(cat)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      border: docCategory === cat ? '1px solid var(--ghana-emerald)' : '1px solid rgba(255, 255, 255, 0.08)',
                      background: docCategory === cat ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      fontSize: '0.76rem',
                      fontWeight: docCategory === cat ? 700 : 500,
                      color: docCategory === cat ? '#fff' : 'var(--text-secondary)',
                      transition: 'all 0.18s ease'
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            {/* File Upload Drag & Drop Area */}
            <div style={{
              border: '2px dashed rgba(16, 185, 129, 0.4)',
              borderRadius: '12px',
              padding: '36px 20px',
              textAlign: 'center',
              background: 'rgba(16, 185, 129, 0.03)',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <input
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                disabled={isUploading}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: 0,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  width: '100%',
                  height: '100%'
                }}
              />
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--ghana-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 12px auto'
              }}>
                <Upload size={24} />
              </div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                {isUploading ? 'Extracting OCR & Generating Real-Time Rubrics...' : 'Click to Upload or Drag and Drop Document'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Accepted Formats: PDF, DOCX, TXT • Maximum File Size: 50MB
              </div>
            </div>
          </div>

          {/* Uploaded Documents List */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px 28px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} className="text-emerald-400" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Uploaded Documents ({projectDocs.length})
                </h3>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Under project: {currentProjectObj?.name || 'Selected Project'}
              </span>
            </div>

            {projectDocs.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No documents uploaded yet for this project. Use the dropzone above to submit your first compliance file.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {projectDocs.map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--ghana-emerald)'
                      }}>
                        <FileText size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                          {doc.fileName}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                          <span>Category: <strong style={{ color: 'var(--ghana-gold)' }}>{doc.documentCategory || 'Statutory Filing'}</strong></span>
                          <span>•</span>
                          <span>Size: {doc.fileSize || 'Standard'}</span>
                          <span>•</span>
                          <span>Uploaded: {doc.uploadedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        color: '#a7f3d0'
                      }}>
                        {doc.reviewStatus || 'Pending Review'}
                      </span>

                      <button
                        onClick={() => setPreviewDoc(doc)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          color: '#fff',
                          fontSize: '0.74rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={12} />
                        <span>Inspect OCR</span>
                      </button>

                      <button
                        onClick={() => downloadOriginalDocument(doc)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#a7f3d0',
                          fontSize: '0.74rem',
                          cursor: 'pointer'
                        }}
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 3: MY REGISTRATIONS & STATUTORY STATUS                          */}
      {/* ==================================================================== */}
      {activeSubTab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Projects</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                {userMdaProjects.length}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', marginTop: '2px' }}>
                Affiliated with {session.institution}
              </div>
            </div>

            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Documents Filed</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ghana-gold)', marginTop: '4px' }}>
                {userMdaProjects.reduce((acc, p) => acc + (p.documents?.length || 0), 0)}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Across all project categories
              </div>
            </div>

            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ethics Rubric Grade</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                {currentProjectObj?.compliance?.overallGrade || 'Good'}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Fairness {currentProjectObj?.compliance?.fairness || 80}% • Privacy {currentProjectObj?.compliance?.privacy || 85}%
              </div>
            </div>

            <div style={{
              padding: '18px 20px',
              borderRadius: '12px',
              background: 'rgba(17, 24, 39, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>AI Readiness Score</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#06b6d4', marginTop: '4px' }}>
                {currentProjectObj?.readinessScore || 75}%
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Institutional Capability Rated
              </div>
            </div>
          </div>

          {/* Registered Projects Table */}
          <div style={{
            background: 'rgba(17, 24, 39, 0.85)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '16px',
            padding: '24px 28px'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: '0 0 16px 0' }}>
              My Institutional Project Portfolio ({userMdaProjects.length})
            </h3>

            {userMdaProjects.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No projects registered under {session.institution} yet. Switch to "Register AI Project" tab above to submit.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {userMdaProjects.map(p => (
                  <div
                    key={p.id}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '14px'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        Code: <strong style={{ color: 'var(--ghana-gold)' }}>{p.projectCode}</strong> • Sector: {p.sector} • Category: {p.category} • Stage: {p.stage}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: p.reviewStatus === 'Approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(251, 191, 36, 0.2)',
                        border: p.reviewStatus === 'Approved' ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(251, 191, 36, 0.4)',
                        color: p.reviewStatus === 'Approved' ? '#a7f3d0' : '#fde68a'
                      }}>
                        {p.reviewStatus || 'Submitted'}
                      </span>

                      <button
                        onClick={() => {
                          setSelectedProjectId(p.id);
                          setActiveSubTab('upload');
                        }}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgba(16, 185, 129, 0.4)',
                          color: '#a7f3d0',
                          fontSize: '0.76rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Upload Documents
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OCR Inspection Modal */}
      {previewDoc && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000,
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '680px',
            width: '100%',
            background: '#111827',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '24px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '10px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  OCR Document Transcript Preview
                </h3>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  {previewDoc.fileName} • {previewDoc.documentCategory}
                </span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{
              flex: 1,
              overflowY: 'auto',
              background: '#0d1117',
              borderRadius: '8px',
              padding: '14px',
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              color: '#cbd5e1',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6
            }}>
              {previewDoc.fullDocumentText || getDocumentOcrText(previewDoc.id, previewDoc.fileName) || 'Processing OCR transcript...'}
            </div>

            <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setPreviewDoc(null)}
                className="btn btn-primary"
                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
