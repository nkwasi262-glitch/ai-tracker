import { PlatformUser, ActiveRole, InstitutionCategory, UserStatus } from '../data/authTypes';
import { recordAuditEvent } from './auditService';
import { UserSession } from '../data/authTypes';

const USERS_STORAGE_KEY = 'gnaprms_platform_users_v1';

export const SEED_PLATFORM_USERS: PlatformUser[] = [
  {
    id: 'usr-1',
    fullName: 'Dr. Kwaku Mensah',
    email: 'k.mensah@nita.gov.gh',
    role: 'Super Admin',
    institution: 'National Information Technology Agency (NITA)',
    institutionCategory: 'MDA',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00Z',
    notes: 'Chief Technology Officer & Lead Administrator for Ghana National AI Registry.'
  },
  {
    id: 'usr-2',
    fullName: 'Hon. Director General',
    email: 'dg@nita.gov.gh',
    role: 'Director General',
    institution: 'National Information Technology Agency (NITA)',
    institutionCategory: 'MDA',
    status: 'Active',
    createdAt: '2026-01-15T08:00:00Z',
    notes: 'Statutory decision maker for National AI Registry clearance under NITA Act 771.'
  },
  {
    id: 'usr-3',
    fullName: 'Ing. Emmanuel Darko',
    email: 'e.darko@mocd.gov.gh',
    role: 'Technical Director',
    institution: 'Ministry of Communications and Digitalisation',
    institutionCategory: 'MDA',
    status: 'Active',
    createdAt: '2026-02-01T09:30:00Z',
    notes: 'Head of Infrastructure and Technical Standards.'
  },
  {
    id: 'usr-4',
    fullName: 'Ama Osei-Bonsu',
    email: 'a.osei@nita.gov.gh',
    role: 'Technical Clearance Team',
    institution: 'National Information Technology Agency (NITA)',
    institutionCategory: 'MDA',
    status: 'Active',
    createdAt: '2026-02-10T10:15:00Z',
    notes: 'Lead AI Ethics & Algorithmic Audit Officer.'
  },
  {
    id: 'usr-5',
    fullName: 'Kofi Annan Jr.',
    email: 'k.annan@nita.gov.gh',
    role: 'Technical Clearance Team',
    institution: 'National Information Technology Agency (NITA)',
    institutionCategory: 'MDA',
    status: 'Active',
    createdAt: '2026-02-15T11:00:00Z',
    notes: 'Senior Cybersecurity and Data Architecture Reviewer.'
  },
  {
    id: 'usr-6',
    fullName: 'Kwame Boateng',
    email: 'k.boateng@cocobod.gh',
    role: 'AI Manager',
    institution: 'Ghana Cocoa Board (COCOBOD)',
    institutionCategory: 'SOE',
    status: 'Active',
    createdAt: '2026-03-01T14:20:00Z',
    notes: 'Project Director for Cocoa Management System (CMS) satellite intelligence.'
  },
  {
    id: 'usr-7',
    fullName: 'Hon. Finance Minister',
    email: 'minister@mof.gov.gh',
    role: 'Finance Minister',
    institution: 'Ministry of Finance',
    institutionCategory: 'MDA',
    status: 'Active',
    createdAt: '2026-01-20T12:00:00Z',
    notes: 'Cabinet portfolio for fiscal allocations and capital utilization monitoring.'
  },
  {
    id: 'usr-8',
    fullName: 'Yaw Frimpong',
    email: 'y.frimpong@gra.gov.gh',
    role: 'AI Manager',
    institution: 'Ghana Revenue Authority',
    institutionCategory: 'MDA',
    status: 'Suspended',
    createdAt: '2026-03-10T16:00:00Z',
    notes: 'Account suspended pending investigation of access compliance.'
  },
  {
    id: 'usr-9',
    fullName: 'Kofi Citizen',
    email: 'citizen@public.gh',
    role: 'Public User',
    institution: 'Public Citizen',
    institutionCategory: 'Other',
    status: 'Active',
    createdAt: '2026-04-01T10:00:00Z',
    notes: 'General public observer access.'
  }
];

export function getPlatformUsers(): PlatformUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_PLATFORM_USERS));
      return SEED_PLATFORM_USERS;
    }
    return JSON.parse(raw) as PlatformUser[];
  } catch (e) {
    console.error('Failed to get platform users:', e);
    return SEED_PLATFORM_USERS;
  }
}

export function savePlatformUsers(users: PlatformUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save platform users:', e);
  }
}

