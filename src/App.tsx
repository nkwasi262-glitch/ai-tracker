import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectRegistry } from './components/ProjectRegistry';
import { GISGeospatial } from './components/GISGeospatial';
import { GovernanceCompliance } from './components/GovernanceCompliance';
import { AIReadiness } from './components/AIReadiness';
import { RiskManagement } from './components/RiskManagement';
import { DocumentManager } from './components/DocumentManager';
import { AIChatAssistant } from './components/AIChatAssistant';
import { FinanceMinisterView } from './components/FinanceMinisterView';
import { InternalReportsHub } from './components/InternalReportsHub';
import { AuditLogViewer } from './components/AuditLogViewer';
import { TCSReferralConsole } from './components/TCSReferralConsole';
import { AIModelDatasetStudio } from './components/AIModelDatasetStudio';
import { AIAssessmentStudio } from './components/AIAssessmentStudio';
import { AIIncidentCenter } from './components/AIIncidentCenter';
import { AIAuditInspectionHub } from './components/AIAuditInspectionHub';
import { AIVendorOversight } from './components/AIVendorOversight';
import { PublicTransparencyPortal } from './components/PublicTransparencyPortal';
import { NationalAnalyticsHeatmapStudio } from './components/NationalAnalyticsHeatmapStudio';
import { OperationalWorkflowStudio } from './components/OperationalWorkflowStudio';
import { EntryGateModal } from './components/EntryGateModal';
import { AccessDenied } from './components/AccessDenied';
import { ActiveRoleSelectorModal } from './components/ActiveRoleSelectorModal';
import { PendingApprovalNotice } from './components/PendingApprovalNotice';
import { SignOutConfirmModal } from './components/SignOutConfirmModal';
import { AIProject, ComplianceScore, DocumentAsset, DocumentReviewComment, ReviewWorkflowStatus, AutoAssessmentDetails, ZeroAssumptionAudit } from './data/sampleProjects';
import { UserSession, ActiveRole } from './data/authTypes';
import { getStoredSession, clearSession, saveSession } from './services/authService';
import { AppModuleId, canAccessModule, MODULE_REGISTRY } from './services/rbacPolicy';
import { generateAssessmentFromDocuments } from './services/assessmentEngine';
import { loadStoredProjects, saveStoredProjects, resetProjectsStorage } from './services/projectStorage';
import { recordAuditEvent } from './services/auditService';
import { apiClient } from './services/apiClient';

