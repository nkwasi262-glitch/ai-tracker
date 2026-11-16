import { AppModuleId } from '../services/rbacPolicy';
import { ActiveRole, LegacyRole } from '../data/authTypes';

export type PageAuditActionCategory = 
  | 'VIEW'
  | 'MUTATION'
  | 'SECURITY_EVENT'
  | 'STATUTORY_GATE'
  | 'EXPORT'
  | 'INTEGRATION';

export interface PageAuditDiff {
  field: string;
  label: string;
  oldValue: any;
  newValue: any;
}

export interface PageAuditLogItem {
  id: string;
  timestamp: string;
  module: AppModuleId | string;
  category: PageAuditActionCategory;
  eventType: string;
  actorName: string;
  actorEmail: string;
  actorRole: ActiveRole | LegacyRole | string;
  actorInstitution: string;
  targetEntityId?: string;
  targetEntityName?: string;
  actionDetails: string;
  integrityHash: string;
  ipAddress?: string;
  correlationId?: string;
  diffs?: PageAuditDiff[];
  retentionUntil: string;
  isVerified?: boolean;
}

export interface PageAuditFilter {
  module?: AppModuleId | string;
  searchTerm?: string;
  category?: PageAuditActionCategory | 'ALL';
  dateFrom?: string;
  dateTo?: string;
  entityId?: string;
}

export interface PageAuditSummary {
  totalEvents: number;
  mutationsCount: number;
  securityEventsCount: number;
  lastActivityTimestamp: string | null;
  activeActorsCount: number;
}
