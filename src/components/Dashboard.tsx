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
  HelpCircle
} from 'lucide-react';
import { AIProject, formatNumberToWords } from '../data/sampleProjects';
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
}

export const Dashboard: React.FC<DashboardProps> = ({ projects, currentRole }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [showProjectsTooltip, setShowProjectsTooltip] = useState(false);

  const activeProjectsList = projects.filter(p => p.status === 'Active');
  const delayedProjectsList = projects.filter(p => p.status === 'Delayed');
  const completedProjectsList = projects.filter(p => p.status === 'Completed');

  // Calculates KPI values
  const totalProjectsCount = projects.length;
  const activeProjectsCount = projects.filter(p => p.status === 'Active').length;
  const delayedProjectsCount = projects.filter(p => p.status === 'Delayed').length;
  
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

  // 1. Data formulation for Budgets Chart
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

  // Dynamic system notifications based on roles
  const getNotifications = () => {
    const notices = [];
    if (currentRole !== 'Public User') {
      notices.push({
        type: 'warning',
        message: 'GRA Tax Fraud engine milestone verification delayed by 2 weeks.',
        time: '3 hours ago'
      });
      notices.push({
        type: 'danger',
        message: 'Security risk check flagged on Akosombo Dam Hydrology project. Mitigation action required.',
        time: '5 hours ago'
      });
      notices.push({
        type: 'success',
        message: 'Cocoa Board disease predictor ethics review finalized and approved.',
        time: '1 day ago'
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
            <div className="kpi-title">Total AI Projects</div>
            <div className="kpi-value">{totalProjectsCount}</div>
            <div className="kpi-sub">
              <span style={{ color: 'var(--ghana-emerald)' }}>Active: {activeProjectsCount}</span> | Delayed: {delayedProjectsCount}
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
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{note.message}</div>
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
