import React, { useState } from 'react';
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
  MessageSquare,
  ShieldAlert,
  LogOut,
  Lock,
  Clock,
  ArrowDownLeft,
  Cpu,
  Scale,
  FileCheck2,
  Building,
  BarChart3,
  GitBranch,
  Search
} from 'lucide-react';
import { UserSession, ActiveRole } from '../data/authTypes';
import { HeaderProfile } from './HeaderProfile';
import { PageAuditLogModal } from './PageAuditLogModal';
import { AppModuleId, canAccessModule } from '../services/rbacPolicy';

interface LayoutProps {
  session: UserSession;
  onSwitchRole: () => void;
  onOpenRoleSelector?: () => void;
  onSelectRole?: (role: ActiveRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  session, 
  onSwitchRole, 
  onOpenRoleSelector,
  onSelectRole,
  activeTab, 
  setActiveTab, 
  children 
}) => {
  const [showPageAuditModal, setShowPageAuditModal] = useState(false);
  const [navSearch, setNavSearch] = useState('');

  // Structured statutory functional groups for GN-AIRGMS (de-crowded architecture)
  const navGroups: {
    category: string;
    items: { id: AppModuleId; label: string; icon: React.ReactNode }[];
  }[] = [
    {
      category: 'Executive & Transparency',
      items: [
        { id: 'dashboard', label: 'M&E Dashboard', icon: <LayoutDashboard size={16} /> },
        { id: 'analytics_hub', label: 'Executive Analytics', icon: <BarChart3 size={16} /> },
        { id: 'public_portal', label: 'Public Transparency', icon: <Globe size={16} /> }
      ]
    },
    {
      category: 'Clearance & Lifecycle',
      items: [
        { id: 'workflow_lifecycle', label: '8-Step Lifecycle', icon: <GitBranch size={16} /> },
        { id: 'tcs_referrals', label: 'TCS Referral Queue', icon: <ArrowDownLeft size={16} /> },
        { id: 'registry', label: 'Project Registry', icon: <FilePlus2 size={16} /> },
        { id: 'assessments', label: '12-Domain Assessment', icon: <Scale size={16} /> }
      ]
    },
    {
      category: 'Oversight & Monitoring',
      items: [
        { id: 'models_datasets', label: 'Models & Datasets', icon: <Cpu size={16} /> },
        { id: 'incidents', label: 'AI Incident Center', icon: <AlertOctagon size={16} /> },
        { id: 'audits_hub', label: 'Audits & Inspections', icon: <FileCheck2 size={16} /> },
        { id: 'vendors', label: 'Vendor Oversight', icon: <Building size={16} /> },
        { id: 'gis', label: 'GIS Spatial Map', icon: <Map size={16} /> }
      ]
    },
    {
      category: 'Governance & Operations',
      items: [
        { id: 'governance', label: 'Governance & Ethics', icon: <ShieldCheck size={16} /> },
        { id: 'readiness', label: 'AI Readiness', icon: <Award size={16} /> },
        { id: 'risk', label: 'Risk Matrix', icon: <ShieldAlert size={16} /> },
        { id: 'documents', label: 'Documents & OCR', icon: <Files size={16} /> },
        { id: 'finance', label: 'Financial Suite', icon: <DollarSign size={16} /> },
        { id: 'reports', label: 'Internal Reports', icon: <MessageSquare size={16} /> },
        { id: 'audit', label: 'Audit Trail', icon: <ShieldCheck size={16} /> },
        { id: 'chat', label: 'AI Chat Assistant', icon: <MessageSquareCode size={16} /> }
      ]
    }
  ];

  const isPendingApproval = session.onboardingStatus === 'pending_approval';

  // Filter groups and items based on role access and quick-search query
  const filteredGroups = navGroups.map(group => {
    const accessibleItems = group.items.filter(item => {
      const permitted = isPendingApproval || canAccessModule(session.role, item.id);
      if (!permitted) return false;
      if (!navSearch.trim()) return true;
      const q = navSearch.toLowerCase();
      return item.label.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
    });
    return { ...group, items: accessibleItems };
  }).filter(group => group.items.length > 0);

  return (
    <div className="layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ padding: '18px 16px' }}>
          <div className="sidebar-logo" style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 900,
            fontSize: '0.88rem',
            letterSpacing: '0.04em',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
            flexShrink: 0
          }}>
            AI
          </div>
          <div>
            <div className="sidebar-logo-text" style={{ fontSize: '1.02rem', fontWeight: 800, letterSpacing: '0.03em', color: '#f8fafc' }}>
              GN-AIRGMS
            </div>
            <div style={{ fontSize: '0.62rem', color: '#94a3b8', fontWeight: 700, letterSpacing: '0.06em' }}>
              REPUBLIC OF GHANA • NITA
            </div>
          </div>
        </div>

        {/* Quick Module Filter Input to Eliminate Visual Crowding */}
        <div style={{ padding: '8px 12px 4px 12px' }}>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', color: '#64748b', pointerEvents: 'none' }} />
            <input
              type="text"
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              placeholder="Quick find module..."
              style={{
                width: '100%',
                padding: '5px 8px 5px 26px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.7)',
                border: '1px solid rgba(51, 65, 85, 0.6)',
                color: '#f8fafc',
                fontSize: '0.74rem',
                outline: 'none'
              }}
            />
          </div>
        </div>

        <nav className="sidebar-menu" style={{ padding: '6px 10px', gap: '2px' }}>
          {filteredGroups.length === 0 ? (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: '#64748b', fontSize: '0.76rem' }}>
              No modules match "{navSearch}"
            </div>
          ) : (
            filteredGroups.map((group) => (
              <div key={group.category} style={{ marginBottom: '8px' }}>
                <div style={{
                  padding: '6px 8px 3px 8px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b'
                }}>
                  {group.category}
                </div>
                {group.items.map((item) => {
                  const isLockedForPending = isPendingApproval && !['dashboard', 'gis', 'chat', 'public_portal'].includes(item.id);
                  const isActive = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`menu-item ${isActive ? 'active' : ''}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        marginBottom: '2px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        opacity: isLockedForPending ? 0.75 : 1,
                        background: isActive ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                        color: isActive ? '#34d399' : '#cbd5e1'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {item.icon}
                        <span style={{ fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
                      </div>
                      {isLockedForPending && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.58rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.16)',
                          border: '1px solid rgba(239, 68, 68, 0.42)',
                          color: '#fca5a5',
                          fontWeight: 800
                        }}>
                          <Lock size={9} />
                          <span>Lock</span>
                        </span>
                      )}
                      {session.role === 'Public User' && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px',
                          fontSize: '0.58rem',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: 'rgba(16, 185, 129, 0.12)',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                          color: '#a7f3d0',
                          fontWeight: 700
                        }}>
                          <Lock size={8} />
                          <span>View</span>
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </nav>

        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fiscal Year: 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Security Gate: Act 843</span>
          </div>

          {/* Visible Sign Out Action in Sidebar */}
          <button
            onClick={onSwitchRole}
            title="Sign out of GN-AIRGMS and return to Mandatory Gatekeeper"
            style={{
              marginTop: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#fca5a5',
              fontSize: '0.74rem',
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
            <LogOut size={13} className="text-red-400" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="main-container">
        {/* Dynamic Header */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.3rem' }}>🇬🇭</span>
            <div className="top-bar-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#10b981', fontWeight: 800, letterSpacing: '0.03em' }}>GN-AIRGMS</span>
              <span style={{ opacity: 0.35, color: '#94a3b8' }}>•</span>
              <span style={{ fontSize: '0.86rem', color: '#e2e8f0', fontWeight: 600 }}>
                National AI Registry, Governance, Regulatory & Monitoring System
              </span>
            </div>
          </div>

          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowPageAuditModal(true)}
              title="Inspect Act 843 immutable forensic audit log for this page"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: 'rgba(51, 65, 85, 0.45)',
                border: '1px solid #334155',
                color: '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.color = '#38bdf8'; e.currentTarget.style.borderColor = '#0284c7'; }}
              onMouseOut={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#334155'; }}
            >
              <ShieldCheck size={14} style={{ color: '#34d399' }} />
              <span>Page Audit Trail</span>
            </button>

            <HeaderProfile 
              session={session} 
              onSwitchRole={onSwitchRole} 
              onOpenRoleSelector={onOpenRoleSelector}
              onSelectRole={onSelectRole}
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
                    Request pending you will receive an email when approved, THANK YOU
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    Your project documents are under statutory review. You have active monitoring access to the <strong>M&E Dashboard</strong>, <strong>GIS Spatial Map</strong>, and <strong>AI Chat Assistant</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {children}
        </main>
      </div>

      <PageAuditLogModal
        isOpen={showPageAuditModal}
        onClose={() => setShowPageAuditModal(false)}
        activeModule={activeTab}
        session={session}
      />
    </div>
  );
};
