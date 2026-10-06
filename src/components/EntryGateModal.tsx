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
  KeyRound,
  FileCheck2,
  Search,
  Sparkles
} from 'lucide-react';
import { 
  ActiveRole, 
  InstitutionCategory, 
  STANDARD_INSTITUTIONS, 
  APPROVED_GOV_DOMAINS 
} from '../data/authTypes';
import { 
  processGateSubmission, 
  verifyPendingOtp, 
  GateResult 
} from '../services/authService';
import { UserSession } from '../data/authTypes';

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

  const [role, setRole] = useState<ActiveRole>('Super Admin');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [consentGiven, setConsentGiven] = useState(false);

  // Verification & flow state
  const [stage, setStage] = useState<'form' | 'otp_challenge'>('form');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningNotice, setWarningNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available roles for selection
  const rolesList: { role: ActiveRole; label: string; badge: string; color: string; desc: string }[] = [
    { 
      role: 'Super Admin', 
      label: 'Super Admin', 
      badge: 'Tier-1 Security', 
      color: '#ef4444', 
      desc: 'Complete system oversight, audit trails, and user management.' 
    },
    { 
      role: 'Director General', 
      label: 'Director General', 
      badge: 'Executive Clearance', 
      color: '#fbbf24', 
      desc: 'Passes final statutory verdicts on recommended AI projects.' 
    },
    { 
      role: 'Technical Director', 
      label: 'Technical Director', 
      badge: 'Clearance Leadership', 
      color: '#6366f1', 
      desc: 'Supervises technical audits, escalations, and recommendations.' 
    },
    { 
      role: 'Technical Clearance Team', 
      label: 'Technical Clearance Team', 
      badge: 'Technical Inspector', 
      color: '#10b981', 
      desc: 'Evaluates architectural dossiers, OCR models, and ethics matrices.' 
    },
    { 
      role: 'AI Manager', 
      label: 'AI Manager (newly registered)', 
      badge: 'Institutional Lead', 
      color: '#06b6d4', 
      desc: 'Manages project registration portfolios and compliance dossiers.' 
    },
    { 
      role: 'Finance Minister', 
      label: 'Finance Minister', 
      badge: 'Fiscal Authority', 
      color: '#f59e0b', 
      desc: 'Accesses M&E dashboards, budgets, funding streams, and exports.' 
    },
    { 
      role: 'Public User', 
      label: 'Public User', 
      badge: 'Open Citizen Access', 
      color: '#94a3b8', 
      desc: 'General public overview of transparent AI initiatives and GIS map.' 
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

  // Email domain check preview
  const emailDomain = email.includes('@') ? email.split('@')[1]?.toLowerCase().trim() : '';
  const isGovEmail = APPROVED_GOV_DOMAINS.some(d => emailDomain === d || emailDomain.endsWith('.' + d));

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

  // Submission handler
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setWarningNotice(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Full name is required to initialize session.');
      return;
    }
    if (selectedInstId === 'other' && !customInstitution.trim()) {
      setErrorMessage('Please specify the name of your managing institution.');
      return;
    }
    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('A valid email address is required for institutional logging.');
      return;
    }
    if (!date) {
      setErrorMessage('Access date is required.');
      return;
    }
    if (!consentGiven) {
      setErrorMessage('You must confirm statutory compliance under the Ghana Data Protection Act (Act 843).');
      return;
    }

    setIsSubmitting(true);

    const institutionName = selectedInstId === 'other' ? customInstitution.trim() : getSelectedInstName();

    const result: GateResult = processGateSubmission({
      fullName: fullName.trim(),
      institution: institutionName,
      institutionCategory: instCategory,
      role,
      email: email.trim().toLowerCase(),
      submissionDate: date
    });

    setIsSubmitting(false);

    if (result.requiresOtp) {
      setStage('otp_challenge');
      setSimulatedOtp(result.otpCode || null);
    } else {
      // Direct access (either Public User or unverified fallback)
      if (!result.isDomainApproved && role !== 'Public User') {
        setWarningNotice(result.message);
      }
      onSuccess(result.session);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCodeInput.trim() || otpCodeInput.trim().length !== 6) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    const verifyRes = verifyPendingOtp(otpCodeInput.trim());
    if (verifyRes.success && verifyRes.session) {
      onSuccess(verifyRes.session);
    } else {
      setErrorMessage(verifyRes.error || 'Verification code failed. Please try again.');
    }
  };

  // Quick fill helper for presentation / review convenience
  const handleQuickFillOtp = () => {
    if (simulatedOtp) {
      setOtpCodeInput(simulatedOtp);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999, // Absolute top layer
      background: 'rgba(5, 8, 15, 0.94)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      overflowY: 'auto'
    }}>
      {/* Container Box */}
      <div style={{
        maxWidth: '720px',
        width: '100%',
        background: 'linear-gradient(170deg, #111827 0%, #0d121f 100%)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
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
              Mandatory Gatekeeper: Verify institutional identity and active role profile to enter.
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

        {/* Warning Banner */}
        {warningNotice && (
          <div style={{
            margin: '16px 32px 0 32px',
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            color: '#fde68a',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{warningNotice}</span>
          </div>
        )}

        {/* Stage 1: Mandatory Entry Gate Form */}
        {stage === 'form' && (
          <form onSubmit={handleSubmitForm} style={{ padding: '24px 32px 32px 32px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              
              {/* Field 1: Full Name */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}>
                  <User size={14} className="text-emerald-400" />
                  <span>Full Name (as registered with Institution) *</span>
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

              {/* Field 2: Managing Institution (Searchable Dropdown) */}
              <div style={{ gridColumn: 'span 2', position: 'relative' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}>
                  <Building2 size={14} className="text-emerald-400" />
                  <span>Managing Institution (MDA / MMDA / SOE / Other) *</span>
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

              {/* Field 3: Active Role Profile (Dropdown) */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}>
                  <Award size={14} className="text-emerald-400" />
                  <span>Active Role Profile (Defines Permissions & Modules) *</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as ActiveRole)}
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: '8px',
                      background: '#111b27',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#fff',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    {rolesList.map((r) => (
                      <option key={r.role} value={r.role} style={{ background: '#111b27', color: '#fff' }}>
                        {r.label} — [{r.badge}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Description Card */}
                {(() => {
                  const currentDesc = rolesList.find(r => r.role === role);
                  return (
                    <div style={{
                      marginTop: '8px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: '0.76rem',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ color: currentDesc?.color, fontWeight: 700 }}>
                        {currentDesc?.badge}:
                      </span>
                      <span>{currentDesc?.desc}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Field 4: Institutional Email Address */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}>
                  <Mail size={14} className="text-emerald-400" />
                  <span>Email Address *</span>
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
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--ghana-emerald)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.12)'}
                />
                <div style={{ fontSize: '0.7rem', color: isGovEmail ? '#10b981' : 'var(--text-muted)', marginTop: '4px' }}>
                  {isGovEmail ? (
                    <span>✓ Approved Ghana Gov Domain detected ({emailDomain})</span>
                  ) : role !== 'Public User' ? (
                    <span>Notice: Privileged roles require institutional government domain (.gov.gh)</span>
                  ) : (
                    <span>Public users may use any valid email</span>
                  )}
                </div>
              </div>

              {/* Field 5: Date */}
              <div>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  marginBottom: '6px'
                }}>
                  <Calendar size={14} className="text-emerald-400" />
                  <span>Date *</span>
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

            {/* Ghana Data Protection Act (Act 843) Consent */}
            <div style={{
              marginTop: '20px',
              padding: '14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <input
                type="checkbox"
                id="act843-consent"
                checked={consentGiven}
                onChange={(e) => setConsentGiven(e.target.checked)}
                style={{
                  marginTop: '3px',
                  width: '16px',
                  height: '16px',
                  accentColor: 'var(--ghana-emerald)',
                  cursor: 'pointer'
                }}
              />
              <label htmlFor="act843-consent" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                <strong style={{ color: '#fff' }}>Ghana Data Protection Act, 2012 (Act 843) Compliance Notice:</strong> I understand that my institutional credentials and actions will be logged in an immutable statutory audit trail maintained by the National Information Technology Agency (NITA) with a 5-year retention period.
              </label>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
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
                  transition: 'transform 0.15s ease'
                }}
              >
                <span>{role === 'Public User' ? 'Enter Public Registry' : 'Proceed to Verification'}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        )}

        {/* Stage 2: OTP Verification Challenge for Privileged Roles */}
        {stage === 'otp_challenge' && (
          <form onSubmit={handleVerifyOtp} style={{ padding: '28px 32px 32px 32px' }}>
            <div style={{
              textAlign: 'center',
              maxWidth: '500px',
              margin: '0 auto',
              paddingBottom: '20px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                color: '#fbbf24'
              }}>
                <KeyRound size={28} />
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                Institutional OTP Verification
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                You have requested privileged clearance as <strong style={{ color: '#fbbf24' }}>{role}</strong>.
                A statutory 6-digit verification code has been dispatched to{' '}
                <strong style={{ color: '#fff' }}>{email}</strong>.
              </p>

              {/* Simulated OTP Display Helper (for seamless demo / evaluation) */}
              {simulatedOtp && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '10px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px dashed rgba(16, 185, 129, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Simulator Dispatch Code
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', letterSpacing: '0.15em' }}>
                      {simulatedOtp}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFillOtp}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      color: '#a7f3d0',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Sparkles size={12} /> Auto-Fill Code
                  </button>
                </div>
              )}

              {/* Code Input */}
              <div style={{ marginTop: '24px' }}>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={otpCodeInput}
                  onChange={(e) => setOtpCodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="• • • • • •"
                  style={{
                    width: '240px',
                    padding: '12px 16px',
                    fontSize: '1.8rem',
                    textAlign: 'center',
                    fontWeight: 800,
                    letterSpacing: '0.3em',
                    borderRadius: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#fff',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--ghana-gold)'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'}
                />
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setStage('form')}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back to Form
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--ghana-gold) 0%, #d97706 100%)',
                    color: '#0b0f19',
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <FileCheck2 size={16} /> Verify & Authenticate
                </button>
              </div>

              {/* Fallback to Public User */}
              <div style={{ marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const fallbackResult = processGateSubmission({
                      fullName,
                      institution: selectedInstId === 'other' ? customInstitution : getSelectedInstName(),
                      institutionCategory: instCategory,
                      role: 'Public User',
                      email,
                      submissionDate: date
                    });
                    onSuccess(fallbackResult.session);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    cursor: 'pointer'
                  }}
                >
                  Continue without verifying (Access as Public User only)
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
