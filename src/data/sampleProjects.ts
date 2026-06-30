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
    name: "GhanaPostGPS (National Digital Addressing System)",
    description: "A national geospatial database assigning a unique digital address to every 5x5 meter square in Ghana. Integrates satellite positioning and automatic routing to aid emergency response, logistics, and address verification.",
    category: "Smart Cities",
    sector: "Local Government",
    stage: "Operational",
    status: "Active",
    startDate: "2017-10-18",
    endDate: "2028-12-31",
    expectedCompletionDate: "2028-12-31",
    latitude: 5.6037,
    longitude: -0.1870,
    mda: "Ministry of Communications and Digitalisation (MoCD)",
    mdaCode: "MOCD",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 24000000,
      disbursed: 22000000,
      utilized: 21500000,
      remaining: 2500000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 80,
      transparency: 75,
      accountability: 85,
      privacy: 80,
      security: 90,
      overallGrade: "Good"
    },
    readinessScore: 85,
    milestones: [
      { id: "m1-1", title: "National postal database launch", dueDate: "2018-05-01", progressPercent: 100, status: "Completed" },
      { id: "m1-2", title: "Emergency services dispatch sync", dueDate: "2020-11-12", progressPercent: 100, status: "Completed" },
      { id: "m1-3", title: "Offline digital map data caching integration", dueDate: "2026-10-15", progressPercent: 40, status: "Pending" }
    ],
    risks: [
      {
        id: "r1-1",
        category: "Technical",
        severity: "Medium",
        likelihood: 2,
        impact: 4,
        description: "Inaccurate satellite signals inside high-density settlements like Jamestown create misrouting logs.",
        mitigationPlan: "Integrate WiFi triangulation and cell-tower mapping to refine location coordinates.",
        status: "Mitigated"
      },
      {
        id: "r1-2",
        category: "Operational",
        severity: "Low",
        likelihood: 2,
        impact: 2,
        description: "Low public familiarity with utilizing digital postal addresses for utility services.",
        mitigationPlan: "Deploy community communication clinics and work with Ghana Water and ECG to mandate digital codes.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-1-1", fileName: "GhanaPostGPS_GeoDesign_Specs.pdf", fileType: "pdf", uploadedAt: "2018-02-15", version: 1, signedBy: ["Minister of Communications", "NITA Director"] }
    ]
  },
  {
    id: "proj-2",
    projectCode: "GN-AI-2026-002",
    name: "GhanaCard AFIS & Biometric Registry",
    description: "National biometric identity verification system. Integrates automated fingerprint and facial recognition systems (AFIS) to provide instant user verification across banking, tax TIN verification, and telecom registers.",
    category: "Computer Vision",
    sector: "Security",
    stage: "Operational",
    status: "Active",
    startDate: "2018-06-04",
    endDate: "2029-12-31",
    expectedCompletionDate: "2029-12-31",
    latitude: 5.5786,
    longitude: -0.1821,
    mda: "National Identification Authority (NIA)",
    mdaCode: "NIA",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 50000000,
      disbursed: 48000000,
      utilized: 47000000,
      remaining: 2000000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 70,
      accountability: 80,
      privacy: 85,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 90,
    milestones: [
      { id: "m2-1", title: "National registration rollout launch", dueDate: "2019-04-20", progressPercent: 100, status: "Completed" },
      { id: "m2-2", title: "SSNIT and GRA card merger migration", dueDate: "2022-07-01", progressPercent: 100, status: "Completed" },
      { id: "m2-3", title: "Real-time banking KYC validation API link", dueDate: "2026-12-01", progressPercent: 65, status: "Pending" }
    ],
    risks: [
      {
        id: "r2-1",
        category: "Cybersecurity",
        severity: "Critical",
        likelihood: 1,
        impact: 5,
        description: "Potential database leak of national fingerprint registries via external APIs.",
        mitigationPlan: "Enforce hardware-security-modules (HSM) and encrypt biometric checks with ephemeral salted hashes.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-2-1", fileName: "NIA_Biometric_Security_Protocol.pdf", fileType: "pdf", uploadedAt: "2019-01-10", version: 3, signedBy: ["Executive Secretary NIA", "DPO"] }
    ]
  },
  {
    id: "proj-3",
    projectCode: "GN-AI-2026-003",
    name: "Cocoa Management System (COCOBOD CMS)",
    description: "A comprehensive geospatial farm mapping registry. Employs remote sensing satellite indices to draw farm boundaries, audit yields, and optimize fertilizer allocation to eradicate subsidy smuggling.",
    category: "Predictive Analytics",
    sector: "Agriculture",
    stage: "Deployment",
    status: "Active",
    startDate: "2020-09-01",
    endDate: "2027-12-31",
    expectedCompletionDate: "2027-11-30",
    latitude: 6.2041,
    longitude: -1.7583,
    mda: "Ghana Cocoa Board (COCOBOD)",
    mdaCode: "COCOBOD",
    region: "Western North",
    district: "Sefwi Wiawso",
    budget: {
      totalAllocated: 15000000,
      disbursed: 13500000,
      utilized: 12000000,
      remaining: 1500000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 80,
      accountability: 85,
      privacy: 80,
      security: 85,
      overallGrade: "Good"
    },
    readinessScore: 82,
    milestones: [
      { id: "m3-1", title: "Western Region satellite boundaries plot", dueDate: "2022-03-14", progressPercent: 100, status: "Completed" },
      { id: "m3-2", title: "1.2 Million cocoa farmers registration", dueDate: "2024-11-20", progressPercent: 100, status: "Completed" },
      { id: "m3-3", title: "Automated fertilizer weighing and scan sync", dueDate: "2026-09-01", progressPercent: 50, status: "Pending" }
    ],
    risks: [
      {
        id: "r3-1",
        category: "Operational",
        severity: "Medium",
        likelihood: 3,
        impact: 3,
        description: "Discrepancy in land boundary definitions among local tribal leaders during satellite mapping.",
        mitigationPlan: "Consult local chiefs and establish physical boundary verification arbitration panels.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-3-1", fileName: "CMS_Farming_Data_Provenance.pdf", fileType: "pdf", uploadedAt: "2021-04-12", version: 1, signedBy: ["CMS Project Lead"] }
    ]
  },
  {
    id: "proj-4",
    projectCode: "GN-AI-2026-004",
    name: "National E-Justice Court Tracking Registry",
    description: "An automated case management registry linking all high courts. Automates docket assignments to judge rosters, maps case progress, and transcribes audio recordings into catalogued text summaries.",
    category: "Natural Language Processing",
    sector: "Justice",
    stage: "Development",
    status: "Active",
    startDate: "2019-03-20",
    endDate: "2027-06-30",
    expectedCompletionDate: "2027-05-15",
    latitude: 5.5422,
    longitude: -0.2078,
    mda: "Ministry of Justice and Attorney General's Department",
    mdaCode: "MOJ",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 8000000,
      disbursed: 6200000,
      utilized: 5500000,
      remaining: 700000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 75,
      transparency: 85,
      accountability: 90,
      privacy: 80,
      security: 85,
      overallGrade: "Good"
    },
    readinessScore: 78,
    milestones: [
      { id: "m4-1", title: "Accra High Court paper digitisation trial", dueDate: "2020-01-15", progressPercent: 100, status: "Completed" },
      { id: "m4-2", title: "Unified judicial database launch", dueDate: "2023-09-10", progressPercent: 100, status: "Completed" },
      { id: "m4-3", title: "Speech-to-text automated transcription deployment", dueDate: "2026-11-20", progressPercent: 20, status: "Pending" }
    ],
    risks: [
      {
        id: "r4-1",
        category: "Ethical",
        severity: "High",
        likelihood: 2,
        impact: 4,
        description: "Automatic audio transcription inaccuracies when analyzing regional court accents (Twi, Ewe, Ga).",
        mitigationPlan: "Partner with local speech labs (e.g. Ashesi AI) to fine-tune Whisper algorithms on local Ghanaian accents.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-4-1", fileName: "E-Justice_Audit_Report.pdf", fileType: "pdf", uploadedAt: "2023-11-05", version: 1, signedBy: ["Judicial Secretary", "Lead Auditor"] }
    ]
  },
  {
    id: "proj-5",
    projectCode: "GN-AI-2026-005",
    name: "NHIS Claims Biometric & AI Validation Engine",
    description: "An automated OCR and deep learning claims auditing system. Automatically scans medical treatment forms and prescriptions from local clinics to flags duplicates, audit costs, and verify biometric logs.",
    category: "Machine Learning",
    sector: "Health",
    stage: "Pilot",
    status: "Active",
    startDate: "2023-05-10",
    endDate: "2027-12-31",
    expectedCompletionDate: "2027-12-15",
    latitude: 5.5604,
    longitude: -0.1982,
    mda: "National Health Insurance Authority (NHIA)",
    mdaCode: "NHIA",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 6000000,
      disbursed: 4500000,
      utilized: 4000000,
      remaining: 500000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 80,
      transparency: 75,
      accountability: 80,
      privacy: 90,
      security: 85,
      overallGrade: "Good"
    },
    readinessScore: 75,
    milestones: [
      { id: "m5-1", title: "OCR training dataset creation", dueDate: "2024-02-18", progressPercent: 100, status: "Completed" },
      { id: "m5-2", title: "10-Clinic pilot validation integration", dueDate: "2025-09-01", progressPercent: 100, status: "Completed" },
      { id: "m5-3", title: "Nationwide claims validation portal launch", dueDate: "2026-09-30", progressPercent: 30, status: "Pending" }
    ],
    risks: [
      {
        id: "r5-1",
        category: "Legal",
        severity: "Medium",
        likelihood: 2,
        impact: 3,
        description: "Storing sensitive patient diagnostic codes violates Data Protection Act (Act 843).",
        mitigationPlan: "Anonymize doctor diagnostic logs and encrypt records using SHA-256 before scanning passes.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-5-1", fileName: "NHIA_DPIA_Audit_Signoff.pdf", fileType: "pdf", uploadedAt: "2023-09-22", version: 1, signedBy: ["NHIA DPO", "External Auditor"] }
    ]
  },
  {
    id: "proj-6",
    projectCode: "GN-AI-2026-006",
    name: "LEAP Biometric Social Transfer Registry",
    description: "The Livelihood Empowerment Against Poverty (LEAP) beneficiary classification engine. Uses biometric validation and household survey scoring models to identify, audit, and disburse social transfers to vulnerable citizens.",
    category: "Predictive Analytics",
    sector: "Local Government",
    stage: "Operational",
    status: "Active",
    startDate: "2021-01-15",
    endDate: "2028-06-30",
    expectedCompletionDate: "2028-06-30",
    latitude: 9.4081,
    longitude: -0.8393,
    mda: "Ministry of Gender, Children and Social Protection",
    mdaCode: "MOGCSP",
    region: "Northern",
    district: "Tamale Metropolitan",
    budget: {
      totalAllocated: 12000000,
      disbursed: 11000000,
      utilized: 10800000,
      remaining: 200000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 85,
      transparency: 80,
      accountability: 85,
      privacy: 80,
      security: 90,
      overallGrade: "Good"
    },
    readinessScore: 88,
    milestones: [
      { id: "m6-1", title: "Regional social survey digitisation", dueDate: "2022-04-10", progressPercent: 100, status: "Completed" },
      { id: "m6-2", title: "Automated mobile money API sync", dueDate: "2023-11-15", progressPercent: 100, status: "Completed" },
      { id: "m6-3", title: "Beneficiary fingerprint audit cleanup run", dueDate: "2026-08-01", progressPercent: 45, status: "Pending" }
    ],
    risks: [
      {
        id: "r6-1",
        category: "Operational",
        severity: "Medium",
        likelihood: 2,
        impact: 4,
        description: "Mobile money SIM card swapping frauds redirecting transfers away from target beneficiaries.",
        mitigationPlan: "Mandate biometrics checking matching the target recipient's national GhanaCard database record.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-6-1", fileName: "LEAP_Social_Inclusivity_Charter.pdf", fileType: "pdf", uploadedAt: "2021-03-12", version: 1, signedBy: ["Minister of Gender", "Director of Social Welfare"] }
    ]
  }
];

