import { useState } from 'react';
import { Layout } from './components/Layout';
import { MainLandingPage } from './components/MainLandingPage';
import { PageAuditLogModal } from './components/PageAuditLogModal';
import { Dashboard } from './components/Dashboard';
import { OrganizationClearance } from './components/OrganizationClearance';
import { ProjectRegistry } from './components/ProjectRegistry';
import { PublicVerification } from './components/PublicVerification';
import { GISGeospatial } from './components/GISGeospatial';
import { GovernanceCompliance } from './components/GovernanceCompliance';
import { AIReadiness } from './components/AIReadiness';
import { RiskManagement } from './components/RiskManagement';
import { DocumentManager } from './components/DocumentManager';
import { AIChatAssistant } from './components/AIChatAssistant';
import { 
  sampleProjects, 
  sampleOrganizations, 
  AIProject, 
  Organization, 
  OrganizationClearanceStatus, 
  ProjectClearanceStatus, 
  ComplianceScore, 
  DocumentAsset,
  ClearanceUploadedDocument 
} from './data/sampleProjects';
import { UserRole } from './components/RoleSwitcher';
import { PageLogEntry, initialPageLogs } from './types/pageLog';

const modulesInfo: Record<string, { name: string; path: string }> = {
  dashboard: { name: 'NAPTCS Analytics & M&E', path: '/dashboard' },
  organizations: { name: 'Organization Clearance Gate', path: '/organizations' },
  registry: { name: 'AI Projects National Registry', path: '/registry' },
  verification: { name: 'Public Verification Portal', path: '/verification' },
  gis: { name: 'Sovereign GIS Spatial Map', path: '/gis' },
  governance: { name: 'Governance & Ethics (Act 843)', path: '/governance' },
  readiness: { name: 'AI Readiness & Scoring', path: '/readiness' },
  risk: { name: 'Risk Matrix & Threat Tiers', path: '/risk' },
  documents: { name: 'Document Vault & OCR Verification', path: '/documents' },
  chat: { name: 'Regulator AI Policy Assistant', path: '/chat' },
};