function App() {
  // 1. Session State from Mandatory Entry Gate
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());

  // Keep session in sync with Neon PostgreSQL database
  useEffect(() => {
    async function syncSessionWithPostgres() {
      const stored = getStoredSession();
      if (stored?.email) {
        try {
          const remoteUser = await apiClient.fetchUserByEmail(stored.email);
          if (remoteUser && remoteUser.role) {
            if (remoteUser.role !== stored.role || remoteUser.fullName !== stored.fullName) {
              const updatedSession = { ...stored, ...remoteUser };
              saveSession(updatedSession);
              setSession(updatedSession);
            }
          }
        } catch {
          // Graceful fallback to offline cached session
        }
      }
    }
    syncSessionWithPostgres();
  }, []);

  // 2. Central Registry & Navigation States (Persistent across reloads)
  const [projects, setProjects] = useState<AIProject[]>(() => {
    return loadStoredProjects();
  });

  // Sync projects changes to persistent storage
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);

  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [targetReviewItem, setTargetReviewItem] = useState<{ projectId: string; docId?: string } | null>(null);

  const handleNavigateToReview = (projectId: string, docId?: string) => {
    setTargetReviewItem({ projectId, docId });
    setActiveTab('documents');
  };

  const [showRoleSelectorModal, setShowRoleSelectorModal] = useState<boolean>(false);
  const [showSignOutConfirmModal, setShowSignOutConfirmModal] = useState<boolean>(false);

  // Ensure active tab is reset if current role changes to one without permission (pending_approval users may browse all modules to see notices)
  useEffect(() => {
    if (session && session.onboardingStatus !== 'pending_approval' && !canAccessModule(session.role, activeTab as AppModuleId)) {
      setActiveTab('dashboard');
    }
  }, [session, activeTab]);

  // Ensure viewport immediately resets to top when navigating across pages/tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [activeTab]);

  // Open the prominent Sign Out confirmation pop-up modal
  const handleRequestSignOut = () => {
    setShowSignOutConfirmModal(true);
  };

  // Officially confirm sign out: clears session and immediately reveals Entry Gate
  const handleConfirmSignOut = () => {
    setShowSignOutConfirmModal(false);
    clearSession();
    setSession(null);
    setActiveTab('dashboard');
  };

  // Immediate sign out (fallback)
  const handleSwitchRole = () => {
    handleRequestSignOut();
  };

  // Handle active role profile switch
  const handleActivateRoleProfile = (selectedRole: ActiveRole) => {
    if (session) {
      const updated: UserSession = {
        ...session,
        role: selectedRole,
        lastActiveAt: new Date().toISOString()
      };
      saveSession(updated);
      setSession(updated);
      setActiveTab('dashboard');
    }
  };

  // 3. Global State Mutation Callback Handlers
  
  // Appends new projects to state and navigates straight to Dashboard
  const handleAddProject = (newProject: AIProject) => {
    setProjects(prev => {
      const updated = [newProject, ...prev];
      saveStoredProjects(updated);
      return updated;
    });
    setActiveTab('dashboard');
  };

  // Deletes projects from state
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Clears all projects from state or resets to defaults
  const handleClearAllProjects = () => {
    const defaultData = resetProjectsStorage();
    setProjects(defaultData);
  };

  // Re-evaluates ethical indices and grades instantly
  const handleUpdateCompliance = (projectId: string, newScore: ComplianceScore) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          compliance: newScore
        };
      }
      return p;
    }));
  };

  // Updates readiness score directly from wizard checklist
  const handleUpdateReadinessScore = (projectId: string, newScore: number) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          readinessScore: newScore
        };
      }
      return p;
    }));
  };

  // Crosses off or elevates threats inside 5x5 Matrix
  const handleUpdateRiskStatus = (projectId: string, riskId: string, status: 'Open' | 'Mitigated' | 'Escalated') => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          risks: p.risks.map(r => {
            if (r.id === riskId) {
              return { ...r, status };
            }
            return r;
          })
        };
      }
      return p;
    }));
  };

  // Appends uploaded PDF metadata and auto-generates Governance & Readiness
  const handleAddDocument = (projectId: string, newDoc: DocumentAsset) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          const existingWithoutDup = (p.documents || []).filter(d => d.id !== newDoc.id);
          const updatedDocs = [newDoc, ...existingWithoutDup];
          const tempProject: AIProject = {
            ...p,
            documents: updatedDocs
          };
          const auto = generateAssessmentFromDocuments(tempProject, session || undefined);
          const newReviewStatus: ReviewWorkflowStatus = p.reviewStatus === 'Approved'
            ? 'Approved'
            : 'Recommended';
          const updatedProj: AIProject = {
            ...tempProject,
            compliance: auto.compliance,
            readinessScore: auto.readinessScore,
            autoAssessment: auto.details,
            zeroAssumptionAudit: auto.zeroAssumptionAudit,
            reviewStatus: newReviewStatus,
            technicalClearanceReview: p.technicalClearanceReview || {
              reviewerName: 'National Technical Clearance Taskforce',
              reviewerRole: 'Technical Director',
              reviewedAt: new Date().toISOString(),
              recommendationNotes: 'Compliance documents sent to Technical Clearance System. Recommended for statutory review.'
            }
          };
          return updatedProj;
        }
        return p;
      });
      saveStoredProjects(updated);
      return updated;
    });
  };

  // Updates project budget and zero-assumption audit status (e.g. from Finance Minister verification)
  const handleUpdateProjectBudget = (
    projectId: string, 
    updatedBudget: AIProject['budget'], 
    zeroAssumption?: AIProject['zeroAssumptionAudit']
  ) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            budget: updatedBudget,
            zeroAssumptionAudit: zeroAssumption || p.zeroAssumptionAudit
          };
        }
        return p;
      });
      saveStoredProjects(updated);
      return updated;
    });
  };

  // Adds secure digital signatures
  const handleSignDocument = (projectId: string, docId: string, signerName: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          documents: p.documents.map(d => {
            if (d.id === docId) {
              return {
                ...d,
                signedBy: [...d.signedBy, signerName]
              };
            }
            return d;
          })
        };
      }
      return p;
    }));
  };

  // Updates automatically generated assessments (Governance & Ethics, AI Readiness, Zero-Assumption)
  const handleUpdateProjectAssessment = (
    projectId: string,
    newCompliance: ComplianceScore,
    newReadinessScore: number,
    details: AutoAssessmentDetails,
    zeroAssumptionAudit?: ZeroAssumptionAudit
  ) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          return {
            ...p,
            compliance: newCompliance,
            readinessScore: newReadinessScore,
            autoAssessment: details,
            zeroAssumptionAudit: zeroAssumptionAudit || p.zeroAssumptionAudit
          };
        }
        return p;
      });
      saveStoredProjects(updated);
      return updated;
    });
  };

  // Updates project registry and monitoring status for projects cleared by the Technical Clearance System
  const handleUpdateProjectReviewStatus = (
    projectId: string, 
    newReviewStatus: ReviewWorkflowStatus, 
    notes?: string,
    approvedBudgetAmount?: number
  ) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          const nextOperationalStatus: AIProject['status'] =
            newReviewStatus === 'Cleared & Registered' || newReviewStatus === 'Operational' || newReviewStatus === 'Approved'
              ? 'Active'
              : (newReviewStatus === 'Needs Attention' || newReviewStatus === 'Rejected' || newReviewStatus === 'Needs Correction')
              ? 'Delayed'
              : p.status;

          let nextBudget = { ...p.budget };
          if (newReviewStatus === 'Cleared & Registered' || newReviewStatus === 'Operational' || newReviewStatus === 'Approved') {
            const targetAllocated =
              approvedBudgetAmount && approvedBudgetAmount > 0
                ? approvedBudgetAmount
                : p.budget.totalAllocated > 0
                ? p.budget.totalAllocated
                : 12000000;
            const nextDisbursed =
              p.budget.disbursed > 0 ? p.budget.disbursed : Math.round(targetAllocated * 0.5);
            const nextUtilized =
              p.budget.utilized > 0 ? p.budget.utilized : Math.round(targetAllocated * 0.35);
            nextBudget = {
              ...p.budget,
              totalAllocated: targetAllocated,
              disbursed: nextDisbursed,
              utilized: nextUtilized,
              remaining: Math.max(0, targetAllocated - nextDisbursed)
            };
          }

          const nowIso = new Date().toISOString();
          const nextTechnicalReview = {
            reviewerName: session?.fullName || 'Technical Reviewer',
            reviewerRole: session?.role || 'Technical Director',
            reviewerEmail: session?.email || 'clearance@nita.gov.gh',
            reviewedAt: nowIso,
            recommendationNotes: notes || p.technicalReview?.recommendationNotes || 'Technical clearance and monitoring status updated.'
          };

          return {
            ...p,
            reviewStatus: newReviewStatus,
            status: nextOperationalStatus,
            budget: nextBudget,
            technicalReview: nextTechnicalReview
          };
        }
        return p;
      });
      saveStoredProjects(updated);
      return updated;
    });
  };

  // Reviews a specific document, updates its review comments and status, and applies updated Governance & Ethics / AI Readiness grades to the project
  const handleReviewDocument = (
    projectId: string,
    docId: string,
    reviewComment: DocumentReviewComment,
    newCompliance?: ComplianceScore,
    newReadinessScore?: number,
    newProjectStatus?: ReviewWorkflowStatus
  ) => {
    setProjects(prev => {
      const updated = prev.map(p => {
        if (p.id === projectId) {
          const updatedDocs = (p.documents || []).map(d => {
            if (d.id === docId) {
              const prevComments = d.reviewerComments || [];
              const updatedStatus: DocumentAsset['reviewStatus'] = 
                reviewComment.verdict === 'Approved' ? 'Reviewed & Verified' :
                reviewComment.verdict === 'Changes Requested' ? 'Requires Re-submission' :
                'Under Review';
              return {
                ...d,
                reviewStatus: updatedStatus,
                reviewerComments: [reviewComment, ...prevComments]
              };
            }
            return d;
          });

          const nowIso = new Date().toISOString();
          const effectiveReviewStatus: ReviewWorkflowStatus = newProjectStatus || (
            reviewComment.verdict === 'Approved' || reviewComment.verdict === 'Conditionally Cleared'
              ? 'Cleared & Registered'
              : reviewComment.verdict === 'Changes Requested'
              ? 'Needs Attention'
              : p.reviewStatus || 'Cleared & Registered'
          );

          const updatedOpStatus: AIProject['status'] =
            effectiveReviewStatus === 'Cleared & Registered' || effectiveReviewStatus === 'Operational' || effectiveReviewStatus === 'Approved'
              ? 'Active'
              : effectiveReviewStatus === 'Needs Attention'
              ? 'Delayed'
              : p.status;

          const updatedTechReview = {
            reviewerName: session?.fullName || 'Technical Reviewer',
            reviewerRole: session?.role || 'Technical Director',
            reviewerEmail: session?.email || 'clearance@nita.gov.gh',
            reviewedAt: nowIso,
            recommendationNotes: reviewComment.comment
          };

          return {
            ...p,
            documents: updatedDocs,
            compliance: newCompliance || p.compliance,
            readinessScore: newReadinessScore !== undefined ? newReadinessScore : p.readinessScore,
            reviewStatus: effectiveReviewStatus,
            status: updatedOpStatus,
            technicalReview: updatedTechReview
          };
        }
        return p;
      });
      saveStoredProjects(updated);
      return updated;
    });

    recordAuditEvent({
      eventType: 'DOCUMENT_REVIEW',
      actorName: session?.fullName || 'Reviewer',
      actorEmail: session?.email || '',
      actorRole: (session?.role || 'Super Admin') as ActiveRole,
      actorInstitution: session?.institution || '',
      targetModule: 'documents',
      targetEntityId: docId,
      actionDetails: `${session?.role} reviewed and passed comment on document "${docId}" for project ${projectId}. Verdict: [${reviewComment.verdict}]. Applied updated Governance & Ethics (${newCompliance?.overallGrade || 'maintained'}) and AI Readiness (${newReadinessScore ?? 'maintained'}%).`
    });
  };

  // 4. If No Verified Session Exists, Render Mandatory Entry Gate Modal (Non-Dismissible)
  if (!session) {
    return (
      <EntryGateModal 
        onSuccess={(newSession) => {
          setSession(newSession);
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  // 5. Central RBAC Policy Enforcement on Tab Routing
  const isTabPermitted = canAccessModule(session.role, activeTab as AppModuleId, session);

  // 6. Conditional Tab Routing Canvas
  const renderTabContent = () => {
    // If user is in pending_approval onboarding status, check if module is restricted
    if (session.onboardingStatus === 'pending_approval') {
      if (!['dashboard', 'gis', 'chat', 'public_portal'].includes(activeTab)) {
        return (
          <PendingApprovalNotice
            session={session}
            targetModuleLabel={MODULE_REGISTRY[activeTab as AppModuleId]?.label || activeTab}
            onNavigate={(tab) => setActiveTab(tab)}
            onSwitchRole={handleSwitchRole}
          />
        );
      }
    } else if (!isTabPermitted) {
      // Regular RBAC forbidden check
      return (
        <AccessDenied
          currentRole={session.role}
          attemptedModule={activeTab as AppModuleId}
          userName={session.fullName}
          userEmail={session.email}
          userInstitution={session.institution}
          onNavigateHome={() => setActiveTab('dashboard')}
          onRequestElevation={() => setShowRoleSelectorModal(true)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            projects={projects} 
            currentRole={session.role as any} 
            onNavigate={(tab) => setActiveTab(tab)} 
            onNavigateToReview={handleNavigateToReview}
          />
        );
      case 'tcs_referrals':
        return (
          <TCSReferralConsole
            projects={projects}
            session={session}
            onNavigateToProject={(projId) => handleNavigateToReview(projId)}
          />
        );
      case 'models_datasets':
        return (
          <AIModelDatasetStudio
            projects={projects}
            session={session}
          />
        );
      case 'assessments':
        return (
          <AIAssessmentStudio
            projects={projects}
            session={session}
          />
        );
      case 'incidents':
        return (
          <AIIncidentCenter
            projects={projects}
            session={session}
          />
        );
      case 'audits_hub':
        return (
          <AIAuditInspectionHub
            projects={projects}
            session={session}
          />
        );
      case 'vendors':
        return (
          <AIVendorOversight
            session={session}
          />
        );
      case 'analytics_hub':
        return (
          <NationalAnalyticsHeatmapStudio
            projects={projects}
            session={session}
          />
        );
      case 'public_portal':
        return (
          <PublicTransparencyPortal
            projects={projects}
            session={session}
          />
        );
      case 'workflow_lifecycle':
        return (
          <OperationalWorkflowStudio
            projects={projects}
            session={session}
            onUpdateProject={(updatedProject) => {
              setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
            }}
          />
        );
      case 'registry':
        return (
          <ProjectRegistry 
            projects={projects} 
            onAddProject={handleAddProject} 
            onDeleteProject={handleDeleteProject}
            onClearAllProjects={handleClearAllProjects}
            currentRole={session.role as any} 
            onNavigate={(tab) => setActiveTab(tab)}
          />
        );
      case 'gis':
        return <GISGeospatial projects={projects} currentRole={session.role as any} />;
      case 'governance':
        return (
          <GovernanceCompliance 
            projects={projects} 
            onUpdateCompliance={handleUpdateCompliance} 
            currentRole={session.role as any}
            session={session}
            onReviewDocument={handleReviewDocument} 
          />
        );
      case 'readiness':
        return (
          <AIReadiness 
            currentRole={session.role as any} 
            projects={projects}
            onUpdateReadinessScore={handleUpdateReadinessScore}
            session={session}
            onReviewDocument={handleReviewDocument}
          />
        );
      case 'risk':
        return (
          <RiskManagement 
            projects={projects} 
            onUpdateRiskStatus={handleUpdateRiskStatus} 
            currentRole={session.role as any} 
          />
        );
      case 'documents':
        return (
          <DocumentManager 
            projects={projects} 
            onAddDocument={handleAddDocument} 
            onSignDocument={handleSignDocument} 
            currentRole={session.role as any}
            session={session}
            onUpdateProjectStatus={handleUpdateProjectReviewStatus}
            onUpdateProjectAssessment={handleUpdateProjectAssessment}
            onReviewDocument={handleReviewDocument}
            initialProjectId={targetReviewItem?.projectId}
            initialDocId={targetReviewItem?.docId}
            onClearInitialTarget={() => setTargetReviewItem(null)}
          />
        );
      case 'finance':
        return (
          <FinanceMinisterView
            projects={projects}
            session={session}
            onUpdateProjectBudget={handleUpdateProjectBudget}
          />
        );
      case 'reports':
        return (
          <InternalReportsHub
            session={session}
            projects={projects}
          />
        );
      case 'audit':
        return (
          <AuditLogViewer
            session={session}
          />
        );
      case 'chat':
        return <AIChatAssistant projects={projects} currentRole={session.role as any} />;
      default:
        return <Dashboard projects={projects} currentRole={session.role as any} />;
    }
  };

  return (
    <>
      <Layout 
        session={session}
        onSwitchRole={handleSwitchRole}
        onSelectRole={handleActivateRoleProfile}
        onOpenRoleSelector={() => setShowRoleSelectorModal(true)}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      >
        {renderTabContent()}
      </Layout>

      <ActiveRoleSelectorModal
        session={session}
        isOpen={showRoleSelectorModal}
        onClose={() => setShowRoleSelectorModal(false)}
        onSelectRole={handleActivateRoleProfile}
      />

      <SignOutConfirmModal
        isOpen={showSignOutConfirmModal}
        onConfirm={handleConfirmSignOut}
        onCancel={() => setShowSignOutConfirmModal(false)}
        session={session}
      />
    </>
  );
}

export default App;
