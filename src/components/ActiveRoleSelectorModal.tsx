import React, { useState } from 'react';
import { 
  ArrowRight, 
  X, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { ActiveRole, UserSession } from '../data/authTypes';
import { MODULE_REGISTRY, AppModuleId } from '../services/rbacPolicy';

interface ActiveRoleSelectorModalProps {
  session: UserSession;
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: ActiveRole) => void;
}

interface RoleOption {
  role: ActiveRole;
  title: string;
  badge: string;
  color: string;
  desc: string;
  unlockedModules: AppModuleId[];
}

export const ActiveRoleSelectorModal: React.FC<ActiveRoleSelectorModalProps> = ({
  session,
  isOpen,
  onClose,
  onSelectRole
}) => {
  const [selectedRole, setSelectedRole] = useState<ActiveRole>('AI Manager');

  if (!isOpen) return null;

  const roles: RoleOption[] = [
    {
      role: 'Super Admin',
      title: 'Super Administrator',
      badge: 'Tier-1 Security Oversight',
      color: '#ef4444',
      desc: 'Complete administrative oversight across all national registries, security audits, and configuration consoles.',
      unlockedModules: ['dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'chat']
    },
    {
      role: 'Director General',
      title: 'Director General (DG)',
      badge: 'Executive Statutory Clearance',
      color: '#fbbf24',
      desc: 'Exclusive executive decision queue to pass formal clearance, directives, or rejections on recommended AI projects.',
      unlockedModules: ['dashboard', 'dg_queue', 'gis', 'finance', 'reports', 'audit', 'chat']
    },
    {
      role: 'Technical Director',
      title: 'Technical Director',
      badge: 'Clearance Leadership',
      color: '#6366f1',
      desc: 'Supervises national technical evaluations, ethical audits, escalations, and dossier recommendations.',
      unlockedModules: ['dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'dg_queue', 'finance', 'reports', 'audit', 'chat']
    },
    {
      role: 'Technical Clearance Team',
      title: 'Technical Clearance Team',
      badge: 'Technical Inspector',
      color: '#10b981',
      desc: 'Audits algorithmic source documents, OCR extractions, and compliance matrices; recommends cleared dossiers to DG.',
      unlockedModules: ['dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'finance', 'reports', 'audit', 'chat']
    },
    {
      role: 'AI Manager',
      title: 'Institutional AI Manager',
      badge: 'Managing Lead (MDA / MMDA / SOE)',
      color: '#06b6d4',
      desc: 'Official representative registering and maintaining project portfolios, milestone tracking, and readiness surveys.',
      unlockedModules: ['dashboard', 'registry', 'gis', 'governance', 'readiness', 'risk', 'documents', 'finance', 'reports', 'chat']
    },
    {
      role: 'Finance Minister',
      title: 'Finance Minister / Fiscal Lead',
      badge: 'Sovereign Fiscal Authority',
      color: '#f59e0b',
      desc: 'Isolated financial monitoring suite tracking national AI budget caps, actual disbursements, and value-for-money metrics.',
      unlockedModules: ['dashboard', 'finance', 'chat']
    },
    {
      role: 'Public User',
      title: 'Public Citizen / Open Observer',
      badge: 'Citizen Transparency',
      color: '#94a3b8',
      desc: 'Transparent public view of high-level national statistics, regional GIS deployments, and the regulatory assistant.',
      unlockedModules: ['dashboard', 'gis', 'chat']
    }
  ];

  const handleConfirm = () => {
    onSelectRole(selectedRole);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      background: 'rgba(3, 7, 18, 0.92)',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '36px 16px 60px 16px',
      overflowY: 'auto',
      WebkitOverflowScrolling: 'touch'
    }}>
      <div style={{
        maxWidth: '840px',
        width: '100%',
        margin: '0 auto',
        background: 'linear-gradient(175deg, #111827 0%, #0c121e 100%)',
        border: '1px solid rgba(16, 185, 129, 0.35)',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px rgba(16, 185, 129, 0.15)',
        borderRadius: '20px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* National Ribbon */}
        <div style={{
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
        }} />

        {/* Modal Header */}
        <div style={{
          padding: '24px 28px 18px 28px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(251, 191, 36, 0.15))',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem'
            }}>
              🇬🇭
            </div>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--ghana-emerald)',
                fontSize: '0.72rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                <Sparkles size={13} />
                <span>Onboarding Orientation Complete • Role Activation</span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '2px 0 0 0' }}>
                Select Your Official Active Role Profile
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
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
            <X size={18} />
          </button>
        </div>

        {/* Guidance Context Box */}
        <div style={{
          margin: '18px 28px 0 28px',
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#fff' }}>
              Official Identity: <span style={{ color: 'var(--ghana-emerald)' }}>{session.fullName}</span> ({session.institution})
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              You have completed the initial onboarding guide. Selecting your active role will unlock all corresponding modules based on Ghana National AI Governance RBAC policy.
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(251, 191, 36, 0.15)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            color: '#fbbf24',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            Act 843 Verified
          </span>
        </div>

        {/* Role Options List */}
        <div style={{
          padding: '20px 28px',
          maxHeight: '380px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {roles.map((r) => {
            const isSelected = selectedRole === r.role;
            return (
              <div
                key={r.role}
                onClick={() => setSelectedRole(r.role)}
                style={{
                  padding: '14px 18px',
                  borderRadius: '12px',
                  background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(255, 255, 255, 0.07)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 0 20px rgba(16, 185, 129, 0.15)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      border: isSelected ? '5px solid var(--ghana-emerald)' : '2px solid rgba(255, 255, 255, 0.3)',
                      background: isSelected ? '#fff' : 'transparent',
                      transition: 'all 0.15s ease'
                    }} />
                    <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#fff' }}>
                      {r.title}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.68rem',
                    padding: '3px 8px',
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
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                  margin: '4px 0 8px 28px',
                  lineHeight: 1.4
                }}>
                  {r.desc}
                </p>

                {/* Modules Unlocked Pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginLeft: '28px' }}>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <CheckCircle2 size={12} className="text-emerald-400" />
                    Unlocks:
                  </span>
                  {r.unlockedModules.map(modId => (
                    <span
                      key={modId}
                      style={{
                        fontSize: '0.66rem',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-primary)',
                        border: '1px solid rgba(255, 255, 255, 0.08)'
                      }}
                    >
                      {MODULE_REGISTRY[modId]?.label || modId}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '18px 28px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: 'var(--text-secondary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Stay in Guided Onboarding
          </button>

          <button
            onClick={handleConfirm}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 24px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--ghana-emerald), #059669)',
              border: 'none',
              color: '#000',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.35)'
            }}
          >
            <span>Activate Selected Role Profile & Unlock Modules</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
