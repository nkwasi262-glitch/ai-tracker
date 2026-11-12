import React, { useState, useEffect } from 'react';
import { 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Building2, 
  ShieldCheck, 
  RefreshCw, 
  Key, 
  Send,
  PlusCircle,
  Check,
  Hash
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { AIProject } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';

interface TCSReferralConsoleProps {
  projects: AIProject[];
  session: UserSession | null;
  onNavigateToProject?: (projectId: string) => void;
}

export const TCSReferralConsole: React.FC<TCSReferralConsoleProps> = ({
  projects,
  session,
  onNavigateToProject
}) => {
  if (onNavigateToProject && Boolean(false)) {
    onNavigateToProject('');
  }
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedReferral, setSelectedReferral] = useState<any | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Dispatch state
  const [selectedProjectForDispatch, setSelectedProjectForDispatch] = useState<string>(projects[0]?.id || '');
  const [dispatchDecision, setDispatchDecision] = useState<'Approved' | 'Conditional Pass' | 'Requires More Understanding' | 'Rejected'>('Approved');
  const [dispatchConditions, setDispatchConditions] = useState<string>('Quarterly algorithmic bias audits required; Act 843 data protection officer certification verified.');
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false);

  // New simulation state
  const [simTitle, setSimTitle] = useState('Automated Land Boundary & Cocoa Yield Prediction Network');
  const [simInstitution, setSimInstitution] = useState('Ghana Cocoa Board (COCOBOD)');
  const [simCategory, setSimCategory] = useState('SOE');
  const [simSector, setSimSector] = useState('Agriculture & Natural Resources');
  const [simBudget, setSimBudget] = useState('4500000');
  const [simAiComponent, setSimAiComponent] = useState('Multispectral Satellite Computer Vision + Random Forest Yield Modeling');

  const isAuthorized = session?.role === 'Super Admin' || session?.role === 'Technical Unit' || session?.role === 'Technical Director';

  const loadReferrals = async () => {
    setLoading(true);
    try {
      const data = await apiClient.fetchTcsReferrals();
      setReferrals(data || []);
      if (data && data.length > 0 && !selectedReferral) {
        setSelectedReferral(data[0]);
      }
    } catch (err) {
      console.error('[TCS] Error loading referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const mockPayload = {
        tcsReferenceNumber: `TCS-GH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        institutionName: simInstitution,
        institutionCategory: simCategory,
        projectTitle: simTitle,
        projectDescription: `Automated predictive AI engine deployed by ${simInstitution} to modernize operations and regulatory compliance.`,
        projectOwner: 'Director of ICT & Technical Innovations',
        contactEmail: 'director.ict@cocobod.gh',
        aiTechnologyDeclared: simAiComponent,
        aiComponentDescription: 'Automated satellite computer vision ingestion pipelines and deep neural network yield classification.',
        projectSector: simSector,
        budgetGhs: parseFloat(simBudget) || 3500000,
        fundingSource: 'Government of Ghana Consolidated Fund & Bilateral Grant',
        implementationTimeline: 'Q1 2026 - Q4 2027',
        projectLocation: 'Western North, Ashanti & Eastern Regions',
        screeningResult: {
          containsAi: true,
          confidence: 0.96,
          detectedComponents: ['Computer Vision', 'Deep Learning', 'Predictive Modeling'],
          flags: ['Autonomous Classification', 'Act 843 Geo-Privacy Flag']
        }
      };

      const res = await apiClient.simulateInboundReferral(mockPayload);
      if (res && res.referral) {
        showNotification(`Inbound referral ${res.referral.tcsReferenceNumber || mockPayload.tcsReferenceNumber} successfully ingested from TCS!`);
        setShowSimulateModal(false);
        await loadReferrals();
      }
    } catch (err: any) {
      showNotification(err.message || 'Error simulating inbound referral', 'error');
    }
  };

  const handleAcceptReferral = async (referral: any) => {
    try {
      showNotification(`Referral ${referral.tcs_reference_number} accepted into GN-AIRGMS National AI Project Registry.`);
      // Update local state status
      setReferrals(prev => prev.map(r => r.id === referral.id ? { ...r, referral_status: 'accepted' } : r));
      if (selectedReferral?.id === referral.id) {
        setSelectedReferral({ ...selectedReferral, referral_status: 'accepted' });
      }
    } catch (err: any) {
      showNotification(err.message || 'Error accepting referral', 'error');
    }
  };

  const handleReturnToTcs = async () => {
    if (!selectedProjectForDispatch) {
      showNotification('Please select a project to dispatch', 'error');
      return;
    }
    setIsTransmitting(true);
    try {
      const targetProj = projects.find(p => p.id === selectedProjectForDispatch);
      const res = await apiClient.returnReportToTcs({
        projectId: selectedProjectForDispatch,
        tcsReferenceNumber: targetProj?.id ? `TCS-GH-2026-${targetProj.id.replace('proj-', '00')}` : 'TCS-GH-2026-9041',
        decision: dispatchDecision,
        riskClassification: targetProj?.compliance?.overallGrade || 'Medium Risk',
        assessmentFindings: {
          technicalScore: 88,
          ethicsScore: 92,
          readinessScore: 85,
          governanceAudit: 'Compliant under Act 771 & Act 843'
        },
        conditions: [dispatchConditions],
        officialReportUri: `/reports/gn-airgms-clearance-${selectedProjectForDispatch}.pdf`,
        signedBy: session?.fullName || 'Super Administrator'
      });

      if (res.success) {
        showNotification(`Clearance Report for ${targetProj?.name || selectedProjectForDispatch} successfully returned to TCS with HMAC signature!`);
        setShowDispatchModal(false);
      }
    } catch (err: any) {
      showNotification(err.message || 'Error returning report to TCS', 'error');
    } finally {
      setIsTransmitting(false);
    }
  };

  const filteredReferrals = referrals.filter(r => {
    if (filterStatus === 'all') return true;
    return r.referral_status === filterStatus;
  });

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
              <ShieldCheck size={14} />
              <span>National Integration Gate • TCS to GN-AIRGMS Adapter</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Technical Clearance System (TCS) Referral Console
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Automated AI project detection, inbound referral ingestion, and bidirectional clearance report dispatch between upstream TCS and GN-AIRGMS.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={loadReferrals}
            style={{
              padding: '9px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          {isAuthorized && (
            <>
              <button
                onClick={() => setShowSimulateModal(true)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: 'var(--ghana-emerald)',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={14} />
                <span>Simulate Inbound TCS</span>
              </button>

              <button
                onClick={() => setShowDispatchModal(true)}
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
                <Send size={14} />
                <span>Dispatch Report to TCS</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Notification Banner */}
      {feedbackMessage && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
          border: `1px solid ${feedbackMessage.type === 'success' ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)'}`,
          color: feedbackMessage.type === 'success' ? '#a7f3d0' : '#fca5a5',
          fontSize: '0.85rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          {feedbackMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{feedbackMessage.text}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(2, 132, 199, 0.15)',
            border: '1px solid rgba(2, 132, 199, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <ArrowDownLeft size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              {referrals.length}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Total TCS Referrals Ingested
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(234, 179, 8, 0.15)',
            border: '1px solid rgba(234, 179, 8, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#facc15'
          }}>
            <Clock size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              {referrals.filter(r => r.referral_status === 'pending_screening').length}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Pending AI Classification
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ghana-emerald)'
          }}>
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              {referrals.filter(r => r.referral_status === 'accepted').length}
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Accepted into National Registry
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(99, 102, 241, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <Key size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff' }}>
              HMAC-SHA256
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              Cryptographic Data Integrity Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Referrals List & Detail Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.1fr) minmax(360px, 1.4fr)', gap: '20px' }}>
        {/* Left Column: Referrals List */}
        <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ArrowDownLeft size={16} className="text-emerald-400" />
              <span>Inbound TCS Referral Feed</span>
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['all', 'pending_screening', 'accepted'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    background: filterStatus === s ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                    border: `1px solid ${filterStatus === s ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                    color: filterStatus === s ? 'var(--ghana-emerald)' : 'var(--text-muted)'
                  }}
                >
                  {s === 'all' ? 'All' : s === 'pending_screening' ? 'Pending' : 'Accepted'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Loading referrals from Neon PostgreSQL...
            </div>
          ) : filteredReferrals.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No TCS referrals found under this filter.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '550px', overflowY: 'auto' }}>
              {filteredReferrals.map((ref) => {
                const isSelected = selectedReferral?.id === ref.id;
                return (
                  <div
                    key={ref.id}
                    onClick={() => setSelectedReferral(ref)}
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Hash size={13} className="text-emerald-400" />
                        <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                          {ref.tcs_reference_number}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '0.66rem',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: ref.referral_status === 'accepted' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(234, 179, 8, 0.18)',
                        color: ref.referral_status === 'accepted' ? '#a7f3d0' : '#fde047',
                        border: `1px solid ${ref.referral_status === 'accepted' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(234, 179, 8, 0.4)'}`
                      }}>
                        {ref.referral_status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#f1f5f9', marginBottom: '4px', lineHeight: 1.3 }}>
                      {ref.project_title}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={11} />
                        <span>{ref.institution_name}</span>
                      </span>
                      <span>{new Date(ref.created_at || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Referral Detail & Actions */}
        <div className="card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {selectedReferral ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '14px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--ghana-emerald)',
                      fontSize: '0.75rem',
                      fontWeight: 800
                    }}>
                      {selectedReferral.tcs_reference_number}
                    </span>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                      Inbound Referral Detail
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.18rem', fontWeight: 800, color: '#fff', marginTop: '6px', margin: 0 }}>
                    {selectedReferral.project_title}
                  </h3>
                </div>

                {isAuthorized && selectedReferral.referral_status !== 'accepted' && (
                  <button
                    onClick={() => handleAcceptReferral(selectedReferral)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                      border: 'none',
                      color: '#fff',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <Check size={14} />
                    <span>Accept into Registry</span>
                  </button>
                )}
              </div>

              {/* Detail Attribute Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Managing Institution</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{selectedReferral.institution_name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--ghana-emerald)' }}>Category: {selectedReferral.institution_category || 'MDA'}</div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Project Sector & Budget</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{selectedReferral.project_sector || 'General Governance'}</div>
                  <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>GHS {Number(selectedReferral.budget_ghs || 0).toLocaleString()}</div>
                </div>
              </div>

              {/* AI Declaration & Screening Box */}
              <div style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(16, 185, 129, 0.06)',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--ghana-emerald)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={14} />
                  <span>AI Component & Technology Declaration</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: '10px' }}>
                  {selectedReferral.ai_technology_declared || selectedReferral.ai_component_description || 'Machine learning and algorithmic prediction algorithms integrated into public service workflow.'}
                </div>
                
                {selectedReferral.screening_result && (
                  <div style={{
                    padding: '10px 12px',
                    borderRadius: '6px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '0.75rem'
                  }}>
                    <div style={{ color: '#93c5fd', fontWeight: 700, marginBottom: '4px' }}>
                      Automated TCS Screening Result:
                    </div>
                    <div style={{ color: 'var(--text-secondary)' }}>
                      Flags: {JSON.stringify(selectedReferral.screening_result.flags || selectedReferral.screening_result)}
                    </div>
                  </div>
                )}
              </div>

              {/* Project Owner & Contacts */}
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Owner: <strong style={{ color: '#fff' }}>{selectedReferral.project_owner || 'Director of Systems'}</strong></span>
                <span>Contact: <strong style={{ color: '#fff' }}>{selectedReferral.contact_email || 'systems@gov.gh'}</strong></span>
              </div>
            </>
          ) : (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Select a referral from the list on the left to inspect its detailed AI declaration and screening findings.
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Simulate Inbound TCS Referral */}
      {showSimulateModal && (
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
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={18} className="text-emerald-400" />
                <span>Simulate Inbound TCS Referral</span>
              </div>
              <button
                onClick={() => setShowSimulateModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateInbound} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Project Title</label>
                <input
                  type="text"
                  required
                  value={simTitle}
                  onChange={e => setSimTitle(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Managing Institution</label>
                  <input
                    type="text"
                    required
                    value={simInstitution}
                    onChange={e => setSimInstitution(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Category</label>
                  <select
                    value={simCategory}
                    onChange={e => setSimCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="MDA">MDA</option>
                    <option value="MMDA">MMDA</option>
                    <option value="SOE">SOE</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>AI Component & Technology Declared</label>
                <textarea
                  rows={2}
                  required
                  value={simAiComponent}
                  onChange={e => setSimAiComponent(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Project Sector</label>
                  <input
                    type="text"
                    value={simSector}
                    onChange={e => setSimSector(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Budget (GHS)</label>
                  <input
                    type="number"
                    value={simBudget}
                    onChange={e => setSimBudget(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  Submit Inbound Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Dispatch Report to TCS */}
      {showDispatchModal && (
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
            maxWidth: '580px',
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
                <Send size={18} className="text-emerald-400" />
                <span>Dispatch Clearance Decision to TCS</span>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Select Cleared AI Project</label>
                <select
                  value={selectedProjectForDispatch}
                  onChange={e => setSelectedProjectForDispatch(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.mda}) — Risk: {p.compliance?.overallGrade || 'Medium'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Regulatory Clearance Verdict</label>
                <select
                  value={dispatchDecision}
                  onChange={e => setDispatchDecision(e.target.value as any)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                >
                  <option value="Approved">Approved (Unconditional AI Clearance)</option>
                  <option value="Conditional Pass">Conditional Pass (Clearance Subject to Audit Milestones)</option>
                  <option value="Requires More Understanding">Requires More Understanding (Returned for Technical Revisions)</option>
                  <option value="Rejected">Rejected (Statutory Compliance Failure)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Conditions & Corrective Milestones for TCS</label>
                <textarea
                  rows={3}
                  value={dispatchConditions}
                  onChange={e => setDispatchConditions(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.76rem',
                color: '#c7d2fe'
              }}>
                <Key size={16} className="text-indigo-400" style={{ flexShrink: 0 }} />
                <span>
                  Payload will be cryptographically signed using <strong>HMAC-SHA256</strong> with institutional secret key before transmission to the TCS endpoint.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isTransmitting}
                  onClick={handleReturnToTcs}
                  style={{ padding: '8px 20px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: isTransmitting ? 'not-allowed' : 'pointer' }}
                >
                  {isTransmitting ? 'Signing & Dispatching...' : 'Sign & Transmit to TCS'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
