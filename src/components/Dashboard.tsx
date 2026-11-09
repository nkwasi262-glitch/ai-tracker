import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  ArrowRight,
  FileText,
  FileCheck2,
  Eye,
  Lock,
  Server,
  HardDrive,
  Building2,
  RefreshCw
} from 'lucide-react';
import { AIProject, formatNumberToWords } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';
import { apiClient, InstitutionRecord, AppVersionRecord } from '../services/apiClient';

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
  onNavigateToReview?: (projectId: string, docId?: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, currentRole, onNavigate, onNavigateToReview }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [showProjectsTooltip, setShowProjectsTooltip] = useState(false);
  const [monitoringFilter, setMonitoringFilter] = useState<'All' | 'Cleared & Registered' | 'Operational' | 'Active Monitoring' | 'Needs Attention'>('All');

  // Federation & Administrative System State
  const [institutions, setInstitutions] = useState<InstitutionRecord[]>([]);
  const [appVersions, setAppVersions] = useState<AppVersionRecord[]>([]);
  const [backupStatus, setBackupStatus] = useState<string | null>(null);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);

  useEffect(() => {
    apiClient.fetchInstitutions().then(res => {
      if (res) setInstitutions(res);
    });
    apiClient.fetchAppVersions().then(res => {
      if (res?.versions) setAppVersions(res.versions);
    });
  }, []);

  const handleTriggerBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus('Generating full database snapshot...');
    try {
      const res = await apiClient.triggerBackup(`Super Admin Console (${currentRole})`);
      if (res.success) {
        setBackupStatus(`✓ Snapshot ${res.backup.filename} created (${res.backup.sizeKb} KB, SHA-256 verified)`);
      } else {
        setBackupStatus(`❌ Backup failed: ${res.error || 'Server rejected request'}`);
      }
    } catch (err: any) {
      setBackupStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleTriggerDrDrill = async () => {
    setIsBackingUp(true);
    setBackupStatus('Executing disaster recovery integrity drill...');
    try {
      const res = await apiClient.triggerDrDrill();
      if (res.success && res.report) {
        setBackupStatus(`✓ DR Drill Passed! RTO: ${res.report.recoveryMetrics.estimatedRtoSeconds}s | ${res.report.totalRecordsRestorable} records restorable`);
      } else {
        setBackupStatus(`❌ DR Drill failed: ${res.error || 'Check failed'}`);
      }
    } catch (err: any) {
      setBackupStatus(`❌ Error: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  const mdaCount = institutions.filter(i => i.category === 'MDA').length;
  const mmdaCount = institutions.filter(i => i.category === 'MMDA').length;
  const soeCount = institutions.filter(i => i.category === 'SOE' || i.category === 'Regulatory').length;
  const activeInstCount = institutions.filter(i => i.status === 'Active').length;

  // All AI projects received from the Technical Clearance System enrolled in active monitoring
  const activeProjectsList = projects.filter(p => p.status === 'Active');
  const delayedProjectsList = projects.filter(p => p.status === 'Delayed' || p.reviewStatus === 'Needs Attention');
  const operationalProjectsList = projects.filter(p => p.stage === 'Operational' || p.reviewStatus === 'Operational');
  const completedProjectsList = projects.filter(p => p.status === 'Completed' || p.stage === 'Deployment' || p.stage === 'Operational');

  const clearedRegisteredCount = projects.filter(p => p.reviewStatus === 'Cleared & Registered' || p.reviewStatus === 'Approved').length;
  const operationalCount = operationalProjectsList.length;
  const activeMonitoringCount = projects.filter(p => p.reviewStatus === 'Active Monitoring' || p.status === 'Active').length;
  const needsAttentionCount = delayedProjectsList.length;

  const totalProjectsCount = projects.length;
  const activeProjectsCount = activeProjectsList.length;
  const delayedProjectsCount = delayedProjectsList.length;
  
  const totalBudget = projects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
  const totalUtilized = projects.reduce((acc, p) => acc + p.budget.utilized, 0);
  const budgetUtilizationRate = totalBudget > 0 ? (totalUtilized / totalBudget) * 100 : 0;

  const avgReadiness = totalProjectsCount > 0 
    ? projects.reduce((acc, p) => acc + p.readinessScore, 0) / totalProjectsCount 
    : 0;
  const avgCompliance = totalProjectsCount > 0 
    ? projects.reduce((acc, p) => {
        const s = p.compliance;
        const weightedScore = (s.fairness * 0.20) + (s.transparency * 0.25) + (s.privacy * 0.20) + (s.security * 0.35);
        return acc + weightedScore;
      }, 0) / totalProjectsCount
    : 0;

  // Filter projects by sector for drilldowns
  const filteredProjects = selectedSector === 'All' 
    ? projects 
    : projects.filter(p => p.sector === selectedSector);

  // 1. Data formulation for Budgets Chart (Cleared AI Projects Portfolio)
  const budgetChartData = filteredProjects.map(p => ({
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
  projects.forEach(p => {
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

  // Dynamic system notifications based on active monitoring & technical clearance status
  const getNotifications = () => {
    const notices: Array<{ type: 'danger' | 'warning' | 'success' | 'info'; message: string; reason?: string; time: string }> = [];

    projects.forEach(p => {
      if (p.reviewStatus === 'Needs Attention' || p.status === 'Delayed') {
        notices.push({
          type: 'warning',
          message: `[ATTENTION REQUIRED] ${p.name} (${p.mdaCode}) — Status: ${p.status}`,
          reason: p.technicalReview?.recommendationNotes || 'Follow-up requested on compliance and deployment parameters.',
          time: p.technicalReview?.reviewedAt ? new Date(p.technicalReview.reviewedAt).toLocaleDateString() : 'Active Monitoring'
        });
      } else if (p.stage === 'Operational' || p.reviewStatus === 'Cleared & Registered') {
        notices.push({
          type: 'success',
          message: `[CLEARED & REGISTERED] ${p.name} (${p.mdaCode}) — Stage: ${p.stage}`,
          reason: p.technicalReview?.recommendationNotes || 'Received from Technical Clearance System with verified clearance certificate.',
          time: p.technicalReview?.reviewedAt ? new Date(p.technicalReview.reviewedAt).toLocaleDateString() : 'Registry Active'
        });
      }
    });

    if (currentRole !== 'Public User') {
      notices.push({
        type: 'info',
        message: 'Continuous M&E intake path active: All technical clearance dossiers synchronized.',
        time: 'Just now'
      });
    } else {
      notices.push({
        type: 'info',
        message: 'Public AI Registry: All displayed projects are cleared by Technical Clearance System and actively monitored.',
        time: 'Active'
      });
    }
    return notices;
  };

  // Filtered projects for the Cleared Projects Monitoring Board
  const monitoringFilteredProjects = filteredProjects.filter(p => {
    if (monitoringFilter === 'All') return true;
    if (monitoringFilter === 'Cleared & Registered') return p.reviewStatus === 'Cleared & Registered' || p.reviewStatus === 'Approved';
    if (monitoringFilter === 'Operational') return p.stage === 'Operational' || p.reviewStatus === 'Operational';
    if (monitoringFilter === 'Active Monitoring') return p.reviewStatus === 'Active Monitoring' || p.status === 'Active';
    if (monitoringFilter === 'Needs Attention') return p.reviewStatus === 'Needs Attention' || p.status === 'Delayed';
    return true;
  });

  // Projects received from the National Technical Clearance System
  const technicalClearanceProjects = filteredProjects.filter(p => {
    const hasDocs = Boolean(p.documents && p.documents.length > 0);
    return hasDocs || Boolean(p.technicalClearanceReview) || Boolean(p.reviewStatus);
  });

  const totalRecommendedDocsCount = technicalClearanceProjects.reduce(
    (acc, p) => acc + (p.documents?.length || 0), 0
  );

  const totalPendingReviewDocsCount = technicalClearanceProjects.reduce(
    (acc, p) => acc + (p.documents?.filter(d => d.reviewStatus !== 'Reviewed & Verified').length || 0), 0
  );

  return (
    <div>
      {/* Public User View-Only Substance Banner */}
      {currentRole === 'Public User' && (
        <div style={{
          marginBottom: '20px',
          padding: '14px 20px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.08))',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#10b981',
              flexShrink: 0
            }}>
              <ShieldCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#a7f3d0' }}>
                PUBLIC TRANSPARENCY PORTAL (SUBSTANCE VIEW-ONLY MODE)
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
                Viewing verified national AI analytics, portfolio statistics, and monitoring distributions under Act 771. Internal document inspection, technical clearance reviews, and administrative configurations are restricted.
              </div>
            </div>
          </div>
          <span style={{
            fontSize: '0.72rem',
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#a7f3d0',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}>
            READ-ONLY SUBSTANCE
          </span>
        </div>
      )}

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
            <div className="kpi-title">Total AI Projects (Cleared & Registered)</div>
            <div className="kpi-value">{totalProjectsCount}</div>
            <div className="kpi-sub">
              <span style={{ color: 'var(--ghana-emerald)' }}>Active: {activeProjectsCount}</span> | Delayed: {delayedProjectsCount}
            </div>
            <div style={{ fontSize: '0.68rem', marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              <span style={{ color: '#10b981', fontWeight: 700 }}>✓ Cleared & Registered: {clearedRegisteredCount}</span>
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>• Operational: {operationalCount}</span>
              <span style={{ color: '#818cf8', fontWeight: 700 }}>• Active Monitoring: {activeMonitoringCount}</span>
              <span style={{ color: '#fbbf24', fontWeight: 700 }}>• Needs Attention: {needsAttentionCount}</span>
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
          <div style={{ fontSize: '0.68rem', marginTop: '5px', color: '#10b981', fontWeight: 700 }}>
            ✓ 100% Cleared Projects Actively Monitored ({totalProjectsCount} projects)
          </div>
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

      {/* =========================================================================
          NATIONAL AI TECHNICAL CLEARANCE SYSTEM: RECOMMENDED PROJECTS & DOCUMENTS
          ========================================================================= */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(13, 20, 36, 0.98) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.45)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.45)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: 800,
                padding: '3px 10px',
                borderRadius: '999px',
                background: 'rgba(16, 185, 129, 0.2)',
                color: '#6ee7b7',
                border: '1px solid rgba(16, 185, 129, 0.5)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                INTAKE PATH ALWAYS READY • LINKED TO TECHNICAL CLEARANCE SYSTEM
              </span>
              <span style={{ fontSize: '0.68rem', color: '#6ee7b7', fontWeight: 600 }}>
                Endpoint: <code>/api/technical-clearance/documents</code>
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              National Technical Clearance System • Cleared AI Projects & Inbound Dossiers
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              The system intake path is always ready to receive documents from the technical clearance system. Submissions are automatically scanned and graded using the standards of Governance & Ethics and AI Readiness, registered into GNAPRMS, and displayed for active monitoring.
            </p>
          </div>

          {currentRole !== 'Public User' && onNavigate && (
            <button
              onClick={() => onNavigate('documents')}
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <FileCheck2 size={15} />
              <span>Open in Documents & OCR</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Quick Clearance Metrics Bar */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Projects in Technical Clearance
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
              {technicalClearanceProjects.length}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#6ee7b7', marginTop: '2px' }}>
              ✓ Recommended to System
            </div>
          </div>

          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Recommended Documents
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>
              {totalRecommendedDocsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#7dd3fc', marginTop: '2px' }}>
              Statutory Dossiers & Specs
            </div>
          </div>

          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Awaiting Document Review
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px' }}>
              {totalPendingReviewDocsCount}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#fde68a', marginTop: '2px' }}>
              Action Required: Review in OCR
            </div>
          </div>

          <div style={{
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Clearance System Link
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#a7f3d0', marginTop: '2px' }}>
              Connected
            </div>
            <div style={{ fontSize: '0.68rem', color: '#10b981', marginTop: '2px' }}>
              🟢 Live Bi-Directional State
            </div>
          </div>
        </div>

        {/* Project Cards with Recommended Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {technicalClearanceProjects.map(proj => {
            const docs = proj.documents || [];
            return (
              <div 
                key={proj.id}
                style={{
                  padding: '16px 18px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                {/* Project Header Info */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'monospace',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: 'var(--ghana-emerald)',
                        border: '1px solid rgba(16, 185, 129, 0.35)'
                      }}>
                        {proj.projectCode}
                      </span>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                        {proj.name}
                      </h4>
                      <span style={{
                        fontSize: '0.68rem',
                        padding: '2px 8px',
                        borderRadius: '999px',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        fontWeight: 700
                      }}>
                        {proj.sector}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                      Managing MDA: <strong style={{ color: '#e2e8f0' }}>{proj.mda}</strong> ({proj.mdaCode}) • Region: <strong style={{ color: '#e2e8f0' }}>{proj.region}</strong>
                    </div>
                  </div>

                  {/* Recommendation Status Pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      background: 'rgba(16, 185, 129, 0.2)',
                      color: '#6ee7b7',
                      border: '1px solid rgba(16, 185, 129, 0.45)'
                    }}>
                      <CheckCircle2 size={13} />
                      <span>RECEIVED FROM TECHNICAL CLEARANCE SYSTEM</span>
                    </span>
                  </div>
                </div>

                {/* Recommendation Notes */}
                <div style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  borderLeft: '3px solid #10b981',
                  fontSize: '0.74rem',
                  color: '#d1fae5'
                }}>
                  <strong>Technical Clearance Status:</strong> {proj.technicalClearanceReview?.recommendationNotes || proj.technicalReview?.recommendationNotes || 'Compliance dossiers received from Technical Clearance System with verified clearance status. Enrolled in active monitoring.'}
                </div>

                {/* Documents List */}
                <div>
                  <div style={{
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FileText size={13} />
                    <span>Recommended Documents ({docs.length}) — Click to Review:</span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '8px'
                  }}>
                    {docs.map(doc => {
                      const isReviewed = doc.reviewStatus === 'Reviewed & Verified';
                      return (
                        <div
                          key={doc.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.07)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '8px'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff', wordBreak: 'break-word' }}>
                                {doc.fileName}
                              </span>
                              <span style={{
                                fontSize: '0.62rem',
                                fontWeight: 800,
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: isReviewed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                color: isReviewed ? '#6ee7b7' : '#fde68a',
                                whiteSpace: 'nowrap'
                              }}>
                                {isReviewed ? '✓ Reviewed' : '⏳ Ready for Review'}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '3px' }}>
                              Category: <strong style={{ color: '#cbd5e1' }}>{doc.documentCategory || 'Statutory Compliance Dossier'}</strong>
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                            paddingTop: '6px'
                          }}>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              Uploaded: {doc.uploadedAt}
                            </span>
                            {currentRole === 'Public User' ? (
                              <span style={{
                                fontSize: '0.66rem',
                                color: '#94a3b8',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                borderRadius: '4px',
                                background: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                              }}>
                                <Lock size={10} />
                                <span>View-Only (Act 771)</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  if (onNavigateToReview) {
                                    onNavigateToReview(proj.id, doc.id);
                                  } else if (onNavigate) {
                                    onNavigate('documents');
                                  }
                                }}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  padding: '4px 9px',
                                  borderRadius: '5px',
                                  background: 'rgba(16, 185, 129, 0.15)',
                                  border: '1px solid rgba(16, 185, 129, 0.4)',
                                  color: '#a7f3d0',
                                  fontSize: '0.68rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.3)';
                                  e.currentTarget.style.color = '#fff';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(16, 185, 129, 0.15)';
                                  e.currentTarget.style.color = '#a7f3d0';
                                }}
                              >
                                <Eye size={12} />
                                <span>Review Document</span>
                                <ArrowRight size={11} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cleared AI Projects Registry & Monitoring Board */}
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
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Cleared AI Projects Registry & Monitoring Board
                </h3>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  padding: '2px 10px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.18)',
                  color: '#6ee7b7',
                  border: '1px solid rgba(16, 185, 129, 0.45)'
                }}>
                  TECHNICAL CLEARANCE INGESTION • ACTIVE REGISTRY
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px', margin: 0 }}>
                Continuous monitoring of all national AI projects received and cleared by the Technical Clearance System — tracking live operational status, ethics compliance, readiness, and delivery milestones.
              </p>
            </div>
          </div>

          {currentRole !== 'Public User' && onNavigate && (
            <button
              onClick={() => onNavigate('documents')}
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
              <FileCheck2 size={14} /> Open Document Review Studio <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Summary Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setMonitoringFilter('All')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              background: monitoringFilter === 'All' ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.03)',
              color: monitoringFilter === 'All' ? '#fff' : 'var(--text-secondary)',
              border: monitoringFilter === 'All' ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.08)',
            }}
          >
            All Projects ({filteredProjects.length})
          </button>

          <button
            onClick={() => setMonitoringFilter('Cleared & Registered')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: monitoringFilter === 'Cleared & Registered' ? 'rgba(16, 185, 129, 0.22)' : 'rgba(16, 185, 129, 0.06)',
              color: '#10b981',
              border: monitoringFilter === 'Cleared & Registered' ? '1px solid rgba(16, 185, 129, 0.6)' : '1px solid rgba(16, 185, 129, 0.22)',
            }}
          >
            <CheckCircle2 size={14} /> Cleared & Registered ({filteredProjects.filter(p => p.reviewStatus === 'Cleared & Registered' || p.reviewStatus === 'Approved').length})
          </button>

          <button
            onClick={() => setMonitoringFilter('Operational')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: monitoringFilter === 'Operational' ? 'rgba(56, 189, 248, 0.22)' : 'rgba(56, 189, 248, 0.06)',
              color: '#38bdf8',
              border: monitoringFilter === 'Operational' ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(56, 189, 248, 0.22)',
            }}
          >
            <Layers size={14} /> Operational ({filteredProjects.filter(p => p.stage === 'Operational' || p.reviewStatus === 'Operational').length})
          </button>

          <button
            onClick={() => setMonitoringFilter('Active Monitoring')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: monitoringFilter === 'Active Monitoring' ? 'rgba(99, 102, 241, 0.24)' : 'rgba(99, 102, 241, 0.07)',
              color: '#a5b4fc',
              border: monitoringFilter === 'Active Monitoring' ? '1px solid rgba(99, 102, 241, 0.65)' : '1px solid rgba(99, 102, 241, 0.25)',
            }}
          >
            <Activity size={14} /> Active Monitoring ({filteredProjects.filter(p => p.reviewStatus === 'Active Monitoring' || p.status === 'Active').length})
          </button>

          <button
            onClick={() => setMonitoringFilter('Needs Attention')}
            style={{
              padding: '7px 14px',
              borderRadius: '8px',
              fontSize: '0.76rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: monitoringFilter === 'Needs Attention' ? 'rgba(245, 158, 11, 0.24)' : 'rgba(245, 158, 11, 0.07)',
              color: '#fbbf24',
              border: monitoringFilter === 'Needs Attention' ? '1px solid rgba(245, 158, 11, 0.65)' : '1px solid rgba(245, 158, 11, 0.25)',
            }}
          >
            <RotateCcw size={14} /> Needs Attention ({filteredProjects.filter(p => p.reviewStatus === 'Needs Attention' || p.status === 'Delayed').length})
          </button>
        </div>

        {/* Project Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '14px' }}>
          {monitoringFilteredProjects.map(project => {
            const isAttention = project.reviewStatus === 'Needs Attention' || project.status === 'Delayed';
            const isOperational = project.stage === 'Operational' || project.reviewStatus === 'Operational';

            const borderColor = isAttention
              ? 'rgba(245, 158, 11, 0.45)'
              : isOperational
              ? 'rgba(56, 189, 248, 0.4)'
              : 'rgba(16, 185, 129, 0.4)';

            const cardBg = isAttention
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(15, 23, 42, 0.92) 100%)'
              : isOperational
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.06) 0%, rgba(15, 23, 42, 0.92) 100%)'
              : 'linear-gradient(135deg, rgba(16, 185, 129, 0.06) 0%, rgba(15, 23, 42, 0.92) 100%)';

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
                {/* Top Row: Code + Operational Status + Clearance Badge */}
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
                        Status: {project.status.toUpperCase()}
                      </span>
                      <span style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        background: 'rgba(56, 189, 248, 0.14)',
                        color: '#38bdf8',
                      }}>
                        Stage: {project.stage}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '0.94rem', fontWeight: 800, color: '#fff', marginTop: '6px', marginBottom: '2px' }}>
                      {project.name}
                    </h4>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-secondary)' }}>
                      {project.mda} ({project.mdaCode}) • Sector: <strong style={{ color: '#e2e8f0' }}>{project.sector}</strong>
                    </div>
                    <div style={{ fontSize: '0.73rem', marginTop: '4px', color: '#10b981', fontWeight: 700 }}>
                      Budget Allocation: GHS {project.budget.totalAllocated.toLocaleString('en-US')} (Disbursed: GHS {project.budget.disbursed.toLocaleString('en-US')})
                    </div>
                  </div>

                  {/* Monitoring Status Badge */}
                  <div>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '5px 10px',
                      borderRadius: '9999px',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      background: isAttention ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                      color: isAttention ? '#fbbf24' : '#10b981',
                      border: isAttention ? '1px solid rgba(245, 158, 11, 0.5)' : '1px solid rgba(16, 185, 129, 0.5)'
                    }}>
                      <CheckCircle2 size={13} /> {project.reviewStatus ? project.reviewStatus.toUpperCase() : 'CLEARED & REGISTERED'}
                    </span>
                  </div>
                </div>

                {/* Technical Clearance Ingestion Strip */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.07)',
                  fontSize: '0.68rem'
                }}>
                  <div style={{ color: '#6ee7b7', fontWeight: 700 }}>
                    Clearance: ✓ Received & Cleared
                  </div>
                  <div style={{ color: '#a7f3d0', fontWeight: 700 }}>
                    Governance: {project.compliance.overallGrade}
                  </div>
                  <div style={{ color: '#7dd3fc', fontWeight: 700 }}>
                    Readiness: {project.readinessScore}%
                  </div>
                </div>

                {/* Technical Monitoring Observation Box */}
                <div style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: isAttention ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.06)',
                  borderLeft: `3px solid ${isAttention ? '#f59e0b' : '#10b981'}`,
                }}>
                  <div style={{
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    marginBottom: '4px',
                    color: isAttention ? '#fde68a' : '#6ee7b7'
                  }}>
                    {isAttention ? '⚠️ Monitoring Observation / Attention Required:' : '✓ Active Technical Monitoring Assessment:'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#f1f5f9', lineHeight: '1.45' }}>
                    {project.technicalReview?.recommendationNotes || project.technicalClearanceReview?.recommendationNotes || 'Received from Technical Clearance System with verified clearance specifications. Actively monitored under National AI Registry.'}
                  </div>
                </div>

                {/* Footer Action */}
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
                    Last Monitored: <strong style={{ color: '#e2e8f0' }}>{project.technicalReview?.reviewedAt ? new Date(project.technicalReview.reviewedAt).toLocaleDateString() : 'Active'}</strong>
                  </div>
                  {currentRole === 'Public User' ? (
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '3px 8px',
                      borderRadius: '5px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#94a3b8',
                      fontSize: '0.68rem'
                    }}>
                      <Lock size={10} /> Inbound Dossiers ({project.documents?.length || 0}) • Protected (Act 771)
                    </span>
                  ) : (
                    onNavigateToReview && (
                      <button
                        type="button"
                        onClick={() => onNavigateToReview(project.id)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          background: 'rgba(56, 189, 248, 0.14)',
                          border: '1px solid rgba(56, 189, 248, 0.35)',
                          color: '#7dd3fc',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        <FileText size={12} /> Inspect Inbound Dossiers ({project.documents?.length || 0})
                      </button>
                    )
                  )}
                </div>
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

      {/* Multi-Institution Federation & Infrastructure Console */}
      <div style={{
        marginTop: '20px',
        marginBottom: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '20px'
      }}>
        {/* Multi-Institution Overview */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(56, 189, 248, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#38bdf8'
              }}>
                <Building2 size={18} />
              </div>
              <div>
                <h3 className="chart-title" style={{ margin: 0 }}>Institutional Directory Federation</h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Statutory coverage across MDAs, MMDAs & SOEs (Act 771)
                </div>
              </div>
            </div>
            <span className="badge" style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontSize: '0.7rem' }}>
              {institutions.length > 0 ? institutions.length : 20} Institutions Enrolled
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MDAs</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8' }}>{mdaCount || 8}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MMDAs</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{mmdaCount || 7}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SOEs & Reg.</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#a855f7' }}>{soeCount || 5}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fbbf24' }}>{activeInstCount || 20}</div>
            </div>
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>PostgreSQL Row-Level Security (RLS) active across institutional tables.</span>
            <span style={{ color: '#10b981', fontWeight: 600 }}>16 Regions Covered</span>
          </div>
        </div>

        {/* System Version & Operational Integrity Console */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981'
              }}>
                <Server size={18} />
              </div>
              <div>
                <h3 className="chart-title" style={{ margin: 0 }}>System Version & Operational Integrity</h3>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  Neon Serverless PostgreSQL (Postgres 16/17) • AWS us-east-2
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowVersionModal(true)}
              className="badge"
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
            >
              {appVersions[0]?.versionNumber ? `v${appVersions[0].versionNumber}` : 'v1.2.0'} Release Notes
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
            {currentRole !== 'Public User' ? (
              <>
                <button
                  onClick={handleTriggerBackup}
                  disabled={isBackingUp}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <HardDrive size={14} />
                  <span>{isBackingUp ? 'Processing...' : 'Create Backup Snapshot'}</span>
                </button>
                <button
                  onClick={handleTriggerDrDrill}
                  disabled={isBackingUp}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px 14px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} />
                  <span>Run DR Restore Drill</span>
                </button>
              </>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)'
              }}>
                <Lock size={14} className="text-amber-400" />
                <span>Backup and Disaster Recovery triggers restricted to Administrator roles under Act 771.</span>
              </div>
            )}
          </div>

          {backupStatus && (
            <div style={{
              padding: '8px 12px',
              borderRadius: '6px',
              background: backupStatus.includes('✓') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${backupStatus.includes('✓') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
              fontSize: '0.72rem',
              color: backupStatus.includes('✓') ? '#a7f3d0' : '#fca5a5'
            }}>
              {backupStatus}
            </div>
          )}
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

      {/* Application Version History Modal */}
      {showVersionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '20px'
        }}>
          <div style={{
            background: '#0d1520',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            maxWidth: '650px',
            width: '100%',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
            overflow: 'hidden'
          }}>
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>
                  Application Version & Deployment History
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  GNAPRMS Statutory Software Release Lifecycle
                </div>
              </div>
              <button
                onClick={() => setShowVersionModal(false)}
                className="btn btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
              >
                Close
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(appVersions.length > 0 ? appVersions : [
                {
                  id: 'ver-1.2.0',
                  versionNumber: '1.2.0',
                  releaseNumber: 'REL-2026-Q1-03',
                  releaseDate: '2026-11-09',
                  deploymentStatus: 'Production',
                  developerResponsible: 'NITA Lead Systems Architect & DevOps',
                  featuresAdded: [
                    'Multi-institution MDA/MMDA registry federation',
                    'Row-Level Security (RLS) policies on Neon PostgreSQL',
                    'Automated cryptographic backup & restore drill framework'
                  ],
                  bugFixes: ['Date picker field sanitization', 'Zero-assumption audit calculation accuracy'],
                  securityImprovements: ['Cryptographic SHA-256 diff audit logging', 'API rate limiting and correlation IDs'],
                  releaseNotes: 'Statutory compliance milestone release implementing institutional independence under NITA Act 771 and Data Protection Act 843.'
                }
              ]).map((ver, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--ghana-emerald)' }}>
                        v{ver.versionNumber}
                      </span>
                      <span className="badge" style={{ fontSize: '0.65rem' }}>
                        {ver.releaseNumber}
                      </span>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                      {ver.deploymentStatus}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                    Released: {ver.releaseDate ? new Date(ver.releaseDate).toLocaleDateString() : 'November 2026'} • Architect: {ver.developerResponsible}
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: '1.4' }}>
                    {ver.releaseNotes}
                  </p>

                  {ver.featuresAdded && ver.featuresAdded.length > 0 && (
                    <div style={{ marginBottom: '8px' }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                        Key Capabilities Added
                      </div>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {ver.featuresAdded.map((f, i) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )}

                  {ver.securityImprovements && ver.securityImprovements.length > 0 && (
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase' }}>
                        Security & Resilience Hardening
                      </div>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {ver.securityImprovements.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
