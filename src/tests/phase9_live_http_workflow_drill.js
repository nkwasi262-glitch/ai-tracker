/**
 * REPUBLIC OF GHANA - NATIONAL INFORMATION TECHNOLOGY AGENCY (NITA)
 * PHASE 9: LIVE HTTP WORKFLOW & TCS INTERFACE DRILL (ACT 771 / 843)
 *
 * Executes real HTTP requests against the active GN-AIRGMS server on http://localhost:5000:
 *  - 1. Server Health & PostgreSQL Connectivity Check
 *  - 2. Step 1: Secure Inbound TCS Referral Ingestion with HMAC-SHA256
 *  - 3. Step 2: Live Registry Validation & Duplicate Detection
 *  - 4. Step 5 & 6: Operational Workflow Lifecycle Step Transition & Incident Intake
 *  - 5. Step 8: Outbound Signed Clearance Report Dispatch to Upstream TCS
 *  - 6. Act 843 Forensic Audit Trail Ingestion Check
 */

import http from 'http';
import tcsAdapter from '../../server/adapters/tcsAdapter.js';

const BASE_URL = 'http://localhost:5000';
let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

function postJson(urlPath, data, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(`${BASE_URL}${urlPath}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
        ...headers
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getJson(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`${BASE_URL}${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    }).on('error', reject);
  });
}

