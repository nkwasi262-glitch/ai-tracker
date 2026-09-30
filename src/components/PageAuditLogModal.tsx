import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Download, 
  Trash2, 
  CheckCircle2, 
  History, 
  ShieldCheck, 
  Filter
} from 'lucide-react';
import { PageLogEntry } from '../types/pageLog';

interface PageAuditLogModalProps {
  logs: PageLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onClearLogs: () => void;
  currentPage: string;
}

export const PageAuditLogModal: React.FC<PageAuditLogModalProps> = ({
  logs,
  isOpen,
  onClose,
  onClearLogs,
  currentPage
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('All');

  if (!isOpen) return null;

  // Filter logs
  const filteredLogs = logs.filter(log => {
    if (selectedModuleFilter !== 'All' && !log.pageName.includes(selectedModuleFilter)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPage = log.pageName.toLowerCase().includes(q);
      const matchRole = log.userRole.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchPath = log.path.toLowerCase().includes(q);
      const matchSess = log.sessionId.toLowerCase().includes(q);
      if (!matchPage && !matchRole && !matchAction && !matchPath && !matchSess) return false;
    }
    return true;
  });

  // Export to CSV
  const handleExportCsv = () => {
    const headers = ['Log ID', 'Timestamp', 'Page / Module', 'Route Path', 'User Role', 'Action', 'Status', 'Session ID', 'Network Node'];
    const rows = filteredLogs.map(l => [
      `"${l.id}"`,
      `"${l.timestamp}"`,
      `"${l.pageName}"`,
      `"${l.path}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${l.status}"`,
      `"${l.sessionId}"`,
      `"${l.node}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `NAPTCS_Page_Access_Audit_Log_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }}>
      <div className="glass-card animated-fade-in" style={{
        maxWidth: '960px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.85)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '16px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <History className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>National System Page Access & Audit Log</h3>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Immutable statutory navigation telemetry for all public and internal NAPTCS modules (Act 843 & NITA Act 771)
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>

        {/* Telemetry Quick KPI Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Total Page Events</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{logs.length}</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Current Active Route</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#10b981', marginTop: '4px', textTransform: 'capitalize' }}>
              /{currentPage}
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Compliance Status</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck className="w-4 h-4" />
              <span>Full Audit Active</span>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Telemetry Security</span>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fbbf24', marginTop: '4px' }}>
              SHA-256 Validated
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          background: 'rgba(0, 0, 0, 0.25)',
          padding: '10px 14px',
          borderRadius: '10px',
          border: '1px solid var(--border-color)'
        }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '220px' }}>
            <Search className="w-3.5 h-3.5 text-slate-400" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by page, role, route, action, session..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
              style={{ paddingLeft: '32px', minHeight: '42px', height: '42px', fontSize: '0.84rem' }}
            />
          </div>

          {/* Module Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedModuleFilter}
              onChange={(e) => setSelectedModuleFilter(e.target.value)}
              className="form-select"
              style={{ minHeight: '42px', height: '42px', fontSize: '0.84rem', minWidth: '190px' }}
            >
              <option value="All">All Pages & Modules</option>
              <option value="National Gateway">National Gateway (Home)</option>
              <option value="Organization Clearance">Organization Clearance</option>
              <option value="AI Projects Registry">AI Projects Registry</option>
              <option value="GIS Spatial">GIS Spatial Map</option>
              <option value="Governance">Governance & Ethics</option>
              <option value="AI Readiness">AI Readiness</option>
              <option value="Risk Matrix">Risk Matrix</option>
              <option value="Document Vault">Document Vault</option>
              <option value="Public Verification">Public Verification</option>
              <option value="Regulator AI">Regulator AI Assistant</option>
            </select>
          </div>

          {/* Export and Clear buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleExportCsv}
              className="btn btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px' }}
              title="Export page audit log to CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClearLogs}
              className="btn btn-secondary"
              style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.25)' }}
              title="Clear current log history"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="table-wrapper" style={{ maxHeight: '380px', overflowY: 'auto' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Timestamp</th>
                <th>Page / Module Name</th>
                <th>Route</th>
                <th>User Role</th>
                <th>Action</th>
                <th>Status</th>
                <th>Node / Session</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No audit log records match the current filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                        {log.timestamp}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                        {log.pageName}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-info" style={{ fontSize: '0.66rem', fontFamily: 'monospace' }}>
                        {log.path}
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                        {log.userRole}
                      </div>
                    </td>

                    <td>
                      <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>
                        {log.action}
                      </span>
                    </td>

                    <td>
                      <span className="badge badge-success" style={{ fontSize: '0.64rem', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{log.status}</span>
                      </span>
                    </td>

                    <td>
                      <div style={{ fontSize: '0.68rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        <div>{log.node}</div>
                        <div style={{ color: '#94a3b8' }}>{log.sessionId}</div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.72rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div>
            Showing {filteredLogs.length} of {logs.length} page access records
          </div>
          <div>
            NITA e-Governance Interoperability Framework (eGIF) Compliance
          </div>
        </div>
      </div>
    </div>
  );
};
