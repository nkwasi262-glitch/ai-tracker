import React, { useState } from 'react';
import { AlertOctagon, HelpCircle, ShieldCheck, Flame, Check } from 'lucide-react';
import { AIProject, RiskItem } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

const riskCategoriesMap: Record<string, string> = {
  'Technical Risk': 'System failures, software bugs, integration failures',
  'Operational Risk': 'Human errors and inefficient processes',
  'Cybersecurity Risk': 'Unauthorized access and cyberattacks',
  'Data Quality Risk': 'Poor, inaccurate, duplicate, or incomplete project data',
  'Data Privacy Risk': 'Exposure or misuse of sensitive information',
  'Legal & Regulatory Risk': 'Non-compliance with national laws and regulations',
  'AI Ethics Risk': 'AI systems violating ethical principles',
  'Governance Risk': 'Weak oversight, unclear accountability, policy violations',
  'Financial Risk': 'Budget overruns, funding shortages, misuse of funds',
  'Strategic Risk': "Projects not aligned with Ghana's AI strategy",
  'Reputational Risk': 'Damage to public trust or government credibility',
  'Project Management Risk': 'Delays, poor planning, missed milestones',
  'Vendor/Supplier Risk': 'Dependence on external contractors or cloud providers',
  'Third-Party Integration Risk': 'External APIs or services becoming unavailable',
  'Infrastructure Risk': 'Failures of hosting, networking, or power',
  'Business Continuity Risk': 'Inability to continue operations after disruptions',
  'Disaster Recovery Risk': 'Failure to restore services within required timelines',
  'Change Management Risk': 'Poorly managed system updates or policy changes',
  'Human Resource Risk': 'Shortage of skilled personnel or staff turnover',
  'Stakeholder Risk': 'Poor collaboration among ministries and agencies',
  'Political Risk': 'Government or policy changes affecting the system',
  'Procurement Risk': 'Delays or irregularities in acquiring technology',
  'Compliance & Audit Risk': 'Failure to meet audit or reporting standards',
  'Performance Risk': 'System unable to handle expected workload',
  'Scalability Risk': 'System cannot support increasing users or projects',
  'Interoperability Risk': 'Incompatibility with other government systems',
  'Knowledge Management Risk': 'Loss of institutional knowledge',
  'Environmental Risk': 'Environmental factors affecting operations',
  'Fraud & Corruption Risk': 'Intentional manipulation of information or funds',
  'National Security Risk': 'Exposure of sensitive AI initiatives'
};

const tooltipStyles = `
  .risk-tooltip-container {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .risk-tooltip-text {
    visibility: hidden;
    width: 250px;
    background-color: rgba(15, 23, 42, 0.98);
    color: #f1f5f9;
    text-align: left;
    border-radius: 8px;
    padding: 10px 14px;
    position: absolute;
    z-index: 9999;
    top: 50%;
    left: 110%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
    font-size: 0.74rem;
    line-height: 1.4;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(10px);
    pointer-events: none;
    font-weight: normal;
  }
  .risk-tooltip-text::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    border-width: 5px;
    border-style: solid;
    border-color: transparent rgba(15, 23, 42, 0.98) transparent transparent;
  }
  .risk-tooltip-container:hover .risk-tooltip-text {
    visibility: visible;
    opacity: 1;
    transform: translateY(-50%) translateX(4px);
  }
`;

interface RiskManagementProps {
  projects: AIProject[];
  onUpdateRiskStatus: (projectId: string, riskId: string, status: 'Open' | 'Mitigated' | 'Escalated') => void;
  currentRole: UserRole;
}

