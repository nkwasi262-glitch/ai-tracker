import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  XCircle, 
  Lock 
} from 'lucide-react';
import { AIProject, Organization } from '../data/sampleProjects';

interface PublicVerificationProps {
  projects: AIProject[];
  organizations: Organization[];
}

export const PublicVerification: React.FC<PublicVerificationProps> = ({ projects, organizations }) => {
  const [certInput, setCertInput] = useState('NAPTCS-CLR-2026-001');
  const [searchedCert, setSearchedCert] = useState('NAPTCS-CLR-2026-001');

  // Find project or organization matching certificate ID
  const matchedProject = projects.find(
    p => p.clearanceCertificateId && p.clearanceCertificateId.toLowerCase() === searchedCert.trim().toLowerCase()
  );

  const matchedOrg = organizations.find(
    o => o.clearanceCertificateId && o.clearanceCertificateId.toLowerCase() === searchedCert.trim().toLowerCase()
  );

  // List of only publicly cleared projects
  const publicClearedProjects = projects.filter(p => p.isPublished && p.clearanceStatus === 'Cleared');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedCert(certInput.trim());
  };

  const setQuickSearch = (id: string) => {
    setCertInput(id);
    setSearchedCert(id);
  };

  return (
    <div>
      {/* Header */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>National AI Public Verification Portal</h2>
          <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>Section 5.7 SOW</span>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Public transparency register for authenticating Sovereign AI Clearance Certificates and checking deployment permissions in Ghana
        </p>

        {/* Certificate Lookup Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginTop: '16px', maxWidth: '640px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search className="w-4 h-4 text-slate-400" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              required
              placeholder="Enter Certificate ID (e.g. NAPTCS-CLR-2026-001 or GH-ORG-CLR-2026-001)"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '36px', height: '42px', fontSize: '0.88rem' }}
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', height: '42px', fontSize: '0.85rem' }}>
            Verify Certificate
          </button>
        </form>

        {/* Quick sample pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Quick Verify:</span>
          <button onClick={() => setQuickSearch('NAPTCS-CLR-2026-001')} className="badge badge-info" style={{ cursor: 'pointer', border: 'none' }}>
            GhanaPostGPS (Gov)
          </button>
          <button onClick={() => setQuickSearch('NAPTCS-CLR-2026-013')} className="badge badge-info" style={{ cursor: 'pointer', border: 'none' }}>
            mPharma AI (Private)
          </button>
          <button onClick={() => setQuickSearch('NAPTCS-CLR-2026-014')} className="badge badge-info" style={{ cursor: 'pointer', border: 'none' }}>
            Zeepay AML (Private)
          </button>
          <button onClick={() => setQuickSearch('NAPTCS-CLR-2026-004-COND')} className="badge badge-warning" style={{ cursor: 'pointer', border: 'none' }}>
            E-Justice AI (Conditional)
          </button>
          <button onClick={() => setQuickSearch('GH-ORG-CLR-2026-002')} className="badge badge-success" style={{ cursor: 'pointer', border: 'none' }}>
            NIA Org Certificate
          </button>
        </div>
      </div>

      {/* Verification Result Card */}
      <div style={{ marginBottom: '32px' }}>
        {matchedProject ? (
          <div className="glass-card animated-fade-in" style={{
            padding: '24px',
            border: matchedProject.clearanceStatus === 'Cleared'
              ? '2px solid rgba(16, 185, 129, 0.4)'
              : '2px solid rgba(245, 158, 11, 0.4)',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span className={`badge ${matchedProject.clearanceStatus === 'Cleared' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                  {matchedProject.clearanceStatus === 'Cleared' ? '✓ OFFICIALLY CLEARED & CERTIFIED' : '▲ CONDITIONAL CLEARANCE'}
                </span>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '8px' }}>{matchedProject.name}</h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Project Code: <strong style={{ color: 'var(--text-primary)' }}>{matchedProject.projectCode}</strong> • Organization: <strong style={{ color: '#38bdf8' }}>{matchedProject.organizationName}</strong> ({matchedProject.entitySectorType})
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '10px 14px',
                textAlign: 'right'
              }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>National Clearance ID</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fbbf24', fontFamily: 'monospace' }}>
                  {matchedProject.clearanceCertificateId}
                </div>
              </div>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              marginTop: '18px',
              background: 'rgba(0,0,0,0.25)',
              padding: '14px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)'
            }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Risk Pre-Classification</span>
                <strong style={{ fontSize: '0.85rem', color: matchedProject.riskTier === 'High Risk' ? '#fbbf24' : '#34d399' }}>
                  {matchedProject.riskTier}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>National Clearance Score</span>
                <strong style={{ fontSize: '0.85rem', color: '#10b981' }}>
                  {matchedProject.clearanceScore}% (Grade: {matchedProject.compliance.overallGrade})
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Decision Authority</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {matchedProject.clearanceDecision?.decidedBy || 'Regulator'}
                </strong>
              </div>

              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>Valid Until</span>
                <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                  {matchedProject.clearanceDecision?.validUntil || '2028-12-31'}
                </strong>
              </div>
            </div>

            {/* Scope Limits */}
            <div style={{ marginTop: '14px', background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.78rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--ghana-emerald)', marginBottom: '2px' }}>Permitted Operational Scope:</div>
              <div style={{ color: 'var(--text-secondary)' }}>
                {matchedProject.clearanceDecision?.scopeLimits || 'National deployment within approved public use-case boundaries.'}
              </div>
            </div>

            {/* Conditions if any */}
            {matchedProject.clearanceDecision?.conditions && matchedProject.clearanceDecision.conditions.length > 0 && (
              <div style={{ marginTop: '12px', background: 'rgba(245, 158, 11, 0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(245, 158, 11, 0.2)', fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700, color: '#fbbf24', marginBottom: '4px' }}>Active Regulatory Conditions:</div>
                {matchedProject.clearanceDecision.conditions.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>• {c.requirement}</span>
                    <span style={{ color: '#fbbf24', fontWeight: 600 }}>Due: {c.deadline}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Redaction Notice */}
            <div style={{ marginTop: '14px', fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Sensitive algorithmic source hashes, penetration testing vulnerabilities, and DPIA internal logs are redacted from public view pursuant to Act 843 Section 23.</span>
            </div>
          </div>
        ) : matchedOrg ? (
          <div className="glass-card animated-fade-in" style={{
            padding: '24px',
            border: '2px solid rgba(16, 185, 129, 0.4)',
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(15, 23, 42, 0.95) 100%)'
          }}>
            <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
              ✓ CLEARED ORGANIZATION
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginTop: '8px' }}>{matchedOrg.name} ({matchedOrg.acronym})</h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Entity Type: <strong>{matchedOrg.entityType}</strong> • Sector: <strong>{matchedOrg.sector}</strong>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '16px', background: 'rgba(0,0,0,0.25)', padding: '14px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Certificate Number:</span>
                <div style={{ fontFamily: 'monospace', color: '#fbbf24', fontWeight: 700 }}>{matchedOrg.clearanceCertificateId}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>GRA TIN:</span>
                <div style={{ fontWeight: 600 }}>{matchedOrg.tinOrRegNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>DPC Registration:</span>
                <div style={{ color: '#38bdf8', fontWeight: 600 }}>{matchedOrg.dpcRegNumber}</div>
              </div>
              <div>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Validity:</span>
                <div>{matchedOrg.clearedDate} to {matchedOrg.expiryDate}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={{ padding: '24px', textAlign: 'center', border: '1px dashed rgba(239,68,68,0.4)' }}>
            <XCircle className="w-10 h-10 text-red-400" style={{ margin: '0 auto 8px auto' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f87171' }}>Certificate Not Found or Unapproved</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '480px', margin: '6px auto 0 auto' }}>
              No active sovereign clearance record exists for identifier "<strong>{searchedCert}</strong>". The system may be quarantined, pending review, or unregistered.
            </p>
          </div>
        )}
      </div>

      {/* Public Registry of Cleared Projects */}
      <div className="glass-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>National Public Register of Cleared AI Systems</h3>
            <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Open-access catalog of AI projects approved for live operation in Ghana ({publicClearedProjects.length} systems published)
            </p>
          </div>
          <span className="badge badge-success" style={{ fontSize: '0.72rem' }}>
            Verified Sovereign Open Data
          </span>
        </div>

        <div className="table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Project Name & Code</th>
                <th>Managing Entity</th>
                <th>Sector</th>
                <th>Clearance Certificate</th>
                <th>Clearance Grade</th>
                <th>Valid Until</th>
              </tr>
            </thead>
            <tbody>
              {publicClearedProjects.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{p.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{p.projectCode}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{p.organizationName}</div>
                    <div style={{ fontSize: '0.68rem', color: p.entitySectorType.includes('Government') ? '#38bdf8' : '#fbbf24' }}>
                      {p.entitySectorType.includes('Government') ? '🏛️ Government' : '🏢 Private Sector'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{p.sector}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'monospace', color: '#10b981', fontSize: '0.76rem', fontWeight: 700 }}>
                      {p.clearanceCertificateId}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.compliance.overallGrade === 'Excellent' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                      {p.compliance.overallGrade} ({p.clearanceScore}%)
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      {p.clearanceDecision?.validUntil || '2028-12-31'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
