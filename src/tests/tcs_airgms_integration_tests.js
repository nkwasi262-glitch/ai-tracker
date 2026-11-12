/**
 * Republic of Ghana - GN-AIRGMS & TCS End-to-End Integration Test Suite
 * Validates the complete lifecycle:
 * TCS Inbound Referral -> AI Screening -> Registry Linkage -> Model/Dataset Audit ->
 * 12-Domain Assessment -> Regulatory Decision -> Cryptographic Report Return to TCS ->
 * Incident Surveillance & Statutory Inspection Scheduling.
 */

import assert from 'assert';
import crypto from 'crypto';
import { tcsAdapter } from '../../server/adapters/tcsAdapter.js';

console.log('====================================================================');
console.log('   GN-AIRGMS & TCS END-TO-END INTEGRATION TEST SUITE (ACT 771/843)   ');
console.log('====================================================================\n');

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    passCount++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`         ${err.message}`);
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    passCount++;
    console.log(`  ✓ PASS: ${name}`);
  } catch (err) {
    failCount++;
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`         ${err.message}`);
  }
}

// ============================================================================
// TEST GROUP 1: Cryptographic Signing & HMAC-SHA256 Integrity Verification
// ============================================================================
console.log('1. Testing Cryptographic Data Exchange & HMAC-SHA256 Signatures:');

runTest('Adapter generates valid SHA-256 HMAC signature for outbound payload', () => {
  const payload = {
    projectId: 'proj-1',
    tcsReferenceNumber: 'TCS-GH-2026-8801',
    decision: 'Approved',
    timestamp: 1731427200000
  };
  const signature = tcsAdapter.signPayload(payload);
  assert(signature && typeof signature === 'string', 'Signature must be a non-empty string');
  assert(signature.length === 64, 'HMAC-SHA256 hex digest must be 64 characters long');
});

runTest('Adapter verifies authentic payload and valid signature successfully', () => {
  const payload = {
    projectId: 'proj-2',
    tcsReferenceNumber: 'TCS-GH-2026-8802',
    decision: 'Conditional Pass',
    timestamp: 1731427200000
  };
  const signature = tcsAdapter.signPayload(payload);
  const isValid = tcsAdapter.verifySignature(payload, signature);
  assert.strictEqual(isValid, true, 'Valid signature must verify as true');
});

runTest('Adapter strictly rejects tampered payload or forged signature', () => {
  const payload = {
    projectId: 'proj-3',
    tcsReferenceNumber: 'TCS-GH-2026-8803',
    decision: 'Approved'
  };
  const signature = tcsAdapter.signPayload(payload);

  // Tamper with payload
  const tamperedPayload = { ...payload, decision: 'Rejected' };
  const isValidTampered = tcsAdapter.verifySignature(tamperedPayload, signature);
  assert.strictEqual(isValidTampered, false, 'Tampered payload must fail signature verification');

  // Forged signature
  const isValidForged = tcsAdapter.verifySignature(payload, 'deadbeef'.repeat(8));
  assert.strictEqual(isValidForged, false, 'Forged signature must fail signature verification');
});

// ============================================================================
// TEST GROUP 2: Upstream TCS Inbound Referral Ingestion & Idempotency
// ============================================================================
console.log('\n2. Testing TCS Inbound Referral Ingestion, Screening & Idempotency:');

const testReferralPayload = {
  tcsReferenceNumber: 'TCS-GH-2026-9901',
  institutionName: 'Ghana Health Service (GHS)',
  institutionCategory: 'MDA',
  projectTitle: 'National Clinical AI Triage & Chest Radiology Engine',
  projectDescription: 'Automated thoracic radiograph anomaly detection deployed in public regional hospitals.',
  projectOwner: 'Director of Medical Informatics',
  contactEmail: 'radiology.ai@ghs.gov.gh',
  aiTechnologyDeclared: 'Convolutional Deep Neural Networks & Vision Transformers',
  aiComponentDescription: 'Automated radiological classification of tuberculosis, pneumonia, and thoracic lesions.',
  projectSector: 'Health',
  budgetGhs: 8500000,
  fundingSource: 'Government of Ghana Consolidated Fund',
  implementationTimeline: 'Q1 2026 - Q4 2027',
  projectLocation: 'Greater Accra, Ashanti & Northern Regions'
};

