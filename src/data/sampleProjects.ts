export interface Milestone {
  id: string;
  title: string;
  dueDate: string;
  progressPercent: number;
  status: 'Pending' | 'Completed' | 'Delayed';
}

export interface Budget {
  totalAllocated: number;
  disbursed: number;
  utilized: number;
  remaining: number;
  primaryFundingSource: 'Government' | 'Development Partners' | 'Donors' | 'Private Sector' | 'Research Grants';
  currency: 'GHS' | 'USD';
}

export interface ComplianceScore {
  fairness: number;
  transparency: number;
  accountability: number;
  privacy: number;
  security: number;
  overallGrade: 'Excellent' | 'Good' | 'Moderate' | 'High Risk';
}

export interface RiskItem {
  id: string;
  category: 'Technical' | 'Financial' | 'Operational' | 'Ethical' | 'Cybersecurity' | 'Legal';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  likelihood: number; // 1-5
  impact: number;     // 1-5
  description: string;
  mitigationPlan: string;
  status: 'Open' | 'Mitigated' | 'Escalated';
}

export interface DocumentAsset {
  id: string;
  fileName: string;
  fileType: string;
  uploadedAt: string;
  version: number;
  signedBy: string[];
}

export interface AIProject {
  id: string;
  projectCode: string;
  name: string;
  description: string;
  category: 'Machine Learning' | 'Generative AI' | 'Natural Language Processing' | 'Computer Vision' | 'Robotics' | 'Expert Systems' | 'Predictive Analytics' | 'Smart Cities';
  sector: 'Health' | 'Education' | 'Agriculture' | 'Finance' | 'Security' | 'Transport' | 'Energy' | 'Environment' | 'Justice' | 'Local Government';
  stage: 'Concept' | 'Planning' | 'Development' | 'Pilot' | 'Deployment' | 'Operational' | 'Completed' | 'Suspended';
  status: 'Active' | 'Completed' | 'Delayed' | 'Suspended';
  startDate: string;
  endDate: string;
  expectedCompletionDate: string;
  latitude: number;
  longitude: number;
  mda: string;
  mdaCode: string;
  region: string;
  district: string;
  budget: Budget;
  compliance: ComplianceScore;
  readinessScore: number;
  milestones: Milestone[];
  risks: RiskItem[];
  documents: DocumentAsset[];
}

