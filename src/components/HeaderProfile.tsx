import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, 
  Award, 
  ShieldCheck, 
  UserCheck, 
  DollarSign, 
  Globe, 
  LogOut, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Sparkles,
  ChevronDown,
  Check
} from 'lucide-react';
import { UserSession, ActiveRole } from '../data/authTypes';

interface HeaderProfileProps {
  session: UserSession;
  onSwitchRole: () => void;
  onOpenRoleSelector?: () => void;
  onSelectRole?: (role: ActiveRole) => void;
}

interface RoleDropdownOption {
  role: ActiveRole;
  label: string;
  badge: string;
  icon: React.ReactNode;
  color: string;
}

const ALL_ACTIVE_ROLES: RoleDropdownOption[] = [
  {
    role: 'Super Admin',
    label: 'Super Admin',
    badge: 'Tier-1 Security Oversight',
    icon: <ShieldAlert size={14} className="text-red-400" />,
    color: '#ef4444'
  },
  {
    role: 'Director General',
    label: 'Director General',
    badge: 'Executive Statutory Clearance',
    icon: <Award size={14} className="text-amber-400" />,
    color: '#fbbf24'
  },
  {
    role: 'Technical Director',
    label: 'Technical Director',
    badge: 'Clearance Leadership',
    icon: <Award size={14} className="text-indigo-400" />,
    color: '#6366f1'
  },
  {
    role: 'Technical Clearance Team',
    label: 'Technical Clearance Team',
    badge: 'Technical Inspector',
    icon: <ShieldCheck size={14} className="text-emerald-400" />,
    color: '#10b981'
  },
  {
    role: 'AI Manager',
    label: 'AI Manager',
    badge: 'Institutional Lead',
    icon: <UserCheck size={14} className="text-cyan-400" />,
    color: '#06b6d4'
  },
  {
    role: 'Finance Minister',
    label: 'Finance Minister',
    badge: 'Fiscal Authority',
    icon: <DollarSign size={14} className="text-amber-400" />,
    color: '#f59e0b'
  },
  {
    role: 'Public User',
    label: 'Public User',
    badge: 'Open Citizen Access',
    icon: <Globe size={14} className="text-slate-400" />,
    color: '#94a3b8'
  },
  {
    role: 'First-Timer / New User',
    label: 'First-Timer / New User',
    badge: 'Guided Orientation',
    icon: <Sparkles size={14} className="text-emerald-400" />,
    color: '#10b981'
  }
];

export const HeaderProfile: React.FC<HeaderProfileProps> = ({ 
  session, 
  onSwitchRole, 
  onOpenRoleSelector,
  onSelectRole 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

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
            <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session.institution || 'Public Citizen'}
            </span>
          </div>
        </div>

        {/* Active Role Profile Dropdown Trigger (Replaces old Role Pill & Switch Role Button) */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(prev => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              padding: '6px 14px',
              borderRadius: '9999px',
              background: badge.bg,
              border: `1px solid ${badge.border}`,
              color: badge.text,
              fontSize: '0.74rem',
              fontWeight: 700,
              letterSpacing: '0.02em',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.filter = 'brightness(1.15)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.filter = 'none';
              e.currentTarget.style.borderColor = badge.border;
            }}
            title="Click to view and switch Active Role Profile"
          >
            {badge.icon}
            <span>{session.role}</span>
            <ChevronDown 
              size={13} 
              style={{ 
                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                transition: 'transform 0.2s ease',
                opacity: 0.8 
              }} 
            />
          </button>

          {/* Active Role Profile Dropdown Menu (No modules listed) */}
          {isDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '270px',
              background: '#0d1527',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderRadius: '14px',
              boxShadow: '0 18px 40px rgba(0, 0, 0, 0.75)',
              padding: '8px',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              backdropFilter: 'blur(16px)'
            }}>
              <div style={{
                padding: '6px 10px 6px 10px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '4px'
              }}>
                <div style={{
                  fontSize: '0.66rem',
                  fontWeight: 800,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  Active Role Profile
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                  Select to switch active profile
                </div>
              </div>

              {ALL_ACTIVE_ROLES.map((item) => {
                const isCurrent = session.role === item.role;
                return (
                  <button
                    key={item.role}
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      if (onSelectRole) {
                        onSelectRole(item.role);
                      } else if (onOpenRoleSelector) {
                        onOpenRoleSelector();
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      background: isCurrent ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      border: isCurrent ? `1px solid ${item.color}55` : '1px solid transparent',
                      color: isCurrent ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: isCurrent ? 700 : 500,
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.color = '#fff';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: `${item.color}22`,
                        color: item.color
                      }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {isCurrent && (
                      <Check size={15} style={{ color: item.color, strokeWidth: 2.5 }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
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
