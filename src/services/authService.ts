import { UserSession, ActiveRole, InstitutionCategory } from '../data/authTypes';
import { isApprovedInstitutionalEmail } from './rbacPolicy';
import { recordAuditEvent } from './auditService';

const SESSION_KEY = 'gnaprms_user_session_v1';
const PENDING_OTP_KEY = 'gnaprms_pending_otp_v1';

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
}

export interface GateResult {
  session: UserSession;
  requiresOtp: boolean;
  otpCode?: string;
  isDomainApproved: boolean;
  message: string;
}

export function processGateSubmission(input: GateSubmissionInput): GateResult {
  const isPrivileged = input.role !== 'Public User';
  const isDomainApproved = isApprovedInstitutionalEmail(input.email);

  // If Public User, grant immediate access
  if (!isPrivileged) {
    const session: UserSession = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: input.fullName.trim(),
      institution: input.institution.trim(),
      institutionCategory: input.institutionCategory,
      role: 'Public User',
      email: input.email.trim().toLowerCase(),
      submissionDate: input.submissionDate,
      isVerified: true,
      token: `token-pub-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    saveSession(session);
    recordAuditEvent({
      eventType: 'GATE_SUBMISSION',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: 'Public User',
      actorInstitution: session.institution,
      targetModule: 'gate',
      actionDetails: `Public User entry gate completed for ${session.fullName} (${session.institution})`
    });
    return {
      session,
      requiresOtp: false,
      isDomainApproved: true,
      message: 'Access granted immediately as Public User.'
    };
  }

  // Privileged role flow:
  // If email domain is NOT in approved gov list, fallback to Public User
  if (!isDomainApproved) {
    const session: UserSession = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: input.fullName.trim(),
      institution: input.institution.trim(),
      institutionCategory: input.institutionCategory,
      role: 'Public User', // Downgraded
      email: input.email.trim().toLowerCase(),
      submissionDate: input.submissionDate,
      isVerified: false,
      token: `token-unverified-${Date.now()}`,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };
    saveSession(session);
    recordAuditEvent({
      eventType: 'VERIFICATION_FAILURE',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: 'Public User',
      actorInstitution: session.institution,
      targetModule: 'gate',
      actionDetails: `Non-governmental email (${input.email}) attempted privileged role (${input.role}). Downgraded to Public User access.`
    });
    return {
      session,
      requiresOtp: false,
      isDomainApproved: false,
      message: `Domain not recognized as approved government authority (.gov.gh). Granted Public User access.`
    };
  }

  // Generates 6-digit OTP for simulation
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem(PENDING_OTP_KEY, JSON.stringify({
    otp: generatedOtp,
    input,
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  }));

  // Initial unverified session (acts as Public User until verified)
  const tempSession: UserSession = {
    sessionId: `sess-pending-${Date.now()}`,
    fullName: input.fullName.trim(),
    institution: input.institution.trim(),
    institutionCategory: input.institutionCategory,
    role: 'Public User',
    email: input.email.trim().toLowerCase(),
    submissionDate: input.submissionDate,
    isVerified: false,
    token: `token-temp-${Date.now()}`,
    createdAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString()
  };

  return {
    session: tempSession,
    requiresOtp: true,
    otpCode: generatedOtp,
    isDomainApproved: true,
    message: `Verification code dispatched to institutional email ${input.email}.`
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
