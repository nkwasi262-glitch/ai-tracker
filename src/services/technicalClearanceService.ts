import { AIProject, DocumentAsset, ComplianceScore } from '../data/sampleProjects';
import { generateAssessmentFromDocuments } from './assessmentEngine';
import { saveStoredProjects } from './projectStorage';
import { recordAuditEvent } from './auditService';
import { apiClient } from './apiClient';
import { UserSession } from '../data/authTypes';

export interface TechnicalClearancePayload {
  projectId: string;
  projectCode?: string;
  mda?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  document: Partial<DocumentAsset> & {
    fileName: string;
    fullDocumentText: string;
    fileType?: string;
    fileSize?: string;
    pageCount?: number;
    documentCategory?: string;
  };
}

export interface TechnicalClearanceResult {
  success: boolean;
  message: string;
  project: AIProject;
  document: DocumentAsset;
  compliance: ComplianceScore;
  readinessScore: number;
}

/**
 * Technical Clearance System Intake Path:
 * Always ready to receive documents from the external technical clearance system.
 * Automatically scans and grades incoming documents using:
 *  1. Governance and Ethics Standards (Fairness, Transparency, Privacy, Security, Accountability)
 *  2. AI Readiness Standards (Infrastructure, Data Governance, Technical Staff, Policy Leadership)
 *
 * Sets the project reviewStatus to 'Recommended'
 * Marks the document as 'Pending Review' so authorized officers can still review it.
 */
export async function receiveTechnicalClearanceDocument(
  payload: TechnicalClearancePayload,
  currentProjects: AIProject[],
  session?: UserSession | null
): Promise<TechnicalClearanceResult> {
  const targetId = payload.projectId || payload.projectCode || currentProjects[0]?.id || 'proj-1';
  let targetProject = currentProjects.find(p => p.id === targetId || p.projectCode === targetId);

  if (!targetProject) {
    targetProject = currentProjects[0];
  }

  const docId = payload.document.id || `doc-tc-${Date.now()}`;
  const now = new Date().toISOString().split('T')[0];

  const incomingDoc: DocumentAsset = {
    id: docId,
    fileName: payload.document.fileName,
    fileType: payload.document.fileType || 'PDF',
    fileSize: payload.document.fileSize || '3.5 MB',
    pageCount: payload.document.pageCount || 10,
    uploadedAt: now,
    version: 1,
    signedBy: ['Technical Clearance Gateway'],
    uploadedByRole: 'Technical Clearance System',
    uploadedByName: payload.submittedByName || 'National Technical Clearance Ingestion Service',
    uploadedByEmail: payload.submittedByEmail || 'clearance@nita.gov.gh',
    uploadedByMda: payload.mda || targetProject?.mda || 'Government of Ghana',
    documentCategory: (payload.document.documentCategory as any) || 'Technical Specs',
    fullDocumentText: payload.document.fullDocumentText,
    fileDataUrl: payload.document.fileDataUrl,
    // CRITICAL: Still allow documents to be reviewed!
    reviewStatus: 'Pending Review',
    isFirstTimerUpload: false,
    reviewerComments: []
  };

  // Form temporary updated project to run the standardized scanner
  const existingDocs = targetProject.documents || [];
  const updatedDocs = [incomingDoc, ...existingDocs.filter(d => d.id !== incomingDoc.id)];

  const tempProject: AIProject = {
    ...targetProject,
    documents: updatedDocs
  };

  // Run autonomous grading engine using Governance & Ethics and AI Readiness standards
  const assessment = generateAssessmentFromDocuments(tempProject, session || undefined);

  const updatedProject: AIProject = {
    ...tempProject,
    // "all AI project(documents sent to the technical clearance system) should be recomemded to the system"
    reviewStatus: 'Recommended',
    compliance: assessment.compliance,
    readinessScore: assessment.readinessScore,
    autoAssessment: assessment.details,
    zeroAssumptionAudit: assessment.zeroAssumptionAudit,
    technicalClearanceReview: {
      recommendedAt: new Date().toISOString(),
      recommendedBy: payload.submittedByName || 'National Technical Clearance Intake Path',
      recommendationNotes: `Automatically ingested from Technical Clearance System. Governance & Ethics auto-graded at ${assessment.compliance.overallGrade}; AI Readiness auto-graded at ${assessment.readinessScore}%. Queued for statutory document review.`
    }
  };

  // Persist into state catalog
  const newProjectsList = currentProjects.map(p => p.id === updatedProject.id ? updatedProject : p);
  saveStoredProjects(newProjectsList);

  // Sync to Neon PostgreSQL
  try {
    await apiClient.saveProject(updatedProject);
    await apiClient.addDocument(updatedProject.id, incomingDoc);
  } catch (e) {
    console.warn('[TechnicalClearance] Offline sync fallback used:', e);
  }

  // Audit event
  recordAuditEvent({
    eventType: 'TECHNICAL_CLEARANCE_DOCUMENT_RECEIVED',
    actorName: payload.submittedByName || 'Technical Clearance System Gateway',
    actorEmail: payload.submittedByEmail || 'technical-clearance@nita.gov.gh',
    actorRole: 'Technical Director',
    actorInstitution: payload.mda || 'Technical Clearance Secretariat',
    targetModule: 'documents',
    targetEntityId: incomingDoc.id,
    actionDetails: `Inbound dossier "${incomingDoc.fileName}" ingested for project ${updatedProject.projectCode}. Auto-graded: Ethics [${assessment.compliance.overallGrade}], Readiness [${assessment.readinessScore}%]. Status set to Recommended, queued for review.`
  });

  return {
    success: true,
    message: `Dossier received from Technical Clearance System. Auto-graded: Ethics (${assessment.compliance.overallGrade}), Readiness (${assessment.readinessScore}%). Ready for review in Documents & OCR.`,
    project: updatedProject,
    document: incomingDoc,
    compliance: assessment.compliance,
    readinessScore: assessment.readinessScore
  };
}