function App() {
  // 1. Central React States
  const [projects, setProjects] = useState<AIProject[]>(sampleProjects);
  const [organizations, setOrganizations] = useState<Organization[]>(sampleOrganizations);
  const [currentRole, setCurrentRole] = useState<UserRole>('Regulator / Clearance Authority');
  
  // Navigation & Multi-page State
  const [activePage, setActivePage] = useState<string>('home');
  const [pageLogs, setPageLogs] = useState<PageLogEntry[]>(initialPageLogs);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState<boolean>(false);

  // Navigation Handler with Automated Page Audit Logging
  const handleNavigate = (pageId: string, pageTitle: string, routePath: string) => {
    setActivePage(pageId);

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const newLog: PageLogEntry = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: formattedDate,
      pageName: pageTitle,
      path: routePath,
      userRole: currentRole,
      action: pageId === 'home' ? 'Return to Home' : 'Module Access',
      status: '200 OK',
      sessionId: `SESS-GH-${Math.floor(1000 + Math.random() * 9000)}-${currentRole.slice(0, 3).toUpperCase()}`,
      node: 'Accra Core (NITA Tier III)'
    };

    setPageLogs(prev => [newLog, ...prev]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tabId: string) => {
    const mod = modulesInfo[tabId] || { name: tabId, path: `/${tabId}` };
    handleNavigate(tabId, mod.name, mod.path);
  };

  // 2. Global State Mutation Handlers (NAPTCS Gatekeeper & Tracking Engine)
  
  // Organization Clearance Mutation: Controls publication across the entire system
  const handleUpdateOrganizationClearance = (orgId: string, newStatus: OrganizationClearanceStatus, certId?: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Update the organization's accreditation status
    setOrganizations(prev => prev.map(org => {
      if (org.id === orgId) {
        return {
          ...org,
          clearanceStatus: newStatus,
          clearanceCertificateId: certId || (newStatus === 'Cleared' ? `GH-NAPTCS-ORG-2026-${org.acronym}` : undefined),
          clearedDate: newStatus === 'Cleared' ? today : org.clearedDate,
          expiryDate: newStatus === 'Cleared' ? '2027-12-31' : undefined
        };
      }
      return org;
    }));

    // Cascade Gatekeeper Effect:
    // If the organization is cleared, all its AI projects have isOrganizationCleared = true.
    // Projects that were cleared/conditional immediately become published to the public registry & GIS map!
    setProjects(prev => prev.map(p => {
      if (p.organizationId === orgId) {
        const isOrgCleared = newStatus === 'Cleared';
        const isPublishedNow = isOrgCleared && (p.clearanceStatus === 'Cleared' || p.clearanceStatus === 'Conditional');
        return {
          ...p,
          isOrganizationCleared: isOrgCleared,
          isPublished: isPublishedNow
        };
      }
      return p;
    }));
  };

  // Add new registered organization
  const handleAddOrganization = (newOrg: Organization) => {
    setOrganizations(prev => [newOrg, ...prev]);
  };

  // Update Organization Clearance Documents
  const handleUpdateOrganizationDocuments = (
    orgId: string, 
    documents: ClearanceUploadedDocument[], 
    newStatus?: OrganizationClearanceStatus
  ) => {
    setOrganizations(prev => prev.map(org => {
      if (org.id === orgId) {
        return {
          ...org,
          clearanceDocuments: documents,
          clearanceStatus: newStatus || org.clearanceStatus,
          reviewNotes: documents.length >= 3 
            ? `Clearance dossier submitted with ${documents.length} verified PDF documents. Queued for Technical Review Committee (TCC) audit.`
            : org.reviewNotes
        };
      }
      return org;
    }));
  };

  // Project Clearance Adjudication Mutation
  const handleUpdateProjectClearance = (projectId: string, newStatus: ProjectClearanceStatus, score: number, remarks: string) => {
    const today = new Date().toISOString().split('T')[0];

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const certNumber = (newStatus === 'Cleared' || newStatus === 'Conditional')
          ? (p.clearanceCertificateId || `NAPTCS-CLR-2026-${p.id.replace('proj-', '').padStart(3, '0')}`)
          : undefined;

        const isPublishedNow = p.isOrganizationCleared && (newStatus === 'Cleared' || newStatus === 'Conditional');

        return {
          ...p,
          clearanceStatus: newStatus,
          clearanceScore: score,
          clearanceCertificateId: certNumber,
          isPublished: isPublishedNow,
          clearanceDecision: {
            status: newStatus,
            overallScore: score,
            decisionDate: today,
            decidedBy: currentRole,
            clearanceCertificateId: certNumber,
            scopeLimits: remarks,
            validUntil: '2027-12-31'
          }
        };
      }
      return p;
    }));
  };

  // Appends new projects to state
  const handleAddProject = (newProject: AIProject) => {
    setProjects(prev => [newProject, ...prev]);
  };

  // Deletes projects from state
  const handleDeleteProject = (projectId: string) => {
    setProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Clears all projects from state
  const handleClearAllProjects = () => {
    setProjects([]);
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

  // Appends uploaded PDF metadata inside MinIO simulation
  const handleAddDocument = (projectId: string, newDoc: DocumentAsset) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          documents: [newDoc, ...p.documents]
        };
      }
      return p;
    }));
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

  // 3. Conditional Tab Routing Canvas
  const renderTabContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard projects={projects} currentRole={currentRole} />;

      case 'organizations':
        return (
          <OrganizationClearance 
            organizations={organizations} 
            projects={projects} 
            onUpdateOrganizationClearance={handleUpdateOrganizationClearance} 
            onAddOrganization={handleAddOrganization} 
            onUpdateOrganizationDocuments={handleUpdateOrganizationDocuments}
            currentRole={currentRole} 
          />
        );

      case 'registry':
        return (
          <ProjectRegistry 
            projects={projects} 
            organizations={organizations}
            onAddProject={handleAddProject} 
            onDeleteProject={handleDeleteProject}
            onClearAllProjects={handleClearAllProjects}
            onUpdateProjectClearance={handleUpdateProjectClearance}
            currentRole={currentRole} 
          />
        );

      case 'verification':
        return (
          <PublicVerification 
            projects={projects} 
            organizations={organizations} 
          />
        );

      case 'gis':
        return <GISGeospatial projects={projects} />;

      case 'governance':
        return (
          <GovernanceCompliance 
            projects={projects} 
            onUpdateCompliance={handleUpdateCompliance} 
            currentRole={currentRole} 
          />
        );

      case 'readiness':
        return <AIReadiness currentRole={currentRole} />;

      case 'risk':
        return (
          <RiskManagement 
            projects={projects} 
            onUpdateRiskStatus={handleUpdateRiskStatus} 
            currentRole={currentRole} 
          />
        );

      case 'documents':
        return (
          <DocumentManager 
            projects={projects} 
            organizations={organizations}
            onAddDocument={handleAddDocument} 
            onSignDocument={handleSignDocument} 
            onUpdateOrganizationDocuments={handleUpdateOrganizationDocuments}
            currentRole={currentRole} 
          />
        );

      case 'chat':
        return <AIChatAssistant projects={projects} />;

      default:
        return <Dashboard projects={projects} currentRole={currentRole} />;
    }
  };

  return (
    <>
      {activePage === 'home' ? (
        <MainLandingPage 
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          onNavigateToModule={(modId, modName, path) => handleNavigate(modId, modName, path)}
          pageLogs={pageLogs}
          onOpenAuditLog={() => setIsAuditLogOpen(true)}
          projects={projects}
          organizations={organizations}
        />
      ) : (
        <Layout 
          currentRole={currentRole} 
          onRoleChange={setCurrentRole} 
          activeTab={activePage} 
          setActiveTab={handleTabChange}
          onReturnToHome={() => handleNavigate('home', 'National Gateway (Main Landing)', '/')}
          onOpenAuditLog={() => setIsAuditLogOpen(true)}
          logCount={pageLogs.length}
        >
          {renderTabContent()}
        </Layout>
      )}

      {/* Global Page Audit Trail Console Modal */}
      <PageAuditLogModal
        logs={pageLogs}
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
        onClearLogs={() => setPageLogs([])}
        currentPage={activePage === 'home' ? 'National Gateway (Main Landing)' : (modulesInfo[activePage]?.name || activePage)}
      />
    </>
  );
}

export default App;
