import React, { useState } from 'react';
import { 
  Award, Compass, Cpu, GraduationCap, Coins, 
  ShieldCheck, FileText, Layers, Users, ShoppingBag, 
  Workflow, AlertTriangle, Server, Activity, TrendingUp, Info,
  CheckCircle2, AlertCircle, XCircle
} from 'lucide-react';
import { UserRole } from './RoleSwitcher';

interface AIReadinessProps {
  currentRole: UserRole;
}

interface SubParameter {
  id: string;
  text: string;
  description: string; // Beginner explanation
}

interface ReadinessParameter {
  id: string;
  title: string;
  description: string; // Beginner explanation for parent parameter
  icon: React.ReactNode;
  subParameters: SubParameter[];
}

const institutionalParameters: ReadinessParameter[] = [
  {
    id: 'i1',
    title: 'Governance & Accountability Structure',
    description: 'This measures who is in charge of the AI system. It checks if there is a group of leaders watching over the project to make sure it follows the rules and stays on track.',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i1_sub1', text: 'Has a dedicated steering committee been formed for this project?', description: 'A steering committee is a group of leaders who meet regularly to make sure the project is going in the right direction.' },
      { id: 'i1_sub2', text: 'Are there clear roles assigned for signing off on AI system modifications?', description: 'This ensures someone is officially responsible for checking and approving any changes made to the AI\'s settings or code.' }
    ]
  },
  {
    id: 'i2',
    title: 'Project Documentation Maturity',
    description: 'This measures how well the project details are written down. Writing down how the AI is built and trained helps team members and auditors fix errors later.',
    icon: <FileText className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i2_sub1', text: 'Is there a written project charter or specification sheet?', description: 'A project charter is a simple document that states what the project is, who is working on it, and what success looks like.' },
      { id: 'i2_sub2', text: 'Are model training details and data sources logged?', description: 'This means keeping a diary of where your training data came from and how the AI was trained, so you can trace it later if there is an error.' }
    ]
  },
  {
    id: 'i3',
    title: 'Budget & Financial Capacity',
    description: 'This checks if the project has enough money. It ensures you have funds to build the AI and keep paying for monthly hosting fees and server power.',
    icon: <Coins className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i3_sub1', text: 'Is there a dedicated budget allocated for AI development?', description: 'This confirms that money has been set aside specifically to build and launch the AI, rather than pulling from other general IT funds.' },
      { id: 'i3_sub2', text: 'Is there a funding plan for ongoing hosting fees and API usage?', description: 'AI systems require server host spaces and API query fees. This confirms there is money set aside to pay for those ongoing bills.' }
    ]
  },
  {
    id: 'i4',
    title: 'Technical Staffing Capacity',
    description: 'This evaluates the skills of your team. It checks if you have in-house software engineers and administrators who know how to keep the AI running daily.',
    icon: <GraduationCap className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i4_sub1', text: 'Does the team have at least one dedicated software or data engineer?', description: 'A software or data engineer is a specialist who writes clean code, manages data streams, and connects the AI to databases.' },
      { id: 'i4_sub2', text: 'Is there an administrator trained to manage AI system dashboards?', description: 'An administrator is a staff member trained to monitor the AI system, handle user accounts, and review automated logs.' }
    ]
  },
  {
    id: 'i5',
    title: 'Data Governance Ownership',
    description: 'This checks who controls the training data. Assigning data owners and access rules keeps citizen information clean, safe, and private.',
    icon: <Compass className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i5_sub1', text: 'Has a clear data custodian or owner been assigned for all datasets?', description: 'A data custodian is the main person responsible for keeping the data clean, secure, and organized.' },
      { id: 'i5_sub2', text: 'Are there rules outlining who is allowed to access sensitive tables?', description: 'These access rules ensure only authorized staff can view personal citizen details, protecting citizen privacy.' }
    ]
  },
  {
    id: 'i6',
    title: 'Existing System Inventory Awareness',
    description: 'This checks if you know what computers and databases your department currently owns, so you know how the new AI will connect to them.',
    icon: <Layers className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i6_sub1', text: 'Is there an up-to-date registry of all software and hardware systems?', description: 'An inventory registry is a list of all computers, servers, and software programs the agency currently runs.' },
      { id: 'i6_sub2', text: 'Have the database connections and system dependencies been mapped out?', description: 'Mapping dependencies means drawing a diagram of how your database connects to other government systems so you know what will be affected.' }
    ]
  },
  {
    id: 'i7',
    title: 'Change Management Readiness',
    description: 'This checks how ready your staff is for new technology. Providing training courses helps workers feel comfortable using the AI tool in their daily jobs.',
    icon: <Users className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i7_sub1', text: 'Has a training curriculum been scheduled for employees using the new AI?', description: 'Training ensures that employees know how to use the AI tool effectively and do not feel overwhelmed by new technology.' },
      { id: 'i7_sub2', text: 'Is there an escalation channel for staff to report tool errors or feedback?', description: 'An escalation channel is a quick way (like an email form or hotline) for employees to report bugs and suggest updates.' }
    ]
  },
  {
    id: 'i8',
    title: 'Procurement Capability',
    description: 'This measures how your agency buys software. Having clear rules and a safe testing sandbox ensures you buy the best and safest AI systems.',
    icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i8_sub1', text: 'Are there specific criteria to evaluate different vendors and software products?', description: 'This ensures you evaluate vendor packages objectively based on performance, cost, and safety rather than picking at random.' },
      { id: 'i8_sub2', text: 'Is there a sandbox test environment to validate tools before purchase?', description: 'A sandbox is a safe, isolated test area where you can run software trials to verify it works before signing a long-term purchase contract.' }
    ]
  },
  {
    id: 'i9',
    title: 'Sustainability/Maintenance Plan',
    description: 'This measures the long-term support plan. It ensures the software is updated regularly and checked monthly to make sure it doesn\'t make mistakes.',
    icon: <Workflow className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i9_sub1', text: 'Is there a signed SLA contract for software updates and server upkeep?', description: 'An SLA (Service Level Agreement) is a contract that guarantees the software vendor will fix bugs and keep servers running 99.9% of the time.' },
      { id: 'i9_sub2', text: 'Has a scheduled procedure been set up to check the AI\'s accuracy monthly?', description: 'Checking accuracy ensures the AI does not start making wrong predictions over time as real-world data drifts.' }
    ]
  },
  {
    id: 'i10',
    title: 'Institutional Risk Appetite/Escalation',
    description: 'This sets safety limits for the AI. It outlines when the AI should be turned off if it acts up, and how staff can fallback to manual paper workflows.',
    icon: <AlertTriangle className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'i10_sub1', text: 'Are there written limits specifying what errors require taking the AI offline?', description: 'These limits act as safety boundaries, defining when the system must be switched off if it behaves unsafely.' },
      { id: 'i10_sub2', text: 'Is there a backup manual workflow for citizens if the AI system crashes?', description: 'A manual workflow ensures that if the computer system goes down, citizens can still submit paper forms and receive services.' }
    ]
  }
];

