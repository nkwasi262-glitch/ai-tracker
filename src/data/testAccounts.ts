import { ActiveRole, InstitutionCategory } from './authTypes';

export interface TestAccount {
  role: ActiveRole;
  fullName: string;
  email: string;
  password: string;
  institution: string;
  institutionId: string;
  institutionCategory: InstitutionCategory;
  badge: string;
  badgeColor: string;
  description: string;
  accessibleModules: string[];
}

export const TEST_ACCOUNTS: TestAccount[] = [
  {
    role: 'Super Admin',
    fullName: 'Dr. Kwabena Boateng (Super Admin)',
    email: 'superadmin@nita.gov.gh',
    password: 'SuperAdmin@2026',
    institution: 'National Information Technology Agency (NITA)',
    institutionId: 'inst-1',
    institutionCategory: 'MDA',
    badge: 'Tier-1 Security Oversight',
    badgeColor: '#ef4444',
    description: 'Complete administrative oversight across all national registries, security audits, technical evaluations, and system configurations.',
    accessibleModules: [
      'M&E Dashboard',
      'Project Registry',
      'GIS Spatial Map',
      'Governance & Ethics',
      'AI Readiness',
      'Risk Matrix',
      'Documents & OCR',
      'Financial Suite',
      'Internal Reports',
      'Audit Trail',
      'AI Chat Assistant'
    ]
  },
  {
    role: 'Technical Unit',
    fullName: 'Eng. Emmanuel Darko (Technical Unit)',
    email: 'techdirector@mocd.gov.gh',
    password: 'TechDirector@2026',
    institution: 'Ministry of Communications and Digitalisation',
    institutionId: 'inst-2',
    institutionCategory: 'MDA',
    badge: 'Technical & Regulatory Unit',
    badgeColor: '#6366f1',
    description: 'Unified Technical Unit supervising technical intake, 12-domain assessments, model & dataset evaluation, risk scoring, M&E, and statutory inspections.',
    accessibleModules: [
      'M&E Dashboard',
      'Project Registry',
      'GIS Spatial Map',
      'Governance & Ethics',
      'AI Readiness',
      'Risk Matrix',
      'Documents & OCR',
      'Financial Suite',
      'Internal Reports',
      'Audit Trail',
      'AI Chat Assistant'
    ]
  },
  {
    role: 'Public User',
    fullName: 'Kwame Mensah (Citizen Observer)',
    email: 'public.user@gov.gh',
    password: 'PublicUser@2026',
    institution: 'National Information Technology Agency (NITA)',
    institutionId: 'inst-1',
    institutionCategory: 'MDA',
    badge: 'Citizen Transparency',
    badgeColor: '#10b981',
    description: 'Transparent citizen observer access to high-level national statistics, regional GIS spatial deployments, and the regulatory assistant.',
    accessibleModules: [
      'M&E Dashboard',
      'GIS Spatial Map',
      'AI Chat Assistant'
    ]
  }
];

