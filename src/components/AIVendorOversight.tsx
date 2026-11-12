import React, { useState, useEffect } from 'react';
import { 
  Building, 
  ShieldCheck, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2 
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { UserSession } from '../data/authTypes';

interface AIVendorOversightProps {
  session: UserSession | null;
}

export const AIVendorOversight: React.FC<AIVendorOversightProps> = ({
  session
}) => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Vendor Form
  const [vendorName, setVendorName] = useState('');
  const [vendorCategory, setVendorCategory] = useState('Foundation Model & Cloud API Provider');
  const [countryOfOrigin, setCountryOfOrigin] = useState('United States');
  const [sovereignResidency, setSovereignResidency] = useState(true);
  const [lockInRisk, setLockInRisk] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const slaUptime = '99.9%';
  const [accreditationStatus, setAccreditationStatus] = useState<'Accredited' | 'Conditional' | 'Under Review'>('Accredited');

  const isAuthorized = session?.role === 'Super Admin' || session?.role === 'Technical Unit' || session?.role === 'Technical Director';

  const loadVendors = async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchVendors();
      setVendors(data || []);
    } catch (err) {
      console.error('[Vendors] Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.registerVendor({
        vendorName,
        category: vendorCategory,
        countryOfOrigin,
        dataResidencyVerified: sovereignResidency,
        accreditationStatus,
        lockInRiskScore: lockInRisk === 'LOW' ? 25 : lockInRisk === 'MEDIUM' ? 55 : 85,
        slaUptime
      });
      setFeedback(`Vendor [${vendorName}] registered in NITA AI Vendor Risk Register.`);
      setShowAddModal(false);
      setVendorName('');
      await loadVendors();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error registering vendor');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(13, 18, 31, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.28)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(99, 102, 241, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            <Building size={26} className="text-emerald-400" />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ghana-emerald)',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '3px'
            }}>
              <ShieldCheck size={14} />
              <span>National Supply Chain & Sovereign Oversight</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              AI Vendor & Third-Party Technology Oversight
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Accreditation, sovereign data residency vetting, lock-in risk scoring, and SLA monitoring for all third-party AI technology providers.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadVendors}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>

          {isAuthorized && (
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)'
              }}
            >
              <PlusCircle size={15} />
              <span>Accredit New AI Vendor</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          color: '#a7f3d0',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={16} />
          <span>{feedback}</span>
        </div>
      )}

      {/* Vendors Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '18px' }}>
        {loading ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            Loading vendor accreditation directory...
          </div>
        ) : vendors.length === 0 ? (
          <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
            No vendors registered. Click "Accredit New AI Vendor" to add third-party providers.
          </div>
        ) : (
          vendors.map(v => (
            <div key={v.id} className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: v.accreditation_status === 'Accredited' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(245, 158, 11, 0.18)',
                  color: v.accreditation_status === 'Accredited' ? '#a7f3d0' : '#fde047',
                  border: `1px solid ${v.accreditation_status === 'Accredited' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                }}>
                  {v.accreditation_status || 'Accredited'}
                </span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  Origin: <strong style={{ color: '#fff' }}>{v.country_of_origin}</strong>
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {v.vendor_name}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  {v.category || 'Foundation Model Provider'}
                </div>
              </div>

              {/* Attributes */}
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.76rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Sovereign Data Residency:</span>
                  <strong style={{ color: v.data_residency_verified ? 'var(--ghana-emerald)' : '#fca5a5' }}>
                    {v.data_residency_verified ? 'Verified (Ghana Borders)' : 'Pending Certification'}
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Vendor Lock-in Risk:</span>
                  <strong style={{ color: v.lock_in_risk_score < 40 ? 'var(--ghana-emerald)' : '#fbbf24' }}>
                    {v.lock_in_risk_score < 40 ? 'LOW RISK' : 'MEDIUM RISK'} ({v.lock_in_risk_score || 45}/100)
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>SLA Performance Guarantee:</span>
                  <strong style={{ color: '#38bdf8' }}>{v.sla_uptime || '99.9%'} Uptime</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Accredit New Vendor */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.88)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            background: '#111827',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building size={18} className="text-emerald-400" />
                <span>Accredit AI Vendor / Provider</span>
              </div>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleRegisterVendor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Vendor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Cloud Vertex AI, OpenAI, or Minimax"
                  value={vendorName}
                  onChange={e => setVendorName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Category</label>
                  <input
                    type="text"
                    value={vendorCategory}
                    onChange={e => setVendorCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Country of Origin</label>
                  <input
                    type="text"
                    value={countryOfOrigin}
                    onChange={e => setCountryOfOrigin(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Lock-in Risk Rating</label>
                  <select
                    value={lockInRisk}
                    onChange={e => setLockInRisk(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="LOW">LOW (Open weights / portable format)</option>
                    <option value="MEDIUM">MEDIUM (Standard cloud API / some lock-in)</option>
                    <option value="HIGH">HIGH (Proprietary walled garden)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Accreditation Status</label>
                  <select
                    value={accreditationStatus}
                    onChange={e => setAccreditationStatus(e.target.value as any)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="Accredited">Accredited (Full Clearance)</option>
                    <option value="Conditional">Conditional (Restricted Tier)</option>
                    <option value="Under Review">Under Review</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
                <input
                  type="checkbox"
                  id="residencyCheck"
                  checked={sovereignResidency}
                  onChange={e => setSovereignResidency(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--ghana-emerald)' }}
                />
                <label htmlFor="residencyCheck" style={{ fontSize: '0.78rem', color: '#a7f3d0', cursor: 'pointer' }}>
                  Vendor guarantees sovereign data residency within Ghana borders or compliant Act 843 cross-border agreement.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Save Vendor Accreditation</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
