import React, { useState } from 'react';
import { 
  DollarSign, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  MessageSquare,
  Send,
  Edit3,
  Trash2
} from 'lucide-react';
import { AIProject, formatNumberToWords, computeZeroAssumptionSummary, isProjectApprovedByDG } from '../data/sampleProjects';
import { UserSession } from '../data/authTypes';
import { recordAuditEvent } from '../services/auditService';
import { canPerformAction } from '../services/rbacPolicy';

export interface MinisterialDirective {
  id: string;
  projectId?: string;
  projectCode?: string;
  targetTitle: string;
  comment: string;
  authorName: string;
  authorRole: string;
  createdAt: string;
  directiveType: 'General Policy' | 'Budget Release Caveat' | 'Audit Action' | 'Disbursement Approval';
}

const MOF_DIRECTIVES_STORAGE_KEY = 'gnaprms_mof_directives_v1';

const INITIAL_DIRECTIVES: MinisterialDirective[] = [
  {
    id: 'mof-dir-1',
    projectId: 'proj-1',
    projectCode: 'GN-AI-2026-001',
    targetTitle: 'GhanaPostGPS (National Digital Addressing System)',
    comment: 'Tranche 2 disbursement fully verified against MoF Treasury Warrant. Proceed with emergency dispatch caching expansion in Q4; ensure strict local vendor compliance under Act 921.',
    authorName: 'Hon. Dr. Mohammed Amin Adam (Finance Minister)',
    authorRole: 'Finance Minister',
    createdAt: '2026-09-18',
    directiveType: 'Disbursement Approval'
  },
  {
    id: 'mof-dir-2',
    targetTitle: '🌐 National AI Portfolio (Overall Fiscal Directive)',
    comment: 'All MDAs utilizing AI grant allocations must submit monthly primary bank vouchers and warrant reconciliation. Zero assumption of disbursement without MoF clearance.',
    authorName: 'Hon. Dr. Mohammed Amin Adam (Finance Minister)',
    authorRole: 'Finance Minister',
    createdAt: '2026-10-18',
    directiveType: 'General Policy'
  }
];

function loadDirectives(): MinisterialDirective[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return INITIAL_DIRECTIVES;
  }
  try {
    const raw = localStorage.getItem(MOF_DIRECTIVES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MOF_DIRECTIVES_STORAGE_KEY, JSON.stringify(INITIAL_DIRECTIVES));
      return INITIAL_DIRECTIVES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to parse directives', e);
  }
  return INITIAL_DIRECTIVES;
}

interface FinanceMinisterViewProps {
  projects: AIProject[];
  session: UserSession;
  onUpdateProjectBudget?: (projectId: string, updatedBudget: AIProject['budget'], zeroAssumption?: AIProject['zeroAssumptionAudit']) => void;
}

