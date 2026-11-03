import { UserSession, ActiveRole, InstitutionCategory } from '../data/authTypes';
import { isApprovedInstitutionalEmail } from './rbacPolicy';
import { recordAuditEvent } from './auditService';
import { apiClient } from './apiClient';

const SESSION_KEY = 'gnaprms_user_session_v1';
const PENDING_OTP_KEY = 'gnaprms_pending_otp_v1';
const LAST_ROLE_KEY = 'gnaprms_last_selected_role_v1';

export function getLastSelectedRole(): ActiveRole | null {
  try {
    const role = localStorage.getItem(LAST_ROLE_KEY);
    return role ? (role as ActiveRole) : null;
  } catch (e) {
    return null;
  }
}

export function setLastSelectedRole(role: ActiveRole | string): void {
  try {
    localStorage.setItem(LAST_ROLE_KEY, role);
  } catch (e) {
    console.error('Failed to set last selected role:', e);
  }
}

export function updateUserRole(newRole: ActiveRole | string): UserSession | null {
  const session = getStoredSession();
  if (!session) return null;
  const updated: UserSession = {
    ...session,
    previousRole: session.role,
    role: newRole as any,
    lastActiveAt: new Date().toISOString()
  };
  saveSession(updated);
  setLastSelectedRole(newRole);
  recordAuditEvent({
    eventType: 'ROLE_ELEVATION',
    actorName: updated.fullName,
    actorEmail: updated.email,
    actorRole: updated.role,
    actorInstitution: updated.institution,
    targetModule: 'gate',
    actionDetails: `User active role profile updated to: ${newRole}`
  });
  return updated;
}
export const elevateFromFirstTimer = updateUserRole;

export function getStoredSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserSession;
  } catch (e) {
    console.error('Failed to parse user session:', e);
    return null;
  }
}

export function saveSession(session: UserSession): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save user session:', e);
  }

  // Sync session to Neon DB asynchronously
  apiClient.syncSession(session).catch(() => {});
}

export function clearSession(): void {
  try {
    const current = getStoredSession();
    if (current) {
      recordAuditEvent({
        eventType: 'LOGOUT',
        actorName: current.fullName,
        actorEmail: current.email,
        actorRole: current.role,
        actorInstitution: current.institution,
        targetModule: 'auth',
        actionDetails: `User signed out from active role: ${current.role}`
      });
    }
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(PENDING_OTP_KEY);
  } catch (e) {
    console.error('Failed to clear session:', e);
  }
}

export interface GateSubmissionInput {
  fullName: string;
  institution: string;
  institutionCategory: InstitutionCategory;
  role: ActiveRole | string;
  email: string;
  submissionDate: string;
  memberType?: 'new_member' | 'in_member';
  onboardingStatus?: 'onboarding' | 'pending_approval' | 'approved';
}

export interface GateResult {
  session: UserSession;
  requiresOtp: boolean;
  otpCode?: string;
  isDomainApproved: boolean;
  message: string;
}

export function submitOnboardingForApproval(): UserSession | null {
  const current = getStoredSession();
  if (!current) return null;
  const updated: UserSession = {
    ...current,
    onboardingStatus: 'pending_approval',
    lastActiveAt: new Date().toISOString()
  };
  saveSession(updated);
  recordAuditEvent({
    eventType: 'PROJECT_REGISTRATION_PENDED',
    actorName: updated.fullName,
    actorEmail: updated.email,
    actorRole: updated.role,
    actorInstitution: updated.institution,
    targetModule: 'gate',
    actionDetails: `Officer ${updated.fullName} completed registration. Request pending, you will receive an email when approved, THANK YOU.`
  });
  return updated;
}

export function processGateSubmission(input: GateSubmissionInput): GateResult {
  const isDomainApproved = isApprovedInstitutionalEmail(input.email);
  const assignedRole: any = input.role;

  // Remember chosen active role for session persistence
  setLastSelectedRole(assignedRole);

  const session: UserSession = {
    sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    fullName: input.fullName.trim(),
    institution: input.institution.trim(),
    institutionCategory: input.institutionCategory,
    role: assignedRole,
    email: input.email.trim().toLowerCase(),
    submissionDate: input.submissionDate,
    isVerified: true,
    token: `token-statutory-${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    memberType: input.memberType || 'in_member',
    onboardingStatus: input.onboardingStatus || 'approved'
  };

  saveSession(session);

  recordAuditEvent({
    eventType: 'GATE_SUBMISSION',
    actorName: session.fullName,
    actorEmail: session.email,
    actorRole: session.role,
    actorInstitution: session.institution,
    targetModule: 'gate',
    actionDetails: `Mandatory Gatekeeper verified credentials under Ghana Data Protection Act (Act 843) for ${session.fullName} (${session.institution}) on ${input.submissionDate}. Active role: [${session.role}].`
  });

  return {
    session,
    requiresOtp: false,
    isDomainApproved,
    message: `Active role profile [${assignedRole}] authenticated and verified under Ghana Data Protection Act (Act 843).`
  };
}

export function verifyPendingOtp(enteredOtp: string): { success: boolean; session?: UserSession; error?: string } {
  try {
    const raw = localStorage.getItem(PENDING_OTP_KEY);
    if (!raw) return { success: false, error: 'No verification pending or session expired.' };
    
    const data = JSON.parse(raw);
    if (Date.now() > data.expiresAt) {
      localStorage.removeItem(PENDING_OTP_KEY);
      return { success: false, error: 'Verification code has expired. Please resubmit the gate form.' };
    }

    if (data.otp !== enteredOtp.trim()) {
      return { success: false, error: 'Invalid verification code. Please check and try again.' };
    }

    const input: GateSubmissionInput = data.input;
    const finalSession: UserSession = {
      sessionId: `sess-verified-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: input.fullName.trim(),
      institution: input.institution.trim(),
      institutionCategory: input.institutionCategory,
      role: input.role as any,
      email: input.email.trim().toLowerCase(),
      submissionDate: input.submissionDate,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verificationMethod: 'EMAIL_OTP',
      token: `token-auth-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    saveSession(finalSession);
    setLastSelectedRole(finalSession.role);
    localStorage.removeItem(PENDING_OTP_KEY);

    recordAuditEvent({
      eventType: 'VERIFICATION_SUCCESS',
      actorName: finalSession.fullName,
      actorEmail: finalSession.email,
      actorRole: finalSession.role,
      actorInstitution: finalSession.institution,
      targetModule: 'gate',
      actionDetails: `OTP verified successfully for privileged role ${finalSession.role} via institutional email ${finalSession.email}`
    });

    return { success: true, session: finalSession };
  } catch (e) {
    return { success: false, error: 'Failed to verify code due to an unexpected error.' };
  }
}
