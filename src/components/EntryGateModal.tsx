import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Mail, 
  Calendar, 
  User, 
  AlertTriangle, 
  ArrowRight, 
  Award, 
  FileCheck2, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  UserCheck, 
  DollarSign, 
  Globe,
  Lock,
  Unlock,
  KeyRound,
  UserPlus,
  Users
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

interface EntryGateModalProps {
  onSuccess: (session: UserSession) => void;
}

interface RoleSecurityConfig {
  isRestricted: boolean;
  clearanceLevel: string;
  pin: string;
  authorizedAgency: string;
}

export const ROLE_SECURITY_MAP: Record<ActiveRole, RoleSecurityConfig> = {
  'Super Admin': {
    isRestricted: true,
    clearanceLevel: 'Tier-1 Presidential & Security Directorate',
    pin: 'NITA-ADMIN-2026',
    authorizedAgency: 'NITA Cyber Security Command'
  },
  'Director General': {
    isRestricted: true,
    clearanceLevel: 'Executive Statutory Clearance',
    pin: 'DG-CLEARANCE',
    authorizedAgency: 'Director General Executive Office'
  },
  'Technical Director': {
    isRestricted: true,
    clearanceLevel: 'Technical Leadership Clearance',
    pin: 'TECH-DIR-2026',
    authorizedAgency: 'Technical Operations Directorate'
  },
  'Technical Clearance Team': {
    isRestricted: true,
    clearanceLevel: 'Statutory Inspector Clearance',
    pin: 'INSPECT-2026',
    authorizedAgency: 'AI Technical Clearance Inspection Taskforce'
  },
  'Finance Minister': {
    isRestricted: true,
    clearanceLevel: 'Sovereign Fiscal Authority',
    pin: 'MOF-FISCAL-2026',
    authorizedAgency: 'Ministry of Finance'
  },
  'AI Manager': {
    isRestricted: true,
    clearanceLevel: 'Institutional Operations Lead',
    pin: 'AIMANAGER-2026',
    authorizedAgency: 'Registered MDAs / MMDAs / SOEs'
  },
  'Public User': {
    isRestricted: true,
    clearanceLevel: 'Open Citizen Transparency',
    pin: 'PUBLIC-2026',
    authorizedAgency: 'General Public'
  },
  'First-Timer / New User': {
    isRestricted: false,
    clearanceLevel: 'Guided Orientation Mode',
    pin: '',
    authorizedAgency: 'Orientation Track'
  }
};

type GateStep = 'mandatory_form' | 'member_choice' | 'in_member_role_popup';

