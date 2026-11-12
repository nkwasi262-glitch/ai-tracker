import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  Send, 
  CheckCircle2, 
  Lock, 
  Eye, 
  Building2, 
  Users
} from 'lucide-react';
import { AIProject } from '../data/sampleProjects';
import { apiClient } from '../services/apiClient';
import { UserSession } from '../data/authTypes';

interface PublicTransparencyPortalProps {
  projects: AIProject[];
  session: UserSession | null;
}

export const PublicTransparencyPortal: React.FC<PublicTransparencyPortalProps> = ({
  projects,
  session
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedProjectForDetail, setSelectedProjectForDetail] = useState<AIProject | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  // Citizen Complaint Form
  const [complaintTitle, setComplaintTitle] = useState('');
  const [complaintProjectId, setComplaintProjectId] = useState(projects[0]?.id || '');
  const [complaintCategory, setComplaintCategory] = useState('Algorithmic Bias / Unfair Denial');
  const [complaintText, setComplaintText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [citizenEmail, setCitizenEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter projects (showing public-cleared projects)
  const publicProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.mda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || p.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  const sectors = ['all', 'Health', 'Agriculture', 'Finance', 'Security', 'Transport', 'Education', 'Justice'];

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.reportIncident({
        projectId: complaintProjectId,
        title: `[Citizen Grievance] ${complaintTitle}`,
        category: complaintCategory,
        severity: 'P3',
        description: complaintText,
        immediateAction: 'Logged via Public Transparency Portal for NITA Ombudsman investigation.',
        reportedBy: isAnonymous ? 'Anonymous Citizen Whistleblower' : (citizenEmail || session?.fullName || 'Citizen')
      });
      setFeedbackSuccess('Your feedback has been logged in the National AI Incident Center with statutory whistleblower tracking.');
      setShowFeedbackModal(false);
      setComplaintTitle('');
      setComplaintText('');
      setTimeout(() => setFeedbackSuccess(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Error submitting citizen feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportOpenData = () => {
    const openData = publicProjects.map(p => ({
      nationalId: p.projectCode,
      systemName: p.name,
      managingMda: p.mda,
      sector: p.sector,
      category: p.category,
      operationalStage: p.stage,
      ethicalGrade: p.compliance?.overallGrade || 'Satisfactory',
      readinessScore: p.readinessScore,
      citizenDataProtection: p.dpcCertificateNumber ? 'DPC Act 843 Registered' : 'Under Review',
      publicDescription: p.description
    }));

    const blob = new Blob([JSON.stringify(openData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ghana-national-ai-open-registry-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{
        padding: '28px 32px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(13, 18, 31, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(2, 132, 199, 0.25))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.9rem'
          }}>
            🇬🇭
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
              <Globe size={14} />
              <span>Republic of Ghana • Public Trust & Open Governance</span>
            </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: 0 }}>
              National AI Public Transparency & Citizen Trust Portal
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Open registry of government artificial intelligence deployments, citizen data safeguards under Act 843, and the civic grievance channel.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={handleExportOpenData}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Download size={15} />
            <span>Open Data Export (JSON)</span>
          </button>

          <button
            onClick={() => setShowFeedbackModal(true)}
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
            <Send size={15} />
            <span>Submit Citizen Concern / Grievance</span>
          </button>
        </div>
      </div>

      {feedbackSuccess && (
        <div style={{
          padding: '14px 20px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.18)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          color: '#a7f3d0',
          fontSize: '0.85rem',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {/* High-Level Civic Metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ghana-emerald)' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              {projects.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Cleared AI Deployments
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(2, 132, 199, 0.15)', border: '1px solid rgba(2, 132, 199, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              18 MDAs & SOEs
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Public Managing Bodies
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              15.2 Million+
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Citizens Reached in Ghana
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
            <Lock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              Act 843
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              DPC Sovereign Data Protected
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 300px' }}>
          <Search size={16} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search public AI system, MDA, or keyword..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', fontSize: '0.88rem', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          <Filter size={14} style={{ color: 'var(--text-muted)' }} />
          {sectors.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSector(s)}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                cursor: 'pointer',
                background: selectedSector === s ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${selectedSector === s ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                color: selectedSector === s ? 'var(--ghana-emerald)' : 'var(--text-muted)'
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Public Projects Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {publicProjects.map(project => (
          <div
            key={project.id}
            className="card"
            style={{
              padding: '22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '16px',
              position: 'relative'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: '4px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--ghana-emerald)',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  {project.projectCode}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(2, 132, 199, 0.15)',
                  color: '#38bdf8',
                  fontWeight: 700
                }}>
                  {project.sector}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                {project.name}
              </h3>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building2 size={12} />
                <span>{project.mda}</span>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '10px', lineHeight: 1.5 }}>
                {project.description}
              </p>
            </div>

            {/* Citizen Protections Strip */}
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              fontSize: '0.74rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Act 843 DPC Status:</span>
                <strong style={{ color: 'var(--ghana-emerald)' }}>
                  {project.dpcCertificateNumber ? 'Certified & Registered' : 'Audited under NITA Framework'}
                </strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Human Oversight:</span>
                <strong style={{ color: '#fff' }}>Manual Appeal Rights Preserved</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedProjectForDetail(project)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.35)',
                  color: 'var(--ghana-emerald)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Eye size={13} />
                <span>Inspect Citizen Trust Dossier</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Inspect Detail */}
      {selectedProjectForDetail && (
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
            maxWidth: '600px',
            width: '100%',
            background: '#111827',
            borderRadius: '16px',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            padding: '26px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 800 }}>
                  {selectedProjectForDetail.projectCode} • Citizen Transparency Dossier
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0, marginTop: '2px' }}>
                  {selectedProjectForDetail.name}
                </h2>
              </div>
              <button onClick={() => setSelectedProjectForDetail(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <p style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0 }}>
              {selectedProjectForDetail.description}
            </p>

            <div style={{
              padding: '14px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '0.78rem'
            }}>
              <div style={{ color: 'var(--ghana-emerald)', fontWeight: 800, textTransform: 'uppercase' }}>
                Citizen Rights & Protection Safeguards
              </div>
              <div style={{ color: '#e2e8f0' }}>
                • <strong>Data Sovereignty:</strong> Training data and inference records reside inside Ghana sovereign data centers compliant with Act 843.
              </div>
              <div style={{ color: '#e2e8f0' }}>
                • <strong>Human-in-the-Loop Override:</strong> Any citizen adversely impacted by an automated recommendation has the legal right to request immediate human review.
              </div>
              <div style={{ color: '#e2e8f0' }}>
                • <strong>Continuous Auditing:</strong> Bi-annual algorithmic fairness inspections are conducted by the NITA Regulatory Directorate.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <button
                onClick={() => setSelectedProjectForDetail(null)}
                style={{ padding: '8px 16px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.08)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Submit Citizen Concern / Whistleblower Grievance */}
      {showFeedbackModal && (
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
            border: '1px solid rgba(16, 185, 129, 0.4)',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} className="text-emerald-400" />
                <span>Submit Citizen AI Grievance / Concern</span>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleSubmitComplaint} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Concern Title / Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unfair rejection of subsidy application by automated algorithm"
                  value={complaintTitle}
                  onChange={e => setComplaintTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Target AI System</label>
                  <select
                    value={complaintProjectId}
                    onChange={e => setComplaintProjectId(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Grievance Category</label>
                  <select
                    value={complaintCategory}
                    onChange={e => setComplaintCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                  >
                    <option value="Algorithmic Bias / Unfair Denial">Algorithmic Bias / Unfair Denial</option>
                    <option value="Privacy / Unauthorized Data Use">Privacy / Unauthorized Data Use</option>
                    <option value="Inaccurate / Hallucinatory Result">Inaccurate / Hallucinatory Result</option>
                    <option value="Lack of Human Appeal">Lack of Human Appeal</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Detailed Grievance Narrative</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what occurred, the institution involved, and how citizen rights were affected..."
                  value={complaintText}
                  onChange={e => setComplaintText(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <input
                  type="checkbox"
                  id="anonCheck"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--ghana-emerald)' }}
                />
                <label htmlFor="anonCheck" style={{ fontSize: '0.78rem', color: '#e2e8f0', cursor: 'pointer' }}>
                  Submit Anonymously as a Public Whistleblower (Protections under Ghana Whistleblower Act 720).
                </label>
              </div>

              {!isAnonymous && (
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Contact Email (For follow-up notifications)</label>
                  <input
                    type="email"
                    placeholder="citizen@email.com"
                    value={citizenEmail}
                    onChange={e => setCitizenEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.82rem' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button type="button" onClick={() => setShowFeedbackModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ padding: '8px 20px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 800, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}>{isSubmitting ? 'Transmitting...' : 'Submit to NITA Ombudsman'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
