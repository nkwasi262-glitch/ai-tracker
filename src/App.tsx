import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ProjectRegistry } from './components/ProjectRegistry';
import { GISGeospatial } from './components/GISGeospatial';
import { GovernanceCompliance } from './components/GovernanceCompliance';
import { AIReadiness } from './components/AIReadiness';
import { RiskManagement } from './components/RiskManagement';
import { DocumentManager } from './components/DocumentManager';
import { AIChatAssistant } from './components/AIChatAssistant';
import { NationalObservatory } from './components/NationalObservatory';
import { sampleProjects, AIProject, ComplianceScore, DocumentAsset } from './data/sampleProjects';
import { UserRole } from './components/RoleSwitcher';

function App() {
  // 1. Central React States
  const [projects, setProjects] = useState<AIProject[]>(sampleProjects);
  const [currentRole, setCurrentRole] = useState<UserRole>('Super Administrator');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // 2. Global State Mutation Callback Handlers
  
  // Appends new projects to state (updates dashboard, GIS map, and recommendations instantly)
  const handleAddProject = (newProject: AIProject) => {
    setProjects(prev => [newProject, ...prev]);
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
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard projects={projects} currentRole={currentRole} />;
      case 'registry':
        return <ProjectRegistry projects={projects} onAddProject={handleAddProject} currentRole={currentRole} />;
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
            onAddDocument={handleAddDocument} 
            onSignDocument={handleSignDocument} 
            currentRole={currentRole} 
          />
        );
      case 'chat':
        return <AIChatAssistant projects={projects} />;
      case 'observatory':
        return <NationalObservatory projects={projects} />;
      default:
        return <Dashboard projects={projects} currentRole={currentRole} />;
    }
  };

  return (
    <Layout 
      currentRole={currentRole} 
      onRoleChange={setCurrentRole} 
      activeTab={activeTab} 
      setActiveTab={setActiveTab}
    >
      {renderTabContent()}
    </Layout>
  );
}

export default App;
