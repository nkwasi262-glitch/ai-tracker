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

// ----------------------------------------------------------------------------
// NAPTCS Dual-Sector Clearance & Organization Types
// ----------------------------------------------------------------------------

export type EntitySectorType = 
  | 'Government (MDA/MMDA/SOE)' 
  | 'Private Sector (Commercial Enterprise)' 
  | 'Private Sector (Startup/SME)' 
  | 'Academic & Research Institution' 
  | 'International Vendor / Partner';

export type OrganizationClearanceStatus = 
  | 'Cleared' 
  | 'Pending Review' 
  | 'Conditional' 
  | 'Not Cleared' 
  | 'Suspended';

export interface Organization {
  id: string;
  name: string;
  acronym: string;
  entityType: EntitySectorType;
  tinOrRegNumber: string; // GRA TIN or Registrar General Department Registration
  dpcRegNumber: string;   // Data Protection Commission (Act 843) Certificate Number
  sector: 'Health' | 'Education' | 'Agriculture' | 'Finance' | 'Security' | 'Transport' | 'Energy' | 'Environment' | 'Justice' | 'Local Government';
  region: string;
  district: string;
  dpoName: string;
  dpoEmail: string;
  contactEmail: string;
  website: string;
  clearanceStatus: OrganizationClearanceStatus;
  clearanceCertificateId?: string;
  clearedDate?: string;
  expiryDate?: string;
  reviewNotes?: string;
  submittedAt: string;
  sovereignDataHosting: 'In-Country (National Data Centre)' | 'Government-Approved Cloud' | 'Hybrid Edge' | 'Pending Verification';
}

export type RiskTier = 'Minimal Risk' | 'Limited Risk' | 'High Risk' | 'Prohibited';
export type ProjectClearanceStatus = 'Cleared' | 'Conditional' | 'Pending Review' | 'Not Cleared' | 'Draft';

export interface ClearanceEvidence {
  dpiaUploaded: boolean;
  vaptReportUploaded: boolean;
  modelDocumentationUploaded: boolean;
  slaUploaded: boolean;
  biasAuditUploaded: boolean;
  procurementRecordsUploaded: boolean;
}

export interface ClearanceCondition {
  id: string;
  requirement: string;
  deadline: string;
  status: 'Open' | 'Resolved';
}

export interface ClearanceDecision {
  status: ProjectClearanceStatus;
  overallScore: number;
  decisionDate: string;
  decidedBy: string;
  clearanceCertificateId?: string;
  certificateQrCodeUrl?: string;
  validUntil?: string;
  scopeLimits?: string;
  conditions?: ClearanceCondition[];
  mandatoryGateOverride?: string;
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
  organizationId: string;
  organizationName: string;
  entitySectorType: EntitySectorType;
  riskTier: RiskTier;
  clearanceStatus: ProjectClearanceStatus;
  clearanceCertificateId?: string;
  clearanceScore: number;
  clearanceEvidence: ClearanceEvidence;
  clearanceDecision?: ClearanceDecision;
  isOrganizationCleared: boolean;
  isPublished: boolean;
  region: string;
  district: string;
  budget: Budget;
  compliance: ComplianceScore;
  readinessScore: number;
  milestones: Milestone[];
  risks: RiskItem[];
  documents: DocumentAsset[];
}

// ----------------------------------------------------------------------------
// Registered Organizations (Government MDAs and Private Sector Entities)
// ----------------------------------------------------------------------------