async function runLiveDrill() {
  console.log('\n====================================================================');
  console.log('   PHASE 9: LIVE HTTP WORKFLOW & TCS INTERFACE DRILL EXECUTION     ');
  console.log('====================================================================\n');

  try {
    // 1. Health check & projects list
    console.log('1. Testing Live Server Health & Core Registry Endpoints:');
    const health = await getJson('/api/health');
    assert(health.status === 200 && health.data.status === 'ok', 'GN-AIRGMS API server responds healthy on port 5000');

    const projectsRes = await getJson('/api/projects');
    const projectList = projectsRes.data.projects || (Array.isArray(projectsRes.data) ? projectsRes.data : []);
    assert(projectsRes.status === 200 && Array.isArray(projectList) && projectList.length > 0, `Central Project Registry returns ${projectList.length} live database records`);

    const activeProject = projectList[0];
    const targetProjectId = activeProject?.id || 'proj-1';

    // 2. Step 1: Inbound referral with HMAC-SHA256 signature
    console.log('\n2. Testing Step 1: Inbound TCS Referral with Cryptographic Signature:');
    const referralData = {
      tcsReferenceNumber: `TCS-GH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      institution: {
        name: 'Ministry of Environment, Science and Technology',
        code: 'MESTI'
      },
      project: {
        title: 'Satellite & Drone AI for Galamsey Detection',
        description: 'AI-driven hyperspectral satellite surveillance over river bodies in Eastern and Ashanti regions.',
        budget: 8500000,
        intendedUse: 'Automated illegal mining detection'
      },
      aiDeclaration: {
        containsAi: true,
        technologyTypes: ['Computer Vision', 'Predictive Analytics'],
        isCitizenAffecting: true,
        isCriticalInfrastructure: true
      },
      timestamp: new Date().toISOString()
    };
    const secret = process.env.TCS_SECRET_KEY || 'gn-airgms-tcs-mock-secret-key-2026';
    const sig = tcsAdapter.signPayload(referralData, secret);

    const inboundRes = await postJson('/api/tcs/referrals/inbound', referralData, {
      'x-tcs-signature': sig
    });
    assert(inboundRes.status === 200 || inboundRes.status === 201 || inboundRes.status === 202, `Live server accepts inbound referral (HTTP ${inboundRes.status} ACCEPTED)`);
    assert(inboundRes.data.status === 'ACCEPTED' || inboundRes.data.success === true, 'Inbound referral returns statutory acknowledgement receipt');

    // 3. Step 2: Registry Validation & Duplicate Detection
    console.log('\n3. Testing Step 2: National Registry Validation & Duplicate Scanner:');
    const validateRes = await postJson('/api/projects/validate-registry', {
      name: 'Satellite & Drone AI for Galamsey Detection',
      mda: 'Ministry of Environment, Science and Technology',
      sector: 'Environment',
      category: 'Computer Vision',
      budget: 8500000,
      description: 'AI-driven hyperspectral satellite surveillance over river bodies'
    });
    assert(validateRes.status === 200, 'Registry validation endpoint responds with HTTP 200');
    assert(validateRes.data.completenessScore >= 80, `Project achieves passing completeness score: ${validateRes.data.completenessScore}%`);
    assert(validateRes.data.uniqueRegistryId.startsWith('GN-AI-2026-'), `Allocated unique project code: ${validateRes.data.uniqueRegistryId}`);

    // 4. Step 5 & 6: Operational Workflow Lifecycle & Incident Center
    console.log('\n4. Testing Operational Lifecycle & AI Incident Response:');
    const stepRes = await postJson(`/api/projects/${targetProjectId}/operational-workflow/step`, {
      stepNumber: 5,
      stepData: { milestone: 'Production Baseline Confirmed' },
      actorName: 'Dr. Kwabena Boateng',
      actorRole: 'Super Admin',
      notes: 'Phase 9 Live drill advancement'
    });
    assert(stepRes.status === 200, 'Project successfully transitioned through operational workflow step via live API');

    const incidentRes = await postJson('/api/incidents', {
      projectId: targetProjectId,
      title: 'Drift Warning: False positive elevation in dense cloud cover',
      severity: 'Low',
      category: 'Model Drift',
      status: 'Reported',
      assignedInvestigator: 'Technical Unit Vision Lead'
    });
    assert(incidentRes.status === 200 || incidentRes.status === 201, 'AI Incident Center logs live operational anomaly');

    // 5. Outbound Signed Report Return to TCS
    console.log('\n5. Testing Outbound Signed Clearance Dossier Return to Upstream TCS:');
    const clearanceReport = {
      projectId: targetProjectId,
      tcsReferenceNumber: referralData.tcsReferenceNumber,
      decision: 'Approved',
      riskClassification: 'High Risk',
      overallScore: 86.4,
      decidedByName: 'Dr. Kwabena Boateng',
      decidedByRole: 'Super Admin',
      bindingConditions: [
        'NITA quarterly calibration inspection required.',
        'Act 843 environmental imagery privacy masking must remain active.'
      ]
    };
    const returnRes = await postJson('/api/tcs/reports/return', clearanceReport);
    assert(returnRes.status === 200, `Outbound clearance dossier accepted by dispatcher (HTTP ${returnRes.status})`);
    assert(returnRes.data.success === true, 'Upstream TCS acknowledges receipt and updates clearance ledger');

    // 6. Act 843 Forensic Audit Logs
    console.log('\n6. Testing Act 843 Immutable Forensic Audit Trail:');
    const auditRes = await getJson('/api/audit-logs');
    const logsList = auditRes.data.auditLogs || (Array.isArray(auditRes.data) ? auditRes.data : []);
    assert(auditRes.status === 200 && Array.isArray(logsList), 'Audit logs retrieved from live forensic storage');
    assert(logsList.length > 0, `Forensic audit trail confirms immutable records (Count: ${logsList.length})`);

    console.log('\n====================================================================');
    console.log(`TOTAL PHASE 9 TESTS: ${totalTests} | PASSED: ${passedTests} | FAILED: ${totalTests - passedTests}`);
    if (totalTests === passedTests) {
      console.log('STATUS: LIVE HTTP WORKFLOW & TCS DRILL COMPLETED WITH 100% PASS ✓');
    } else {
      console.log('STATUS: LIVE DRILL ENCOUNTERED FAILURES ❌');
    }
    console.log('====================================================================\n');
  } catch (err) {
    console.error('Live drill failed with network error:', err);
    process.exitCode = 1;
  }
}

runLiveDrill();
