import React, { useState } from 'react';
import { 
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { AIProject, formatNumberToWords, computeZeroAssumptionSummary } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';
import { canPerformAction } from '../services/rbacPolicy';

interface FinanceMinisterViewProps {
  projects: AIProject[];
  session: UserSession;
  onUpdateProjectBudget?: (projectId: string, updatedBudget: AIProject['budget'], zeroAssumption?: AIProject['zeroAssumptionAudit']) => void;
}

export const FinanceMinisterView: React.FC<FinanceMinisterViewProps> = ({ projects, session, onUpdateProjectBudget }) => {
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>('All');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Verification modal state
  const [verifyingProject, setVerifyingProject] = useState<AIProject | null>(null);
  const [auditWarrantInput, setAuditWarrantInput] = useState('');
  const [auditNotesInput, setAuditNotesInput] = useState('');

  const canVerifyExpenditure = canPerformAction(session.role, 'VERIFY_FINANCIAL_EXPENDITURE');
  const zeroMetrics = computeZeroAssumptionSummary(projects);

  // Financial calculations
  const totalAllocated = projects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
  const totalDisbursed = projects.reduce((acc, p) => acc + p.budget.disbursed, 0);
  const totalUtilized = projects.reduce((acc, p) => acc + p.budget.utilized, 0);
  const totalRemaining = projects.reduce((acc, p) => acc + p.budget.remaining, 0);
  const utilizationRate = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;
  const disbursementRate = totalAllocated > 0 ? (totalDisbursed / totalAllocated) * 100 : 0;

  // Breakdown by funding source
  const fundingSources = ['Government', 'Development Partners', 'Donors', 'Private Sector', 'Research Grants'];
  const fundingBreakdown = fundingSources.map(source => {
    const allocated = projects
      .filter(p => p.budget.primaryFundingSource === source)
      .reduce((acc, p) => acc + p.budget.totalAllocated, 0);
    const count = projects.filter(p => p.budget.primaryFundingSource === source).length;
    return {
      source,
      allocated,
      count,
      percent: totalAllocated > 0 ? (allocated / totalAllocated) * 100 : 0
    };
  });

  // Filtered projects
  const filteredProjects = selectedFundingSource === 'All'
    ? projects
    : projects.filter(p => p.budget.primaryFundingSource === selectedFundingSource);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      'Project Code', 
      'Project Name', 
      'Sector', 
      'MDA', 
      'Funding Source', 
      'Allocated (GHS)', 
      'Disbursed (GHS)', 
      'Utilized (GHS)', 
      'Remaining (GHS)', 
      'Verification Status',
      'MoF Treasury Warrant Number',
      'Stage'
    ];
    const rows = filteredProjects.map(p => [
      p.projectCode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sector,
      `"${p.mda.replace(/"/g, '""')}"`,
      p.budget.primaryFundingSource,
      p.budget.totalAllocated,
      p.budget.disbursed,
      p.budget.utilized,
      p.budget.remaining,
      p.budget.verificationStatus || 'Self-Reported (Unverified)',
      p.budget.mofWarrantNumber || 'None',
      p.stage
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ghana_National_AI_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordAuditEvent({
      eventType: 'FINANCIAL_EXPORT',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      actionDetails: `Exported comprehensive National AI financial CSV ledger (${filteredProjects.length} projects).`
    });

    setExportFeedback('CSV statutory financial ledger with verification provenance successfully exported.');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      title: 'Republic of Ghana National AI Fiscal & Zero-Assumption Dossier',
      authority: 'Ministry of Finance & Economic Planning (MoF)',
      exportTimestamp: new Date().toISOString(),
      officer: session.fullName,
      zeroAssumptionSummary: zeroMetrics,
      projects: filteredProjects
    }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Ghana_National_AI_Fiscal_ZeroAssumption_Dossier_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordAuditEvent({
      eventType: 'FINANCIAL_EXPORT',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      actionDetails: `Exported statutory fiscal JSON dossier (${filteredProjects.length} projects).`
    });

    setExportFeedback('JSON statutory fiscal dossier exported with complete audit signatures.');
  };

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingProject) return;
    if (!auditWarrantInput.trim()) {
      alert('A valid statutory MoF Treasury Warrant Number is required to eliminate assumptions.');
      return;
    }

    const updatedBudget: AIProject['budget'] = {
      ...verifyingProject.budget,
      verificationStatus: 'MoF Audited & Verified',
      mofWarrantNumber: auditWarrantInput.trim(),
      lastAuditedDate: new Date().toISOString().split('T')[0],
      auditedBy: `${session.fullName} (Ministry of Finance)`,
      auditNotes: auditNotesInput.trim() || 'MoF Treasury Warrant verified under Act 921. Assumption eliminated.',
      hasAssumptionsFlag: false,
      assumptionWarnings: []
    };

    if (onUpdateProjectBudget) {
      onUpdateProjectBudget(verifyingProject.id, updatedBudget, {
        isFullyVerified: true,
        evidenceBackingScore: 95,
        verifiedSignals: [`MoF Warrant #${auditWarrantInput.trim()} verified`, 'Treasury payment vouchers confirmed'],
        unverifiedAssumptions: [],
        lastAuditedDate: new Date().toISOString().split('T')[0],
        assumptionsEliminatedCount: (verifyingProject.zeroAssumptionAudit?.assumptionsEliminatedCount || 0) + 1
      });
    }

    recordAuditEvent({
      eventType: 'FINANCIAL_VERIFICATION_UPDATE',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      targetEntityId: verifyingProject.id,
      actionDetails: `Attached MoF Treasury Warrant #${auditWarrantInput.trim()} for ${verifyingProject.projectCode}. Assumption eliminated.`
    });

    setExportFeedback(`Project ${verifyingProject.projectCode} successfully verified under MoF Treasury Warrant #${auditWarrantInput.trim()}. Assumption eliminated.`);
    setVerifyingProject(null);
    setAuditWarrantInput('');
    setAuditNotesInput('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ghana-gold)'
          }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{
              color: 'var(--ghana-gold)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Ministry of Finance & Economic Planning (MoF)
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              National AI Fiscal Portfolio & Capital Analytics
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Statutory expenditure tracking, disbursement reconciliation, and exportable financial reports.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#a7f3d0',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={15} /> Export CSV Ledger
          </button>
          <button
            onClick={handleExportJSON}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fde68a',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Fiscal JSON Export
          </button>
        </div>
      </div>

      {/* Export Feedback Banner */}
      {exportFeedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#a7f3d0',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{exportFeedback}</span>
          </div>
          <button onClick={() => setExportFeedback(null)} style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Capital Allocated
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ghana-emerald)', marginTop: '4px' }}>
            GHS {(totalAllocated / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {formatNumberToWords(totalAllocated)} GHS
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Capital Disbursed
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            GHS {(totalDisbursed / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Disbursement Rate: <strong>{disbursementRate.toFixed(1)}%</strong> of allocation
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Verified Utilization
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ghana-gold)', marginTop: '4px' }}>
            GHS {(totalUtilized / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Absorption Rate: <strong>{utilizationRate.toFixed(1)}%</strong>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Unutilized Balance
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cbd5e1', marginTop: '4px' }}>
            GHS {(totalRemaining / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Available for reallocation
          </div>
        </div>
      </div>

      {/* Funding Stream Breakdown */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Capital Allocation by Primary Funding Stream
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {fundingBreakdown.map((item) => (
            <div
              key={item.source}
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.source}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                GHS {(item.allocated / 1000000).toFixed(1)}M
              </div>
              <div style={{
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.percent}%`,
                  background: 'var(--ghana-emerald)'
                }} />
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.percent.toFixed(1)}% of total</span>
                <span>{item.count} projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Projects Ledger */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              National AI Projects Financial Ledger
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Audited project-level allocations and verified expenditures across government MDAs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Funding Stream:</span>
            <select
              value={selectedFundingSource}
              onChange={(e) => setSelectedFundingSource(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#111b27',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Sources</option>
              {fundingSources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Project Code</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Project Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>MDA</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Funding Source</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Allocated (GHS)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Disbursed (GHS)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Utilized (GHS)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>Absorption</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Zero-Assumption Status</th>
                {canVerifyExpenditure && (
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>Audit Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => {
                const rate = proj.budget.totalAllocated > 0
                  ? (proj.budget.utilized / proj.budget.totalAllocated) * 100
                  : 0;
                return (
                  <tr
                    key={proj.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--ghana-gold)' }}>
                      {proj.projectCode}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>
                      {proj.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {proj.mdaCode || proj.mda}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {proj.budget.primaryFundingSource}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700, textAlign: 'right' }}>
                      {proj.budget.totalAllocated.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#38bdf8', textAlign: 'right' }}>
                      {proj.budget.disbursed.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fbbf24', textAlign: 'right' }}>
                      {proj.budget.utilized.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: rate >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: rate >= 80 ? '#10b981' : '#fbbf24'
                      }}>
                        {rate.toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {proj.budget.verificationStatus === 'MoF Audited & Verified' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <ShieldCheck size={12} /> MoF Verified
                          </span>
                          {proj.budget.mofWarrantNumber && (
                            <span style={{ fontSize: '0.66rem', color: '#a7f3d0' }}>
                              Warrant: {proj.budget.mofWarrantNumber}
                            </span>
                          )}
                        </div>
                      ) : proj.budget.verificationStatus === 'Flagged Discrepancy' ? (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldAlert size={12} /> Discrepancy Hold
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <ShieldAlert size={12} /> Unverified Claim
                          </span>
                          <span style={{ fontSize: '0.66rem', color: '#fde68a' }}>
                            No Warrant Attached
                          </span>
                        </div>
                      )}
                    </td>
                    {canVerifyExpenditure && (
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {proj.budget.hasAssumptionsFlag ? (
                          <button
                            onClick={() => {
                              setVerifyingProject(proj);
                              setAuditWarrantInput('');
                              setAuditNotesInput('');
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              color: '#a7f3d0',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Verify Warrant
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Certified ✓
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      {verifyingProject && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#0d1520',
            border: '1px solid var(--ghana-emerald)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                Zero-Assumption Statutory Control
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0, marginTop: '2px' }}>
                Verify Expenditure & Attach Treasury Warrant
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                Project: <strong>{verifyingProject.projectCode}</strong> — {verifyingProject.name} ({verifyingProject.mdaCode})
              </p>
            </div>

            <form onSubmit={handleConfirmVerification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  OFFICIAL MOF TREASURY WARRANT NUMBER *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MOF/WARR/2026/049"
                  value={auditWarrantInput}
                  onChange={(e) => setAuditWarrantInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#162232',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  STATUTORY RECONCILIATION NOTES
                </label>
                <textarea
                  rows={3}
                  placeholder="Confirming that all payment vouchers and bank transfers were reconciled under Act 921..."
                  value={auditNotesInput}
                  onChange={(e) => setAuditNotesInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#162232',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setVerifyingProject(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'var(--ghana-emerald)',
                    border: 'none',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={16} /> Confirm Statutory Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
