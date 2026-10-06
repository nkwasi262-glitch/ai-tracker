export type DGVerdictDecision = 'Approve' | 'Reject' | 'Return for Further Review';

export interface DGVerdictRecord {
  id: string;
  projectId: string;
  projectCode: string;
  projectName: string;
  mda: string;
  verdict: DGVerdictDecision;
  mandatoryComments: string;
  reviewedByName: string;
  reviewedByRole: 'Director General' | 'Super Admin';
  reviewedByEmail: string;
  timestamp: string;
  technicalRecommendationSummary: string;
  complianceGradeAtReview: string;
  clearanceOfficer: string;
}