export const sampleOrganizations: Organization[] = [
  {
    id: "org-1",
    name: "Ministry of Communications and Digitalisation",
    acronym: "MoCD",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-MOCD-001",
    dpcRegNumber: "DPC/GOV/2018/00142",
    sector: "Local Government",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Dr. Kofi Mensah",
    dpoEmail: "dpo@mocd.gov.gh",
    contactEmail: "registry@mocd.gov.gh",
    website: "https://mocd.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-001",
    clearedDate: "2024-01-15",
    expiryDate: "2027-01-15",
    reviewNotes: "Sovereign government ministry with appointed statutory DPO and in-country hosting infrastructure.",
    submittedAt: "2023-11-10",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-2",
    name: "National Identification Authority",
    acronym: "NIA",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-NIA-002",
    dpcRegNumber: "DPC/GOV/2019/00088",
    sector: "Security",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Evelyn Addo-Kufuor",
    dpoEmail: "dpo@nia.gov.gh",
    contactEmail: "info@nia.gov.gh",
    website: "https://nia.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-002",
    clearedDate: "2024-02-20",
    expiryDate: "2027-02-20",
    reviewNotes: "National biometric authority. Hardware Security Modules (HSM) verified compliant with Act 843 & Act 1038.",
    submittedAt: "2023-12-01",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-3",
    name: "Ghana Cocoa Board",
    acronym: "COCOBOD",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-SOE-COCOBOD-003",
    dpcRegNumber: "DPC/SOE/2021/00452",
    sector: "Agriculture",
    region: "Western North",
    district: "Sefwi Wiawso",
    dpoName: "Kwame Boateng",
    dpoEmail: "dpo@cocobod.gh",
    contactEmail: "cms@cocobod.gh",
    website: "https://cocobod.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-003",
    clearedDate: "2024-03-10",
    expiryDate: "2027-03-10",
    reviewNotes: "Geospatial farmer database validated under national agricultural digital sovereignty protocols.",
    submittedAt: "2024-01-08",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-4",
    name: "Judicial Service of Ghana",
    acronym: "MOJ",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-MOJ-004",
    dpcRegNumber: "DPC/GOV/2020/00311",
    sector: "Justice",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Justice Samuel Osei",
    dpoEmail: "dpo@court.gov.gh",
    contactEmail: "ejustice@court.gov.gh",
    website: "https://judicial.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-004",
    clearedDate: "2024-04-12",
    expiryDate: "2027-04-12",
    reviewNotes: "Court automation framework verified for judicial case record confidentiality.",
    submittedAt: "2024-01-15",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-5",
    name: "National Health Insurance Authority",
    acronym: "NHIA",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-NHIA-005",
    dpcRegNumber: "DPC/GOV/2021/00619",
    sector: "Health",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Dr. Sheila Quaye",
    dpoEmail: "dpo@nhia.gov.gh",
    contactEmail: "claims@nhia.gov.gh",
    website: "https://nhis.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-005",
    clearedDate: "2024-05-18",
    expiryDate: "2027-05-18",
    reviewNotes: "Medical claims biometric verification engine verified. DPIA on patient diagnostics approved.",
    submittedAt: "2024-02-10",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-6",
    name: "Ministry of Gender, Children and Social Protection",
    acronym: "MOGCSP",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-MOGCSP-006",
    dpcRegNumber: "DPC/GOV/2022/00880",
    sector: "Local Government",
    region: "Northern",
    district: "Tamale Metropolitan",
    dpoName: "Fatima Alhassan",
    dpoEmail: "dpo@mogcsp.gov.gh",
    contactEmail: "leap@mogcsp.gov.gh",
    website: "https://mogcsp.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-006",
    clearedDate: "2024-06-05",
    expiryDate: "2027-06-05",
    reviewNotes: "LEAP social beneficiary classification engine cleared for vulnerable household protections.",
    submittedAt: "2024-03-01",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-7",
    name: "Volta River Authority",
    acronym: "VRA",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-SOE-VRA-007",
    dpcRegNumber: "DPC/SOE/2020/00299",
    sector: "Energy",
    region: "Eastern",
    district: "Asuogyaman",
    dpoName: "Ing. Emmanuel Darko",
    dpoEmail: "dpo@vra.com",
    contactEmail: "hydro@vra.com",
    website: "https://vra.com",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-007",
    clearedDate: "2024-07-22",
    expiryDate: "2027-07-22",
    reviewNotes: "Critical Information Infrastructure (CII) verified under Cybersecurity Act 2020 (Act 1038).",
    submittedAt: "2024-04-10",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-8",
    name: "Kumasi Metropolitan Assembly / MRH",
    acronym: "KMA",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "AS-GOV-KMA-008",
    dpcRegNumber: "DPC/MMDA/2023/01044",
    sector: "Transport",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    dpoName: "Baffour Gyan",
    dpoEmail: "dpo@kma.gov.gh",
    contactEmail: "roads@kma.gov.gh",
    website: "https://kma.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-008",
    clearedDate: "2024-08-14",
    expiryDate: "2027-08-14",
    reviewNotes: "Urban transit cameras cleared with edge license plate and facial blurring privacy filters.",
    submittedAt: "2024-05-15",
    sovereignDataHosting: "Hybrid Edge"
  },
  {
    id: "org-9",
    name: "Ministry of Environment, Science, Technology and Innovation",
    acronym: "MESTI",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-MESTI-009",
    dpcRegNumber: "DPC/GOV/2022/00741",
    sector: "Environment",
    region: "Savannah",
    district: "West Gonja",
    dpoName: "Dr. Paulina Amoah",
    dpoEmail: "dpo@mesti.gov.gh",
    contactEmail: "climate@mesti.gov.gh",
    website: "https://mesti.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-009",
    clearedDate: "2024-09-02",
    expiryDate: "2027-09-02",
    reviewNotes: "Savannah drought forecasting model cleared under open scientific environmental monitoring.",
    submittedAt: "2024-06-01",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-10",
    name: "Ghana Health Service",
    acronym: "GHS",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "GA-GOV-GHS-010",
    dpcRegNumber: "DPC/GOV/2019/00199",
    sector: "Health",
    region: "Upper East",
    district: "Bolgatanga Municipal",
    dpoName: "Dr. Anthony Nsiah",
    dpoEmail: "dpo@ghs.gov.gh",
    contactEmail: "telehealth@ghs.gov.gh",
    website: "https://ghs.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-010",
    clearedDate: "2024-09-15",
    expiryDate: "2027-09-15",
    reviewNotes: "Autonomous drone delivery and telehealth network cleared with GCAA aviation and medical clearance.",
    submittedAt: "2024-06-20",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-11",
    name: "Ghana Ports and Harbours Authority",
    acronym: "GPHA",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "WR-SOE-GPHA-011",
    dpcRegNumber: "DPC/SOE/2021/00508",
    sector: "Transport",
    region: "Western",
    district: "Sekondi-Takoradi",
    dpoName: "Captain Alex Asmah",
    dpoEmail: "dpo@ghanaports.gov.gh",
    contactEmail: "customs-ai@ghanaports.gov.gh",
    website: "https://ghanaports.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-011",
    clearedDate: "2024-10-01",
    expiryDate: "2027-10-01",
    reviewNotes: "Port automated container OCR manifest system cleared for ICUMS customs verification.",
    submittedAt: "2024-07-15",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-12",
    name: "Environmental Protection Agency",
    acronym: "EPA",
    entityType: "Government (MDA/MMDA/SOE)",
    tinOrRegNumber: "CR-GOV-EPA-012",
    dpcRegNumber: "DPC/GOV/2021/00477",
    sector: "Environment",
    region: "Central",
    district: "Cape Coast Metropolitan",
    dpoName: "Naa Borley Tackie",
    dpoEmail: "dpo@epa.gov.gh",
    contactEmail: "coastal@epa.gov.gh",
    website: "https://epa.gov.gh",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-012",
    clearedDate: "2024-10-18",
    expiryDate: "2027-10-18",
    reviewNotes: "Satellite coastal erosion monitor cleared for municipal disaster risk alerting.",
    submittedAt: "2024-08-01",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },

  // ---------------- PRIVATE SECTOR & COMMERCIAL VENDORS ----------------
  {
    id: "org-13",
    name: "mPharma Health AI Ghana Ltd",
    acronym: "mPharma",
    entityType: "Private Sector (Commercial Enterprise)",
    tinOrRegNumber: "C002891924X",
    dpcRegNumber: "DPC/PVT/2022/01984",
    sector: "Health",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Kofi Owusu-Ansah, Esq.",
    dpoEmail: "privacy@mpharma.com",
    contactEmail: "ai-labs@mpharma.com",
    website: "https://mpharma.com",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-013",
    clearedDate: "2024-11-04",
    expiryDate: "2026-11-04",
    reviewNotes: "Commercial pharmaceutical supply chain and epidemic forecasting AI cleared. Data strictly anonymized.",
    submittedAt: "2024-09-01",
    sovereignDataHosting: "Government-Approved Cloud"
  },
  {
    id: "org-14",
    name: "Zeepay Ghana Ltd / Fintech AI Lab",
    acronym: "Zeepay",
    entityType: "Private Sector (Commercial Enterprise)",
    tinOrRegNumber: "C004128941Y",
    dpcRegNumber: "DPC/PVT/2021/01420",
    sector: "Finance",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Selorm Adadevoh",
    dpoEmail: "dpo@myzeepay.com",
    contactEmail: "fintech-ai@myzeepay.com",
    website: "https://myzeepay.com",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-014",
    clearedDate: "2024-11-15",
    expiryDate: "2026-11-15",
    reviewNotes: "Cross-border remittance AML and transaction anomaly detection AI cleared under Bank of Ghana regulatory sandbox.",
    submittedAt: "2024-09-12",
    sovereignDataHosting: "In-Country (National Data Centre)"
  },
  {
    id: "org-15",
    name: "Farmerline Africa Ltd",
    acronym: "Farmerline",
    entityType: "Private Sector (Commercial Enterprise)",
    tinOrRegNumber: "C001928472Z",
    dpcRegNumber: "DPC/PVT/2020/00912",
    sector: "Agriculture",
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    dpoName: "Abena Serwaa",
    dpoEmail: "legal@farmerline.co",
    contactEmail: "mergdata@farmerline.co",
    website: "https://farmerline.co",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "GH-ORG-CLR-2026-015",
    clearedDate: "2024-12-01",
    expiryDate: "2026-12-01",
    reviewNotes: "Agricultural predictive credit scoring and satellite crop yield forecasting model cleared.",
    submittedAt: "2024-10-05",
    sovereignDataHosting: "Government-Approved Cloud"
  },

  // ---------------- UNCLEARED / PENDING / QUARANTINED ENTITIES ----------------
  {
    id: "org-16",
    name: "WiredWave Robotics & Computer Vision Ltd",
    acronym: "WiredWave",
    entityType: "Private Sector (Startup/SME)",
    tinOrRegNumber: "C005991820W",
    dpcRegNumber: "DPC/PVT/2025/PENDING",
    sector: "Security",
    region: "Western",
    district: "Sekondi-Takoradi",
    dpoName: "Kwaku Mensah",
    dpoEmail: "kmensah@wiredwave.ai",
    contactEmail: "ops@wiredwave.ai",
    website: "https://wiredwave.ai",
    clearanceStatus: "Pending Review",
    reviewNotes: "Registration submitted; awaiting submission of mandatory Data Protection Commission (DPC) audit certificate. All projects quarantined.",
    submittedAt: "2026-02-14",
    sovereignDataHosting: "Pending Verification"
  },
  {
    id: "org-17",
    name: "Apex Cognitive Technologies International",
    acronym: "Apex AI",
    entityType: "International Vendor / Partner",
    tinOrRegNumber: "EXT-FOR-2025-099",
    dpcRegNumber: "DPC/EXT/2024/00344",
    sector: "Education",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Julian Vance",
    dpoEmail: "jvance@apexcognitive.com",
    contactEmail: "ghana-rep@apexcognitive.com",
    website: "https://apexcognitive.com",
    clearanceStatus: "Conditional",
    clearanceCertificateId: "GH-ORG-CLR-2026-017-COND",
    clearedDate: "2026-01-20",
    expiryDate: "2026-07-20",
    reviewNotes: "Conditional clearance granted for public chatbot trial. Must complete local Ghanaian DPO appointment within 90 days.",
    submittedAt: "2025-11-30",
    sovereignDataHosting: "Government-Approved Cloud"
  },
  {
    id: "org-18",
    name: "DarkStar Analytics Ghana Ltd",
    acronym: "DarkStar",
    entityType: "Private Sector (Commercial Enterprise)",
    tinOrRegNumber: "C003881900D",
    dpcRegNumber: "DPC/PVT/REVOKED",
    sector: "Security",
    region: "Greater Accra",
    district: "Accra Metropolitan",
    dpoName: "Unregistered",
    dpoEmail: "privacy@darkstar.com",
    contactEmail: "sales@darkstar.com",
    website: "https://darkstar.com",
    clearanceStatus: "Not Cleared",
    reviewNotes: "Failed Act 843 Section 45 cross-border data transfer audit and lacked biometric consent protocols. Registration BLOCKED.",
    submittedAt: "2025-08-10",
    sovereignDataHosting: "Pending Verification"
  }
];