export function findUserByEmail(email: string): PlatformUser | null {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  const users = getPlatformUsers();
  return users.find(u => u.email.toLowerCase() === clean) || null;
}

export function onboardUser(params: {
  fullName: string;
  email: string;
  role: ActiveRole;
  institution: string;
  institutionCategory: InstitutionCategory;
  notes?: string;
  adminSession?: UserSession;
}): { success: boolean; user?: PlatformUser; error?: string } {
  const cleanEmail = params.email.trim().toLowerCase();
  const users = getPlatformUsers();

  if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
    return { success: false, error: `A user with email "${cleanEmail}" already exists on the platform.` };
  }

  const newUser: PlatformUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    fullName: params.fullName.trim(),
    email: cleanEmail,
    role: params.role,
    institution: params.institution.trim(),
    institutionCategory: params.institutionCategory,
    status: 'Active',
    createdAt: new Date().toISOString(),
    onboardedBy: params.adminSession?.fullName || 'Super Administrator',
    notes: params.notes?.trim()
  };

  const updated = [newUser, ...users];
  savePlatformUsers(updated);

  recordAuditEvent({
    eventType: 'USER_ONBOARDED',
    actorName: params.adminSession?.fullName || 'Super Admin',
    actorEmail: params.adminSession?.email || 'admin@nita.gov.gh',
    actorRole: params.adminSession?.role || 'Super Admin',
    actorInstitution: params.adminSession?.institution || 'NITA',
    targetModule: 'users',
    targetEntityId: newUser.id,
    actionDetails: `Onboarded new personnel "${newUser.fullName}" (${newUser.email}) with role: ${newUser.role} at ${newUser.institution}.`
  });

  return { success: true, user: newUser };
}

export function updateUserRole(
  userId: string,
  newRole: ActiveRole,
  adminSession?: UserSession
): { success: boolean; error?: string } {
  const users = getPlatformUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, error: 'User not found in directory.' };

  const previousRole = users[index].role;
  users[index].role = newRole;
  savePlatformUsers(users);

  recordAuditEvent({
    eventType: 'USER_ROLE_UPDATED',
    actorName: adminSession?.fullName || 'Super Admin',
    actorEmail: adminSession?.email || 'admin@nita.gov.gh',
    actorRole: adminSession?.role || 'Super Admin',
    actorInstitution: adminSession?.institution || 'NITA',
    targetModule: 'users',
    targetEntityId: userId,
    actionDetails: `Reassigned role for "${users[index].fullName}" (${users[index].email}) from ${previousRole} to ${newRole}.`
  });

  return { success: true };
}

export function toggleUserSuspension(
  userId: string,
  newStatus: UserStatus,
  adminSession?: UserSession,
  reason?: string
): { success: boolean; error?: string } {
  const users = getPlatformUsers();
  const index = users.findIndex(u => u.id === userId);
  if (index === -1) return { success: false, error: 'User not found in directory.' };

  users[index].status = newStatus;
  savePlatformUsers(users);

  const eventType = newStatus === 'Suspended' ? 'USER_SUSPENDED' : 'USER_REACTIVATED';
  recordAuditEvent({
    eventType,
    actorName: adminSession?.fullName || 'Super Admin',
    actorEmail: adminSession?.email || 'admin@nita.gov.gh',
    actorRole: adminSession?.role || 'Super Admin',
    actorInstitution: adminSession?.institution || 'NITA',
    targetModule: 'users',
    targetEntityId: userId,
    actionDetails: `${newStatus === 'Suspended' ? 'Suspended account' : 'Reactivated account'} for "${users[index].fullName}" (${users[index].email}). ${reason ? 'Reason: ' + reason : ''}`
  });

  return { success: true };
}

export function removeUser(
  userId: string,
  adminSession?: UserSession
): { success: boolean; error?: string } {
  const users = getPlatformUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return { success: false, error: 'User not found in directory.' };

  const filtered = users.filter(u => u.id !== userId);
  savePlatformUsers(filtered);

  recordAuditEvent({
    eventType: 'USER_REMOVED',
    actorName: adminSession?.fullName || 'Super Admin',
    actorEmail: adminSession?.email || 'admin@nita.gov.gh',
    actorRole: adminSession?.role || 'Super Admin',
    actorInstitution: adminSession?.institution || 'NITA',
    targetModule: 'users',
    targetEntityId: userId,
    actionDetails: `Revoked and permanently removed user profile "${target.fullName}" (${target.email}) with role: ${target.role}.`
  });

  return { success: true };
}
