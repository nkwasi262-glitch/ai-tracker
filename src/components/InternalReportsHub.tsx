import React, { useState } from 'react';
import { 
  MessageSquare, 
  Send, 
  Paperclip, 
  Plus
} from 'lucide-react';
import { UserSession } from '../data/authTypes';
import { AIProject } from '../data/sampleProjects';
import { InternalReport, ReportSeverity } from '../data/reportTypes';
import { 
  getInternalReports, 
  createInternalReport, 
  addReportComment, 
  markReportAsRead 
} from '../services/reportsService';

interface InternalReportsHubProps {
  session: UserSession;
  projects: AIProject[];
}

export const InternalReportsHub: React.FC<InternalReportsHubProps> = ({ session, projects }) => {
  const [reports, setReports] = useState<InternalReport[]>(() => getInternalReports());
  const [selectedReportId, setSelectedReportId] = useState<string>(reports[0]?.id || '');
  const [severityFilter, setSeverityFilter] = useState<string>('All');

  // Form states for creating new report
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newSeverity, setNewSeverity] = useState<ReportSeverity>('Urgent');
  const [newProjectId, setNewProjectId] = useState<string>(projects[0]?.id || '');
  const [newAssignedRole, setNewAssignedRole] = useState<'Technical Director' | 'Technical Clearance Team' | 'Super Admin' | 'Director General'>('Technical Clearance Team');

  // Comment state
  const [commentText, setCommentText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0];

  const handleSelectReport = (rep: InternalReport) => {
    setSelectedReportId(rep.id);
    markReportAsRead(rep.id, session.email);
    setReports(getInternalReports());
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const matchedProject = projects.find(p => p.id === newProjectId);

    const created = createInternalReport({
      title: newTitle,
      summary: newSummary,
      projectId: newProjectId,
      projectCode: matchedProject?.projectCode,
      severity: newSeverity,
      assignedRole: newAssignedRole,
      authorName: session.fullName,
      authorRole: session.role,
      authorEmail: session.email,
      authorInstitution: session.institution
    });

    setReports(prev => [created, ...prev]);
    setSelectedReportId(created.id);
    setShowCreateModal(false);
    setNewTitle('');
    setNewSummary('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !activeReport) return;

    const comment = addReportComment({
      reportId: activeReport.id,
      content: commentText.trim(),
      attachmentName: attachmentName.trim() || undefined,
      authorName: session.fullName,
      authorRole: session.role,
      authorEmail: session.email,
      authorInstitution: session.institution
    });

    if (comment) {
      setReports(getInternalReports());
      setCommentText('');
      setAttachmentName('');
    }
  };

  const filteredReports = severityFilter === 'All'
    ? reports
    : reports.filter(r => r.severity === severityFilter);

  const getSeverityBadge = (sev: ReportSeverity) => {
    switch (sev) {
      case 'Critical Escalation':
        return { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' };
      case 'Urgent':
        return { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' };
      case 'Medium Priority':
        return { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' };
      default:
        return { bg: 'rgba(148, 163, 184, 0.15)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.3)' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '16px',
        padding: '24px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'rgba(99, 102, 241, 0.2)',
            border: '1px solid rgba(99, 102, 241, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8'
          }}>
            <MessageSquare size={26} />
          </div>
          <div>
            <div style={{
              color: '#818cf8',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Technical Collaboration & Classified Escalation Hub
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              Internal Reports & Cross-Role Threads
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Inter-agency investigation notes, risk alerts, and review threads between clearance teams and directors.
            </p>
          </div>
        </div>

        {/* Create Report CTA */}
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            color: '#fff',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
          }}
        >
          <Plus size={16} /> Create Incident / Escalation
        </button>
      </div>

      {/* Main Grid: Left List, Right Thread */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px' }}>
        
        {/* Left Column: Report List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Active Reports ({filteredReports.length})
            </span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Severities</option>
              <option value="Critical Escalation">Critical Escalation</option>
              <option value="Urgent">Urgent</option>
              <option value="Medium Priority">Medium Priority</option>
              <option value="Information">Information</option>
            </select>
          </div>

          {/* Report Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filteredReports.map((rep) => {
              const isSelected = rep.id === activeReport?.id;
              const isUnread = !rep.readBy.includes(session.email);
              const badge = getSeverityBadge(rep.severity);

              return (
                <div
                  key={rep.id}
                  onClick={() => handleSelectReport(rep)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-card)',
                    border: isSelected ? '1px solid #6366f1' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                >
                  {isUnread && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: 'var(--ghana-emerald)',
                      boxShadow: '0 0 8px rgba(16, 185, 129, 0.8)'
                    }} />
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: badge.bg,
                      color: badge.text,
                      border: `1px solid ${badge.border}`
                    }}>
                      {rep.severity}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {rep.reportCode}
                    </span>
                  </div>

                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '4px', lineHeight: 1.3 }}>
                    {rep.title}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span>Project: {rep.projectCode || 'General'}</span>
                    <span>•</span>
                    <span>{rep.comments.length} comments</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Thread & Details */}
        {activeReport ? (
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: '16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Thread Header */}
            <div style={{
              padding: '24px 28px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
              background: 'rgba(255, 255, 255, 0.01)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  ...getSeverityBadge(activeReport.severity)
                }}>
                  {activeReport.severity}
                </span>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Created {new Date(activeReport.createdAt).toLocaleString()}
                </span>
              </div>

              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0, lineHeight: 1.3 }}>
                {activeReport.title}
              </h2>

              <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <span>Author: <strong>{activeReport.createdByName}</strong> ({activeReport.createdByRole})</span>
                <span>•</span>
                <span>Assigned to: <strong>{activeReport.assignedRole}</strong></span>
                {activeReport.projectCode && (
                  <>
                    <span>•</span>
                    <span>Linked Project: <strong style={{ color: 'var(--ghana-emerald)' }}>{activeReport.projectCode}</strong></span>
                  </>
                )}
              </div>

              <div style={{
                marginTop: '14px',
                padding: '14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                fontSize: '0.82rem',
                color: '#e2e8f0',
                lineHeight: 1.5
              }}>
                {activeReport.summary}
              </div>
            </div>

            {/* Comments Thread */}
            <div style={{
              padding: '24px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1,
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Investigation Commentary ({activeReport.comments.length})
              </div>

              {activeReport.comments.length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic', padding: '16px 0' }}>
                  No commentary posted yet. Add the first update below.
                </div>
              ) : (
                activeReport.comments.map((comm) => (
                  <div
                    key={comm.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: comm.authorEmail === session.email
                        ? 'rgba(99, 102, 241, 0.08)'
                        : 'rgba(255, 255, 255, 0.02)',
                      border: comm.authorEmail === session.email
                        ? '1px solid rgba(99, 102, 241, 0.25)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#fff' }}>
                          {comm.authorName}
                        </span>
                        <span style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>
                          {comm.authorRole}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, lineHeight: 1.4 }}>
                      {comm.content}
                    </p>

                    {comm.attachmentName && (
                      <div style={{
                        marginTop: '4px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        fontSize: '0.72rem',
                        color: 'var(--ghana-emerald)'
                      }}>
                        <Paperclip size={12} />
                        <span>Attached: {comm.attachmentName}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input */}
            <form
              onSubmit={handleAddComment}
              style={{
                padding: '20px 28px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                background: 'rgba(0, 0, 0, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
            >
              <textarea
                required
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post inter-agency comment, technical findings, or clearance updates..."
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#fff',
                  fontSize: '0.82rem',
                  outline: 'none',
                  resize: 'none'
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                  <Paperclip size={15} style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    value={attachmentName}
                    onChange={(e) => setAttachmentName(e.target.value)}
                    placeholder="Attach file reference (e.g. audit_log_v2.pdf)"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      fontSize: '0.78rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: '#6366f1',
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <Send size={14} /> Post Comment
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Select a report from the left panel to review thread history.
          </div>
        )}
      </div>

      {/* Create Report Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '28px',
            maxWidth: '560px',
            width: '100%',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', marginBottom: '6px' }}>
              Create Classified Incident or Escalation
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Log an inter-agency technical notice or security observation for review by technical directors.
            </p>

            <form onSubmit={handleCreateReport} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Model Drift Disparity in Regional Clustering"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Severity Level *
                  </label>
                  <select
                    value={newSeverity}
                    onChange={(e) => setNewSeverity(e.target.value as ReportSeverity)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#111b27',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Information">Information</option>
                    <option value="Medium Priority">Medium Priority</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Critical Escalation">Critical Escalation</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Assignee Role *
                  </label>
                  <select
                    value={newAssignedRole}
                    onChange={(e) => setNewAssignedRole(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#111b27',
                      border: '1px solid rgba(255, 255, 255, 0.12)',
                      color: '#fff',
                      fontSize: '0.82rem',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="Technical Clearance Team">Technical Clearance Team</option>
                    <option value="Technical Director">Technical Director</option>
                    <option value="Super Admin">Super Admin</option>
                    <option value="Director General">Director General</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Linked Project Registry Record
                </label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#111b27',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.projectCode} — {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Summary / Technical Findings *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Detail the technical observation, data defect, or policy violation..."
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '8px 20px',
                    borderRadius: '6px',
                    background: '#6366f1',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Dispatch Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
