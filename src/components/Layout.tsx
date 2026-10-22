import React from 'react';
import { 
  LayoutDashboard, 
  FilePlus2, 
  Map, 
  ShieldCheck, 
  Award, 
  AlertOctagon, 
  Files, 
  MessageSquareCode, 
  Calendar, 
  Globe,
  DollarSign,
  FileCheck2,
  MessageSquare,
  ShieldAlert,
  Sparkles,
  LogOut,
  Lock,
  Clock
} from 'lucide-react';
import { UserSession } from '../data/authTypes';
import { HeaderProfile } from './HeaderProfile';
import { AppModuleId, canAccessModule } from '../services/rbacPolicy';

interface LayoutProps {
  session: UserSession;
  onSwitchRole: () => void;
  onOpenRoleSelector?: () => void;
  onOpenOnboardingHub?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  session, 
  onSwitchRole, 
  onOpenRoleSelector,
  onOpenOnboardingHub,
  activeTab, 
  setActiveTab, 
  children 
}) => {
  // Navigation tabs definition
  const menuItems: { id: AppModuleId; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'M&E Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'registry', label: 'Project Registry', icon: <FilePlus2 size={18} /> },
    { id: 'gis', label: 'GIS Spatial Map', icon: <Map size={18} /> },
    { id: 'governance', label: 'Governance & Ethics', icon: <ShieldCheck size={18} /> },
    { id: 'readiness', label: 'AI Readiness', icon: <Award size={18} /> },
    { id: 'risk', label: 'Risk Matrix', icon: <AlertOctagon size={18} /> },
    { id: 'documents', label: 'Documents & OCR', icon: <Files size={18} /> },
    { id: 'dg_queue', label: 'DG Decision Queue', icon: <FileCheck2 size={18} /> },
    { id: 'finance', label: 'Financial Suite', icon: <DollarSign size={18} /> },
    { id: 'reports', label: 'Internal Reports', icon: <MessageSquare size={18} /> },
    { id: 'audit', label: 'Audit Trail', icon: <ShieldAlert size={18} /> },
    { id: 'chat', label: 'AI Chat Assistant', icon: <MessageSquareCode size={18} /> }
  ];

  // For pending_approval users, ALL 12 modules remain visible in navigation. Non-monitoring modules show a lock badge and route to pending approval notice.
  const isPendingApproval = session.onboardingStatus === 'pending_approval';

  const displayedMenuItems = isPendingApproval 
    ? menuItems 
    : menuItems.filter(item => canAccessModule(session.role, item.id));

  return (
    <div className="layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">GN</div>
          <div>
            <div className="sidebar-logo-text">GNAPRMS</div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em' }}>
              REPUBLIC OF GHANA
            </div>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div style={{ padding: '0 12px 8px 12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            {isPendingApproval ? 'All System Modules' : 'Authorized Modules'}
          </div>
          {displayedMenuItems.map((item) => {
            const isLockedForPending = isPendingApproval && !['dashboard', 'gis', 'chat'].includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  opacity: isLockedForPending ? 0.78 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isLockedForPending && (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '0.62rem',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.35)',
                    color: '#fde68a',
                    fontWeight: 700
                  }}>
                    <Lock size={10} />
                    <span>Pending</span>
                  </span>
                )}
              </div>
            );
          })}
        </nav>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fiscal Year: 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security Gate: Act 843</span>
          </div>

          {/* Visible Sign Out Action in Sidebar */}
          <button
            onClick={onSwitchRole}
            title="Sign out of GNAPRMS and return to Mandatory Gatekeeper"
            style={{
              marginTop: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.18s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.6)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              e.currentTarget.style.color = '#fca5a5';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
            }}
          >
            <LogOut size={14} className="text-red-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="main-container">
        {/* Dynamic Header */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🇬🇭</span>
            <div className="top-bar-title">
              National AI Projects Registry & Monitoring System
            </div>
          </div>
          <div className="top-bar-right">
            <HeaderProfile 
              session={session} 
              onSwitchRole={onSwitchRole} 
              onOpenRoleSelector={onOpenRoleSelector}
            />
          </div>
        </header>

        {/* Dynamic Component Canvas */}
        <main className="content-viewport animated-fade-in">
          {/* Pending Approval Officer Banner */}
          {isPendingApproval && (
            <div style={{
              margin: '0 0 20px 0',
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.14), rgba(16, 185, 129, 0.1))',
              border: '1px solid rgba(234, 179, 8, 0.45)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'rgba(234, 179, 8, 0.2)',
                  border: '1px solid rgba(234, 179, 8, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  flexShrink: 0
                }}>
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fde68a' }}>
                    Request pending will send you email when approved, THANK YOU
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Your project documents are under statutory review. You have active monitoring access to the <strong>M&E Dashboard</strong>, <strong>GIS Spatial Map</strong>, and <strong>AI Chat Assistant</strong>.
                  </div>
                </div>
              </div>

              {onOpenOnboardingHub && (
                <button
                  onClick={onOpenOnboardingHub}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(234, 179, 8, 0.15)',
                    border: '1px solid rgba(234, 179, 8, 0.4)',
                    color: '#fde68a',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Sparkles size={13} />
                  <span>View Graded Dossier</span>
                </button>
              )}
            </div>
          )}

          {session.role === 'First-Timer / New User' && !isPendingApproval && (
            <div style={{
              margin: '0 0 20px 0',
              padding: '14px 20px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.12), rgba(16, 185, 129, 0.1))',
              border: '1px solid rgba(251, 191, 36, 0.35)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  flexShrink: 0
                }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#fde68a' }}>
                    First-Timer Onboarding Mode: Guided Services Active
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    You have guided access to <strong>Documents & OCR</strong> (upload required compliance files), <strong>AI Readiness</strong>, and <strong>Governance & Ethics</strong>. Access to select an Active Role Profile is restricted during onboarding; Super Admin audits uploaded documents, auto-generates governance & readiness ratings, and decides project registration.
                  </div>
                </div>
              </div>

              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.35)',
                color: '#fde68a',
                fontSize: '0.78rem',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}>
                <Lock size={14} className="text-amber-400" />
              </div>
            </div>
          )}

          {children}
        </main>
      </div>
    </div>
  );
};