export const RiskManagement: React.FC<RiskManagementProps> = ({
  projects,
  onUpdateRiskStatus,
  currentRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Tracks selected risk detail bubble
  const [focusedRisk, setFocusedRisk] = useState<RiskItem | null>(null);

  // Multi-color cells mapping for 5x5 classic Risk matrix
  // Row: Likelihood (5 = High, 1 = Low)
  // Col: Impact (1 = Low, 5 = Critical)
  const getCellColorClass = (l: number, i: number) => {
    const product = l * i;
    if (product >= 15) return 'risk-cell-crit'; // Critical (red)
    if (product >= 8) return 'risk-cell-high';  // High (orange)
    if (product >= 4) return 'risk-cell-med';   // Medium (yellow)
    return 'risk-cell-low';                     // Low (green)
  };

  // Find if a project risk maps to this coordinates
  const getRiskAtCoords = (l: number, i: number) => {
    if (!activeProject) return null;
    return activeProject.risks.find(r => r.likelihood === l && r.impact === i && r.status !== 'Mitigated');
  };

  const handleMitigate = (riskId: string) => {
    // Check permission
    const canMitigate = ['Super Administrator', 'Institution Administrator', 'Project Manager', 'Monitoring & Evaluation Officer'].includes(currentRole);
    if (!canMitigate) return;
    
    onUpdateRiskStatus(selectedProjectId, riskId, 'Mitigated');
    if (focusedRisk?.id === riskId) {
      setFocusedRisk(null);
    }
  };

  const handleEscalate = (riskId: string) => {
    const canMitigate = ['Super Administrator', 'Institution Administrator', 'Project Manager'].includes(currentRole);
    if (!canMitigate) return;

    onUpdateRiskStatus(selectedProjectId, riskId, 'Escalated');
    if (focusedRisk?.id === riskId) {
      setFocusedRisk({ ...focusedRisk, status: 'Escalated' });
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'Critical': return <span className="badge badge-danger">Critical</span>;
      case 'High': return <span className="badge badge-warning">High</span>;
      case 'Medium': return <span className="badge badge-info">Medium</span>;
      default: return <span className="badge badge-success">Low</span>;
    }
  };

  const canMitigate = ['Super Administrator', 'Institution Administrator', 'Project Manager', 'Monitoring & Evaluation Officer'].includes(currentRole);

  return (
    <div>
      <style>{tooltipStyles}</style>
      {/* Sector Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Risk Management & Mitigation Ledger</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Map algorithmic vulnerabilities, data leaks, and operational bottlenecks on the 5x5 Risk Grid
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Inspect Registry Project:
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setFocusedRisk(null);
            }}
            className="form-select"
            style={{ width: '220px', padding: '8px 12px' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeProject && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '24px', alignItems: 'stretch', marginBottom: '24px' }}>
          
          {/* LEFT COLUMN: 5x5 Matrix visual */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div style={{ marginBottom: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700 }}>Interactive Threat Matrix</h3>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Likelihood (Vertical) vs Impact (Horizontal)
              </p>
            </div>

            {/* Matrix Wrapper */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Likelihood text axis */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                <span>5 (H)</span>
                <span>4</span>
                <span>3</span>
                <span>2</span>
                <span>1 (L)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* 5x5 Grid construction */}
                {/* We map from Likelihood = 5 down to 1 */}
                {[5, 4, 3, 2, 1].map((l) => (
                  <div key={l} style={{ display: 'flex', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const riskItem = getRiskAtCoords(l, i);
                      return (
                        <div
                          key={i}
                          onClick={() => riskItem && setFocusedRisk(riskItem)}
                          className={`risk-cell ${getCellColorClass(l, i)}`}
                          style={{
                            width: '46px',
                            height: '46px',
                            border: riskItem ? '2px solid #fff' : '1px solid rgba(255,255,255,0.04)',
                            cursor: riskItem ? 'pointer' : 'default'
                          }}
                        >
                          {riskItem && (
                            <div className="risk-cell-indicator" />
                          )}
                          {!riskItem && <span style={{ opacity: 0.15 }}>{l * i}</span>}
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Impact text axis */}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '6px', padding: '0 4px' }}>
                  <span>1 (L)</span>
                  <span>2</span>
                  <span>3</span>
                  <span>4</span>
                  <span>5 (C)</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Focused Risk detailed summary */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
            <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertOctagon className="w-5 h-5 text-amber-400" />
                <span>Threat Vulnerability Assessment</span>
              </h3>
            </div>

            {focusedRisk ? (
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span className="risk-tooltip-container" style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', cursor: 'help' }}>
                      {focusedRisk.category} Risk Category
                      <span className="risk-tooltip-text">
                        <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '4px' }}>Category Description:</strong>
                        {riskCategoriesMap[focusedRisk.category] || 'No category description available.'}
                      </span>
                    </span>
                    <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>Vulnerability Node Info</h4>
                  </div>
                  <div>
                    {getSeverityBadge(focusedRisk.severity)}
                  </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
                  <strong>Description:</strong> {focusedRisk.description}
                </div>

                <div style={{ background: 'rgba(16,185,129,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)', fontSize: '0.86rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.45 }}>
                  <strong>Mitigation Plan:</strong> {focusedRisk.mitigationPlan}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                  <button 
                    onClick={() => handleMitigate(focusedRisk.id)}
                    className="btn btn-primary"
                    disabled={!canMitigate}
                    style={{ opacity: canMitigate ? 1 : 0.5 }}
                  >
                    <Check className="w-4 h-4" />
                    <span>Apply Mitigation Workflow</span>
                  </button>
                  <button 
                    onClick={() => handleEscalate(focusedRisk.id)}
                    className="btn btn-secondary"
                    disabled={!canMitigate}
                    style={{ opacity: canMitigate ? 1 : 0.5 }}
                  >
                    <Flame className="w-4 h-4 text-red-400" />
                    <span>Escalate Threat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '20px' }}>
                <HelpCircle className="w-12 h-12 text-slate-500 mb-8" />
                <span>Select a glowing cell in the 5x5 Threat Grid or examine the Risk Register below to inspect mitigation plans.</span>
              </div>
            )}
          </div>

        </div>
      )}

      {/* BOTTOM GRID: Full Risk Register List */}
      {activeProject && (
        <div className="glass-card">
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Risk Register Ledger</h3>
          </div>
          
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Description</th>
                  <th>Mitigation Plan</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeProject.risks.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <span className="risk-tooltip-container" style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'help' }}>
                        {r.category}
                        <span className="risk-tooltip-text">
                          <strong style={{ color: '#fbbf24', display: 'block', marginBottom: '4px' }}>Category Description:</strong>
                          {riskCategoriesMap[r.category] || 'No category description available.'}
                        </span>
                      </span>
                    </td>
                    <td>{getSeverityBadge(r.severity)}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{r.description}</td>
                    <td style={{ maxWidth: '280px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{r.mitigationPlan}</td>
                    <td>
                      {r.status === 'Mitigated' ? (
                        <span className="badge badge-success" style={{ textTransform: 'uppercase' }}>Mitigated</span>
                      ) : r.status === 'Escalated' ? (
                        <span className="badge badge-danger" style={{ textTransform: 'uppercase' }}>Escalated</span>
                      ) : (
                        <span className="badge badge-warning" style={{ textTransform: 'uppercase' }}>Open</span>
                      )}
                    </td>
                    <td>
                      {r.status !== 'Mitigated' ? (
                        <button
                          onClick={() => handleMitigate(r.id)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          disabled={!canMitigate}
                        >
                          Mitigate
                        </button>
                      ) : (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--ghana-emerald)', fontSize: '0.75rem', fontWeight: 600 }}>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
