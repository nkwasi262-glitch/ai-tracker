import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Mail, 
  Calendar, 
  User, 
  AlertTriangle, 
  ArrowRight, 
  Award, 
  Search, 
  CheckCircle2, 
  KeyRound,
  Database
} from 'lucide-react';
import { 
  ActiveRole, 
  InstitutionCategory, 
  STANDARD_INSTITUTIONS,
  UserSession 
} from '../data/authTypes';
import { 
  processGateSubmission, 
  GateResult,
  getLastSelectedRole 
} from '../services/authService';
import { apiClient } from '../services/apiClient';

interface EntryGateModalProps {
  onSuccess: (session: UserSession) => void;
}

interface RoleSecurityConfig {
  isRestricted: boolean;
  clearanceLevel: string;
  pin: string;
  authorizedAgency: string;
  badge: string;
  color: string;
  desc: string;
  specificPages: string;
}

export const ROLE_SECURITY_MAP: Record<ActiveRole, RoleSecurityConfig> = {
  'Super Admin': {
    isRestricted: true,
    clearanceLevel: 'Tier-1 Presidential & Security Directorate',
    pin: 'NITA-ADMIN-2026',
    authorizedAgency: 'NITA Cyber Security Command',
    badge: 'Tier-1 Security Oversight',
    color: '#ef4444',
    desc: 'Complete system oversight, audit trails, registry CRUD, and user configurations.',
    specificPages: 'All 12 Modules (Full Executive & System Administration)'
  },
  'Director General': {
    isRestricted: true,
    clearanceLevel: 'Executive Statutory Clearance',
    pin: 'DG-CLEARANCE',
    authorizedAgency: 'Director General Executive Office',
    badge: 'Executive Statutory Clearance',
    color: '#fbbf24',
    desc: 'Passes final statutory verdicts, directives, and approvals on recommended AI projects.',
    specificPages: 'DG Decision Queue, Dashboard, GIS, Finance, Reports, Audit, AI Assistant'
  },
  'Technical Director': {
    isRestricted: true,
    clearanceLevel: 'Technical Leadership Clearance',
    pin: 'TECH-DIR-2026',
    authorizedAgency: 'Technical Operations Directorate',
    badge: 'Clearance Leadership',
    color: '#6366f1',
    desc: 'Supervises national technical evaluations, ethical rubrics, and project dossier recommendations.',
    specificPages: 'Documents & OCR, DG Decision Queue, Registry, Governance, Readiness, Risk, Reports, Dashboard, GIS, Audit, Chat'
  },
  'Technical Clearance Team': {
    isRestricted: true,
    clearanceLevel: 'Statutory Inspector Clearance',
    pin: 'INSPECT-2026',
    authorizedAgency: 'AI Technical Clearance Inspection Taskforce',
    badge: 'Technical Inspector',
    color: '#10b981',
    desc: 'Evaluates architectural dossiers, OCR models, data pipelines, and ethics matrices.',
    specificPages: 'Documents & OCR, Governance & Ethics, AI Readiness, Registry, Risk, Reports, Dashboard, GIS, Audit, Chat'
  },
  'AI Manager': {
    isRestricted: true,
    clearanceLevel: 'Institutional Operations Lead',
    pin: 'AIMANAGER-2026',
    authorizedAgency: 'Registered MDAs / MMDAs / SOEs',
    badge: 'Institutional Lead',
    color: '#06b6d4',
    desc: 'Registers and manages institutional project portfolios, milestone tracking, and readiness surveys.',
    specificPages: 'Project Registry, Documents & OCR, Governance, AI Readiness, Risk, Reports, Dashboard, GIS, Chat'
  },
  'Finance Minister': {
    isRestricted: true,
    clearanceLevel: 'Sovereign Fiscal Authority',
    pin: 'MOF-FISCAL-2026',
    authorizedAgency: 'Ministry of Finance',
    badge: 'Fiscal Authority',
    color: '#f59e0b',
    desc: 'Accesses M&E dashboards, national AI budget caps, disbursements, and financial exports under Act 921.',
    specificPages: 'Financial Suite & Exports, Fiscal Dashboard, AI Assistant'
  },
  'Public User': {
    isRestricted: false,
    clearanceLevel: 'Open Citizen Transparency',
    pin: '',
    authorizedAgency: 'General Public',
    badge: 'Open Citizen Access',
    color: '#94a3b8',
    desc: 'General public overview of transparent AI initiatives, regional deployments, and GIS map.',
    specificPages: 'Transparent Dashboard, GIS Map, Regulatory Assistant'
  },
  'First-Timer / New User': {
    isRestricted: false,
    clearanceLevel: 'Guided Orientation Mode',
    pin: '',
    authorizedAgency: 'Orientation Track',
    badge: 'Guided Orientation',
    color: '#10b981',
    desc: 'Initial onboarding orientation for new institutional officers submitting project documents.',
    specificPages: 'Documents & OCR, AI Readiness, Governance & Ethics'
  }
};

