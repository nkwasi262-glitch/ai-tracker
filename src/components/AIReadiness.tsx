import React, { useState } from 'react';
import { Award, Compass, Cpu, GraduationCap, Coins, ShieldAlert } from 'lucide-react';
import { UserRole } from './RoleSwitcher';

interface AIReadinessProps {
  currentRole: UserRole;
}

export const AIReadiness: React.FC<AIReadinessProps> = () => {
  // Maturity wizard sliders states
  const [infra, setInfra] = useState<number>(60);
  const [skills, setSkills] = useState<number>(45);
  const [data, setData] = useState<number>(70);
  const [funding, setFunding] = useState<number>(40);
  const [governance, setGovernance] = useState<number>(55);

  const calculateReadiness = () => {
    return Math.round((infra + skills + data + funding + governance) / 5);
  };

  const getMaturityLevel = (score: number) => {
    if (score >= 76) return { level: 'Level 4: Optimized', class: 'badge-success', desc: 'Sovereign automated code pipelines, active ethical monitoring, and ISO 42001 standardization.' };
    if (score >= 51) return { level: 'Level 3: Managed', class: 'badge-info', desc: 'Appointed data science departments, standard high-performance infrastructure, and active ethics audits.' };
    if (score >= 26) return { level: 'Level 2: Defined', class: 'badge-warning', desc: 'Basic digital records, IT staff are aware of model metrics, and initial pilots are under conceptualization.' };
    return { level: 'Level 1: Initial', class: 'badge-danger', desc: 'Minimal data infrastructure, lack of internal machine learning skills, and ad-hoc project procurements.' };
  };

  // Generate real-time custom recommendations based on slider thresholds
  const generateRecommendations = () => {
    const list = [];
    if (infra < 55) {
      list.push({
        icon: <Cpu className="w-5 h-5 text-red-400" />,
        title: 'Upgrade GPU Compute Nodes',
        text: 'Deploy deep learning models inside the sovereign National Data Center cloud rather than relying on standard CPU web servers.'
      });
    }
    if (skills < 55) {
      list.push({
        icon: <GraduationCap className="w-5 h-5 text-amber-400" />,
        title: 'Establish Academic Talent Hubs',
        text: 'Partner with local universities (e.g. KNUST, Ashesi, University of Ghana) to launch collaborative machine learning thesis sponsorships and internships.'
      });
    }
    if (data < 60) {
      list.push({
        icon: <Compass className="w-5 h-5 text-teal-400" />,
        title: 'Cleanse and Standardize Data Registries',
        text: 'Implement robust extract-transform-load (ETL) data pipelines to convert unstructured records into standardized, labeled relational warehouses.'
      });
    }
    if (funding < 50) {
      list.push({
        icon: <Coins className="w-5 h-5 text-yellow-400" />,
        title: 'Diversify Financial Sourcing',
        text: 'Leverage international development partner grants (World Bank, AfDB) or private sector venture backing to reduce capital constraints.'
      });
    }
    if (governance < 60) {
      list.push({
        icon: <ShieldAlert className="w-5 h-5 text-purple-400" />,
        title: 'Strengthen Act 843 Protections',
        text: 'Appoint dedicated, certified Data Protection Officers (DPO) and run external privacy compliance audits with the Data Protection Commission.'
      });
    }

    if (list.length === 0) {
      list.push({
        icon: <Award className="w-5 h-5 text-emerald-400" />,
        title: 'Maturity Standard Accomplished',
        text: 'Your institution satisfies all baseline AI Readiness criteria. Focus on continuous model drift monitoring and open-data cataloguing.'
      });
    }

    return list;
  };

  const score = calculateReadiness();
  const maturity = getMaturityLevel(score);
  const recs = generateRecommendations();

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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Institutional AI Readiness Assessment</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Evaluate and score government department capabilities for Artificial Intelligence deployments
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Interactive Readiness sliders */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>Readiness Dimensions</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Adjust variables to reflect the target MDA state.
            </p>
          </div>

          {/* Slider 1: Infrastructure */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>Compute Infrastructure</span>
              </span>
              <strong style={{ color: 'var(--ghana-emerald)' }}>{infra}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={infra} 
              onChange={(e) => setInfra(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>No GPU / Legacy Servers</span>
              <span>Advanced Clusters</span>
            </div>
          </div>

          {/* Slider 2: Skills */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <GraduationCap className="w-4 h-4 text-emerald-400" />
                <span>Technical Skills</span>
              </span>
              <strong style={{ color: 'var(--ghana-emerald)' }}>{skills}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={skills} 
              onChange={(e) => setSkills(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>IT Generalists Only</span>
              <span>In-house ML Scientists</span>
            </div>
          </div>

          {/* Slider 3: Data */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Compass className="w-4 h-4 text-emerald-400" />
                <span>Data Quality & Availability</span>
              </span>
              <strong style={{ color: 'var(--ghana-emerald)' }}>{data}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={data} 
              onChange={(e) => setData(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>Paper Archives</span>
              <span>API Structured Warehouses</span>
            </div>
          </div>

          {/* Slider 4: Funding */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Budget & Funding</span>
              </span>
              <strong style={{ color: 'var(--ghana-emerald)' }}>{funding}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={funding} 
              onChange={(e) => setFunding(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>No AI Line Item</span>
              <span>Fully Endowed Budgets</span>
            </div>
          </div>

          {/* Slider 5: Governance */}
          <div style={{ background: 'rgba(0,0,0,0.15)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldAlert className="w-4 h-4 text-emerald-400" />
                <span>Governance & Oversight</span>
              </span>
              <strong style={{ color: 'var(--ghana-emerald)' }}>{governance}%</strong>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={governance} 
              onChange={(e) => setGovernance(parseInt(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              <span>No DPO Officers</span>
              <span>Strict Privacy Controls</span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Maturity outcome gauges & Dynamic recommendations list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Gauge card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Assessment Results
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '10px 0' }}>
              {score}%
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <span className={`badge ${maturity.class}`} style={{ fontSize: '0.82rem', padding: '4px 14px' }}>
                {maturity.level}
              </span>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '280px', margin: '8px auto 0 auto' }}>
              {maturity.desc}
            </p>
          </div>

          {/* Recommendation list */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Dynamic Expert Guidelines</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {recs.map((rec, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    animation: 'fadeIn 0.3s ease'
                  }}
                >
                  <div style={{ flexShrink: 0, padding: '4px', borderRadius: '6px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {rec.icon}
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.title}</h5>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>{rec.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
