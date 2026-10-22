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
import { DGDecisionQueue } from './components/DGDecisionQueue';
import { FinanceMinisterView } from './components/FinanceMinisterView';
import { InternalReportsHub } from './components/InternalReportsHub';
import { AuditLogViewer } from './components/AuditLogViewer';
import { EntryGateModal } from './components/EntryGateModal';
import { AccessDenied } from './components/AccessDenied';
import { ActiveRoleSelectorModal } from './components/ActiveRoleSelectorModal';
import { FirstTimerOnboardingHub } from './components/FirstTimerOnboardingHub';
import { PendingApprovalNotice } from './components/PendingApprovalNotice';
import { AIProject, ComplianceScore, DocumentAsset, ReviewWorkflowStatus, AutoAssessmentDetails, ZeroAssumptionAudit } from './data/sampleProjects';
import { UserSession, ActiveRole } from './data/authTypes';
import { getStoredSession, clearSession, elevateFromFirstTimer, submitOnboardingForApproval } from './services/authService';
import { AppModuleId, canAccessModule, MODULE_REGISTRY } from './services/rbacPolicy';
import { generateAssessmentFromDocuments } from './services/assessmentEngine';
import { loadStoredProjects, saveStoredProjects, resetProjectsStorage } from './services/projectStorage';

