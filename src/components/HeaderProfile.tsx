import React from 'react';
import { 
  ShieldAlert, 
  Award, 
  Globe, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Building2
} from 'lucide-react';
import { UserSession, ActiveRole } from '../data/authTypes';

export interface HeaderProfileProps {
  session: UserSession;
  onSwitchRole: () => void;
  onOpenRoleSelector?: () => void;
  onSelectRole?: (role: ActiveRole) => void;
}

export interface RoleDropdownOption {
  role: ActiveRole;
  label: string;
  badge: string;
  icon: React.ReactNode;
  color: string;
}

// Active role profiles catalog maintained for statutory RBAC reference
export const ALL_ACTIVE_ROLES: RoleDropdownOption[] = [
  {
    role: 'Super Admin',
    label: 'Super Admin',
    badge: 'Tier-1 Security Oversight',
    icon: <ShieldAlert size={14} className="text-red-400" />,
    color: '#ef4444'
  },
  {
    role: 'Technical Director',
    label: 'Technical Director',
    badge: 'Clearance Leadership',
    icon: <Award size={14} className="text-indigo-400" />,
    color: '#6366f1'
  },
  {
    role: 'Public User',
    label: 'Public User',
    badge: 'Open Citizen Access',
    icon: <Globe size={14} className="text-slate-400" />,
    color: '#94a3b8'
  }
];

export const HeaderProfile: React.FC<HeaderProfileProps> = ({ 
  session, 
  onSwitchRole 
}) => {
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
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
        position: 'relative'
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
            <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.institution || 'Public Citizen'}
            </span>
          </div>
        </div>

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
