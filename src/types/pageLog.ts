import { UserRole } from '../components/RoleSwitcher';

export interface PageLogEntry {
  id: string;
  timestamp: string;
  pageName: string;
  path: string;
  userRole: UserRole;
  action: 'Page View' | 'Module Access' | 'Clearance Action' | 'Document Submission' | 'Return to Home';
  status: '200 OK' | 'Authorized' | 'Audit Recorded';
  sessionId: string;
  node: string;
}

export const initialPageLogs: PageLogEntry[] = [
  {
    id: 'log-1001',
    timestamp: '2026-09-30 08:30:12',
    pageName: 'National Gateway (Main Landing)',
    path: '/',
    userRole: 'Regulator / Clearance Authority',
    action: 'Page View',
    status: '200 OK',
    sessionId: 'SESS-GH-9821-A',
    node: 'Accra Core (NITA Tier III)'
  },
  {
    id: 'log-1002',
    timestamp: '2026-09-30 08:35:45',
    pageName: 'Organization Clearance Gate',
    path: '/organizations',
    userRole: 'Regulator / Clearance Authority',
    action: 'Module Access',
    status: 'Authorized',
    sessionId: 'SESS-GH-9821-A',
    node: 'Accra Core (NITA Tier III)'
  },
  {
    id: 'log-1003',
    timestamp: '2026-09-30 08:42:20',
    pageName: 'AI Projects Registry',
    path: '/registry',
    userRole: 'Government Applicant (MDA/SOE)',
    action: 'Module Access',
    status: '200 OK',
    sessionId: 'SESS-GH-7412-B',
    node: 'Kumasi Node (GovNet-AS)'
  },
  {
    id: 'log-1004',
    timestamp: '2026-09-30 08:50:05',
    pageName: 'Sovereign GIS Spatial Map',
    path: '/gis',
    userRole: 'Public User',
    action: 'Page View',
    status: '200 OK',
    sessionId: 'SESS-PUB-1029-C',
    node: 'Takoradi Edge'
  },
  {
    id: 'log-1005',
    timestamp: '2026-09-30 09:05:18',
    pageName: 'Clearance Document Vault',
    path: '/documents',
    userRole: 'Private Sector Applicant',
    action: 'Document Submission',
    status: 'Audit Recorded',
    sessionId: 'SESS-PVT-4482-D',
    node: 'Accra Core (NITA Tier III)'
  }
];
