import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Database, 
  ShieldCheck, 
  PlusCircle, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { AIProject } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';

interface AIModelDatasetStudioProps {
  projects: AIProject[];
  session: UserSession | null;
}

export const AIModelDatasetStudio: React.FC<AIModelDatasetStudioProps> = ({
  projects,
  session
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'models' | 'datasets'>('models');
  const [models, setModels] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showAddModelModal, setShowAddModelModal] = useState<boolean>(false);
  const [showAddDatasetModal, setShowAddDatasetModal] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  // New Model Form State
  const [modelName, setModelName] = useState('');
  const [modelFamily, setModelFamily] = useState('DeepSeek-R1 / Llama 3');
  const [parameterCount, setParameterCount] = useState('70B');
  const [modality] = useState('Multimodal (Text + Vision)');
  const [deploymentType, setDeploymentType] = useState('Self-Hosted (NITA Sovereign Cloud)');
  const [vendor, setVendor] = useState('Open Source Fine-Tuned in Ghana');
  const [contextWindow] = useState('128k tokens');
  const [hallucinationControls, setHallucinationControls] = useState('Deterministic RAG + Output Verification Guardrails');

  // New Dataset Form State
  const [datasetName, setDatasetName] = useState('');
  const [sourceEntity, setSourceEntity] = useState('');
  const [recordsCount, setRecordsCount] = useState('1,250,000');
  const [containsPii, setContainsPii] = useState(false);
  const [consentBasis] = useState('Statutory Mandate (Data Protection Act 843 Section 20)');
  const [dpcRegistrationNo, setDpcRegistrationNo] = useState('DPC-GH-2026-');
  const [storageLocation, setStorageLocation] = useState('Local Ghana Data Center (NITA Primary Data Centre, Accra)');

  const isAuthorized = session?.role === 'Super Admin' || session?.role === 'Technical Unit' || session?.role === 'Technical Director';
  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  const loadData = async () => {
    if (!selectedProjectId) return;
    setLoading(true);
    try {
      const [m, d] = await Promise.all([
        apiClient.fetchProjectModels(selectedProjectId).catch(() => []),
        apiClient.fetchProjectDatasets(selectedProjectId).catch(() => [])
      ]);
      setModels(m || []);
      setDatasets(d || []);
    } catch (err) {
      console.error('[Models/Datasets] Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedProjectId]);

  const handleAddModel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.addProjectModel(selectedProjectId, {
        modelName,
        modelFamily,
        parameterCount,
        modality,
        deploymentType,
        vendor,
        contextWindow,
        hallucinationMitigation: hallucinationControls
      });
      setFeedback('AI Model specification successfully registered in PostgreSQL.');
      setShowAddModelModal(false);
      setModelName('');
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error saving model specification');
    }
  };

  const handleAddDataset = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.addProjectDataset(selectedProjectId, {
        datasetName,
        sourceEntity: sourceEntity || currentProject?.mda,
        recordsCount,
        containsPii,
        consentBasis,
        act843RegistrationNumber: dpcRegistrationNo,
        sovereignStorageLocation: storageLocation
      });
      setFeedback('Dataset governance profile registered with Act 843 compliance.');
      setShowAddDatasetModal(false);
      setDatasetName('');
      await loadData();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback(err.message || 'Error saving dataset record');
    }
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
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(124, 58, 237, 0.2))',
            border: '1px solid rgba(16, 185, 129, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem'
          }}>
            <Cpu size={26} className="text-emerald-400" />
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
              <span>GN-AIRGMS Technical Evaluation Tier</span>
            </div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              AI Model & Dataset Governance Studio
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0 }}>
              Specification catalog for foundation models, algorithmic weights, fine-tuning checkpoints, and Act 843 data sovereignty registries.
            </p>
          </div>
        </div>

        {/* Project Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active AI Project:</span>
            <select
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: '#1f2937',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.mda})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={loadData}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#e2e8f0',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
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

      {/* Mode Navigation Tabs & Action Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '12px'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('models')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'models' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              border: `1px solid ${activeTab === 'models' ? 'rgba(16, 185, 129, 0.45)' : 'transparent'}`,
              color: activeTab === 'models' ? 'var(--ghana-emerald)' : 'var(--text-muted)'
            }}
          >
            <Cpu size={16} />
            <span>AI Models & Architectures ({models.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: activeTab === 'datasets' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
              border: `1px solid ${activeTab === 'datasets' ? 'rgba(16, 185, 129, 0.45)' : 'transparent'}`,
              color: activeTab === 'datasets' ? 'var(--ghana-emerald)' : 'var(--text-muted)'
            }}
          >
            <Database size={16} />
            <span>Datasets & Act 843 Sovereignty ({datasets.length})</span>
          </button>
        </div>

        {isAuthorized && (
          <div>
            {activeTab === 'models' ? (
              <button
                onClick={() => setShowAddModelModal(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={15} />
                <span>Register Model Architecture</span>
              </button>
            ) : (
              <button
                onClick={() => setShowAddDatasetModal(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <PlusCircle size={15} />
                <span>Register Training/Inference Dataset</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Tab 1: AI Models List */}
      {activeTab === 'models' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {models.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              <Cpu size={36} className="text-emerald-400" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>No AI Models Configured for {currentProject?.name}</div>
              <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                Register foundation models, parameters, RAG knowledge stores, and hallucination safeguards.
              </p>
            </div>
          ) : (
            models.map(m => (
              <div key={m.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--ghana-emerald)',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {m.parameter_count || '70B'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {m.modality || 'Multimodal'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {m.model_name}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Family: <strong style={{ color: '#e2e8f0' }}>{m.model_family}</strong> • Vendor: <strong style={{ color: '#e2e8f0' }}>{m.vendor}</strong>
                </div>

                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ color: '#38bdf8' }}>
                    Deployment: <strong>{m.deployment_type}</strong>
                  </div>
                  <div style={{ color: '#a7f3d0' }}>
                    Context Window: <strong>{m.context_window || '128k tokens'}</strong>
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.74rem',
                  color: '#e2e8f0'
                }}>
                  <div style={{ color: 'var(--ghana-emerald)', fontWeight: 700, marginBottom: '2px' }}>
                    Safety & Hallucination Mitigation:
                  </div>
                  <div>{m.hallucination_mitigation || 'Deterministic RAG ground truth verification and constitutional system prompts.'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Datasets List */}
      {activeTab === 'datasets' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
          {datasets.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
              <Database size={36} className="text-emerald-400" style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#fff' }}>No Datasets Configured for {currentProject?.name}</div>
              <p style={{ fontSize: '0.82rem', marginTop: '6px' }}>
                Register training corpora, fine-tuning data, and Act 843 Data Protection Commission compliance certificates.
              </p>
            </div>
          ) : (
            datasets.map(d => (
              <div key={d.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: d.contains_pii ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                    color: d.contains_pii ? '#fca5a5' : '#a7f3d0',
                    fontSize: '0.72rem',
                    fontWeight: 700
                  }}>
                    {d.contains_pii ? 'Contains Sensitive PII' : 'De-Identified Data'}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 700 }}>
                    {d.records_count || '1M+'} Records
                  </span>
                </div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {d.dataset_name}
                </h3>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8' }}>
                  Source: <strong style={{ color: '#e2e8f0' }}>{d.source_entity}</strong>
                </div>

                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  fontSize: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ color: '#c7d2fe' }}>
                    Consent Basis: <strong>{d.consent_basis}</strong>
                  </div>
                  <div style={{ color: '#fed7aa' }}>
                    DPC Registration: <strong>{d.act843_registration_number || 'DPC-GH-2026-CERT'}</strong>
                  </div>
                </div>

                <div style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.06)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  fontSize: '0.74rem',
                  color: '#e2e8f0'
                }}>
                  <div style={{ color: 'var(--ghana-emerald)', fontWeight: 700, marginBottom: '2px' }}>
                    Sovereign Data Residency:
                  </div>
                  <div>{d.sovereign_storage_location || 'Hosted within Ghana Borders (NITA Data Centre)'}</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal 1: Register Model */}
      {showAddModelModal && (
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
                <Cpu size={18} className="text-emerald-400" />
                <span>Register Model Architecture</span>
              </div>
              <button onClick={() => setShowAddModelModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddModel} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DeepSeek-R1-671B-MoE or Ghana-BioBERT-v1"
                  value={modelName}
                  onChange={e => setModelName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Model Family</label>
                  <input
                    type="text"
                    value={modelFamily}
                    onChange={e => setModelFamily(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Parameter Count</label>
                  <input
                    type="text"
                    value={parameterCount}
                    onChange={e => setParameterCount(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Deployment Type</label>
                  <select
                    value={deploymentType}
                    onChange={e => setDeploymentType(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#1e293b', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  >
                    <option value="Self-Hosted (NITA Sovereign Cloud)">Self-Hosted (NITA Sovereign Cloud)</option>
                    <option value="On-Premises MDA Data Center">On-Premises MDA Data Center</option>
                    <option value="Private Sovereign VPC (AWS/Azure/GCP)">Private Sovereign VPC</option>
                    <option value="Third-Party Commercial API">Third-Party Commercial API</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Vendor / Source</label>
                  <input
                    type="text"
                    value={vendor}
                    onChange={e => setVendor(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Hallucination & Guardrails Description</label>
                <textarea
                  rows={2}
                  value={hallucinationControls}
                  onChange={e => setHallucinationControls(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddModelModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Save Model Architecture</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Register Dataset */}
      {showAddDatasetModal && (
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
                <Database size={18} className="text-emerald-400" />
                <span>Register Dataset & Act 843 Governance</span>
              </div>
              <button onClick={() => setShowAddDatasetModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddDataset} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Dataset Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ghana National Health Survey Sample 2025"
                  value={datasetName}
                  onChange={e => setDatasetName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Source Custodian Entity</label>
                  <input
                    type="text"
                    placeholder={currentProject?.mda}
                    value={sourceEntity}
                    onChange={e => setSourceEntity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Records Count / Size</label>
                  <input
                    type="text"
                    value={recordsCount}
                    onChange={e => setRecordsCount(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Act 843 DPC Registration / Certificate Number</label>
                <input
                  type="text"
                  value={dpcRegistrationNo}
                  onChange={e => setDpcRegistrationNo(e.target.value)}
                  placeholder="DPC-GH-2026-CERT-0091"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>Sovereign Storage / Hosting Location</label>
                <input
                  type="text"
                  value={storageLocation}
                  onChange={e => setStorageLocation(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#fff', fontSize: '0.85rem' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <input
                  type="checkbox"
                  id="piiCheckbox"
                  checked={containsPii}
                  onChange={e => setContainsPii(e.target.checked)}
                  style={{ width: '16px', height: '16px', accentColor: 'var(--ghana-emerald)' }}
                />
                <label htmlFor="piiCheckbox" style={{ fontSize: '0.78rem', color: '#fca5a5', cursor: 'pointer' }}>
                  This dataset contains personally identifiable or sensitive civic data under Ghana Data Protection Act 843.
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" onClick={() => setShowAddDatasetModal(false)} style={{ padding: '8px 14px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.05)', border: 'none', color: '#fff', fontSize: '0.82rem', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '8px 18px', borderRadius: '6px', background: 'linear-gradient(135deg, var(--ghana-emerald) 0%, #059669 100%)', border: 'none', color: '#fff', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer' }}>Save Dataset Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