export const EntryGateModal: React.FC<EntryGateModalProps> = ({ onSuccess }) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [selectedInstId, setSelectedInstId] = useState('inst-1'); // Default NITA
  const [customInstitution, setCustomInstitution] = useState('');
  const [instCategory, setInstCategory] = useState<InstitutionCategory>('MDA');
  const [instSearch, setInstSearch] = useState('');
  const [showInstDropdown, setShowInstDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [consentGiven, setConsentGiven] = useState(false);

  // Selected Active Role Profile (User Type)
  const [selectedRole, setSelectedRole] = useState<ActiveRole>(() => {
    const last = getLastSelectedRole();
    if (last) return last;
    return 'Super Admin';
  });

  // Statutory PIN security state
  const [enteredPin, setEnteredPin] = useState('');
  const [pinVerified, setPinVerified] = useState(false);

  // Postgres DB State: Auto-detection of existing user type
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [dbUserFound, setDbUserFound] = useState<UserSession | null>(null);

  // Feedback & submission state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cleanEmail = email.trim().toLowerCase();
  const isGovGhEmail = cleanEmail.endsWith('.gov.gh');

  // Look up existing user type in Neon PostgreSQL whenever email changes
  useEffect(() => {
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.endsWith('.gov.gh')) {
      setDbUserFound(null);
      return;
    }

    let active = true;
    const timer = setTimeout(async () => {
      setIsCheckingDb(true);
      try {
        const found = await apiClient.fetchUserByEmail(cleanEmail);
        if (active && found) {
          setDbUserFound(found);
          if (found.fullName && !fullName) {
            setFullName(found.fullName);
          }
          if (found.role) {
            setSelectedRole(found.role);
            setPinVerified(true);
          }
          if (found.institution) {
            const matched = STANDARD_INSTITUTIONS.find(i => i.name.toLowerCase() === found.institution.toLowerCase());
            if (matched) {
              setSelectedInstId(matched.id);
              setInstCategory(matched.category);
            } else {
              setSelectedInstId('other');
              setCustomInstitution(found.institution);
              setInstCategory(found.institutionCategory || 'MDA');
            }
          }
        } else if (active) {
          setDbUserFound(null);
        }
      } catch (err) {
        if (active) setDbUserFound(null);
      } finally {
        if (active) setIsCheckingDb(false);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [cleanEmail]);

  // Selected institution name calculation
  const getSelectedInstName = () => {
    if (selectedInstId === 'other') {
      return customInstitution || 'Other Institution';
    }
    const found = STANDARD_INSTITUTIONS.find(i => i.id === selectedInstId);
    return found ? found.name : 'National Information Technology Agency (NITA)';
  };

  const filteredInstitutions = STANDARD_INSTITUTIONS.filter(inst =>
    inst.name.toLowerCase().includes(instSearch.toLowerCase()) ||
    inst.code.toLowerCase().includes(instSearch.toLowerCase())
  );

  const handleSelectInstitution = (inst: typeof STANDARD_INSTITUTIONS[0] | 'other') => {
    if (inst === 'other') {
      setSelectedInstId('other');
      setInstCategory('Other');
    } else {
      setSelectedInstId(inst.id);
      setInstCategory(inst.category);
    }
    setShowInstDropdown(false);
  };

  const currentRoleConfig = ROLE_SECURITY_MAP[selectedRole];

  // Submit Handler: Saves user type to PostgreSQL DB and routes STRAIGHT to Main Page!
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Full name validation
    if (!fullName.trim()) {
      setErrorMessage('Full name is mandatory to initialize statutory identity.');
      return;
    }

    // 2. Managing institution validation
    if (selectedInstId === 'other' && !customInstitution.trim()) {
      setErrorMessage('Please specify your managing institution name.');
      return;
    }

    // 3. Email address validation (.gov.gh)
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.endsWith('.gov.gh')) {
      setErrorMessage('Acceptable email address must end with .gov.gh (e.g. officer@nita.gov.gh, minister@mof.gov.gh).');
      return;
    }

    // 4. Role PIN check (if restricted and not pre-verified from Postgres)
    if (currentRoleConfig.isRestricted && currentRoleConfig.pin && !pinVerified) {
      if (enteredPin.trim().toUpperCase() !== currentRoleConfig.pin.toUpperCase()) {
        setErrorMessage(`Invalid statutory access key / password for ${selectedRole}. Please check clearance key.`);
        return;
      }
    }

    // 5. Date validation
    if (!date) {
      setErrorMessage('Access date is mandatory.');
      return;
    }

    // 6. Act 843 statutory consent
    if (!consentGiven) {
      setErrorMessage('You must confirm statutory compliance under the Ghana Data Protection Act, 2012 (Act 843).');
      return;
    }

    setIsSubmitting(true);

    const institutionName = selectedInstId === 'other' ? customInstitution.trim() : getSelectedInstName();

    try {
      // Process submission: saves to local cache & syncs directly to Neon PostgreSQL DB
      const result: GateResult = processGateSubmission({
        fullName: fullName.trim(),
        institution: institutionName,
        institutionCategory: instCategory,
        role: selectedRole,
        email: cleanEmail,
        submissionDate: date,
        isFirstTimer: selectedRole === 'First-Timer / New User',
        memberType: 'in_member',
        onboardingStatus: 'approved'
      });

      // Synchronously push to Neon PostgreSQL user_sessions table
      await apiClient.syncSession(result.session);

      setIsSubmitting(false);

      // Immediately send straight to the main page!
      onSuccess(result.session);
    } catch (err: any) {
      console.error('[Login] Error saving session to database:', err);
      // Fallback: still authorize user even if network hiccup occurs
      setIsSubmitting(false);
      const fallbackResult = processGateSubmission({
        fullName: fullName.trim(),
        institution: institutionName,
        institutionCategory: instCategory,
        role: selectedRole,
        email: cleanEmail,
        submissionDate: date,
        isFirstTimer: selectedRole === 'First-Timer / New User',
        memberType: 'in_member',
        onboardingStatus: 'approved'
      });
      onSuccess(fallbackResult.session);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(5, 8, 15, 0.94)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '36px 16px 60px 16px',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Container Box */}
      <div style={{
        maxWidth: '760px',
        width: '100%',
        margin: '0 auto',
        background: 'linear-gradient(170deg, #111827 0%, #0d121f 100%)',
        border: '1px solid rgba(16, 185, 129, 0.32)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.12)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Top National Ribbon */}
        <div style={{
          height: '5px',
          background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '24px 32px 18px 32px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(251, 191, 36, 0.1))',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.6rem'
          }}>
            🇬🇭
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ghana-emerald)',
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '2px'
            }}>
              <ShieldCheck size={13} />
              <span>Republic of Ghana • NITA Statutory Security Gate</span>
            </div>
            <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              National AI Projects Registry & Monitoring System
            </h1>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Authenticate with your institutional identity. User type and credentials are saved to PostgreSQL DB.
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div style={{
            margin: '16px 32px 0 32px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#fca5a5',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Postgres Saved Profile Detected Notice */}
        {dbUserFound && (
          <div style={{
            margin: '16px 32px 0 32px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: '#a7f3d0',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Database size={16} className="text-emerald-400" />
              <span>
                <strong>Postgres DB Account Detected:</strong> Saved user type <strong>[{dbUserFound.role}]</strong> for {dbUserFound.fullName}.
              </span>
            </div>
            <span style={{
              fontSize: '0.68rem',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.25)',
              fontWeight: 800,
              color: '#fff'
            }}>
              SAVED IN POSTGRES
            </span>
          </div>
        )}

        {/* Unified Login & Postgres Authentication Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 32px 32px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
            
            {/* 1. FULL NAME */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                marginBottom: '6px'
              }}>
                <User size={14} className="text-emerald-400" />
                <span>FULL NAME *</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Dr. Kwaku Mensah or Hon. Abena Ofori"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* 2. MANAGING INSTITUTION */}
            <div style={{ gridColumn: 'span 2', position: 'relative' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                marginBottom: '6px'
              }}>
                <Building2 size={14} className="text-emerald-400" />
                <span>MANAGING INSTITUTION *</span>
              </label>

              <div
                onClick={() => setShowInstDropdown(!showInstDropdown)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontWeight: 500 }}>{getSelectedInstName()}</span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--ghana-emerald)',
                  fontWeight: 700
                }}>
                  {instCategory}
                </span>
              </div>

              {/* Dropdown Menu */}
              {showInstDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  borderRadius: '10px',
                  background: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)',
                  zIndex: 100,
                  maxHeight: '220px',
                  overflowY: 'auto',
                  padding: '8px'
                }}>
                  <div style={{ padding: '4px 6px 8px 6px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <Search size={14} style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Search MDA, MMDA, or SOE..."
                      value={instSearch}
                      onChange={(e) => setInstSearch(e.target.value)}
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.82rem',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div style={{ marginTop: '6px' }}>
                    {filteredInstitutions.map((inst) => (
                      <div
                        key={inst.id}
                        onClick={() => handleSelectInstitution(inst)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '0.82rem',
                          color: selectedInstId === inst.id ? '#10b981' : '#e2e8f0',
                          background: selectedInstId === inst.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{inst.name}</div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Code: {inst.code}</div>
                        </div>
                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                          {inst.category}
                        </span>
                      </div>
                    ))}

                    {/* "Other" Option */}
                    <div
                      onClick={() => handleSelectInstitution('other')}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.82rem',
                        color: selectedInstId === 'other' ? '#10b981' : '#e2e8f0',
                        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                        marginTop: '4px'
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Other Institution / Organization (Custom)</span>
                      <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                        Other
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Institution Input if "Other" */}
              {selectedInstId === 'other' && (
                <div style={{ marginTop: '10px' }}>
                  <input
                    type="text"
                    required
                    value={customInstitution}
                    onChange={(e) => setCustomInstitution(e.target.value)}
                    placeholder="Enter custom institution / entity name"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#fff',
                      fontSize: '0.85rem',
                      outline: 'none'
                    }}
                  />
                </div>
              )}
            </div>

            {/* 3. EMAIL ADDRESS (.gov.gh only) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                marginBottom: '6px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} className="text-emerald-400" />
                  <span>EMAIL ADDRESS (.gov.gh only) *</span>
                </span>
                {isCheckingDb && (
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Database size={12} /> Checking Postgres DB...
                  </span>
                )}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. officer@nita.gov.gh, minister@mof.gov.gh"
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: cleanEmail === '' 
                    ? '1px solid rgba(255, 255, 255, 0.12)' 
                    : isGovGhEmail 
                      ? '1px solid var(--ghana-emerald)' 
                      : '1px solid rgba(239, 68, 68, 0.6)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* 4. ACTIVE ROLE PROFILE (USER TYPE) */}
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                marginBottom: '8px'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Award size={14} className="text-amber-400" />
                  <span>ACTIVE ROLE PROFILE (USER TYPE) *</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Saved & preserved permanently in Postgres DB
                </span>
              </label>

              {/* Role Selection Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: '10px',
                marginBottom: '12px'
              }}>
                {(Object.keys(ROLE_SECURITY_MAP) as ActiveRole[]).map((role) => {
                  const cfg = ROLE_SECURITY_MAP[role];
                  const isSelected = selectedRole === role;
                  return (
                    <div
                      key={role}
                      onClick={() => {
                        setSelectedRole(role);
                        setPinVerified(false);
                      }}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: isSelected 
                          ? `1px solid ${cfg.color}` 
                          : '1px solid rgba(255, 255, 255, 0.08)',
                        background: isSelected 
                          ? `linear-gradient(135deg, ${cfg.color}15, rgba(255,255,255,0.02))` 
                          : 'rgba(255, 255, 255, 0.02)',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: isSelected ? '#fff' : '#cbd5e1' }}>
                          {role}
                        </span>
                        {isSelected && <CheckCircle2 size={14} style={{ color: cfg.color }} />}
                      </div>
                      <span style={{
                        fontSize: '0.64rem',
                        fontWeight: 700,
                        color: cfg.color,
                        letterSpacing: '0.04em'
                      }}>
                        {cfg.badge}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Active Role Functions & Specific Pages Summary Card */}
              <div style={{
                padding: '14px 18px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${currentRoleConfig.color}40`,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '4px',
                      background: `${currentRoleConfig.color}25`,
                      color: currentRoleConfig.color,
                      fontSize: '0.72rem',
                      fontWeight: 800
                    }}>
                      {selectedRole}
                    </span>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                      {currentRoleConfig.desc}
                    </span>
                  </div>
                </div>

                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  fontSize: '0.74rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <strong style={{ color: '#fff', whiteSpace: 'nowrap' }}>Specific Pages:</strong>
                  <span style={{ color: 'var(--ghana-gold)', fontWeight: 600 }}>
                    {currentRoleConfig.specificPages}
                  </span>
                </div>

                {/* Statutory Access Key / PIN Input if restricted */}
                {currentRoleConfig.isRestricted && currentRoleConfig.pin && !dbUserFound && (
                  <div style={{ marginTop: '6px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      color: '#fde68a',
                      marginBottom: '4px'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <KeyRound size={12} />
                        <span>STATUTORY ACCESS KEY / CLEARANCE KEY *</span>
                      </span>
                      <span
                        onClick={() => setEnteredPin(currentRoleConfig.pin)}
                        style={{
                          fontSize: '0.66rem',
                          color: 'var(--ghana-emerald)',
                          cursor: 'pointer',
                          textDecoration: 'underline'
                        }}
                      >
                        Use Key: {currentRoleConfig.pin}
                      </span>
                    </label>
                    <input
                      type="text"
                      value={enteredPin}
                      onChange={(e) => setEnteredPin(e.target.value)}
                      placeholder={`Enter statutory access key for ${selectedRole}`}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: enteredPin.toUpperCase() === currentRoleConfig.pin.toUpperCase()
                          ? '1px solid var(--ghana-emerald)'
                          : '1px solid rgba(251, 191, 36, 0.4)',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontFamily: 'monospace',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 5. ACCESS DATE */}
            <div>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                letterSpacing: '0.04em',
                marginBottom: '6px'
              }}>
                <Calendar size={14} className="text-emerald-400" />
                <span>ACCESS DATE *</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* 6. STATUTORY CONSENT UNDER ACT 843 */}
            <div style={{
              gridColumn: 'span 2',
              marginTop: '4px',
              padding: '14px 16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <input
                  type="checkbox"
                  required
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    marginTop: '2px',
                    accentColor: 'var(--ghana-emerald)',
                    cursor: 'pointer'
                  }}
                />
                <span>
                  <strong>GHANA DATA PROTECTION ACT, 2012 (ACT 843) COMPLIANCE:</strong> I certify that all institutional details and project documents submitted through this terminal are authentic and authorized by my managing MDA/MMDA/SOE.
                </span>
              </label>
            </div>

          </div>

          {/* Single Direct Submit Button — Sends User STRAIGHT to Main Page! */}
          <div style={{ marginTop: '24px' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '14px 20px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                color: '#fff',
                fontSize: '0.95rem',
                fontWeight: 800,
                border: 'none',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.35)',
                transition: 'all 0.2s ease',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              <span>{isSubmitting ? 'Syncing with Postgres DB...' : `Sign In & Proceed Straight to Main Page (${selectedRole})`}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