export const sampleProjects: AIProject[] = [
  {
    id: "proj-1",
    projectCode: "GN-AI-2026-001",
    name: "Cocoa Board Pest & Disease Predictor",
    description: "An AI-powered mobile and satellite imaging system that analyzes cocoa leaf health, predicts pest outbreaks (like capsid beetle attacks), and models harvest yields across rural farms.",
    category: "Computer Vision",
    sector: "Agriculture",
    stage: "Deployment",
    status: "Active",
    startDate: "2024-01-15",
    endDate: "2026-12-20",
    expectedCompletionDate: "2026-11-30",
    latitude: 6.2041,
    longitude: -1.7583, // Western Region cocoa hub
    mda: "Ghana Cocoa Board (COCOBOD)",
    mdaCode: "COCOBOD",
    region: "Western North",
    district: "Sefwi Wiawso",
    budget: {
      totalAllocated: 4200000,
      disbursed: 3800000,
      utilized: 3200000,
      remaining: 1000000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 92,
      transparency: 85,
      accountability: 90,
      privacy: 88,
      security: 85,
      overallGrade: "Excellent"
    },
    readinessScore: 84,
    milestones: [
      { id: "m1-1", title: "Mobile app field beta launch", dueDate: "2025-05-10", progressPercent: 100, status: "Completed" },
      { id: "m1-2", title: "Satellite imagery custom CNN training", dueDate: "2025-11-01", progressPercent: 100, status: "Completed" },
      { id: "m1-3", title: "National Cocoa Board cloud sync integration", dueDate: "2026-08-15", progressPercent: 35, status: "Pending" }
    ],
    risks: [
      {
        id: "r1-1",
        category: "Technical",
        severity: "Medium",
        likelihood: 3,
        impact: 3,
        description: "Unstable internet connectivity in Sefwi rural farming cooperatives blocks real-time model queries.",
        mitigationPlan: "Deploy local compressed TensorFlow Lite models directly inside the offline mobile app cache.",
        status: "Mitigated"
      },
      {
        id: "r1-2",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Hesitancy or lack of tech skills in local cocoa farmers to use image scanning workflows.",
        mitigationPlan: "Organize physical training clinics in local languages (Twi, Fante) and supply visual guides.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-1-1", fileName: "COCOBOD_AI_TechSpecs_V2.pdf", fileType: "pdf", uploadedAt: "2024-02-10", version: 2, signedBy: ["Chief Executive Officer", "IT Director"] },
      { id: "doc-1-2", fileName: "Regional_Inclusivity_Ethics_Audit.pdf", fileType: "pdf", uploadedAt: "2024-08-22", version: 1, signedBy: ["Data Protection Officer"] }
    ]
  },
  {
    id: "proj-2",
    projectCode: "GN-AI-2026-002",
    name: "Akosombo Smart Hydrology System",
    description: "An automated expert neural-network grid managing the Akosombo Dam reservoir spillway gates. Analyzes weather telemetry, satellite rain patterns, and flow sensors to predict floods.",
    category: "Predictive Analytics",
    sector: "Energy",
    stage: "Pilot",
    status: "Active",
    startDate: "2024-06-01",
    endDate: "2026-06-30",
    expectedCompletionDate: "2026-06-30",
    latitude: 6.2958,
    longitude: 0.0594, // Akosombo location
    mda: "Volta River Authority (VRA)",
    mdaCode: "VRA",
    region: "Eastern",
    district: "Asuogyaman",
    budget: {
      totalAllocated: 6500000,
      disbursed: 6000000,
      utilized: 5900000,
      remaining: 600000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 80,
      transparency: 90,
      accountability: 95,
      privacy: 95,
      security: 98,
      overallGrade: "Excellent"
    },
    readinessScore: 92,
    milestones: [
      { id: "m2-1", title: "Deploy telemetry sensor node net", dueDate: "2024-12-05", progressPercent: 100, status: "Completed" },
      { id: "m2-2", title: "Gate simulation stress-tests", dueDate: "2025-09-20", progressPercent: 100, status: "Completed" },
      { id: "m2-3", title: "Automated gate integration phase", dueDate: "2026-05-15", progressPercent: 95, status: "Pending" }
    ],
    risks: [
      {
        id: "r2-1",
        category: "Cybersecurity",
        severity: "Critical",
        likelihood: 2,
        impact: 5,
        description: "Potential penetration or hijack of dam gate controls via external internet connections.",
        mitigationPlan: "Enforce a strict human-confirmed air-gap hardware physical switch for final gate opening sequences.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-2-1", fileName: "VRA_SmartGrid_CyberAudit_2025.pdf", fileType: "pdf", uploadedAt: "2025-01-18", version: 1, signedBy: ["Director of Security", "Auditor General"] }
    ]
  },
  {
    id: "proj-3",
    projectCode: "GN-AI-2026-003",
    name: "Twi-English Medical Translation NLP Suite",
    description: "An automated voice-to-voice neural network that translates clinical queries from local Twi dialogue into English records, helping rural clinics document diagnostic details.",
    category: "Natural Language Processing",
    sector: "Health",
    stage: "Development",
    status: "Active",
    startDate: "2025-01-10",
    endDate: "2027-01-10",
    expectedCompletionDate: "2027-01-10",
    latitude: 6.6922,
    longitude: -1.6163, // Kumasi General Clinic Area
    mda: "Ministry of Health (MoH)",
    mdaCode: "MoH",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    budget: {
      totalAllocated: 2800000,
      disbursed: 1200000,
      utilized: 1000000,
      remaining: 1800000,
      primaryFundingSource: "Research Grants",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 70,
      accountability: 75,
      privacy: 89,
      security: 72,
      overallGrade: "Good"
    },
    readinessScore: 68,
    milestones: [
      { id: "m3-1", title: "Speech corpus collection from 50 districts", dueDate: "2025-08-30", progressPercent: 100, status: "Completed" },
      { id: "m3-2", title: "Model benchmark scoring & bias assessment", dueDate: "2026-04-10", progressPercent: 80, status: "Pending" },
      { id: "m3-3", title: "Clinical tablet deployment", dueDate: "2026-12-15", progressPercent: 0, status: "Pending" }
    ],
    risks: [
      {
        id: "r3-1",
        category: "Ethical",
        severity: "High",
        likelihood: 4,
        impact: 4,
        description: "Misdiagnoses triggered by minor dialect differences or slang translations in medical terms.",
        mitigationPlan: "Implement a double-verification dashboard displaying translation transcripts back to the patient's escort before log entries.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-3-1", fileName: "MoH_SpeechCorpus_DataProtection_Signed.pdf", fileType: "pdf", uploadedAt: "2025-02-04", version: 1, signedBy: ["Data Commission Commissioner"] }
    ]
  },
  {
    id: "proj-4",
    projectCode: "GN-AI-2026-004",
    name: "E-Justice Judicial Expert System",
    description: "An AI legal research assistant deployed to map previous Ghanaian high-court rulings, categorizing arguments to expedite case backlogs for public defense.",
    category: "Expert Systems",
    sector: "Justice",
    stage: "Concept",
    status: "Active",
    startDate: "2025-05-01",
    endDate: "2028-05-01",
    expectedCompletionDate: "2028-04-30",
    latitude: 5.5501,
    longitude: -0.1945, // Accra High Court Area
    mda: "Ministry of Justice & Attorney General (MoJ)",
    mdaCode: "MoJ",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 5000000,
      disbursed: 500000,
      utilized: 450000,
      remaining: 4550000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 50,
      transparency: 45,
      accountability: 60,
      privacy: 85,
      security: 70,
      overallGrade: "Moderate"
    },
    readinessScore: 45,
    milestones: [
      { id: "m4-1", title: "Archive digitisation pilot", dueDate: "2025-10-15", progressPercent: 100, status: "Completed" },
      { id: "m4-2", title: "Ethical blueprint approval by Judicial Council", dueDate: "2026-03-01", progressPercent: 40, status: "Delayed" },
      { id: "m4-3", title: "System prototype demo", dueDate: "2027-02-15", progressPercent: 0, status: "Pending" }
    ],
    risks: [
      {
        id: "r4-1",
        category: "Legal",
        severity: "Critical",
        likelihood: 4,
        impact: 5,
        description: "Model hallucinations generating non-existent legal case precedents.",
        mitigationPlan: "Implement retrieval-augmented generation (RAG) locked specifically to a verified PDF corpus of Supreme Court Gazette books.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-5",
    projectCode: "GN-AI-2026-005",
    name: "GRA National Tax Fraud Detection Engine",
    description: "An automated transactional auditor scanning corporate returns, utilizing predictive analytics to flag tax-evasion risks and automated shell-company matching.",
    category: "Predictive Analytics",
    sector: "Finance",
    stage: "Planning",
    status: "Delayed",
    startDate: "2024-11-01",
    endDate: "2026-11-01",
    expectedCompletionDate: "2027-03-01",
    latitude: 5.6200,
    longitude: -0.1700, // GRA head office
    mda: "Ghana Revenue Authority (GRA)",
    mdaCode: "GRA",
    region: "Greater Accra",
    district: "La Dade-Kotopon",
    budget: {
      totalAllocated: 3900000,
      disbursed: 1500000,
      utilized: 1500000,
      remaining: 2400000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 72,
      transparency: 65,
      accountability: 80,
      privacy: 92,
      security: 90,
      overallGrade: "Good"
    },
    readinessScore: 78,
    milestones: [
      { id: "m5-1", title: "Financial API connector setup", dueDate: "2025-03-10", progressPercent: 100, status: "Completed" },
      { id: "m5-2", title: "Model accuracy benchmark verification", dueDate: "2025-10-15", progressPercent: 30, status: "Delayed" },
      { id: "m5-3", title: "National deployment integration", dueDate: "2026-11-01", progressPercent: 0, status: "Pending" }
    ],
    risks: [
      {
        id: "r5-1",
        category: "Financial",
        severity: "High",
        likelihood: 3,
        impact: 4,
        description: "Incorrect classification (false positives) auditing law-abiding SME businesses leading to public friction.",
        mitigationPlan: "Configure the engine to trigger advisory review requests rather than direct asset freezing holds.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-5-1", fileName: "GRA_TaxEngine_SecurityProtocol_v1.pdf", fileType: "pdf", uploadedAt: "2025-01-20", version: 1, signedBy: ["GRA Commissioner General"] }
    ]
  },
  {
    id: "proj-6",
    projectCode: "GN-AI-2026-006",
    name: "Galamsey Watch CV Satellite",
    description: "An automated satellite computer vision scanning grid tracking canopy depletion and water contamination to monitor and prosecute illegal mining (Galamsey) sites.",
    category: "Computer Vision",
    sector: "Environment",
    stage: "Development",
    status: "Active",
    startDate: "2024-08-01",
    endDate: "2026-08-01",
    expectedCompletionDate: "2026-08-01",
    latitude: 6.2201,
    longitude: -2.1245, // Dunkwa-on-Offin illegal mining corridor
    mda: "Environmental Protection Agency (EPA)",
    mdaCode: "EPA",
    region: "Central",
    district: "Upper Denkyira East",
    budget: {
      totalAllocated: 5800000,
      disbursed: 4200000,
      utilized: 3900000,
      remaining: 1900000,
      primaryFundingSource: "Donors",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 90,
      accountability: 95,
      privacy: 98,
      security: 92,
      overallGrade: "Excellent"
    },
    readinessScore: 80,
    milestones: [
      { id: "m6-1", title: "Map out historical mine targets", dueDate: "2024-11-20", progressPercent: 100, status: "Completed" },
      { id: "m6-2", title: "Train satellite CNN change detection", dueDate: "2025-07-15", progressPercent: 100, status: "Completed" },
      { id: "m6-3", title: "Security service alerts interface link", dueDate: "2026-07-01", progressPercent: 65, status: "Pending" }
    ],
    risks: [
      {
        id: "r6-1",
        category: "Cybersecurity",
        severity: "High",
        likelihood: 2,
        impact: 4,
        description: "Alert intercepts allowing miners to escape enforcement sweeps.",
        mitigationPlan: "Use AES-GCM encrypted alert notifications dispatched solely to secure defense terminals.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-6-1", fileName: "EPA_GalamseyWatch_ExecutiveConsent.pdf", fileType: "pdf", uploadedAt: "2024-09-02", version: 1, signedBy: ["Minister of Lands and Natural Resources"] }
    ]
  },
  {
    id: "proj-7",
    projectCode: "GN-AI-2026-007",
    name: "Ghana National AI Strategy (2025–2035)",
    description: "Ten-year national roadmap to build a responsible, human-centred AI ecosystem reflecting Ghanaian values, ethics, languages, and realities.",
    category: "Expert Systems",
    sector: "Local Government",
    stage: "Planning",
    status: "Active",
    startDate: "2025-01-01",
    endDate: "2035-12-31",
    expectedCompletionDate: "2035-12-31",
    latitude: 5.5501,
    longitude: -0.1945,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 5000000000,
      disbursed: 100000000,
      utilized: 4500000,
      remaining: 4900000000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 95,
      transparency: 95,
      accountability: 95,
      privacy: 95,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 90,
    milestones: [
      { id: "m7-1", title: "Strategy policy launch", dueDate: "2025-03-01", progressPercent: 100, status: "Completed" },
      { id: "m7-2", title: "First annual policy review", dueDate: "2026-06-01", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r7-1",
        category: "Legal",
        severity: "Low",
        likelihood: 1,
        impact: 2,
        description: "Aligning international directives with local traditional community rules.",
        mitigationPlan: "Organize continuous civil and tribal council review assemblies.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-8",
    projectCode: "GN-AI-2026-008",
    name: "National AI Fund",
    description: "Capitalized funding stream drawn from mining and oil royalties to support AI development and startup ecosystems.",
    category: "Predictive Analytics",
    sector: "Finance",
    stage: "Planning",
    status: "Active",
    startDate: "2025-06-01",
    endDate: "2030-06-01",
    expectedCompletionDate: "2030-06-01",
    latitude: 5.5501,
    longitude: -0.1945,
    mda: "Ministry of Finance (MoF)",
    mdaCode: "MoF",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 5000000000,
      disbursed: 500000000,
      utilized: 12000000,
      remaining: 4500000000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 95,
      accountability: 90,
      privacy: 90,
      security: 90,
      overallGrade: "Excellent"
    },
    readinessScore: 85,
    milestones: [
      { id: "m8-1", title: "Establish fund criteria and guidelines", dueDate: "2025-10-01", progressPercent: 100, status: "Completed" },
      { id: "m8-2", title: "Disburse first cohort of startup grants", dueDate: "2026-04-15", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r8-1",
        category: "Financial",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "Delayed fund disbursement due to multi-ministry approval loops.",
        mitigationPlan: "Configure an automated workflow inside the registry system to expedite reviews.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-9",
    projectCode: "GN-AI-2026-009",
    name: "AI Computing Centre",
    description: "A world-class high-performance compute cluster to drive AI research and enterprise applications for Ghana and Africa.",
    category: "Machine Learning",
    sector: "Education",
    stage: "Concept",
    status: "Active",
    startDate: "2025-08-01",
    endDate: "2027-12-31",
    expectedCompletionDate: "2027-12-31",
    latitude: 6.6922,
    longitude: -1.6163,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    budget: {
      totalAllocated: 3750000000,
      disbursed: 200000000,
      utilized: 5000000,
      remaining: 3550000000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 88,
      transparency: 80,
      accountability: 85,
      privacy: 95,
      security: 98,
      overallGrade: "Excellent"
    },
    readinessScore: 80,
    milestones: [
      { id: "m9-1", title: "Feasibility study & site allocation", dueDate: "2025-12-15", progressPercent: 100, status: "Completed" },
      { id: "m9-2", title: "Procure GPU server hardware arrays", dueDate: "2026-09-01", progressPercent: 20, status: "Pending" }
    ],
    risks: [
      {
        id: "r9-1",
        category: "Cybersecurity",
        severity: "High",
        likelihood: 1,
        impact: 4,
        description: "Vulnerability of centralized computing power to state-sponsored hack campaigns.",
        mitigationPlan: "Deploy state-of-the-art secure gateway configurations and regular pen testing.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-10",
    projectCode: "GN-AI-2026-010",
    name: "One Million Coders Programme (OMCP)",
    description: "National training initiative equipping one million Ghanaians across all 16 regions with digital, coding, AI, and cybersecurity skills.",
    category: "Machine Learning",
    sector: "Education",
    stage: "Deployment",
    status: "Active",
    startDate: "2025-04-16",
    endDate: "2028-12-31",
    expectedCompletionDate: "2028-12-31",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 150000000,
      disbursed: 80000000,
      utilized: 7200000,
      remaining: 78000000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 95,
      transparency: 90,
      accountability: 90,
      privacy: 85,
      security: 85,
      overallGrade: "Excellent"
    },
    readinessScore: 82,
    milestones: [
      { id: "m10-1", title: "Launch 130 learning center hubs", dueDate: "2025-10-30", progressPercent: 100, status: "Completed" },
      { id: "m10-2", title: "Begin Phase 2 national rollout", dueDate: "2026-04-01", progressPercent: 100, status: "Completed" },
      { id: "m10-3", title: "Train first cohort of 250k coders", dueDate: "2026-12-15", progressPercent: 45, status: "Pending" }
    ],
    risks: [
      {
        id: "r10-1",
        category: "Operational",
        severity: "Medium",
        likelihood: 3,
        impact: 3,
        description: "Power instability in remote learning centers halting live laboratory training classes.",
        mitigationPlan: "Partner with local solar energy suppliers to provide off-grid hybrid power systems.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-11",
    projectCode: "GN-AI-2026-011",
    name: "Emerging Technologies Bill",
    description: "Regulatory legislation formulating standards, data protection benchmarks, and accountability systems for AI, blockchain, and robotics.",
    category: "Expert Systems",
    sector: "Justice",
    stage: "Planning",
    status: "Active",
    startDate: "2025-05-01",
    endDate: "2027-05-01",
    expectedCompletionDate: "2026-11-30",
    latitude: 5.5501,
    longitude: -0.1945,
    mda: "Ministry of Justice & Attorney General (MoJ)",
    mdaCode: "MoJ",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 5000000,
      disbursed: 2000000,
      utilized: 150000,
      remaining: 3500000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 98,
      accountability: 95,
      privacy: 98,
      security: 90,
      overallGrade: "Excellent"
    },
    readinessScore: 75,
    milestones: [
      { id: "m11-1", title: "Draft legal blueprint and research templates", dueDate: "2025-11-01", progressPercent: 100, status: "Completed" },
      { id: "m11-2", title: "Public legislative consultation hearings", dueDate: "2026-05-20", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r11-1",
        category: "Legal",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Protracted debate in parliament delaying final enactment of technology safety rules.",
        mitigationPlan: "Supply detailed comparative reports to subcommittees detailing global AI acts.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-12",
    projectCode: "GN-AI-2026-012",
    name: "Responsible AI Authority",
    description: "Proposed sovereign oversight authority established to audit algorithmic fairness and regulate data processing frameworks across Ghana.",
    category: "Predictive Analytics",
    sector: "Local Government",
    stage: "Concept",
    status: "Active",
    startDate: "2025-10-01",
    endDate: "2026-10-01",
    expectedCompletionDate: "2026-09-30",
    latitude: 5.5501,
    longitude: -0.1945,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 15000000,
      disbursed: 3000000,
      utilized: 120000,
      remaining: 13800000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 95,
      transparency: 95,
      accountability: 98,
      privacy: 95,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 88,
    milestones: [
      { id: "m12-1", title: "Benchmark structure against Singapore AI model", dueDate: "2026-02-10", progressPercent: 100, status: "Completed" },
      { id: "m12-2", title: "Appoint administrative council members", dueDate: "2026-08-01", progressPercent: 10, status: "Pending" }
    ],
    risks: [
      {
        id: "r12-1",
        category: "Operational",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "Overlapping regulatory oversight boundaries with the Data Protection Commission.",
        mitigationPlan: "Draft a clear inter-agency Memorandum of Understanding mapping role spheres.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-13",
    projectCode: "GN-AI-2026-013",
    name: "WHO-UNDP AI Health Programme",
    description: "A collaborative project harnessing AI and digital tools to enhance clinical diagnosis, manage remote epidemics, and upskill health workers.",
    category: "Machine Learning",
    sector: "Health",
    stage: "Development",
    status: "Active",
    startDate: "2025-02-15",
    endDate: "2027-02-15",
    expectedCompletionDate: "2027-02-15",
    latitude: 9.4075,
    longitude: -0.8533,
    mda: "Ministry of Health (MoH)",
    mdaCode: "MoH",
    region: "Northern",
    district: "Tamale Metropolitan",
    budget: {
      totalAllocated: 30000000,
      disbursed: 15000000,
      utilized: 120000,
      remaining: 18000000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 85,
      accountability: 85,
      privacy: 92,
      security: 88,
      overallGrade: "Excellent"
    },
    readinessScore: 78,
    milestones: [
      { id: "m13-1", title: "Data privacy frameworks design completed", dueDate: "2025-07-15", progressPercent: 100, status: "Completed" },
      { id: "m13-2", title: "Roll out health diagnostic tablets in Tamale", dueDate: "2026-05-10", progressPercent: 100, status: "Completed" },
      { id: "m13-3", title: "Launch rural healthcare training clinics", dueDate: "2026-11-20", progressPercent: 30, status: "Pending" }
    ],
    risks: [
      {
        id: "r13-1",
        category: "Ethical",
        severity: "High",
        likelihood: 2,
        impact: 4,
        description: "Misdiagnosis caused by model dataset gaps in rural disease variations.",
        mitigationPlan: "Retrain models locally using diversified regional clinic cases.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-14",
    projectCode: "GN-AI-2026-014",
    name: "AiCARE Diagnostic Assistant",
    description: "Clinical diagnostic assistant tool using deep neural networks to speed up radiographic analyses for rural health centers.",
    category: "Machine Learning",
    sector: "Health",
    stage: "Pilot",
    status: "Active",
    startDate: "2025-01-10",
    endDate: "2026-12-20",
    expectedCompletionDate: "2026-12-20",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Health (MoH)",
    mdaCode: "MoH",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 12000000,
      disbursed: 6000000,
      utilized: 550000,
      remaining: 6500000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 82,
      transparency: 80,
      accountability: 88,
      privacy: 90,
      security: 85,
      overallGrade: "Good"
    },
    readinessScore: 72,
    milestones: [
      { id: "m14-1", title: "Approve ethical review metrics", dueDate: "2025-06-01", progressPercent: 100, status: "Completed" },
      { id: "m14-2", title: "Deploy initial diagnostic pilot in Accra", dueDate: "2026-02-15", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r14-1",
        category: "Technical",
        severity: "Medium",
        likelihood: 3,
        impact: 3,
        description: "High network latency when querying large radiology images.",
        mitigationPlan: "Configure edge servers inside clinic clusters.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-15",
    projectCode: "GN-AI-2026-015",
    name: "BawaHealth Predictive Suite",
    description: "Startup platform using ML to forecast patient pharmaceutical demand and prevent critical medicine out-of-stock events.",
    category: "Generative AI",
    sector: "Health",
    stage: "Development",
    status: "Active",
    startDate: "2025-03-01",
    endDate: "2027-03-01",
    expectedCompletionDate: "2027-03-01",
    latitude: 6.6922,
    longitude: -1.6163,
    mda: "Ministry of Health (MoH)",
    mdaCode: "MoH",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    budget: {
      totalAllocated: 8500000,
      disbursed: 3000000,
      utilized: 250000,
      remaining: 6000000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 80,
      transparency: 75,
      accountability: 80,
      privacy: 92,
      security: 82,
      overallGrade: "Good"
    },
    readinessScore: 68,
    milestones: [
      { id: "m15-1", title: "Database linkages with 4 regional clinics", dueDate: "2025-10-15", progressPercent: 100, status: "Completed" },
      { id: "m15-2", title: "Model accuracy benchmark verification", dueDate: "2026-08-01", progressPercent: 40, status: "Pending" }
    ],
    risks: [
      {
        id: "r15-1",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Inconsistent log entries from rural pharmacy networks.",
        mitigationPlan: "Deploy structured offline database synchronizers.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-16",
    projectCode: "GN-AI-2026-016",
    name: "Sesi Technologies Crop Disease Detector",
    description: "Mobile computer vision app detecting cocoa and crop infections instantly to minimize harvest loss across rural farms.",
    category: "Predictive Analytics",
    sector: "Agriculture",
    stage: "Operational",
    status: "Active",
    startDate: "2024-03-01",
    endDate: "2026-12-01",
    expectedCompletionDate: "2026-11-30",
    latitude: 6.2041,
    longitude: -1.7583,
    mda: "Ministry of Food & Agriculture (MoFA)",
    mdaCode: "MoFA",
    region: "Western North",
    district: "Sefwi Wiawso",
    budget: {
      totalAllocated: 18000000,
      disbursed: 18000000,
      utilized: 1720000,
      remaining: 800000,
      primaryFundingSource: "Research Grants",
      currency: "GHS"
    },
    compliance: {
      fairness: 92,
      transparency: 90,
      accountability: 88,
      privacy: 85,
      security: 85,
      overallGrade: "Excellent"
    },
    readinessScore: 84,
    milestones: [
      { id: "m16-1", title: "Deploy initial crop training models", dueDate: "2024-09-01", progressPercent: 100, status: "Completed" },
      { id: "m16-2", title: "Scale to 10k rural farmers across region", dueDate: "2025-11-15", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r16-1",
        category: "Technical",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Low resolution camera captures causing model errors.",
        mitigationPlan: "Add an adaptive preprocessing image-sharpening model component.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-17",
    projectCode: "GN-AI-2026-017",
    name: "Oze SME Financial Management Engine",
    description: "Startup platform using ML algorithms to predict SME cash flows and automate inventory bookkeeping processes.",
    category: "Predictive Analytics",
    sector: "Finance",
    stage: "Operational",
    status: "Active",
    startDate: "2024-05-10",
    endDate: "2026-12-31",
    expectedCompletionDate: "2026-12-31",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Bank of Ghana (BoG)",
    mdaCode: "BoG",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 25000000,
      disbursed: 25000000,
      utilized: 2400000,
      remaining: 1000000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 88,
      transparency: 82,
      accountability: 85,
      privacy: 95,
      security: 92,
      overallGrade: "Excellent"
    },
    readinessScore: 80,
    milestones: [
      { id: "m17-1", title: "Platform sandbox audit", dueDate: "2024-12-15", progressPercent: 100, status: "Completed" },
      { id: "m17-2", title: "Connect corporate transaction APIs", dueDate: "2025-08-20", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r17-1",
        category: "Cybersecurity",
        severity: "High",
        likelihood: 1,
        impact: 4,
        description: "Interception of financial data payloads.",
        mitigationPlan: "Enforce TLS 1.3 protocol encryption.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-18",
    projectCode: "GN-AI-2026-018",
    name: "KudiGO SME Automation",
    description: "AI-based platform automating sales reporting and inventory prediction routines for local retail stores.",
    category: "Predictive Analytics",
    sector: "Finance",
    stage: "Operational",
    status: "Active",
    startDate: "2024-09-01",
    endDate: "2026-09-01",
    expectedCompletionDate: "2026-09-01",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Bank of Ghana (BoG)",
    mdaCode: "BoG",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 14000000,
      disbursed: 14000000,
      utilized: 1350000,
      remaining: 500000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 80,
      accountability: 80,
      privacy: 90,
      security: 88,
      overallGrade: "Good"
    },
    readinessScore: 78,
    milestones: [
      { id: "m18-1", title: "Integrate mobile money payment nodes", dueDate: "2025-02-10", progressPercent: 100, status: "Completed" },
      { id: "m18-2", title: "Add sales predictive algorithm dashboard", dueDate: "2025-10-30", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r18-1",
        category: "Financial",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "High merchant transaction charges impacting startup profitability.",
        mitigationPlan: "Negotiate customized transaction rates with telecoms.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-19",
    projectCode: "GN-AI-2026-019",
    name: "AI Credit Scoring & Fraud Detection",
    description: "Leverages mobile money transaction patterns and machine learning to build alternative credit ratings for unbanked populations.",
    category: "Machine Learning",
    sector: "Finance",
    stage: "Pilot",
    status: "Active",
    startDate: "2025-02-01",
    endDate: "2026-12-31",
    expectedCompletionDate: "2026-12-31",
    latitude: 6.6922,
    longitude: -1.6163,
    mda: "Bank of Ghana (BoG)",
    mdaCode: "BoG",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    budget: {
      totalAllocated: 45000000,
      disbursed: 20000000,
      utilized: 1850000,
      remaining: 26500000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 72,
      transparency: 70,
      accountability: 80,
      privacy: 95,
      security: 95,
      overallGrade: "Good"
    },
    readinessScore: 85,
    milestones: [
      { id: "m19-1", title: "Design mobile money scoring models", dueDate: "2025-09-15", progressPercent: 100, status: "Completed" },
      { id: "m19-2", title: "Begin pilot run with selected microfinance systems", dueDate: "2026-05-01", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r19-1",
        category: "Ethical",
        severity: "High",
        likelihood: 3,
        impact: 4,
        description: "Algorithmic bias denying loans to informal traders lacking structured receipts.",
        mitigationPlan: "Incorporate informal guarantor records inside alternative validation weights.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-20",
    projectCode: "GN-AI-2026-020",
    name: "Regulon Compliance Platform",
    description: "AI-powered client onboarding and regulatory risk assessor helping local firms audit data compliance checks.",
    category: "Expert Systems",
    sector: "Finance",
    stage: "Pilot",
    status: "Active",
    startDate: "2025-05-15",
    endDate: "2026-12-15",
    expectedCompletionDate: "2026-12-15",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "National Communications Authority (NCA)",
    mdaCode: "NCA",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 9000000,
      disbursed: 4500000,
      utilized: 4000000,
      remaining: 5000000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 90,
      accountability: 90,
      privacy: 95,
      security: 90,
      overallGrade: "Excellent"
    },
    readinessScore: 78,
    milestones: [
      { id: "m20-1", title: "Formulate regulatory audit rule engine", dueDate: "2025-11-20", progressPercent: 100, status: "Completed" },
      { id: "m20-2", title: "Cohort launch in Google Startups Accelerator", dueDate: "2026-04-10", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r20-1",
        category: "Technical",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "Varying document standards across African ministries causing model failures.",
        mitigationPlan: "Train classification models on historical regulatory files.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-21",
    projectCode: "GN-AI-2026-021",
    name: "Khaya AI / Ghana NLP",
    description: "Multilingual translation system supporting low-resource Ghanaian languages to facilitate government and commercial accessibility.",
    category: "Natural Language Processing",
    sector: "Education",
    stage: "Operational",
    status: "Active",
    startDate: "2023-08-01",
    endDate: "2026-08-01",
    expectedCompletionDate: "2026-08-01",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 10000000,
      disbursed: 10000000,
      utilized: 9800000,
      remaining: 200000,
      primaryFundingSource: "Research Grants",
      currency: "GHS"
    },
    compliance: {
      fairness: 95,
      transparency: 92,
      accountability: 90,
      privacy: 88,
      security: 85,
      overallGrade: "Excellent"
    },
    readinessScore: 82,
    milestones: [
      { id: "m21-1", title: "Build translation corpora for Twi, Fante, Ga", dueDate: "2024-05-15", progressPercent: 100, status: "Completed" },
      { id: "m21-2", title: "Integrate speech API into government portal", dueDate: "2025-10-01", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r21-1",
        category: "Technical",
        severity: "Low",
        likelihood: 3,
        impact: 2,
        description: "Grammar translation inaccuracies in complex legal terms.",
        mitigationPlan: "Configure human validation verification panels.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-22",
    projectCode: "GN-AI-2026-022",
    name: "Ghana Code Club",
    description: "Foundational digital and machine learning program offering coding classes to schools to bolster digital literacy.",
    category: "Machine Learning",
    sector: "Education",
    stage: "Operational",
    status: "Active",
    startDate: "2023-01-10",
    endDate: "2026-12-31",
    expectedCompletionDate: "2026-12-31",
    latitude: 5.5560,
    longitude: -2.2229,
    mda: "Ministry of Education (MoE)",
    mdaCode: "MoE",
    region: "Western",
    district: "Tarkwa Nsuaem",
    budget: {
      totalAllocated: 5500000,
      disbursed: 5500000,
      utilized: 5200000,
      remaining: 300000,
      primaryFundingSource: "Donors",
      currency: "GHS"
    },
    compliance: {
      fairness: 92,
      transparency: 85,
      accountability: 85,
      privacy: 90,
      security: 80,
      overallGrade: "Excellent"
    },
    readinessScore: 78,
    milestones: [
      { id: "m22-1", title: "Curriculum creation & teacher guidelines", dueDate: "2023-06-01", progressPercent: 100, status: "Completed" },
      { id: "m22-2", title: "Establish local hubs in 20 western schools", dueDate: "2025-03-15", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r22-1",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Insufficient computer systems inside rural hubs.",
        mitigationPlan: "Partner with international hardware donation registries.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-23",
    projectCode: "GN-AI-2026-023",
    name: "DOBIISON Immersive Learning",
    description: "STEM focused software training tool utilizing immersive interactive models and basic ML tutors to explain difficult science projects.",
    category: "Smart Cities",
    sector: "Education",
    stage: "Development",
    status: "Active",
    startDate: "2025-05-10",
    endDate: "2027-05-10",
    expectedCompletionDate: "2027-05-10",
    latitude: 6.5781,
    longitude: 0.4504,
    mda: "Ministry of Education (MoE)",
    mdaCode: "MoE",
    region: "Volta",
    district: "Ho Metropolitan",
    budget: {
      totalAllocated: 3200000,
      disbursed: 1000000,
      utilized: 800000,
      remaining: 2400000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 80,
      accountability: 80,
      privacy: 85,
      security: 78,
      overallGrade: "Good"
    },
    readinessScore: 70,
    milestones: [
      { id: "m23-1", title: "Prototype STEM animation module design", dueDate: "2025-12-01", progressPercent: 100, status: "Completed" },
      { id: "m23-2", title: "Beta testing with 5 local schools", dueDate: "2026-09-15", progressPercent: 15, status: "Pending" }
    ],
    risks: [
      {
        id: "r23-1",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Lack of digital skills in local class instructors.",
        mitigationPlan: "Provide training guidelines and digital support videos.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-24",
    projectCode: "GN-AI-2026-024",
    name: "Literacy For Life Suite",
    description: "Educational voice translator and digital notebook targeting low literacy levels inside remote assemblies.",
    category: "Natural Language Processing",
    sector: "Education",
    stage: "Pilot",
    status: "Active",
    startDate: "2025-04-01",
    endDate: "2026-12-15",
    expectedCompletionDate: "2026-12-15",
    latitude: 9.4075,
    longitude: -0.8533,
    mda: "Ministry of Education (MoE)",
    mdaCode: "MoE",
    region: "Northern",
    district: "Tamale Metropolitan",
    budget: {
      totalAllocated: 2800000,
      disbursed: 1500000,
      utilized: 1300000,
      remaining: 1500000,
      primaryFundingSource: "Donors",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 85,
      accountability: 82,
      privacy: 88,
      security: 80,
      overallGrade: "Excellent"
    },
    readinessScore: 74,
    milestones: [
      { id: "m24-1", title: "Create voice assets for local northern dialects", dueDate: "2025-10-10", progressPercent: 100, status: "Completed" },
      { id: "m24-2", title: "Distribute initial tablets to local libraries", dueDate: "2026-05-20", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r24-1",
        category: "Operational",
        severity: "Low",
        likelihood: 3,
        impact: 2,
        description: "Frequent battery replacement requirements inside dry areas.",
        mitigationPlan: "Deploy rugged models equipped with high-capacity rechargeable cells.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-25",
    projectCode: "GN-AI-2026-025",
    name: "DataNexus AI Analytics Engine",
    description: "Aggregated machine learning services providing transactional data metrics and fraud checks to local organizations.",
    category: "Predictive Analytics",
    sector: "Finance",
    stage: "Operational",
    status: "Active",
    startDate: "2024-02-15",
    endDate: "2026-08-15",
    expectedCompletionDate: "2026-08-15",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Data Protection Commission (DPC)",
    mdaCode: "DPC",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 7500000,
      disbursed: 7500000,
      utilized: 7400000,
      remaining: 100000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 88,
      accountability: 85,
      privacy: 95,
      security: 90,
      overallGrade: "Excellent"
    },
    readinessScore: 80,
    milestones: [
      { id: "m25-1", title: "Formulate REST APIs interface", dueDate: "2024-10-30", progressPercent: 100, status: "Completed" },
      { id: "m25-2", title: "Complete compliance audit with DPC", dueDate: "2025-06-15", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r25-1",
        category: "Cybersecurity",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "Insecure external endpoint integrations.",
        mitigationPlan: "Implement strictly bound OAuth2 connection models.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-26",
    projectCode: "GN-AI-2026-026",
    name: "Bloop Global Analytics Hub",
    description: "Startup platform using ML to resolve client analytics pipelines and trace cross-regional supply chains.",
    category: "Machine Learning",
    sector: "Finance",
    stage: "Pilot",
    status: "Active",
    startDate: "2025-06-01",
    endDate: "2026-12-01",
    expectedCompletionDate: "2026-12-01",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Data Protection Commission (DPC)",
    mdaCode: "DPC",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 4000000,
      disbursed: 2000000,
      utilized: 1800000,
      remaining: 2200000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 80,
      transparency: 78,
      accountability: 82,
      privacy: 90,
      security: 82,
      overallGrade: "Good"
    },
    readinessScore: 72,
    milestones: [
      { id: "m26-1", title: "Sandbox database design setup", dueDate: "2025-11-15", progressPercent: 100, status: "Completed" },
      { id: "m26-2", title: "Conduct pilot metrics integration check", dueDate: "2026-08-10", progressPercent: 10, status: "Pending" }
    ],
    risks: [
      {
        id: "r26-1",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Delayed data loading sequences from external endpoints.",
        mitigationPlan: "Configure Redis caching system for endpoints.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-27",
    projectCode: "GN-AI-2026-027",
    name: "SoftTribe Customer Support chatbot",
    description: "Voice-enabled chatbot utilizing advanced NLP model cards to resolve client service issues dynamically.",
    category: "Natural Language Processing",
    sector: "Local Government",
    stage: "Operational",
    status: "Active",
    startDate: "2024-06-15",
    endDate: "2026-06-15",
    expectedCompletionDate: "2026-06-15",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Data Protection Commission (DPC)",
    mdaCode: "DPC",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 6500000,
      disbursed: 6500000,
      utilized: 6450000,
      remaining: 50000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 88,
      transparency: 85,
      accountability: 85,
      privacy: 92,
      security: 88,
      overallGrade: "Excellent"
    },
    readinessScore: 82,
    milestones: [
      { id: "m27-1", title: "Assemble multi-language speech training logs", dueDate: "2024-11-20", progressPercent: 100, status: "Completed" },
      { id: "m27-2", title: "Go live on national utility gateway", dueDate: "2025-07-01", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r27-1",
        category: "Technical",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Misinterpreting user expressions during dialect shifts.",
        mitigationPlan: "Configure a human-fallback helpdesk link.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-28",
    projectCode: "GN-AI-2026-028",
    name: "MTN Ghana – Ministry of Communications MoU",
    description: "Public-Private Partnership program targeting fast-tracked digital network expansion and coordinated computational infrastructure deployment.",
    category: "Smart Cities",
    sector: "Local Government",
    stage: "Planning",
    status: "Active",
    startDate: "2025-03-01",
    endDate: "2026-03-01",
    expectedCompletionDate: "2026-08-31",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 50000000,
      disbursed: 10000000,
      utilized: 4500000,
      remaining: 40000000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 88,
      accountability: 90,
      privacy: 95,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 84,
    milestones: [
      { id: "m28-1", title: "Sign formal cooperation agreement at MWC", dueDate: "2025-03-05", progressPercent: 100, status: "Completed" },
      { id: "m28-2", title: "Launch joint digital infrastructure design", dueDate: "2026-07-15", progressPercent: 30, status: "Pending" }
    ],
    risks: [
      {
        id: "r28-1",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Slow coordination of dataset sharing clearances.",
        mitigationPlan: "Appoint dedicated integration steering committee.",
        status: "Open"
      }
    ],
    documents: []
  },
  {
    id: "proj-29",
    projectCode: "GN-AI-2026-029",
    name: "UNESCO & British High Commission Collaboration",
    description: "Study tour and collaborative research benchmarking national AI policy formulations against international regulatory architectures.",
    category: "Expert Systems",
    sector: "Local Government",
    stage: "Completed",
    status: "Completed",
    startDate: "2025-01-10",
    endDate: "2025-10-10",
    expectedCompletionDate: "2025-09-30",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 2000000,
      disbursed: 2000000,
      utilized: 1950000,
      remaining: 50000,
      primaryFundingSource: "Donors",
      currency: "GHS"
    },
    compliance: {
      fairness: 95,
      transparency: 98,
      accountability: 95,
      privacy: 95,
      security: 92,
      overallGrade: "Excellent"
    },
    readinessScore: 90,
    milestones: [
      { id: "m29-1", title: "United Kingdom AI regulatory study tour", dueDate: "2025-09-15", progressPercent: 100, status: "Completed" },
      { id: "m29-2", title: "Publish comparative benchmarking documentation", dueDate: "2025-10-01", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r29-1",
        category: "Legal",
        severity: "Low",
        likelihood: 1,
        impact: 1,
        description: "Discrepancies in UK vs West African legal paradigms.",
        mitigationPlan: "Incorporate local legal experts during review mapping.",
        status: "Mitigated"
      }
    ],
    documents: []
  },
  {
    id: "proj-30",
    projectCode: "GN-AI-2026-030",
    name: "IMF / World Bank / AfDB AI Funding Collaboration",
    description: "Multilateral partnership targeting funding, technical help, and compliance scaling for regional computational systems.",
    category: "Predictive Analytics",
    sector: "Local Government",
    stage: "Planning",
    status: "Active",
    startDate: "2025-09-01",
    endDate: "2028-09-01",
    expectedCompletionDate: "2028-09-01",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MoCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 350000000,
      disbursed: 50000000,
      utilized: 10000000,
      remaining: 300000000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 90,
      accountability: 95,
      privacy: 92,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 86,
    milestones: [
      { id: "m30-1", title: "Approve multilateral support guidelines", dueDate: "2025-12-10", progressPercent: 100, status: "Completed" },
      { id: "m30-2", title: "Distribute initial regional tech endowment funds", dueDate: "2026-07-01", progressPercent: 25, status: "Pending" }
    ],
    risks: [
      {
        id: "r30-1",
        category: "Financial",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "Fluctuating exchange rates impacting domestic GHS purchasing power.",
        mitigationPlan: "Configure currency buffer margins in project accounts.",
        status: "Open"
      }
    ],
    documents: []
  }
];


export const ghanaRegions = [
  { name: "Greater Accra", center: [5.6037, -0.1870], projectCount: 18, description: "Capital administrative hub, hosting National AI Strategy, OMCP, AI Fund, E-Justice, and GRA Fraud Engine." },
  { name: "Ashanti", center: [6.6922, -1.6163], projectCount: 4, description: "Hosting Twi Medical NLP translation systems, AI Computing Centre, and BawaHealth in Kumasi." },
  { name: "Eastern", center: [6.2958, 0.0594], projectCount: 1, description: "Hosting Akosombo Dam Hydrological flood control predictive systems." },
  { name: "Western North", center: [6.2041, -1.7583], projectCount: 2, description: "Hosting COCOBOD Agriculture disease scanning and Sesi Technologies Agritech." },
  { name: "Central", center: [6.2201, -2.1245], projectCount: 1, description: "Hosting Environmental Protection Agency CV Galamsey watchers." },
  { name: "Northern", center: [9.4075, -0.8533], projectCount: 2, description: "Hosting WHO-UNDP AI Health Programme and Literacy For Life Suite in Tamale." },
  { name: "Western", center: [5.5560, -2.2229], projectCount: 1, description: "Hosting Ghana Code Club foundational digital literacy hubs." },
  { name: "Volta", center: [6.5781, 0.4504], projectCount: 1, description: "Hosting DOBIISON STEM immersive learning frameworks in Ho." }
];