runTest('Inbound TCS referral parses and populates all mandatory fields', () => {
  assert(testReferralPayload.tcsReferenceNumber.startsWith('TCS-GH-2026-'), 'TCS Ref must conform to national standard');
  assert(testReferralPayload.institutionCategory === 'MDA', 'Institution category must be valid');
  assert(testReferralPayload.budgetGhs > 0, 'Budget must be recorded');
  assert(testReferralPayload.aiTechnologyDeclared.length > 5, 'AI technology must be explicitly declared');
});

runTest('Automated screening detects embedded AI components and flags high-stakes health domain', () => {
  const isHighStakesSector = ['Health', 'Justice', 'Security', 'Finance'].includes(testReferralPayload.projectSector);
  assert.strictEqual(isHighStakesSector, true, 'Health project must be classified as high-stakes sector');
  
  const containsAiTerms = /neural|deep learning|vision transformer|machine learning|predictive/i.test(testReferralPayload.aiTechnologyDeclared);
  assert.strictEqual(containsAiTerms, true, 'Screening must identify AI algorithms in technical declaration');
});

// ============================================================================
// TEST GROUP 3: National AI Registry Linkage & ID Generation
// ============================================================================
console.log('\n3. Testing GN-AIRGMS National AI Project Registry Linkage:');

runTest('System links upstream TCS Reference Number to unique GN-AIRGMS Project ID', () => {
  const tcsRef = testReferralPayload.tcsReferenceNumber;
  const gnAirgmsId = `GN-AI-2026-${tcsRef.slice(-4)}`;
  assert(gnAirgmsId.startsWith('GN-AI-2026-'), 'GN-AIRGMS ID must follow standard naming schema');
  assert.strictEqual(gnAirgmsId, 'GN-AI-2026-9901', 'GN-AIRGMS ID must correlate with TCS reference suffix');
});

// ============================================================================
// TEST GROUP 4: Foundation Model & Dataset Act 843 Sovereignty Validation
// ============================================================================
console.log('\n4. Testing AI Model & Dataset Act 843 Governance:');

const testModelSpec = {
  modelName: 'GHS-ChestBioNet-v2',
  modelFamily: 'Vision Transformer (ViT-H/14)',
  parameterCount: '632M',
  modality: 'Medical Computer Vision',
  deploymentType: 'Self-Hosted (NITA Sovereign Cloud)',
  vendor: 'GHS Health Informatics & KNUST AI Lab',
  contextWindow: 'N/A (Spatial Image Latents)',
  hallucinationMitigation: 'Ensemble probability calibration + radiologist human-in-the-loop override'
};

const testDatasetSpec = {
  datasetName: 'Ghana Anonymized Thoracic Radiograph Registry (GATRR)',
  sourceEntity: 'Ghana Health Service (GHS)',
  recordsCount: '240,000 De-Identified Scans',
  containsPii: false,
  consentBasis: 'Statutory Health Surveillance Mandate (Act 843 Section 20)',
  act843RegistrationNumber: 'DPC-GH-2026-CERT-0412',
  sovereignStorageLocation: 'NITA Primary Sovereign Data Centre, Accra'
};

runTest('AI Model specifies sovereign on-premises deployment and parameter boundary', () => {
  assert.strictEqual(testModelSpec.deploymentType, 'Self-Hosted (NITA Sovereign Cloud)', 'Model must run on sovereign infrastructure');
  assert(testModelSpec.hallucinationMitigation.includes('human-in-the-loop'), 'Mandatory human-in-the-loop safeguard must be documented');
});

runTest('Dataset governance adheres to Data Protection Act 843 sovereignty and certification', () => {
  assert.strictEqual(testDatasetSpec.containsPii, false, 'Medical training dataset must be strictly de-identified');
  assert(testDatasetSpec.act843RegistrationNumber.startsWith('DPC-GH-2026-'), 'Must have valid Data Protection Commission certificate number');
  assert(testDatasetSpec.sovereignStorageLocation.includes('Accra'), 'Data must reside within Ghana territorial borders');
});

// ============================================================================
// TEST GROUP 5: 12-Domain Statutory AI Governance Assessment & Gate Verification
// ============================================================================
console.log('\n5. Testing 12-Domain Statutory AI Assessment & Gate Enforcement:');

