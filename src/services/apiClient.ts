import { AIProject, DocumentAsset } from '../data/sampleProjects';
import { DGVerdictRecord } from '../data/verdictTypes';
import { AuditLogEntry } from '../data/auditTypes';
import { InternalReport } from '../data/reportTypes';
import { UserSession } from '../data/authTypes';

export interface InstitutionRecord {
  id: string;
  code: string;
  name: string;
  category: 'MDA' | 'MMDA' | 'SOE' | 'Regulatory' | string;
  region: string;
  status: 'Active' | 'Pending' | 'Suspended' | string;
  contactEmail?: string;
  contactPhone?: string;
  headOfInstitution?: string;
  totalProjects: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AppVersionRecord {
  id: string;
  versionNumber: string;
  releaseNumber: string;
  releaseDate: string;
  deploymentStatus: string;
  developerResponsible: string;
  featuresAdded: string[];
  bugFixes: string[];
  securityImprovements: string[];
  releaseNotes: string;
  createdAt?: string;
}

export interface BackupRecord {
  filename: string;
  filePath: string;
  sizeKb: string;
  createdAt: string;
  modifiedAt: string;
  metadata?: any;
}

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

/**
 * Robust Central API Client connecting GNAPRMS to the Neon PostgreSQL Backend.
 * Automatically handles offline/cached fallback.
 */
class ApiClient {
  private base: string;

  constructor(base: string = API_BASE) {
    this.base = base.endsWith('/') ? base.slice(0, -1) : base;
  }

  /**
   * Checks Neon PostgreSQL connectivity and health status.
   */
  async checkHealth(): Promise<{ connected: boolean; configured: boolean; [key: string]: any }> {
    try {
      const res = await fetch(`${this.base}/health`, { signal: AbortSignal.timeout(3000) });
      if (!res.ok) return { connected: false, configured: false };
      const data = await res.json();
      return data?.database || { connected: false, configured: false };
    } catch {
      return { connected: false, configured: false };
    }
  }

  // ==========================================================================
  // PROJECTS
  // ==========================================================================

  async fetchProjects(): Promise<AIProject[] | null> {
    try {
      const res = await fetch(`${this.base}/projects`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const json = await res.json();
      if (Array.isArray(json.projects) && json.projects.length > 0) {
        return json.projects;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async saveProject(project: AIProject): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async updateProject(id: string, updates: Partial<AIProject>): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async addDocument(projectId: string, doc: DocumentAsset): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // DG VERDICTS
  // ==========================================================================

  async fetchVerdicts(): Promise<DGVerdictRecord[] | null> {
    try {
      const res = await fetch(`${this.base}/verdicts`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      const json = await res.json();
      if (Array.isArray(json.verdicts)) {
        return json.verdicts;
      }
      return null;
    } catch {
      return null;
    }
  }

  async saveVerdict(verdict: DGVerdictRecord): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/verdicts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(verdict)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // AUDIT LOGS (ACT 843)
  // ==========================================================================

  async fetchAuditLogs(): Promise<AuditLogEntry[] | null> {
    try {
      const res = await fetch(`${this.base}/audit-logs`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      const json = await res.json();
      if (Array.isArray(json.auditLogs)) {
        return json.auditLogs;
      }
      return null;
    } catch {
      return null;
    }
  }

  async appendAuditLog(entry: AuditLogEntry): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/audit-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // INTERNAL REPORTS
  // ==========================================================================

  async fetchReports(): Promise<InternalReport[] | null> {
    try {
      const res = await fetch(`${this.base}/reports`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      const json = await res.json();
      if (Array.isArray(json.reports)) {
        return json.reports;
      }
      return null;
    } catch {
      return null;
    }
  }

  async saveReport(report: InternalReport): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // SESSIONS & USER TYPE PERSISTENCE (POSTGRESQL)
  // ==========================================================================

  /**
   * Looks up an existing user by institutional email directly from Neon PostgreSQL.
   */
  async fetchUserByEmail(email: string): Promise<UserSession | null> {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const res = await fetch(`${this.base}/auth/user/${encodeURIComponent(cleanEmail)}`, {
        signal: AbortSignal.timeout(4000)
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.exists && data.user) {
        return data.user as UserSession;
      }
      return null;
    } catch {
      return null;
    }
  }

  async syncSession(session: UserSession): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/auth/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // INSTITUTIONS DIRECTORY (MDAs / MMDAs / SOEs)
  // ==========================================================================

  async fetchInstitutions(params?: { category?: string; region?: string; status?: string; search?: string }): Promise<InstitutionRecord[] | null> {
    try {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.region) query.append('region', params.region);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${this.base}/institutions${qs}`, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data.institutions) ? data.institutions : null;
    } catch {
      return null;
    }
  }

  async saveInstitution(inst: Partial<InstitutionRecord>): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/institutions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inst)
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // SYSTEM VERSIONING & AUDIT RELEASE TRACKING
  // ==========================================================================

  async fetchAppVersions(): Promise<{ versions: AppVersionRecord[]; currentVersion: AppVersionRecord | null } | null> {
    try {
      const res = await fetch(`${this.base}/system/versions`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        versions: data.versions || [],
        currentVersion: data.currentVersion || null
      };
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // BACKUPS & DISASTER RECOVERY DRILLS
  // ==========================================================================

  async fetchBackups(): Promise<BackupRecord[]> {
    try {
      const res = await fetch(`${this.base}/system/backups`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return [];
      const data = await res.json();
      return data.backups || [];
    } catch {
      return [];
    }
  }

  async triggerBackup(triggeredBy?: string): Promise<{ success: boolean; backup?: any; error?: string }> {
    try {
      const res = await fetch(`${this.base}/system/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ triggeredBy: triggeredBy || 'Super Admin Dashboard' })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async triggerDrDrill(backupFilename?: string): Promise<{ success: boolean; report?: any; error?: string }> {
    try {
      const res = await fetch(`${this.base}/system/dr-drill`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupFilename })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // ==========================================================================
  // 8-STEP OPERATIONAL WORKFLOW LIFECYCLE (ACT 771 / ACT 843)
  // ==========================================================================

  async validateProjectRegistry(data: { name: string; mda: string; category?: string; sector?: string; budget?: any; description?: string }): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/validate-registry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateWorkflowStep(projectId: string, stepNumber: number, stepData: any, meta?: { actorName?: string; actorEmail?: string; actorRole?: string; notes?: string }): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/operational-workflow/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stepNumber, stepData, ...(meta || {}) })
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async logWorkflowIncident(projectId: string, incident: { title: string; severity?: string; description?: string; status?: string }): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/operational-workflow/incident`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async logWorkflowInspection(projectId: string, inspection: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/operational-workflow/inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async executeWorkflowLifecycleDecision(projectId: string, decisionData: { decision: string; justification?: string; signedByName?: string; retentionUntil?: string }): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/operational-workflow/lifecycle-decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisionData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async fetchWorkflowOverview(): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/operational-workflow/overview`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // ==========================================================================
  // GN-AIRGMS PHASE 4 SPECIALIZED ENTERPRISE APIS
  // ==========================================================================

  // 1. TCS Inbound & Outbound Integration
  async fetchTcsReferrals(): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/tcs/referrals`, { signal: AbortSignal.timeout(4000) });
      if (!res.ok) return [];
      const data = await res.json();
      return data.referrals || [];
    } catch {
      return [];
    }
  }

  async submitTcsInboundReferral(payload: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/tcs/referrals/inbound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async simulateInboundReferral(payload: any): Promise<any> {
    return this.submitTcsInboundReferral(payload);
  }

  async transmitTcsReportReturn(reportData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/tcs/reports/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async returnReportToTcs(reportData: any): Promise<any> {
    return this.transmitTcsReportReturn(reportData);
  }

  async fetchTcsStatus(): Promise<any> {
    try {
      const res = await fetch(`${this.base}/tcs/status`, { signal: AbortSignal.timeout(3000) });
      return await res.json();
    } catch {
      return { status: 'OFFLINE' };
    }
  }

  // 2. AI Models & Datasets
  async fetchProjectModels(projectId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/models`);
      const data = await res.json();
      return data.models || [];
    } catch {
      return [];
    }
  }

  async registerProjectModel(projectId: string, modelData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/models`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modelData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async addProjectModel(projectId: string, modelData: any): Promise<any> {
    return this.registerProjectModel(projectId, modelData);
  }

  async fetchProjectDatasets(projectId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/datasets`);
      const data = await res.json();
      return data.datasets || [];
    } catch {
      return [];
    }
  }

