import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { UserSession } from '../data/authTypes';

interface SignOutConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  session: UserSession | null;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  session
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(2, 6, 23, 0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999999,
        padding: '24px 16px',
        overflowY: 'auto'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        style={{
          background: 'linear-gradient(175deg, #131d2e 0%, #0b111c 100%)',
          border: '1px solid rgba(239, 68, 68, 0.55)',
          borderRadius: '18px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 70px -10px rgba(0, 0, 0, 0.95), 0 0 50px rgba(239, 68, 68, 0.3)',
          overflow: 'hidden',
          position: 'relative',
          animation: 'fadeInScale 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Ghana National Tricolor Ribbon */}
        <div
          style={{
            height: '5px',
            background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
          }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          style={{
            position: 'absolute',
            top: '14px',
            right: '14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          title="Cancel"
        >
          <X size={16} />
        </button>

        {/* Modal Body */}
        <div style={{ padding: '28px 28px 26px 28px' }}>
          
          {/* Header Row with Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '14px',
                background: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                boxShadow: '0 0 24px rgba(239, 68, 68, 0.35)',
                flexShrink: 0
              }}
            >
              <LogOut size={28} />
            </div>
            <div>
              <div
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#f87171',
                  marginBottom: '3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                <AlertTriangle size={12} />
                <span>Statutory Session Termination • Act 843</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', margin: 0, letterSpacing: '-0.01em' }}>
                Sign Out of GNAPRMS?
              </h3>
            </div>
          </div>

          {/* Identity Context */}
          {session && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                marginBottom: '16px',
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5
              }}
            >
              <div>
                Active Official: <strong style={{ color: '#fff' }}>{session.fullName}</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Institution: <strong style={{ color: '#e2e8f0' }}>{session.institution}</strong> • Role: <span style={{ color: '#fbbf24', fontWeight: 700 }}>{session.role}</span>
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                Institutional Email: {session.email}
              </div>
            </div>
          )}

          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '0 0 24px 0', lineHeight: 1.55 }}>
            Signing out will safely terminate your active session and record a statutory audit event under the <strong>Ghana Data Protection Act (Act 843)</strong>. You will be redirected back to the Mandatory Gatekeeper.
          </p>

          {/* Action Buttons with prominent 'Yes, Sign Out' button */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                color: 'var(--text-secondary)',
                fontSize: '0.84rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Cancel / Stay
            </button>

            <button
              type="button"
              onClick={onConfirm}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '11px 24px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                border: '1px solid rgba(239, 68, 68, 0.8)',
                color: '#fff',
                fontSize: '0.88rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(239, 68, 68, 0.55)',
                transition: 'all 0.15s ease'
              }}
            >
              <LogOut size={16} />
              <span>Yes, Sign Out</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

