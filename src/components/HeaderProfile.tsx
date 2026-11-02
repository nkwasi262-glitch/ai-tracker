import React from 'react';
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
  Lock
} from 'lucide-react';
import { UserSession, ActiveRole } from '../data/authTypes';

interface HeaderProfileProps {
  session: UserSession;
  onSwitchRole: () => void;
  onOpenRoleSelector?: () => void;
}

export const HeaderProfile: React.FC<HeaderProfileProps> = ({ session, onSwitchRole, onOpenRoleSelector }) => {

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

        {/* First-Timer: Role Selection is Restricted During Guided Onboarding */}
        {session.role === 'First-Timer / New User' ? (
          <div
            title="Role profile selection is restricted during guided onboarding. Super Admin audits uploaded project documents to authorize clearance."
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(251, 191, 36, 0.08)',
              border: '1px solid rgba(251, 191, 36, 0.25)',
              color: '#fde68a',
              fontSize: '0.7rem',
              fontWeight: 600,
              cursor: 'not-allowed'
            }}
          >
            <Lock size={11} className="text-amber-400" />
            <span>Role Selection Restricted</span>
          </div>
        ) : (
          /* Switch Role Option for Elevated Roles */
          <button
            onClick={() => {
              if (onOpenRoleSelector) {
                onOpenRoleSelector();
              } else {
                onSwitchRole();
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
        )}

        {/* Prominent High-Visibility Sign Out Button */}
        <button
          onClick={onSwitchRole}
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
    </>
  );
};
