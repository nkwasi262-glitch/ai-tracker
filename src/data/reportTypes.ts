import { ActiveRole } from './authTypes';

export type ReportSeverity = 'Information' | 'Medium Priority' | 'Urgent' | 'Critical Escalation';
export type ReportStatus = 'Open' | 'Under Investigation' | 'Resolved' | 'Closed';

export interface ReportComment {
  id: string;
  reportId: string;
  authorName: string;
  authorRole: ActiveRole;
  authorEmail: string;
  authorInstitution: string;
  timestamp: string;
  content: string;
  attachmentName?: string;
}

export interface InternalReport {
  id: string;
  reportCode: string;
  title: string;
  summary: string;
  projectId?: string;
  projectCode?: string;
  documentId?: string;
  severity: ReportSeverity;
  status: ReportStatus;
  createdByName: string;
  createdByRole: ActiveRole;
  createdByEmail: string;
  createdAt: string;
  updatedAt: string;
  assignedRole: 'Technical Director' | 'Technical Clearance Team' | 'Super Admin' | 'Director General';
  readBy: string[]; // List of user emails who have read this report
  comments: ReportComment[];
}
