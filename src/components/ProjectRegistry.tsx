import React, { useState } from 'react';
import { Plus, Search, Calendar, Landmark, MapPin, DollarSign, AlertCircle, Activity } from 'lucide-react';
import { AIProject, formatNumberToWords } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';
const standardMDAs = [
  { name: 'Ministry of Communications and Digitalisation', code: 'MOCD' },
  { name: 'National Information Technology Agency', code: 'NITA' },
  { name: 'Data Protection Commission', code: 'DPC' },
  { name: 'Ministry of Food and Agriculture', code: 'MOFA' },
  { name: 'Ministry of Health', code: 'MOH' },
  { name: 'Ministry of Education', code: 'MOE' },
  { name: 'National Health Insurance Authority', code: 'NHIA' },
  { name: 'Ministry of Gender, Children and Social Protection', code: 'MOGCSP' },
  { name: 'Judicial Service of Ghana', code: 'JSG' },
  { name: 'Ministry of Finance', code: 'MOF' },
  { name: 'Ministry of Transport', code: 'MOT' },
  { name: 'Ministry of Interior', code: 'MINTER' },
];

const standardRegions = [
  { name: 'Greater Accra', center: [5.6037, -0.1870] },
  { name: 'Ashanti', center: [6.6922, -1.6163] },
  { name: 'Northern', center: [9.4075, -0.8533] },
  { name: 'Western North', center: [6.2041, -1.7583] },
  { name: 'Western', center: [5.5560, -2.2229] },
  { name: 'Eastern', center: [6.2958, 0.0594] },
  { name: 'Central', center: [6.2201, -2.1245] },
  { name: 'Volta', center: [6.5781, 0.4504] }
];


interface ProjectRegistryProps {
  projects: AIProject[];
  onAddProject: (newProject: AIProject) => void;
  onDeleteProject: (projectId: string) => void;
  onClearAllProjects: () => void;
  currentRole: UserRole;
}

