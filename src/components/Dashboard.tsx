import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Activity, 
  AlertTriangle,
  FolderOpen,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Stamp,
  XCircle,
  RotateCcw,
  Clock,
  ArrowRight
} from 'lucide-react';
import { AIProject, formatNumberToWords, computeZeroAssumptionSummary } from '../data/sampleProjects';
import { getDGVerdicts } from '../services/verdictService';
import { UserRole } from './RoleSwitcher';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.98)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '8px',
        padding: '12px 14px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        fontSize: '0.78rem',
        maxWidth: '320px',
        zIndex: 9999
      }}>
        <div style={{ color: 'var(--ghana-emerald)', fontWeight: 700, marginBottom: '6px', fontSize: '0.82rem' }}>
          {data.project}
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginBottom: '8px' }}>
          MDA: <span style={{ color: '#fff', fontWeight: 600 }}>{data.mdaName}</span>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Allocated Budget
            </div>
            <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.76rem', marginTop: '2px', lineHeight: '1.3' }}>
              {formatNumberToWords(data.ApprovedRaw)} GHS (GHS {data.ApprovedRaw.toLocaleString('en-US')})
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.66rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Utilized Funds
            </div>
            <div style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.76rem', marginTop: '2px', lineHeight: '1.3' }}>
              {formatNumberToWords(data.UtilizedRaw)} GHS (GHS {data.UtilizedRaw.toLocaleString('en-US')})
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface DashboardProps {
  projects: AIProject[];
  currentRole: UserRole;
  onNavigate?: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, currentRole, onNavigate }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [showProjectsTooltip, setShowProjectsTooltip] = useState(false);
  const [verdictFilter, setVerdictFilter] = useState<'All' | 'Approved' | 'Requires More Understanding' | 'Rejected' | 'Awaiting DG'>('All');

  const allVerdicts = getDGVerdicts();

  // Resolve the authoritative Director General Final Verdict & Reasons for a project
  const resolveProjectDGVerdict = (p: AIProject) => {
    const latestFromService = allVerdicts.find(v => v.projectId === p.id);
    if (p.dgFinalVerdict) {
      return {
        hasFinalVerdict: true,
        statusLabel: p.dgFinalVerdict.finalStatusLabel,
        verdictType: p.dgFinalVerdict.verdict,
        reasons: p.dgFinalVerdict.reasons,
        signedByName: p.dgFinalVerdict.signedByName,
        signedByRole: p.dgFinalVerdict.signedByRole,
        signedAt: p.dgFinalVerdict.signedAt,
        signatureSeal: p.dgFinalVerdict.signatureSeal || 'NITA-DG-SEAL-VERIFIED',
      };
    }
    if (latestFromService) {
      const statusLabel: 'Approved' | 'Rejected' | 'Requires More Understanding' =
        latestFromService.verdict === 'Approve'
          ? 'Approved'
          : latestFromService.verdict === 'Reject'
          ? 'Rejected'
          : 'Requires More Understanding';
      return {
        hasFinalVerdict: true,
        statusLabel,
        verdictType: latestFromService.verdict,
        reasons: latestFromService.mandatoryComments,
        signedByName: latestFromService.reviewedByName,
        signedByRole: latestFromService.reviewedByRole,
        signedAt: latestFromService.timestamp,
        signatureSeal: latestFromService.signatureSeal || 'NITA-DG-SEAL-VERIFIED',
      };
    }
    if (p.reviewStatus === 'Approved' || p.reviewStatus === 'Rejected' || p.reviewStatus === 'Returned' || p.reviewStatus === 'Needs Correction') {
      const statusLabel: 'Approved' | 'Rejected' | 'Requires More Understanding' =
        p.reviewStatus === 'Approved'
          ? 'Approved'
          : p.reviewStatus === 'Rejected'
          ? 'Rejected'
          : 'Requires More Understanding';
      return {
        hasFinalVerdict: true,
        statusLabel,
        verdictType: statusLabel === 'Approved' ? 'Approve' : statusLabel === 'Rejected' ? 'Reject' : 'Return for Further Review',
        reasons: p.technicalReview?.recommendationNotes || (
          statusLabel === 'Rejected'
            ? 'Rejected by Director General due to statutory non-compliance.'
            : statusLabel === 'Requires More Understanding'
            ? 'Returned by Director General: Requires more understanding and technical clarification before approval.'
            : 'Approved by Director General for National AI Registry deployment.'
        ),
        signedByName: 'Hon. Director General (NITA)',
        signedByRole: 'Director General',
        signedAt: p.technicalReview?.reviewedAt || p.startDate || new Date().toISOString(),
        signatureSeal: 'NITA-DG-SEAL-VERIFIED',
      };
    }
    return {
      hasFinalVerdict: false,
      statusLabel: 'Awaiting DG' as const,
      verdictType: null,
      reasons: p.technicalReview?.recommendationNotes || 'Currently undergoing statutory vetting prior to Director General final sign-off.',
      signedByName: null,
      signedByRole: null,
      signedAt: null,
      signatureSeal: null,
    };
  };

  // Determine whether a project is part of the Official DG-Approved Portfolio
  const isProjectApproved = (p: AIProject) => {
    const v = resolveProjectDGVerdict(p);
    if (v.hasFinalVerdict) {
      return v.statusLabel === 'Approved';
    }
    if (p.reviewStatus && p.reviewStatus !== 'Approved') {
      return false;
    }
    return p.status === 'Active' || p.status === 'Completed';
  };

  const approvedPortfolioProjects = projects.filter(isProjectApproved);
  const pendingApprovalProjects = projects.filter(p => !isProjectApproved(p) && resolveProjectDGVerdict(p).statusLabel !== 'Rejected');
  const pendingApprovalBudget = pendingApprovalProjects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);

  const activeProjectsList = approvedPortfolioProjects.filter(p => p.status === 'Active');
  const delayedProjectsList = projects.filter(p => p.status === 'Delayed' || resolveProjectDGVerdict(p).statusLabel === 'Requires More Understanding');
  const completedProjectsList = approvedPortfolioProjects.filter(p => p.status === 'Completed');

  // DG Verdict Counts across filtered sector projects
  const dgApprovedProjects = projects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Approved');
  const dgRequiresUnderstandingProjects = projects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Requires More Understanding');
  const dgRejectedProjects = projects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Rejected');

  // Calculates KPI values based on DG-Approved Portfolio (so signing & approving a project immediately increases Total AI Projects & Approved Budget)
  const totalProjectsCount = approvedPortfolioProjects.length;
  const activeProjectsCount = activeProjectsList.length;
  const delayedProjectsCount = delayedProjectsList.length;
  
  const totalBudget = approvedPortfolioProjects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
  const totalUtilized = approvedPortfolioProjects.reduce((acc, p) => acc + p.budget.utilized, 0);
  const budgetUtilizationRate = totalBudget > 0 ? (totalUtilized / totalBudget) * 100 : 0;

  const avgReadiness = totalProjectsCount > 0 
    ? approvedPortfolioProjects.reduce((acc, p) => acc + p.readinessScore, 0) / totalProjectsCount 
    : 0;
  const avgCompliance = totalProjectsCount > 0 
    ? approvedPortfolioProjects.reduce((acc, p) => {
        const s = p.compliance;
        const weightedScore = (s.fairness * 0.20) + (s.transparency * 0.25) + (s.privacy * 0.20) + (s.security * 0.35);
        return acc + weightedScore;
      }, 0) / totalProjectsCount
    : 0;

  // Zero-Assumption Summary
  const zeroSummary = computeZeroAssumptionSummary(projects);

  // Filter projects by sector for drilldowns
  const filteredProjects = selectedSector === 'All' 
    ? projects 
    : projects.filter(p => p.sector === selectedSector);

  const approvedFilteredProjects = filteredProjects.filter(isProjectApproved);

  // 1. Data formulation for Budgets Chart (DG-Approved Portfolio)
  const budgetChartData = approvedFilteredProjects.map(p => ({
    name: p.mdaCode,
    Approved: p.budget.totalAllocated / 1000000, // GHS Millions for graph scaling
    Utilized: p.budget.utilized / 1000000,
    ApprovedRaw: p.budget.totalAllocated,
    UtilizedRaw: p.budget.utilized,
    project: p.name,
    mdaName: p.mda
  }));

  // 2. Data formulation for Sectors (Radar)
  const sectorCounts: { [key: string]: number } = {};
  approvedPortfolioProjects.forEach(p => {
    sectorCounts[p.sector] = (sectorCounts[p.sector] || 0) + 1;
  });
  const sectorChartData = Object.keys(sectorCounts).map(sector => ({
    subject: sector,
    count: sectorCounts[sector],
    fullMark: 5
  }));

  // 3. Compliance Trends Simulation
  const complianceTrendData = [
    { month: 'Jan', Compliance: 72, Projects: 12 },
    { month: 'Feb', Compliance: 74, Projects: 14 },
    { month: 'Mar', Compliance: 78, Projects: 18 },
    { month: 'Apr', Compliance: 81, Projects: 20 },
    { month: 'May', Compliance: 84, Projects: 22 },
    { month: 'Jun', Compliance: 86, Projects: 24 },
  ];

  // Dynamic system notifications based on Director General final verdicts & roles
  const getNotifications = () => {
    const notices: Array<{ type: 'danger' | 'warning' | 'success' | 'info'; message: string; reason?: string; time: string }> = [];

    // Surface all projects that have received a Director General Final Verdict (especially Rejections & Requires More Understanding)
    projects.forEach(p => {
      const v = resolveProjectDGVerdict(p);
      if (v.hasFinalVerdict) {
        if (v.statusLabel === 'Rejected') {
          notices.push({
            type: 'danger',
            message: `[DG FINAL VERDICT — REJECTED] ${p.name} (${p.mdaCode}) — Status: ${p.status}`,
            reason: `Rejection Reason: ${v.reasons}`,
            time: v.signedAt ? `Signed by ${v.signedByName} • ${new Date(v.signedAt).toLocaleDateString()}` : 'Signed by Director General',
          });
        } else if (v.statusLabel === 'Requires More Understanding') {
          notices.push({
            type: 'warning',
            message: `[DG FINAL VERDICT — REQUIRES MORE UNDERSTANDING] ${p.name} (${p.mdaCode}) — Status: ${p.status}`,
            reason: `Why More Understanding Is Required: ${v.reasons}`,
            time: v.signedAt ? `Signed by ${v.signedByName} • ${new Date(v.signedAt).toLocaleDateString()}` : 'Signed by Director General',
          });
        } else if (v.statusLabel === 'Approved') {
          notices.push({
            type: 'success',
            message: `[DG FINAL SIGN-OFF — APPROVED] ${p.name} (${p.mdaCode}) — Status: ${p.status}`,
            reason: `Executive Directive: ${v.reasons}`,
            time: v.signedAt ? `Signed by ${v.signedByName} • ${new Date(v.signedAt).toLocaleDateString()}` : 'Signed by Director General',
          });
        }
      }
    });

    if (currentRole !== 'Public User') {
      notices.push({
        type: 'warning',
        message: 'GRA Tax Fraud engine milestone verification delayed by 2 weeks.',
        time: '3 hours ago'
      });
    } else {
      notices.push({
        type: 'info',
        message: 'Responsible AI Authority published new statistics on agricultural tech adoption.',
        time: 'Yesterday'
      });
    }
    return notices;
  };

  // Filtered projects for the Director General Final Verdict Status Board
  const verdictFilteredProjects = filteredProjects.filter(p => {
    if (verdictFilter === 'All') return true;
    return resolveProjectDGVerdict(p).statusLabel === verdictFilter;
  });

  return (
    <div>
      {/* Sector filter bar */}
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>National AI Dashboard</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Real-time analytics for government Artificial Intelligence implementations
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Sector Focus:
          </span>
          <select 
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="form-select"
            style={{ width: '180px', padding: '8px 12px' }}
          >
            <option value="All">All Sectors</option>
            <option value="Health">Health</option>
            <option value="Agriculture">Agriculture</option>
            <option value="Finance">Finance</option>
            <option value="Energy">Energy</option>
            <option value="Justice">Justice</option>
            <option value="Environment">Environment</option>
          </select>
        </div>
      </div>

      {/* Zero-Assumption Statutory Portfolio Assurance Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '14px',
        padding: '18px 22px',
        marginBottom: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={20} className="text-emerald-400" />
            <div>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>
                Zero-Assumption Portfolio Assurance Index
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginLeft: '10px' }}>
                Under Act 921 & Act 843 Statutory Evidence Mandate
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '0.74rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.2)',
              color: '#10b981',
              border: '1px solid rgba(16, 185, 129, 0.4)'
            }}>
              {zeroSummary.portfolioAssurancePercent}% Statutorily Warrant-Backed
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          fontSize: '0.78rem'
        }}>
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Verified Warrant Capital
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              GHS {(zeroSummary.verifiedDisbursed / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.68rem', color: '#a7f3d0' }}>
              {zeroSummary.verifiedCount} projects backed by MoF Treasury Warrants
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Self-Reported / Unverified
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
              GHS {(zeroSummary.unverifiedDisbursed / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.68rem', color: '#fde68a' }}>
              {zeroSummary.unverifiedCount} projects pending statutory warrant audit
            </div>
          </div>

          <div style={{ padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.68rem', textTransform: 'uppercase', fontWeight: 700 }}>
              Flagged Discrepancies
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: zeroSummary.flaggedCount > 0 ? '#ef4444' : '#94a3b8', marginTop: '2px' }}>
              {zeroSummary.flaggedCount} Projects
            </div>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              Disbursements frozen pending audit resolution
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="card-grid">
        <div 
          className="glass-card kpi-card" 
          style={{ 
            '--theme-accent': 'var(--ghana-emerald)',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          } as React.CSSProperties}
          onMouseEnter={() => setShowProjectsTooltip(true)}
          onMouseLeave={() => setShowProjectsTooltip(false)}
          onClick={() => setShowProjectsTooltip(!showProjectsTooltip)}
        >
          <div>
            <div className="kpi-title">Total AI Projects (Approved)</div>
            <div className="kpi-value">{totalProjectsCount}</div>
            <div className="kpi-sub">
              <span style={{ color: 'var(--ghana-emerald)' }}>Active: {activeProjectsCount}</span> | Delayed: {delayedProjectsCount}
            </div>
            <div style={{ fontSize: '0.68rem', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ DG Signed: {dgApprovedProjects.length}</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>• Pending DG Approval: {pendingApprovalProjects.length}</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>• Needs Understanding: {dgRequiresUnderstandingProjects.length}</span>
              <span style={{ color: '#ef4444', fontWeight: 700 }}>• Rejected: {dgRejectedProjects.length}</span>
            </div>
          </div>
          <FolderOpen className="kpi-icon-wrapper" />

          {showProjectsTooltip && (
            <div style={{
              marginTop: '16px',
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              textAlign: 'left',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Project Registry Breakdown
              </div>
              
              {/* Active Section */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ghana-emerald)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>ACTIVE</span>
                  <span>{activeProjectsList.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                  {activeProjectsList.length > 0 ? (
                    activeProjectsList.map(p => (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden' }}>
                            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--ghana-emerald)', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={p.name}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{p.readinessScore}%</span>
                        </div>
                        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.readinessScore}%`, height: '100%', background: 'var(--ghana-emerald)' }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>No active projects</div>
                  )}
                </div>
              </div>

              {/* Delayed Section */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ghana-gold)', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>DELAYED</span>
                  <span>{delayedProjectsList.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                  {delayedProjectsList.length > 0 ? (
                    delayedProjectsList.map(p => (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden' }}>
                            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--ghana-gold)', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={p.name}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{p.readinessScore}%</span>
                        </div>
                        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.readinessScore}%`, height: '100%', background: 'var(--ghana-gold)' }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>No delayed projects</div>
                  )}
                </div>
              </div>

              {/* Completed Section */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#3b82f6', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span>COMPLETED</span>
                  <span>{completedProjectsList.length}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto', paddingRight: '4px' }}>
                  {completedProjectsList.length > 0 ? (
                    completedProjectsList.map(p => (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', background: 'rgba(255,255,255,0.02)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-primary)', fontWeight: 500, overflow: 'hidden' }}>
                            <span style={{ display: 'inline-block', width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#3b82f6', flexShrink: 0 }} />
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }} title={p.name}>{p.name}</span>
                          </div>
                          <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)' }}>{p.readinessScore}%</span>
                        </div>
                        <div style={{ width: '100%', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                          <div style={{ width: `${p.readinessScore}%`, height: '100%', background: '#3b82f6' }} />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>No completed projects</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="glass-card kpi-card" style={{ '--theme-accent': 'var(--ghana-gold)', minHeight: '140px' } as React.CSSProperties}>
          <div className="kpi-title">Approved Budget & Utilized Funds</div>
          <div className="kpi-value" style={{ fontSize: '1.05rem', lineHeight: '1.4', marginTop: '6px', fontWeight: 700, wordBreak: 'break-word' }}>
            Allocated: <span style={{ color: 'var(--text-primary)' }}>{formatNumberToWords(totalBudget)} GHS (GHS {totalBudget.toLocaleString('en-US')})</span>
          </div>
          <div className="kpi-sub" style={{ fontSize: '0.78rem', marginTop: '4px', display: 'block' }}>
            Utilized: <span style={{ color: 'var(--ghana-gold)', fontWeight: 600 }}>{formatNumberToWords(totalUtilized)} GHS (GHS {totalUtilized.toLocaleString('en-US')})</span>
          </div>
          <div className="kpi-sub" style={{ fontSize: '0.72rem', marginTop: '2px' }}>
            Utilization Rate: <span style={{ color: 'var(--ghana-gold)' }}>{budgetUtilizationRate.toFixed(1)}%</span>
          </div>
          {pendingApprovalBudget > 0 && (
            <div style={{ fontSize: '0.68rem', marginTop: '5px', color: '#38bdf8', fontWeight: 700 }}>
              +GHS {pendingApprovalBudget.toLocaleString('en-US')} awaiting DG sign-off ({pendingApprovalProjects.length} projects)
            </div>
          )}
          <DollarSign className="kpi-icon-wrapper" />
        </div>

        <div className="glass-card kpi-card" style={{ '--theme-accent': 'var(--ghana-emerald)' } as React.CSSProperties}>
          <div className="kpi-title">AI Readiness index</div>
          <div className="kpi-value">{avgReadiness.toFixed(0)}%</div>
          <div className="kpi-sub">
            National Maturity Tier: <span style={{ color: 'var(--ghana-emerald)' }}>Defined</span>
          </div>
          <Layers className="kpi-icon-wrapper" />
        </div>

        <div className="glass-card kpi-card" style={{ '--theme-accent': 'var(--ghana-emerald)' } as React.CSSProperties}>
          <div className="kpi-title">Compliance Index</div>
          <div className="kpi-value">{avgCompliance.toFixed(0)}%</div>
          <div className="kpi-sub">
            Ethical Governance Score: <span style={{ color: 'var(--ghana-emerald)' }}>Good</span>
          </div>
          <Activity className="kpi-icon-wrapper" />
        </div>
      </div>

      {/* Director General Final Sign-Off & Project Verdict Status Board */}
      <div
        className="glass-card"
        style={{
          marginBottom: '24px',
          padding: '22px 24px',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(16, 185, 129, 0.04) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '14px',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981'
            }}>
              <Stamp size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Director General Final Sign-Off & Project Verdict Status Board
                </h3>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(251, 191, 36, 0.16)',
                  color: '#fbbf24',
                  border: '1px solid rgba(251, 191, 36, 0.4)'
                }}>
                  STATUTORY EXECUTIVE REGISTRY
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                Live project statuses after final sign-off or verdict from the NITA Director General — including full statutory reasons when a project is <strong>Rejected</strong> or <strong>Requires More Understanding</strong>.
              </p>
            </div>
          </div>

          {onNavigate && (currentRole === 'Super Administrator' || currentRole === 'National AI Authority' || currentRole === 'Government Administrator') && (
            <button
              onClick={() => onNavigate('dg_queue')}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                fontSize: '0.76rem',
                fontWeight: 700,
              }}
            >
              <Stamp size={14} /> Open DG Sign-Off Queue <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Summary Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setVerdictFilter('All')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: verdictFilter === 'All' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.03)',
              color: verdictFilter === 'All' ? '#fff' : 'var(--text-secondary)',
              border: verdictFilter === 'All' ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            All Projects ({filteredProjects.length})
          </button>

          <button
            onClick={() => setVerdictFilter('Approved')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: verdictFilter === 'Approved' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.06)',
              color: '#10b981',
              border: verdictFilter === 'Approved' ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(16, 185, 129, 0.22)',
            }}
          >
            <CheckCircle2 size={14} /> DG Approved ({filteredProjects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Approved').length})
          </button>

          <button
            onClick={() => setVerdictFilter('Requires More Understanding')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: verdictFilter === 'Requires More Understanding' ? 'rgba(245, 158, 11, 0.24)' : 'rgba(245, 158, 11, 0.07)',
              color: '#fbbf24',
              border: verdictFilter === 'Requires More Understanding' ? '1px solid rgba(245, 158, 11, 0.65)' : '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <RotateCcw size={14} /> Requires More Understanding ({filteredProjects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Requires More Understanding').length})
          </button>

          <button
            onClick={() => setVerdictFilter('Rejected')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: verdictFilter === 'Rejected' ? 'rgba(239, 68, 68, 0.24)' : 'rgba(239, 68, 68, 0.07)',
              color: '#f87171',
              border: verdictFilter === 'Rejected' ? '1px solid rgba(239, 68, 68, 0.65)' : '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            <XCircle size={14} /> Rejected by DG ({filteredProjects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Rejected').length})
          </button>

          <button
            onClick={() => setVerdictFilter('Awaiting DG')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: verdictFilter === 'Awaiting DG' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.05)',
              color: '#38bdf8',
              border: verdictFilter === 'Awaiting DG' ? '1px solid rgba(56, 189, 248, 0.55)' : '1px solid rgba(56, 189, 248, 0.2)',
            }}
          >
            <Clock size={14} /> Awaiting DG Sign-Off ({filteredProjects.filter(p => resolveProjectDGVerdict(p).statusLabel === 'Awaiting DG').length})
          </button>
        </div>

        {/* Project Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
          {verdictFilteredProjects.map(project => {
            const v = resolveProjectDGVerdict(project);
            const isRejected = v.statusLabel === 'Rejected';
            const isRequiresUnderstanding = v.statusLabel === 'Requires More Understanding';
            const isApproved = v.statusLabel === 'Approved';

            const borderColor = isRejected
              ? 'rgba(239, 68, 68, 0.45)'
              : isRequiresUnderstanding
              ? 'rgba(245, 158, 11, 0.45)'
              : isApproved
              ? 'rgba(16, 185, 129, 0.4)'
              : 'rgba(255, 255, 255, 0.1)';

            const cardBg = isRejected
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.07) 0%, rgba(15, 23, 42, 0.92) 100%)'
              : isRequiresUnderstanding
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(15, 23, 42, 0.92) 100%)'
              : isApproved
              ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(15, 23, 42, 0.92) 100%)'
              : 'rgba(255, 255, 255, 0.02)';

            return (
              <div
                key={project.id}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {/* Top Row: Code + Operational Status + DG Final Verdict Badge */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                        {project.projectCode}
                      </span>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: project.status === 'Active'
                          ? 'rgba(16, 185, 129, 0.14)'
                          : project.status === 'Suspended'
                          ? 'rgba(239, 68, 68, 0.18)'
                          : 'rgba(245, 158, 11, 0.16)',
                        color: project.status === 'Active'
                          ? '#10b981'
                          : project.status === 'Suspended'
                          ? '#f87171'
                          : '#fbbf24',
                      }}>
                        Project Status: {project.status.toUpperCase()}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', marginTop: '6px', marginBottom: '2px' }}>
                      {project.name}
                    </h4>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                      {project.mda} ({project.mdaCode}) • Sector: <strong style={{ color: '#e2e8f0' }}>{project.sector}</strong>
                    </div>
                    <div style={{ fontSize: '0.73rem', marginTop: '4px', color: isProjectApproved(project) ? '#10b981' : '#fbbf24', fontWeight: 700 }}>
                      Budget Allocation: GHS {project.budget.totalAllocated.toLocaleString('en-US')} ({isProjectApproved(project) ? '✓ Included in Approved Budget' : isRejected ? '✕ Excluded (Rejected)' : '⏳ Pending DG Approval'})
                    </div>
                  </div>

                  {/* DG Verdict Pill */}
                  <div>
                    {isApproved && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.5)'
                      }}>
                        <CheckCircle2 size={13} /> DG APPROVED
                      </span>
                    )}
                    {isRequiresUnderstanding && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'rgba(245, 158, 11, 0.22)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.55)'
                      }}>
                        <RotateCcw size={13} /> REQUIRES MORE UNDERSTANDING
                      </span>
                    )}
                    {isRejected && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'rgba(239, 68, 68, 0.22)',
                        color: '#f87171',
                        border: '1px solid rgba(239, 68, 68, 0.55)'
                      }}>
                        <XCircle size={13} /> DG REJECTED
                      </span>
                    )}
                    {!v.hasFinalVerdict && (
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '5px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: 'rgba(56, 189, 248, 0.14)',
                        color: '#38bdf8',
                        border: '1px solid rgba(56, 189, 248, 0.35)'
                      }}>
                        <Clock size={13} /> {project.reviewStatus ? project.reviewStatus.toUpperCase() : 'AWAITING DG SIGN-OFF'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reasons / Executive Directive Box */}
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: isRejected
                    ? 'rgba(239, 68, 68, 0.12)'
                    : isRequiresUnderstanding
                    ? 'rgba(245, 158, 11, 0.12)'
                    : isApproved
                    ? 'rgba(16, 185, 129, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderLeft: `3px solid ${
                    isRejected
                      ? '#ef4444'
                      : isRequiresUnderstanding
                      ? '#f59e0b'
                      : isApproved
                      ? '#10b981'
                      : '#38bdf8'
                  }`,
                }}>
                  <div style={{
                    fontSize: '0.7rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '5px',
                    color: isRejected
                      ? '#fca5a5'
                      : isRequiresUnderstanding
                      ? '#fde68a'
                      : isApproved
                      ? '#6ee7b7'
                      : '#7dd3fc'
                  }}>
                    {isRejected && '🚨 Director General Rejection Reasons & Statutory Grounds:'}
                    {isRequiresUnderstanding && '⚠️ Why Project Requires More Understanding / Clarification (DG Directive):'}
                    {isApproved && '✓ Director General Final Sign-Off Remarks & Approval Mandate:'}
                    {!v.hasFinalVerdict && 'ℹ️ Current Review & Vetting Status:'}
                  </div>
                  <div style={{ fontSize: '0.79rem', color: '#f1f5f9', lineHeight: '1.5' }}>
                    {v.reasons}
                  </div>
                </div>

                {/* Signer & Seal Footer */}
                {v.hasFinalVerdict && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '8px',
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.69rem',
                    color: 'var(--text-muted)'
                  }}>
                    <div>
                      Signed by: <strong style={{ color: '#e2e8f0' }}>{v.signedByName}</strong>
                      {v.signedAt ? ` • ${new Date(v.signedAt).toLocaleString()}` : ''}
                    </div>
                    {v.signatureSeal && (
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.65rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#cbd5e1',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}>
                        SEAL: {v.signatureSeal}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Charts Panels */}
      <div className="chart-grid">
        {/* Budget utilization Bar chart */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Financial Allotments (GHS Millions)</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px' }}>
              Indexed by MDA Code
            </span>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={budgetChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" height={36} iconSize={12} iconType="circle" wrapperStyle={{ fontSize: '0.8rem' }} />
                <Bar name="Allocated Budget" dataKey="Approved" fill="rgba(16, 185, 129, 0.75)" radius={[4, 4, 0, 0]} />
                <Bar name="Utilized Funds" dataKey="Utilized" fill="rgba(251, 191, 36, 0.75)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sectoral concentration Radar chart */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Sector distribution</h3>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={sectorChartData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="subject" stroke="var(--text-secondary)" fontSize={10} />
                <PolarRadiusAxis angle={30} domain={[0, 4]} stroke="rgba(255,255,255,0.15)" fontSize={8} />
                <Radar
                  name="Projects Count"
                  dataKey="count"
                  stroke="var(--ghana-emerald)"
                  fill="rgba(16, 185, 129, 0.2)"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Trends & Notification panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Compliance trends Line chart */}
        <div className="glass-card" style={{ minHeight: '260px' }}>
          <div className="chart-header">
            <h3 className="chart-title">Ethical Compliance Trends</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--ghana-emerald)' }}>
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Upward Trajectory (+14%)</span>
            </div>
          </div>
          <div style={{ height: '180px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={10} />
                <YAxis stroke="var(--text-secondary)" fontSize={10} />
                <Tooltip contentStyle={{ background: '#111b27', border: '1px solid var(--border-color)' }} />
                <Line 
                  type="monotone" 
                  dataKey="Compliance" 
                  stroke="var(--ghana-emerald)" 
                  strokeWidth={2.5} 
                  dot={{ fill: 'var(--ghana-emerald)', strokeWidth: 2 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Alerts and system audits panel */}
        <div className="glass-card" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="chart-title">System Status & Regulatory Notices</h3>
            <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Active Alerts</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto' }}>
            {getNotifications().map((note, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '12px', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  background: 'rgba(255,255,255,0.015)', 
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem'
                }}
              >
                {note.type === 'danger' && <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />}
                {note.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                {note.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                {note.type === 'info' && <HelpCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{note.message}</div>
                  {note.reason && (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: '1.4' }}>
                      {note.reason}
                    </div>
                  )}
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{note.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
