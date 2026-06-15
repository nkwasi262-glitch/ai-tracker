import React, { useState } from 'react';
import { Compass, Lightbulb, Users, GraduationCap } from 'lucide-react';
import { AIProject } from '../data/sampleProjects';

interface NationalObservatoryProps {
  projects: AIProject[];
}

export const NationalObservatory: React.FC<NationalObservatoryProps> = ({ projects }) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  // Dynamic recommendation calculation based on selected project
  const getRecommendations = (projectId: string) => {
    switch (projectId) {
      case 'proj-1': // Cocoa board
        return {
          partner: 'Environmental Protection Agency (EPA)',
          reason: 'Both projects (COCOBOD Crop Predictor & EPA Galamsey Watch) leverage satellite Computer Vision and CNN engines to analyze canopy cover. Collaboration on satellite licensing and dataset annotation will yield GHS 500,000 in cost savings.',
          grant: 'African Development Bank Agricultural Innovation Fund (Grant AF-2026)',
          synergyScore: 94
        };
      case 'proj-2': // Akosombo dam
        return {
          partner: 'Environmental Protection Agency (EPA)',
          reason: 'The VRA flood predictive modeling requires water contamination metrics and satellite watershed observations collected by EPA Galamsey Watch sensors. Linking telemetry databases speeds up flood alert times by 12%.',
          grant: 'UN Sustainable Energy & Disaster Resilience Grant (UN-D26)',
          synergyScore: 88
        };
      case 'proj-3': // Twi clinical
        return {
          partner: 'University of Ghana Linguistics Lab & Ministry of Justice',
          reason: 'Speech corpus translation methods co-developed at the Ministry of Health are highly transferable to court transcript translations planned for the E-Justice judicial system. Sharing voice translation corpora reduces speech collection budgets by 30%.',
          grant: 'Ghana Digitalization and Inclusivity Research Grant (GDIR-2026)',
          synergyScore: 91
        };
      case 'proj-4': // E-justice
        return {
          partner: 'Ministry of Health NLP Translators & GRA Fraud Engine',
          reason: 'Model cards and privacy audit standards formulated for corporate legal text matching can be shared with GRA fraud auditing. Natural Language Processing techniques on high court rulings can also help MoH parse clinical ethics guidelines.',
          grant: 'West African Governance and Justice Digitalization Fund',
          synergyScore: 78
        };
      case 'proj-5': // GRA tax fraud
        return {
          partner: 'Ministry of Justice (MoJ)',
          reason: 'The shell-company matching patterns identified by the GRA tax engine can be fed directly to the Judicial research archives to speed up corporate fraud prosecution pipelines and track legal loopholes.',
          grant: 'Sovereign Revenue Protection Fund',
          synergyScore: 82
        };
      default:
        return {
          partner: 'Ghana Cocoa Board (COCOBOD)',
          reason: 'EPA canopy mapping models can share high-resolution satellite arrays directly with COCOBOD to predict forest encroachment of cocoa farms and coordinate reforestation metrics.',
          grant: 'Global Environmental Monitoring Facility (GEMF-26)',
          synergyScore: 89
        };
    }
  };

  const recommendation = activeProject ? getRecommendations(activeProject.id) : null;

  // Mock research publications list
  const mockPublications = [
    { title: 'Optimizing MobileNet CNNs for Cocoa Leaf Disease Detection in Sefwi Districts', authors: 'K. Owusu, A. Mensah (KNUST) & COCOBOD IT Dept', journal: 'African Journal of Agronomy & AI', year: '2025' },
    { title: 'Retrieval-Augmented Generation for Judicial Gazette Text Mining in Ghana', authors: 'Dr. E. Addo (Ashesi University) & Ministry of Justice', journal: 'West African Journal of Legal Tech', year: '2026' },
    { title: 'Acoustic Corpus Development for Twi-English Voice Diagnostics in Rural Ashanti Clinics', authors: 'J. Appiah, L. Boateng (UG Linguistics Dept)', journal: 'NLP and Speech in Healthcare Systems', year: '2025' }
  ];

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        background: 'rgba(255,255,255,0.02)',
        padding: '16px 24px',
        borderRadius: '12px',
        border: '1px solid var(--border-color)'
      }}>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>National AI Observatory & Research trends</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Examine academic co-publications, emerging technologies, and automated cross-agency collaboration recommendation grids
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Collaborative Publications & Observatory trends */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Research Publications card */}
          <div className="glass-card">
            <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap className="w-5 h-5 text-emerald-400" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>Co-published Academic Papers</h3>
            </div>
            
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.4 }}>
              Registered AI projects co-authored with local Ghanaian universities (University of Ghana, KNUST, Ashesi) mapping sovereign code ownership.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mockPublications.map((pub, idx) => (
                <div 
                  key={idx}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.8rem'
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.35 }}>{pub.title}</div>
                  <div style={{ color: 'var(--ghana-gold)', fontSize: '0.72rem', marginTop: '4px' }}>{pub.authors}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                    <span>{pub.journal}</span>
                    <strong>{pub.year}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emerging technology index */}
          <div className="glass-card">
            <h3 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '12px' }}>Emerging Technology Trends</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '0.8rem', textAlign: 'center' }}>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--ghana-emerald)', fontFamily: 'var(--font-heading)' }}>92%</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Relational Data Labeled</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--ghana-emerald)', fontFamily: 'var(--font-heading)' }}>5</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Sovereign CNN Models</span>
              </div>
              <div style={{ padding: '12px', background: 'rgba(0,0,0,0.18)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                <strong style={{ display: 'block', fontSize: '1.25rem', color: 'var(--ghana-emerald)', fontFamily: 'var(--font-heading)' }}>3</strong>
                <span style={{ color: 'var(--text-secondary)' }}>Rural Speech Corpora</span>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI Project Recommendation Engine */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass className="w-5 h-5 text-emerald-400" />
              <span>Synergy Recommendation Engine</span>
            </h3>
          </div>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">Evaluate Registry Project</label>
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="form-select"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {activeProject && recommendation && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, animation: 'fadeIn 0.3s ease' }}>
              
              {/* Synergy Score */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', background: 'rgba(16,185,129,0.03)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div style={{ position: 'relative', width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', border: '2px solid var(--ghana-emerald)', color: 'var(--ghana-emerald)', fontWeight: 800, fontSize: '1.05rem' }}>
                  {recommendation.synergyScore}%
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>Co-development Synergy Score</h4>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Computed matching algorithms & tech sectors</span>
                </div>
              </div>

              {/* Partner Recommendation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  Advised Collaboration Agency
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{recommendation.partner}</span>
                </div>
              </div>

              {/* Rationale details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  Co-development Rationale
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.45, background: 'rgba(0,0,0,0.18)', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                  {recommendation.reason}
                </p>
              </div>

              {/* Recommended Grants */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: 'auto' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
                  Target Funding Opportunities
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--ghana-gold)', fontWeight: 600 }}>
                  <Lightbulb className="w-4 h-4" />
                  <span>{recommendation.grant}</span>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
