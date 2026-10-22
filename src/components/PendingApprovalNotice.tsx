import React from 'react';
import { 
  Clock, 
  LayoutDashboard, 
  Map, 
  MessageSquareCode
} from 'lucide-react';
import { UserSession } from '../data/authTypes';

interface PendingApprovalNoticeProps {
  session: UserSession;
  targetModuleLabel?: string;
  onNavigate: (tab: string) => void;
  onSwitchRole: () => void;
}

export const PendingApprovalNotice: React.FC<PendingApprovalNoticeProps> = ({
  session,
  targetModuleLabel = 'This Module',
  onNavigate,
  onSwitchRole
}) => {
  return (
    <div style={{
      maxWidth: '820px',
      margin: '40px auto',
      background: 'linear-gradient(175deg, #111827 0%, #0c121e 100%)',
      borderRadius: '20px',
      border: '1px solid rgba(234, 179, 8, 0.4)',
      boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 35px rgba(234, 179, 8, 0.15)',
      overflow: 'hidden'
    }}>
      {/* Top National Ribbon */}
      <div style={{
        height: '5px',
        background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
      }} />

      <div style={{ padding: '40px 36px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px' }}>
        
        {/* Crest & Icon */}
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '18px',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto',
          color: 'var(--ghana-gold)'
        }}>
          <Clock size={32} />
        </div>

        <div>
          <span style={{
            fontSize: '0.74rem',
            padding: '4px 14px',
            borderRadius: '9999px',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            color: '#fde68a',
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            Module Access Restricted • Statutory Review In Progress
          </span>

          {/* Exact phrase requested */}
          <h2 style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            color: '#fff',
            marginTop: '16px',
            marginBottom: '8px',
            lineHeight: 1.3
          }}>
            Request pending will send you email when approved, THANK YOU
          </h2>

          <p style={{
            fontSize: '0.86rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            maxWidth: '560px',
            margin: '0 auto'
          }}>
            Access to <strong>{targetModuleLabel}</strong> is restricted while your institutional project registration is pending executive approval. Our technical clearance taskforce will review your submitted files and send a confirmation email to <strong style={{ color: '#fff' }}>{session.email}</strong> once approved.
          </p>
        </div>

        {/* Verification Summary Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid rgba(255, 255, 255, 0.07)',
          borderRadius: '12px',
          padding: '16px 20px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          textAlign: 'left'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Registered Officer
            </div>
            <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 700, marginTop: '2px' }}>
              {session.fullName}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Managing Institution
            </div>
            <div style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 700, marginTop: '2px' }}>
              {session.institution}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
              Statutory Status
            </div>
            <div style={{ fontSize: '0.84rem', color: 'var(--ghana-gold)', fontWeight: 700, marginTop: '2px' }}>
              Under NITA Review (Act 843)
            </div>
          </div>
        </div>

        {/* Accessible Modules Navigation */}
        <div style={{
          background: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#a7f3d0', marginBottom: '6px' }}>
            Available National Monitoring Modules
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 16px 0' }}>
            You have full permission to view the following monitoring services while your request is pending:
          </p>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'var(--ghana-emerald)',
                border: 'none',
                color: '#0b0f19',
                fontWeight: 800,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <LayoutDashboard size={16} />
              <span>M&E Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('gis')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <Map size={16} />
              <span>GIS Spatial Map</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '8px',
                background: 'rgba(234, 179, 8, 0.2)',
                border: '1px solid rgba(234, 179, 8, 0.4)',
                color: '#fde68a',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer'
              }}
            >
              <MessageSquareCode size={16} />
              <span>AI Chat Assistant</span>
            </button>
          </div>
        </div>

        <div>
          <button
            onClick={onSwitchRole}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.78rem',
              textDecoration: 'underline',
              cursor: 'pointer'
            }}
          >
            Sign Out / Return to Mandatory Gatekeeper
          </button>
        </div>

      </div>
    </div>
  );
};