export interface RegionInfo {
  name: string;
  center: [number, number];
  projectCount: number;
  description: string;
}

export const ghanaRegions: RegionInfo[] = [
  { name: "Greater Accra", center: [5.6037, -0.1870], projectCount: 4, description: "Capital administrative hub, hosting GhanaCard biometric AFIS, national digital address systems, E-Justice registry, and NHIS Claims AI validation." },
  { name: "Western North", center: [6.2041, -1.7583], projectCount: 1, description: "Agriculture technology hub, hosting the Cocoa Board geospatial farm mapping and yield prediction CMS." },
  { name: "Northern", center: [9.4075, -0.8533], projectCount: 1, description: "Northern zone social protection hub, hosting the LEAP biometric social transfer registry." },
  { name: "Ashanti", center: [6.6922, -1.6163], projectCount: 0, description: "Ashanti region administrative and digital technology hub." },
  { name: "Eastern", center: [6.2958, 0.0594], projectCount: 0, description: "Eastern region energy and hydrological monitoring zone." },
  { name: "Central", center: [6.2201, -2.1245], projectCount: 0, description: "Central coastal region monitoring and local government zone." },
  { name: "Western", center: [5.5560, -2.2229], projectCount: 0, description: "Western coastal and digital literacy training hub." },
  { name: "Volta", center: [6.5781, 0.4504], projectCount: 0, description: "Volta region digital systems and smart services hub." }
];
