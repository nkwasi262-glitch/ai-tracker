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
  Building2
} from 'lucide-react';
import { UserSession, ActiveRole } from '../data/authTypes';

interface HeaderProfileProps {
  session: UserSession;
  onSwitchRole: () => void;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({ session, onSwitchRole }) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const getRoleBadgeStyle = (role: ActiveRole) => {
    switch (role) {
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
              <span title="Verified Institutional Identity">
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

        {/* Switch Role / Sign Out Trigger Button */}
        <button
          onClick={() => setShowConfirmModal(true)}
          title="Switch Role or Sign Out to access Gatekeeper"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 10px',
            borderRadius: '9999px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
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
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
          }}
        >
          <RefreshCw size={12} />
          <span>Switch Role / Sign out</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '420px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              Switch Role or Sign Out?
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
              This action will reset your active session and return you to the Mandatory Entry Gate. You can enter with a different institutional role or re-authenticate your credentials.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                onClick={() => setShowConfirmModal(false)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  onSwitchRole();
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  background: 'var(--ghana-red)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                <LogOut size={14} /> Clear Session & Switch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
