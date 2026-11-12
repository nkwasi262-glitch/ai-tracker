import React, { useState } from 'react';
import { 
  GitBranch, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  Database, 
  Activity, 
  Server, 
  Award, 
  Layers, 
  Eye, 
  RefreshCw,
  Clock,
  Archive,
  Info
} from 'lucide-react';
import { 
  AIProject, 
  ProjectOperationalWorkflow, 
  generateDefaultOperationalWorkflow 
} from '../data/sampleProjects';
import { apiClient } from '../services/apiClient';
import { UserSession } from '../data/authTypes';

interface OperationalWorkflowStudioProps {
  projects: AIProject[];
  session: UserSession | null;
  initialProjectId?: string;
  onUpdateProject?: (updatedProject: AIProject) => void;
  onClose?: () => void;
}

export const OperationalWorkflowStudio: React.FC<OperationalWorkflowStudioProps> = ({
  projects,
  session,
  initialProjectId,
  onUpdateProject,
  onClose
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || projects[0]?.id || '');
  const [activeStepTab, setActiveStepTab] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Form states for interactive actions
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentSeverity, setIncidentSeverity] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Medium');
  const [incidentDesc, setIncidentDesc] = useState('');

  const [inspectionFindings, setInspectionFindings] = useState('');
  const [inspectionVerdict, setInspectionVerdict] = useState<'Satisfactory' | 'Conditional Pass' | 'Action Plan Required'>('Satisfactory');
  const [citizenReach, setCitizenReach] = useState('150000');

  const [lifecycleDecision, setLifecycleDecision] = useState<'Continued Active Oversight' | 'Completed' | 'Renewed' | 'Suspended' | 'Retired'>('Continued Active Oversight');
  const [lifecycleJustification, setLifecycleJustification] = useState('');

  const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];
  const workflow: ProjectOperationalWorkflow = currentProject?.operationalWorkflow || generateDefaultOperationalWorkflow(currentProject || {});

  const canEdit = session?.role === 'Super Admin' || session?.role === 'Technical Director';

  const stepsList = [
    { step: 1, name: 'Secure API / Data Exchange', tag: 'Data Exchange', icon: <Server size={14} /> },
    { step: 2, name: 'National Registry Validation', tag: 'Registry Validation', icon: <Database size={14} /> },
    { step: 3, name: 'Risk Classification', tag: 'Risk Screening', icon: <ShieldCheck size={14} /> },
    { step: 4, name: 'Regulatory Assessment', tag: 'Statutory Rubrics', icon: <Award size={14} /> },
    { step: 5, name: 'Project Implementation', tag: 'Milestones Tracking', icon: <Layers size={14} /> },
    { step: 6, name: 'Continuous Monitoring', tag: 'Live Monitoring', icon: <Activity size={14} /> },
    { step: 7, name: 'Audit & Impact Evaluation', tag: 'Inspection & Reach', icon: <Eye size={14} /> },
    { step: 8, name: 'Closure or Continued Oversight', tag: 'Lifecycle Decision', icon: <Archive size={14} /> },
  ];

  // Advance / update workflow step
  const handleAdvanceStep = async (targetStep: number) => {
    if (!currentProject) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const updatedWorkflow: ProjectOperationalWorkflow = {
        ...workflow,
        currentStep: targetStep,
        overallProgressPercent: Math.round((targetStep / 8) * 100)
      };

      const updatedProj: AIProject = {
        ...currentProject,
        operationalWorkflow: updatedWorkflow
      };

      await apiClient.updateWorkflowStep(currentProject.id, targetStep, {}, {
        actorName: session?.fullName || 'Super Admin',
        actorEmail: session?.email || 'admin@nita.gov.gh',
        actorRole: session?.role || 'Super Admin',
        notes: `Advanced project to Step ${targetStep} (${stepsList[targetStep - 1]?.name}).`
      });

      if (onUpdateProject) {
        onUpdateProject(updatedProj);
      }
      setActionFeedback(`✓ Project successfully transitioned to Step ${targetStep}: ${stepsList[targetStep - 1]?.name}`);
      setActiveStepTab(targetStep);
    } catch (err: any) {
      setActionFeedback(`❌ Error updating step: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Run duplicate check on Step 2
  const handleRunDuplicateCheck = async () => {
    if (!currentProject) return;
    setIsProcessing(true);
    setActionFeedback(null);
    try {
      const res = await apiClient.validateProjectRegistry({
        name: currentProject.name,
        mda: currentProject.mda,
        category: currentProject.category,
        sector: currentProject.sector,
        budget: currentProject.budget?.totalAllocated,
        description: currentProject.description
      });

      if (res?.success) {
        const updatedWorkflow: ProjectOperationalWorkflow = {
          ...workflow,
          step2_RegistryValidation: {
            ...workflow.step2_RegistryValidation,
            validatedAt: res.validatedAt,
            completenessScore: res.completenessScore,
            isComplete: res.isComplete,
            duplicateScan: {
              scannedAt: res.validatedAt,
              isDuplicate: res.isDuplicate,
              confidenceScore: res.isDuplicate ? 95 : 0,
              matchedProjectCodes: res.duplicateMatches?.map((m: any) => m.projectCode) || [],
              scanSummary: res.scanSummary
            },
            validationStatus: res.validationStatus
          }
        };

        const updatedProj: AIProject = {
          ...currentProject,
          operationalWorkflow: updatedWorkflow
        };

        if (onUpdateProject) onUpdateProject(updatedProj);
        setActionFeedback(`✓ Registry Validation complete: ${res.scanSummary}`);
      }
    } catch (err: any) {
      setActionFeedback(`❌ Validation failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Log Step 6 Monitoring Incident
  const handleLogIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !incidentTitle.trim()) return;
    setIsProcessing(true);
    try {
      const res = await apiClient.logWorkflowIncident(currentProject.id, {
        title: incidentTitle.trim(),
        severity: incidentSeverity,
        description: incidentDesc.trim(),
        status: 'Reported'
      });

      if (res?.success && res.incident) {
        const updatedWorkflow: ProjectOperationalWorkflow = {
          ...workflow,
          step6_ContinuousMonitoring: {
            ...workflow.step6_ContinuousMonitoring,
            incidents: [res.incident, ...(workflow.step6_ContinuousMonitoring.incidents || [])],
            reportedIncidentsCount: (workflow.step6_ContinuousMonitoring.incidents || []).length + 1,
            monitoringStatus: incidentSeverity === 'Critical' || incidentSeverity === 'High' ? 'Needs Attention' : 'Active Monitoring'
          }
        };

        const updatedProj: AIProject = {
          ...currentProject,
          operationalWorkflow: updatedWorkflow
        };

        if (onUpdateProject) onUpdateProject(updatedProj);
        setIncidentTitle('');
        setIncidentDesc('');
        setActionFeedback(`✓ Incident "${incidentTitle}" logged to Act 843 monitoring ledger.`);
      }
    } catch (err: any) {
      setActionFeedback(`❌ Error logging incident: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Log Step 7 Inspection
  const handleLogInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject || !inspectionFindings.trim()) return;
    setIsProcessing(true);
    try {
      const res = await apiClient.logWorkflowInspection(currentProject.id, {
        inspectorName: session?.fullName || 'Regulatory Lead Inspector',
        inspectorRole: session?.role || 'Super Admin',
        findings: inspectionFindings.trim(),
        verdict: inspectionVerdict,
        citizenReach: Number(citizenReach) || 150000,
        economicImpact: '35% turnaround efficiency in public service delivery.',
        nextInspectionDate: '2027-04-30'
      });

      if (res?.success && res.inspection) {
        const updatedWorkflow: ProjectOperationalWorkflow = {
          ...workflow,
          step7_AuditImpactEvaluation: res.inspection
        };

        const updatedProj: AIProject = {
          ...currentProject,
          operationalWorkflow: updatedWorkflow
        };

        if (onUpdateProject) onUpdateProject(updatedProj);
        setInspectionFindings('');
        setActionFeedback(`✓ Regulatory on-site inspection and impact evaluation registered.`);
      }
    } catch (err: any) {
      setActionFeedback(`❌ Error logging inspection: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Step 8 Lifecycle Transition
  const handleExecuteLifecycleDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProject) return;
    setIsProcessing(true);
    try {
      const res = await apiClient.executeWorkflowLifecycleDecision(currentProject.id, {
        decision: lifecycleDecision,
        justification: lifecycleJustification.trim() || `Lifecycle decision confirmed under NITA statutory oversight guidelines.`,
        signedByName: session?.fullName || 'Super Admin',
        retentionUntil: '2036-12-31T23:59:59Z'
      });

      if (res?.success && res.step8) {
        const updatedWorkflow: ProjectOperationalWorkflow = {
          ...workflow,
          currentStep: 8,
          step8_ClosureOrOversight: res.step8
        };

        const newStatus = lifecycleDecision === 'Completed' ? 'Completed' : (lifecycleDecision === 'Suspended' ? 'Suspended' : 'Active');
        const updatedProj: AIProject = {
          ...currentProject,
          status: newStatus,
          operationalWorkflow: updatedWorkflow
        };

        if (onUpdateProject) onUpdateProject(updatedProj);
        setLifecycleJustification('');
        setActionFeedback(`✓ Project transitioned to: ${lifecycleDecision}. Cryptographic archive hash generated.`);
      }
    } catch (err: any) {
      setActionFeedback(`❌ Error executing lifecycle transition: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Master Operational Workflow Specification Dossier
  const handleDownloadWorkflowDossier = () => {
    if (!currentProject) return;
    const dossierMarkdown = `# Republic of Ghana — National AI Projects Registry & Monitoring System (GNAPRMS)
## Official Operational Workflow & Statutory AI Lifecycle Dossier

* **Project Identifier:** ${currentProject.projectCode}
* **Project Name:** ${currentProject.name}
* **Managing Institution:** ${currentProject.mda} (${currentProject.mdaCode})
* **Active Operational Step:** Step ${workflow.currentStep} of 8 (${stepsList[workflow.currentStep - 1]?.name})
* **Overall Lifecycle Completion:** ${workflow.overallProgressPercent}%
* **Workflow Health:** ${workflow.workflowHealth}
* **Dossier Generated At:** ${new Date().toISOString()}
* **Governing Statutory Frameworks:** NITA Act 2008 (Act 771) • Data Protection Act 2012 (Act 843) • Cybersecurity Act (Act 1038)

---

### Step 1 – Secure API / Data Exchange
* **Clearance Reference:** ${workflow.step1_DataExchange.clearanceReference}
* **Source Authority:** ${workflow.step1_DataExchange.sourceAuthority}
* **Transferred At:** ${workflow.step1_DataExchange.transferredAt}
* **Transfer Status:** ${workflow.step1_DataExchange.transferStatus}
* **Supporting Documents Transferred:** ${workflow.step1_DataExchange.supportingDocumentsTransferred} files
* **Payload Cryptographic Hash:** \`${workflow.step1_DataExchange.apiExchangePayloadHash || 'sha256-verified'}\`
* **Official Notes:** ${workflow.step1_DataExchange.notes || 'None'}

### Step 2 – National Registry Validation
* **Unique Registry Code:** ${workflow.step2_RegistryValidation.uniqueRegistryId}
* **Completeness Score:** ${workflow.step2_RegistryValidation.completenessScore}% (Parameters Complete: ${workflow.step2_RegistryValidation.isComplete ? 'Yes' : 'No'})
* **Duplicate Detection Scan:** ${workflow.step2_RegistryValidation.duplicateScan.scanSummary}
* **Collision Status:** ${workflow.step2_RegistryValidation.duplicateScan.isDuplicate ? 'COLLISION DETECTED' : 'Zero Collisions (Verified Unique)'}

### Step 3 – Risk Classification
* **Statutory Risk Category:** ${workflow.step3_RiskClassification.riskCategory}
* **Screened By:** ${workflow.step3_RiskClassification.classifiedBy}
* **Preliminary Screening Signals:**
  - Affects Fundamental Rights: ${workflow.step3_RiskClassification.preliminaryScreening.affectsFundamentalRights ? 'YES' : 'NO'}
  - Autonomous Decision Making: ${workflow.step3_RiskClassification.preliminaryScreening.autonomousDecisionMaking ? 'YES' : 'NO'}
  - Critical Infrastructure Integration: ${workflow.step3_RiskClassification.preliminaryScreening.criticalInfrastructureInvolved ? 'YES' : 'NO'}
  - Biometric / Identity Data: ${workflow.step3_RiskClassification.preliminaryScreening.biometricOrIdentityProcessing ? 'YES' : 'NO'}
* **Rationale:** ${workflow.step3_RiskClassification.classificationRationale}

### Step 4 – Regulatory Assessment
* **Technical Compliance:** ${workflow.step4_RegulatoryAssessment.technicalCompliance}
* **Legal Adherence (Act 771 & Act 1038):** ${workflow.step4_RegulatoryAssessment.legalStatutoryCompliance}
* **Privacy Compliance (Act 843):** ${workflow.step4_RegulatoryAssessment.privacyAct843Compliance}
* **Ethical Governance (Ghana AI Ethics):** ${workflow.step4_RegulatoryAssessment.ethicalGovernanceCompliance}
* **NITA Sovereign Clearance:** ${workflow.step4_RegulatoryAssessment.nitaVerificationStatus}
* **Overall Assessment Status:** ${workflow.step4_RegulatoryAssessment.overallAssessmentStatus}

### Step 5 – Project Implementation
* **Current Phase:** ${workflow.step5_Implementation.currentPhase}
* **Implementation Progress:** ${workflow.step5_Implementation.overallImplementationProgress}%
* **Milestones Completed:** ${workflow.step5_Implementation.completedMilestonesCount} of ${workflow.step5_Implementation.totalMilestonesCount}
* **Institutional Contact:** ${workflow.step5_Implementation.institutionalReportingContact}

### Step 6 – Continuous Regulatory Monitoring
* **Monitoring Status:** ${workflow.step6_ContinuousMonitoring.monitoringStatus}
* **System Uptime:** ${workflow.step6_ContinuousMonitoring.systemUptimePercentage}%
* **Reported Incidents:** ${workflow.step6_ContinuousMonitoring.reportedIncidentsCount}
* **MoF Warrant Reconciliation:** ${workflow.step6_ContinuousMonitoring.mofWarrantReconciliationStatus}
* **Logged Incidents:**
${(workflow.step6_ContinuousMonitoring.incidents || []).map(inc => `  - [${inc.date}] [${inc.severity}] ${inc.title}: ${inc.description} (${inc.status})`).join('\n') || '  - None'}

### Step 7 – Audit & Impact Evaluation
* **Last Inspection Date:** ${workflow.step7_AuditImpactEvaluation.lastInspectionDate}
* **Lead Inspector:** ${workflow.step7_AuditImpactEvaluation.leadRegulatoryInspector} (${workflow.step7_AuditImpactEvaluation.inspectorRole})
* **Inspection Verdict:** ${workflow.step7_AuditImpactEvaluation.inspectionVerdict}
* **Inspection Findings:** ${workflow.step7_AuditImpactEvaluation.inspectionFindings}
* **Estimated Citizen Reach:** ${workflow.step7_AuditImpactEvaluation.impactEvaluation.citizenReachEstimate.toLocaleString()} citizens
* **Economic Productivity Impact:** ${workflow.step7_AuditImpactEvaluation.impactEvaluation.economicProductivityImpact}

### Step 8 – Project Closure or Continued Oversight
* **Current Oversight Status:** ${workflow.step8_ClosureOrOversight.currentOversightStatus}
* **Decision Signed By:** ${workflow.step8_ClosureOrOversight.decisionSignedBy}
* **Decision Justification:** ${workflow.step8_ClosureOrOversight.decisionJustification}
* **Statutory Retention Until:** ${workflow.step8_ClosureOrOversight.statutoryRetentionUntil}
* **Archival Seal Hash:** \`${workflow.step8_ClosureOrOversight.archiveStorageHash}\`

---
*Certified by Republic of Ghana National Information Technology Agency (NITA)*
`;

    const blob = new Blob([dossierMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GNAPRMS-${currentProject.projectCode}-Operational-Workflow-Dossier.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header Banner */}
      <div className="glass-card" style={{
        padding: '24px 28px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(13, 18, 31, 0.95) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--ghana-emerald)',
              fontSize: '0.74rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '6px'
            }}>
              <GitBranch size={15} />
              <span>Republic of Ghana • Statutory AI Project Lifecycle</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>
              Operational Workflow: 8-Step Regulatory Path
            </h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px', margin: 0, maxWidth: '720px' }}>
              The statutory operational sequence governing how an AI project moves through the system after deployment—from initial Secure API Data Exchange through National Registry Validation, Risk Screening, Regulatory Assessment, Implementation, Continuous Monitoring, Impact Evaluation, and Project Closure / Continued Oversight.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={handleDownloadWorkflowDossier}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid var(--ghana-emerald)',
                color: 'var(--ghana-emerald)',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Download size={14} />
              <span>Download Workflow Dossier</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close Studio
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {actionFeedback && (
          <div style={{
            marginTop: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: actionFeedback.startsWith('✓') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: actionFeedback.startsWith('✓') ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
            color: actionFeedback.startsWith('✓') ? '#a7f3d0' : '#fca5a5',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Info size={14} style={{ flexShrink: 0 }} />
            <span>{actionFeedback}</span>
          </div>
        )}
      </div>

      {/* Project Selector Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Target AI Project:
            </span>
            <select
              value={selectedProjectId}
              onChange={(e) => {
                setSelectedProjectId(e.target.value);
                const proj = projects.find(p => p.id === e.target.value);
                const wf = proj?.operationalWorkflow || generateDefaultOperationalWorkflow(proj || {});
                setActiveStepTab(wf.currentStep || 1);
              }}
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                fontWeight: 600,
                outline: 'none',
                maxWidth: '380px'
              }}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id} style={{ background: '#0f172a' }}>
                  {p.projectCode} • {p.name} ({p.mdaCode})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Current Milestone: <strong style={{ color: 'var(--ghana-emerald)' }}>Step {workflow.currentStep} of 8</strong> ({workflow.overallProgressPercent}%)
            </div>
            <span style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '9999px',
              background: workflow.workflowHealth === 'Healthy' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              color: workflow.workflowHealth === 'Healthy' ? '#10b981' : '#f87171',
              border: `1px solid ${workflow.workflowHealth === 'Healthy' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {workflow.workflowHealth}
            </span>
          </div>
        </div>
      </div>

      {/* 8-Step Interactive Progress Stepper */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px'
      }}>
        {stepsList.map((st) => {
          const isCompleted = st.step < workflow.currentStep;
          const isCurrent = st.step === workflow.currentStep;
          const isTabActive = activeStepTab === st.step;

          return (
            <div
              key={st.step}
              onClick={() => setActiveStepTab(st.step)}
              style={{
                padding: '12px 14px',
                borderRadius: '10px',
                background: isTabActive 
                  ? 'rgba(16, 185, 129, 0.15)' 
                  : 'rgba(17, 24, 39, 0.65)',
                border: isTabActive 
                  ? '1px solid var(--ghana-emerald)' 
                  : (isCurrent ? '1px solid rgba(251, 191, 36, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)'),
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  color: isCurrent ? '#fbbf24' : (isCompleted ? '#10b981' : 'var(--text-muted)'),
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}>
                  Step {st.step}
                </span>

                {isCompleted ? (
                  <CheckCircle2 size={14} className="text-emerald-400" />
                ) : isCurrent ? (
                  <span style={{ fontSize: '0.64rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', fontWeight: 700 }}>
                    ACTIVE
                  </span>
                ) : (
                  <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                )}
              </div>

              <div style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                color: isTabActive ? '#fff' : '#cbd5e1',
                lineHeight: 1.25,
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {st.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Step Content Studio */}
      <div className="glass-card" style={{ padding: '24px 28px', borderRadius: '16px' }}>
        
        {/* Step Navigation Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingBottom: '16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--ghana-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}>
              {activeStepTab}
            </div>
            <div>
              <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Operational Step {activeStepTab}
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {stepsList[activeStepTab - 1]?.name}
              </h3>
            </div>
          </div>

          {canEdit && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeStepTab < 8 && (
                <button
                  disabled={isProcessing}
                  onClick={() => handleAdvanceStep(activeStepTab + 1)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: 'var(--ghana-emerald)',
                    color: '#0b0f19',
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    border: 'none',
                    cursor: isProcessing ? 'not-allowed' : 'pointer'
                  }}
                >
                  <span>Advance to Step {activeStepTab + 1}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* STEP 1: Secure API / Data Exchange */}
        {activeStepTab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Transfers the approved project record, clearance reference, decision, and supporting documents from the National Technical Clearance System into GNAPRMS.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Clearance Reference</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                  {workflow.step1_DataExchange.clearanceReference}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Source Authority</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {workflow.step1_DataExchange.sourceAuthority}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Transfer Status</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#10b981', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} /> {workflow.step1_DataExchange.transferStatus}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#a7f3d0', marginBottom: '6px' }}>
                Transferred Clearance Documents & API Payload Hash
              </div>
              <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                {workflow.step1_DataExchange.supportingDocumentsTransferred} official clearance documents verified in repository. Cryptographic exchange signature: <code style={{ color: '#38bdf8' }}>{workflow.step1_DataExchange.apiExchangePayloadHash || 'sha256-payload-verified'}</code>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: National Registry Validation */}
        {activeStepTab === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              The system generates a unique statutory project ID, verifies data completeness across all required parameters, and scans for possible duplicate initiatives across all MDAs.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Generated Statutory ID</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ghana-emerald)', marginTop: '4px' }}>
                  {workflow.step2_RegistryValidation.uniqueRegistryId}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Completeness Score</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {workflow.step2_RegistryValidation.completenessScore}% Complete
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Validation Verdict</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                  {workflow.step2_RegistryValidation.validationStatus}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.82rem', color: '#fff' }}>Duplicate Collision Scanner Output</strong>
                {canEdit && (
                  <button
                    disabled={isProcessing}
                    onClick={handleRunDuplicateCheck}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.2)',
                      border: '1px solid var(--ghana-emerald)',
                      color: 'var(--ghana-emerald)',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <RefreshCw size={12} />
                    <span>Run Live Scanner</span>
                  </button>
                )}
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                {workflow.step2_RegistryValidation.duplicateScan.scanSummary}
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Risk Classification */}
        {activeStepTab === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Project undergoes statutory preliminary risk screening and is assigned a risk category under national AI governance classification.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Assigned Risk Category</div>
                <div style={{
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: workflow.step3_RiskClassification.riskCategory === 'High Risk' ? '#f87171' : '#10b981',
                  marginTop: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <ShieldCheck size={20} />
                  <span>{workflow.step3_RiskClassification.riskCategory}</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px', lineHeight: 1.45 }}>
                  {workflow.step3_RiskClassification.classificationRationale}
                </p>
              </div>

              <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, marginBottom: '8px' }}>
                  Preliminary Screening Matrix
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.76rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span>Fundamental Rights Impact:</span>
                    <strong>{workflow.step3_RiskClassification.preliminaryScreening.affectsFundamentalRights ? 'Flagged' : 'Minimal'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span>Autonomous Decision Making:</span>
                    <strong>{workflow.step3_RiskClassification.preliminaryScreening.autonomousDecisionMaking ? 'Active' : 'No'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span>Critical Infrastructure:</span>
                    <strong>{workflow.step3_RiskClassification.preliminaryScreening.criticalInfrastructureInvolved ? 'Yes' : 'No'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                    <span>Biometric / Identity Reach:</span>
                    <strong>{workflow.step3_RiskClassification.preliminaryScreening.biometricOrIdentityProcessing ? 'Active' : 'None'}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Regulatory Assessment */}
        {activeStepTab === 4 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Relevant officers examine technical, legal, privacy, ethical, and governance requirements of the AI project.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Technical Compliance</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#10b981', marginTop: '3px' }}>
                  {workflow.step4_RegulatoryAssessment.technicalCompliance}
                </div>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Act 843 Privacy Compliance</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#38bdf8', marginTop: '3px' }}>
                  {workflow.step4_RegulatoryAssessment.privacyAct843Compliance}
                </div>
              </div>
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>NITA Sovereign Oversight</div>
                <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--ghana-emerald)', marginTop: '3px' }}>
                  {workflow.step4_RegulatoryAssessment.nitaVerificationStatus}
                </div>
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#a7f3d0', textTransform: 'uppercase' }}>
                Clearance Officer Ratification
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                {workflow.step4_RegulatoryAssessment.clearanceOfficerNotes}
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Project Implementation */}
        {activeStepTab === 5 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              The managing institution updates development, pilot, deployment, and project milestones.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Implementation Phase</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {workflow.step5_Implementation.currentPhase}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Overall Progress</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--ghana-emerald)', marginTop: '2px' }}>
                  {workflow.step5_Implementation.overallImplementationProgress}%
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Milestones</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  {workflow.step5_Implementation.completedMilestonesCount} / {workflow.step5_Implementation.totalMilestonesCount}
                </div>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Active Milestone Registry
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(currentProject.milestones || []).map((m) => (
                  <div key={m.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: 'rgba(0,0,0,0.25)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    fontSize: '0.76rem'
                  }}>
                    <span>{m.title}</span>
                    <span style={{ color: m.status === 'Completed' ? '#10b981' : '#fbbf24', fontWeight: 700 }}>
                      {m.progressPercent}% • {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: Continuous Regulatory Monitoring */}
        {activeStepTab === 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Regulators monitor algorithmic risks, statutory compliance, operational incidents, system performance, and verified project expenditures.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Uptime Reliability</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '2px' }}>
                  {workflow.step6_ContinuousMonitoring.systemUptimePercentage}%
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reported Incidents</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: workflow.step6_ContinuousMonitoring.reportedIncidentsCount > 0 ? '#fbbf24' : '#10b981', marginTop: '2px' }}>
                  {workflow.step6_ContinuousMonitoring.reportedIncidentsCount}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>MoF Reconciliation</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                  {workflow.step6_ContinuousMonitoring.mofWarrantReconciliationStatus}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Compliance Drift</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                  Zero Drift
                </div>
              </div>
            </div>

            {/* Incidents table */}
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                Continuous Monitoring Incidents Ledger
              </div>
              {(workflow.step6_ContinuousMonitoring.incidents || []).length === 0 ? (
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                  No active incidents recorded. System functioning within regular monitoring tolerances.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {workflow.step6_ContinuousMonitoring.incidents.map((inc) => (
                    <div key={inc.id} style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.3)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.76rem'
                    }}>
                      <div>
                        <strong>{inc.title}</strong>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>{inc.description}</div>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 700 }}>
                        {inc.severity} • {inc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Incident Report Form */}
            {canEdit && (
              <form onSubmit={handleLogIncident} style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>Report Continuous Monitoring Incident</div>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Incident title (e.g. Model drift or connectivity outage)..."
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  />
                  <select
                    value={incidentSeverity}
                    onChange={(e) => setIncidentSeverity(e.target.value as any)}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <option value="Low">Low Severity</option>
                    <option value="Medium">Medium Severity</option>
                    <option value="High">High Severity</option>
                    <option value="Critical">Critical Severity</option>
                  </select>
                </div>
                <textarea
                  placeholder="Incident details, observed impact, and initial mitigation steps..."
                  value={incidentDesc}
                  onChange={(e) => setIncidentDesc(e.target.value)}
                  rows={2}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !incidentTitle.trim()}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: 'var(--ghana-emerald)',
                    color: '#0b0f19',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Log Incident to Ledger
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 7: Audit & Impact Evaluation */}
        {activeStepTab === 7 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              Regulatory officers conduct statutory inspections and evaluate actual project outcomes and public impact.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Inspection Verdict</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981', marginTop: '4px' }}>
                  {workflow.step7_AuditImpactEvaluation.inspectionVerdict}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Citizen Reach</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', marginTop: '4px' }}>
                  {workflow.step7_AuditImpactEvaluation.impactEvaluation.citizenReachEstimate.toLocaleString()} citizens
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Next Inspection Scheduled</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {workflow.step7_AuditImpactEvaluation.scheduledNextInspectionDate}
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#a7f3d0' }}>Lead Regulatory Inspector Findings</div>
              <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '4px', lineHeight: 1.45, margin: 0 }}>
                {workflow.step7_AuditImpactEvaluation.inspectionFindings}
              </p>
            </div>

            {/* Inspection Logging Form */}
            {canEdit && (
              <form onSubmit={handleLogInspection} style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>Record Regulatory On-Site Inspection</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <select
                    value={inspectionVerdict}
                    onChange={(e) => setInspectionVerdict(e.target.value as any)}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <option value="Satisfactory">Satisfactory (Passed)</option>
                    <option value="Conditional Pass">Conditional Pass</option>
                    <option value="Action Plan Required">Action Plan Required</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Citizen reach estimate..."
                    value={citizenReach}
                    onChange={(e) => setCitizenReach(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <textarea
                  placeholder="Inspection observations, verification of model logs, and societal impact assessment notes..."
                  value={inspectionFindings}
                  onChange={(e) => setInspectionFindings(e.target.value)}
                  rows={2}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isProcessing || !inspectionFindings.trim()}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: 'var(--ghana-emerald)',
                    color: '#0b0f19',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Log Statutory Inspection
                </button>
              </form>
            )}
          </div>
        )}

        {/* STEP 8: Project Closure or Continued Oversight */}
        {activeStepTab === 8 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', margin: 0 }}>
              The project is either completed, renewed, suspended, or retired, with all historical audit records and clearance dossiers retained in the national archives under statutory retention periods.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Oversight Status</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--ghana-emerald)', marginTop: '4px' }}>
                  {workflow.step8_ClosureOrOversight.currentOversightStatus}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Decision Signed By</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                  {workflow.step8_ClosureOrOversight.decisionSignedBy}
                </div>
              </div>
              <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Act 843 Mandatory Retention</div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                  Through 2036 (10 Years)
                </div>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#a7f3d0' }}>Permanent Archive Cryptographic Hash</div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '4px' }}>
                Historical records sealed in append-only storage: <code style={{ color: '#38bdf8' }}>{workflow.step8_ClosureOrOversight.archiveStorageHash}</code>
              </div>
            </div>

            {/* Lifecycle Decision Form */}
            {canEdit && (
              <form onSubmit={handleExecuteLifecycleDecision} style={{
                padding: '14px',
                borderRadius: '10px',
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#fff' }}>Execute Lifecycle Transition Decision</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
                  <select
                    value={lifecycleDecision}
                    onChange={(e) => setLifecycleDecision(e.target.value as any)}
                    style={{
                      background: '#0f172a',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '6px',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.78rem'
                    }}
                  >
                    <option value="Continued Active Oversight">Continued Active Oversight (Operational)</option>
                    <option value="Completed">Completed (Targets Met, Transitioned to Maintenance)</option>
                    <option value="Renewed">Renewed (Extended Lifecycle Authorization)</option>
                    <option value="Suspended">Suspended (Temporary Administrative Hold)</option>
                    <option value="Retired">Retired (Decommissioned & Retained in Archives)</option>
                  </select>
                </div>
                <textarea
                  placeholder="Official justification for renewal, completion, suspension, or retirement..."
                  value={lifecycleJustification}
                  onChange={(e) => setLifecycleJustification(e.target.value)}
                  rows={2}
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '6px',
                    color: '#fff',
                    padding: '8px 12px',
                    fontSize: '0.78rem',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
                <button
                  type="submit"
                  disabled={isProcessing}
                  style={{
                    alignSelf: 'flex-start',
                    padding: '7px 14px',
                    borderRadius: '6px',
                    background: 'var(--ghana-emerald)',
                    color: '#0b0f19',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  Record Statutory Lifecycle Verdict
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