const marketableParameters: ReadinessParameter[] = [
  {
    id: 'm1',
    title: 'Vendor/Solution Availability',
    description: 'This checks if there are already good software products sold in the market, so you don\'t have to build the AI system completely from scratch.',
    icon: <ShoppingBag className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm1_sub1', text: 'Are there at least three competitive products available in the market?', description: 'Having multiple options ensures you can compare features and pricing to get the best deal, preventing single-vendor lock-in.' },
      { id: 'm1_sub2', text: 'Do these products offer ready-made modules fitting the MDA requirements?', description: 'Ready-made modules are pre-built features that work out of the box, saving you from writing custom code from scratch.' }
    ]
  },
  {
    id: 'm2',
    title: 'Local Vendor Capacity',
    description: 'This checks if local Ghanaian companies can deploy the system, rather than depending 100% on foreign imports.',
    icon: <Compass className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm2_sub1', text: 'Is there a local Ghanaian IT firm capable of deploying this system?', description: 'Using local firms builds national capacity, creates jobs, and ensures support staff reside in the same time zone.' },
      { id: 'm2_sub2', text: 'Can the system be run without absolute reliance on foreign cloud servers?', description: 'This verifies that the AI can run locally or via hybrid-cloud, keeping critical data safe from global network blackouts.' }
    ]
  },
  {
    id: 'm3',
    title: 'Technology Maturity (Market Adoption)',
    description: 'This evaluates if the AI tools you are buying are stable and widely used, rather than experimental software that might break.',
    icon: <Cpu className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm3_sub1', text: 'Has this AI solution been successfully deployed in other sectors for 2+ years?', description: 'A solution with 2+ years of run time is mature and stable, meaning most startup bugs have already been found and fixed.' },
      { id: 'm3_sub2', text: 'Is the underlying framework backed by a large open-source community?', description: 'Open-source backing ensures that security patches are rolled out quickly and the tool will not be abandoned by a single creator.' }
    ]
  },
  {
    id: 'm4',
    title: 'Interoperability with Existing Platforms',
    description: 'This measures how easily the vendor\'s software can connect and share file data with other IT systems your department runs.',
    icon: <Layers className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm4_sub1', text: 'Do vendor products offer standard REST or gRPC API endpoints?', description: 'REST and gRPC are standard connectors that let different computer systems talk to each other and share data easily.' },
      { id: 'm4_sub2', text: 'Can the solution import and export files in open formats like JSON or CSV?', description: 'Open formats make sure you can transfer datasets between systems without needing proprietary, expensive converters.' }
    ]
  },
  {
    id: 'm5',
    title: 'TCO Competitiveness',
    description: 'This audits both the upfront setup costs and ongoing monthly runtime fees to make sure the software is priced fairly.',
    icon: <Coins className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm5_sub1', text: 'Are the upfront installation and license fees within market benchmarks?', description: 'Upfront fees are initial setup costs. Auditing these against standards ensures you do not pay inflated pricing.' },
      { id: 'm5_sub2', text: 'Is the monthly runtime cost (compute, tokens) stable and predictable?', description: 'Predictable runtime fees prevent unexpected monthly billing spikes when user traffic rises.' }
    ]
  },
  {
    id: 'm6',
    title: 'Cloud/Infrastructure Market Options',
    description: 'This checks if there are cloud host sites physically located in Ghana (like NITA) to store citizen data legally and securely.',
    icon: <Server className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm6_sub1', text: 'Are there local cloud hosting providers (e.g. NITA cloud) available for hosting?', description: 'Local hosts are datacenters physically located inside Ghana, helping you comply with national data sovereignty laws.' },
      { id: 'm6_sub2', text: 'Does the product support hybrid or private offline deployment models?', description: 'Offline or hybrid setups allow the system to operate securely inside the agency\'s private servers without connecting to the public internet.' }
    ]
  },
  {
    id: 'm7',
    title: 'Security Certification Availability',
    description: 'This checks if the vendor has official security certificates, proving their databases have been tested and protected against hackers.',
    icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm7_sub1', text: 'Does the vendor possess a verified SOC 2 Type II or ISO 27001 certificate?', description: 'These certificates prove that an independent auditor verified that the vendor\'s database security meets global protection rules.' },
      { id: 'm7_sub2', text: 'Has the vendor product undergone independent vulnerability audits?', description: 'Independent vulnerability testing ensures the software does not contain hidden security flaws that hackers can exploit.' }
    ]
  },
  {
    id: 'm8',
    title: 'Support and SLA Ecosystem',
    description: 'This ensures the vendor provides a contract to fix system issues quickly (under 4 hours) and has a support hotline in Ghana.',
    icon: <Activity className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm8_sub1', text: 'Does the vendor offer a response SLA of under 4 hours for critical issues?', description: 'This guarantees that if the AI crashes, the vendor\'s engineering team will begin fixing it within 4 hours.' },
      { id: 'm8_sub2', text: 'Is there localized customer support with telephone hotlines in Ghana?', description: 'Local support phone numbers ensure you can talk to an engineer instantly without international call latency.' }
    ]
  },
  {
    id: 'm9',
    title: 'Regulatory/Standards Alignment',
    description: 'This ensures the vendor software compiles with legal requirements like data protection rules and global safety guidelines.',
    icon: <FileText className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm9_sub1', text: 'Is the vendor product certified compliant with data protection laws?', description: 'This ensures the vendor software compiles with guidelines like GDPR or Act 843, avoiding legal liability.' },
      { id: 'm9_sub2', text: 'Does the vendor declare that their models conform to emerging AI standards?', description: 'Conformity declarations state that the vendor built their models according to global safety and bias guidelines.' }
    ]
  },
  {
    id: 'm10',
    title: 'Innovation/Scalability Runway',
    description: 'This checks if the software receives updates and can handle thousands of citizen requests at the same time without crashing.',
    icon: <TrendingUp className="w-4 h-4 text-emerald-400" />,
    subParameters: [
      { id: 'm10_sub1', text: 'Does the vendor\'s product roadmap detail active updates for the next 3 years?', description: 'A product roadmap lists future feature updates. A 3-year commitment ensures the software remains modern.' },
      { id: 'm10_sub2', text: 'Can the license model scale to support 10,000+ simultaneous citizen requests?', description: 'Scalability confirms that the system can handle large citizen traffic spikes without slowing down or crashing.' }
    ]
  }
];

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
    width: 280px;
    background-color: rgba(15, 23, 42, 0.98);
    color: #f1f5f9;
    text-align: left;
    border-radius: 8px;
    padding: 10px 14px;
    position: absolute;
    z-index: 9999;
    top: 50%;
    left: 140%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
    font-size: 0.76rem;
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