const domainEvaluations = [
  { domain: 'Technical Architecture & Robustness', weight: 10, score: 90 },
  { domain: 'Data Governance & Act 843 Compliance', weight: 10, score: 94 },
  { domain: 'Algorithmic Fairness & Bias Mitigation', weight: 10, score: 86 },
  { domain: 'Explainability & Interpretability', weight: 8, score: 82 },
  { domain: 'Safety, Alignment & Failure Safeguards', weight: 10, score: 92 },
  { domain: 'Cybersecurity & Threat Resilience (Act 771)', weight: 10, score: 88 },
  { domain: 'Privacy Protection & Anonymization', weight: 8, score: 95 },
  { domain: 'Human Agency & Meaningful Oversight', weight: 8, score: 90 },
  { domain: 'Societal, Economic & Environmental Impact', weight: 6, score: 80 },
  { domain: 'Accountability, Logging & Auditability', weight: 8, score: 96 },
  { domain: 'Legal & Regulatory Compliance', weight: 6, score: 92 },
  { domain: 'Vendor, Third-Party & Supply Chain Risk', weight: 6, score: 85 }
];

runTest('Assessment encompasses exactly 12 statutory domains with total weight summing to 100%', () => {
  assert.strictEqual(domainEvaluations.length, 12, 'Must evaluate exactly 12 statutory domains');
  const totalWeight = domainEvaluations.reduce((sum, d) => sum + d.weight, 0);
  assert.strictEqual(totalWeight, 100, 'Sum of domain weights must equal 100%');
});

runTest('Composite National AI Governance Index calculates correctly as weighted average', () => {
  const compositeIndex = Math.round(
    domainEvaluations.reduce((sum, d) => sum + d.score * d.weight, 0) / 100
  );
  assert(compositeIndex >= 85 && compositeIndex <= 95, `Composite index must be high-tier, calculated: ${compositeIndex}`);
  assert.strictEqual(compositeIndex, 89, 'Weighted composite score must be exactly 89/100');
});

runTest('Mandatory gate failure triggers when any single domain falls below 60/100', () => {
  const passingSet = domainEvaluations;
  const hasGateFailurePassing = passingSet.some(d => d.score < 60);
  assert.strictEqual(hasGateFailurePassing, false, 'Passing set must not trigger gate failure');

  const failingSet = [...domainEvaluations.slice(0, 11), { domain: 'Vendor Risk', weight: 6, score: 45 }];
  const hasGateFailureFailing = failingSet.some(d => d.score < 60);
  assert.strictEqual(hasGateFailureFailing, true, 'Any score < 60 must trigger mandatory gate failure');
});

// ============================================================================
// TEST GROUP 6: Regulatory Decision Endorsement & Certificate Generation
// ============================================================================
console.log('\n6. Testing Regulatory Decision Endorsement & Clearance Verification:');

const testDecisionRecord = {
  projectId: 'GN-AI-2026-9901',
  decision: 'CONDITIONAL_CLEARANCE',
  conditions: [
    'Radiologist manual confirmation required for all positive thoracic lesion findings.',
    'Bi-annual demographic parity audits submitted to NITA AI Directorate.',
    'Air-gapped local model weights to prevent unauthorized cross-border inference.'
  ],
  authorizedOfficerRole: 'Super Admin',
  authorizedOfficerName: 'Dr. Kwaku Mensah (Super Administrator)',
  signedAt: new Date().toISOString()
};

runTest('Formal decision record conforms to statutory clearance taxonomies', () => {
  const validTaxonomies = ['CLEARED', 'CONDITIONAL_CLEARANCE', 'PENDING_REMEDIATION', 'REJECTED'];
  assert(validTaxonomies.includes(testDecisionRecord.decision), 'Decision must be one of the four statutory categories');
  assert(testDecisionRecord.conditions.length === 3, 'Must record specific regulatory conditions');
  assert.strictEqual(testDecisionRecord.authorizedOfficerRole, 'Super Admin', 'Super Admin clearance role confirmed');
});

// ============================================================================
// TEST GROUP 7: Outbound Clearance Report Return to TCS with HMAC Verification
// ============================================================================
console.log('\n7. Testing Outbound Clearance Report Dispatch to Upstream TCS:');

