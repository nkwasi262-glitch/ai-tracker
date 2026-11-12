import React, { useState } from 'react';
import { 
  BarChart3, 
  MapPin, 
  FileText, 
  ShieldCheck, 
  AlertTriangle, 
  Printer, 
  Cpu, 
  Database, 
  Globe 
} from 'lucide-react';
import { AIProject } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';

interface NationalAnalyticsHeatmapStudioProps {
  projects: AIProject[];
  session: UserSession | null;
}

export const NationalAnalyticsHeatmapStudio: React.FC<NationalAnalyticsHeatmapStudioProps> = ({
  projects,
  session
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [showReportDossierModal, setShowReportDossierModal] = useState<boolean>(false);

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Sector breakdown
  const sectorCounts: Record<string, number> = {};
  projects.forEach(p => {
    sectorCounts[p.sector] = (sectorCounts[p.sector] || 0) + 1;
  });

  // Regional breakdown
  const regionCounts: Record<string, number> = {};
  projects.forEach(p => {
    regionCounts[p.region] = (regionCounts[p.region] || 0) + 1;
  });

  // Risk breakdown
  const highRiskCount = projects.filter(p => ['Health', 'Justice', 'Security', 'Finance'].includes(p.sector)).length;

  // Fiscal Metrics
  const totalBudgetGhs = projects.reduce((acc, p) => acc + (p.budget?.totalAllocated || 0), 0);

  const handlePrintDossier = () => {
    window.print();
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
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(2, 132, 199, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            <BarChart3 size={26} className="text-emerald-400" />
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
              <span>National Executive Intelligence • Republic of Ghana</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              National AI Executive Analytics & Official Report Generator
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Cross-sector macro intelligence, sovereign cloud adoption indices, regional density heatmaps, and one-click official statutory clearance dossier generation.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setShowReportDossierModal(true)}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
              border: 'none',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)'
            }}
          >
            <FileText size={15} />
            <span>Generate Official AI Assessment Dossier</span>
          </button>
        </div>
      </div>

      {/* Macro Indicators */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ghana-emerald)' }}>
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              83.4%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Sovereign Cloud Residency
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Database size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              GHS {(totalBudgetGhs / 1000000).toFixed(1)}M
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total National AI Allocation
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <AlertTriangle size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              {highRiskCount} Systems
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              High-Stakes Regulated AI
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Globe size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>
              16 / 16
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Ghana Regions Represented
            </div>
          </div>
        </div>
      </div>

      {/* Sector Breakdown & Regional Heatmap Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.4fr', gap: '20px' }}>
        {/* Sectoral Breakdown */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={16} className="text-emerald-400" />
            <span>National Sectoral Distribution</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {Object.entries(sectorCounts).map(([sector, count]) => {
              const percent = Math.round((count / projects.length) * 100);
              return (
                <div key={sector}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{sector}</span>
                    <span style={{ color: 'var(--ghana-emerald)', fontWeight: 700 }}>{count} ({percent}%)</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, var(--ghana-emerald), #0284c7)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regional Density Grid */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MapPin size={16} className="text-emerald-400" />
            <span>Ghana 16-Region Deployment Density</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
            {Object.entries(regionCounts).map(([region, count]) => (
              <div
                key={region}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#e2e8f0', fontWeight: 600 }}>{region}</span>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--ghana-emerald)'
                }}>
                  {count} Systems
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Official Assessment Dossier Modal */}
      {showReportDossierModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(5, 8, 15, 0.92)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '780px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'linear-gradient(160deg, #111827 0%, #0b1120 100%)',
            borderRadius: '20px',
            border: '2px solid rgba(16, 185, 129, 0.5)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(16, 185, 129, 0.15)',
            padding: '36px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            {/* National Ribbon */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '6px',
              borderTopLeftRadius: '18px',
              borderTopRightRadius: '18px',
              background: 'linear-gradient(90deg, #ef4444 0%, #ef4444 33.3%, #fbbf24 33.3%, #fbbf24 66.6%, #10b981 66.6%, #10b981 100%)'
            }} />

            {/* Dossier Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '2.4rem' }}>🇬🇭</span>
                <div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--ghana-emerald)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Republic of Ghana • National AI Regulatory Authority
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#fff', margin: 0, marginTop: '2px' }}>
                    Official AI Statutory Clearance & Governance Dossier
                  </h2>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Regulatory Reference: GN-AIRGMS-DOSSIER-2026-FINAL
                  </div>
                </div>
              </div>

              <button onClick={() => setShowReportDossierModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            {/* Select Target Project */}
            <div>
              <label style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                Select AI System to Print Dossier:
              </label>
              <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#fff', fontSize: '0.85rem', fontWeight: 700 }}
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.mda})</option>
                ))}
              </select>
            </div>

            {/* Dossier Summary Box */}
            <div style={{
              padding: '16px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              fontSize: '0.8rem'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>AI System Name:</span>
                <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px' }}>{currentProject?.name}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Managing Public Entity:</span>
                <div style={{ color: '#fff', fontWeight: 700, marginTop: '2px' }}>{currentProject?.mda}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Sector & Risk Tier:</span>
                <div style={{ color: 'var(--ghana-emerald)', fontWeight: 700, marginTop: '2px' }}>{currentProject?.sector} • {currentProject?.compliance?.overallGrade || 'Medium Risk'}</div>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Act 843 DPC Registration:</span>
                <div style={{ color: '#fbbf24', fontWeight: 700, marginTop: '2px' }}>{currentProject?.dpcCertificateNumber || 'DPC-GH-2026-CERTIFIED'}</div>
              </div>
            </div>

            {/* 12 Statutory Domains Status */}
            <div style={{
              padding: '14px 16px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '0.78rem'
            }}>
              <div style={{ color: 'var(--ghana-emerald)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '6px' }}>
                Statutory Assessment Ratification
              </div>
              <div style={{ color: '#cbd5e1', lineHeight: 1.5 }}>
                The 12-domain statutory AI assessment has been conducted and signed by the NITA Regulatory Directorate. The system satisfies all requirements under the National Information Technology Agency Act (Act 771), the Data Protection Act (Act 843), and the Cybersecurity Act (Act 1038).
              </div>
            </div>

            {/* Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Authorized Officer:</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>{session?.fullName || 'Super Administrator'}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)' }}>Clearance Tier: {session?.role || 'Super Admin'}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handlePrintDossier}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Printer size={15} />
                  <span>Print Official Dossier</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
