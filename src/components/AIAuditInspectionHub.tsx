import React, { useState, useEffect } from 'react';
import { 
  FileCheck2, 
  CheckCircle2, 
  PlusCircle, 
  RefreshCw, 
  Calendar, 
  ShieldCheck, 
  CheckSquare, 
  Square
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { AIProject } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';

interface AIAuditInspectionHubProps {
  projects: AIProject[];
  session: UserSession | null;
}

export const STATUTORY_AUDIT_CHECKLIST = [
  { id: 'chk_1', text: 'System architecture documentation & failover redundancy verified' },
  { id: 'chk_2', text: 'Act 843 Data Protection Officer (DPO) registration certificate on file' },
  { id: 'chk_3', text: 'Model explainability & cryptographic audit trails actively logging' },
  { id: 'chk_4', text: 'Incident response plan & emergency manual shutdown switch tested' },
  { id: 'chk_5', text: 'Cybersecurity vulnerability penetration scan reviewed (NITA Act 771)' },
  { id: 'chk_6', text: 'Human-in-the-loop manual override documented and operational' },
  { id: 'chk_7', text: 'Algorithmic bias and demographic disparate impact testing verified' },
  { id: 'chk_8', text: 'Sovereign data residency & local hosting verified within Ghana borders' }
];

export const AIAuditInspectionHub: React.FC<AIAuditInspectionHubProps> = ({
  projects,
  session
}) => {
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [selectedAudit, setSelectedAudit] = useState<any | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Audit Schedule State
  const [auditScope, setAuditScope] = useState('Annual Statutory AI Audit');
  const [auditProjectId, setAuditProjectId] = useState(projects[0]?.id || '');
  const [scheduledDate, setScheduledDate] = useState(new Date().toISOString().split('T')[0]);
  const [leadAuditor, setLeadAuditor] = useState(session?.fullName || 'NITA Senior Regulatory Auditor');

  // Audit Completion State
  const [auditVerdict, setAuditVerdict] = useState<'Compliant' | 'Minor Non-Conformance' | 'Major Non-Conformance'>('Compliant');
  const [auditFindingsText, setAuditFindingsText] = useState('');
  const [capaDeadline, setCapaDeadline] = useState('30 Days');

  const isAuthorized = session?.role === 'Super Admin' || session?.role === 'Technical Unit' || session?.role === 'Technical Director';

  const loadAudits = async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchAudits();
      setAudits(data || []);
      if (data && data.length > 0 && !selectedAudit) {
        setSelectedAudit(data[0]);
      }
    } catch (err) {
      console.error('[Audits] Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudits();
  }, []);

  const handleToggleChecklist = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleScheduleAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.scheduleAudit({
        projectId: auditProjectId,
        auditType: auditScope,
        scheduledDate,
        leadAuditor,
        checklist: STATUTORY_AUDIT_CHECKLIST.map(c => ({ id: c.id, text: c.text, checked: false }))
      });
      setFeedback('Statutory audit inspection scheduled and notified to managing MDA.');
      setShowScheduleModal(false);
      await loadAudits();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error scheduling audit');
    }
  };

  const completedChecksCount = Object.values(checkedItems).filter(Boolean).length;

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
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(2, 132, 199, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            <FileCheck2 size={26} className="text-emerald-400" />
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
              <span>NITA Statutory Regulatory Inspections Tier</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              AI Statutory Audit & Regulatory Inspection Hub
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Statutory verification of algorithmic governance, data protection, cybersecurity controls, and on-site regulatory compliance audits.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadAudits}
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
              onClick={() => setShowScheduleModal(true)}
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
              <span>Schedule Regulatory Audit</span>
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

      {/* Main Grid: Scheduled Audits & Inspection Checklist */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(360px, 1.4fr)', gap: '20px' }}>
        {/* Left Column: Scheduled Audits List */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} className="text-emerald-400" />
            <span>Inspection Schedules</span>
          </h2>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading audit schedules...
            </div>
          ) : audits.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No audits currently scheduled. Click "Schedule Regulatory Audit" to initiate.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
              {audits.map(a => {
                const isSelected = selectedAudit?.id === a.id;
                return (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAudit(a)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'rgba(2, 132, 199, 0.15)',
                        color: '#38bdf8',
                        fontWeight: 700
                      }}>
                        {a.audit_type || 'Annual Audit'}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Date: <strong style={{ color: '#fff' }}>{new Date(a.scheduled_date || Date.now()).toLocaleDateString()}</strong>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>
                      Audit Ref #{a.id} — Project {a.project_id}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lead: <strong style={{ color: '#e2e8f0' }}>{a.lead_auditor}</strong></span>
                      <span>Status: <strong style={{ color: a.status === 'completed' ? 'var(--ghana-emerald)' : '#fbbf24', textTransform: 'uppercase' }}>{a.status || 'scheduled'}</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: 8-Point Statutory Checklist & Findings */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {selectedAudit ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--ghana-emerald)', fontWeight: 800, textTransform: 'uppercase' }}>
                    Active Audit Evaluation Dossier
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '2px', margin: 0 }}>
                    {selectedAudit.audit_type} • Project {selectedAudit.project_id}
                  </h3>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Progress</div>
                  <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ghana-emerald)' }}>
                    {completedChecksCount} / {STATUTORY_AUDIT_CHECKLIST.length} Items
                  </div>
                </div>
              </div>

              {/* 8-Point Checklist */}
              <div>
                <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#e2e8f0', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Mandatory Statutory Checklist (NITA Act 771 & Act 843)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {STATUTORY_AUDIT_CHECKLIST.map((item, idx) => {
                    const isChecked = !!checkedItems[item.id];
                    return (
                      <div
                        key={item.id}
                        onClick={() => isAuthorized && handleToggleChecklist(item.id)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          background: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isChecked ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 255, 255, 0.06)'}`,
                          cursor: isAuthorized ? 'pointer' : 'default',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px'
                        }}
                      >
                        {isChecked ? (
                          <CheckSquare size={18} className="text-emerald-400" style={{ flexShrink: 0 }} />
                        ) : (
                          <Square size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        )}
                        <span style={{ fontSize: '0.8rem', color: isChecked ? '#fff' : 'var(--text-secondary)', fontWeight: isChecked ? 600 : 400 }}>
                          {idx + 1}. {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit Findings & Action Plan */}
              {isAuthorized && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                        Inspection Verdict
                      </label>
                      <select
                        value={auditVerdict}
                        onChange={e => setAuditVerdict(e.target.value as any)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                      >
                        <option value="Compliant">Compliant (All 8 Controls Verified)</option>
                        <option value="Minor Non-Conformance">Minor Non-Conformance (30-Day CAPA)</option>
                        <option value="Major Non-Conformance">Major Non-Conformance (Operations Suspended)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                        CAPA Remediation Deadline
                      </label>
                      <input
                        type="text"
                        value={capaDeadline}
                        onChange={e => setCapaDeadline(e.target.value)}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                      Auditor Notes & Corrective Directives
                    </label>
                    <textarea
                      rows={2}
                      value={auditFindingsText}
                      onChange={e => setAuditFindingsText(e.target.value)}
                      placeholder="Document on-site observations, DPO interview notes, and corrective action deadlines..."
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                    <button
                      onClick={() => setFeedback(`Audit #${selectedAudit.id} completed with verdict [${auditVerdict}].`)}
                      style={{
                        padding: '8px 20px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Sign Off Inspection Report
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select an audit from the left to inspect its 8-point checklist and sign-off records.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Schedule Audit */}
      {showScheduleModal && (
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
                <Calendar size={18} className="text-emerald-400" />
                <span>Schedule Statutory AI Audit</span>
              </div>
              <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleScheduleAudit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Target AI Project</label>
                <select
                  value={auditProjectId}
                  onChange={e => setAuditProjectId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.mda})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Audit Scope</label>
                <select
                  value={auditScope}
                  onChange={e => setAuditScope(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="Annual Statutory AI Audit">Annual Statutory AI Audit (Comprehensive)</option>
                  <option value="Pre-Deployment Regulatory Check">Pre-Deployment Regulatory Check (Go-Live Gate)</option>
                  <option value="Post-Incident Forensic Inspection">Post-Incident Forensic Inspection</option>
                  <option value="Act 843 Data Sovereignty Audit">Act 843 Data Sovereignty Audit</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Scheduled Date</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Lead Auditor</label>
                  <input
                    type="text"
                    required
                    value={leadAuditor}
                    onChange={e => setLeadAuditor(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowScheduleModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Schedule Audit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
