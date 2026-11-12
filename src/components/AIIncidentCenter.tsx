import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  PlusCircle, 
  RefreshCw, 
  Activity 
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { AIProject } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';

interface AIIncidentCenterProps {
  projects: AIProject[];
  session: UserSession | null;
}

export const AIIncidentCenter: React.FC<AIIncidentCenterProps> = ({
  projects,
  session
}) => {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [selectedIncident, setSelectedIncident] = useState<any | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Incident Form State
  const [incTitle, setIncTitle] = useState('');
  const [incProjectId, setIncProjectId] = useState(projects[0]?.id || '');
  const [incCategory, setIncCategory] = useState('Hallucination / Erroneous Output');
  const [incSeverity, setIncSeverity] = useState('P2');
  const [incDescription, setIncDescription] = useState('');
  const [incContainment, setIncContainment] = useState('');

  // Status Update State
  const [updateStatus, setUpdateStatus] = useState<string>('investigating');
  const [rootCauseNotes, setRootCauseNotes] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const isAuthorized = session?.role === 'Super Admin' || session?.role === 'Technical Unit' || session?.role === 'Technical Director';

  const loadIncidents = async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchIncidents();
      setIncidents(data || []);
      if (data && data.length > 0 && !selectedIncident) {
        setSelectedIncident(data[0]);
      }
    } catch (err) {
      console.error('[Incidents] Error loading:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.reportIncident({
        projectId: incProjectId,
        title: incTitle,
        category: incCategory,
        severity: incSeverity,
        description: incDescription,
        immediateAction: incContainment,
        reportedBy: session?.fullName || 'Monitoring Officer'
      });
      setFeedback('Incident report logged and assigned statutory investigation reference.');
      setShowReportModal(false);
      setIncTitle('');
      setIncDescription('');
      await loadIncidents();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error reporting incident');
    }
  };

  const handleUpdateIncidentStatus = async () => {
    if (!selectedIncident) return;
    setIsUpdating(true);
    try {
      await apiClient.updateIncident(selectedIncident.id, {
        status: updateStatus,
        rootCause: rootCauseNotes || selectedIncident.root_cause,
        resolutionSummary: updateStatus === 'resolved' ? 'Mitigations verified and regression tested.' : undefined
      });
      setFeedback(`Incident #${selectedIncident.id} status updated to [${updateStatus.toUpperCase()}].`);
      await loadIncidents();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error updating incident');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredIncidents = incidents.filter(inc => {
    if (severityFilter === 'all') return true;
    return inc.severity === severityFilter;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header Banner */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(13, 18, 31, 0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
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
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            <ShieldAlert size={26} className="text-red-400" />
          </div>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#f87171',
              fontSize: '0.75rem',
              fontWeight: 800,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '3px'
            }}>
              <AlertTriangle size={14} />
              <span>National Safety & Trust Center • Continuous Surveillance</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              AI Incident, Drift & Complaint Center
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Central repository for algorithmic anomalies, safety breaches, model degradation, public complaints, and Corrective Action Plans (CAPA).
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadIncidents}
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
              onClick={() => setShowReportModal(true)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)'
              }}
            >
              <PlusCircle size={15} />
              <span>Log New AI Incident</span>
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

      {/* KPI Severity Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171' }}>
            <AlertOctagon size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {incidents.filter(i => i.severity === 'P1').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              P1 Critical Incidents
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {incidents.filter(i => i.severity === 'P2').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              P2 High Risk Incidents
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Activity size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {incidents.filter(i => i.status === 'investigating' || i.status === 'reported').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Under Active Investigation
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ghana-emerald)' }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {incidents.filter(i => i.status === 'resolved' || i.status === 'closed').length}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Remediated & Closed
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Incidents List & Root Cause Investigation */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.2fr) minmax(360px, 1.4fr)', gap: '20px' }}>
        {/* Left Column: Incidents List */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={16} className="text-red-400" />
              <span>Incident Surveillance Log</span>
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'P1', 'P2', 'P3'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSeverityFilter(s)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: severityFilter === s ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${severityFilter === s ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: severityFilter === s ? '#f87171' : 'var(--text-muted)'
                  }}
                >
                  {s === 'all' ? 'All' : s}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading incidents from database...
            </div>
          ) : filteredIncidents.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No incidents recorded matching this severity tier.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
              {filteredIncidents.map(inc => {
                const isSelected = selectedIncident?.id === inc.id;
                const isP1 = inc.severity === 'P1';
                return (
                  <div
                    key={inc.id}
                    onClick={() => {
                      setSelectedIncident(inc);
                      setUpdateStatus(inc.status || 'investigating');
                      setRootCauseNotes(inc.root_cause || '');
                    }}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: isSelected ? 'rgba(239, 68, 68, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                      border: `1px solid ${isSelected ? 'rgba(239, 68, 68, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '0.66rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontWeight: 800,
                        background: isP1 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                        color: isP1 ? '#fca5a5' : '#fde047',
                        border: `1px solid ${isP1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
                      }}>
                        {inc.severity} • {inc.category || 'General Anomaly'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Status: <strong style={{ color: '#fff', textTransform: 'uppercase' }}>{inc.status}</strong>
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
                      {inc.title}
                    </div>

                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Reported: {new Date(inc.created_at || Date.now()).toLocaleDateString()}</span>
                      <span>By: {inc.reported_by || 'Officer'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Incident Investigation Detail & Action Plan */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {selectedIncident ? (
            <>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    fontSize: '0.74rem',
                    fontWeight: 800
                  }}>
                    {selectedIncident.severity}
                  </span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Incident Reference #{selectedIncident.id}
                  </span>
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '6px', margin: 0 }}>
                  {selectedIncident.title}
                </h3>
              </div>

              {/* Description */}
              <div style={{
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                lineHeight: 1.5
              }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>
                  Event Description & Impact
                </div>
                {selectedIncident.description || 'No detailed narrative provided.'}
              </div>

              {/* Immediate Containment */}
              {selectedIncident.immediate_action && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(245, 158, 11, 0.06)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  fontSize: '0.78rem',
                  color: '#fef08a'
                }}>
                  <strong>Immediate Containment Action:</strong> {selectedIncident.immediate_action}
                </div>
              )}

              {/* Root Cause Analysis (RCA) & Corrective Action */}
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Root Cause Analysis (RCA) & CAPA Action Plan
                </label>
                <textarea
                  rows={3}
                  disabled={!isAuthorized}
                  value={rootCauseNotes}
                  onChange={e => setRootCauseNotes(e.target.value)}
                  placeholder="Document engineering root cause, model retraining trigger, or dataset sanitization plan..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    lineHeight: 1.4
                  }}
                />
              </div>

              {/* Status Update Dropdown (Super Admin / Technical Unit) */}
              {isAuthorized && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>Status:</span>
                    <select
                      value={updateStatus}
                      onChange={e => setUpdateStatus(e.target.value)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#1e293b',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        color: '#fff',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      <option value="reported">Reported</option>
                      <option value="investigating">Investigating</option>
                      <option value="remediating">Remediating</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>

                  <button
                    onClick={handleUpdateIncidentStatus}
                    disabled={isUpdating}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: isUpdating ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isUpdating ? 'Saving...' : 'Update Incident Record'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select an incident from the log on the left to inspect its root cause analysis and action plan.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Log New Incident */}
      {showReportModal && (
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
            maxWidth: '560px',
            width: '100%',
            background: '#111827',
            borderRadius: '16px',
            border: '1px solid rgba(239, 68, 68, 0.45)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={18} className="text-red-400" />
                <span>Log AI Incident or Anomaly</span>
              </div>
              <button onClick={() => setShowReportModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleReportIncident} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Incident Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Disparate False-Positive Rate in Facial Verification for Female Applicants"
                  value={incTitle}
                  onChange={e => setIncTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Affected AI Project</label>
                  <select
                    value={incProjectId}
                    onChange={e => setIncProjectId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Severity</label>
                  <select
                    value={incSeverity}
                    onChange={e => setIncSeverity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Category</label>
                <select
                  value={incCategory}
                  onChange={e => setIncCategory(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="Algorithmic Bias / Discrimination">Algorithmic Bias / Discrimination</option>
                  <option value="Model Drift / Degradation">Model Drift / Degradation</option>
                  <option value="Hallucination / Erroneous Output">Hallucination / Erroneous Output</option>
                  <option value="Cybersecurity Exploit / Jailbreak">Cybersecurity Exploit / Jailbreak</option>
                  <option value="Data Leak / Privacy Breach">Data Leak / Privacy Breach</option>
                  <option value="System Outage / Unavailability">System Outage / Unavailability</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Detailed Description & Impact</label>
                <textarea
                  rows={3}
                  required
                  value={incDescription}
                  onChange={e => setIncDescription(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Immediate Containment Action</label>
                <input
                  type="text"
                  placeholder="e.g. Switched to manual fallback review for flagged cases."
                  value={incContainment}
                  onChange={e => setIncContainment(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowReportModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Submit Incident Report</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
