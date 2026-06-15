import React, { useState } from 'react';
import { Plus, Search, Calendar, Landmark, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { AIProject } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface ProjectRegistryProps {
  projects: AIProject[];
  onAddProject: (newProject: AIProject) => void;
  currentRole: UserRole;
}

export const ProjectRegistry: React.FC<ProjectRegistryProps> = ({ 
  projects, 
  onAddProject, 
  currentRole 
}) => {
  // Lists filters
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(projects[0] || null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<any>('Machine Learning');
  const [sector, setSector] = useState<any>('Agriculture');
  const [mda, setMda] = useState('');
  const [mdaCode, setMdaCode] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [lat, setLat] = useState('5.6037');
  const [lng, setLng] = useState('-0.1870');
  const [budget, setBudget] = useState('');
  const [funding, setFunding] = useState<any>('Government');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
        fairness: 60, // base starter values
        transparency: 60,
        accountability: 65,
        privacy: 70,
        security: 60,
        overallGrade: 'Good'
      },
      readinessScore: 50,
      milestones: [
        { id: `m${nextIdVal}-1`, title: 'Initial technical proposal drafting', dueDate: startDate, progressPercent: 100, status: 'Completed' },
        { id: `m${nextIdVal}-2`, title: 'Approval and compliance routing', dueDate: endDate, progressPercent: 0, status: 'Pending' }
      ],
      risks: [
        {
          id: `r${nextIdVal}-1`,
          category: 'Technical',
          severity: 'Medium',
          likelihood: 2,
          impact: 3,
          description: 'Model deployment delay due to initial compute setups.',
          mitigationPlan: 'Coordinate cloud resources with national digitalization center.',
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
    setMda('');
    setMdaCode('');
    setRegion('');
    setDistrict('');
    setBudget('');
    setStartDate('');
    setEndDate('');
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
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '6px' }}>AI Registry Browser</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Explore and inspect artificial intelligence initiatives in Ghana.
            </p>
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
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{selectedProject.category}</span>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Approved budget</div>
                    <span style={{ fontWeight: 600 }}>GHS {(selectedProject.budget.totalAllocated / 100000).toFixed(0)} Lakhs</span>
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
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Managing Institution (MDA) *</label>
                  <input
                    type="text"
                    placeholder="e.g., Ministry of Communications"
                    value={mda}
                    onChange={(e) => setMda(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">MDA Code *</label>
                  <input
                    type="text"
                    placeholder="e.g., MoCD"
                    value={mdaCode}
                    onChange={(e) => setMdaCode(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px', marginBottom: 0 }}>
                <div className="form-group">
                  <label className="form-label">Region *</label>
                  <input
                    type="text"
                    placeholder="e.g., Western Region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lat Coordinate *</label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lng Coordinate *</label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="form-input"
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
