import { InternalReport, ReportComment, ReportSeverity } from '../data/reportTypes';
import { ActiveRole } from '../data/authTypes';
import { recordAuditEvent } from './auditService';

const REPORTS_STORAGE_KEY = 'gnaprms_internal_reports_v1';

const SEED_INTERNAL_REPORTS: InternalReport[] = [
  {
    id: 'rep-001',
    reportCode: 'RPT-2026-NITA-01',
    title: 'Biometric Model Drift & Fairness Disparity in Ashanti Region Sub-clusters',
    summary: 'Technical inspection of the GhanaPostGPS route intelligence model indicates localized degradation in peri-urban cluster boundaries. Requires retraining with verified GIS ground-truth.',
    projectId: 'proj-1',
    projectCode: 'GN-AI-2026-001',
    documentId: 'doc-1-2',
    severity: 'Urgent',
    status: 'Open',
    createdByName: 'Ing. Emmanuel Darko',
    createdByRole: 'Technical Director',
    createdByEmail: 'e.darko@mocd.gov.gh',
    createdAt: '2026-10-02T10:14:00Z',
    updatedAt: '2026-10-03T14:22:00Z',
    assignedRole: 'Technical Clearance Team',
    readBy: ['e.darko@mocd.gov.gh', 'k.mensah@nita.gov.gh'],
    comments: [
      {
        id: 'comm-1',
        reportId: 'rep-001',
        authorName: 'Ama Osei-Bonsu',
        authorRole: 'Technical Clearance Team',
        authorEmail: 'a.osei@nita.gov.gh',
        authorInstitution: 'National Information Technology Agency (NITA)',
        timestamp: '2026-10-02T15:30:00Z',
        content: 'Cross-checked against the ethical fairness checklist. Fairness grade dropped from 94% to 88% due to under-sampling in off-grid sectors. Recommend requesting updated dataset documentation before recommending to DG.',
        attachmentName: 'ashanti_periurban_dataset_audit.pdf'
      },
      {
        id: 'comm-2',
        reportId: 'rep-001',
        authorName: 'Dr. Kwaku Mensah',
        authorRole: 'Super Admin',
        authorEmail: 'k.mensah@nita.gov.gh',
        authorInstitution: 'NITA',
        timestamp: '2026-10-03T09:10:00Z',
        content: 'Flagged for priority discussion with the Ministry of Communications technical leads. Ensure Act 843 consent logs are verified.'
      }
    ]
  },
  {
    id: 'rep-002',
    reportCode: 'RPT-2026-SEC-04',
    title: 'OWASP Top 10 API Authorization Escapes on Health ML Inference Gateway',
    summary: 'Penetration testing on the National Health Insurance Authority automated claims predictive triage model exposed unauthenticated rate-limit gaps on endpoints.',
    projectId: 'proj-4',
    projectCode: 'GN-AI-2026-004',
    severity: 'Critical Escalation',
    status: 'Under Investigation',
    createdByName: 'Kofi Annan Jr.',
    createdByRole: 'Technical Clearance Team',
    createdByEmail: 'k.annan@nita.gov.gh',
    createdAt: '2026-10-04T08:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z',
    assignedRole: 'Technical Director',
    readBy: ['k.annan@nita.gov.gh'],
    comments: [
      {
        id: 'comm-3',
        reportId: 'rep-002',
        authorName: 'Ing. Emmanuel Darko',
        authorRole: 'Technical Director',
        authorEmail: 'e.darko@mocd.gov.gh',
        authorInstitution: 'MOCD',
        timestamp: '2026-10-04T11:45:00Z',
        content: 'Clearance paused immediately. Status set to Needs Correction until mutual TLS and API key hashing are implemented.'
      }
    ]
  }
];

export function getInternalReports(): InternalReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(SEED_INTERNAL_REPORTS));
      return SEED_INTERNAL_REPORTS;
    }
    return JSON.parse(raw) as InternalReport[];
  } catch (e) {
    console.error('Failed to get internal reports:', e);
    return SEED_INTERNAL_REPORTS;
  }
}

export function createInternalReport(params: {
  title: string;
  summary: string;
  projectId?: string;
  projectCode?: string;
  documentId?: string;
  severity: ReportSeverity;
  assignedRole: 'Technical Director' | 'Technical Clearance Team' | 'Super Admin' | 'Director General';
  authorName: string;
  authorRole: ActiveRole;
  authorEmail: string;
  authorInstitution: string;
}): InternalReport {
  const current = getInternalReports();
  const reportCode = `RPT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newReport: InternalReport = {
    id: `rep-${Date.now()}`,
    reportCode,
    title: params.title.trim(),
    summary: params.summary.trim(),
    projectId: params.projectId,
    projectCode: params.projectCode,
    documentId: params.documentId,
    severity: params.severity,
    status: 'Open',
    createdByName: params.authorName,
    createdByRole: params.authorRole,
    createdByEmail: params.authorEmail,
    createdAt: now,
    updatedAt: now,
    assignedRole: params.assignedRole,
    readBy: [params.authorEmail],
    comments: []
  };

  const updated = [newReport, ...current];
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(updated));

  recordAuditEvent({
    eventType: 'INTERNAL_REPORT_CREATED',
    actorName: params.authorName,
    actorEmail: params.authorEmail,
    actorRole: params.authorRole,
    actorInstitution: params.authorInstitution,
    targetModule: 'reports',
    targetEntityId: newReport.id,
    actionDetails: `Created internal report ${reportCode}: "${params.title}" (${params.severity})`
  });

  return newReport;
}

export function addReportComment(params: {
  reportId: string;
  content: string;
  attachmentName?: string;
  authorName: string;
  authorRole: ActiveRole;
  authorEmail: string;
  authorInstitution: string;
}): ReportComment | null {
  const reports = getInternalReports();
  const targetIndex = reports.findIndex(r => r.id === params.reportId);
  if (targetIndex === -1) return null;

  const now = new Date().toISOString();
  const newComment: ReportComment = {
    id: `comm-${Date.now()}`,
    reportId: params.reportId,
    authorName: params.authorName,
    authorRole: params.authorRole,
    authorEmail: params.authorEmail,
    authorInstitution: params.authorInstitution,
    timestamp: now,
    content: params.content.trim(),
    attachmentName: params.attachmentName
  };

  reports[targetIndex].comments.push(newComment);
  reports[targetIndex].updatedAt = now;
  if (!reports[targetIndex].readBy.includes(params.authorEmail)) {
    reports[targetIndex].readBy.push(params.authorEmail);
  }

  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));

  recordAuditEvent({
    eventType: 'REPORT_COMMENT_ADDED',
    actorName: params.authorName,
    actorEmail: params.authorEmail,
    actorRole: params.authorRole,
    actorInstitution: params.authorInstitution,
    targetModule: 'reports',
    targetEntityId: params.reportId,
    actionDetails: `Added commentary to report ${reports[targetIndex].reportCode}`
  });

  return newComment;
}

export function markReportAsRead(reportId: string, userEmail: string): void {
  const reports = getInternalReports();
  const report = reports.find(r => r.id === reportId);
  if (report && !report.readBy.includes(userEmail)) {
    report.readBy.push(userEmail);
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
  }
}
