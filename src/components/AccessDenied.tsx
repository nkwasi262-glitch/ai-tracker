import React, { useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Lock, AlertTriangle, FileText } from 'lucide-react';
import { ActiveRole } from '../data/authTypes';
import { AppModuleId, MODULE_REGISTRY } from '../services/rbacPolicy';
import { recordAuditEvent } from '../services/auditService';

interface AccessDeniedProps {
  currentRole: ActiveRole;
  attemptedModule: AppModuleId;
  userName: string;
  userEmail: string;
  userInstitution: string;
  onNavigateHome: () => void;
  onRequestElevation?: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({
  currentRole,
  attemptedModule,
  userName,
  userEmail,
  userInstitution,
  onNavigateHome,
  onRequestElevation
}) => {
  const moduleInfo = MODULE_REGISTRY[attemptedModule] || {
    id: attemptedModule,
    label: attemptedModule,
    description: 'Restricted system module'
  };

  useEffect(() => {
    // Record immutable audit event for security monitoring
    recordAuditEvent({
      eventType: 'ACCESS_DENIED',
      actorName: userName || 'Unauthenticated User',
      actorEmail: userEmail || 'unknown@domain.com',
      actorRole: currentRole,
      actorInstitution: userInstitution || 'Unknown Institution',
      targetModule: attemptedModule,
      actionDetails: `Unauthorized navigation attempt to "${moduleInfo.label}" (${attemptedModule}). Denied under RBAC policy.`
    });
  }, [attemptedModule, currentRole, userName, userEmail, userInstitution, moduleInfo.label]);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '70vh',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '680px',
        width: '100%',
        background: 'linear-gradient(145deg, rgba(30, 20, 25, 0.95), rgba(17, 24, 39, 0.98))',
        border: '1px solid rgba(239, 68, 68, 0.35)',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 30px rgba(239, 68, 68, 0.1)',
        borderRadius: '16px',
        padding: '36px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Top Accent */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #ef4444, #f59e0b, #ef4444)'
        }} />

        {/* Icon & Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px', marginBottom: '24px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            flexShrink: 0
          }}>
            <ShieldAlert size={34} />
          </div>

          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              <Lock size={12} /> Statutory Clearance Required
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Access Denied: Restricted Module
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '6px', margin: 0 }}>
              You do not possess the statutory clearance required to view or execute actions in{' '}
              <strong style={{ color: '#fff' }}>{moduleInfo.label}</strong>.
            </p>
          </div>
        </div>

        {/* Security Incident Breakdown */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.35)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '16px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Your Active Role Profile
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f59e0b', marginTop: '3px' }}>
              {currentRole}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Attempted Target Module
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#ef4444', marginTop: '3px' }}>
              {moduleInfo.label} (`{attemptedModule}`)
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Managing Institution
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', marginTop: '3px' }}>
              {userInstitution || 'Public Citizen'}
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Audit Incident Status
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#10b981', marginTop: '3px' }}>
              Logged to Act 843 Trail
            </div>
          </div>
        </div>

        {/* Policy Warning Box */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '14px',
          borderRadius: '8px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          color: '#fef3c7',
          fontSize: '0.82rem',
          marginBottom: '28px',
          lineHeight: '1.4'
        }}>
          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
          <div>
            Under the Republic of Ghana National AI Projects Registry Governance Directive, role-based segregation of duties is strictly enforced. Attempts to access restricted clearance dossiers are recorded with your institutional identity, IP address, and timestamp.
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <button
            onClick={onNavigateHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'var(--ghana-emerald)',
              color: '#0b0f19',
              fontWeight: 700,
              fontSize: '0.85rem',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <ArrowLeft size={16} /> Return to Permitted Modules
          </button>

          {onRequestElevation && currentRole === 'Public User' && (
            <button
              onClick={onRequestElevation}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                cursor: 'pointer'
              }}
            >
              <FileText size={16} /> Switch Role / Verify Credentials
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