export const FinanceMinisterView: React.FC<FinanceMinisterViewProps> = ({ projects, session, onUpdateProjectBudget }) => {
  const [selectedFundingSource, setSelectedFundingSource] = useState<string>('All');
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Verification modal state
  const [verifyingProject, setVerifyingProject] = useState<AIProject | null>(null);
  const [auditWarrantInput, setAuditWarrantInput] = useState('');
  const [auditNotesInput, setAuditNotesInput] = useState('');
  const [auditCommentInput, setAuditCommentInput] = useState('');

  // Ministerial Directives & Commentary state
  const [directives, setDirectives] = useState<MinisterialDirective[]>(() => loadDirectives());
  const [selectedTargetProjectId, setSelectedTargetProjectId] = useState<string>('ALL');
  const [directiveType, setDirectiveType] = useState<MinisterialDirective['directiveType']>('Budget Release Caveat');
  const [commentInput, setCommentInput] = useState<string>('');
  const [editingDirectiveId, setEditingDirectiveId] = useState<string | null>(null);
  const [directiveFeedback, setDirectiveFeedback] = useState<string | null>(null);

  const canVerifyExpenditure = canPerformAction(session.role, 'VERIFY_FINANCIAL_EXPENDITURE');
  const zeroMetrics = computeZeroAssumptionSummary(projects);
  const approvedProjects = projects.filter(isProjectApprovedByDG);

  // Financial calculations (DG-Approved National Portfolio)
  const totalAllocated = approvedProjects.reduce((acc, p) => acc + p.budget.totalAllocated, 0);
  const totalDisbursed = approvedProjects.reduce((acc, p) => acc + p.budget.disbursed, 0);
  const totalUtilized = approvedProjects.reduce((acc, p) => acc + p.budget.utilized, 0);
  const totalRemaining = approvedProjects.reduce((acc, p) => acc + p.budget.remaining, 0);
  const utilizationRate = totalAllocated > 0 ? (totalUtilized / totalAllocated) * 100 : 0;
  const disbursementRate = totalAllocated > 0 ? (totalDisbursed / totalAllocated) * 100 : 0;

  // Breakdown by funding source
  const fundingSources = ['Government', 'Development Partners', 'Donors', 'Private Sector', 'Research Grants'];
  const fundingBreakdown = fundingSources.map(source => {
    const allocated = approvedProjects
      .filter(p => p.budget.primaryFundingSource === source)
      .reduce((acc, p) => acc + p.budget.totalAllocated, 0);
    const count = approvedProjects.filter(p => p.budget.primaryFundingSource === source).length;
    return {
      source,
      allocated,
      count,
      percent: totalAllocated > 0 ? (allocated / totalAllocated) * 100 : 0
    };
  });

  // Filtered projects
  const filteredProjects = selectedFundingSource === 'All'
    ? projects
    : projects.filter(p => p.budget.primaryFundingSource === selectedFundingSource);

  // Export handlers
  const handleExportCSV = () => {
    const headers = [
      'Project Code', 
      'Project Name', 
      'Sector', 
      'MDA', 
      'Funding Source', 
      'Allocated (GHS)', 
      'Disbursed (GHS)', 
      'Utilized (GHS)', 
      'Remaining (GHS)', 
      'Verification Status',
      'MoF Treasury Warrant Number',
      'Stage'
    ];
    const rows = filteredProjects.map(p => [
      p.projectCode,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sector,
      `"${p.mda.replace(/"/g, '""')}"`,
      p.budget.primaryFundingSource,
      p.budget.totalAllocated,
      p.budget.disbursed,
      p.budget.utilized,
      p.budget.remaining,
      p.budget.verificationStatus || 'Self-Reported (Unverified)',
      p.budget.mofWarrantNumber || 'None',
      p.stage
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ghana_National_AI_Financial_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordAuditEvent({
      eventType: 'FINANCIAL_EXPORT',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      actionDetails: `Exported comprehensive National AI financial CSV ledger (${filteredProjects.length} projects).`
    });

    setExportFeedback('CSV statutory financial ledger with verification provenance successfully exported.');
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      title: 'Republic of Ghana National AI Fiscal & Zero-Assumption Dossier',
      authority: 'Ministry of Finance & Economic Planning (MoF)',
      exportTimestamp: new Date().toISOString(),
      officer: session.fullName,
      zeroAssumptionSummary: zeroMetrics,
      projects: filteredProjects
    }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Ghana_National_AI_Fiscal_ZeroAssumption_Dossier_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    recordAuditEvent({
      eventType: 'FINANCIAL_EXPORT',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      actionDetails: `Exported statutory fiscal JSON dossier (${filteredProjects.length} projects).`
    });

    setExportFeedback('JSON statutory fiscal dossier exported with complete audit signatures.');
  };

  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyingProject) return;
    if (!auditWarrantInput.trim()) {
      alert('A valid statutory MoF Treasury Warrant Number is required to eliminate assumptions.');
      return;
    }

    const updatedBudget: AIProject['budget'] = {
      ...verifyingProject.budget,
      verificationStatus: 'MoF Audited & Verified',
      mofWarrantNumber: auditWarrantInput.trim(),
      lastAuditedDate: new Date().toISOString().split('T')[0],
      auditedBy: `${session.fullName} (Ministry of Finance)`,
      auditNotes: auditNotesInput.trim() || 'MoF Treasury Warrant verified under Act 921. Assumption eliminated.',
      hasAssumptionsFlag: false,
      assumptionWarnings: [],
      financeMinisterComments: auditCommentInput.trim() || verifyingProject.budget.financeMinisterComments,
      financeMinisterCommentDate: auditCommentInput.trim() ? new Date().toISOString().split('T')[0] : verifyingProject.budget.financeMinisterCommentDate,
      financeMinisterCommentAuthor: auditCommentInput.trim() ? session.fullName : verifyingProject.budget.financeMinisterCommentAuthor
    };

    if (auditCommentInput.trim()) {
      const newDir: MinisterialDirective = {
        id: `mof-dir-${Date.now()}`,
        projectId: verifyingProject.id,
        projectCode: verifyingProject.projectCode,
        targetTitle: `[${verifyingProject.projectCode}] ${verifyingProject.name}`,
        comment: auditCommentInput.trim(),
        authorName: session.fullName.includes('Adam') ? session.fullName : `${session.fullName} (Finance Minister)`,
        authorRole: session.role,
        createdAt: new Date().toISOString().split('T')[0],
        directiveType: 'Disbursement Approval'
      };
      const updatedDirs = [newDir, ...directives];
      setDirectives(updatedDirs);
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(MOF_DIRECTIVES_STORAGE_KEY, JSON.stringify(updatedDirs));
      }
    }

    if (onUpdateProjectBudget) {
      onUpdateProjectBudget(verifyingProject.id, updatedBudget, {
        isFullyVerified: true,
        evidenceBackingScore: 95,
        verifiedSignals: [`MoF Warrant #${auditWarrantInput.trim()} verified`, 'Treasury payment vouchers confirmed'],
        unverifiedAssumptions: [],
        lastAuditedDate: new Date().toISOString().split('T')[0],
        assumptionsEliminatedCount: (verifyingProject.zeroAssumptionAudit?.assumptionsEliminatedCount || 0) + 1
      });
    }

    recordAuditEvent({
      eventType: 'FINANCIAL_VERIFICATION_UPDATE',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      targetEntityId: verifyingProject.id,
      actionDetails: `Attached MoF Treasury Warrant #${auditWarrantInput.trim()} for ${verifyingProject.projectCode}. Assumption eliminated.`
    });

    setExportFeedback(`Project ${verifyingProject.projectCode} successfully verified under MoF Treasury Warrant #${auditWarrantInput.trim()}. Assumption eliminated.`);
    setVerifyingProject(null);
    setAuditWarrantInput('');
    setAuditNotesInput('');
    setAuditCommentInput('');
  };

  const handleSaveMinisterComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      alert('Please enter a comment or directive before saving.');
      return;
    }

    const isGeneral = selectedTargetProjectId === 'ALL';
    const targetProject = projects.find(p => p.id === selectedTargetProjectId);
    const targetTitle = isGeneral 
      ? '🌐 National AI Portfolio (Overall Fiscal Directive)' 
      : `[${targetProject?.projectCode || ''}] ${targetProject?.name || ''}`;

    const newDirective: MinisterialDirective = {
      id: editingDirectiveId || `mof-dir-${Date.now()}`,
      projectId: isGeneral ? undefined : targetProject?.id,
      projectCode: isGeneral ? undefined : targetProject?.projectCode,
      targetTitle,
      comment: commentInput.trim(),
      authorName: session.fullName.includes('Adam') ? session.fullName : `${session.fullName} (Finance Minister)`,
      authorRole: session.role,
      createdAt: new Date().toISOString().split('T')[0],
      directiveType
    };

    const updatedDirectives = editingDirectiveId
      ? directives.map(d => d.id === editingDirectiveId ? newDirective : d)
      : [newDirective, ...directives.filter(d => d.id !== newDirective.id)];

    setDirectives(updatedDirectives);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(MOF_DIRECTIVES_STORAGE_KEY, JSON.stringify(updatedDirectives));
    }

    if (!isGeneral && targetProject && onUpdateProjectBudget) {
      const updatedBudget: AIProject['budget'] = {
        ...targetProject.budget,
        financeMinisterComments: commentInput.trim(),
        financeMinisterCommentDate: new Date().toISOString().split('T')[0],
        financeMinisterCommentAuthor: session.fullName
      };
      onUpdateProjectBudget(targetProject.id, updatedBudget);
    }

    recordAuditEvent({
      eventType: 'FINANCIAL_VERIFICATION_UPDATE',
      actorName: session.fullName,
      actorEmail: session.email,
      actorRole: session.role,
      actorInstitution: session.institution,
      targetModule: 'finance',
      targetEntityId: targetProject?.id,
      actionDetails: `Recorded official Ministerial comment (${directiveType}) for ${targetTitle}: "${commentInput.trim().substring(0, 80)}..."`
    });

    setDirectiveFeedback(`Official Ministerial Directive successfully recorded for ${isGeneral ? 'National AI Portfolio' : targetProject?.projectCode}.`);
    setEditingDirectiveId(null);
    setCommentInput('');
  };

  const handleEditDirective = (dir: MinisterialDirective) => {
    setEditingDirectiveId(dir.id);
    setSelectedTargetProjectId(dir.projectId || 'ALL');
    setDirectiveType(dir.directiveType);
    setCommentInput(dir.comment);
    const el = document.getElementById('minister-comment-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteDirective = (id: string) => {
    const updated = directives.filter(d => d.id !== id);
    setDirectives(updated);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(MOF_DIRECTIVES_STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const handleSelectProjectForComment = (proj: AIProject) => {
    setSelectedTargetProjectId(proj.id);
    setDirectiveType('Budget Release Caveat');
    setCommentInput(proj.budget.financeMinisterComments || '');
    setEditingDirectiveId(null);
    const el = document.getElementById('minister-comment-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
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
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--ghana-gold)'
          }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div style={{
              color: 'var(--ghana-gold)',
              fontSize: '0.72rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Ministry of Finance & Economic Planning (MoF)
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              National AI Fiscal Portfolio & Capital Analytics
            </h1>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Statutory expenditure tracking, disbursement reconciliation, and exportable financial reports.
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleExportCSV}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#a7f3d0',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <FileSpreadsheet size={15} /> Export CSV Ledger
          </button>
          <button
            onClick={handleExportJSON}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 16px',
              borderRadius: '8px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              color: '#fde68a',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer'
            }}
          >
            <Download size={15} /> Fiscal JSON Export
          </button>
        </div>
      </div>

      {/* Export Feedback Banner */}
      {exportFeedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          color: '#a7f3d0',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{exportFeedback}</span>
          </div>
          <button onClick={() => setExportFeedback(null)} style={{ background: 'none', border: 'none', color: '#a7f3d0', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Ministerial Directive Feedback Banner */}
      {directiveFeedback && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '10px',
          background: 'rgba(245, 158, 11, 0.15)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          color: '#fde68a',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} />
            <span>{directiveFeedback}</span>
          </div>
          <button onClick={() => setDirectiveFeedback(null)} style={{ background: 'none', border: 'none', color: '#fde68a', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Capital Allocated
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ghana-emerald)', marginTop: '4px' }}>
            GHS {(totalAllocated / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {formatNumberToWords(totalAllocated)} GHS
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Total Capital Disbursed
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
            GHS {(totalDisbursed / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Disbursement Rate: <strong>{disbursementRate.toFixed(1)}%</strong> of allocation
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Verified Utilization
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--ghana-gold)', marginTop: '4px' }}>
            GHS {(totalUtilized / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Absorption Rate: <strong>{utilizationRate.toFixed(1)}%</strong>
          </div>
        </div>

        <div style={{
          background: 'var(--bg-card)',
          borderRadius: '14px',
          border: '1px solid var(--border-color)',
          padding: '20px'
        }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
            Unutilized Balance
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#cbd5e1', marginTop: '4px' }}>
            GHS {(totalRemaining / 1000000).toFixed(1)}M
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Available for reallocation
          </div>
        </div>
      </div>

      {/* Funding Stream Breakdown */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        padding: '24px'
      }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '16px' }}>
          Capital Allocation by Primary Funding Stream
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {fundingBreakdown.map((item) => (
            <div
              key={item.source}
              style={{
                padding: '16px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.source}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
                GHS {(item.allocated / 1000000).toFixed(1)}M
              </div>
              <div style={{
                height: '4px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '2px',
                marginTop: '8px',
                overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.percent}%`,
                  background: 'var(--ghana-emerald)'
                }} />
              </div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item.percent.toFixed(1)}% of total</span>
                <span>{item.count} projects</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ministerial Fiscal Commentary & Policy Directives Section */}
      <div id="minister-comment-section" style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05) 0%, rgba(17, 24, 39, 0.95) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: '1px solid rgba(245, 158, 11, 0.15)',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--ghana-gold)'
            }}>
              <MessageSquare size={22} />
            </div>
            <div>
              <div style={{
                color: 'var(--ghana-gold)',
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                Ministerial Oversight • PFM Act 921
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                Minister of Finance — Official Commentary & Directives Space
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>
                Dedicated space for the Minister of Finance to enter binding fiscal directives, disbursement caveats, and budget remarks.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '9999px',
              background: 'rgba(245, 158, 11, 0.15)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              color: '#fde68a',
              fontSize: '0.72rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <ShieldCheck size={12} /> Ministerial Privilege
            </span>
          </div>
        </div>

        {/* Input Form for Finance Minister & Super Admin */}
        {canVerifyExpenditure ? (
          <form onSubmit={handleSaveMinisterComment} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '12px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}>
                  Direct Commentary Target
                </label>
                <select
                  value={selectedTargetProjectId}
                  onChange={(e) => {
                    const pid = e.target.value;
                    setSelectedTargetProjectId(pid);
                    if (pid !== 'ALL') {
                      const target = projects.find(p => p.id === pid);
                      if (target?.budget.financeMinisterComments) {
                        setCommentInput(target.budget.financeMinisterComments);
                      }
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#111b27',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="ALL">🌐 National AI Portfolio (General Fiscal Directive)</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.projectCode}] {p.name} ({p.mdaCode || p.mda})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  color: 'var(--text-muted)',
                  fontWeight: 700,
                  marginBottom: '6px',
                  textTransform: 'uppercase'
                }}>
                  Directive Classification
                </label>
                <select
                  value={directiveType}
                  onChange={(e) => setDirectiveType(e.target.value as any)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    background: '#111b27',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#fff',
                    fontSize: '0.8rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Budget Release Caveat">Budget Release Caveat</option>
                  <option value="Disbursement Approval">Disbursement Approval</option>
                  <option value="Audit Action">Audit Action</option>
                  <option value="General Policy">General Policy</option>
                </select>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.74rem',
                  color: 'var(--ghana-gold)',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  Finance Minister's Comment / Official Directive *
                </label>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {commentInput.length} characters
                </span>
              </div>
              <textarea
                rows={3}
                placeholder="Enter ministerial budgetary commentary, expenditure caveats, or disbursement directives (e.g., 'Tranche 2 disbursement approved subject to internal audit reconciliation by Q3 under Act 921; verify primary bank receipts before warrant release...')"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: '#0d1520',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fff',
                  fontSize: '0.84rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
                required
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Signing as: <strong style={{ color: '#fff' }}>{session.fullName}</strong> ({session.role})
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {editingDirectiveId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDirectiveId(null);
                      setCommentInput('');
                    }}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: 'var(--text-muted)',
                      fontSize: '0.78rem',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Edit
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: commentInput.trim() ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'rgba(255, 255, 255, 0.08)',
                    border: 'none',
                    color: commentInput.trim() ? '#111827' : 'rgba(255, 255, 255, 0.3)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: commentInput.trim() ? 'pointer' : 'not-allowed',
                    boxShadow: commentInput.trim() ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none'
                  }}
                >
                  <Send size={14} /> {editingDirectiveId ? 'Update Directive' : 'Save Ministerial Comment'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.2)',
            fontSize: '0.8rem',
            color: '#fde68a',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} />
            <span>Official fiscal commentary recorded by the Minister of Finance. Write access is restricted to the Ministry of Finance.</span>
          </div>
        )}

        {/* Saved Directives Feed */}
        {directives.length > 0 && (
          <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              fontSize: '0.74rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              Active Ministerial Directives & Direct Comments ({directives.length})
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '12px'
            }}>
              {directives.map((dir) => (
                <div
                  key={dir.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.07)',
                    borderLeft: '3px solid var(--ghana-gold)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      color: 'var(--ghana-gold)',
                      fontSize: '0.68rem',
                      fontWeight: 700
                    }}>
                      {dir.directiveType}
                    </span>

                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {dir.createdAt}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    color: '#fff',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {dir.targetTitle}
                  </div>

                  <div style={{
                    fontSize: '0.8rem',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                    fontStyle: 'italic',
                    background: 'rgba(0, 0, 0, 0.2)',
                    padding: '8px 10px',
                    borderRadius: '6px'
                  }}>
                    "{dir.comment}"
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '2px'
                  }}>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                      By: <strong>{dir.authorName}</strong>
                    </span>

                    {canVerifyExpenditure && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditDirective(dir)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--ghana-gold)',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Edit3 size={11} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteDirective(dir.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#f87171',
                            fontSize: '0.7rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '2px'
                          }}
                        >
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Projects Ledger */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              National AI Projects Financial Ledger
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px', margin: 0 }}>
              Audited project-level allocations and verified expenditures across government MDAs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Funding Stream:</span>
            <select
              value={selectedFundingSource}
              onChange={(e) => setSelectedFundingSource(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                background: '#111b27',
                border: '1px solid var(--border-color)',
                color: '#fff',
                fontSize: '0.78rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="All">All Sources</option>
              {fundingSources.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(255, 255, 255, 0.01)' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Project Code</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Project Name</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>MDA</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Funding Source</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Allocated (GHS)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Disbursed (GHS)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'right' }}>Utilized (GHS)</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>Absorption</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Zero-Assumption Status</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700 }}>Minister's Directive / Comment</th>
                {canVerifyExpenditure && (
                  <th style={{ padding: '12px 16px', color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center' }}>Audit Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((proj) => {
                const rate = proj.budget.totalAllocated > 0
                  ? (proj.budget.utilized / proj.budget.totalAllocated) * 100
                  : 0;
                return (
                  <tr
                    key={proj.id}
                    style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: 'var(--ghana-gold)' }}>
                      {proj.projectCode}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fff', fontWeight: 600 }}>
                      {proj.name}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {proj.mdaCode || proj.mda}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {proj.budget.primaryFundingSource}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#10b981', fontWeight: 700, textAlign: 'right' }}>
                      {proj.budget.totalAllocated.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#38bdf8', textAlign: 'right' }}>
                      {proj.budget.disbursed.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#fbbf24', textAlign: 'right' }}>
                      {proj.budget.utilized.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        background: rate >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                        color: rate >= 80 ? '#10b981' : '#fbbf24'
                      }}>
                        {rate.toFixed(0)}%
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {proj.budget.verificationStatus === 'MoF Audited & Verified' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.2)',
                            color: '#10b981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <ShieldCheck size={12} /> MoF Verified
                          </span>
                          {proj.budget.mofWarrantNumber && (
                            <span style={{ fontSize: '0.66rem', color: '#a7f3d0' }}>
                              Warrant: {proj.budget.mofWarrantNumber}
                            </span>
                          )}
                        </div>
                      ) : proj.budget.verificationStatus === 'Flagged Discrepancy' ? (
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          background: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldAlert size={12} /> Discrepancy Hold
                        </span>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            background: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            width: 'fit-content'
                          }}>
                            <ShieldAlert size={12} /> Unverified Claim
                          </span>
                          <span style={{ fontSize: '0.66rem', color: '#fde68a' }}>
                            No Warrant Attached
                          </span>
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', minWidth: '220px', maxWidth: '300px' }}>
                      {proj.budget.financeMinisterComments ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.25)',
                            fontSize: '0.74rem',
                            color: '#fde68a',
                            lineHeight: 1.35
                          }}>
                            "{proj.budget.financeMinisterComments.length > 55
                              ? proj.budget.financeMinisterComments.substring(0, 52) + '...'
                              : proj.budget.financeMinisterComments}"
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                            <span>{proj.budget.financeMinisterCommentDate || 'MoF Directive'}</span>
                            {canVerifyExpenditure && (
                              <button
                                onClick={() => handleSelectProjectForComment(proj)}
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: 'var(--ghana-gold)',
                                  fontSize: '0.68rem',
                                  cursor: 'pointer',
                                  textDecoration: 'underline',
                                  fontWeight: 600,
                                  padding: 0
                                }}
                              >
                                Edit Directive
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        canVerifyExpenditure ? (
                          <button
                            onClick={() => handleSelectProjectForComment(proj)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px dashed rgba(255, 255, 255, 0.2)',
                              color: 'var(--text-muted)',
                              fontSize: '0.72rem',
                              cursor: 'pointer'
                            }}
                          >
                            <MessageSquare size={12} /> + Add Directive
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>—</span>
                        )
                      )}
                    </td>
                    {canVerifyExpenditure && (
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {proj.budget.hasAssumptionsFlag ? (
                          <button
                            onClick={() => {
                              setVerifyingProject(proj);
                              setAuditWarrantInput('');
                              setAuditNotesInput('');
                              setAuditCommentInput(proj.budget.financeMinisterComments || '');
                            }}
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              background: 'rgba(16, 185, 129, 0.2)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              color: '#a7f3d0',
                              fontSize: '0.74rem',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            Verify Warrant
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            Certified ✓
                          </span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* VERIFICATION MODAL */}
      {verifyingProject && (
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
          zIndex: 10000,
          padding: '20px'
        }}>
          <div style={{
            background: '#0d1520',
            border: '1px solid var(--ghana-emerald)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '540px',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.85)'
          }}>
            <div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ghana-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
                Zero-Assumption Statutory Control
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#fff', margin: 0, marginTop: '2px' }}>
                Verify Expenditure & Attach Treasury Warrant
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0, marginTop: '4px' }}>
                Project: <strong>{verifyingProject.projectCode}</strong> — {verifyingProject.name} ({verifyingProject.mdaCode})
              </p>
            </div>

            <form onSubmit={handleConfirmVerification} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  OFFICIAL MOF TREASURY WARRANT NUMBER *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MOF/WARR/2026/049"
                  value={auditWarrantInput}
                  onChange={(e) => setAuditWarrantInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#162232',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none'
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                  STATUTORY RECONCILIATION NOTES
                </label>
                <textarea
                  rows={3}
                  placeholder="Confirming that all payment vouchers and bank transfers were reconciled under Act 921..."
                  value={auditNotesInput}
                  onChange={(e) => setAuditNotesInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#162232',
                    border: '1px solid var(--border-color)',
                    color: '#fff',
                    fontSize: '0.82rem',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', color: 'var(--ghana-gold)', fontWeight: 700, marginBottom: '6px' }}>
                  MINISTER'S FISCAL DIRECTIVE / COMMENT (OPTIONAL)
                </label>
                <textarea
                  rows={2}
                  placeholder="Official ministerial comment or budgetary caveats..."
                  value={auditCommentInput}
                  onChange={(e) => setAuditCommentInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: '#162232',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
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
                  onClick={() => setVerifyingProject(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    color: '#cbd5e1',
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    background: 'var(--ghana-emerald)',
                    border: 'none',
                    color: '#0f172a',
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    cursor: 'pointer'
                  }}
                >
                  <ShieldCheck size={16} /> Confirm Statutory Verification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
