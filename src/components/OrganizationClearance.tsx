import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Plus, 
  Search, 
  Lock, 
  Unlock, 
  Download, 
  QrCode
} from 'lucide-react';
import { 
  Organization, 
  OrganizationClearanceStatus, 
  EntitySectorType, 
  AIProject 
} from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface OrganizationClearanceProps {
  organizations: Organization[];
  projects: AIProject[];
  onUpdateOrganizationClearance: (orgId: string, newStatus: OrganizationClearanceStatus, certId?: string) => void;
  onAddOrganization: (newOrg: Organization) => void;
  currentRole: UserRole;
}

export const OrganizationClearance: React.FC<OrganizationClearanceProps> = ({
  organizations,
  projects,
  onUpdateOrganizationClearance,
  onAddOrganization,
  currentRole
}) => {
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorTypeFilter, setSectorTypeFilter] = useState<string>('All');
  const [clearanceFilter, setClearanceFilter] = useState<string>('All');
  
  // Certificate view modal
  const [viewingCertOrg, setViewingCertOrg] = useState<Organization | null>(null);
  
  // New Organization Modal
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [formName, setFormName] = useState('');
  const [formAcronym, setFormAcronym] = useState('');
  const [formEntityType, setFormEntityType] = useState<EntitySectorType>('Private Sector (Commercial Enterprise)');
  const [formTin, setFormTin] = useState('');
  const [formDpc, setFormDpc] = useState('');
  const [formSector, setFormSector] = useState<any>('Health');
  const [formRegion, setFormRegion] = useState('Greater Accra');
  const [formDistrict, setFormDistrict] = useState('Accra Metropolitan');
  const [formDpoName, setFormDpoName] = useState('');
  const [formDpoEmail, setFormDpoEmail] = useState('');
  const [formContactEmail, setFormContactEmail] = useState('');
  const [formWebsite, setFormWebsite] = useState('');
  const [formDataHosting, setFormDataHosting] = useState<any>('In-Country (National Data Centre)');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Clearance authority rights
  const canAuthorizeClearance = [
    'Regulator / Clearance Authority', 
    'Technical Review Committee (TCC)', 
    'Super Administrator', 
    'National AI Authority'
  ].includes(currentRole);

  // Filtered organizations
  const filteredOrganizations = organizations.filter(org => {
    // Sector Type
    if (sectorTypeFilter !== 'All') {
      if (sectorTypeFilter === 'Government' && !org.entityType.includes('Government')) return false;
      if (sectorTypeFilter === 'Private' && !org.entityType.includes('Private')) return false;
      if (sectorTypeFilter === 'International' && !org.entityType.includes('International')) return false;
    }
    // Clearance status
    if (clearanceFilter !== 'All' && org.clearanceStatus !== clearanceFilter) return false;
    // Search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = org.name.toLowerCase().includes(q);
      const matchAcronym = org.acronym.toLowerCase().includes(q);
      const matchTin = org.tinOrRegNumber.toLowerCase().includes(q);
      const matchDpc = org.dpcRegNumber.toLowerCase().includes(q);
      const matchDpo = org.dpoName.toLowerCase().includes(q);
      if (!matchName && !matchAcronym && !matchTin && !matchDpc && !matchDpo) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalOrgs = organizations.length;
  const clearedOrgs = organizations.filter(o => o.clearanceStatus === 'Cleared').length;
  const pendingOrgs = organizations.filter(o => o.clearanceStatus === 'Pending Review').length;
  const conditionalOrgs = organizations.filter(o => o.clearanceStatus === 'Conditional').length;
  const notClearedOrgs = organizations.filter(o => o.clearanceStatus === 'Not Cleared' || o.clearanceStatus === 'Suspended').length;
  
  const govOrgs = organizations.filter(o => o.entityType.includes('Government')).length;
  const privateOrgs = organizations.filter(o => o.entityType.includes('Private')).length;

  // Handle Form Submission
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formTin.trim() || !formDpc.trim()) {
      alert('Please fill out all mandatory fields: Legal Name, TIN/Registration No, and DPC Certificate No.');
      return;
    }

    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: formName.trim(),
      acronym: formAcronym.trim() || formName.trim().slice(0, 4).toUpperCase(),
      entityType: formEntityType,
      tinOrRegNumber: formTin.trim(),
      dpcRegNumber: formDpc.trim(),
      sector: formSector,
      region: formRegion,
      district: formDistrict,
      dpoName: formDpoName.trim() || 'Appointed DPO',
      dpoEmail: formDpoEmail.trim() || 'dpo@entity.gh',
      contactEmail: formContactEmail.trim() || 'info@entity.gh',
      website: formWebsite.trim() || 'https://entity.gh',
      clearanceStatus: 'Pending Review', // Starts quarantined!
      reviewNotes: 'Newly onboarded entity. Awaiting statutory KYC/KYB and DPC Act 843 cross-border data transfer audit.',
      submittedAt: new Date().toISOString().slice(0, 10),
      sovereignDataHosting: formDataHosting
    };

    onAddOrganization(newOrg);
    setShowRegisterModal(false);
    setSuccessToast(`Organization "${newOrg.name}" registered successfully. Status: PENDING REVIEW (Projects will remain quarantined until cleared).`);
    setTimeout(() => setSuccessToast(null), 6000);

    // Reset fields
    setFormName('');
    setFormAcronym('');
    setFormTin('');
    setFormDpc('');
    setFormDpoName('');
    setFormDpoEmail('');
  };

  // Quick Action: Approve Clearance
  const handleQuickApprove = (org: Organization) => {
    const certId = `GH-ORG-CLR-2026-${Math.floor(100 + Math.random() * 900)}`;
    onUpdateOrganizationClearance(org.id, 'Cleared', certId);
    setSuccessToast(`Sovereign Clearance granted to "${org.name}"! Certificate: ${certId}. Linked AI projects are now UNLOCKED & PUBLISHED.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  // Quick Action: Suspend / Revoke
  const handleQuickSuspend = (org: Organization) => {
    onUpdateOrganizationClearance(org.id, 'Suspended');
    setSuccessToast(`Clearance for "${org.name}" SUSPENDED. All associated AI systems have been quarantined from the public system.`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div>
      {/* Top Banner / Title Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Organization Registration & Clearance Gate</h2>
            <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>Sovereign Gate Active</span>
            <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>Act 843 & NAPTCS Scope</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Statutory clearance gateway for both Government (MDAs/SOEs) and Private Sector entities deploying AI in Ghana
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="btn btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus className="w-4 h-4" />
            <span>Register New Entity</span>
          </button>
        </div>
      </div>

      {/* Success Notification Toast */}
      {successToast && (
        <div style={{
          marginBottom: '16px',
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          padding: '12px 18px',
          borderRadius: '8px',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Sovereign Gatekeeper Alert Notice */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(239, 68, 68, 0.05))',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: '10px',
        padding: '14px 20px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'rgba(245, 158, 11, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Lock className="w-5 h-5 text-amber-400" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fbbf24' }}>
            National Sovereign Gating Policy (Section 1 & 4 of NAPTCS Framework)
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: '1.45' }}>
            Every organization (Government MDA, SOE, Commercial Enterprise, Startup, or Foreign Vendor) <strong>must be registered and formally cleared</strong> before any of its AI systems appear on the National Registry, GIS Spatial Map, or Public Verification Register. AI submissions from uncleared organizations remain quarantined in the evaluation pipeline.
          </p>
        </div>
      </div>

      {/* KPI Counters Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Organizations */}
        <div className="glass-card" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Total Registered
            </span>
            <Building2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: 'var(--text-primary)' }}>
            {totalOrgs}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {govOrgs} Government • {privateOrgs} Private Sector
          </div>
        </div>

        {/* Cleared & Sovereign Approved */}
        <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Cleared & Approved
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#10b981' }}>
            {clearedOrgs}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Authorized to deploy & publish AI systems
          </div>
        </div>

        {/* Quarantined / Pending Review */}
        <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #fbbf24' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Quarantined / Pending
            </span>
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#fbbf24' }}>
            {pendingOrgs}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Awaiting statutory KYC/DPC audit
          </div>
        </div>

        {/* Conditional & Not Cleared */}
        <div className="glass-card" style={{ padding: '16px', borderLeft: '4px solid #f87171' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Conditional / Suspended
            </span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '8px', color: '#f87171' }}>
            {conditionalOrgs + notClearedOrgs}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {conditionalOrgs} Conditional • {notClearedOrgs} Blocked
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1 1 240px' }}>
          <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search by entity name, acronym, TIN, DPC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '32px', height: '36px', fontSize: '0.8rem' }}
          />
        </div>

        {/* Sector Type Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sector:</span>
          <select
            value={sectorTypeFilter}
            onChange={(e) => setSectorTypeFilter(e.target.value)}
            className="form-input"
            style={{ height: '36px', fontSize: '0.78rem', minWidth: '150px' }}
          >
            <option value="All">All Sectors</option>
            <option value="Government">Government (MDAs/SOEs)</option>
            <option value="Private">Private Sector (Commercial)</option>
            <option value="International">International Vendors</option>
          </select>
        </div>

        {/* Clearance Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600 }}>Clearance:</span>
          <select
            value={clearanceFilter}
            onChange={(e) => setClearanceFilter(e.target.value)}
            className="form-input"
            style={{ height: '36px', fontSize: '0.78rem', minWidth: '140px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Cleared">Cleared & Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Conditional">Conditional</option>
            <option value="Not Cleared">Not Cleared / Suspended</option>
          </select>
        </div>
      </div>

      {/* Organizations Directory Table */}
      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Organization & Sector</th>
              <th>Entity Type</th>
              <th>TIN / DPC Reg</th>
              <th>Data Hosting</th>
              <th>Linked AI Projects</th>
              <th>Clearance Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrganizations.map((org) => {
              // Find projects belonging to this organization
              const orgProjects = projects.filter(p => p.organizationId === org.id);
              const isCleared = org.clearanceStatus === 'Cleared';
              const isPending = org.clearanceStatus === 'Pending Review';
              const isConditional = org.clearanceStatus === 'Conditional';

              return (
                <tr key={org.id} style={{ opacity: org.clearanceStatus === 'Not Cleared' ? 0.75 : 1 }}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                        {org.name} <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>({org.acronym})</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Sector: <strong>{org.sector}</strong> • {org.district}, {org.region}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#94a3b8', marginTop: '1px' }}>
                        DPO: {org.dpoName} ({org.dpoEmail})
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${org.entityType.includes('Government') ? 'badge-info' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {org.entityType.includes('Government') ? '🏛️ Government' : '🏢 Private Sector'}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      <div style={{ color: 'var(--text-secondary)' }}>TIN: <strong style={{ color: 'var(--text-primary)' }}>{org.tinOrRegNumber}</strong></div>
                      <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>DPC: <strong style={{ color: '#38bdf8' }}>{org.dpcRegNumber}</strong></div>
                    </div>
                  </td>

                  <td>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                      {org.sovereignDataHosting}
                    </div>
                  </td>

                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: orgProjects.length > 0 ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {orgProjects.length} {orgProjects.length === 1 ? 'System' : 'Systems'}
                      </span>
                      {orgProjects.length > 0 && (
                        <span style={{ 
                          fontSize: '0.65rem', 
                          fontWeight: 600,
                          color: isCleared ? '#10b981' : isConditional ? '#fbbf24' : '#ef4444' 
                        }}>
                          {isCleared ? '● Published' : isConditional ? '▲ Conditional Publish' : '🔒 Quarantined'}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${
                      isCleared ? 'badge-success' : isPending ? 'badge-warning' : isConditional ? 'badge-info' : 'badge-danger'
                    }`} style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      {isCleared ? <ShieldCheck className="w-3 h-3" /> : isPending ? <Clock className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                      <span>{org.clearanceStatus}</span>
                    </span>
                    {org.clearanceCertificateId && (
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '3px' }}>
                        {org.clearanceCertificateId}
                      </div>
                    )}
                  </td>

                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {/* View Certificate */}
                      {org.clearanceCertificateId && (
                        <button
                          onClick={() => setViewingCertOrg(org)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="View Sovereign Clearance Certificate"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Certificate</span>
                        </button>
                      )}

                      {/* Regulator Action: Approve Clearance */}
                      {canAuthorizeClearance && !isCleared && (
                        <button
                          onClick={() => handleQuickApprove(org)}
                          className="btn btn-primary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          title="Grant Sovereign Clearance & Unlock Linked AI Projects"
                        >
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Clear Entity</span>
                        </button>
                      )}

                      {/* Regulator Action: Suspend Clearance */}
                      {canAuthorizeClearance && isCleared && (
                        <button
                          onClick={() => handleQuickSuspend(org)}
                          className="btn btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}
                          title="Suspend clearance and quarantine all projects"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: Register New Organization */}
      {showRegisterModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animated-fade-in" style={{
            maxWidth: '650px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Register Organization for National AI Clearance</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Statutory KYC/KYB & DPC Registration under Ghana Data Protection Act 2012 (Act 843)
                </p>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="btn btn-secondary"
                style={{ padding: '4px 10px', fontSize: '0.75rem' }}
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit}>
              <div className="form-grid" style={{ marginBottom: '16px' }}>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Organization Legal Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Health Technologies Ghana Ltd"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Acronym / Trading Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Apex AI"
                    value={formAcronym}
                    onChange={(e) => setFormAcronym(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Entity Sector Type *</label>
                  <select
                    value={formEntityType}
                    onChange={(e) => setFormEntityType(e.target.value as EntitySectorType)}
                    className="form-input"
                  >
                    <option value="Government (MDA/MMDA/SOE)">Government (MDA / MMDA / SOE)</option>
                    <option value="Private Sector (Commercial Enterprise)">Private Sector (Commercial Enterprise)</option>
                    <option value="Private Sector (Startup/SME)">Private Sector (Startup / SME)</option>
                    <option value="Academic & Research Institution">Academic & Research Institution</option>
                    <option value="International Vendor / Partner">International Vendor / Partner</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">GRA TIN or RGD Business Reg No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C001892842X or GA-GOV-001"
                    value={formTin}
                    onChange={(e) => setFormTin(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Data Protection Commission (DPC) Reg No. *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DPC/PVT/2026/00142"
                    value={formDpc}
                    onChange={(e) => setFormDpc(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Primary Sector</label>
                  <select
                    value={formSector}
                    onChange={(e) => setFormSector(e.target.value)}
                    className="form-input"
                  >
                    <option value="Health">Health</option>
                    <option value="Agriculture">Agriculture</option>
                    <option value="Finance">Finance</option>
                    <option value="Security">Security</option>
                    <option value="Transport">Transport</option>
                    <option value="Energy">Energy</option>
                    <option value="Environment">Environment</option>
                    <option value="Education">Education</option>
                    <option value="Justice">Justice</option>
                    <option value="Local Government">Local Government</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Operating Region</label>
                  <input
                    type="text"
                    value={formRegion}
                    onChange={(e) => setFormRegion(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">District / Municipality</label>
                  <input
                    type="text"
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Official Email</label>
                  <input
                    type="email"
                    placeholder="contact@entity.gov.gh"
                    value={formContactEmail}
                    onChange={(e) => setFormContactEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Official Website URL</label>
                  <input
                    type="url"
                    placeholder="https://entity.gov.gh"
                    value={formWebsite}
                    onChange={(e) => setFormWebsite(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Appointed Data Protection Officer (DPO)</label>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={formDpoName}
                    onChange={(e) => setFormDpoName(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">DPO Official Email</label>
                  <input
                    type="email"
                    placeholder="dpo@company.com"
                    value={formDpoEmail}
                    onChange={(e) => setFormDpoEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Sovereign Data Residency Commitment</label>
                  <select
                    value={formDataHosting}
                    onChange={(e) => setFormDataHosting(e.target.value)}
                    className="form-input"
                  >
                    <option value="In-Country (National Data Centre)">In-Country (Ghana National Data Centre - NITA Tier III)</option>
                    <option value="Government-Approved Cloud">Government-Approved Sovereign Cloud (Subject to NITA / eGIF approval)</option>
                    <option value="Hybrid Edge">Hybrid In-Country Edge</option>
                  </select>
                </div>
              </div>

              <div style={{
                background: 'rgba(59, 130, 246, 0.08)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                fontSize: '0.74rem',
                color: '#93c5fd',
                marginBottom: '16px'
              }}>
                ℹ️ <strong>Submission Notice:</strong> Submitting this registration places your organization into <strong>Pending Review</strong> status. Once approved by the NAPTCS Regulator, a formal Sovereign Clearance Certificate will be issued and your AI systems will be eligible for public deployment.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Sovereign Organization Clearance Certificate */}
      {viewingCertOrg && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="glass-card animated-fade-in" style={{
            maxWidth: '620px',
            width: '100%',
            background: 'linear-gradient(145deg, #0d1527 0%, #111e38 100%)',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            borderRadius: '16px',
            padding: '32px',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)'
          }}>
            {/* Certificate Header */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '20px', marginBottom: '24px' }}>
              <div style={{ fontSize: '2rem', marginBottom: '6px' }}>🇬🇭</div>
              <div style={{ fontSize: '0.74rem', letterSpacing: '0.12em', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 800 }}>
                REPUBLIC OF GHANA • NATIONAL AI REGULATORY OVERSIGHT
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '4px', color: '#f8fafc' }}>
                ORGANIZATION SOVEREIGN CLEARANCE CERTIFICATE
              </h2>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Issued pursuant to Ghana Data Protection Act 2012 (Act 843) & NAPTCS Framework
              </div>
            </div>

            {/* Certificate Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This certifies that</span>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  {viewingCertOrg.name} ({viewingCertOrg.acronym})
                </div>
                <div style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '2px' }}>
                  {viewingCertOrg.entityType} • Sector: {viewingCertOrg.sector}
                </div>
              </div>

              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                fontSize: '0.76rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Certificate Identifier:</span>
                  <strong style={{ color: '#fbbf24', fontFamily: 'monospace', fontSize: '0.82rem' }}>
                    {viewingCertOrg.clearanceCertificateId}
                  </strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Clearance Status:</span>
                  <strong style={{ color: '#10b981' }}>{viewingCertOrg.clearanceStatus} (Authorized)</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>GRA TIN / Registration:</span>
                  <strong>{viewingCertOrg.tinOrRegNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>DPC Act 843 Accreditation:</span>
                  <strong style={{ color: '#38bdf8' }}>{viewingCertOrg.dpcRegNumber}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Effective Date:</span>
                  <strong>{viewingCertOrg.clearedDate || '2024-01-15'}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Expiry / Review Date:</span>
                  <strong>{viewingCertOrg.expiryDate || '2027-01-15'}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontStyle: 'italic', textAlign: 'center' }}>
                "Authorized to design, register, and operate Artificial Intelligence systems within the sovereign territory of Ghana in strict compliance with statutory ethical and data sovereignty guidelines."
              </div>
            </div>

            {/* Certificate Footer Seals */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <QrCode className="w-10 h-10 text-slate-300" />
                <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                  <div>Scan for verification</div>
                  <div style={{ fontFamily: 'monospace' }}>gnaprms.gov.gh/verify/{viewingCertOrg.clearanceCertificateId}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => alert(`Certificate ${viewingCertOrg.clearanceCertificateId} downloaded in PDF format.`)}
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setViewingCertOrg(null)}
                  className="btn btn-primary"
                  style={{ padding: '6px 16px', fontSize: '0.76rem' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
