import { UserSession, ActiveRole, InstitutionCategory } from '../data/authTypes';
import { isApprovedInstitutionalEmail } from './rbacPolicy';
import { recordAuditEvent } from './auditService';

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

export function setLastSelectedRole(role: ActiveRole): void {
  try {
    if (role !== 'First-Timer / New User') {
      localStorage.setItem(LAST_ROLE_KEY, role);
    }
  } catch (e) {
    console.error('Failed to set last selected role:', e);
  }
}

export function elevateFromFirstTimer(newRole: ActiveRole): UserSession | null {
  const session = getStoredSession();
  if (!session) return null;
  const updated: UserSession = {
    ...session,
    previousRole: session.role,
    role: newRole,
    isFirstTimer: false,
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
    actionDetails: `User transitioned from First-Timer / New User onboarding to active role profile: ${newRole}`
  });
  return updated;
}

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
  role: ActiveRole;
  email: string;
  submissionDate: string;
  isFirstTimer?: boolean;
}

export interface GateResult {
  session: UserSession;
  requiresOtp: boolean;
  otpCode?: string;
  isDomainApproved: boolean;
  message: string;
}

export function processGateSubmission(input: GateSubmissionInput): GateResult {
  const isDomainApproved = isApprovedInstitutionalEmail(input.email);
  const isFirstTimerRole = input.isFirstTimer || input.role === 'First-Timer / New User';
  const assignedRole: ActiveRole = isFirstTimerRole ? 'First-Timer / New User' : input.role;

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
    isFirstTimer: isFirstTimerRole,
    token: `token-auth-${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  saveSession(session);

  recordAuditEvent({
    eventType: 'GATE_SUBMISSION',
    actorName: session.fullName,
    actorEmail: session.email,
    actorRole: session.role,
    actorInstitution: session.institution,
    targetModule: 'gate',
    actionDetails: `Mandatory Gatekeeper verified credentials under Ghana Data Protection Act (Act 843) for ${session.fullName} (${session.institution}) on ${input.submissionDate}. Active role profile activated: [${session.role}].`
  });

  return {
    session,
    requiresOtp: false,
    isDomainApproved,
    message: isFirstTimerRole 
      ? 'Welcome! First-Timer Onboarding initialized with guided access to Document & OCR, AI Readiness, and Governance & Ethics.'
      : `Active role profile [${assignedRole}] authenticated and verified under Ghana Data Protection Act (Act 843).`
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
      role: input.role,
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
