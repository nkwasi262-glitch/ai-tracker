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
  X,
  ShieldAlert,
  UserCheck,
  DollarSign,
  Globe
} from 'lucide-react';
import { 
  ActiveRole, 
  InstitutionCategory, 
  STANDARD_INSTITUTIONS 
} from '../data/authTypes';
import { 
  processGateSubmission, 
  GateResult,
  getLastSelectedRole 
} from '../services/authService';
import { UserSession } from '../data/authTypes';

interface EntryGateModalProps {
  onSuccess: (session: UserSession) => void;
}

export const EntryGateModal: React.FC<EntryGateModalProps> = ({ onSuccess }) => {
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

  // Small popup of (active role profile) state
  const [showRolePopup, setShowRolePopup] = useState(false);
  const [selectedRole, setSelectedRole] = useState<ActiveRole>(() => getLastSelectedRole() || 'AI Manager');

  // Feedback & submission state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Roles available in the Active Role Profile popup
  const rolesList: { 
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
    },
    { 
      role: 'First-Timer / New User', 
      label: 'First-Timer / Guided Onboarding', 
      badge: 'Orientation Track', 
      color: '#eab308', 
      desc: 'Guided onboarding with exclusive access to Document & OCR file uploads, AI Readiness guide, and Ethics.',
      modules: 'Document & OCR (File Uploads), AI Readiness Guide, Governance & Ethics',
      icon: <Sparkles size={16} className="text-amber-400" />
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

    // All 5 spaces validated: Open the small pop up of the (active role profile) for selection
    setShowRolePopup(true);
  };

  // Confirm Active Role Profile from Pop up and Enter System
  const handleConfirmRoleProfile = () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const institutionName = selectedInstId === 'other' ? customInstitution.trim() : getSelectedInstName();

    const result: GateResult = processGateSubmission({
      fullName: fullName.trim(),
      institution: institutionName,
      institutionCategory: instCategory,
      role: selectedRole,
      email: email.trim().toLowerCase(),
      submissionDate: date,
      isFirstTimer: selectedRole === 'First-Timer / New User'
    });

    setIsSubmitting(false);
    setShowRolePopup(false);
    onSuccess(result.session);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999, // Absolute top layer
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
        maxWidth: '720px',
        width: '100%',
        margin: '0 auto',
        background: 'linear-gradient(170deg, #111827 0%, #0d121f 100%)',
        border: '1px solid rgba(16, 185, 129, 0.28)',
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
              Mandatory Gatekeeper: Verify institutional identity and statutory compliance to enter.
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

        {/* Mandatory Gatekeeper Form (Space for FULL NAME, MANAGING INSTITUTION, EMAIL ADDRESS, DATE, & GHANA DATA PROTECTION ACT) */}
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
              All personnel enter as first-timers through statutory logging. Complete the 5 spaces below to open the <strong>(active role profile)</strong> selector.
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

          {/* Submit Button to trigger the (active role profile) pop up */}
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
              <span>Submit & Select Active Role Profile</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>

      </div>

      {/* Small Pop Up of the (Active Role Profile) for Selection */}
      {showRolePopup && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 100000, // Above gatekeeper
          background: 'rgba(3, 7, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 16px',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: '580px',
            width: '100%',
            margin: '0 auto',
            background: 'linear-gradient(175deg, #111827 0%, #0c121e 100%)',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.18)',
            borderRadius: '18px',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* National Ribbon */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
            }} />

            {/* Pop up Header */}
            <div style={{
              padding: '22px 24px 16px 24px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(251, 191, 36, 0.15))',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.3rem'
                }}>
                  🇬🇭
                </div>
                <div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--ghana-emerald)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    <Sparkles size={12} />
                    <span>Credentials Verified • Mandatory Selection</span>
                  </div>
                  <h2 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
                    Active Role Profile Selection
                  </h2>
                </div>
              </div>

              <button
                onClick={() => setShowRolePopup(false)}
                title="Back to Gatekeeper Form"
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '8px',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Submitted Info Context Strip */}
            <div style={{
              margin: '14px 24px 0 24px',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.22)',
              fontSize: '0.76rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45
            }}>
              <div>
                Official Identity: <strong style={{ color: '#fff' }}>{fullName}</strong> ({selectedInstId === 'other' ? customInstitution : getSelectedInstName()})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '3px', fontSize: '0.72rem' }}>
                <span>Email: <span style={{ color: '#94a3b8' }}>{email}</span></span>
                <span>•</span>
                <span>Date: <span style={{ color: '#94a3b8' }}>{date}</span></span>
                <span>•</span>
                <span style={{ color: '#a7f3d0', fontWeight: 600 }}>Act 843 Verified ✓</span>
              </div>
            </div>

            {/* Instructions */}
            <div style={{ padding: '12px 24px 4px 24px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Select your (active role profile) to configure permissions and operational modules:
            </div>

            {/* Role Options Cards */}
            <div style={{
              padding: '10px 24px 16px 24px',
              maxHeight: '340px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '9px'
            }}>
              {rolesList.map((r) => {
                const isSelected = selectedRole === r.role;
                return (
                  <div
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: isSelected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
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
                          border: isSelected ? '5px solid var(--ghana-emerald)' : '2px solid rgba(255, 255, 255, 0.3)',
                          background: isSelected ? '#fff' : 'transparent',
                          transition: 'all 0.15s ease',
                          flexShrink: 0
                        }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {r.icon}
                          {r.label}
                        </span>
                      </div>
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
                      <span>{r.modules}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pop up Footer Actions */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <button
                type="button"
                onClick={() => setShowRolePopup(false)}
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
                ← Back / Edit Info
              </button>

              <button
                type="button"
                onClick={handleConfirmRoleProfile}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 22px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
                }}
              >
                <FileCheck2 size={16} />
                <span>Confirm & Enter as {selectedRole}</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
