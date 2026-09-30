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
  FileCheck
} from 'lucide-react';
import { UserRole, RoleSwitcher } from './RoleSwitcher';

interface LayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onReturnToHome: () => void;
  onOpenAuditLog: () => void;
  logCount?: number;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentRole, 
  onRoleChange, 
  activeTab, 
  setActiveTab, 
  onReturnToHome,
  onOpenAuditLog,
  logCount = 0,
  children 
}) => {
  
  // Navigation tabs with role filter flags aligned with NAPTCS Scope of Work
  const menuItems = [
    { id: 'dashboard', label: 'NAPTCS Analytics & M&E', icon: <LayoutDashboard />, public: true },
    { id: 'registry', label: 'AI Projects Registry', icon: <FilePlus2 />, public: false },
    { id: 'verification', label: 'Public Verification Portal', icon: <FileCheck />, public: true },
    { id: 'gis', label: 'GIS Spatial Map', icon: <Map />, public: true },
    { id: 'governance', label: 'Governance & Ethics (Act 843)', icon: <ShieldCheck />, public: false },
    { id: 'readiness', label: 'AI Readiness & Scoring', icon: <Award />, public: false },
    { id: 'risk', label: 'Risk Matrix & Tiers', icon: <AlertOctagon />, public: false },
    { id: 'documents', label: 'Document Vault & OCR', icon: <Files />, public: false },
    { id: 'chat', label: 'Regulator AI Assistant', icon: <MessageSquareCode />, public: true }
  ];

  // Restricts viewing tabs if public user tries to access internal modules
  const filteredMenuItems = menuItems.filter(item => {
    if (currentRole === 'Public User') {
      return item.public;
    }
    return true;
  });

  const currentModule = menuItems.find(m => m.id === activeTab);

  return (
    <div className="layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header" style={{ cursor: 'pointer' }} onClick={onReturnToHome} title="Click to return to National Gateway">
          <div className="sidebar-logo" style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)', letterSpacing: '0.05em' }}>
            NAPT
          </div>
          <div>
            <div className="sidebar-logo-text" style={{ fontSize: '0.96rem', letterSpacing: '0.04em' }}>NAPTCS</div>
            <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.06em' }}>
              REPUBLIC OF GHANA
            </div>
          </div>
        </div>

        {/* 1-Click Return to Main Landing Gateway Button in Sidebar */}
        <div style={{ padding: '12px 14px 6px 14px' }}>
          <button
            onClick={onReturnToHome}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              backgroundColor: 'rgba(5, 150, 105, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: '10px',
              color: '#34d399',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textAlign: 'left'
            }}
            title="Return to the Main Technical Clearance Gateway"
          >
            <span style={{ fontSize: '1.05rem' }}>🏠</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span>Main Gateway</span>
              <span style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 500 }}>Return to Landing Page</span>
            </div>
          </button>
        </div>

        <nav className="sidebar-menu">
          <div style={{ padding: '8px 12px 6px 12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
            NAPTCS Modules
          </div>
          {filteredMenuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </nav>

        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <button
            onClick={onOpenAuditLog}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#cbd5e1',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '6px'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>📜</span> Page Audit Log
            </span>
            <span style={{ background: '#047857', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px' }}>
              {logCount}
            </span>
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clearance Cycle: 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>NAPTCS Portal V2.10</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="main-container">
        {/* Dynamic Header */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            {/* 1-Click Back to Main Page Button */}
            <button
              onClick={onReturnToHome}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(5, 150, 105, 0.2)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                color: '#6ee7b7',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
              }}
              title="Return to the Main Technical Clearance Gateway"
            >
              <span>←</span>
              <span>Back to National Gateway</span>
            </button>

            {/* Breadcrumb Trail */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
              <span 
                onClick={onReturnToHome}
                style={{ color: '#94a3b8', cursor: 'pointer', fontWeight: 600 }}
                className="hover:text-emerald-400"
              >
                National Gateway
              </span>
              <span style={{ color: '#475569' }}>/</span>
              <span style={{ color: '#ffffff', fontWeight: 700 }}>
                {currentModule?.label || activeTab}
              </span>
            </div>
          </div>

          <div className="top-bar-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Top Bar Audit Log Button */}
            <button
              onClick={onOpenAuditLog}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#cbd5e1',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="View full audit trail across all pages"
            >
              <span>📜 Page Logs</span>
              <span style={{ background: '#059669', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '999px' }}>
                {logCount}
              </span>
            </button>

            <RoleSwitcher 
              currentRole={currentRole} 
              onRoleChange={(newRole) => {
                onRoleChange(newRole);
                // Resets active tab to dashboard if moving to public role and on restricted tab
                if (newRole === 'Public User' && !['dashboard', 'verification', 'gis', 'chat'].includes(activeTab)) {
                  setActiveTab('dashboard');
                }
              }} 
            />
          </div>
        </header>

        {/* Dynamic Component Canvas */}
        <main className="content-viewport animated-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
};
