import { ActiveRole } from '../data/authTypes';

export type AppModuleId =
  | 'dashboard'
  | 'registry'
  | 'gis'
  | 'governance'
  | 'readiness'
  | 'risk'
  | 'documents'
  | 'dg_queue'
  | 'finance'
  | 'reports'
  | 'audit'
  | 'users'
  | 'chat';

export type AppAction =
  | 'VIEW'
  | 'CREATE'
  | 'EDIT'
  | 'DELETE'
  | 'RECOMMEND_TO_DG'
  | 'PASS_DG_VERDICT'
  | 'EXPORT_FINANCIALS'
  | 'CREATE_INTERNAL_REPORT'
  | 'COMMENT_INTERNAL_REPORT'
  | 'SIGN_DOCUMENT'
  | 'VIEW_AUDIT_LOG'
  | 'PURGE_AUDIT_LOG'
  | 'MANAGE_USERS';

export interface ModuleDefinition {
  id: AppModuleId;
  label: string;
  description: string;
  category: 'core' | 'technical' | 'governance' | 'executive' | 'financial' | 'security';
}

export const MODULE_REGISTRY: Record<AppModuleId, ModuleDefinition> = {
  dashboard: {
    id: 'dashboard',
    label: 'M&E Dashboard',
    description: 'National project KPIs, budget distributions, and cross-sector performance indicators.',
    category: 'core'
  },
  registry: {
    id: 'registry',
    label: 'Project Registry',
    description: 'Master repository of all registered National AI projects, stages, and MDA affiliations.',
    category: 'technical'
  },
  gis: {
    id: 'gis',
    label: 'GIS Spatial Map',
    description: 'Interactive geospatial distribution of AI deployments across Ghana\'s 16 regions.',
    category: 'core'
  },
  governance: {
    id: 'governance',
    label: 'Governance & Ethics',
    description: 'Ghana AI Ethics Framework audit tool evaluating Fairness, Transparency, Privacy, and Security.',
    category: 'governance'
  },
  readiness: {
    id: 'readiness',
    label: 'AI Readiness',
    description: 'Institutional capability assessment framework across computing, data, skills, and policy.',
    category: 'governance'
  },
  risk: {
    id: 'risk',
    label: 'Risk Matrix',
    description: '5x5 Likelihood vs Impact systemic risk grid with algorithmic and cyber threat tracking.',
    category: 'governance'
  },
  documents: {
    id: 'documents',
    label: 'Documents & OCR',
    description: 'Compliance document validation, OCR text extraction, and technical clearance review.',
    category: 'technical'
  },
  dg_queue: {
    id: 'dg_queue',
    label: 'DG Decision Queue',
    description: 'Executive decision queue for projects recommended by technical clearance teams.',
    category: 'executive'
  },
  finance: {
    id: 'finance',
    label: 'Financial Suite',
    description: 'National AI budget allocations, disbursement tracking, fiscal analytics, and export tools.',
    category: 'financial'
  },
  reports: {
    id: 'reports',
    label: 'Internal Reports & Escalations',
    description: 'Classified inter-agency communication, investigation notes, and risk escalations.',
    category: 'technical'
  },
  audit: {
    id: 'audit',
    label: 'Audit Trail Explorer',
    description: 'Immutable, tamper-evident record of all system events compliant with Act 843.',
    category: 'security'
  },
  users: {
    id: 'users',
    label: 'User Management',
    description: 'Onboard institutional personnel, assign role profiles, manage suspensions, and revoke access.',
    category: 'security'
  },
  chat: {
    id: 'chat',
    label: 'AI Assistant',
    description: 'Conversational assistant providing instant answers on national AI policies and registry data.',
    category: 'core'
  }
};

// Module access matrix by role
const ROLE_MODULE_PERMISSIONS: Record<ActiveRole, AppModuleId[]> = {
  'Super Admin': [
    'dashboard',
    'registry',
    'gis',
    'governance',
    'readiness',
    'risk',
    'documents',
    'dg_queue',
    'finance',
    'reports',
    'audit',
    'users',
    'chat'
  ],
  'Technical Director': [
    'dashboard',
    'registry',
    'gis',
    'governance',
    'readiness',
    'risk',
    'documents',
    'dg_queue',
    'finance',
    'reports',
    'audit',
    'chat'
  ],
  'Technical Clearance Team': [
    'dashboard',
    'registry',
    'gis',
    'governance',
    'readiness',
    'risk',
    'documents',
    'finance',
    'reports',
    'audit',
    'chat'
  ],
  'AI Manager': [
    'dashboard',
    'registry',
    'gis',
    'governance',
    'readiness',
    'risk',
    'documents',
    'finance',
    'reports',
    'chat'
  ],
  'Director General': [
    'dashboard',
    'dg_queue',
    'gis',
    'finance',
    'reports',
    'audit',
    'chat'
  ],
  'Finance Minister': [
    'dashboard',
    'finance',
    'chat'
  ],
  'Public User': [
    'dashboard',
    'gis',
    'chat'
  ]
};