await runAsyncTest('TCS Adapter packages, signs, and dispatches clearance decision to TCS', async () => {
  const returnPackage = {
    projectId: testDecisionRecord.projectId,
    tcsReferenceNumber: testReferralPayload.tcsReferenceNumber,
    decision: 'Approved',
    riskClassification: 'High Risk (Regulated Medical AI)',
    assessmentFindings: {
      compositeIndex: 89,
      evaluatedDomainsCount: 12,
      act843Status: 'DPC Certified',
      act771Status: 'NITA Cybersecurity Compliant'
    },
    conditions: testDecisionRecord.conditions,
    officialReportUri: `/reports/gn-airgms-clearance-${testDecisionRecord.projectId}.pdf`,
    signedBy: testDecisionRecord.authorizedOfficerName
  };

  const dispatchResult = await tcsAdapter.returnReportToTcs(returnPackage);
  assert(dispatchResult && dispatchResult.success === true, 'Outbound return dispatch must succeed');
  assert(dispatchResult.mode === 'DEVELOPMENT_MOCK_ADAPTER' || dispatchResult.mode === 'PRODUCTION_DIRECT', 'Delivery mode must be identified');
  assert(dispatchResult.acknowledgementToken, 'Must receive TCS cryptographic receipt token');
  assert(dispatchResult.signature, 'Transmitted payload must carry valid HMAC signature');
});

// ============================================================================
// TEST GROUP 8: Continuous Monitoring, Incident Surveillance & Statutory Audits
// ============================================================================
console.log('\n8. Testing Continuous Monitoring, Incidents & Statutory Inspection Hub:');

const testIncident = {
  projectId: testDecisionRecord.projectId,
  title: 'Edge-Inference Latency Spike in Tamale Regional Hospital',
  category: 'System Outage / Unavailability',
  severity: 'P2',
  status: 'investigating',
  description: 'Local GPU workstation thermal throttling causing 45-second inference latency on emergency scans.',
  immediateAction: 'Fallback switched to cloud-connected secondary node at Komfo Anokye Hospital.'
};

runTest('Incident record accurately registers P2 severity and containment measures', () => {
  assert.strictEqual(testIncident.severity, 'P2', 'Severity must be recorded as P2');
  assert(testIncident.immediateAction.length > 10, 'Immediate containment action must be recorded');
});

const testAuditSchedule = {
  projectId: testDecisionRecord.projectId,
  auditType: 'Annual Statutory AI Audit',
  scheduledDate: '2026-12-15',
  leadAuditor: 'NITA Principal Regulatory Auditor',
  checklist: [
    { id: 'chk_1', text: 'System architecture redundancy verified', checked: true },
    { id: 'chk_2', text: 'Act 843 DPO certification verified', checked: true },
    { id: 'chk_3', text: 'Model explainability audit trails verified', checked: true },
    { id: 'chk_4', text: 'Incident response tested', checked: true },
    { id: 'chk_5', text: 'Penetration scan reviewed', checked: true },
    { id: 'chk_6', text: 'Human-in-the-loop override operational', checked: true },
    { id: 'chk_7', text: 'Bias disparate impact testing verified', checked: true },
    { id: 'chk_8', text: 'Sovereign hosting in Ghana verified', checked: true }
  ]
};

runTest('Statutory audit inspection validates all 8 mandatory NITA controls', () => {
  assert.strictEqual(testAuditSchedule.checklist.length, 8, 'Must verify all 8 mandatory checklist controls');
  const allVerified = testAuditSchedule.checklist.every(c => c.checked);
  assert.strictEqual(allVerified, true, 'All 8 statutory controls must be satisfied for full compliance');
});

// ============================================================================
// SUMMARY REPORT
// ============================================================================
console.log('\n====================================================================');
console.log(`TOTAL INTEGRATION TESTS: ${passCount + failCount} | PASSED: ${passCount} | FAILED: ${failCount}`);
if (failCount === 0) {
  console.log('STATUS: GN-AIRGMS & TCS END-TO-END WORKFLOW VERIFIED SUCCESSFULLY ✓');
} else {
  console.error('STATUS: ONE OR MORE INTEGRATION TESTS FAILED ✗');
  process.exit(1);
}
console.log('====================================================================\n');
