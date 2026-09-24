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
  Building2,
  FileCheck
} from 'lucide-react';
import { UserRole, RoleSwitcher } from './RoleSwitcher';

interface LayoutProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  currentRole, 
  onRoleChange, 
  activeTab, 
  setActiveTab, 
  children 
}) => {
  
  // Navigation tabs with role filter flags aligned with NAPTCS Scope of Work
  const menuItems = [
    { id: 'dashboard', label: 'NAPTCS Analytics & M&E', icon: <LayoutDashboard />, public: true },
    { id: 'organizations', label: 'Organization Clearance', icon: <Building2 />, public: false },
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

  return (
    <div className="layout-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
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

        <nav className="sidebar-menu">
          <div style={{ padding: '0 12px 8px 12px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
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
          padding: '20px',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Clearance Cycle: 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>NAPTCS Portal V2.10</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <div className="main-container">
        {/* Dynamic Header */}
        <header className="top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.4rem' }}>🇬🇭</span>
            <div>
              <div className="top-bar-title" style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                National AI Project Tracking and Clearance System (NAPTCS)
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                Statutory Oversight for Government (MDAs/SOEs) & Private Sector AI Systems • Act 843 Conformance
              </div>
            </div>
          </div>
          <div className="top-bar-right">
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