/**
 * Generates an incoming sample clearance submission on demand to demonstrate the always-ready intake path.
 */
export async function simulateIncomingClearanceDossier(
  currentProjects: AIProject[],
  session?: UserSession | null
): Promise<TechnicalClearanceResult> {
  const sampleBatches: TechnicalClearancePayload[] = [
    {
      projectId: 'proj-1',
      projectCode: 'GN-AI-2026-001',
      mda: 'Ministry of Communications and Digitalisation (MoCD)',
      submittedByName: 'Dr. Joseph Kwakye (Technical Clearance Secretariat)',
      submittedByEmail: 'clearance.eval@nita.gov.gh',
      document: {
        id: `doc-tc-clearance-${Date.now()}`,
        fileName: 'MoCD_GhanaPostGPS_Technical_Clearance_Dossier_2026.pdf',
        fileType: 'PDF',
        fileSize: '4.8 MB',
        pageCount: 14,
        documentCategory: 'Technical Specs',
        fullDocumentText: `REPUBLIC OF GHANA • NATIONAL TECHNICAL CLEARANCE SYSTEM (NITA ACT 771)
SUBMISSION REF: TC-DOSSIER-2026-GHANAPOST-AI
PROJECT: GhanaPostGPS National Addressing AI System (GN-AI-2026-001)
MDA: Ministry of Communications and Digitalisation (MoCD)

SECTION 1: GOVERNANCE AND ETHICS COMPLIANCE STANDARDS
- Act 843 Data Protection Compliance: All spatial addressing and personal residence markers are encrypted at ingestion using SHA-256 with biometric salted tokens. Full Data Protection Commission (DPC) certification active. Certified DPO appointed. Zero foreign server replication; all data resides within the Accra National Data Centre.
- Demographic Fairness & Inclusivity: Addressing algorithm validated across all 16 regions of Ghana (Greater Accra, Ashanti, Northern, Western, Central, Volta, Eastern, Upper East, Upper West, etc.). Offline fallback channels implemented via USSD (*920#) and local language voice routing (Twi, Ga, Ewe, Dagbani) to prevent exclusion.
- Security & Robustness: Penetration testing passed. OWASP Top 10 vulnerabilities resolved. Enforces Hardware Security Modules (HSM) with ephemeral hash verification.

SECTION 2: AI READINESS STANDARDS
- Infrastructure: Hybrid cloud topology with edge processing capacity in rural postal depots.
- Data Governance: Formal data lineage catalog and automated schema validation active.
- Human Capital: Steering Committee chaired by Chief Director, supported by 6 AI Engineers and 4 Data Stewards.
- Policy Alignment: 100% aligned with Ghana National Artificial Intelligence Strategy 2026-2030.

STATUS: Recommended to National AI Projects Monitoring System for statutory review and final Director General clearance.`
      }
    },
    {
      projectId: 'proj-2',
      projectCode: 'GN-AI-2026-002',
      mda: 'National Identification Authority (NIA)',
      submittedByName: 'Eng. Elizabeth Ansah (NIA AI Systems Director)',
      submittedByEmail: 'e.ansah@nia.gov.gh',
      document: {
        id: `doc-tc-clearance-${Date.now()}`,
        fileName: 'NIA_AFIS_Technical_Clearance_Audit_Charter.pdf',
        fileType: 'PDF',
        fileSize: '5.2 MB',
        pageCount: 16,
        documentCategory: 'Technical Specs',
        fullDocumentText: `REPUBLIC OF GHANA • NATIONAL IDENTIFICATION AUTHORITY (NIA)
STATUTORY CLEARANCE SUBMISSION: National AFIS Biometric Identity Verification (GN-AI-2026-002)

SECTION 1: GOVERNANCE & ETHICS STANDARDS:
- Biometric neural network accuracy validated at 99.85% demographic parity across age and gender brackets.
- Zero commercial third-party data broker monetization. Full Act 843 statutory adherence.
- End-to-end TLS 1.3 cryptographic transport and HSM ephemeral hash verification.
- Model Card published documenting algorithmic false match and non-match thresholds.

SECTION 2: AI READINESS STANDARDS:
- High performance compute clusters situated inside primary data facilities in Accra.
- Multi-tier backup and disaster recovery protocols in place.
- Dedicated technical review panel monitoring false rejection and acceptance rates.

RECOMMENDATION: Transmitted to GNAPRMS as Recommended for statutory technical review.`
      }
    }
  ];

  const payload = sampleBatches[Math.floor(Math.random() * sampleBatches.length)];
  return receiveTechnicalClearanceDocument(payload, currentProjects, session);
}

