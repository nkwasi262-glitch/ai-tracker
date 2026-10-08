export type ActiveRole =
  | 'Super Admin'
  | 'Director General'
  | 'Technical Director'
  | 'Technical Clearance Team'
  | 'AI Manager'
  | 'Finance Minister'
  | 'Public User';

export type UserStatus = 'Active' | 'Suspended' | 'Pending';

export interface PlatformUser {
  id: string;
  fullName: string;
  email: string;
  role: ActiveRole;
  institution: string;
  institutionCategory: InstitutionCategory;
  status: UserStatus;
  createdAt: string;
  lastLoginAt?: string;
  onboardedBy?: string;
  notes?: string;
}

export type InstitutionCategory = 'MDA' | 'MMDA' | 'SOE' | 'Private Sector' | 'Other';

export interface ManagingInstitution {
  id: string;
  name: string;
  code: string;
  category: InstitutionCategory;
}

export interface UserSession {
  sessionId: string;
  fullName: string;
  institution: string;
  institutionCategory: InstitutionCategory;
  role: ActiveRole;
  email: string;
  submissionDate: string;
  isVerified: boolean;
  verifiedAt?: string;
  verificationMethod?: 'DOMAIN_ALLOWLIST' | 'EMAIL_OTP' | 'ADMIN_APPROVAL';
  token: string;
  createdAt: string;
  lastActiveAt: string;
}

export const APPROVED_GOV_DOMAINS = [
  'gov.gh',
  'nita.gov.gh',
  'mocd.gov.gh',
  'mof.gov.gh',
  'moh.gov.gh',
  'moe.gov.gh',
  'dpc.gov.gh',
  'gra.gov.gh',
  'cocobod.gh'
];

export const STANDARD_INSTITUTIONS: ManagingInstitution[] = [
  { id: 'inst-1', name: 'National Information Technology Agency (NITA)', code: 'NITA', category: 'MDA' },
  { id: 'inst-2', name: 'Ministry of Communications and Digitalisation', code: 'MOCD', category: 'MDA' },
  { id: 'inst-3', name: 'Ministry of Finance', code: 'MOF', category: 'MDA' },
  { id: 'inst-4', name: 'Data Protection Commission', code: 'DPC', category: 'MDA' },
  { id: 'inst-5', name: 'Ministry of Health', code: 'MOH', category: 'MDA' },
  { id: 'inst-6', name: 'Ministry of Food and Agriculture', code: 'MOFA', category: 'MDA' },
  { id: 'inst-7', name: 'Ministry of Education', code: 'MOE', category: 'MDA' },
  { id: 'inst-8', name: 'National Health Insurance Authority', code: 'NHIA', category: 'MDA' },
  { id: 'inst-9', name: 'Judicial Service of Ghana', code: 'JSG', category: 'MDA' },
  { id: 'inst-10', name: 'Ministry of Transport', code: 'MOT', category: 'MDA' },
  { id: 'inst-11', name: 'Ministry of Interior', code: 'MINTER', category: 'MDA' },
  { id: 'inst-12', name: 'Ghana Revenue Authority', code: 'GRA', category: 'MDA' },
  { id: 'inst-13', name: 'Ghana Cocoa Board (COCOBOD)', code: 'COCOBOD', category: 'SOE' },
  { id: 'inst-14', name: 'Volta River Authority', code: 'VRA', category: 'SOE' },
  { id: 'inst-15', name: 'Electricity Company of Ghana', code: 'ECG', category: 'SOE' },
  { id: 'inst-16', name: 'Ghana Ports and Harbours Authority', code: 'GPHA', category: 'SOE' },
  { id: 'inst-17', name: 'Accra Metropolitan Assembly', code: 'AMA', category: 'MMDA' },
  { id: 'inst-18', name: 'Kumasi Metropolitan Assembly', code: 'KMA', category: 'MMDA' },
  { id: 'inst-19', name: 'Sekondi-Takoradi Metropolitan Assembly', code: 'STMA', category: 'MMDA' },
  { id: 'inst-20', name: 'Tamale Metropolitan Assembly', code: 'TMA', category: 'MMDA' }
];
