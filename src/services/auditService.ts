import { AuditLogEntry, AuditEventType } from '../data/auditTypes';
import { ActiveRole } from '../data/authTypes';

const AUDIT_STORAGE_KEY = 'gnaprms_audit_logs_v1';

// Simple deterministic hash simulation for chain integrity
function computeHash(prevHash: string, dataString: string): string {
  let hash = 0;
  const combined = prevHash + ':' + dataString;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `sha256-${hex}${Math.abs(hash * 31).toString(16).padStart(8, '0')}`;
}

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    timestamp: '2026-09-28T08:15:30Z',
    eventType: 'GATE_SUBMISSION',
    actorName: 'Dr. Kwaku Mensah',
    actorEmail: 'k.mensah@nita.gov.gh',
    actorRole: 'Super Admin',
    actorInstitution: 'National Information Technology Agency (NITA)',
    targetModule: 'gate',
    actionDetails: 'Institutional entry gate authenticated with institutional certificate.',
    integrityHash: 'sha256-a1b2c3d4e5f60011',
    retentionUntil: '2031-09-28T08:15:30Z'
  },
  {
    id: 'audit-002',
    timestamp: '2026-09-28T09:30:12Z',
    eventType: 'DOCUMENT_UPLOAD',
    actorName: 'Ing. Emmanuel Darko',
    actorEmail: 'e.darko@mocd.gov.gh',
    actorRole: 'Technical Director',
    actorInstitution: 'Ministry of Communications and Digitalisation',
    targetModule: 'documents',
    targetEntityId: 'doc-1-1',
    actionDetails: 'Uploaded Cocoa Disease Detection Model Architecture Specs (PDF, 4.2 MB) for GN-AI-2026-001.',
    integrityHash: 'sha256-b2c3d4e5f6a10022',
    retentionUntil: '2031-09-28T09:30:12Z'
  },
  {
    id: 'audit-003',
    timestamp: '2026-09-29T11:45:00Z',
    eventType: 'TECH_REVIEW_TRANSITION',
    actorName: 'Ama Osei-Bonsu',
    actorEmail: 'a.osei@nita.gov.gh',
    actorRole: 'Technical Clearance Team',
    actorInstitution: 'National Information Technology Agency (NITA)',
    targetModule: 'documents',
    targetEntityId: 'proj-1',
    actionDetails: 'Technical clearance validated. Recommended GN-AI-2026-001 for Director General final decision.',
    integrityHash: 'sha256-c3d4e5f6a1b20033',
    retentionUntil: '2031-09-29T11:45:00Z'
  },
  {
    id: 'audit-004',
    timestamp: '2026-09-30T14:20:10Z',
    eventType: 'DG_VERDICT_ISSUED',
    actorName: 'Hon. Director General',
    actorEmail: 'dg@nita.gov.gh',
    actorRole: 'Director General',
    actorInstitution: 'National Information Technology Agency (NITA)',
    targetModule: 'dg_queue',
    targetEntityId: 'proj-1',
    actionDetails: 'Final statutory verdict issued: APPROVED with conditions for regional data parity.',
    integrityHash: 'sha256-d4e5f6a1b2c30044',
    retentionUntil: '2031-09-30T14:20:10Z'
  },
  {
    id: 'audit-005',
    timestamp: '2026-10-01T16:05:44Z',
    eventType: 'ACCESS_DENIED',
    actorName: 'Anonymous Guest',
    actorEmail: 'guest@external.com',
    actorRole: 'Public User',
    actorInstitution: 'Public Citizen',
    targetModule: 'governance',
    actionDetails: 'Unauthorized attempt to access Governance & Ethics audit controls. Blocked by RBAC policy.',
    integrityHash: 'sha256-e5f6a1b2c3d40055',
    retentionUntil: '2031-10-01T16:05:44Z'
  }
];

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(SEED_AUDIT_LOGS));
      return SEED_AUDIT_LOGS;
    }
    return JSON.parse(raw) as AuditLogEntry[];
  } catch (e) {
    console.error('Failed to load audit logs:', e);
    return SEED_AUDIT_LOGS;
  }
}

export function recordAuditEvent(params: {
  eventType: AuditEventType;
  actorName: string;
  actorEmail: string;
  actorRole: ActiveRole;
  actorInstitution: string;
  targetModule: string;
  targetEntityId?: string;
  actionDetails: string;
}): AuditLogEntry {
  const currentLogs = getAuditLogs();
  const lastEntry = currentLogs[0];
  const prevHash = lastEntry ? lastEntry.integrityHash : 'GENESIS-BLOCK-000000000000';

  const timestamp = new Date().toISOString();
  
  // 5-year retention calculation under Ghana Data Protection Act (Act 843)
  const retentionDate = new Date();
  retentionDate.setFullYear(retentionDate.getFullYear() + 5);

  const dataPayload = `${timestamp}|${params.eventType}|${params.actorEmail}|${params.targetModule}|${params.actionDetails}`;
  const integrityHash = computeHash(prevHash, dataPayload);

  const newEntry: AuditLogEntry = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp,
    eventType: params.eventType,
    actorName: params.actorName,
    actorEmail: params.actorEmail,
    actorRole: params.actorRole,
    actorInstitution: params.actorInstitution,
    targetModule: params.targetModule,
    targetEntityId: params.targetEntityId,
    actionDetails: params.actionDetails,
    integrityHash,
    retentionUntil: retentionDate.toISOString()
  };

  const updatedLogs = [newEntry, ...currentLogs];
  try {
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error('Failed to write audit entry to storage:', e);
  }

  return newEntry;
}
