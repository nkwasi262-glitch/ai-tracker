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
  Users
} from 'lucide-react';
import { UserSession } from '../data/authTypes';
import { HeaderProfile } from './HeaderProfile';
import { AppModuleId, canAccessModule } from '../services/rbacPolicy';

interface LayoutProps {
  session: UserSession;
  onSwitchRole: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ 
  session, 
  onSwitchRole, 
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
    { id: 'users', label: 'User Management', icon: <Users size={18} /> },
    { id: 'chat', label: 'AI Chat Assistant', icon: <MessageSquareCode size={18} /> }
  ];

  // Restricts viewing tabs strictly according to active role permissions in policy engine
  const filteredMenuItems = menuItems.filter(item => {
    return canAccessModule(session.role, item.id);
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
            Authorized Modules
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
            <span>Security Gate: Act 843</span>
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
            <HeaderProfile 
              session={session} 
              onSwitchRole={onSwitchRole} 
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
