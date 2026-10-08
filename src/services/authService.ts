import { UserSession, ActiveRole, InstitutionCategory } from '../data/authTypes';
import { isApprovedInstitutionalEmail } from './rbacPolicy';
import { recordAuditEvent } from './auditService';
import { findUserByEmail } from './userService';

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
  fullName?: string;
  institution?: string;
  institutionCategory?: InstitutionCategory;
  role?: ActiveRole;
  email: string;
  submissionDate: string;
}

export interface GateResult {
  session: UserSession;
  requiresOtp: boolean;
  otpCode?: string;
  isDomainApproved: boolean;
  isSuspended?: boolean;
  message: string;
  detectedRole?: ActiveRole;
}

export function processGateSubmission(input: GateSubmissionInput): GateResult {
  const cleanEmail = input.email.trim().toLowerCase();
  const registeredUser = findUserByEmail(cleanEmail);

  // 1. Check if user is suspended by admin
  if (registeredUser && registeredUser.status === 'Suspended') {
    recordAuditEvent({
      eventType: 'ACCESS_DENIED',
      actorName: registeredUser.fullName,
      actorEmail: registeredUser.email,
      actorRole: registeredUser.role,
      actorInstitution: registeredUser.institution,
      targetModule: 'gate',
      actionDetails: `Blocked gate login attempt on suspended account (${registeredUser.email}).`
    });

    const suspendedSession: UserSession = {
      sessionId: `sess-suspended-${Date.now()}`,
      fullName: registeredUser.fullName,
      institution: registeredUser.institution,
      institutionCategory: registeredUser.institutionCategory,
      role: 'Public User',
      email: cleanEmail,
      submissionDate: input.submissionDate,
      isVerified: false,
      token: '',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString()
    };

    return {
      session: suspendedSession,
      requiresOtp: false,
      isDomainApproved: false,
      isSuspended: true,
      detectedRole: registeredUser.role,
      message: 'Access Denied: This account has been suspended by the System Administrator under Act 843 governance.'
    };
  }

  // 2. Auto-detect role from registered account or email domain
  let detectedRole: ActiveRole = 'Public User';
  let detectedName = input.fullName?.trim() || 'Citizen User';
  let detectedInstitution = input.institution?.trim() || 'Public Citizen';
  let detectedCategory: InstitutionCategory = input.institutionCategory || 'Other';

  if (registeredUser) {
    detectedRole = registeredUser.role;
    detectedName = registeredUser.fullName;
    detectedInstitution = registeredUser.institution;
    detectedCategory = registeredUser.institutionCategory;
  } else {
    // Unregistered email: check institutional domain
    const isDomainApproved = isApprovedInstitutionalEmail(cleanEmail);
    if (isDomainApproved) {
      detectedRole = 'AI Manager'; // newly registered institutional profile
      detectedInstitution = input.institution?.trim() || 'Government Agency';
      detectedCategory = input.institutionCategory || 'MDA';
    } else {
      detectedRole = 'Public User';
    }
  }

  const isPrivileged = detectedRole !== 'Public User';
  const isDomainApproved = isApprovedInstitutionalEmail(cleanEmail);

  // If Public User, grant immediate access
  if (!isPrivileged) {
    const session: UserSession = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: detectedName,
      institution: detectedInstitution,
      institutionCategory: detectedCategory,
      role: 'Public User',
      email: cleanEmail,
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
      actionDetails: `Public User entry gate completed for ${session.fullName} (${session.institution}). Role auto-detected: Public User.`
    });
    return {
      session,
      requiresOtp: false,
      isDomainApproved: true,
      detectedRole: 'Public User',
      message: 'Access granted immediately as Public User.'
    };
  }

  // Privileged role flow:
  // If email domain is NOT in approved gov list, fallback to Public User
  if (!isDomainApproved) {
    const session: UserSession = {
      sessionId: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      fullName: detectedName,
      institution: detectedInstitution,
      institutionCategory: detectedCategory,
      role: 'Public User', // Downgraded
      email: cleanEmail,
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
      actionDetails: `Non-governmental email (${cleanEmail}) attempted privileged role (${detectedRole}). Downgraded to Public User access.`
    });
    return {
      session,
      requiresOtp: false,
      isDomainApproved: false,
      detectedRole: 'Public User',
      message: `Domain not recognized as approved government authority (.gov.gh). Granted Public User access.`
    };
  }

  // Generates 6-digit OTP for simulation
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  localStorage.setItem(PENDING_OTP_KEY, JSON.stringify({
    otp: generatedOtp,
    input: {
      fullName: detectedName,
      institution: detectedInstitution,
      institutionCategory: detectedCategory,
      role: detectedRole,
      email: cleanEmail,
      submissionDate: input.submissionDate
    },
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  }));

  // Initial unverified session (acts as Public User until verified)
  const tempSession: UserSession = {
    sessionId: `sess-pending-${Date.now()}`,
    fullName: detectedName,
    institution: detectedInstitution,
    institutionCategory: detectedCategory,
    role: 'Public User',
    email: cleanEmail,
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
    detectedRole,
    message: `Verification code dispatched to institutional email ${cleanEmail} for role: ${detectedRole}.`
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
      fullName: (input.fullName || 'Institutional Officer').trim(),
      institution: (input.institution || 'National Agency').trim(),
      institutionCategory: input.institutionCategory || 'MDA',
      role: input.role || 'AI Manager',
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