// Specific action permissions
const ROLE_ACTION_PERMISSIONS: Record<ActiveRole, Partial<Record<AppAction, boolean>>> = {
  'Super Admin': {
    VIEW: true,
    CREATE: true,
    EDIT: true,
    DELETE: true,
    RECOMMEND_TO_DG: true,
    PASS_DG_VERDICT: true,
    EXPORT_FINANCIALS: true,
    CREATE_INTERNAL_REPORT: true,
    COMMENT_INTERNAL_REPORT: true,
    SIGN_DOCUMENT: true,
    VIEW_AUDIT_LOG: true,
    PURGE_AUDIT_LOG: false, // Tamper-evident: even super admin cannot purge immutable logs
    MANAGE_USERS: true
  },
  'Technical Director': {
    VIEW: true,
    CREATE: true,
    EDIT: true,
    DELETE: false,
    RECOMMEND_TO_DG: true,
    PASS_DG_VERDICT: false, // Only DG passes final verdict
    EXPORT_FINANCIALS: true,
    CREATE_INTERNAL_REPORT: true,
    COMMENT_INTERNAL_REPORT: true,
    SIGN_DOCUMENT: true,
    VIEW_AUDIT_LOG: true,
    PURGE_AUDIT_LOG: false
  },
  'Technical Clearance Team': {
    VIEW: true,
    CREATE: true,
    EDIT: true,
    DELETE: false,
    RECOMMEND_TO_DG: true,
    PASS_DG_VERDICT: false,
    EXPORT_FINANCIALS: true,
    CREATE_INTERNAL_REPORT: true,
    COMMENT_INTERNAL_REPORT: true,
    SIGN_DOCUMENT: true,
    VIEW_AUDIT_LOG: true,
    PURGE_AUDIT_LOG: false
  },
  'AI Manager': {
    VIEW: true,
    CREATE: true,
    EDIT: true,
    DELETE: false,
    RECOMMEND_TO_DG: true,
    PASS_DG_VERDICT: false,
    EXPORT_FINANCIALS: true,
    CREATE_INTERNAL_REPORT: true,
    COMMENT_INTERNAL_REPORT: true,
    SIGN_DOCUMENT: true,
    VIEW_AUDIT_LOG: false,
    PURGE_AUDIT_LOG: false
  },
  'Director General': {
    VIEW: true,
    CREATE: false,
    EDIT: false,
    DELETE: false,
    RECOMMEND_TO_DG: false,
    PASS_DG_VERDICT: true, // Core DG responsibility
    EXPORT_FINANCIALS: true,
    CREATE_INTERNAL_REPORT: true,
    COMMENT_INTERNAL_REPORT: true,
    SIGN_DOCUMENT: true,
    VIEW_AUDIT_LOG: true,
    PURGE_AUDIT_LOG: false
  },
  'Finance Minister': {
    VIEW: true,
    CREATE: false,
    EDIT: false,
    DELETE: false,
    RECOMMEND_TO_DG: false,
    PASS_DG_VERDICT: false,
    EXPORT_FINANCIALS: true, // Finance Minister export access
    CREATE_INTERNAL_REPORT: false,
    COMMENT_INTERNAL_REPORT: false,
    SIGN_DOCUMENT: false,
    VIEW_AUDIT_LOG: false,
    PURGE_AUDIT_LOG: false
  },
  'Public User': {
    VIEW: true,
    CREATE: false,
    EDIT: false,
    DELETE: false,
    RECOMMEND_TO_DG: false,
    PASS_DG_VERDICT: false,
    EXPORT_FINANCIALS: false,
    CREATE_INTERNAL_REPORT: false,
    COMMENT_INTERNAL_REPORT: false,
    SIGN_DOCUMENT: false,
    VIEW_AUDIT_LOG: false,
    PURGE_AUDIT_LOG: false
  }
};

/**
 * Checks whether an active role profile is authorized to access a specific module.
 */
export function canAccessModule(role: ActiveRole, moduleId: AppModuleId): boolean {
  const allowedModules = ROLE_MODULE_PERMISSIONS[role] || [];
  return allowedModules.includes(moduleId);
}

/**
 * Checks whether an active role profile is authorized to execute an action.
 */
export function canPerformAction(role: ActiveRole, action: AppAction): boolean {
  const roleActions = ROLE_ACTION_PERMISSIONS[role] || {};
  return !!roleActions[action];
}

/**
 * Returns the list of permitted module IDs for the provided role.
 */
export function getPermittedModules(role: ActiveRole): AppModuleId[] {
  return ROLE_MODULE_PERMISSIONS[role] || [];
}

/**
 * Validates if the user email has an approved government domain.
 */
export function isApprovedInstitutionalEmail(email: string): boolean {
  if (!email || !email.includes('@')) return false;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return false;
  
  // Exact match or subdomain of .gov.gh or .ghana.gov.gh
  return (
    domain.endsWith('.gov.gh') ||
    domain === 'gov.gh' ||
    domain === 'nita.gov.gh' ||
    domain === 'mocd.gov.gh' ||
    domain === 'mof.gov.gh' ||
    domain === 'moh.gov.gh' ||
    domain === 'moe.gov.gh' ||
    domain === 'dpc.gov.gh' ||
    domain === 'gra.gov.gh' ||
    domain === 'cocobod.gh'
  );
}
