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
  category: string;
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
        category: "Technical Risk",
        severity: "Medium",
        likelihood: 2,
        impact: 4,
        description: "Inaccurate satellite signals inside high-density settlements like Jamestown create misrouting logs.",
        mitigationPlan: "Integrate WiFi triangulation and cell-tower mapping to refine location coordinates.",
        status: "Mitigated"
      },
      {
        id: "r1-2",
        category: "Operational Risk",
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
        category: "Cybersecurity Risk",
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
        category: "Operational Risk",
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
        category: "AI Ethics Risk",
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
        category: "Legal & Regulatory Risk",
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
        category: "Operational Risk",
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
  },
  {
    id: "proj-7",
    projectCode: "GN-AI-2026-007",
    name: "Akosombo Dam Hydro-AI Smart Grid & Flood Forecaster",
    description: "An advanced predictive hydrological and turbine dispatch engine. Combines real-time radar satellite precipitation models with river basin inflow gauges to forecast reservoir spillway risks and optimize national power dispatch.",
    category: "Predictive Analytics",
    sector: "Energy",
    stage: "Deployment",
    status: "Active",
    startDate: "2022-03-15",
    endDate: "2028-12-31",
    expectedCompletionDate: "2028-11-30",
    latitude: 6.3000,
    longitude: 0.0500,
    mda: "Volta River Authority (VRA)",
    mdaCode: "VRA",
    region: "Eastern",
    district: "Asuogyaman",
    budget: {
      totalAllocated: 18000000,
      disbursed: 16500000,
      utilized: 15200000,
      remaining: 1500000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 88,
      accountability: 92,
      privacy: 85,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 89,
    milestones: [
      { id: "m7-1", title: "Volta Basin telemetry sensor calibration", dueDate: "2023-01-15", progressPercent: 100, status: "Completed" },
      { id: "m7-2", title: "Inflow flood predictive model release", dueDate: "2024-08-30", progressPercent: 100, status: "Completed" },
      { id: "m7-3", title: "Automated downstream spillway early warning sync", dueDate: "2026-11-10", progressPercent: 55, status: "Pending" }
    ],
    risks: [
      {
        id: "r7-1",
        category: "Technical Risk",
        severity: "High",
        likelihood: 2,
        impact: 5,
        description: "Satellite communication latency delays during severe tropical squalls.",
        mitigationPlan: "Deploy local edge computing units with offline hydrological physics fallback models at dam control room.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-7-1", fileName: "VRA_Hydro_AI_Operational_Manual.pdf", fileType: "pdf", uploadedAt: "2023-05-18", version: 2, signedBy: ["VRA Chief Executive", "Technical Director"] }
    ]
  },
  {
    id: "proj-8",
    projectCode: "GN-AI-2026-008",
    name: "Kumasi Urban Mobility & Traffic Vision AI",
    description: "Computer vision and real-time edge telemetry for Kumasi's major transit corridors (Kejetia, Anloga, Sofoline). Optimizes smart traffic signaling, detects road blockages, and regulates trotro transit queue times.",
    category: "Computer Vision",
    sector: "Transport",
    stage: "Pilot",
    status: "Active",
    startDate: "2023-08-01",
    endDate: "2027-10-31",
    expectedCompletionDate: "2027-10-15",
    latitude: 6.6922,
    longitude: -1.6163,
    mda: "Ministry of Roads and Highways / KMA",
    mdaCode: "MRH",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    budget: {
      totalAllocated: 9500000,
      disbursed: 7200000,
      utilized: 6400000,
      remaining: 2300000,
      primaryFundingSource: "Development Partners",
      currency: "GHS"
    },
    compliance: {
      fairness: 82,
      transparency: 78,
      accountability: 80,
      privacy: 85,
      security: 88,
      overallGrade: "Good"
    },
    readinessScore: 80,
    milestones: [
      { id: "m8-1", title: "Kejetia corridor optical edge camera trial", dueDate: "2024-03-20", progressPercent: 100, status: "Completed" },
      { id: "m8-2", title: "Adaptive traffic light timing controller", dueDate: "2025-06-15", progressPercent: 100, status: "Completed" },
      { id: "m8-3", title: "Citywide congestion heat map public API feed", dueDate: "2026-12-05", progressPercent: 35, status: "Pending" }
    ],
    risks: [
      {
        id: "r8-1",
        category: "Operational Risk",
        severity: "Medium",
        likelihood: 3,
        impact: 3,
        description: "Intermittent power grid disruptions shutting down road intersection optical cameras.",
        mitigationPlan: "Equip all road camera poles with dedicated 400W solar photovoltaic arrays and LiFePO4 batteries.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-8-1", fileName: "KMA_Traffic_Vision_Framework.pdf", fileType: "pdf", uploadedAt: "2023-10-01", version: 1, signedBy: ["Metropolitan Chief Executive", "Urban Roads Engineer"] }
    ]
  },
  {
    id: "proj-9",
    projectCode: "GN-AI-2026-009",
    name: "Northern Savannah Climate-Smart Drought Forecaster",
    description: "A geospatial machine learning platform integrating Copernicus satellite imagery with ground moisture sensors across the Savannah zone. Yields localized microclimate forecasts and early drought warnings for smallholder farmers.",
    category: "Machine Learning",
    sector: "Environment",
    stage: "Development",
    status: "Active",
    startDate: "2023-02-10",
    endDate: "2027-12-31",
    expectedCompletionDate: "2027-11-20",
    latitude: 9.0833,
    longitude: -1.8167,
    mda: "Ministry of Environment, Science, Technology and Innovation (MESTI)",
    mdaCode: "MESTI",
    region: "Savannah",
    district: "West Gonja",
    budget: {
      totalAllocated: 7200000,
      disbursed: 5100000,
      utilized: 4600000,
      remaining: 2100000,
      primaryFundingSource: "Research Grants",
      currency: "GHS"
    },
    compliance: {
      fairness: 88,
      transparency: 85,
      accountability: 82,
      privacy: 85,
      security: 85,
      overallGrade: "Good"
    },
    readinessScore: 76,
    milestones: [
      { id: "m9-1", title: "Savannah soil moisture sensor deployment", dueDate: "2023-11-12", progressPercent: 100, status: "Completed" },
      { id: "m9-2", title: "Localized drought risk algorithm training", dueDate: "2025-01-20", progressPercent: 100, status: "Completed" },
      { id: "m9-3", title: "Farmer USSD and regional voice alert gateway", dueDate: "2026-10-30", progressPercent: 40, status: "Pending" }
    ],
    risks: [
      {
        id: "r9-1",
        category: "Operational Risk",
        severity: "Low",
        likelihood: 2,
        impact: 3,
        description: "Low cellular data network coverage across remote agricultural grazing reserves.",
        mitigationPlan: "Partner with telecom providers to deploy low-frequency LoRaWAN mesh gateways at agricultural extension offices.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-9-1", fileName: "Savannah_Climate_AI_Charter.pdf", fileType: "pdf", uploadedAt: "2023-04-14", version: 1, signedBy: ["MESTI Coordinator"] }
    ]
  },
  {
    id: "proj-10",
    projectCode: "GN-AI-2026-010",
    name: "Upper East Maternal Telehealth & Drone Logistics AI",
    description: "An autonomous medical supply delivery and emergency dispatch system. Optimizes flight routes, emergency blood distribution, and remote maternal clinical triaging across hard-to-reach northern clinics.",
    category: "Robotics",
    sector: "Health",
    stage: "Operational",
    status: "Active",
    startDate: "2021-07-01",
    endDate: "2029-06-30",
    expectedCompletionDate: "2029-06-30",
    latitude: 10.7856,
    longitude: -0.8514,
    mda: "Ghana Health Service (GHS)",
    mdaCode: "GHS",
    region: "Upper East",
    district: "Bolgatanga Municipal",
    budget: {
      totalAllocated: 14000000,
      disbursed: 13200000,
      utilized: 12900000,
      remaining: 800000,
      primaryFundingSource: "Government",
      currency: "GHS"
    },
    compliance: {
      fairness: 92,
      transparency: 88,
      accountability: 90,
      privacy: 88,
      security: 94,
      overallGrade: "Excellent"
    },
    readinessScore: 91,
    milestones: [
      { id: "m10-1", title: "Bolgatanga regional drone hub commissioning", dueDate: "2022-09-10", progressPercent: 100, status: "Completed" },
      { id: "m10-2", title: "Maternal hemorrhage blood dispatch algorithm trial", dueDate: "2024-03-15", progressPercent: 100, status: "Completed" },
      { id: "m10-3", title: "Autonomous nocturnal flight clearance API sync", dueDate: "2026-09-15", progressPercent: 70, status: "Pending" }
    ],
    risks: [
      {
        id: "r10-1",
        category: "Safety Risk",
        severity: "Critical",
        likelihood: 1,
        impact: 5,
        description: "Adverse Harmattan dust winds impacting flight vision sensors.",
        mitigationPlan: "Integrate LIDAR and dual-frequency barometer sensors with automatic return-to-base protocols.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-10-1", fileName: "GHS_Drone_Aviation_Safety_Clearance.pdf", fileType: "pdf", uploadedAt: "2022-01-11", version: 2, signedBy: ["Director General GHS", "GCAA Aviation Authority"] }
    ]
  },
  {
    id: "proj-11",
    projectCode: "GN-AI-2026-011",
    name: "Takoradi Port Autonomous Container OCR & Customs Vision",
    description: "Automated maritime container identification and manifest inspection. Employs deep optical character recognition and scanning analytics to accelerate cargo clearance and counter customs undervaluation.",
    category: "Computer Vision",
    sector: "Transport",
    stage: "Deployment",
    status: "Active",
    startDate: "2022-11-01",
    endDate: "2028-05-30",
    expectedCompletionDate: "2028-05-15",
    latitude: 4.9340,
    longitude: -1.7580,
    mda: "Ghana Ports and Harbours Authority (GPHA) / GRA",
    mdaCode: "GPHA",
    region: "Western",
    district: "Sekondi-Takoradi",
    budget: {
      totalAllocated: 11500000,
      disbursed: 9800000,
      utilized: 9100000,
      remaining: 1700000,
      primaryFundingSource: "Donors",
      currency: "GHS"
    },
    compliance: {
      fairness: 84,
      transparency: 80,
      accountability: 86,
      privacy: 82,
      security: 91,
      overallGrade: "Good"
    },
    readinessScore: 84,
    milestones: [
      { id: "m11-1", title: "Port gate gantry optical sensor integration", dueDate: "2023-06-25", progressPercent: 100, status: "Completed" },
      { id: "m11-2", title: "ICUMS trade database automated link", dueDate: "2024-12-10", progressPercent: 100, status: "Completed" },
      { id: "m11-3", title: "Automated tare weight discrepancy anomaly model", dueDate: "2026-11-30", progressPercent: 60, status: "Pending" }
    ],
    risks: [
      {
        id: "r11-1",
        category: "Operational Risk",
        severity: "Medium",
        likelihood: 2,
        impact: 4,
        description: "Corrosion of external camera sensors from coastal maritime salt spray.",
        mitigationPlan: "Enclose all optical sensors in IP68 marine-grade pressurized stainless steel casings.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-11-1", fileName: "Takoradi_Port_OCR_Audit.pdf", fileType: "pdf", uploadedAt: "2023-08-20", version: 1, signedBy: ["Director of Port", "Customs Commissioner"] }
    ]
  },
  {
    id: "proj-12",
    projectCode: "GN-AI-2026-012",
    name: "Cape Coast Coastal Erosion & Mangrove Satellite Monitor",
    description: "High-resolution satellite Earth observation engine monitoring shoreline retreat and mangrove biomass loss along the Central Coast. Triggers automated alerts to municipal authorities to mitigate coastal flooding.",
    category: "Predictive Analytics",
    sector: "Environment",
    stage: "Pilot",
    status: "Active",
    startDate: "2023-06-01",
    endDate: "2027-12-31",
    expectedCompletionDate: "2027-11-15",
    latitude: 5.1053,
    longitude: -1.2466,
    mda: "Environmental Protection Agency (EPA)",
    mdaCode: "EPA",
    region: "Central",
    district: "Cape Coast Metropolitan",
    budget: {
      totalAllocated: 5800000,
      disbursed: 4100000,
      utilized: 3700000,
      remaining: 1700000,
      primaryFundingSource: "Research Grants",
      currency: "GHS"
    },
    compliance: {
      fairness: 86,
      transparency: 82,
      accountability: 84,
      privacy: 88,
      security: 86,
      overallGrade: "Good"
    },
    readinessScore: 78,
    milestones: [
      { id: "m12-1", title: "Cape Coast 10-year shoreline satellite dataset", dueDate: "2024-01-30", progressPercent: 100, status: "Completed" },
      { id: "m12-2", title: "Coastal retreat predictive neural network training", dueDate: "2025-05-18", progressPercent: 100, status: "Completed" },
      { id: "m12-3", title: "Fisherfolk coastal flood SMS warning pipeline", dueDate: "2026-10-15", progressPercent: 25, status: "Pending" }
    ],
    risks: [
      {
        id: "r12-1",
        category: "Environmental Risk",
        severity: "High",
        likelihood: 3,
        impact: 4,
        description: "Cloud cover obscuring optical satellite imagery during rainy season.",
        mitigationPlan: "Fuse optical Sentinel-2 imagery with Synthetic Aperture Radar (SAR Sentinel-1) penetrates cloud cover.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-12-1", fileName: "EPA_Coastal_Erosion_AI_Baseline.pdf", fileType: "pdf", uploadedAt: "2024-02-10", version: 1, signedBy: ["Executive Director EPA", "Marine Geologist"] }
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
  { name: "Ashanti", center: [6.6922, -1.6163], projectCount: 1, description: "Ashanti region administrative and digital technology hub, hosting the Kumasi Urban Mobility & Traffic Vision AI." },
  { name: "Western", center: [4.9340, -1.7580], projectCount: 1, description: "Western coastal and maritime hub, hosting Takoradi Port Autonomous Container OCR & Customs Vision." },
  { name: "Western North", center: [6.2041, -1.7583], projectCount: 1, description: "Agriculture technology hub, hosting the Cocoa Board geospatial farm mapping and yield prediction CMS." },
  { name: "Central", center: [5.1053, -1.2466], projectCount: 1, description: "Central coastal zone, hosting Cape Coast Coastal Erosion & Mangrove Satellite Monitoring." },
  { name: "Eastern", center: [6.3000, 0.0500], projectCount: 1, description: "Eastern hydrological and smart energy zone, hosting the Akosombo Dam Hydro-AI Smart Grid & Flood Forecaster." },
  { name: "Northern", center: [9.4075, -0.8533], projectCount: 1, description: "Northern zone social protection hub, hosting the LEAP biometric social transfer registry." },
  { name: "Savannah", center: [9.0833, -1.8167], projectCount: 1, description: "Savannah agricultural zone, hosting the Northern Savannah Climate-Smart Drought Forecaster." },
  { name: "Upper East", center: [10.7856, -0.8514], projectCount: 1, description: "Upper East cross-border healthcare corridor, hosting Maternal Telehealth & Drone Logistics AI." },
  { name: "Upper West", center: [10.0607, -2.5099], projectCount: 0, description: "Upper West agro-pastoral zone earmarked for regional cross-border biometric livestock tracking." },
  { name: "North East", center: [10.5186, -0.3700], projectCount: 0, description: "North East agricultural and hydrological corridor along the White Volta river basin." },
  { name: "Volta", center: [6.5781, 0.4504], projectCount: 0, description: "Volta region digital systems, cross-border trade facilitation, and smart services hub." },
  { name: "Oti", center: [7.8732, 0.2986], projectCount: 0, description: "Oti region ecological monitoring and rural broadband expansion zone." },
  { name: "Bono", center: [7.5833, -2.3333], projectCount: 0, description: "Bono agricultural food basket and smart grain storage logistics node." },
  { name: "Bono East", center: [7.7333, -1.0500], projectCount: 0, description: "Bono East transit intersection hub for national agricultural trade corridors." },
  { name: "Ahafo", center: [7.0000, -2.3333], projectCount: 0, description: "Ahafo mining, forestry, and automated land reclamation monitoring zone." }
];

export function formatNumberToWords(num: number): string {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  const scales = ['', 'Thousand', 'Million', 'Billion'];
  
  const convertHundreds = (n: number): string => {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
      if (n > 0) {
        str += ones[n] + ' ';
      }
    } else if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  };

  let wordResult = '';
  let scaleIndex = 0;
  let temp = num;

  while (temp > 0) {
    const chunk = temp % 1000;
    if (chunk > 0) {
      const chunkText = convertHundreds(chunk);
      wordResult = chunkText + (scales[scaleIndex] ? ' ' + scales[scaleIndex] : '') + ' ' + wordResult;
    }
    temp = Math.floor(temp / 1000);
    scaleIndex++;
  }
  
  return wordResult.trim();
}