export const AIReadiness: React.FC<AIReadinessProps> = ({ currentRole }) => {
  const [activeBranch, setActiveBranch] = useState<'institutional' | 'marketable'>('institutional');
  const [activeThickboxParam, setActiveThickboxParam] = useState<ReadinessParameter | null>(null);

  // Initialize checklist answer states dynamically
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>(() => {
    const initial: Record<string, 'yes' | 'no'> = {};
    const keys = [
      'i1_sub1', 'i1_sub2', 'i2_sub1', 'i2_sub2', 'i3_sub1', 'i3_sub2',
      'i4_sub1', 'i4_sub2', 'i5_sub1', 'i5_sub2', 'i6_sub1', 'i6_sub2',
      'i7_sub1', 'i7_sub2', 'i8_sub1', 'i8_sub2', 'i9_sub1', 'i9_sub2',
      'i10_sub1', 'i10_sub2',
      'm1_sub1', 'm1_sub2', 'm2_sub1', 'm2_sub2', 'm3_sub1', 'm3_sub2',
      'm4_sub1', 'm4_sub2', 'm5_sub1', 'm5_sub2', 'm6_sub1', 'm6_sub2',
      'm7_sub1', 'm7_sub2', 'm8_sub1', 'm8_sub2', 'm9_sub1', 'm9_sub2',
      'm10_sub1', 'm10_sub2'
    ];
    keys.forEach((k, idx) => {
      initial[k] = idx % 4 === 0 ? 'no' : 'yes';
    });
    return initial;
  });

  const canEdit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);

  const handleAnswerChange = (subId: string, val: 'yes' | 'no') => {
    if (!canEdit) return;
    setAnswers(prev => ({
      ...prev,
      [subId]: val
    }));
  };

  const getBranchScore = (branch: 'institutional' | 'marketable') => {
    const prefix = branch === 'institutional' ? 'i' : 'm';
    const subIds = [];
    for (let p = 1; p <= 10; p++) {
      subIds.push(`${prefix}${p}_sub1`);
      subIds.push(`${prefix}${p}_sub2`);
    }
    const yesCount = subIds.filter(id => answers[id] === 'yes').length;
    return Math.round((yesCount / 20) * 100);
  };

  const instScore = getBranchScore('institutional');
  const marketScore = getBranchScore('marketable');
  const overallScore = Math.round((instScore + marketScore) / 2);

  const getMaturityLevel = (score: number) => {
    if (score >= 76) return { level: 'Level 4: Optimized', class: 'badge-success', desc: 'Sovereign automated code pipelines, active ethical monitoring, and ISO 42001 standardization.' };
    if (score >= 51) return { level: 'Level 3: Managed', class: 'badge-info', desc: 'Appointed data science departments, standard high-performance infrastructure, and active ethics audits.' };
    if (score >= 26) return { level: 'Level 2: Defined', class: 'badge-warning', desc: 'Basic digital records, IT staff are aware of model metrics, and initial pilots are under conceptualization.' };
    return { level: 'Level 1: Initial', class: 'badge-danger', desc: 'Minimal data infrastructure, lack of internal machine learning skills, and ad-hoc project procurements.' };
  };

  const getParentStatusIcon = (p: ReadinessParameter) => {
    const sub1 = answers[`${p.id}_sub1`];
    const sub2 = answers[`${p.id}_sub2`];
    
    if (sub1 === 'yes' && sub2 === 'yes') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" style={{ marginRight: '6px' }} />;
    } else if (sub1 === 'no' && sub2 === 'no') {
      return <XCircle className="w-4 h-4 text-rose-500" style={{ marginRight: '6px' }} />;
    } else {
      return <AlertCircle className="w-4 h-4 text-amber-400" style={{ marginRight: '6px' }} />;
    }
  };

  const generateRecommendations = () => {
    const list = [];
    
    // Scan Institutional Parameters
    institutionalParameters.forEach(p => {
      const sub1 = answers[`${p.id}_sub1`];
      const sub2 = answers[`${p.id}_sub2`];
      if (sub1 === 'no' || sub2 === 'no') {
        if (p.id === 'i1') {
          list.push({
            icon: p.icon,
            title: 'Appoint Governance Committees',
            text: 'Form a steering committee and assign clear approval roles to govern your AI system and manage adjustments.'
          });
        } else if (p.id === 'i2') {
          list.push({
            icon: p.icon,
            title: 'Draft Model Card Standards',
            text: 'Compile written project charters and record model training details to raise documentation maturity.'
          });
        } else if (p.id === 'i3') {
          list.push({
            icon: p.icon,
            title: 'Earmark Capital AI Budgets',
            text: 'Establish dedicated capital allocations and multi-year funding lines for ongoing cloud and API usage.'
          });
        } else if (p.id === 'i4') {
          list.push({
            icon: p.icon,
            title: 'Recruit In-House ML Engineers',
            text: 'Hire software/data engineers and train local administrators to manage model system dashboards.'
          });
        } else if (p.id === 'i5') {
          list.push({
            icon: p.icon,
            title: 'Assign Data Custodians',
            text: 'Define clear data owners and establish data access controls to protect sensitive citizen databases.'
          });
        } else if (p.id === 'i6') {
          list.push({
            icon: p.icon,
            title: 'Deploy CMDB Inventories',
            text: 'Create a full list of software assets and map backend database connection pathways.'
          });
        } else if (p.id === 'i7') {
          list.push({
            icon: p.icon,
            title: 'Launch Staff Reskilling Tracks',
            text: 'Schedule staff training and configure feedback channels to reduce workforce digital adaptation anxiety.'
          });
        } else if (p.id === 'i8') {
          list.push({
            icon: p.icon,
            title: 'Adopt Agile Procurement Models',
            text: 'Establish criteria for software checks and build sandbox test zones to run product trials.'
          });
        } else if (p.id === 'i9') {
          list.push({
            icon: p.icon,
            title: 'Map Drift Maintenance SLAs',
            text: 'Contract solid update SLAs and set up monthly accuracy monitoring to check for statistical model drift.'
          });
        } else if (p.id === 'i10') {
          list.push({
            icon: p.icon,
            title: 'Formalize Risk Escalation Paths',
            text: 'Write offline trigger thresholds and prepare manual backup operations if systems crash.'
          });
        }
      }
    });

    // Scan Marketable Parameters
    marketableParameters.forEach(p => {
      const sub1 = answers[`${p.id}_sub1`];
      const sub2 = answers[`${p.id}_sub2`];
      if (sub1 === 'no' || sub2 === 'no') {
        if (p.id === 'm1') {
          list.push({
            icon: p.icon,
            title: 'Broaden Vendor Sourcing Pools',
            text: 'Compare at least three competitive pre-built software packages to prevent single-vendor lock-in.'
          });
        } else if (p.id === 'm2') {
          list.push({
            icon: p.icon,
            title: 'Sponsor Local Startups',
            text: 'Sponsor domestic Ghanaian IT agencies and choose models that can run locally or in hybrid environments.'
          });
        } else if (p.id === 'm3') {
          list.push({
            icon: p.icon,
            title: 'Prioritize Battle-Tested Tech',
            text: 'Adopt software tools with 2+ years of market run time and strong open-source developer backing.'
          });
        } else if (p.id === 'm4') {
          list.push({
            icon: p.icon,
            title: 'Mandate Open API Formats',
            text: 'Enforce standard REST/gRPC connectors and select tools that support open files like JSON or CSV.'
          });
        } else if (p.id === 'm5') {
          list.push({
            icon: p.icon,
            title: 'Negotiate Cost-per-Token Limits',
            text: 'Evaluate upfront setup costs and negotiate stable, predictable monthly API query fees.'
          });
        } else if (p.id === 'm6') {
          list.push({
            icon: p.icon,
            title: 'Verify Sovereign Cloud Hosts',
            text: 'Incorporate hosting via local datacenters (like NITA) or verify offline private cloud capability.'
          });
        } else if (p.id === 'm7') {
          list.push({
            icon: p.icon,
            title: 'Demand SOC 2/ISO Certifications',
            text: 'Reject vendor systems lacking independent security certifications and vulnerability audits.'
          });
        } else if (p.id === 'm8') {
          list.push({
            icon: p.icon,
            title: 'Enforce Local Technical SLAs',
            text: 'Require critical response SLAs under 4 hours and verify telephone support hotlines exist locally.'
          });
        } else if (p.id === 'm9') {
          list.push({
            icon: p.icon,
            title: 'Audit Legal Framework Matches',
            text: 'Confirm vendor products align with data protection rules and compile with global safety standards.'
          });
        } else if (p.id === 'm10') {
          list.push({
            icon: p.icon,
            title: 'Secure Scalability Guarantees',
            text: 'Check product development timelines for 3 years out and verify scaling capacity for large citizen traffic spikes.'
          });
        }
      }
    });

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
  const recs = generateRecommendations().slice(0, 4);
  const currentParameters = activeBranch === 'institutional' ? institutionalParameters : marketableParameters;

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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Readiness Assessment Checklist</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Evaluate and audit capability levels for Institutional and Marketable AI deployments
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.45fr 1fr', gap: '24px', alignItems: 'stretch' }}>
        
        {/* LEFT COLUMN: Switcher + Sub-Parameters Audit Grid */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', zIndex: 10 }}>
          
          {/* Tabs switch */}
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

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                {activeBranch === 'institutional' ? 'Institutional Assessment Parameters' : 'Marketable Assessment Parameters'}
              </h3>
              <p style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Verify and answer yes/no for each nested checkpoint parameters.
              </p>
            </div>
            {!canEdit && (
              <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Read-only Mode</span>
            )}
          </div>

          {/* Grid Checklist parameters */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '14px' 
          }}>
            {currentParameters.map(p => {
              return (
                <div key={p.id} style={{ 
                  background: 'rgba(0,0,0,0.12)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px',
                  padding: '12px'
                }}>
                  {/* Parameter title block */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '10px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    paddingBottom: '6px'
                  }}>
                    {getParentStatusIcon(p)}
                    <span style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      lineHeight: '1.3',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {p.title}
                      <button
                        onClick={() => setActiveThickboxParam(p)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '2px',
                          color: '#38bdf8',
                          opacity: 0.8,
                          transition: 'opacity 0.15s ease'
                        }}
                        title="Click to open detailed explanation modal"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>

                  {/* Child parameters checklist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {p.subParameters.map(sub => {
                      const isYes = answers[sub.id] === 'yes';
                      const isNo = answers[sub.id] === 'no';
                      return (
                        <div 
                          key={sub.id}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center', 
                            gap: '8px', 
                            padding: '6px 8px', 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid rgba(255,255,255,0.02)', 
                            borderRadius: '6px',
                            fontSize: '0.74rem'
                          }}
                        >
                          <span style={{ 
                            color: isYes ? 'var(--text-primary)' : 'var(--text-secondary)',
                            lineHeight: '1.3',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            • {sub.text}
                            <span className="readiness-tooltip-container">
                              <Info className="w-3.5 h-3.5 text-sky-400 cursor-help opacity-70 hover:opacity-100" style={{ marginLeft: '4px' }} />
                              <span className="readiness-tooltip-text">
                                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '3px' }}>Simple Explanation:</strong>
                                {sub.description}
                              </span>
                            </span>
                          </span>
                          
                          {/* Toggle controls */}
                          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                            <button
                              onClick={() => handleAnswerChange(sub.id, 'yes')}
                              disabled={!canEdit}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid ' + (isYes ? '#10b981' : 'rgba(255,255,255,0.06)'),
                                background: isYes ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.01)',
                                color: isYes ? '#34d399' : 'var(--text-muted)',
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                cursor: canEdit ? 'pointer' : 'default',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              YES
                            </button>
                            <button
                              onClick={() => handleAnswerChange(sub.id, 'no')}
                              disabled={!canEdit}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '4px',
                                border: '1px solid ' + (isNo ? '#f43f5e' : 'rgba(255,255,255,0.06)'),
                                background: isNo ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.01)',
                                color: isNo ? '#fb7185' : 'var(--text-muted)',
                                fontSize: '0.64rem',
                                fontWeight: 700,
                                cursor: canEdit ? 'pointer' : 'default',
                                transition: 'all 0.12s ease'
                              }}
                            >
                              NO
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* RIGHT COLUMN: Live readiness results & instructions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
          
          {/* Outcome Result Card */}
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

            {/* Split averages summary */}
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

          {/* Expert recommendations */}
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

      {/* Thickbox Modal Overlay */}
      {activeThickboxParam && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 99999,
          padding: '16px'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)',
            border: '3px solid var(--ghana-emerald)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75), 0 0 15px rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '520px',
            padding: '24px',
            color: '#f8fafc',
            position: 'relative'
          }}>
            <button
              onClick={() => setActiveThickboxParam(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                color: '#94a3b8',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                transition: 'all 0.15s ease'
              }}
            >
              ✕
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ 
                padding: '8px', 
                borderRadius: '8px', 
                background: 'rgba(16, 185, 129, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activeThickboxParam.icon}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
                {activeThickboxParam.title}
              </h3>
            </div>

            <div style={{ 
              background: 'rgba(0,0,0,0.25)', 
              padding: '16px', 
              borderRadius: '10px', 
              border: '1px solid rgba(255,255,255,0.05)',
              marginBottom: '20px'
            }}>
              <h4 style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#38bdf8', letterSpacing: '0.05em', margin: '0 0 6px 0', fontWeight: 700 }}>
                Beginner Explanation
              </h4>
              <p style={{ fontSize: '0.92rem', lineHeight: '1.5', margin: 0, color: '#e2e8f0' }}>
                {activeThickboxParam.description}
              </p>
            </div>

            <h4 style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em', margin: '0 0 10px 0', fontWeight: 700 }}>
              Checklist Requirements
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {activeThickboxParam.subParameters.map((sub) => (
                <div key={sub.id} style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  fontSize: '0.82rem', 
                  background: 'rgba(255,255,255,0.01)', 
                  padding: '10px', 
                  borderRadius: '6px', 
                  border: '1px solid rgba(255,255,255,0.02)' 
                }}>
                  <span style={{ color: 'var(--ghana-emerald)', fontWeight: 'bold' }}>✓</span>
                  <div>
                    <strong style={{ display: 'block', color: '#f1f5f9', marginBottom: '2px' }}>{sub.text}</strong>
                    <span style={{ color: '#94a3b8', fontSize: '0.76rem', lineHeight: '1.3' }}>{sub.description}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveThickboxParam(null)}
              style={{
                marginTop: '24px',
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--ghana-emerald)',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
