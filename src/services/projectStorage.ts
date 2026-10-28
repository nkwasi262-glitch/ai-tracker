import { AIProject, sampleProjects } from '../data/sampleProjects';

const PROJECTS_STORAGE_KEY = 'gnaprms_projects_v2';

/**
 * Loads registered projects from localStorage, falling back to sampleProjects if empty.
 */
export function loadStoredProjects(): AIProject[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return sampleProjects;
  }

  try {
    const raw = localStorage.getItem(PROJECTS_STORAGE_KEY);
    if (!raw) {
      // Seed initial storage
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sampleProjects));
      return sampleProjects;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Ensure pre-seeded onboarder documents from sampleProjects are merged if missing
      const merged = parsed.map((proj: AIProject) => {
        const sample = sampleProjects.find(s => s.id === proj.id);
        if (!sample) return proj;
        const existingIds = new Set((proj.documents || []).map(d => d.id));
        const missingDocs = (sample.documents || []).filter(d => !existingIds.has(d.id));
        return {
          ...proj,
          documents: missingDocs.length > 0 ? [...(proj.documents || []), ...missingDocs] : (proj.documents || []),
          hasFirstTimerUpload: proj.hasFirstTimerUpload || sample.hasFirstTimerUpload,
          reviewStatus: proj.reviewStatus || sample.reviewStatus,
          dgFinalVerdict: proj.dgFinalVerdict || sample.dgFinalVerdict
        };
      });
      return merged;
    }
  } catch (error) {
    console.error('Failed to load projects from localStorage:', error);
  }

  return sampleProjects;
}

/**
 * Persists the master projects array to localStorage.
 */
export function saveStoredProjects(projects: AIProject[]): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  } catch (error) {
    console.error('Failed to save projects to localStorage:', error);
  }
}

/**
 * Resets projects to the official sample catalog.
 */
export function resetProjectsStorage(): AIProject[] {
  if (typeof window !== 'undefined' && window.localStorage) {
    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(sampleProjects));
  }
  return sampleProjects;
}
