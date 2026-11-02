import { AIProject, DocumentAsset } from '../data/sampleProjects';
import { DGVerdictRecord } from '../data/verdictTypes';
import { AuditLogEntry } from '../data/auditTypes';
import { InternalReport } from '../data/reportTypes';
import { UserSession } from '../data/authTypes';

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
}

export const apiClient = new ApiClient();

