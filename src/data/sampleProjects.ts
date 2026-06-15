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
  }
];

export const ghanaRegions = [
  { name: "Greater Accra", center: [5.6037, -0.1870], projectCount: 2, description: "Capital administrative hub, hosting E-Justice Judicial System and GRA Fraud Engine." },
  { name: "Ashanti", center: [6.6922, -1.6163], projectCount: 1, description: "Hosting Twi Medical NLP translation systems in Kumasi." },
  { name: "Eastern", center: [6.2958, 0.0594], projectCount: 1, description: "Hosting Akosombo Dam Hydrological flood control predictive systems." },
  { name: "Western North", center: [6.2041, -1.7583], projectCount: 1, description: "Hosting COCOBOD Agriculture disease scanning and yield predictors." },
  { name: "Central", center: [6.2201, -2.1245], projectCount: 1, description: "Hosting Environmental Protection Agency CV Galamsey watchers." }
];
