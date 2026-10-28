import { DGVerdictRecord, DGVerdictDecision } from '../data/verdictTypes';
import { recordAuditEvent } from './auditService';

const VERDICTS_STORAGE_KEY = 'gnaprms_dg_verdicts_v3';

const SEED_VERDICTS: DGVerdictRecord[] = [
  {
    id: 'verd-001',
    projectId: 'proj-6',
    projectCode: 'GN-AI-2026-006',
    projectName: 'LEAP Biometric Social Transfer Registry',
    mda: 'Ministry of Gender, Children and Social Protection',
    verdict: 'Approve',
    finalStatusLabel: 'Approved',
    mandatoryComments: 'Statutory compliance satisfied under NITA Act 771 and Data Protection Act 843. Biometric social transfer registry approved for operational deployment and MoF treasury warrant release.',
    reviewedByName: 'Hon. Director General',
    reviewedByRole: 'Director General',
    reviewedByEmail: 'dg@nita.gov.gh',
    timestamp: '2026-09-30T14:20:10Z',
    technicalRecommendationSummary: 'Technical clearance validated. 92% ethical compliance score.',
    complianceGradeAtReview: 'Good',
    clearanceOfficer: 'Ing. Emmanuel Darko (Technical Director)',
    signatureSeal: 'DG-SEAL-NITA-2026-006A9F'
  },
  {
    id: 'verd-002',
    projectId: 'proj-5',
    projectCode: 'GN-AI-2026-005',
    projectName: 'NHIS Claims Biometric & AI Validation Engine',
    mda: 'National Health Insurance Authority (NHIA)',
    verdict: 'Return for Further Review',
    finalStatusLabel: 'Requires More Understanding',
    mandatoryComments: 'Requires more understanding and technical clarification before final national deployment sign-off: (1) NHIA must provide a detailed breakdown of how false-positive AI claim rejections are manually appealed by rural district clinics; (2) Offline biometric verification fallback during cellular outages must be demonstrated; and (3) Self-reported GHS 4.5M disbursement requires matching MoF Treasury Warrant vouchers.',
    reviewedByName: 'Hon. Director General',
    reviewedByRole: 'Director General',
    reviewedByEmail: 'dg@nita.gov.gh',
    timestamp: '2026-10-12T11:15:00Z',
    technicalRecommendationSummary: 'DPIA signed, but clinic dispute workflow and warrant reconciliation need further clarification.',
    complianceGradeAtReview: 'Good',
    clearanceOfficer: 'Ama Osei-Bonsu (Technical Clearance Team)',
    signatureSeal: 'DG-SEAL-NITA-2026-005C4E'
  },
  {
    id: 'verd-003',
    projectId: 'proj-4',
    projectCode: 'GN-AI-2026-004',
    projectName: 'National E-Justice Court Tracking Registry',
    mda: "Ministry of Justice and Attorney General's Department",
    verdict: 'Reject',
    finalStatusLabel: 'Rejected',
    mandatoryComments: 'Statutory Rejection issued under NITA Act 771 & Public Financial Management Act (Act 921): (1) Unreconciled financial audit discrepancy of GHS 850,000 in judicial cloud licensing flagged by MoF Internal Audit Directorate; (2) Unacceptable speech-to-text transcription error rate (>18% word error rate) on regional Ghanaian languages (Akan/Twi, Ewe, Ga) risking wrongful court transcript records; and (3) Lack of certified judicial privacy encryption sign-off under Act 843.',
    reviewedByName: 'Hon. Director General',
    reviewedByRole: 'Director General',
    reviewedByEmail: 'dg@nita.gov.gh',
    timestamp: '2026-10-15T16:40:00Z',
    technicalRecommendationSummary: 'Flagged for high acoustic bias in court transcription and MoF expenditure hold.',
    complianceGradeAtReview: 'Good',
    clearanceOfficer: 'Ing. Emmanuel Darko (Technical Director)',
    signatureSeal: 'DG-SEAL-NITA-2026-004R8B'
  }
];

export function getDGVerdicts(): DGVerdictRecord[] {
  try {
    const raw = localStorage.getItem(VERDICTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(VERDICTS_STORAGE_KEY, JSON.stringify(SEED_VERDICTS));
      return SEED_VERDICTS;
    }
    return JSON.parse(raw) as DGVerdictRecord[];
  } catch (e) {
    console.error('Failed to get DG verdicts:', e);
    return SEED_VERDICTS;
  }
}

export function recordDGVerdict(params: {
  projectId: string;
  projectCode: string;
  projectName: string;
  mda: string;
  verdict: DGVerdictDecision;
  mandatoryComments: string;
  reviewedByName: string;
  reviewedByRole: 'Director General' | 'Super Admin';
  reviewedByEmail: string;
  technicalRecommendationSummary: string;
  complianceGradeAtReview: string;
  clearanceOfficer: string;
}): DGVerdictRecord {
  const current = getDGVerdicts();
  const finalStatusLabel: DGVerdictRecord['finalStatusLabel'] =
    params.verdict === 'Approve'
      ? 'Approved'
      : params.verdict === 'Reject'
      ? 'Rejected'
      : 'Requires More Understanding';

  const signatureSeal = `DG-SEAL-NITA-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newVerdict: DGVerdictRecord = {
    id: `verd-${Date.now()}`,
    projectId: params.projectId,
    projectCode: params.projectCode,
    projectName: params.projectName,
    mda: params.mda,
    verdict: params.verdict,
    finalStatusLabel,
    mandatoryComments: params.mandatoryComments.trim(),
    reviewedByName: params.reviewedByName,
    reviewedByRole: params.reviewedByRole,
    reviewedByEmail: params.reviewedByEmail,
    timestamp: new Date().toISOString(),
    technicalRecommendationSummary: params.technicalRecommendationSummary,
    complianceGradeAtReview: params.complianceGradeAtReview,
    clearanceOfficer: params.clearanceOfficer,
    signatureSeal
  };

  // Replace any older verdict for the same project at the top while keeping history
  const updated = [newVerdict, ...current];
  localStorage.setItem(VERDICTS_STORAGE_KEY, JSON.stringify(updated));

  recordAuditEvent({
    eventType: 'DG_VERDICT_ISSUED',
    actorName: params.reviewedByName,
    actorEmail: params.reviewedByEmail,
    actorRole: params.reviewedByRole,
    actorInstitution: 'National Information Technology Agency (NITA)',
    targetModule: 'dg_queue',
    targetEntityId: params.projectId,
    actionDetails: `Final Director General Sign-Off & Verdict "${finalStatusLabel.toUpperCase()}" (${params.verdict}) issued for ${params.projectCode} (${params.projectName}). Reasons / Directives: ${params.mandatoryComments.substring(0, 140)}`
  });

  return newVerdict;
}
