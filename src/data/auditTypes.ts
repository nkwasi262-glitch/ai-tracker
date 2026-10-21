import { ActiveRole } from './authTypes';

export type AuditEventType =
  | 'GATE_SUBMISSION'
  | 'ROLE_SWITCH'
  | 'ROLE_ELEVATION'
  | 'LOGOUT'
  | 'VERIFICATION_SUCCESS'
  | 'VERIFICATION_FAILURE'
  | 'ACCESS_DENIED'
  | 'PROJECT_VIEW'
  | 'PROJECT_CREATE'
  | 'PROJECT_DELETE'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_UPLOAD'
  | 'DOCUMENT_SIGN'
  | 'TECH_REVIEW_TRANSITION'
  | 'DG_VERDICT_ISSUED'
  | 'INTERNAL_REPORT_CREATED'
  | 'REPORT_COMMENT_ADDED'
  | 'FINANCIAL_EXPORT'
  | 'SYSTEM_CONFIG_UPDATED'
  | 'PROJECT_REGISTRATION_APPROVED'
  | 'PROJECT_REGISTRATION_PENDED'
  | 'PROJECT_REGISTRATION_REJECTED'
  | 'ASSESSMENT_AUTO_GENERATED'
  | 'ASSUMPTION_ELIMINATED'
  | 'AUDIT_DISCREPANCY_FLAGGED'
  | 'FINANCIAL_VERIFICATION_UPDATE';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actorName: string;
  actorEmail: string;
  actorRole: ActiveRole;
  actorInstitution: string;
  targetModule: string;
  targetEntityId?: string;
  actionDetails: string;
  integrityHash: string; // SHA-256 style signature simulation
  retentionUntil: string; // Ghana Act 843 5-year retention timestamp
}
