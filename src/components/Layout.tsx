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
  Globe
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
  
  // Navigation tabs with role filter flags
  const menuItems = [
    { id: 'dashboard', label: 'M&E Dashboard', icon: <LayoutDashboard />, public: true },
    { id: 'registry', label: 'Project Registry', icon: <FilePlus2 />, public: false },
    { id: 'gis', label: 'GIS Spatial Map', icon: <Map />, public: true },
    { id: 'governance', label: 'Governance & Ethics', icon: <ShieldCheck />, public: false },
    { id: 'readiness', label: 'AI Readiness', icon: <Award />, public: false },
    { id: 'risk', label: 'Risk Matrix', icon: <AlertOctagon />, public: false },
    { id: 'documents', label: 'Documents & OCR', icon: <Files />, public: false },
    { id: 'chat', label: 'AI Chat Assistant', icon: <MessageSquareCode />, public: true }
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
            Modules
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Fiscal Year: 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>Registry V1.04</span>
          </div>
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
            <RoleSwitcher 
              currentRole={currentRole} 
              onRoleChange={(newRole) => {
                onRoleChange(newRole);
                // Resets active tab to dashboard if moving from administrator to public role
                if (newRole === 'Public User' && !['dashboard', 'gis', 'chat'].includes(activeTab)) {
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