function App() {
  // 1. Session State from Mandatory Entry Gate
  const [session, setSession] = useState<UserSession | null>(() => getStoredSession());

  // 2. Central Registry & Navigation States (Persistent across reloads)
  const [projects, setProjects] = useState<AIProject[]>(() => loadStoredProjects());

  // Sync projects changes to persistent storage
  useEffect(() => {
    saveStoredProjects(projects);
  }, [projects]);
  const [activeTab, setActiveTab] = useState<string>(() => {
    const s = getStoredSession();
    if (s?.onboardingStatus === 'pending_approval') return 'dashboard';
    if (s?.role === 'First-Timer / New User') return 'documents';
    return 'dashboard';
  });
  const [showRoleSelectorModal, setShowRoleSelectorModal] = useState<boolean>(false);
  const [viewingOnboardingHub, setViewingOnboardingHub] = useState<boolean>(false);

  // Ensure active tab is reset if current role changes to one without permission (pending_approval users may browse all modules to see notices)
  useEffect(() => {
    if (session && session.onboardingStatus !== 'pending_approval' && !canAccessModule(session.role, activeTab as AppModuleId)) {
      const fallbackTab = session.role === 'First-Timer / New User' ? 'documents' : 'dashboard';
      setActiveTab(fallbackTab);
    }
  }, [session, activeTab]);

  // Ensure viewport immediately resets to top when navigating across pages/tabs
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as any });
  }, [activeTab]);

  // Handle Switch Role / Sign Out: clears session and immediately reveals Entry Gate
  const handleSwitchRole = () => {
    clearSession();
    setSession(null);
    setActiveTab('dashboard');
  };

  // Handle activation from First-Timer onboarding to an official active role profile
  const handleActivateRoleProfile = (selectedRole: ActiveRole) => {
    const updated = elevateFromFirstTimer(selectedRole);
    if (updated) {
      setSession(updated);
      const targetTab = selectedRole === 'Director General' ? 'dg_queue' :
                        selectedRole === 'Finance Minister' ? 'finance' :
                        'dashboard';
      setActiveTab(targetTab);
    }
  };

  // 3. Global State Mutation Callback Handlers
  
  // Appends new projects to state
  const handleAddProject = (newProject: AIProject) => {
    setProjects(prev => [newProject, ...prev]);
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

  // Appends uploaded PDF metadata inside MinIO simulation and auto-generates Governance & Readiness
  const handleAddDocument = (projectId: string, newDoc: DocumentAsset) => {
    setProjects(prev => {
      const isFromFirstTimer = session?.role === 'First-Timer / New User' || !!session?.isFirstTimer;
      const updated = prev.map(p => {
        if (p.id === projectId) {
          const updatedDocs = [newDoc, ...p.documents];
          const tempProject = { ...p, documents: updatedDocs };
          const auto = generateAssessmentFromDocuments(tempProject, session || undefined);
          const newReviewStatus: ReviewWorkflowStatus = p.reviewStatus === 'Approved' ? 'Approved' : 'Under Technical Review';
          const updatedProj: AIProject = {
            ...p,
            documents: updatedDocs,
            compliance: auto.compliance,
            readinessScore: auto.readinessScore,
            autoAssessment: auto.details,
            zeroAssumptionAudit: auto.zeroAssumptionAudit,
            hasFirstTimerUpload: isFromFirstTimer || p.hasFirstTimerUpload,
            reviewStatus: newReviewStatus
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

  // Updates project review lifecycle status (Technical review / Super Admin clearance / DG clearance)
  const handleUpdateProjectReviewStatus = (
    projectId: string, 
    newReviewStatus: ReviewWorkflowStatus, 
    notes?: string
  ) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          reviewStatus: newReviewStatus,
          status: newReviewStatus === 'Approved' ? 'Active' : p.status,
          technicalReview: notes ? {
            reviewerName: session?.fullName,
            reviewerRole: session?.role,
            reviewerEmail: session?.email,
            reviewedAt: new Date().toISOString(),
            recommendationNotes: notes
          } : p.technicalReview
        };
      }
      return p;
    }));
  };

  // 4. If No Verified Session Exists, Render Mandatory Entry Gate Modal (Non-Dismissible)
  if (!session) {
    return (
      <EntryGateModal 
        onSuccess={(newSession) => {
          setSession(newSession);
          const initialTab = newSession.role === 'First-Timer / New User' ? 'dashboard' :
                            newSession.role === 'Director General' ? 'dg_queue' :
                            newSession.role === 'Finance Minister' ? 'finance' :
                            newSession.role === 'Technical Clearance Team' ? 'documents' :
                            newSession.role === 'AI Manager' ? 'registry' :
                            'dashboard';
          setActiveTab(initialTab);
        }} 
      />
    );
  }

  // 4b. If New Member in Onboarding Track (or viewing Onboard Hub), render FirstTimerOnboardingHub
  if ((session.memberType === 'new_member' && session.onboardingStatus === 'onboarding') || viewingOnboardingHub) {
    return (
      <div className="layout-wrapper" style={{ minHeight: '100vh', background: 'var(--bg-dark)', padding: '24px 16px' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto' }}>
          <FirstTimerOnboardingHub
            session={session}
            projects={projects}
            onAddDocument={handleAddDocument}
            onUpdateProjectAssessment={handleUpdateProjectAssessment}
            onSubmitForApproval={() => {
              const updated = submitOnboardingForApproval();
              if (updated) {
                setSession(updated);
              }
            }}
            onProceedToMonitoring={() => {
              setViewingOnboardingHub(false);
              setActiveTab('dashboard');
            }}
            onSwitchRole={handleSwitchRole}
          />
        </div>
      </div>
    );
  }

  // 5. Central RBAC Policy Enforcement on Tab Routing
  const isTabPermitted = canAccessModule(session.role, activeTab as AppModuleId, session);

  // 6. Conditional Tab Routing Canvas
  const renderTabContent = () => {
    // If user is in pending_approval onboarding status, check if module is restricted
    if (session.onboardingStatus === 'pending_approval') {
      if (!['dashboard', 'gis', 'chat'].includes(activeTab)) {
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
          onNavigateHome={() => setActiveTab(session.role === 'First-Timer / New User' ? 'dashboard' : 'dashboard')}
          onRequestElevation={() => setShowRoleSelectorModal(true)}
        />
      );
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard projects={projects} currentRole={session.role as any} />;
      case 'registry':
        return (
          <ProjectRegistry 
            projects={projects} 
            onAddProject={handleAddProject} 
            onDeleteProject={handleDeleteProject}
            onClearAllProjects={handleClearAllProjects}
            currentRole={session.role as any} 
          />
        );
      case 'gis':
        return <GISGeospatial projects={projects} />;
      case 'governance':
        return (
          <GovernanceCompliance 
            projects={projects} 
            onUpdateCompliance={handleUpdateCompliance} 
            currentRole={session.role as any}
            session={session} 
          />
        );
      case 'readiness':
        return (
          <AIReadiness 
            currentRole={session.role as any} 
            projects={projects}
            onUpdateReadinessScore={handleUpdateReadinessScore}
            session={session}
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
          />
        );
      case 'dg_queue':
        return (
          <DGDecisionQueue
            projects={projects}
            session={session}
            onUpdateProjectStatus={handleUpdateProjectReviewStatus}
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
        return <AIChatAssistant projects={projects} />;
      default:
        return <Dashboard projects={projects} currentRole={session.role as any} />;
    }
  };

  return (
    <>
      <Layout 
        session={session}
        onSwitchRole={handleSwitchRole}
        onOpenRoleSelector={session.role === 'First-Timer / New User' ? undefined : () => setShowRoleSelectorModal(true)}
        onOpenOnboardingHub={session.memberType === 'new_member' ? () => setViewingOnboardingHub(true) : undefined}
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
    </>
  );
}

export default App;