export const EntryGateModal: React.FC<EntryGateModalProps> = ({ onSuccess }) => {
  // Step in gateway flow:
  // 1. 'mandatory_form' (5 Mandatory spaces)
  // 2. 'member_choice' (ONLY TWO OPTIONS: "New Member" vs "In / Old Member")
  // 3. 'in_member_role_popup' (Active Role Profile popup with unique password required)
  const [currentStep, setCurrentStep] = useState<GateStep>('mandatory_form');

  // Form fields (Mandatory Gatekeeper Spaces)
  // 1. FULL NAME
  const [fullName, setFullName] = useState('');
  
  // 2. MANAGING INSTITUTION
  const [selectedInstId, setSelectedInstId] = useState('inst-1'); // Default NITA
  const [customInstitution, setCustomInstitution] = useState('');
  const [instCategory, setInstCategory] = useState<InstitutionCategory>('MDA');
  const [instSearch, setInstSearch] = useState('');
  const [showInstDropdown, setShowInstDropdown] = useState(false);

  // 3. EMAIL ADDRESS
  const [email, setEmail] = useState('');

  // 4. DATE
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  // 5. GHANA DATA PROTECTION ACT
  const [consentGiven, setConsentGiven] = useState(false);

  // Track unlocked roles for in-member access
  const [unlockedRoles, setUnlockedRoles] = useState<Record<string, boolean>>({
    'Super Admin': false,
    'Director General': false,
    'Technical Director': false,
    'Technical Clearance Team': false,
    'Finance Minister': false,
    'AI Manager': false,
    'Public User': false
  });

  const [selectedRole, setSelectedRole] = useState<ActiveRole>(() => {
    const last = getLastSelectedRole();
    if (last && last !== 'First-Timer / New User') {
      return last;
    }
    return 'Super Admin';
  });

  // PIN clearance challenge state
  const [pinChallengeRole, setPinChallengeRole] = useState<ActiveRole | null>(null);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Feedback & submission state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roles available for In / Old Member
  const inMemberRolesList: { 
    role: ActiveRole; 
    label: string; 
    badge: string; 
    color: string; 
    desc: string;
    modules: string;
    icon: React.ReactNode;
  }[] = [
    { 
      role: 'Super Admin', 
      label: 'Super Admin', 
      badge: 'Tier-1 Security Oversight', 
      color: '#ef4444', 
      desc: 'Complete system oversight, audit trails, registry CRUD, and user configurations.',
      modules: 'All 12 Modules Unlocked (Full Oversight)',
      icon: <ShieldAlert size={16} className="text-red-400" />
    },
    { 
      role: 'Director General', 
      label: 'Director General', 
      badge: 'Executive Statutory Clearance', 
      color: '#fbbf24', 
      desc: 'Passes final statutory verdicts, directives, or rejections on recommended AI projects.',
      modules: 'DG Decision Queue, Dashboard, GIS, Finance, Reports, Audit',
      icon: <Award size={16} className="text-amber-400" />
    },
    { 
      role: 'Technical Director', 
      label: 'Technical Director', 
      badge: 'Clearance Leadership', 
      color: '#6366f1', 
      desc: 'Supervises national technical evaluations, ethical rubrics, and project dossier recommendations.',
      modules: 'Technical Reviews, Architecture Dossiers, Escalations, Dashboard, Registry, GIS',
      icon: <Award size={16} className="text-indigo-400" />
    },
    { 
      role: 'Technical Clearance Team', 
      label: 'Technical Clearance Team', 
      badge: 'Technical Inspector', 
      color: '#10b981', 
      desc: 'Evaluates architectural dossiers, OCR models, data pipelines, and ethics matrices.',
      modules: 'Document Manager, Project Registry, Governance Rubrics, Readiness, Audit',
      icon: <ShieldCheck size={16} className="text-emerald-400" />
    },
    { 
      role: 'AI Manager', 
      label: 'AI Manager', 
      badge: 'Institutional Lead', 
      color: '#06b6d4', 
      desc: 'Registers and manages institutional project portfolios, milestone tracking, and readiness surveys.',
      modules: 'Project Registry, AI Readiness, Governance Rubric, Documents, Reports',
      icon: <UserCheck size={16} className="text-cyan-400" />
    },
    { 
      role: 'Finance Minister', 
      label: 'Finance Minister', 
      badge: 'Fiscal Authority', 
      color: '#f59e0b', 
      desc: 'Accesses M&E dashboards, national AI budget caps, disbursements, and financial exports.',
      modules: 'Financial Suite & Exports, Fiscal Dashboard, AI Assistant',
      icon: <DollarSign size={16} className="text-amber-400" />
    },
    { 
      role: 'Public User', 
      label: 'Public User', 
      badge: 'Open Citizen Access', 
      color: '#94a3b8', 
      desc: 'General public overview of transparent AI initiatives, regional deployments, and GIS map.',
      modules: 'Transparent Dashboard, GIS Map, Regulatory Assistant',
      icon: <Globe size={16} className="text-slate-400" />
    }
  ];

  // Selected institution name calculation
  const getSelectedInstName = () => {
    if (selectedInstId === 'other') {
      return customInstitution || 'Other Institution';
    }
    const found = STANDARD_INSTITUTIONS.find(i => i.id === selectedInstId);
    return found ? found.name : 'National Information Technology Agency (NITA)';
  };

  // Filtered institutions based on search query
  const filteredInstitutions = STANDARD_INSTITUTIONS.filter(inst =>
    inst.name.toLowerCase().includes(instSearch.toLowerCase()) ||
    inst.code.toLowerCase().includes(instSearch.toLowerCase())
  );

  // Email domain check preview: acceptable email must end with .gov.gh
  const cleanEmail = email.trim().toLowerCase();
  const emailDomain = cleanEmail.includes('@') ? cleanEmail.split('@')[1] : '';
  const isGovGhEmail = cleanEmail.endsWith('.gov.gh');

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

  // Gatekeeper Form Submission Handler (Validates the 5 Mandatory Spaces)
  const handleGatekeeperSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. FULL NAME validation
    if (!fullName.trim()) {
      setErrorMessage('FULL NAME is mandatory to initialize statutory identity.');
      return;
    }

    // 2. MANAGING INSTITUTION validation
    if (selectedInstId === 'other' && !customInstitution.trim()) {
      setErrorMessage('Please specify your MANAGING INSTITUTION name.');
      return;
    }

    // 3. EMAIL ADDRESS validation (Must end with .gov.gh)
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMessage('A valid EMAIL ADDRESS is mandatory for statutory verification.');
      return;
    }

    if (!cleanEmail.endsWith('.gov.gh')) {
      setErrorMessage('Acceptable email address must end with .gov.gh (e.g. officer@nita.gov.gh, minister@mof.gov.gh).');
      return;
    }

    // 4. DATE validation
    if (!date) {
      setErrorMessage('Access DATE is mandatory.');
      return;
    }

    // 5. GHANA DATA PROTECTION ACT validation
    if (!consentGiven) {
      setErrorMessage('You must confirm statutory compliance under the GHANA DATA PROTECTION ACT, 2012 (Act 843).');
      return;
    }

    // All 5 spaces validated: Proceed directly to the TWO OPTIONS screen!
    setCurrentStep('member_choice');
  };

  // Option 1: Handle New Member Selection
  const handleSelectNewMember = () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const institutionName = selectedInstId === 'other' ? customInstitution.trim() : getSelectedInstName();

    const result: GateResult = processGateSubmission({
      fullName: fullName.trim(),
      institution: institutionName,
      institutionCategory: instCategory,
      role: 'First-Timer / New User',
      email: cleanEmail,
      submissionDate: date,
      isFirstTimer: true,
      memberType: 'new_member',
      onboardingStatus: 'onboarding'
    });

    setIsSubmitting(false);
    onSuccess(result.session);
  };

  // Option 2: Transition to In / Old Member Role Profile Popup
  const handleOpenInMemberPopup = () => {
    setErrorMessage(null);
    setCurrentStep('in_member_role_popup');
    // Pre-prompt challenge for the default selected role if not unlocked
    const initialRole = selectedRole;
    if (!unlockedRoles[initialRole]) {
      setPinChallengeRole(initialRole);
      setEnteredPin('');
      setPinError(null);
    }
  };

  // Handle clicking a role in the Active Role Profile popup
  const handleSelectRole = (rRole: ActiveRole) => {
    setSelectedRole(rRole);
    if (unlockedRoles[rRole]) {
      setPinChallengeRole(null);
      setPinError(null);
    } else {
      setPinChallengeRole(rRole);
      setEnteredPin('');
      setPinError(null);
    }
  };

  // Handle PIN verification challenge for in-member roles
  const handleVerifyPin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinChallengeRole) return;
    const config = ROLE_SECURITY_MAP[pinChallengeRole];
    if (enteredPin.trim().toUpperCase() === config.pin.toUpperCase()) {
      setUnlockedRoles(prev => ({ ...prev, [pinChallengeRole]: true }));
      setSelectedRole(pinChallengeRole);
      setPinChallengeRole(null);
      setPinError(null);
    } else {
      setPinError(`Access Denied: Invalid statutory access key / password for ${pinChallengeRole}.`);
    }
  };

  // Confirm Active Role Profile and Enter System
  const handleConfirmInMemberProfile = () => {
    if (!unlockedRoles[selectedRole]) {
      setErrorMessage(`Access Denied: ${selectedRole} requires authentication with its unique statutory access password.`);
      setPinChallengeRole(selectedRole);
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const institutionName = selectedInstId === 'other' ? customInstitution.trim() : getSelectedInstName();

    const result: GateResult = processGateSubmission({
      fullName: fullName.trim(),
      institution: institutionName,
      institutionCategory: instCategory,
      role: selectedRole,
      email: cleanEmail,
      submissionDate: date,
      isFirstTimer: false,
      memberType: 'in_member',
      onboardingStatus: 'approved'
    });

    setIsSubmitting(false);
    onSuccess(result.session);
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
        maxWidth: currentStep === 'member_choice' ? '820px' : '720px',
        width: '100%',
        margin: '0 auto',
        background: 'linear-gradient(170deg, #111827 0%, #0d121f 100%)',
        border: '1px solid rgba(16, 185, 129, 0.28)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(16, 185, 129, 0.12)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'all 0.3s ease'
      }}>
        {/* Top National Ribbon */}
        <div style={{
          height: '5px',
          background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '28px 32px 20px 32px',
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
            <h1 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              National AI Projects Registry & Monitoring System
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              {currentStep === 'mandatory_form' && 'Mandatory Gatekeeper: Verify institutional identity and statutory compliance to proceed.'}
              {currentStep === 'member_choice' && 'Statutory Entry Point: Select your membership track to enter the system.'}
              {currentStep === 'in_member_role_popup' && 'Active Role Profile: Enter unique statutory clearance access key / password.'}
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

        {/* STEP 1: Mandatory Gatekeeper Form (Space for FULL NAME, MANAGING INSTITUTION, EMAIL ADDRESS, DATE, & GHANA DATA PROTECTION ACT) */}
        {currentStep === 'mandatory_form' && (
          <form onSubmit={handleGatekeeperSubmit} style={{ padding: '24px 32px 32px 32px' }}>
            <div style={{
              marginBottom: '18px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)'
            }}>
              <Sparkles size={14} className="text-emerald-400" style={{ flexShrink: 0 }} />
              <span>
                Please fill in the 5 mandatory gateway spaces below to access the system membership options.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Space 1: FULL NAME */}
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
                  onFocus={(e) => e.target.style.borderColor = 'var(--ghana-emerald)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
              </div>

              {/* Space 2: MANAGING INSTITUTION (Searchable Selector) */}
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
                    maxHeight: '260px',
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
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = selectedInstId === inst.id ? 'rgba(16, 185, 129, 0.1)' : 'transparent'}
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

              {/* Space 3: EMAIL ADDRESS (.gov.gh only) */}
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
                  <Mail size={14} className="text-emerald-400" />
                  <span>EMAIL ADDRESS (.gov.gh only) *</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. officer@nita.gov.gh"
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
                  onFocus={(e) => e.target.style.borderColor = isGovGhEmail ? 'var(--ghana-emerald)' : 'var(--ghana-gold)'}
                  onBlur={(e) => e.target.style.borderColor = cleanEmail === '' ? 'rgba(255, 255, 255, 0.12)' : isGovGhEmail ? 'var(--ghana-emerald)' : 'rgba(239, 68, 68, 0.6)'}
                />
                <div style={{ fontSize: '0.72rem', marginTop: '5px' }}>
                  {cleanEmail === '' ? (
                    <span style={{ color: 'var(--text-muted)' }}>
                      Mandatory requirement: Acceptable email must end with <strong>.gov.gh</strong>
                    </span>
                  ) : isGovGhEmail ? (
                    <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <CheckCircle2 size={13} />
                      <span>✓ Approved Ghana Gov Domain detected ({emailDomain})</span>
                    </span>
                  ) : (
                    <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <AlertTriangle size={13} />
                      <span>Invalid domain: Acceptable email must end with <strong>.gov.gh</strong></span>
                    </span>
                  )}
                </div>
              </div>

              {/* Space 4: DATE */}
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
                  <span>DATE *</span>
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
                  onFocus={(e) => e.target.style.borderColor = 'var(--ghana-emerald)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
              </div>

            </div>

            {/* Space 5: GHANA DATA PROTECTION ACT */}
            <div style={{
              marginTop: '22px',
              padding: '16px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px'
            }}>
              <input
                type="checkbox"
                id="act843-consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{
                  marginTop: '4px',
                  width: '18px',
                  height: '18px',
                  accentColor: 'var(--ghana-emerald)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="act843-consent" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <strong style={{ color: '#fff', letterSpacing: '0.02em' }}>
                    GHANA DATA PROTECTION ACT, 2012 (ACT 843) STATUTORY COMPLIANCE *
                  </strong>
                </div>
                I confirm statutory compliance under the <strong>Ghana Data Protection Act (Act 843)</strong>. I understand and acknowledge that my institutional credentials, access timestamps, and session actions will be cryptographically logged in an immutable statutory audit trail maintained by the National Information Technology Agency (NITA) with a mandatory 5-year retention period.
              </label>
            </div>

            {/* Submit Button to trigger Membership Options Screen */}
            <div style={{ marginTop: '26px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '13px 28px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                  color: '#0b0f19',
                  fontWeight: 800,
                  fontSize: '0.92rem',
                  border: 'none',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>Verify Credentials & Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: The Two Options Screen (ONLY TWO OPTIONS: "New Member" vs "In / Old Member") */}
        {currentStep === 'member_choice' && (
          <div style={{ padding: '24px 32px 32px 32px' }}>
            
            {/* Officer Identification Strip */}
            <div style={{
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.22)',
              fontSize: '0.78rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  Verified Officer: <strong style={{ color: '#fff' }}>{fullName}</strong> ({selectedInstId === 'other' ? customInstitution : getSelectedInstName()})
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem' }}>
                  <span style={{ color: '#a7f3d0', fontWeight: 600 }}>Act 843 Statutory Consent Verified ✓</span>
                  <span>•</span>
                  <span>{cleanEmail}</span>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '0 0 6px 0' }}>
                Please Select Your Membership Status
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '540px', marginInline: 'auto' }}>
                Access is strictly routed according to your operational status. Choose one of the two options below:
              </p>
            </div>

            {/* ONLY TWO OPTIONS: NEW MEMBER vs IN / OLD MEMBER */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '20px',
              marginBottom: '24px'
            }}>
              
              {/* Option 1: New Member */}
              <div
                onClick={handleSelectNewMember}
                style={{
                  padding: '24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(180deg, rgba(234, 179, 8, 0.08) 0%, rgba(234, 179, 8, 0.02) 100%)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.8)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(234, 179, 8, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(234, 179, 8, 0.4)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ghana-gold)'
                    }}>
                      <UserPlus size={22} />
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      background: 'rgba(234, 179, 8, 0.15)',
                      border: '1px solid rgba(234, 179, 8, 0.35)',
                      color: '#fde68a',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      Option 1
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#fde68a', margin: '0 0 6px 0' }}>
                    New Member
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ghana-gold)', fontWeight: 700, marginBottom: '10px' }}>
                    First-Timer / Onboard Track
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    For officers registering new AI projects or visiting the system for the first time:
                  </p>

                  <ul style={{
                    paddingLeft: '18px',
                    margin: '0 0 16px 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <li>Direct access to the <strong>First-Timer / Onboard Page</strong>.</li>
                    <li>Upload project documents with <strong>Governance & Ethics</strong> and <strong>AI Readiness</strong> live guidance and real-time grading.</li>
                    <li>Submits request with confirmation: <em>"Request pending will send you email when approved, THANK YOU"</em>.</li>
                    <li>Limited monitoring access to <strong>M&E Dashboard</strong>, <strong>GIS Spatial</strong>, and <strong>AI Chat Assistant</strong>.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                    color: '#0b0f19',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <Sparkles size={16} />
                  <span>Enter as New Member</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {/* Option 2: In / Old Member */}
              <div
                onClick={handleOpenInMemberPopup}
                style={{
                  padding: '24px',
                  borderRadius: '14px',
                  background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.8)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(16, 185, 129, 0.2)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.4)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--ghana-emerald)'
                    }}>
                      <Users size={22} />
                    </div>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '3px 9px',
                      borderRadius: '9999px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.35)',
                      color: '#a7f3d0',
                      fontWeight: 800,
                      textTransform: 'uppercase'
                    }}>
                      Option 2
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#a7f3d0', margin: '0 0 6px 0' }}>
                    In / Old Member
                  </h3>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ghana-emerald)', fontWeight: 700, marginBottom: '10px' }}>
                    Active Role Profile • Statutory Clearance
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                    For recognized statutory officers with approved active roles:
                  </p>

                  <ul style={{
                    paddingLeft: '18px',
                    margin: '0 0 16px 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.5,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <li>Pops up the <strong>Active Role Profile</strong> selector.</li>
                    <li>Requires <strong>unique statutory access key / password</strong> for each active role.</li>
                    <li>Enforces clearance levels for Super Admin, Director General, Technical Clearance, Finance Minister, etc.</li>
                    <li>Directs authorized officers directly to their <strong>actual working console</strong>.</li>
                  </ul>
                </div>

                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                    color: '#0b0f19',
                    fontSize: '0.84rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <KeyRound size={16} />
                  <span>Select Active Role & Enter</span>
                  <ArrowRight size={15} />
                </button>
              </div>

            </div>

            {/* Back button to re-edit mandatory fields */}
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                onClick={() => setCurrentStep('mandatory_form')}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ← Back / Edit Mandatory Information
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Active Role Profile Pop up for In / Old Members */}
        {currentStep === 'in_member_role_popup' && (
          <div style={{ padding: '24px 32px 32px 32px' }}>
            
            {/* Header Strip */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--ghana-emerald)', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase' }}>
                  <ShieldCheck size={14} />
                  <span>In / Old Member Clearance</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: '2px 0 0 0' }}>
                  Active Role Profile • Unique Password Verification
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep('member_choice')}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  cursor: 'pointer'
                }}
              >
                ← Back to Options
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
              🔒 <strong>Statutory Clearance Active:</strong> Select your registered active role profile. Each role requires its unique statutory access key / password before admission to actual pages.
            </p>

            {/* Role Cards List */}
            <div style={{
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              paddingRight: '6px'
            }}>
              {inMemberRolesList.map((r) => {
                const isSelected = selectedRole === r.role;
                const config = ROLE_SECURITY_MAP[r.role];
                const isUnlocked = !!unlockedRoles[r.role];
                const isChallenging = pinChallengeRole === r.role;

                return (
                  <div key={r.role} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div
                      onClick={() => handleSelectRole(r.role)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: isSelected 
                          ? 'rgba(16, 185, 129, 0.12)' 
                          : isChallenging
                            ? 'rgba(245, 158, 11, 0.08)'
                            : 'rgba(255, 255, 255, 0.02)',
                        border: isSelected 
                          ? '1px solid rgba(16, 185, 129, 0.5)' 
                          : isChallenging
                            ? '1px solid rgba(245, 158, 11, 0.45)'
                            : '1px solid rgba(255, 255, 255, 0.07)',
                        cursor: 'pointer',
                        transition: 'all 0.16s ease',
                        boxShadow: isSelected ? '0 0 16px rgba(16, 185, 129, 0.15)' : 'none'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: isSelected 
                              ? '5px solid var(--ghana-emerald)' 
                              : isUnlocked 
                                ? '2px solid rgba(16, 185, 129, 0.8)' 
                                : '2px solid rgba(245, 158, 11, 0.4)',
                            background: isSelected ? '#fff' : 'transparent',
                            transition: 'all 0.15s ease',
                            flexShrink: 0
                          }} />
                          <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {r.icon}
                            {r.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.64rem',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: isUnlocked ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                            border: isUnlocked ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(245, 158, 11, 0.35)',
                            color: isUnlocked ? '#a7f3d0' : '#fde68a',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            {isUnlocked ? <Unlock size={10} /> : <Lock size={10} />}
                            <span>{isUnlocked ? 'Key Verified ✓' : 'Unique Password Required'}</span>
                          </span>

                          <span style={{
                            fontSize: '0.66rem',
                            padding: '2px 7px',
                            borderRadius: '9999px',
                            background: `${r.color}22`,
                            border: `1px solid ${r.color}55`,
                            color: r.color,
                            fontWeight: 700
                          }}>
                            {r.badge}
                          </span>
                        </div>
                      </div>

                      <p style={{
                        fontSize: '0.74rem',
                        color: 'var(--text-secondary)',
                        margin: '3px 0 4px 24px',
                        lineHeight: 1.35
                      }}>
                        {r.desc}
                      </p>

                      <div style={{
                        fontSize: '0.68rem',
                        color: isSelected ? 'var(--ghana-emerald)' : 'var(--text-muted)',
                        marginLeft: '24px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle2 size={11} className={isSelected ? 'text-emerald-400' : 'text-slate-500'} />
                        <span>Actual Pages: {r.modules}</span>
                      </div>
                    </div>

                    {/* Security PIN Challenge Box */}
                    {isChallenging && (
                      <div style={{
                        marginLeft: '12px',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        background: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.35)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fbbf24', fontSize: '0.76rem', fontWeight: 700, marginBottom: '4px' }}>
                          <KeyRound size={14} />
                          <span>Unique Statutory Access Password Required: {r.role}</span>
                        </div>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                          Clearance authorized for <strong>{config.authorizedAgency}</strong>:
                        </p>
                        <form onSubmit={handleVerifyPin} style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            autoFocus
                            value={enteredPin}
                            onChange={(e) => setEnteredPin(e.target.value)}
                            placeholder="Enter Unique Access Key"
                            style={{
                              flex: 1,
                              minWidth: '170px',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              background: 'rgba(0, 0, 0, 0.4)',
                              border: '1px solid rgba(245, 158, 11, 0.4)',
                              color: '#fff',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              outline: 'none',
                              letterSpacing: '0.05em'
                            }}
                          />
                          <button
                            type="submit"
                            style={{
                              padding: '7px 14px',
                              borderRadius: '6px',
                              background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                              color: '#0b0f19',
                              fontSize: '0.76rem',
                              fontWeight: 800,
                              border: 'none',
                              cursor: 'pointer'
                            }}
                          >
                            Verify & Unlock
                          </button>
                        </form>

                        {/* Evaluation Key Helper */}
                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.68rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>
                            Authorized Key: <code style={{ color: '#fbbf24', background: 'rgba(251, 191, 36, 0.12)', padding: '1px 5px', borderRadius: '4px' }}>{config.pin}</code>
                          </span>
                          <button
                            type="button"
                            onClick={() => setEnteredPin(config.pin)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#a7f3d0',
                              cursor: 'pointer',
                              textDecoration: 'underline',
                              padding: 0,
                              fontSize: '0.68rem'
                            }}
                          >
                            Auto-fill Key
                          </button>
                        </div>

                        {pinError && (
                          <div style={{ color: '#f87171', fontSize: '0.7rem', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={12} />
                            <span>{pinError}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <button
                type="button"
                onClick={() => setCurrentStep('member_choice')}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                ← Back to Member Options
              </button>

              <button
                type="button"
                onClick={handleConfirmInMemberProfile}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 24px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                <FileCheck2 size={16} />
                <span>Authenticate & Enter as {selectedRole}</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
