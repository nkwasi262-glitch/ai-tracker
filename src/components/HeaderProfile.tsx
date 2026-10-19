import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  DollarSign, 
  Globe, 
  LogOut, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Sparkles,
  X,
  AlertTriangle
} from 'lucide-react';
import { UserSession, ActiveRole } from '../data/authTypes';

interface HeaderProfileProps {
  session: UserSession;
  onSwitchRole: () => void;
  onOpenRoleSelector?: () => void;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({ session, onSwitchRole, onOpenRoleSelector }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getRoleBadgeStyle = (role: ActiveRole) => {
    switch (role) {
      case 'First-Timer / New User':
        return {
          bg: 'rgba(251, 191, 36, 0.15)',
          border: 'rgba(251, 191, 36, 0.4)',
          text: '#fde68a',
          icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'Super Admin':
        return {
          bg: 'rgba(239, 68, 68, 0.15)',
          border: 'rgba(239, 68, 68, 0.4)',
          text: '#fca5a5',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        };
      case 'Director General':
        return {
          bg: 'rgba(251, 191, 36, 0.15)',
          border: 'rgba(251, 191, 36, 0.4)',
          text: '#fde68a',
          icon: <Award className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'Technical Director':
        return {
          bg: 'rgba(99, 102, 241, 0.15)',
          border: 'rgba(99, 102, 241, 0.4)',
          text: '#c7d2fe',
          icon: <Award className="w-3.5 h-3.5 text-indigo-400" />
        };
      case 'Technical Clearance Team':
        return {
          bg: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.4)',
          text: '#a7f3d0',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        };
      case 'AI Manager':
        return {
          bg: 'rgba(6, 182, 212, 0.15)',
          border: 'rgba(6, 182, 212, 0.4)',
          text: '#a5f3fc',
          icon: <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
        };
      case 'Finance Minister':
        return {
          bg: 'rgba(245, 158, 11, 0.15)',
          border: 'rgba(245, 158, 11, 0.4)',
          text: '#fde68a',
          icon: <DollarSign className="w-3.5 h-3.5 text-amber-400" />
        };
      case 'Public User':
      default:
        return {
          bg: 'rgba(148, 163, 184, 0.12)',
          border: 'rgba(148, 163, 184, 0.3)',
          text: '#cbd5e1',
          icon: <Globe className="w-3.5 h-3.5 text-slate-400" />
        };
    }
  };

  const badge = getRoleBadgeStyle(session.role);

  return (
    <>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '6px 14px',
        borderRadius: '9999px',
        background: 'rgba(17, 24, 39, 0.85)',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* User Avatar Circle */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--ghana-emerald), #0284c7)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.78rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
        }}>
          {session.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
        </div>

        {/* Name & Institution Info */}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <div style={{
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>{session.fullName}</span>
            {session.isVerified ? (
              <span title="Verified Institutional Identity (.gov.gh)">
                <CheckCircle2 size={13} className="text-emerald-400" />
              </span>
            ) : (
              <span title="Unverified Profile - Public Clearance Only">
                <AlertCircle size={13} className="text-amber-400" />
              </span>
            )}
          </div>
          <div style={{
            fontSize: '0.68rem',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Building2 size={10} />
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.institution || 'Public Citizen'}
            </span>
          </div>
        </div>

        {/* Role Pill Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          padding: '4px 10px',
          borderRadius: '9999px',
          background: badge.bg,
          border: `1px solid ${badge.border}`,
          color: badge.text,
          fontSize: '0.72rem',
          fontWeight: 700,
          letterSpacing: '0.02em'
        }}>
          {badge.icon}
          <span>{session.role}</span>
        </div>

        {/* If First-Timer: Select Active Role Profile Button */}
        {session.role === 'First-Timer / New User' && onOpenRoleSelector && (
          <button
            onClick={onOpenRoleSelector}
            title="Activate your official Active Role Profile"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: '9999px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(16, 185, 129, 0.25))',
              border: '1px solid rgba(251, 191, 36, 0.6)',
              color: '#fef08a',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 12px rgba(251, 191, 36, 0.25)',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={12} className="text-amber-400" />
            <span>Select Active Role Profile ➜</span>
          </button>
        )}

        {/* Switch Role Option */}
        <button
          onClick={() => {
            if (onOpenRoleSelector) {
              onOpenRoleSelector();
            } else {
              setShowConfirmModal(true);
            }
          }}
          title="Switch to another Active Role Profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            color: 'var(--text-secondary)',
            fontSize: '0.72rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
          }}
        >
          <RefreshCw size={12} />
          <span>Switch Role</span>
        </button>

        {/* Prominent High-Visibility Sign Out Button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          title="Sign Out of GNAPRMS"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 12px',
            borderRadius: '9999px',
            background: 'rgba(239, 68, 68, 0.14)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            color: '#fca5a5',
            fontSize: '0.74rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 0 10px rgba(239, 68, 68, 0.15)',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.26)';
            e.currentTarget.style.color = '#fff';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.8)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(239, 68, 68, 0.35)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.14)';
            e.currentTarget.style.color = '#fca5a5';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
            e.currentTarget.style.boxShadow = '0 0 10px rgba(239, 68, 68, 0.15)';
          }}
        >
          <LogOut size={13} className="text-red-400" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Highly Visible Centered Sign Out Confirmation Pop Up Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(2, 6, 23, 0.88)',
          backdropFilter: 'blur(16px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000000, // Topmost layer
          padding: '24px 16px',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'linear-gradient(175deg, #131d2e 0%, #0b111c 100%)',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            borderRadius: '18px',
            maxWidth: '480px',
            width: '100%',
            margin: '0 auto',
            boxShadow: '0 25px 65px -15px rgba(0, 0, 0, 0.95), 0 0 45px rgba(239, 68, 68, 0.25)',
            overflow: 'hidden',
            position: 'relative'
          }}>
            {/* National Tricolor Ribbon */}
            <div style={{
              height: '4px',
              background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
            }} />

            {/* Close Cross in Corner */}
            <button
              onClick={() => setShowConfirmModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={16} />
            </button>

            {/* Modal Body */}
            <div style={{ padding: '28px 28px 24px 28px' }}>
              
              {/* Glowing Icon & Title */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '14px',
                  background: 'rgba(239, 68, 68, 0.15)',
                  border: '1px solid rgba(239, 68, 68, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444',
                  boxShadow: '0 0 20px rgba(239, 68, 68, 0.25)',
                  flexShrink: 0
                }}>
                  <LogOut size={26} />
                </div>
                <div>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: '#f87171',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <AlertTriangle size={12} />
                    <span>Statutory Session Termination • Act 843</span>
                  </div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    Sign Out of GNAPRMS?
                  </h3>
                </div>
              </div>

              {/* Official Identity Context Box */}
              <div style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '16px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}>
                <div>
                  Active Official: <strong style={{ color: '#fff' }}>{session.fullName}</strong>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Institution: {session.institution} • Role: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{session.role}</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  Institutional Email: {session.email}
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 22px 0', lineHeight: 1.5 }}>
                Signing out will safely terminate your active session and record a statutory audit event under the <strong>Ghana Data Protection Act (Act 843)</strong>. You will be redirected back to the Mandatory Gatekeeper.
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowConfirmModal(false)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  }}
                >
                  Cancel / Stay
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmModal(false);
                    onSwitchRole();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.55)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(239, 68, 68, 0.4)';
                  }}
                >
                  <LogOut size={16} />
                  <span>Yes, Sign Out</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </>
  );
};
