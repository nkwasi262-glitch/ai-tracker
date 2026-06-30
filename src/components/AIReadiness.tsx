import React, { useState } from 'react';
import { 
  Award, Compass, Cpu, GraduationCap, Coins, 
  ShieldCheck, FileText, Layers, Users, ShoppingBag, 
  Workflow, AlertTriangle, Server, Activity, TrendingUp, Info 
} from 'lucide-react';
import { UserRole } from './RoleSwitcher';

interface AIReadinessProps {
  currentRole: UserRole;
}

export const AIReadiness: React.FC<AIReadinessProps> = () => {
  // Toggle tab state
  const [activeBranch, setActiveBranch] = useState<'institutional' | 'marketable'>('institutional');

  // Sliders state: Institutional parameters (10)
  const [govStructure, setGovStructure] = useState<number>(60);
  const [docMaturity, setDocMaturity] = useState<number>(50);
  const [budgetCap, setBudgetCap] = useState<number>(45);
  const [technicalStaff, setTechnicalStaff] = useState<number>(40);
  const [dataOwnership, setDataOwnership] = useState<number>(65);
  const [systemInventory, setSystemInventory] = useState<number>(55);
  const [changeMgmt, setChangeMgmt] = useState<number>(50);
  const [procurementCap, setProcurementCap] = useState<number>(40);
  const [sustainPlan, setSustainPlan] = useState<number>(45);
  const [riskAppetite, setRiskAppetite] = useState<number>(50);

  // Sliders state: Marketable parameters (10)
  const [vendorAvail, setVendorAvail] = useState<number>(70);
  const [localCap, setLocalCap] = useState<number>(40);
  const [techMaturity, setTechMaturity] = useState<number>(75);
  const [interoperability, setInteroperability] = useState<number>(60);
  const [tcoCompetitive, setTcoCompetitive] = useState<number>(65);
  const [cloudOptions, setCloudOptions] = useState<number>(50);
  const [securityCert, setSecurityCert] = useState<number>(55);
  const [supportSla, setSupportSla] = useState<number>(45);
  const [vendorAlignment, setVendorAlignment] = useState<number>(60);
  const [innovationRunway, setInnovationRunway] = useState<number>(70);

  // Calculate scores
  const instScore = Math.round(
    (govStructure + docMaturity + budgetCap + technicalStaff + dataOwnership +
     systemInventory + changeMgmt + procurementCap + sustainPlan + riskAppetite) / 10
  );

  const marketScore = Math.round(
    (vendorAvail + localCap + techMaturity + interoperability + tcoCompetitive +
     cloudOptions + securityCert + supportSla + vendorAlignment + innovationRunway) / 10
  );

  const overallScore = Math.round((instScore + marketScore) / 2);

  const getMaturityLevel = (score: number) => {
    if (score >= 76) return { level: 'Level 4: Optimized', class: 'badge-success', desc: 'Sovereign automated code pipelines, active ethical monitoring, and ISO 42001 standardization.' };
    if (score >= 51) return { level: 'Level 3: Managed', class: 'badge-info', desc: 'Appointed data science departments, standard high-performance infrastructure, and active ethics audits.' };
    if (score >= 26) return { level: 'Level 2: Defined', class: 'badge-warning', desc: 'Basic digital records, IT staff are aware of model metrics, and initial pilots are under conceptualization.' };
    return { level: 'Level 1: Initial', class: 'badge-danger', desc: 'Minimal data infrastructure, lack of internal machine learning skills, and ad-hoc project procurements.' };
  };

  // Generate dynamic expert recommendations based on thresholds
  const generateRecommendations = () => {
    const list = [];

    // Institutional checks
    if (govStructure < 55) {
      list.push({
        icon: <ShieldCheck className="w-5 h-5 text-red-400" />,
        title: 'Appoint Governance Committees',
        text: 'Establish formal departmental AI boards to audit compliance limits and algorithmic accountability.'
      });
    }
    if (docMaturity < 55) {
      list.push({
        icon: <FileText className="w-5 h-5 text-amber-400" />,
        title: 'Draft Model Card Standards',
        text: 'Standardize project descriptions to declare training runs, features, and model limitations.'
      });
    }
    if (budgetCap < 50) {
      list.push({
        icon: <Coins className="w-5 h-5 text-yellow-400" />,
        title: 'Earmark Capital AI Budgets',
        text: 'Formulate specialized multi-year financial line items dedicated to AI systems and hosting fees.'
      });
    }
    if (technicalStaff < 50) {
      list.push({
        icon: <GraduationCap className="w-5 h-5 text-red-400" />,
        title: 'Recruit In-House ML Engineers',
        text: 'Reduce contractor dependency by offering competitive technical salaries for internal ML personnel.'
      });
    }
    if (dataOwnership < 60) {
      list.push({
        icon: <Compass className="w-5 h-5 text-teal-400" />,
        title: 'Assign Data Custodians',
        text: 'Appoint registry owners to manage database permissions, data hygiene, and anonymization pipelines.'
      });
    }
    if (systemInventory < 60) {
      list.push({
        icon: <Layers className="w-5 h-5 text-sky-400" />,
        title: 'Deploy CMDB Inventories',
        text: 'Map database schemas and server versions to trace dependencies across all agency IT infrastructures.'
      });
    }
    if (changeMgmt < 55) {
      list.push({
        icon: <Users className="w-5 h-5 text-amber-400" />,
        title: 'Launch Staff Reskilling Tracks',
        text: 'Combat digital resistance by providing training modules explaining how AI tools supplement daily tasks.'
      });
    }
    if (procurementCap < 55) {
      list.push({
        icon: <ShoppingBag className="w-5 h-5 text-rose-400" />,
        title: 'Adopt Agile Procurement Models',
        text: 'Establish sandbox environments to test pilot model performance before final commercial purchases.'
      });
    }
    if (sustainPlan < 50) {
      list.push({
        icon: <Workflow className="w-5 h-5 text-purple-400" />,
        title: 'Map Drift Maintenance SLAs',
        text: 'Flesh out post-launch support cycles to retrain models if real-world statistics begin to slip.'
      });
    }
    if (riskAppetite < 55) {
      list.push({
        icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
        title: 'Formalize Risk Escalation paths',
        text: 'Install warning alerts and manual kill-switch limits if model predictions trigger critical errors.'
      });
    }

    // Marketable checks
    if (vendorAvail < 60) {
      list.push({
        icon: <ShoppingBag className="w-5 h-5 text-amber-400" />,
        title: 'Broaden Vendor Sourcing Pools',
        text: 'Liaise with local and international business hubs to locate solutions matching domain needs.'
      });
    }
    if (localCap < 50) {
      list.push({
        icon: <Compass className="w-5 h-5 text-teal-400" />,
        title: 'Sponsor Local Startups',
        text: 'Support domestic AI service companies to build domestic skills and reduce foreign license fees.'
      });
    }
    if (techMaturity < 60) {
      list.push({
        icon: <Cpu className="w-5 h-5 text-purple-400" />,
        title: 'Prioritize Battle-Tested Tech',
        text: 'Avoid bleeding-edge experimental models. Stick to frameworks with wide market adoption.'
      });
    }
    if (interoperability < 60) {
      list.push({
        icon: <Layers className="w-5 h-5 text-sky-400" />,
        title: 'Mandate Open API Formats',
        text: 'Require commercial solutions to export standardized REST or gRPC connectors for backend linkages.'
      });
    }
    if (tcoCompetitive < 60) {
      list.push({
        icon: <Coins className="w-5 h-5 text-yellow-400" />,
        title: 'Negotiate Cost-per-Token Limits',
        text: 'Audit TCO matrices to ensure API query volumes do not generate unsustainable operational bills.'
      });
    }
    if (cloudOptions < 60) {
      list.push({
        icon: <Server className="w-5 h-5 text-emerald-400" />,
        title: 'Verify Sovereign Cloud Hosts',
        text: 'Ensure vendors offer local server hosting or private cloud options to comply with residency rules.'
      });
    }
    if (securityCert < 60) {
      list.push({
        icon: <ShieldCheck className="w-5 h-5 text-red-400" />,
        title: 'Demand SOC 2/ISO Certifications',
        text: 'Enforce security compliance rules by rejecting solutions lacking formal safety audits.'
      });
    }
    if (supportSla < 50) {
      list.push({
        icon: <Activity className="w-5 h-5 text-rose-400" />,
        title: 'Enforce Local Technical SLAs',
        text: 'Guarantee model stability by contracting 24/7 emergency patch services from regional teams.'
      });
    }
    if (vendorAlignment < 60) {
      list.push({
        icon: <FileText className="w-5 h-5 text-blue-400" />,
        title: 'Audit Legal Framework Matches',
        text: 'Ensure commercial model configurations respect national guidelines and regulatory policies.'
      });
    }
    if (innovationRunway < 60) {
      list.push({
        icon: <TrendingUp className="w-5 h-5 text-teal-400" />,
        title: 'Secure Scalability Guarantees',
        text: 'Check vendor product roadmaps to verify platforms receive long-term features and improvements.'
      });
    }

    if (list.length === 0) {
      list.push({
        icon: <Award className="w-5 h-5 text-emerald-400" />,
        title: 'Sovereign Excellence Achieved',
        text: 'Your institution satisfies all baseline AI Readiness criteria. Focus on continuous model drift monitoring.'
      });
    }

    return list;
  };

  const maturity = getMaturityLevel(overallScore);
  const recs = generateRecommendations().slice(0, 4); // Limit to top 4 recommendations

  // Tooltip Styles custom
  const tooltipStyles = `
    .readiness-tooltip-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      margin-left: 6px;
      vertical-align: middle;
    }
    .readiness-tooltip-text {
      visibility: hidden;
      width: 260px;
      background-color: rgba(15, 23, 42, 0.98);
      color: #f1f5f9;
      text-align: left;
      border-radius: 8px;
      padding: 10px 14px;
      position: absolute;
      z-index: 9999;
      top: 50%;
      left: 130%;
      transform: translateY(-50%);
      opacity: 0;
      transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
      font-size: 0.74rem;
      line-height: 1.4;
      border: 1px solid rgba(255, 255, 255, 0.15);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6);
      backdrop-filter: blur(10px);
      pointer-events: none;
      font-weight: normal;
    }
    .readiness-tooltip-text::after {
      content: "";
      position: absolute;
      top: 50%;
      right: 100%;
      transform: translateY(-50%);
      border-width: 5px;
      border-style: solid;
      border-color: transparent rgba(15, 23, 42, 0.98) transparent transparent;
    }
    .readiness-tooltip-container:hover .readiness-tooltip-text {
      visibility: visible;
      opacity: 1;
      transform: translateY(-50%) translateX(4px);
    }
  `;

  // Custom slider render function
  const renderSlider = (
    label: string,
    value: number,
    setter: (val: number) => void,
    icon: React.ReactNode,
    desc: string,
    minLabel: string,
    maxLabel: string
  ) => {
    return (
      <div style={{ 
        background: 'rgba(0,0,0,0.15)', 
        padding: '12px 14px', 
        borderRadius: '8px', 
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', alignItems: 'center' }}>
          <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            {icon}
            <span>{label}</span>
            <span className="readiness-tooltip-container">
              <Info className="w-3.5 h-3.5 text-sky-400 cursor-help opacity-70 hover:opacity-100" />
              <span className="readiness-tooltip-text">
                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '3px' }}>Assessment Scope:</strong>
                {desc}
              </span>
            </span>
          </span>
          <strong style={{ color: 'var(--ghana-emerald)', fontSize: '0.85rem' }}>{value}%</strong>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={value} 
          onChange={(e) => setter(parseInt(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--ghana-emerald)', cursor: 'pointer', height: '6px' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--text-muted)' }}>
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      </div>
    );
  };

  return (
    <div>
      <style>{tooltipStyles}</style>

      {/* Header Panel */}
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Readiness Assessment Wizard</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Evaluate and score structural, policy, and market readiness before model deployments
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Dual branches selector + Sliders Grid */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 10 }}>
          
          {/* Segment Selector Tabs */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(0, 0, 0, 0.25)', 
            padding: '4px', 
            borderRadius: '8px', 
            border: '1px solid var(--border-color)' 
          }}>
            <button
              onClick={() => setActiveBranch('institutional')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeBranch === 'institutional' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeBranch === 'institutional' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: activeBranch === 'institutional' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              🏢 Institutional AI Readiness
            </button>
            <button
              onClick={() => setActiveBranch('marketable')}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: activeBranch === 'marketable' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                color: activeBranch === 'marketable' ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: activeBranch === 'marketable' ? '0 1px 3px rgba(0,0,0,0.3)' : 'none'
              }}
            >
              🛒 Marketable AI Readiness
            </button>
          </div>

          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '4px' }}>
              {activeBranch === 'institutional' ? 'Institutional Readiness Dimensions' : 'Marketable Readiness Dimensions'}
            </h3>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
              Configure these parameters to measure overall implementation capability.
            </p>
          </div>

          {/* Grid Sliders */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px' 
          }}>
            {activeBranch === 'institutional' ? (
              <>
                {renderSlider(
                  'Governance Structure', govStructure, setGovStructure, 
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                  'Formulation of oversight committees, audit procedures, and policy mandates to govern AI projects.',
                  'No Oversight', 'Board Committee'
                )}
                {renderSlider(
                  'Documentation Maturity', docMaturity, setDocMaturity, 
                  <FileText className="w-4 h-4 text-emerald-400" />,
                  'Systematic creation of model cards, data catalog sheets, risk registers, and system specifications.',
                  'Unmapped / Ad-hoc', 'Full Model Cards'
                )}
                {renderSlider(
                  'Budget & Capacity', budgetCap, setBudgetCap, 
                  <Coins className="w-4 h-4 text-emerald-400" />,
                  'Specific financial allocations for hosting fees, GPU computing hardware, and operations.',
                  'No AI Budget', 'Fully Funded Lines'
                )}
                {renderSlider(
                  'Technical Staffing', technicalStaff, setTechnicalStaff, 
                  <GraduationCap className="w-4 h-4 text-emerald-400" />,
                  'In-house machine learning developers, database engineers, and technical personnel availability.',
                  'General IT Staff', 'Dedicated ML team'
                )}
                {renderSlider(
                  'Data Governance', dataOwnership, setDataOwnership, 
                  <Compass className="w-4 h-4 text-emerald-400" />,
                  'Definition of clear data custodians, access roles, hygiene guidelines, and privacy guards.',
                  'Siloed / Unregulated', 'Strict Data Custody'
                )}
                {renderSlider(
                  'System Inventory', systemInventory, setSystemInventory, 
                  <Layers className="w-4 h-4 text-emerald-400" />,
                  'Awareness and cataloguing of existing database connections, APIs, and dependencies.',
                  'Unmapped Legacy', 'CMDB Catalogued'
                )}
                {renderSlider(
                  'Change Management', changeMgmt, setChangeMgmt, 
                  <Users className="w-4 h-4 text-emerald-400" />,
                  'Institutional capacity to retrain, shift role profiles, and adapt workflows to automated tools.',
                  'Strong Resistance', 'Active Retraining'
                )}
                {renderSlider(
                  'Procurement Capability', procurementCap, setProcurementCap, 
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />,
                  'Existence of dedicated evaluation systems, benchmarks, and licensing check scripts.',
                  'Generic IT Rules', 'AI Custom Sandbox'
                )}
                {renderSlider(
                  'Sustainability Plan', sustainPlan, setSustainPlan, 
                  <Workflow className="w-4 h-4 text-emerald-400" />,
                  'Post-launch model check cycles, drift metrics monitoring schedules, and vendor update cycles.',
                  'Zero Maintenance', 'Active Drift SLAs'
                )}
                {renderSlider(
                  'Risk Appetite & Escalation', riskAppetite, setRiskAppetite, 
                  <AlertTriangle className="w-4 h-4 text-emerald-400" />,
                  'Formal classification of risk tiers, safety limits, error thresholds, and kill switches.',
                  'No Escalation Paths', 'Clear Risk Limits'
                )}
              </>
            ) : (
              <>
                {renderSlider(
                  'Vendor Availability', vendorAvail, setVendorAvail, 
                  <ShoppingBag className="w-4 h-4 text-emerald-400" />,
                  'Market options of commercial and open-source models matching application criteria.',
                  'No fit solutions', 'Abundant choice'
                )}
                {renderSlider(
                  'Local Vendor Capacity', localCap, setLocalCap, 
                  <Compass className="w-4 h-4 text-emerald-400" />,
                  'Capability of regional domestic companies to support projects versus foreign software dependency.',
                  'Import reliant', 'Local startups'
                )}
                {renderSlider(
                  'Technology Maturity', techMaturity, setTechMaturity, 
                  <Cpu className="w-4 h-4 text-emerald-400" />,
                  'Industry-wide adoption stability and production verification of tools in real-world pipelines.',
                  'Experimental / Alpha', 'Battle-tested Standard'
                )}
                {renderSlider(
                  'Interoperability options', interoperability, setInteroperability, 
                  <Layers className="w-4 h-4 text-emerald-400" />,
                  'Commercial support for standard integration endpoints, Docker containers, and REST APIs.',
                  'Proprietary silos', 'Open Standards'
                )}
                {renderSlider(
                  'TCO Competitiveness', tcoCompetitive, setTcoCompetitive, 
                  <Coins className="w-4 h-4 text-emerald-400" />,
                  'Pricing models, hardware utilization limits, and long-term cost feasibility metrics.',
                  'Unpredictable fees', 'Highly Optimized'
                )}
                {renderSlider(
                  'Cloud/Hosting options', cloudOptions, setCloudOptions, 
                  <Server className="w-4 h-4 text-emerald-400" />,
                  'Availability of local regional server installations and hybrid-cloud hosting packages.',
                  'Foreign zones only', 'Diverse local cloud'
                )}
                {renderSlider(
                  'Security Certifications', securityCert, setSecurityCert, 
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />,
                  'Availability of SOC 2, ISO 27001, or equivalent safety certificates for market models.',
                  'No certifications', 'SOC 2 / ISO certified'
                )}
                {renderSlider(
                  'Support & SLA Ecosystem', supportSla, setSupportSla, 
                  <Activity className="w-4 h-4 text-emerald-400" />,
                  'Ecosystem support, localized customer hotlines, and engineer turnaround covenants.',
                  'No SLA agreements', '24/7 dedicated support'
                )}
                {renderSlider(
                  'Vendor Product Alignment', vendorAlignment, setVendorAlignment, 
                  <FileText className="w-4 h-4 text-emerald-400" />,
                  'Adherence of commercial vendor packages to national laws and policy requirements.',
                  'No compliance checks', 'Certified aligned'
                )}
                {renderSlider(
                  'Scalability Runway', innovationRunway, setInnovationRunway, 
                  <TrendingUp className="w-4 h-4 text-emerald-400" />,
                  'Feature roadmaps and modular system structures that enable continuous model extensions.',
                  'Closed legacy code', 'Modular / Open APIs'
                )}
              </>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Outcome scorecards & recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          
          {/* Main Results Card */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: '24px', textAlign: 'center', alignItems: 'center' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              Overall Readiness Score
            </div>
            
            <div style={{ fontSize: '3.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', margin: '8px 0' }}>
              {overallScore}%
            </div>
            
            <div style={{ marginBottom: '14px' }}>
              <span className={`badge ${maturity.class}`} style={{ fontSize: '0.8rem', padding: '4px 14px' }}>
                {maturity.level}
              </span>
            </div>

            <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4, maxWidth: '280px', marginBottom: '18px' }}>
              {maturity.desc}
            </p>

            {/* Split Averages Breakdown */}
            <div style={{ 
              width: '100%', 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '12px', 
              paddingTop: '16px', 
              borderTop: '1px solid var(--border-color)' 
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Institutional</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{instScore}%</div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Marketable</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{marketScore}%</div>
              </div>
            </div>
          </div>

          {/* Guidelines/Recommendations Card */}
          <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px' }}>Prioritized Expert Guidelines</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflowY: 'auto' }}>
              {recs.map((rec, idx) => (
                <div 
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.01)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    fontSize: '0.78rem'
                  }}
                >
                  <div style={{ 
                    flexShrink: 0, 
                    padding: '4px', 
                    borderRadius: '6px', 
                    background: 'rgba(255,255,255,0.02)', 
                    border: '1px solid var(--border-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px'
                  }}>
                    {rec.icon}
                  </div>
                  <div>
                    <h5 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{rec.title}</h5>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.35 }}>{rec.text}</p>
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