// ----------------------------------------------------------------------------
// Registered AI Projects (With Clearance Status & Parent Organization Links)
// ----------------------------------------------------------------------------

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
    organizationId: "org-1",
    organizationName: "Ministry of Communications and Digitalisation",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "Limited Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-001",
    clearanceScore: 92,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 92,
      decisionDate: "2024-01-20",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-001",
      validUntil: "2028-01-20",
      scopeLimits: "Sovereign Digital Addressing across all 16 Ghanaian Administrative Regions"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-2",
    organizationName: "National Identification Authority",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-002",
    clearanceScore: 94,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 94,
      decisionDate: "2024-02-25",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-002",
      validUntil: "2028-02-25",
      scopeLimits: "National Biometric AFIS & Instant Verification API Services"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-3",
    organizationName: "Ghana Cocoa Board",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "Limited Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-003",
    clearanceScore: 89,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 89,
      decisionDate: "2024-03-15",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-003",
      validUntil: "2027-03-15",
      scopeLimits: "Geospatial Cocoa Farm Boundary Mapping & Yield Analytics"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-4",
    organizationName: "Judicial Service of Ghana",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "High Risk",
    clearanceStatus: "Conditional",
    clearanceCertificateId: "NAPTCS-CLR-2026-004-COND",
    clearanceScore: 78,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: false,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Conditional",
      overallScore: 78,
      decisionDate: "2024-04-20",
      decidedBy: "NAPTCS Technical Review Committee",
      clearanceCertificateId: "NAPTCS-CLR-2026-004-COND",
      validUntil: "2026-10-20",
      scopeLimits: "Case Docket Allocation & Audio Transcription Pilot",
      conditions: [
        { id: "c-1", requirement: "Complete dialectic bias testing on local court speech models (Twi, Ewe, Ga)", deadline: "2026-10-01", status: "Open" }
      ]
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-5",
    organizationName: "National Health Insurance Authority",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-005",
    clearanceScore: 88,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 88,
      decisionDate: "2024-05-25",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-005",
      validUntil: "2027-05-25",
      scopeLimits: "Medical Claims Auditing & Biometric Verification"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-6",
    organizationName: "Ministry of Gender, Children and Social Protection",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-006",
    clearanceScore: 91,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 91,
      decisionDate: "2024-06-10",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-006",
      validUntil: "2028-06-10",
      scopeLimits: "LEAP Social Cash Transfer Targeting & Biometric Authentication"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-7",
    organizationName: "Volta River Authority",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-007",
    clearanceScore: 95,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 95,
      decisionDate: "2024-07-28",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-007",
      validUntil: "2028-07-28",
      scopeLimits: "Hydrological River Basin Monitoring & Turbine Grid AI Dispatch"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-8",
    organizationName: "Kumasi Metropolitan Assembly / MRH",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "Limited Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-008",
    clearanceScore: 86,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 86,
      decisionDate: "2024-08-20",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-008",
      validUntil: "2027-08-20",
      scopeLimits: "Urban Traffic Signaling & Congestion Vision Analytics"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-9",
    organizationName: "Ministry of Environment, Science, Technology and Innovation",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "Minimal Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-009",
    clearanceScore: 87,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 87,
      decisionDate: "2024-09-08",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-009",
      validUntil: "2027-09-08",
      scopeLimits: "Savannah Agricultural Drought Prediction & Microclimate Telemetry"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-10",
    organizationName: "Ghana Health Service",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-010",
    clearanceScore: 96,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 96,
      decisionDate: "2024-09-20",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-010",
      validUntil: "2029-09-20",
      scopeLimits: "Medical Emergency Blood & Vaccine Autonomous Flight Dispatch"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-11",
    organizationName: "Ghana Ports and Harbours Authority",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "Limited Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-011",
    clearanceScore: 90,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 90,
      decisionDate: "2024-10-05",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-011",
      validUntil: "2028-10-05",
      scopeLimits: "Maritime Container Identification & Customs Manifest Validation"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
    organizationId: "org-12",
    organizationName: "Environmental Protection Agency",
    entitySectorType: "Government (MDA/MMDA/SOE)",
    riskTier: "Minimal Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-012",
    clearanceScore: 89,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 89,
      decisionDate: "2024-10-22",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-012",
      validUntil: "2027-10-22",
      scopeLimits: "Central Coastline Satellite Monitoring & Mangrove Biomass Tracking"
    },
    isOrganizationCleared: true,
    isPublished: true,
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
  },

  // ---------------- CLEARED PRIVATE SECTOR PROJECTS ----------------
  {
    id: "proj-13",
    projectCode: "GN-AI-2026-013",
    name: "mPharma Bloom AI Supply Chain & Epidemic Predictor",
    description: "Private healthcare supply chain intelligence. Predicts community drug shortages, forecasts seasonal malaria and cholera surges across 850 retail pharmacy nodes, and auto-dispatches wholesale stocks.",
    category: "Predictive Analytics",
    sector: "Health",
    stage: "Operational",
    status: "Active",
    startDate: "2022-05-10",
    endDate: "2028-12-31",
    expectedCompletionDate: "2028-12-31",
    latitude: 5.6145,
    longitude: -0.1988,
    mda: "Private Commercial / MoH Regulated",
    mdaCode: "mPharma",
    organizationId: "org-13",
    organizationName: "mPharma Health AI Ghana Ltd",
    entitySectorType: "Private Sector (Commercial Enterprise)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-013",
    clearanceScore: 93,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 93,
      decisionDate: "2024-11-10",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-013",
      validUntil: "2026-11-10",
      scopeLimits: "Private Pharmaceutical Inventory & Public Health Epidemiological Prediction"
    },
    isOrganizationCleared: true,
    isPublished: true,
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 16500000,
      disbursed: 15000000,
      utilized: 14200000,
      remaining: 2300000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 92,
      transparency: 90,
      accountability: 94,
      privacy: 96,
      security: 95,
      overallGrade: "Excellent"
    },
    readinessScore: 94,
    milestones: [
      { id: "m13-1", title: "Pharmacy inventory API sync", dueDate: "2023-04-15", progressPercent: 100, status: "Completed" },
      { id: "m13-2", title: "Epidemic predictive model validation", dueDate: "2024-09-30", progressPercent: 100, status: "Completed" },
      { id: "m13-3", title: "Community clinic autonomous restock trigger", dueDate: "2026-12-01", progressPercent: 60, status: "Pending" }
    ],
    risks: [
      {
        id: "r13-1",
        category: "Data Privacy Risk",
        severity: "High",
        likelihood: 1,
        impact: 4,
        description: "Potential leakage of prescription patterns revealing individual patient chronic conditions.",
        mitigationPlan: "Strip all patient PII at pharmacy terminal before telemetry transmission using k-anonymity (k=10).",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-13-1", fileName: "mPharma_DPC_Act843_Privacy_Impact.pdf", fileType: "pdf", uploadedAt: "2024-10-12", version: 1, signedBy: ["Chief Medical Officer", "DPC Lead Inspector"] }
    ]
  },
  {
    id: "proj-14",
    projectCode: "GN-AI-2026-014",
    name: "Zeepay Cross-Border Remittance Fraud & AML AI",
    description: "Fintech deep learning transaction monitoring engine. Inspects international inbound remittances, flags smurfing patterns, and enforces anti-money laundering (AML) controls under Bank of Ghana financial guidelines.",
    category: "Machine Learning",
    sector: "Finance",
    stage: "Operational",
    status: "Active",
    startDate: "2022-08-01",
    endDate: "2028-06-30",
    expectedCompletionDate: "2028-06-30",
    latitude: 5.5840,
    longitude: -0.1750,
    mda: "Private Commercial / Bank of Ghana Sandboxed",
    mdaCode: "Zeepay",
    organizationId: "org-14",
    organizationName: "Zeepay Ghana Ltd / Fintech AI Lab",
    entitySectorType: "Private Sector (Commercial Enterprise)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-014",
    clearanceScore: 95,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 95,
      decisionDate: "2024-11-20",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-014",
      validUntil: "2026-11-20",
      scopeLimits: "Mobile Money & Cross-Border Remittance Fraud Detection"
    },
    isOrganizationCleared: true,
    isPublished: true,
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 21000000,
      disbursed: 19500000,
      utilized: 18800000,
      remaining: 2200000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 90,
      transparency: 92,
      accountability: 96,
      privacy: 95,
      security: 98,
      overallGrade: "Excellent"
    },
    readinessScore: 96,
    milestones: [
      { id: "m14-1", title: "BoG regulatory sandbox compliance approval", dueDate: "2023-02-10", progressPercent: 100, status: "Completed" },
      { id: "m14-2", title: "Real-time AML graph neural network rollout", dueDate: "2024-05-18", progressPercent: 100, status: "Completed" },
      { id: "m14-3", title: "Synthetic identity fraud prevention engine", dueDate: "2026-11-15", progressPercent: 75, status: "Pending" }
    ],
    risks: [
      {
        id: "r14-1",
        category: "Financial & Compliance Risk",
        severity: "Critical",
        likelihood: 1,
        impact: 5,
        description: "False positive transaction freezes interrupting urgent diaspora remittances to rural relatives.",
        mitigationPlan: "Deploy human-in-the-loop review tier with 15-minute SLA for contested transactions.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-14-1", fileName: "Zeepay_AML_AI_Independent_Model_Audit.pdf", fileType: "pdf", uploadedAt: "2024-10-30", version: 2, signedBy: ["Head of Compliance", "External FinTech Auditor"] }
    ]
  },
  {
    id: "proj-15",
    projectCode: "GN-AI-2026-015",
    name: "Farmerline Mergdata Credit Scoring & Satellite Agronomy AI",
    description: "Agricultural credit assessment and satellite crop health analytics. Utilizes remote sensing vegetation indices and farm management records to grant micro-loans and input credits to unbanked farmers.",
    category: "Predictive Analytics",
    sector: "Agriculture",
    stage: "Operational",
    status: "Active",
    startDate: "2021-09-01",
    endDate: "2028-12-31",
    expectedCompletionDate: "2028-12-31",
    latitude: 6.6850,
    longitude: -1.6240,
    mda: "Private Commercial / MOFA Regulated",
    mdaCode: "Farmerline",
    organizationId: "org-15",
    organizationName: "Farmerline Africa Ltd",
    entitySectorType: "Private Sector (Commercial Enterprise)",
    riskTier: "High Risk",
    clearanceStatus: "Cleared",
    clearanceCertificateId: "NAPTCS-CLR-2026-015",
    clearanceScore: 91,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: true,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Cleared",
      overallScore: 91,
      decisionDate: "2024-12-05",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      clearanceCertificateId: "NAPTCS-CLR-2026-015",
      validUntil: "2026-12-05",
      scopeLimits: "Smallholder Farmer Agronomic Credit Scoring & Yield Forecasting"
    },
    isOrganizationCleared: true,
    isPublished: true,
    region: "Ashanti",
    district: "Kumasi Metropolitan",
    budget: {
      totalAllocated: 13000000,
      disbursed: 11800000,
      utilized: 11200000,
      remaining: 1800000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 94,
      transparency: 88,
      accountability: 90,
      privacy: 88,
      security: 90,
      overallGrade: "Excellent"
    },
    readinessScore: 90,
    milestones: [
      { id: "m15-1", title: "Mergdata AI algorithm launch", dueDate: "2022-07-20", progressPercent: 100, status: "Completed" },
      { id: "m15-2", title: "600,000 smallholder farmer credit profiling", dueDate: "2024-08-15", progressPercent: 100, status: "Completed" },
      { id: "m15-3", title: "Climate resilience index integration", dueDate: "2026-10-31", progressPercent: 50, status: "Pending" }
    ],
    risks: [
      {
        id: "r15-1",
        category: "Algorithmic Bias Risk",
        severity: "Medium",
        likelihood: 2,
        impact: 4,
        description: "Algorithmic bias penalizing female farmers who lack formal customary land titles.",
        mitigationPlan: "Incorporate community peer-vouching and cooperative group harvest guarantees into credit scoring model.",
        status: "Mitigated"
      }
    ],
    documents: [
      { id: "doc-15-1", fileName: "Farmerline_Algorithmic_Fairness_Report.pdf", fileType: "pdf", uploadedAt: "2024-11-18", version: 1, signedBy: ["CTO", "Lead Agronomist"] }
    ]
  },

  // ---------------- QUARANTINED / PENDING CLEARANCE PROJECTS ----------------
  {
    id: "proj-16",
    projectCode: "GN-AI-2026-016",
    name: "WiredWave Autonomous Mining Drone Inspector",
    description: "Computer vision and autonomous drone fleet for commercial open-cast gold mining inspection in the Western Region. Automatically calculates earthwork volumes and detects perimeter intrusions.",
    category: "Robotics",
    sector: "Security",
    stage: "Development",
    status: "Active",
    startDate: "2025-01-10",
    endDate: "2028-12-31",
    expectedCompletionDate: "2028-12-31",
    latitude: 5.2500,
    longitude: -2.0500,
    mda: "Private Sector Startup",
    mdaCode: "WiredWave",
    organizationId: "org-16",
    organizationName: "WiredWave Robotics & Computer Vision Ltd",
    entitySectorType: "Private Sector (Startup/SME)",
    riskTier: "High Risk",
    clearanceStatus: "Pending Review",
    clearanceScore: 54,
    clearanceEvidence: {
      dpiaUploaded: false,
      vaptReportUploaded: false,
      modelDocumentationUploaded: true,
      slaUploaded: false,
      biasAuditUploaded: false,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Pending Review",
      overallScore: 54,
      decisionDate: "Pending Decision",
      decidedBy: "Awaiting Committee Evaluation",
      mandatoryGateOverride: "Parent organization 'WiredWave Robotics' has not yet attained Sovereign Clearance from the Regulator. DPIA and VAPT reports missing."
    },
    isOrganizationCleared: false,
    isPublished: false, // QUARANTINED!
    region: "Western",
    district: "Tarkwa Nsuaem",
    budget: {
      totalAllocated: 4500000,
      disbursed: 2000000,
      utilized: 1800000,
      remaining: 2700000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 70,
      transparency: 65,
      accountability: 60,
      privacy: 50,
      security: 65,
      overallGrade: "Moderate"
    },
    readinessScore: 68,
    milestones: [
      { id: "m16-1", title: "Drone fleet hardware prototyping", dueDate: "2025-06-30", progressPercent: 100, status: "Completed" },
      { id: "m16-2", title: "Computer vision pit volumetric training", dueDate: "2026-03-31", progressPercent: 80, status: "Pending" }
    ],
    risks: [
      {
        id: "r16-1",
        category: "Aviation Safety Risk",
        severity: "Critical",
        likelihood: 2,
        impact: 5,
        description: "Drone collisions with active mining heavy machinery during night flights.",
        mitigationPlan: "Implement optical obstacle avoidance and geofenced safe landing zones.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-16-1", fileName: "WiredWave_Preliminary_Architecture.pdf", fileType: "pdf", uploadedAt: "2026-02-14", version: 1, signedBy: ["Founder"] }
    ]
  },
  {
    id: "proj-17",
    projectCode: "GN-AI-2026-017",
    name: "Apex Civic Engagement & Public Chatbot",
    description: "Multilingual generative AI conversational assistant providing public service information, local school registrations, and council waste collection schedules across selected municipalities.",
    category: "Generative AI",
    sector: "Education",
    stage: "Pilot",
    status: "Active",
    startDate: "2025-06-01",
    endDate: "2027-12-31",
    expectedCompletionDate: "2027-12-31",
    latitude: 5.6200,
    longitude: -0.1600,
    mda: "International Vendor Partnership",
    mdaCode: "Apex AI",
    organizationId: "org-17",
    organizationName: "Apex Cognitive Technologies International",
    entitySectorType: "International Vendor / Partner",
    riskTier: "Limited Risk",
    clearanceStatus: "Conditional",
    clearanceCertificateId: "NAPTCS-CLR-2026-017-COND",
    clearanceScore: 74,
    clearanceEvidence: {
      dpiaUploaded: true,
      vaptReportUploaded: true,
      modelDocumentationUploaded: true,
      slaUploaded: true,
      biasAuditUploaded: false,
      procurementRecordsUploaded: true
    },
    clearanceDecision: {
      status: "Conditional",
      overallScore: 74,
      decisionDate: "2026-01-25",
      decidedBy: "NAPTCS Technical Review Committee",
      clearanceCertificateId: "NAPTCS-CLR-2026-017-COND",
      validUntil: "2026-07-25",
      scopeLimits: "Civic Information Q&A Only (No Personal Identity Processing)",
      conditions: [
        { id: "c-17", requirement: "Complete data residency migration ensuring Ghanaian citizen chat logs are stored strictly inside Ghana's borders under Act 843.", deadline: "2026-07-01", status: "Open" }
      ]
    },
    isOrganizationCleared: true,
    isPublished: true,
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 3200000,
      disbursed: 2100000,
      utilized: 1900000,
      remaining: 1300000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 72,
      transparency: 78,
      accountability: 74,
      privacy: 75,
      security: 80,
      overallGrade: "Good"
    },
    readinessScore: 82,
    milestones: [
      { id: "m17-1", title: "Pilot municipal launch in Accra and Tema", dueDate: "2025-10-15", progressPercent: 100, status: "Completed" },
      { id: "m17-2", title: "Local language dialect fine-tuning", dueDate: "2026-06-30", progressPercent: 65, status: "Pending" }
    ],
    risks: [
      {
        id: "r17-1",
        category: "Hallucination Risk",
        severity: "Medium",
        likelihood: 3,
        impact: 3,
        description: "Chatbot hallucinating incorrect statutory property rate payment instructions.",
        mitigationPlan: "Enforce strict retrieval-augmented generation (RAG) restricted to official municipal bylaws.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-17-1", fileName: "Apex_Chatbot_RAG_Safeguards.pdf", fileType: "pdf", uploadedAt: "2025-12-01", version: 1, signedBy: ["Director of AI"] }
    ]
  },
  {
    id: "proj-18",
    projectCode: "GN-AI-2026-018",
    name: "DarkStar Autonomous Facial Mass Surveillance Scanner",
    description: "An unapproved commercial facial recognition CCTV scanning network intended for shopping mall visitor tracking and commercial behavioural advertising profiling.",
    category: "Computer Vision",
    sector: "Security",
    stage: "Concept",
    status: "Suspended",
    startDate: "2025-04-01",
    endDate: "2026-04-01",
    expectedCompletionDate: "2026-04-01",
    latitude: 5.6100,
    longitude: -0.1900,
    mda: "Unapproved Commercial Entity",
    mdaCode: "DarkStar",
    organizationId: "org-18",
    organizationName: "DarkStar Analytics Ghana Ltd",
    entitySectorType: "Private Sector (Commercial Enterprise)",
    riskTier: "Prohibited",
    clearanceStatus: "Not Cleared",
    clearanceScore: 28,
    clearanceEvidence: {
      dpiaUploaded: false,
      vaptReportUploaded: false,
      modelDocumentationUploaded: false,
      slaUploaded: false,
      biasAuditUploaded: false,
      procurementRecordsUploaded: false
    },
    clearanceDecision: {
      status: "Not Cleared",
      overallScore: 28,
      decisionDate: "2025-09-01",
      decidedBy: "NAPTCS Regulator / Clearance Authority",
      mandatoryGateOverride: "PROHIBITED SYSTEM: Real-time untargeted biometric facial surveillance in public retail areas without statutory authorization violates Ghana Data Protection Act 2012 (Act 843 Section 20) and national AI governance red-lines."
    },
    isOrganizationCleared: false,
    isPublished: false, // BLOCKED & HIDDEN FROM PUBLIC SYSTEM!
    region: "Greater Accra",
    district: "Accra Metropolitan",
    budget: {
      totalAllocated: 5000000,
      disbursed: 500000,
      utilized: 450000,
      remaining: 4550000,
      primaryFundingSource: "Private Sector",
      currency: "GHS"
    },
    compliance: {
      fairness: 25,
      transparency: 20,
      accountability: 30,
      privacy: 15,
      security: 40,
      overallGrade: "High Risk"
    },
    readinessScore: 35,
    milestones: [
      { id: "m18-1", title: "Commercial proposal drafted", dueDate: "2025-05-01", progressPercent: 100, status: "Completed" },
      { id: "m18-2", title: "Regulatory submission rejected", dueDate: "2025-09-01", progressPercent: 100, status: "Completed" }
    ],
    risks: [
      {
        id: "r18-1",
        category: "Constitutional Privacy Risk",
        severity: "Critical",
        likelihood: 5,
        impact: 5,
        description: "Mass public biometric profiling without consent infringing Article 18(2) constitutional privacy rights.",
        mitigationPlan: "Decommission system immediately as mandated by Regulator injunction.",
        status: "Open"
      }
    ],
    documents: [
      { id: "doc-18-1", fileName: "NAPTCS_Rejection_Notice_DarkStar.pdf", fileType: "pdf", uploadedAt: "2025-09-01", version: 1, signedBy: ["Director General, NITA", "Data Protection Commissioner"] }
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
  { name: "Greater Accra", center: [5.6037, -0.1870], projectCount: 6, description: "Capital administrative hub, hosting GhanaCard biometric AFIS, national digital address systems, E-Justice registry, NHIS Claims AI validation, and private fintech/healthtech AI labs." },
  { name: "Ashanti", center: [6.6922, -1.6163], projectCount: 2, description: "Ashanti region administrative and digital technology hub, hosting Kumasi Urban Mobility Vision AI and Farmerline Mergdata AgTech AI." },
  { name: "Western", center: [4.9340, -1.7580], projectCount: 2, description: "Western coastal and maritime hub, hosting Takoradi Port Autonomous Container OCR & Customs Vision, and Tarkwa mining drone inspection." },
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
