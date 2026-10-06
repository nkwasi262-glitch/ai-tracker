import { DGVerdictRecord, DGVerdictDecision } from '../data/verdictTypes';
import { recordAuditEvent } from './auditService';

const VERDICTS_STORAGE_KEY = 'gnaprms_dg_verdicts_v1';

const SEED_VERDICTS: DGVerdictRecord[] = [
  {
    id: 'verd-001',
    projectId: 'proj-1',
    projectCode: 'GN-AI-2026-001',
    projectName: 'GhanaPostGPS (National Digital Addressing System)',
    mda: 'Ministry of Communications and Digitalisation (MoCD)',
    verdict: 'Approve',
    mandatoryComments: 'Statutory compliance satisfied under NITA Act 771 and Data Protection Act 843. Approved for operational continuous monitoring across all 16 regions.',
    reviewedByName: 'Hon. Director General',
    reviewedByRole: 'Director General',
    reviewedByEmail: 'dg@nita.gov.gh',
    timestamp: '2026-09-30T14:20:10Z',
    technicalRecommendationSummary: 'Technical clearance validated. 94% ethical compliance score.',
    complianceGradeAtReview: 'Excellent',
    clearanceOfficer: 'Ing. Emmanuel Darko (Technical Director)'
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
  const newVerdict: DGVerdictRecord = {
    id: `verd-${Date.now()}`,
    projectId: params.projectId,
    projectCode: params.projectCode,
    projectName: params.projectName,
    mda: params.mda,
    verdict: params.verdict,
    mandatoryComments: params.mandatoryComments.trim(),
    reviewedByName: params.reviewedByName,
    reviewedByRole: params.reviewedByRole,
    reviewedByEmail: params.reviewedByEmail,
    timestamp: new Date().toISOString(),
    technicalRecommendationSummary: params.technicalRecommendationSummary,
    complianceGradeAtReview: params.complianceGradeAtReview,
    clearanceOfficer: params.clearanceOfficer
  };

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
    actionDetails: `Final verdict "${params.verdict.toUpperCase()}" issued for ${params.projectCode} (${params.projectName}). Remarks: ${params.mandatoryComments.substring(0, 100)}...`
  });

  return newVerdict;
}