export const ProjectRegistry: React.FC<ProjectRegistryProps> = ({ 
  projects, 
  onAddProject, 
  onDeleteProject,
  onClearAllProjects,
  currentRole 
}) => {
  // Lists filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(projects[0] || null);

  // Sync selection when projects list changes (e.g. deletions)
  React.useEffect(() => {
    if (!selectedProject || !projects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(projects[0] || null);
    }
  }, [projects, selectedProject]);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('Machine Learning');
  const [sector, setSector] = useState<any>('Agriculture');
  const [mda, setMda] = useState('Ministry of Communications and Digitalisation');
  const [mdaCode, setMdaCode] = useState('MOCD');
  const [region, setRegion] = useState('Greater Accra');
  const [district, setDistrict] = useState('');
  const [lat, setLat] = useState('5.6037');
  const [lng, setLng] = useState('-0.1870');
  const [budget, setBudget] = useState('');
  const [funding, setFunding] = useState<any>('Government');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Prefill and dropdown selection states
  const [mdaSelect, setMdaSelect] = useState('Ministry of Communications and Digitalisation');
  const [isCustomMda, setIsCustomMda] = useState(false);
  const [regionSelect, setRegionSelect] = useState('Greater Accra');
  const [dpcStatus, setDpcStatus] = useState<'Registered' | 'Pending' | 'Exempt'>('Registered');
  const [isSovereignHosting, setIsSovereignHosting] = useState(true);

  const handleRegionSelectChange = (newRegion: string) => {
    setRegionSelect(newRegion);
    setRegion(newRegion);
    const regInfo = standardRegions.find(r => r.name === newRegion);
    if (regInfo) {
      setLat(regInfo.center[0].toFixed(4));
      setLng(regInfo.center[1].toFixed(4));
    }
  };

  const handleMdaSelectChange = (val: string) => {
    setMdaSelect(val);
    if (val === 'Other') {
      setIsCustomMda(true);
      setMda('');
      setMdaCode('');
    } else {
      setIsCustomMda(false);
      const chosen = standardMDAs.find(m => m.name === val);
      if (chosen) {
        setMda(chosen.name);
        setMdaCode(chosen.code);
      }
    }
  };

  // Form error state
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Determines write privileges
  const canWrite = ['Super Administrator', 'Institution Administrator', 'Project Manager'].includes(currentRole);

  // Filters projects based on criteria
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.mda.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.projectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'All' || p.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  // Handles form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    // Basic Validation checks
    if (!name || !description || !mda || !mdaCode || !budget || !startDate || !endDate) {
      setFormError('Please complete all mandatory registry parameters.');
      return;
    }
    if (parseFloat(budget) <= 0) {
      setFormError('Approved budget allocation must exceed zero.');
      return;
    }
    if (isNaN(parseFloat(lat)) || isNaN(parseFloat(lng))) {
      setFormError('GIS node coordinate must be a valid numeric index.');
      return;
    }

    const nextIdVal = projects.length + 1;
    const projectCodeGenerated = `GN-AI-2026-00${nextIdVal}`;

    const newProjectItem: AIProject = {
      id: `proj-${nextIdVal}`,
      projectCode: projectCodeGenerated,
      name,
      description,
      category,
      sector,
      stage: 'Concept',
      status: 'Active',
      startDate,
      endDate,
      expectedCompletionDate: endDate,
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
      mda,
      mdaCode: mdaCode.toUpperCase(),
      region: region || 'Greater Accra',
      district: district || 'Accra Metropolitan',
      budget: {
        totalAllocated: parseFloat(budget),
        disbursed: parseFloat(budget) * 0.1, // Initial 10% mobilization disbursal simulation
        utilized: 0,
        remaining: parseFloat(budget),
        primaryFundingSource: funding,
        currency: 'GHS'
      },
      compliance: {
        fairness: dpcStatus === 'Registered' ? 80 : 40,
        transparency: 70,
        accountability: 75,
        privacy: dpcStatus === 'Registered' ? 85 : 40,
        security: isSovereignHosting ? 80 : 50,
        overallGrade: dpcStatus === 'Registered' && isSovereignHosting ? 'Good' : 'Moderate'
      },
      readinessScore: 60,
      milestones: [
        { id: `m${nextIdVal}-1`, title: 'Initial technical proposal drafting', dueDate: startDate, progressPercent: 100, status: 'Completed' },
        { id: `m${nextIdVal}-2`, title: 'Ethics & DPC regulatory alignment routing', dueDate: endDate, progressPercent: 10, status: 'Pending' }
      ],
      risks: [
        {
          id: `r${nextIdVal}-1`,
          category: 'Compliance & Audit Risk',
          severity: dpcStatus !== 'Registered' ? 'High' : 'Low',
          likelihood: dpcStatus !== 'Registered' ? 4 : 1,
          impact: dpcStatus !== 'Registered' ? 4 : 2,
          description: dpcStatus !== 'Registered' ? 'Mandatory DPC certificate registration pending under Ghana DPA Act 1038.' : 'Compliance monitoring setup with DPC.',
          mitigationPlan: 'Coordinate compliance checklist review steps with national audit officers.',
          status: 'Open'
        }
      ],
      documents: []
    };

    onAddProject(newProjectItem);
    setFormSuccess(true);
    setSelectedProject(newProjectItem);

    // Resets form states
    setName('');
    setDescription('');
    setMdaSelect('Ministry of Communications and Digitalisation');
    setMda('Ministry of Communications and Digitalisation');
    setMdaCode('MOCD');
    setIsCustomMda(false);
    setRegionSelect('Greater Accra');
    setRegion('Greater Accra');
    setDistrict('');
    setLat('5.6037');
    setLng('-0.1870');
    setBudget('');
    setStartDate('');
    setEndDate('');
    setDpcStatus('Registered');
    setIsSovereignHosting(true);
  };

  const getStageBadge = (stage: string) => {
    switch (stage) {
      case 'Operational':
      case 'Deployment':
        return <span className="badge badge-success">{stage}</span>;
      case 'Pilot':
      case 'Development':
        return <span className="badge badge-info">{stage}</span>;
      case 'Concept':
      case 'Planning':
        return <span className="badge badge-warning">{stage}</span>;
      default:
        return <span className="badge badge-danger">{stage}</span>;
    }
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Project Registry Browser */}
        <div className="glass-card" style={{ minHeight: '680px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>AI Registry Browser</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Explore and inspect artificial intelligence initiatives in Ghana.
              </p>
            </div>
            {canWrite && projects.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear all projects in the registry? This will wipe the database.')) {
                    onClearAllProjects();
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: '6px',
                  color: '#fb7185',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.12s ease'
                }}
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search and filter bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                placeholder="Search code, name, or MDA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '38px', height: '40px' }}
              />
              <Search style={{ position: 'absolute', left: '12px', top: '11px', width: '18px', height: '18px', color: 'var(--text-muted)' }} />
            </div>
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="form-select"
              style={{ width: '140px', height: '40px', padding: '0 12px' }}
            >
              <option value="All">All Stages</option>
              <option value="Concept">Concept</option>
              <option value="Planning">Planning</option>
              <option value="Development">Development</option>
              <option value="Pilot">Pilot</option>
              <option value="Deployment">Deployment</option>
              <option value="Operational">Operational</option>
            </select>
          </div>

          {/* Projects browser List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '320px', overflowY: 'auto', paddingRight: '4px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            {filteredProjects.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No registered projects matching query.
              </div>
            ) : (
              filteredProjects.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: selectedProject?.id === p.id ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.015)',
                    border: '1px solid',
                    borderColor: selectedProject?.id === p.id ? 'rgba(16,185,129,0.3)' : 'var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  className="project-row"
                >
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 700, letterSpacing: '0.05em' }}>
                      {p.projectCode}
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                      {p.name.length > 32 ? p.name.substring(0, 32) + '...' : p.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {p.mdaCode} • {p.sector}
                    </div>
                  </div>
                  <div>
                    {getStageBadge(p.stage)}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Details drawer for Selected project */}
          {selectedProject && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selectedProject.name}</h4>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selectedProject.mda}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{selectedProject.category}</span>
                  {canWrite && (
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete ${selectedProject.name}?`)) {
                          onDeleteProject(selectedProject.id);
                        }
                      }}
                      style={{
                        padding: '4px 8px',
                        background: 'rgba(244,63,94,0.15)',
                        border: '1px solid #f43f5e',
                        borderRadius: '6px',
                        color: '#fb7185',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        transition: 'all 0.12s ease'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.45 }}>
                {selectedProject.description}
              </p>

              {/* Specs parameters grids */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '0 0 16px 0', fontSize: '0.82rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GIS Coordinates</div>
                    <span style={{ fontWeight: 600 }}>{selectedProject.latitude.toFixed(4)}, {selectedProject.longitude.toFixed(4)}</span>
                  </div>
                </div>
                <div style={{ 
                  gridColumn: '1 / span 2',
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '8px', 
                  background: 'rgba(255,255,255,0.01)', 
                  padding: '12px 14px', 
                  borderRadius: '8px', 
                  border: '1px solid var(--border-color)' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DollarSign className="w-4.5 h-4.5 text-amber-400" />
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>Allocated Budget</div>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', wordBreak: 'break-word', display: 'block', marginTop: '2px' }}>
                        {formatNumberToWords(selectedProject.budget.totalAllocated)} GHS (GHS {selectedProject.budget.totalAllocated.toLocaleString('en-US')})
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px' }}>
                    <Activity className="w-4.5 h-4.5 text-emerald-400" />
                    <div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>Utilized Funds</div>
                      <span style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--ghana-emerald)', wordBreak: 'break-word', display: 'block', marginTop: '2px' }}>
                        {formatNumberToWords(selectedProject.budget.utilized)} GHS (GHS {selectedProject.budget.utilized.toLocaleString('en-US')})
                      </span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Expected Date</div>
                    <span style={{ fontWeight: 600 }}>{selectedProject.expectedCompletionDate}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <Landmark className="w-4 h-4 text-purple-400" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Region / District</div>
                    <span style={{ fontWeight: 600 }}>{selectedProject.region}</span>
                  </div>
                </div>
              </div>

              {/* Milestones status */}
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Project milestones ({selectedProject.milestones.length})
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {selectedProject.milestones.map((m) => (
                    <div key={m.id} style={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.78rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: m.status === 'Completed' ? 'var(--ghana-emerald)' : m.status === 'Delayed' ? 'var(--ghana-red)' : 'var(--ghana-gold)' }} />
                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{m.title}</span>
                      </div>
                      <div style={{ color: 'var(--text-secondary)' }}>
                        {m.progressPercent}% • {m.dueDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Register New AI Project Form */}
        <div className="glass-card" style={{ minHeight: '680px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>Register New AI Project</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Complete the formal registry application for governmental AI initiative validation.
            </p>
          </div>

          {!canWrite ? (
            <div style={{ padding: '40px 20px', textTransform: 'none', border: '1px dashed var(--border-color)', borderRadius: '8px', background: 'rgba(255,255,255,0.005)', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <AlertCircle className="w-12 h-12 text-amber-400" />
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Insufficient Privileges</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '300px', margin: '0 auto', lineHeight: 1.4 }}>
                  Your active role <strong>{currentRole}</strong> is in read-only status. Please switch to **Super Admin** or **Institution Admin** to register projects.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {formError && (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle className="w-4 h-4" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div style={{ padding: '12px 16px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Landmark className="w-4 h-4" />
                  <span>Project successfully registered into national ledger!</span>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Project Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Akuafo Crop Intelligence Suite"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">System Description *</label>
                <textarea
                  placeholder="Summarize the core algorithms, goals, datasets, and societal impact targets..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  required
                />
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">AI Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Generative AI">Generative AI</option>
                    <option value="Natural Language Processing">NLP (Language)</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Expert Systems">Expert Systems</option>
                    <option value="Predictive Analytics">Predictive Analytics</option>
                    <option value="Smart Cities">Smart Cities</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Sector Classification *</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Agriculture">Agriculture</option>
                    <option value="Health">Health</option>
                    <option value="Education">Education</option>
                    <option value="Finance">Finance</option>
                    <option value="Security">Security</option>
                    <option value="Energy">Energy</option>
                    <option value="Environment">Environment</option>
                    <option value="Justice">Justice</option>
                    <option value="Transport">Transport</option>
                    <option value="Local Government">Local Government</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Managing Institution (MDA) *</label>
                <select
                  value={mdaSelect}
                  onChange={(e) => handleMdaSelectChange(e.target.value)}
                  className="form-select"
                  style={{ marginBottom: isCustomMda ? '12px' : '0' }}
                >
                  {standardMDAs.map(m => (
                    <option key={m.name} value={m.name}>{m.name} ({m.code})</option>
                  ))}
                  <option value="Other">Other (Input Custom Agency)...</option>
                </select>
              </div>

              {isCustomMda && (
                <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: 0 }}>
                  <div className="form-group">
                    <label className="form-label">Custom MDA Name *</label>
                    <input
                      type="text"
                      placeholder="e.g., Ghana Meteorological Agency"
                      value={mda}
                      onChange={(e) => setMda(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Custom MDA Code *</label>
                    <input
                      type="text"
                      placeholder="e.g., GMet"
                      value={mdaCode}
                      onChange={(e) => setMdaCode(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Region *</label>
                  <select
                    value={regionSelect}
                    onChange={(e) => handleRegionSelectChange(e.target.value)}
                    className="form-select"
                  >
                    {standardRegions.map(r => (
                      <option key={r.name} value={r.name}>{r.name} Region</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">District / Municipality *</label>
                  <input
                    type="text"
                    placeholder="e.g., Accra Metropolitan"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Latitude Coordinate *</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Longitude Coordinate *</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Approved Budget (GHS) *</label>
                  <input
                    type="number"
                    placeholder="e.g., 2500000"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Funding Type *</label>
                  <select
                    value={funding}
                    onChange={(e) => setFunding(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Government">Government</option>
                    <option value="Development Partners">Dev Partners</option>
                    <option value="Donors">Donors</option>
                    <option value="Private Sector">Private Sector</option>
                    <option value="Research Grants">Research Grants</option>
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div style={{ 
                padding: '14px', 
                background: 'rgba(255,255,255,0.015)', 
                border: '1px solid var(--border-color)', 
                borderRadius: '8px',
                marginTop: '4px'
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                  National Governance Declarations
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>DPC Registration Status</span>
                    <select
                      value={dpcStatus}
                      onChange={(e) => setDpcStatus(e.target.value as any)}
                      className="form-select"
                      style={{ width: '130px', padding: '4px 8px', fontSize: '0.75rem' }}
                    >
                      <option value="Registered">Registered</option>
                      <option value="Pending">Pending</option>
                      <option value="Exempt">Exempt</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)' }}>Sovereign Data Residency</span>
                    <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSovereignHosting}
                        onChange={(e) => setIsSovereignHosting(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--ghana-emerald)' }}
                      />
                      <span style={{ fontSize: '0.75rem', marginLeft: '6px', color: 'var(--text-secondary)' }}>Host inside Ghana</span>
                    </label>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '10px' }}>
                <Plus className="w-4 h-4" />
                <span>Submit Registry Entry</span>
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
