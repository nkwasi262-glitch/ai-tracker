import React, { useState } from 'react';
import { 
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2
} from 'lucide-react';
import { AIProject, formatNumberToWords } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';

interface FinanceMinisterViewProps {
  projects: AIProject[];
  session: UserSession;
}

export const FinanceMinisterView: React.FC<FinanceMinisterViewProps> = ({ projects, session }) => {
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>('All');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

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
    const headers = ['Project Code', 'Project Name', 'Sector', 'MDA', 'Funding Source', 'Allocated (GHS)', 'Disbursed (GHS)', 'Utilized (GHS)', 'Remaining (GHS)', 'Stage'];
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

    setExportFeedback('CSV financial ledger successfully generated and exported.');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredProjects, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Ghana_National_AI_Fiscal_Dossier_${new Date().toISOString().split('T')[0]}.json`);
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

    setExportFeedback('JSON fiscal data exported with complete audit signatures.');
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
