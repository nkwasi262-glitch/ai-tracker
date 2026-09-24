import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  MapPin, 
  DollarSign, 
  AlertCircle, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Award, 
  Lock
} from 'lucide-react';
import { 
  AIProject, 
  Organization, 
  RiskTier, 
  ProjectClearanceStatus, 
  ghanaRegions, 
  sampleOrganizations
} from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface ProjectRegistryProps {
  projects: AIProject[];
  organizations?: Organization[];
  onAddProject: (newProject: AIProject) => void;
  onDeleteProject: (projectId: string) => void;
  onClearAllProjects: () => void;
  onUpdateProjectClearance?: (projectId: string, clearanceStatus: ProjectClearanceStatus, score: number, remarks: string) => void;
  currentRole: UserRole;
}

export const ProjectRegistry: React.FC<ProjectRegistryProps> = ({ 
  projects, 
  organizations = sampleOrganizations,
  onAddProject, 
  onDeleteProject,
  onClearAllProjects,
  onUpdateProjectClearance,
  currentRole 
}) => {
  // Lists filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorTypeFilter, setSectorTypeFilter] = useState<'All' | 'Government' | 'Private Sector'>('All');
  const [riskTierFilter, setRiskTierFilter] = useState<'All' | RiskTier>('All');
  const [clearanceStatusFilter, setClearanceStatusFilter] = useState<'All' | ProjectClearanceStatus>('All');
  const [stageFilter, setStageFilter] = useState('All');
  const [selectedProject, setSelectedProject] = useState<AIProject | null>(projects[0] || null);

  // Sync selection when projects list changes (e.g. deletions)
  React.useEffect(() => {
    if (!selectedProject || !projects.find(p => p.id === selectedProject.id)) {
      setSelectedProject(projects[0] || null);
    }
  }, [projects, selectedProject]);

  // Form states for registering new AI Project
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<AIProject['category']>('Machine Learning');
  const [sector, setSector] = useState<AIProject['sector']>('Agriculture');
  
  // Organization selector state
  const [selectedOrgId, setSelectedOrgId] = useState<string>(organizations[0]?.id || 'org-1');
  
  const selectedOrg = organizations.find(o => o.id === selectedOrgId) || organizations[0];
  const isSelectedOrgCleared = selectedOrg?.clearanceStatus === 'Cleared';

  // Region and GIS states
  const [regionSelect, setRegionSelect] = useState('Greater Accra');
  const [district, setDistrict] = useState('Accra Metropolitan');
  const [lat, setLat] = useState('5.6037');
  const [lng, setLng] = useState('-0.1870');
  const [budget, setBudget] = useState('1800000');
  const [funding, setFunding] = useState<'Government' | 'Development Partners' | 'Donors' | 'Private Sector' | 'Research Grants'>('Government');
  const [startDate, setStartDate] = useState('2026-03-01');
  const [endDate, setEndDate] = useState('2027-12-31');

  // Risk Pre-Classification states (SOW Section 4)
  const [hasBiometricOrHighImpact, setHasBiometricOrHighImpact] = useState(false);
  const [hasCriticalInfrastructure, setHasCriticalInfrastructure] = useState(false);
  const [hasChatbotOrContentGen, setHasChatbotOrContentGen] = useState(false);
  const [hasProhibitedPractices, setHasProhibitedPractices] = useState(false);

  // Evidence Checklist states (SOW Section 5.2)
  const [dpiaUploaded, setDpiaUploaded] = useState(true);
  const [vaptReportUploaded, setVaptReportUploaded] = useState(true);
  const [modelDocUploaded, setModelDocUploaded] = useState(true);
  const [slaUploaded, setSlaUploaded] = useState(true);
  const [biasAuditUploaded, setBiasAuditUploaded] = useState(false);

  // Governance Declarations
  const [isSovereignHosting, setIsSovereignHosting] = useState(true);

  // Form feedback state
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  // Regulator Decision Form state
  const [adjudicationStatus, setAdjudicationStatus] = useState<ProjectClearanceStatus>('Cleared');
  const [adjudicationScore, setAdjudicationScore] = useState<number>(88);
  const [adjudicationRemarks, setAdjudicationRemarks] = useState<string>('Meets all technical, privacy, and cybersecurity threshold criteria under Ghana Act 843.');
  const [adjudicationSuccess, setAdjudicationSuccess] = useState(false);

  // Privileges
  const canRegister = [
    'Super Administrator', 
    'Regulator / Clearance Authority', 
    'Government Applicant (MDA/SOE)', 
    'Private Sector Applicant', 
    'Institution Administrator', 
    'Project Manager'
  ].includes(currentRole);

  const canClearProjects = [
    'Super Administrator', 
    'Regulator / Clearance Authority', 
    'Technical Review Committee (TCC)', 
    'Institution Administrator'
  ].includes(currentRole);

  // Derived automatic risk tier based on use case answers
  const computedRiskTier: RiskTier = React.useMemo(() => {
    if (hasProhibitedPractices) return 'Prohibited';
    if (hasBiometricOrHighImpact || hasCriticalInfrastructure) return 'High Risk';
    if (hasChatbotOrContentGen) return 'Limited Risk';
    return 'Minimal Risk';
  }, [hasProhibitedPractices, hasBiometricOrHighImpact, hasCriticalInfrastructure, hasChatbotOrContentGen]);

  const handleRegionSelectChange = (newRegion: string) => {
    setRegionSelect(newRegion);
    const regInfo = ghanaRegions.find(r => r.name === newRegion);
    if (regInfo) {
      setLat(regInfo.center[0].toFixed(4));
      setLng(regInfo.center[1].toFixed(4));
    }
  };

  // Filter projects based on multiple NAPTCS criteria
  const filteredProjects = projects.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.mda.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.projectCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.clearanceCertificateId && p.clearanceCertificateId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSectorType = 
      sectorTypeFilter === 'All' ? true :
      sectorTypeFilter === 'Government' ? p.entitySectorType.includes('Government') :
      p.entitySectorType.includes('Private');

    const matchesRiskTier = riskTierFilter === 'All' || p.riskTier === riskTierFilter;
    const matchesClearanceStatus = clearanceStatusFilter === 'All' || p.clearanceStatus === clearanceStatusFilter;
    const matchesStage = stageFilter === 'All' || p.stage === stageFilter;

    return matchesSearch && matchesSectorType && matchesRiskTier && matchesClearanceStatus && matchesStage;
  });

  // Handle new project submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    // Validation
    if (!name || !description || !selectedOrg || !budget || !startDate || !endDate) {
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

    // Mandatory gate rule (Section 5.2): High-risk without DPIA is an automatic block
    if (computedRiskTier === 'High Risk' && !dpiaUploaded) {
      setFormError('Statutory Gate Failure: High-Risk systems cannot be submitted without an executed Data Protection Impact Assessment (DPIA) under Act 843.');
      return;
    }

    const nextIdVal = projects.length + 1;
    const projectCodeGenerated = `GN-AI-2026-00${nextIdVal}`;

    // Initial score estimation
    let estimatedScore = 65;
    if (dpiaUploaded) estimatedScore += 10;
    if (vaptReportUploaded) estimatedScore += 10;
    if (modelDocUploaded) estimatedScore += 8;
    if (isSovereignHosting) estimatedScore += 7;

    // Clearance status: If org is not cleared, project is Quarantined / Pending
    const initialClearanceStatus: ProjectClearanceStatus = !isSelectedOrgCleared 
      ? 'Pending Review' 
      : computedRiskTier === 'Prohibited' 
        ? 'Not Cleared' 
        : 'Pending Review';

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
      mda: selectedOrg.name,
      mdaCode: selectedOrg.acronym,
      organizationId: selectedOrg.id,
      organizationName: selectedOrg.name,
      entitySectorType: selectedOrg.entityType,
      riskTier: computedRiskTier,
      clearanceStatus: initialClearanceStatus,
      clearanceScore: estimatedScore,
      isOrganizationCleared: isSelectedOrgCleared,
      isPublished: isSelectedOrgCleared && ((initialClearanceStatus as ProjectClearanceStatus) === 'Cleared' || (initialClearanceStatus as ProjectClearanceStatus) === 'Conditional'),
      clearanceEvidence: {
        dpiaUploaded,
        vaptReportUploaded,
        modelDocumentationUploaded: modelDocUploaded,
        slaUploaded,
        biasAuditUploaded,
        procurementRecordsUploaded: true
      },
      region: regionSelect || 'Greater Accra',
      district: district || 'Accra Metropolitan',
      budget: {
        totalAllocated: parseFloat(budget),
        disbursed: parseFloat(budget) * 0.1,
        utilized: 0,
        remaining: parseFloat(budget),
        primaryFundingSource: funding,
        currency: 'GHS'
      },
      compliance: {
        fairness: 75,
        transparency: 70,
        accountability: 75,
        privacy: dpiaUploaded ? 85 : 40,
        security: isSovereignHosting ? 80 : 50,
        overallGrade: dpiaUploaded && isSovereignHosting ? 'Good' : 'Moderate'
      },
      readinessScore: 65,
      milestones: [
        { id: `m${nextIdVal}-1`, title: 'National AI Registry submission & schema intake', dueDate: startDate, progressPercent: 100, status: 'Completed' },
        { id: `m${nextIdVal}-2`, title: 'TCC Technical Assessment & Act 843 Conformity review', dueDate: endDate, progressPercent: 20, status: 'Pending' }
      ],
      risks: [
        {
          id: `r${nextIdVal}-1`,
          category: 'Statutory Clearance Risk',
          severity: computedRiskTier === 'High Risk' ? 'High' : 'Medium',
          likelihood: 2,
          impact: 3,
          description: !isSelectedOrgCleared 
            ? 'Parent organization clearance pending under NAPTCS mandate.' 
            : 'Pre-clearance technical vetting under review by TCC.',
          mitigationPlan: 'Coordinate compliance verification steps with national clearance officers.',
          status: 'Open'
        }
      ],
      documents: []
    };

    onAddProject(newProjectItem);
    setFormSuccess(true);
    setSelectedProject(newProjectItem);

    // Reset Form
    setName('');
    setDescription('');
    setBudget('2000000');
  };

  // Handle regulator clearance update
  const handleRegulatorDecision = () => {
    if (!selectedProject || !onUpdateProjectClearance) return;
    onUpdateProjectClearance(
      selectedProject.id, 
      adjudicationStatus, 
      adjudicationScore, 
      adjudicationRemarks
    );
    setAdjudicationSuccess(true);
    setTimeout(() => setAdjudicationSuccess(false), 4000);
  };

  const getRiskTierBadge = (tier: RiskTier) => {
    switch (tier) {
      case 'Minimal Risk':
        return <span className="badge badge-success" style={{ fontSize: '0.66rem' }}>🟢 Minimal Risk</span>;
      case 'Limited Risk':
        return <span className="badge badge-info" style={{ fontSize: '0.66rem' }}>🔵 Limited Risk</span>;
      case 'High Risk':
        return <span className="badge badge-warning" style={{ fontSize: '0.66rem' }}>🟠 High Risk</span>;
      case 'Prohibited':
        return <span className="badge badge-danger" style={{ fontSize: '0.66rem' }}>🔴 Prohibited</span>;
    }
  };

  const getClearanceStatusBadge = (status: ProjectClearanceStatus) => {
    switch (status) {
      case 'Cleared':
        return <span className="badge badge-success" style={{ fontSize: '0.68rem', fontWeight: 700 }}>✅ Cleared</span>;
      case 'Conditional':
        return <span className="badge badge-warning" style={{ fontSize: '0.68rem', fontWeight: 700 }}>⚠️ Conditional</span>;
      case 'Pending Review':
        return <span className="badge badge-info" style={{ fontSize: '0.68rem', fontWeight: 700 }}>⏳ Under Review</span>;
      case 'Not Cleared':
        return <span className="badge badge-danger" style={{ fontSize: '0.68rem', fontWeight: 700 }}>⛔ Not Cleared</span>;
      default:
        return <span className="badge" style={{ fontSize: '0.68rem' }}>Draft</span>;
    }
  };

  return (
    <div>
      {/* Top Banner: Dual-Sector Clearance Mandate */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(16,185,129,0.12) 0%, rgba(59,130,246,0.08) 100%)',
        border: '1px solid rgba(16,185,129,0.25)',
        borderRadius: '10px',
        padding: '14px 20px',
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            background: 'rgba(16,185,129,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ghana-emerald)'
          }}>
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              NAPTCS National AI Registry & Clearance Gatekeeper
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Unified statutory gateway for Government MDAs, SOEs, and Private Tech Enterprises. Only cleared organizations and systems are published to the public registry.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(59,130,246,0.15)',
            border: '1px solid rgba(59,130,246,0.3)',
            color: '#60a5fa',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            🏛️ Government Track
          </span>
          <span style={{
            padding: '4px 10px',
            borderRadius: '9999px',
            background: 'rgba(168,85,247,0.15)',
            border: '1px solid rgba(168,85,247,0.3)',
            color: '#c084fc',
            fontSize: '0.72rem',
            fontWeight: 700
          }}>
            🏢 Private Sector Track
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: Project Registry Browser */}
        <div className="glass-card" style={{ minHeight: '720px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>National AI Registry Browser</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Track and inspect AI deployments across public and private sectors in Ghana.
              </p>
            </div>
            {['Super Administrator', 'Regulator / Clearance Authority'].includes(currentRole) && projects.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to reset the national registry? This action will purge all registered systems.')) {
                    onClearAllProjects();
                  }
                }}
                style={{
                  padding: '6px 12px',
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.2)',
                  borderRadius: '6px',
                  color: '#fb7185',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Reset Database
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Search by project name, code, MDA, vendor, or Certificate ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '38px', height: '40px' }}
            />
            <Search style={{ position: 'absolute', left: '12px', top: '11px', width: '18px', height: '18px', color: 'var(--text-muted)' }} />
          </div>

          {/* Multi-facet Filters */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Sector Track:
              </label>
              <select
                value={sectorTypeFilter}
                onChange={(e) => setSectorTypeFilter(e.target.value as any)}
                className="form-select"
                style={{ fontSize: '0.74rem', height: '34px', padding: '0 6px' }}
              >
                <option value="All">All Sectors</option>
                <option value="Government">🏛️ Government</option>
                <option value="Private Sector">🏢 Private</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Clearance:
              </label>
              <select
                value={clearanceStatusFilter}
                onChange={(e) => setClearanceStatusFilter(e.target.value as any)}
                className="form-select"
                style={{ fontSize: '0.74rem', height: '34px', padding: '0 6px' }}
              >
                <option value="All">All Status</option>
                <option value="Cleared">Cleared (≥85%)</option>
                <option value="Conditional">Conditional</option>
                <option value="Pending Review">Under Review</option>
                <option value="Not Cleared">Not Cleared</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Risk Tier:
              </label>
              <select
                value={riskTierFilter}
                onChange={(e) => setRiskTierFilter(e.target.value as any)}
                className="form-select"
                style={{ fontSize: '0.74rem', height: '34px', padding: '0 6px' }}
              >
                <option value="All">All Risk</option>
                <option value="Minimal Risk">Minimal</option>
                <option value="Limited Risk">Limited</option>
                <option value="High Risk">High Risk</option>
                <option value="Prohibited">Prohibited</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Stage:
              </label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="form-select"
                style={{ fontSize: '0.74rem', height: '34px', padding: '0 6px' }}
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
          </div>

          {/* Projects browser List */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            maxHeight: '340px', 
            overflowY: 'auto', 
            paddingRight: '4px', 
            borderBottom: '1px solid var(--border-color)', 
            paddingBottom: '16px', 
            marginBottom: '16px' 
          }}>
            {filteredProjects.length === 0 ? (
              <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No projects matched your criteria.
              </div>
            ) : (
              filteredProjects.map(p => {
                const isSelected = selectedProject?.id === p.id;
                const isPrivate = p.entitySectorType.includes('Private');

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedProject(p)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.015)',
                      border: '1px solid',
                      borderColor: isSelected ? 'rgba(16,185,129,0.4)' : 'var(--border-color)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    className="project-row"
                  >
                    <div style={{ flex: 1, marginRight: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 700, letterSpacing: '0.04em' }}>
                          {p.projectCode}
                        </span>
                        
                        <span style={{
                          fontSize: '0.64rem',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          background: isPrivate ? 'rgba(168,85,247,0.15)' : 'rgba(59,130,246,0.15)',
                          color: isPrivate ? '#c084fc' : '#60a5fa',
                          fontWeight: 700
                        }}>
                          {isPrivate ? '🏢 Private' : '🏛️ Gov'}
                        </span>

                        {!p.isOrganizationCleared && (
                          <span style={{
                            fontSize: '0.62rem',
                            padding: '1px 6px',
                            borderRadius: '4px',
                            background: 'rgba(244,63,94,0.15)',
                            color: '#fb7185',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px'
                          }}>
                            <Lock className="w-2.5 h-2.5" /> Org Quarantined
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {p.name.length > 34 ? p.name.substring(0, 34) + '...' : p.name}
                      </div>

                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {p.organizationName} • {p.sector}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      {getClearanceStatusBadge(p.clearanceStatus)}
                      {getRiskTierBadge(p.riskTier)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Details drawer for Selected project */}
          {selectedProject && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeIn 0.3s ease' }}>
              
              {/* Gatekeeper Quarantine Notice */}
              {!selectedProject.isOrganizationCleared && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(244,63,94,0.12)',
                  border: '1px solid rgba(244,63,94,0.3)',
                  borderRadius: '8px',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <div style={{ fontSize: '0.76rem', color: '#fecdd3', lineHeight: 1.4 }}>
                    <strong>STATUTORY QUARANTINE:</strong> The parent entity <strong>{selectedProject.organizationName}</strong> is not yet cleared under NAPTCS accreditation. Information regarding this system is withheld from the public domain and cannot be deployed in production.
                  </div>
                </div>
              )}

              {/* Title & Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedProject.name}
                  </h4>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span>{selectedProject.organizationName}</span>
                    <span>•</span>
                    <span style={{ color: selectedProject.entitySectorType.includes('Private') ? '#c084fc' : '#60a5fa', fontWeight: 600 }}>
                      {selectedProject.entitySectorType}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {['Super Administrator', 'Regulator / Clearance Authority'].includes(currentRole) && (
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
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.45 }}>
                {selectedProject.description}
              </p>

              {/* Clearance & Certificate Card */}
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '12px 14px',
                marginBottom: '14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Award className="w-4 h-4 text-emerald-400" />
                    <span style={{ fontSize: '0.76rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                      Clearance Credentials & Scoring
                    </span>
                  </div>
                  <div>
                    {getClearanceStatusBadge(selectedProject.clearanceStatus)}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.78rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Certificate ID:</span>
                    <div style={{ fontWeight: 700, color: 'var(--ghana-emerald)' }}>
                      {selectedProject.clearanceCertificateId || 'NOT ISSUED (Pending Review)'}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Clearance Score:</span>
                    <div style={{ fontWeight: 700, color: selectedProject.clearanceScore >= 85 ? '#10b981' : selectedProject.clearanceScore >= 60 ? '#fbbf24' : '#ef4444' }}>
                      {selectedProject.clearanceScore}% ({selectedProject.clearanceScore >= 85 ? 'Cleared' : selectedProject.clearanceScore >= 60 ? 'Conditional' : 'Not Cleared'})
                    </div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Risk Tier Classification:</span>
                    <div>{getRiskTierBadge(selectedProject.riskTier)}</div>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Public Register Visibility:</span>
                    <div style={{ fontWeight: 600, color: selectedProject.isPublished ? '#10b981' : '#fb7185' }}>
                      {selectedProject.isPublished ? '🌐 Public & Searchable' : '🔒 Quarantined / Hidden'}
                    </div>
                  </div>
                </div>

                {/* Evidence Checklist */}
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', textTransform: 'uppercase' }}>
                    Required Evidence Vault
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '0.72rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {selectedProject.clearanceEvidence?.dpiaUploaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                      <span>Act 843 DPIA Assessment</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {selectedProject.clearanceEvidence?.vaptReportUploaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400" />}
                      <span>VAPT Cybersecurity Audit</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {selectedProject.clearanceEvidence?.modelDocumentationUploaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                      <span>Model Specs & Data Lineage</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {selectedProject.clearanceEvidence?.biasAuditUploaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <AlertCircle className="w-3.5 h-3.5 text-slate-500" />}
                      <span>Demographic Bias Testing</span>
                    </div>
                  </div>
                </div>

                {/* Scope limits / conditions */}
                {selectedProject.clearanceDecision?.scopeLimits && (
                  <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>
                    <strong>Permitted Scope:</strong> {selectedProject.clearanceDecision.scopeLimits}
                  </div>
                )}
              </div>

              {/* Specs parameters grids */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', margin: '0 0 14px 0', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>GIS Coordinates</div>
                    <span style={{ fontWeight: 600 }}>{selectedProject.latitude.toFixed(4)}, {selectedProject.longitude.toFixed(4)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.01)', padding: '8px 10px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <DollarSign className="w-4 h-4 text-amber-400" />
                  <div>
                    <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>Allocated Budget</div>
                    <span style={{ fontWeight: 600 }}>GHS {selectedProject.budget.totalAllocated.toLocaleString('en-US')}</span>
                  </div>
                </div>
              </div>

              {/* Regulator Clearance Action Panel */}
              {canClearProjects && onUpdateProjectClearance && (
                <div style={{
                  padding: '12px 14px',
                  background: 'rgba(16,185,129,0.04)',
                  border: '1px solid rgba(16,185,129,0.2)',
                  borderRadius: '8px',
                  marginTop: 'auto'
                }}>
                  <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--ghana-emerald)', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck className="w-4 h-4" /> Regulator Clearance Adjudication
                  </div>

                  {adjudicationSuccess && (
                    <div style={{ padding: '6px 10px', background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', borderRadius: '6px', color: '#34d399', fontSize: '0.74rem', marginBottom: '8px' }}>
                      Clearance status updated and certificate synchronized!
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', marginBottom: '8px' }}>
                    <div>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Determination</label>
                      <select
                        value={adjudicationStatus}
                        onChange={(e) => setAdjudicationStatus(e.target.value as any)}
                        className="form-select"
                        style={{ fontSize: '0.75rem', height: '32px' }}
                      >
                        <option value="Cleared">Cleared (≥85%)</option>
                        <option value="Conditional">Conditional (60-84%)</option>
                        <option value="Not Cleared">Not Cleared (&lt;60%)</option>
                        <option value="Pending Review">Pending Review</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Evaluated Score (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={adjudicationScore}
                        onChange={(e) => setAdjudicationScore(parseInt(e.target.value) || 0)}
                        className="form-input"
                        style={{ fontSize: '0.75rem', height: '32px' }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Decision Rationale / Scope Limits</label>
                    <input
                      type="text"
                      value={adjudicationRemarks}
                      onChange={(e) => setAdjudicationRemarks(e.target.value)}
                      placeholder="e.g., Cleared for phased beta across approved hospitals only..."
                      className="form-input"
                      style={{ fontSize: '0.75rem', height: '32px' }}
                    />
                  </div>

                  <button
                    onClick={handleRegulatorDecision}
                    className="btn btn-primary"
                    style={{ width: '100%', fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Issue NAPTCS Clearance Decision</span>
                  </button>
                </div>
              )}

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Register New AI Project Form */}
        <div className="glass-card" style={{ minHeight: '720px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '4px' }}>Register AI Project / System</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Submit AI initiative identity, architecture, and evidence package for statutory clearance.
            </p>
          </div>

          {!canRegister ? (
            <div style={{ 
              padding: '40px 20px', 
              border: '1px dashed var(--border-color)', 
              borderRadius: '8px', 
              background: 'rgba(255,255,255,0.005)', 
              textAlign: 'center', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: '16px' 
            }}>
              <AlertCircle className="w-12 h-12 text-amber-400" />
              <div>
                <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Submission Restricted</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '320px', margin: '0 auto', lineHeight: 1.4 }}>
                  Your active role <strong>{currentRole}</strong> is in read-only status. Please switch to <strong>Government Applicant</strong>, <strong>Private Sector Applicant</strong>, or <strong>Super Administrator</strong> to submit an AI project.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {formError && (
                <div style={{ padding: '10px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', color: '#f87171', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div style={{ padding: '10px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>Project successfully registered for clearance review!</span>
                </div>
              )}

              {/* 1. Managing Entity / Organization Selector (Gatekeeper Core) */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Managing Entity / Organization *</span>
                  <span style={{ fontSize: '0.68rem', color: isSelectedOrgCleared ? '#10b981' : '#f43f5e', fontWeight: 700 }}>
                    {isSelectedOrgCleared ? '✅ Organization Cleared' : '⛔ Pending Org Clearance'}
                  </span>
                </label>
                <select
                  value={selectedOrgId}
                  onChange={(e) => setSelectedOrgId(e.target.value)}
                  className="form-select"
                >
                  <optgroup label="Government MDAs / SOEs">
                    {organizations.filter(o => o.entityType.includes('Government')).map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.acronym}) — {org.clearanceStatus}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Private Sector Tech Companies & Vendors">
                    {organizations.filter(o => !o.entityType.includes('Government')).map(org => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.acronym}) — {org.clearanceStatus}
                      </option>
                    ))}
                  </optgroup>
                </select>

                {!isSelectedOrgCleared && (
                  <div style={{ 
                    marginTop: '6px', 
                    padding: '8px 10px', 
                    background: 'rgba(244,63,94,0.08)', 
                    border: '1px solid rgba(244,63,94,0.2)', 
                    borderRadius: '6px', 
                    fontSize: '0.72rem', 
                    color: '#fb7185',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>This organization is not yet cleared. Submitting this AI system will hold it in <strong>Regulatory Quarantine</strong> until the organization is cleared.</span>
                  </div>
                )}
              </div>

              {/* 2. Project Name & Description */}
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">AI System / Project Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Ghana National Biometric Anti-Fraud Engine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">System Description & Deployment Purpose *</label>
                <textarea
                  placeholder="Describe the algorithms, training datasets, autonomous capabilities, user base, and societal objectives..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="form-textarea"
                  style={{ minHeight: '60px' }}
                  required
                />
              </div>

              {/* 3. AI Category & Sector */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">AI Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Generative AI">Generative AI / LLM</option>
                    <option value="Natural Language Processing">NLP (Speech/Text)</option>
                    <option value="Computer Vision">Computer Vision</option>
                    <option value="Robotics">Robotics & Automation</option>
                    <option value="Predictive Analytics">Predictive Analytics</option>
                    <option value="Smart Cities">Smart Cities & IoT</option>
                  </select>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Economic Sector *</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Health">Health</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Finance">Finance & Fintech</option>
                    <option value="Education">Education</option>
                    <option value="Security">Security & Law Enforcement</option>
                    <option value="Transport">Transport & Ports</option>
                    <option value="Energy">Energy & Power Grid</option>
                    <option value="Justice">Justice & Judiciary</option>
                    <option value="Local Government">Local Government</option>
                  </select>
                </div>
              </div>

              {/* 4. Risk Pre-Classification (SOW Section 4) */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                    Risk Pre-Classification (EU AI Act & SOW)
                  </span>
                  <div>{getRiskTierBadge(computedRiskTier)}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.74rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasBiometricOrHighImpact}
                      onChange={(e) => setHasBiometricOrHighImpact(e.target.checked)}
                      style={{ accentColor: '#f59e0b' }}
                    />
                    <span>Processes biometric identity, health diagnostic, credit score, or citizen benefit eligibility (High Risk)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasCriticalInfrastructure}
                      onChange={(e) => setHasCriticalInfrastructure(e.target.checked)}
                      style={{ accentColor: '#f59e0b' }}
                    />
                    <span>Autonomous control over critical national infrastructure (power, water, traffic, dam operations)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasChatbotOrContentGen}
                      onChange={(e) => setHasChatbotOrContentGen(e.target.checked)}
                      style={{ accentColor: '#38bdf8' }}
                    />
                    <span>Citizen-facing chatbot, deepfake/synthetic voice, or automated natural language generator (Limited Risk)</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={hasProhibitedPractices}
                      onChange={(e) => setHasProhibitedPractices(e.target.checked)}
                      style={{ accentColor: '#ef4444' }}
                    />
                    <span style={{ color: '#f87171' }}>Subliminal manipulation, social scoring, or biometric mass surveillance (Prohibited)</span>
                  </label>
                </div>
              </div>

              {/* 5. Evidence Checklist & Gatekeeper Attestations */}
              <div style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.015)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px'
              }}>
                <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Mandatory Evidence Package (SOW Section 5.2)
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.74rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={dpiaUploaded}
                      onChange={(e) => setDpiaUploaded(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span>Act 843 DPIA Report</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={vaptReportUploaded}
                      onChange={(e) => setVaptReportUploaded(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span>VAPT Pen-Test Report</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={modelDocUploaded}
                      onChange={(e) => setModelDocUploaded(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span>Model Specs & Data Card</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={biasAuditUploaded}
                      onChange={(e) => setBiasAuditUploaded(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span>Algorithmic Bias Audit</span>
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={slaUploaded}
                      onChange={(e) => setSlaUploaded(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span>Service Level Agreement (SLA)</span>
                  </label>
                </div>

                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.74rem' }}>
                    <input
                      type="checkbox"
                      checked={isSovereignHosting}
                      onChange={(e) => setIsSovereignHosting(e.target.checked)}
                      style={{ accentColor: '#10b981' }}
                    />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Sovereign Data Residency: Datasets and models are hosted in-country or on a NITA-certified sovereign cloud</span>
                  </label>
                </div>
              </div>

              {/* 6. Location & Budget */}
              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Deployment Region *</label>
                  <select
                    value={regionSelect}
                    onChange={(e) => handleRegionSelectChange(e.target.value)}
                    className="form-select"
                  >
                    {ghanaRegions.map(r => (
                      <option key={r.name} value={r.name}>{r.name} Region</option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
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

              <div className="form-grid" style={{ gridTemplateColumns: '1.2fr 1fr', gap: '10px', marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Allocated Budget (GHS) *</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Funding Source *</label>
                  <select
                    value={funding}
                    onChange={(e) => setFunding(e.target.value as any)}
                    className="form-select"
                  >
                    <option value="Government">Government</option>
                    <option value="Private Sector">Private Sector</option>
                    <option value="Development Partners">Dev Partners</option>
                    <option value="Donors">Donors</option>
                    <option value="Research Grants">Research Grants</option>
                  </select>
                </div>
              </div>

              <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: 0 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Target Completion Date *</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-input"
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ marginTop: '6px' }}>
                <Plus className="w-4 h-4" />
                <span>Submit to NAPTCS National Registry</span>
              </button>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