  async registerProjectDataset(projectId: string, datasetData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/datasets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datasetData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async addProjectDataset(projectId: string, datasetData: any): Promise<any> {
    return this.registerProjectDataset(projectId, datasetData);
  }

  // 3. 12-Domain AI Assessment
  async fetchProjectAssessments(projectId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/assessments`);
      const data = await res.json();
      return data.assessments || [];
    } catch {
      return [];
    }
  }

  async recordDomainAssessment(projectId: string, assessmentData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/assessments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assessmentData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async saveProjectAssessment(projectId: string, assessmentData: any): Promise<any> {
    return this.recordDomainAssessment(projectId, assessmentData);
  }

  // 4. Regulatory Decisions
  async fetchProjectDecisions(projectId: string): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/decisions`);
      const data = await res.json();
      return data.decisions || [];
    } catch {
      return [];
    }
  }

  async saveProjectDecision(projectId: string, decisionData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/projects/${encodeURIComponent(projectId)}/decisions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decisionData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 5. Incidents
  async fetchIncidents(): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/incidents`);
      const data = await res.json();
      return data.incidents || [];
    } catch {
      return [];
    }
  }

  async reportIncident(incidentData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  async updateIncident(incidentId: string, updateData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/incidents/${encodeURIComponent(incidentId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 6. Audits & Inspections
  async fetchAudits(): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/audits`);
      const data = await res.json();
      return data.audits || [];
    } catch {
      return [];
    }
  }

  async scheduleAudit(auditData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 7. Vendors
  async fetchVendors(): Promise<any[]> {
    try {
      const res = await fetch(`${this.base}/vendors`);
      const data = await res.json();
      return data.vendors || [];
    } catch {
      return [];
    }
  }

  async registerVendor(vendorData: any): Promise<any> {
    try {
      const res = await fetch(`${this.base}/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vendorData)
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 8. Notifications
  async fetchNotifications(email?: string): Promise<any[]> {
    try {
      const url = email ? `${this.base}/notifications?email=${encodeURIComponent(email)}` : `${this.base}/notifications`;
      const res = await fetch(url);
      const data = await res.json();
      return data.notifications || [];
    } catch {
      return [];
    }
  }

  async markNotificationRead(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${this.base}/notifications/${encodeURIComponent(id)}/read`, { method: 'POST' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const apiClient = new ApiClient();

