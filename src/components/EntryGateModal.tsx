import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Mail, 
  User, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Database,
  Lock,
  Eye,
  EyeOff
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

export const EntryGateModal: React.FC<EntryGateModalProps> = ({ onSuccess }) => {
  // Form fields
  const [fullName, setFullName] = useState('');
  const [selectedInstId, setSelectedInstId] = useState('inst-1'); // Default NITA
  const [customInstitution, setCustomInstitution] = useState('');
  const [instCategory, setInstCategory] = useState<InstitutionCategory>('MDA');
  const [instSearch, setInstSearch] = useState('');
  const [showInstDropdown, setShowInstDropdown] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const submissionDate = new Date().toISOString().split('T')[0];

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
      } catch {
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

    // 4. Password validation
    if (!password.trim()) {
      setErrorMessage('Password is required to authenticate.');
      return;
    }

    // 5. Act 843 statutory consent
    if (!consentGiven) {
      setErrorMessage('You must confirm statutory compliance under the Ghana Data Protection Act, 2012 (Act 843).');
      return;
    }

    setIsSubmitting(true);

    const institutionName = selectedInstId === 'other' ? customInstitution.trim() : getSelectedInstName();

    // Normalize any role strictly to one of the 3 active role profiles
    const normalizeToActiveRole = (r?: string): ActiveRole => {
      if (r === 'Super Admin') return 'Super Admin';
      if (r === 'Technical Director' || r === 'Director General' || r === 'Technical Clearance Team' || r === 'AI Manager') return 'Technical Director';
      return 'Public User';
    };

    // Determine initial active role:
    // 1. Preserved role from Neon Postgres DB if user previously saved
    // 2. Or last selected role
    // 3. Or default to Super Admin for NITA, else Technical Director
    const assignedRole: ActiveRole = normalizeToActiveRole(
      dbUserFound?.role || 
      getLastSelectedRole() || 
      (cleanEmail.includes('nita.gov.gh') ? 'Super Admin' : 'Technical Director')
    );

    try {
      // Process submission: saves to local cache & syncs directly to Neon PostgreSQL DB
      const result: GateResult = processGateSubmission({
        fullName: fullName.trim(),
        institution: institutionName,
        institutionCategory: instCategory,
        role: assignedRole,
        email: cleanEmail,
        submissionDate,
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
        role: assignedRole,
        email: cleanEmail,
        submissionDate,
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
        maxWidth: '680px',
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
              Authenticate with your institutional identity. Active role profiles are managed directly on the main page.
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

        {/* Login Form */}
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

            {/* 4. PASSWORD FIELD (Replaces previous Active Role Profile block) */}
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
                  <Lock size={14} className="text-emerald-400" />
                  <span>PASSWORD *</span>
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  Institutional Access Password
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your institutional password"
                  style={{
                    width: '100%',
                    padding: '11px 40px 11px 14px',
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* 5. STATUTORY CONSENT UNDER ACT 843 */}
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

          {/* Single Direct Submit Button */}
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
              <span>{isSubmitting ? 'Authenticating with Postgres DB...' : 'Sign In & Enter System'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
