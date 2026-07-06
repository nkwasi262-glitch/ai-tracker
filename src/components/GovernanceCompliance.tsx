import React, { useState, useEffect } from 'react';
import { ShieldCheck, Award, AlertTriangle, Info, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { AIProject, ComplianceScore } from '../data/sampleProjects';
import { UserRole } from './RoleSwitcher';

interface GovernanceComplianceProps {
  projects: AIProject[];
  onUpdateCompliance: (projectId: string, newScore: ComplianceScore) => void;
  currentRole: UserRole;
}

interface SubParameter {
  id: string;
  text: string;
  description: string;
}

interface AuditQuestion {
  id: string;
  category: 'fairness' | 'transparency' | 'privacy' | 'security';
  text: string;
  description: string;
  subParameters: SubParameter[];
}

const frameworkQuestions: Record<string, AuditQuestion[]> = {
  Ghana: [
    {
      id: 'f1',
      category: 'fairness',
      text: 'Training datasets evaluated and balanced across all 16 Ghanaian regions to prevent regional bias.',
      description: 'Ensures that agricultural, demographic, and financial models perform equally well across the Northern, Southern, Eastern, and Western zones of Ghana.',
      subParameters: [
        { id: 'f1_sub1', text: 'Training records represent Northern, Savannah, and North East agricultural zones.', description: 'Validates model accuracy in historically under-sampled rural farming cooperatives.' },
        { id: 'f1_sub2', text: 'Training records represent Southern, coastal, and forest belt economic hubs.', description: 'Validates model performance in highly populated urban regions like Greater Accra and Ashanti.' }
      ]
    },
    {
      id: 'f2',
      category: 'fairness',
      text: 'Model algorithms tested for gender and tribal label parity (e.g. Twi/Fante speech samples equal representation).',
      description: 'Mitigates linguistic bias by validating that dialectal variations and gender voices are accurately recognized and represented.',
      subParameters: [
        { id: 'f2_sub1', text: 'Speech/text validation sets contain 50%+ representation of Akan family dialects.', description: 'Ensures the largest dialect family has clean, noise-free samples for baseline validation.' },
        { id: 'f2_sub2', text: 'Speech/text validation sets contain equal metrics for Ga-Adangbe and Ewe language samples.', description: 'Prevents predictive degradation or acoustic mismatch errors for minority regional languages.' }
      ]
    },
    {
      id: 'f3',
      category: 'fairness',
      text: 'Socio-Economic Inclusivity features implemented (e.g. local language voice prompts for low-literacy segments).',
      description: 'Enables rural and low-literacy citizens to access benefits and services without facing tech-exclusion barriers.',
      subParameters: [
        { id: 'f3_sub1', text: 'Offline SMS or USSD channel built for remote deployment.', description: 'Allows queries without requiring a smartphone or stable 3G/4G network access.' },
        { id: 'f3_sub2', text: 'Interactive voice response (IVR) or local dialect audio narration available.', description: 'Provides audio guidance in local dialects for citizens who cannot read or write text.' }
      ]
    },
    {
      id: 't1',
      category: 'transparency',
      text: 'Comprehensive Model Card detailing neural architecture, hyper-parameters, and limitations published.',
      description: 'Provides a standardized reference document for system design, training runs, and operational limits of the AI.',
      subParameters: [
        { id: 't1_sub1', text: 'Neural network layers, quantization levels, and compression techniques documented.', description: 'Lists optimization records, especially when compressing weights for local MDA servers.' },
        { id: 't1_sub2', text: 'Accuracy metrics, failure modes, and training boundary thresholds declared.', description: 'Allows auditors to inspect when and where the model outputs become untrustworthy.' }
      ]
    },
    {
      id: 't2',
      category: 'transparency',
      text: 'Source dataset origins and labeling metadata catalogued and accessible for civil audits.',
      description: 'Enables transparency by recording who gathered the data, who annotated it, and how consent was obtained.',
      subParameters: [
        { id: 't2_sub1', text: 'Data provenance register details collector MDA and participant consent sheets.', description: 'Confirms that datasets were compiled legally and in line with ethical requirements.' },
        { id: 't2_sub2', text: 'Labeler qualification guidelines and inter-annotator agreement metrics logged.', description: 'Validates that labels were created under strict rules to prevent human annotator bias.' }
      ]
    },
    {
      id: 't3',
      category: 'transparency',
      text: 'Plain-English and local language summary explanations generated automatically for end-user decisions.',
      description: 'Translates complex decision nodes into local terms so citizens can understand why an automated action was taken.',
      subParameters: [
        { id: 't3_sub1', text: 'Generates automated plain-text explainability summaries using SHAP or LIME metrics.', description: 'Details what mathematical factors drove a specific model prediction or decision.' },
        { id: 't3_sub2', text: 'Explanations translated and readable in Twi, Ga, and Ewe languages.', description: 'Fulfills public transparency guidelines by translating decision outputs for local citizens.' }
      ]
    },
    {
      id: 'p1',
      category: 'privacy',
      text: 'Data Protection Officer (DPO) appointed and officially registered under the Ghana Data Protection Commission.',
      description: 'Fulfills Act 843 requirements by registering a legal supervisor to handle data privacy compliance and citizen complaints.',
      subParameters: [
        { id: 'p1_sub1', text: 'DPO certificate of registration verified with the Data Protection Commission.', description: 'Ensures the MDA has a legal, certified representative supervising database storage rules.' },
        { id: 'p1_sub2', text: 'DPO compliance calendar and internal privacy audit logs established.', description: 'Maintains active internal monitoring instead of static, one-time approvals.' }
      ]
    },
    {
      id: 'p2',
      category: 'privacy',
      text: 'All personal records (PII) anonymized at database ingestion using salted cryptographic hashing (SHA-256).',
      description: 'Ensures that no identifiable citizen records are stored in plain text, securing database logs against privacy leaks.',
      subParameters: [
        { id: 'p2_sub1', text: 'Automated PII detection filters intercept names and phone numbers at intake.', description: 'Applies regular expressions or NLP filters to screen raw data streams for sensitive personal info.' },
        { id: 'p2_sub2', text: 'Hash tables salted cryptographically with key rotation cycles configured.', description: 'Prevents database dump matching (rainbow attacks) from reversing patient/citizen hashes.' }
      ]
    },
    {
      id: 'p3',
      category: 'privacy',
      text: 'Verify database hosting meets sovereign localization rules (physically hosted inside Ghana\'s borders).',
      description: 'Mandated by local data residency rules to ensure all personal data remains within national jurisdiction.',
      subParameters: [
        { id: 'p3_sub1', text: 'Cloud hosting resource group configurations set to Acc-Zone or local servers.', description: 'Verifies datacentre leases physically reside in geographical regions inside Ghana.' },
        { id: 'p3_sub2', text: 'Audit logs prove zero diagnostic records or DB replicas are synced outside national borders.', description: 'Ensures system backups or diagnostic caches do not trigger cross-border compliance breaches.' }
      ]
    },
    {
      id: 's1',
      category: 'security',
      text: 'System source code audited and certified against OWASP Top 10 vulnerabilities.',
      description: 'Ensures software defense layers are robust against common exploits like injection attacks and broken authentication.',
      subParameters: [
        { id: 's1_sub1', text: 'Static (SAST) and dynamic (DAST) application security scans run on builds.', description: 'Integrates automated code checks into the Git deployment pipeline to spot code bugs.' },
        { id: 's1_sub2', text: 'Dependency checks scheduled weekly with immediate patching triggers.', description: 'Keeps external package updates current, minimizing the risk of supply chain exploits.' }
      ]
    },
    {
      id: 's2',
      category: 'security',
      text: 'Semi-annual third-party penetration testing program and CVE logging scheduled under Act 1038.',
      description: 'Guarantees periodic simulation of cyber-attacks to proactively discover and remediate security vulnerabilities.',
      subParameters: [
        { id: 's2_sub1', text: 'External certified cybersecurity agency penetration test reports logged.', description: 'Ensures independent audit validity via formal pen tests.' },
        { id: 's2_sub2', text: 'CVE monitoring dashboard registered with the Cyber Security Authority.', description: 'Connects critical MDA systems to national vulnerability tracking channels.' }
      ]
    },
    {
      id: 's3',
      category: 'security',
      text: 'Automatic telemetry integration configured with National Cyber Security Authority alert systems.',
      description: 'Allows real-time incident reporting and coordinated threat response during active DDoS or malware campaigns.',
      subParameters: [
        { id: 's3_sub1', text: 'IDS/IPS alerts hooked directly to national CERT-GH logs.', description: 'Fulfills cybersecurity reporting mandates for critical national infrastructure.' },
        { id: 's3_sub2', text: 'Emergency kill switch triggers configured and simulated quarterly.', description: 'Tests automated procedures to isolate databases or models if active intrusions are detected.' }
      ]
    }
  ],
  'European Union': [
    {
      id: 'f1',
      category: 'fairness',
      text: 'Algorithmic bias assessments conducted on protected characteristics under EU AI Act.',
      description: 'Validates model compliance with high-risk system obligations to eliminate demographic discrimination.',
      subParameters: [
        { id: 'f1_sub1', text: 'Bias evaluations run across gender, age, and race variables.', description: 'Ensures models are checked against primary protected categories before deployment.' },
        { id: 'f1_sub2', text: 'Post-market bias monitoring pipelines configured and active.', description: 'Continually checks validation drift once the system runs on production streams.' }
      ]
    },
    {
      id: 'f2',
      category: 'fairness',
      text: 'Representative dataset sampling to prevent discrimination against minority linguistic groups in Europe.',
      description: 'Ensures voice and text models support EU member states with smaller populations or distinct accents.',
      subParameters: [
        { id: 'f2_sub1', text: 'Representative audits cover non-central European accents and dialects.', description: 'Tests phonetic and text representation for countries outside primary linguistic zones.' },
        { id: 'f2_sub2', text: 'Translation and response parity verified across official EU languages.', description: 'Checks translation services to guarantee equal accuracy regardless of the member state tongue.' }
      ]
    },
    {
      id: 'f3',
      category: 'fairness',
      text: 'Conformance audit completed for European Accessibility Act (EAA) software guidelines.',
      description: 'Verifies that assistive interfaces allow citizens with visual or physical impairments to use the system.',
      subParameters: [
        { id: 'f3_sub1', text: 'System UI conforms fully to WCAG 2.1 AA keyboard navigation rules.', description: 'Ensures navigation and accessibility checks pass automatically.' },
        { id: 'f3_sub2', text: 'Compatible screen-reader templates and alt-text registers populated.', description: 'Validates assistive audio readouts for text and graph assets.' }
      ]
    },
    {
      id: 't1',
      category: 'transparency',
      text: 'High-risk AI system registry filing completed and model documentation submitted to EU database.',
      description: 'Compliance registration under Article 51 of the EU AI Act before placing high-risk systems on the market.',
      subParameters: [
        { id: 't1_sub1', text: 'EU AI Act Declaration of Conformance signed and filed.', description: 'Confirms formal executive certification of regulatory compliance.' },
        { id: 't1_sub2', text: 'Model parameters, limits, and dataset provenance details uploaded to the EU portal.', description: 'Enables public and regulatory audit paths for high-stakes models.' }
      ]
    },
    {
      id: 't2',
      category: 'transparency',
      text: 'Downstream user explainability interface provided, stating how output is generated and how to override it.',
      description: 'Provides a human-interpretable explanation of automated decisions, fulfilling right-to-explanation policies.',
      subParameters: [
        { id: 't2_sub1', text: 'Explainability dashboard displays primary decision factors for users.', description: 'Gives users plain sight of the variables driving their algorithmic outcomes.' },
        { id: 't2_sub2', text: 'Human oversight overrides and escalation paths active.', description: 'Fulfills the Article 14 mandate of the EU AI Act for human fallback review.' }
      ]
    },
    {
      id: 't3',
      category: 'transparency',
      text: 'Cryptographic watermarks applied to all synthetic media to transparently label AI-generated content.',
      description: 'Prevents misinformation by identifying text, audio, and images created by generative algorithms.',
      subParameters: [
        { id: 't3_sub1', text: 'Cryptographic metadata hashes embedded on image and video renders.', description: 'Allows downstream security checks to scan media for synthetic signatures.' },
        { id: 't3_sub2', text: 'Inaudible high-frequency watermarks layered in voice/audio stream outputs.', description: 'Prevents vocal deepfakes and acoustic impersonation attacks.' }
      ]
    },
    {
      id: 'p1',
      category: 'privacy',
      text: 'Data Protection Impact Assessment (DPIA) performed and GDPR-compliant consent flow implemented.',
      description: 'A detailed assessment of systemic risks to privacy, mandatory under Article 35 of the GDPR.',
      subParameters: [
        { id: 'p1_sub1', text: 'DPIA registered with national data protection supervisor.', description: 'Ensures the assessment is legally catalogued and audited.' },
        { id: 'p1_sub2', text: 'GDPR consent management system checks freely given, granular consent.', description: 'Ensures affirmative consumer opt-ins for telemetry, cookies, and model training.' }
      ]
    },
    {
      id: 'p2',
      category: 'privacy',
      text: 'Right to be forgotten (Article 17) mechanisms verified, enabling complete erasure of user records in 30 days.',
      description: 'Ensures citizen data can be purged from database indexes and backup logs on user demand.',
      subParameters: [
        { id: 'p2_sub1', text: 'Complete database deletion queries prepared and tested.', description: 'Deletes core profile data and training features with single request triggers.' },
        { id: 'p2_sub2', text: 'Backup and log systems synced to purge data within the 30-day window.', description: 'Ensures offsite backups and recovery logs wipe user records completely.' }
      ]
    },
    {
      id: 'p3',
      category: 'privacy',
      text: 'Cross-border data transfer impact evaluation signed off, confirming no unauthorized transfer outside the EEA.',
      description: 'Reviews compliance with Schrems II regulations for external API calls and cloud processing.',
      subParameters: [
        { id: 'p3_sub1', text: 'Standard Contractual Clauses (SCCs) active with all foreign processors.', description: 'Legally binds external partners to GDPR-equivalent safety rules.' },
        { id: 'p3_sub2', text: 'All European user records stored inside European sovereign cloud systems.', description: 'Verifies database hosting resides physically inside EU boundaries.' }
      ]
    },
    {
      id: 's1',
      category: 'security',
      text: 'CE Mark security certification audit completed and compliance status active.',
      description: 'Certifies that the software conforms to mandatory European cybersecurity safety regulations.',
      subParameters: [
        { id: 's1_sub1', text: 'Safety assessment report filed by a notified European compliance body.', description: 'Confirms third-party auditing of model safety and code resistance.' },
        { id: 's1_sub2', text: 'CE documentation package uploaded to company registers.', description: 'Documents CE marker legality for product operations inside the EEA.' }
      ]
    },
    {
      id: 's2',
      category: 'security',
      text: 'Incident response protocols established, with 72-hour regulatory notification capability for breaches.',
      description: 'Fulfills supervisory reporting requirements in the event of an active cyber incident or data breach.',
      subParameters: [
        { id: 's2_sub1', text: 'Security response team duty rosters active 24/7.', description: 'Guarantees immediate response capability to isolate network threats.' },
        { id: 's2_sub2', text: 'Regulatory breach templates preloaded for immediate alert triggers.', description: 'Enables compliant reporting within the mandatory 72-hour data privacy window.' }
      ]
    },
    {
      id: 's3',
      category: 'security',
      text: 'Software Bill of Materials (SBOM) compiled and continuously updated for third-party libraries.',
      description: 'Identifies security vulnerabilities across all nested packages to prevent supply chain exploits.',
      subParameters: [
        { id: 's3_sub1', text: 'SBOM generated dynamically in CycloneDX or SPDX standard format.', description: 'Outputs machine-readable inventories of libraries on build compiles.' },
        { id: 's3_sub2', text: 'Dependency checks configured to block builds containing critical vulnerabilities.', description: 'Keeps external code safe against supply chain bugs.' }
      ]
    }
  ],
  'United States': [
    {
      id: 'f1',
      category: 'fairness',
      text: 'Algorithmic impact assessments performed to evaluate civil rights impacts and disparate treatment.',
      description: 'Assesses bias impact on hiring, lending, or public assistance scoring systems per US Federal guidelines.',
      subParameters: [
        { id: 'f1_sub1', text: 'Bias evaluations run against race, gender, and age segments.', description: 'Ensures compliance with US civil rights audit expectations.' },
        { id: 'f1_sub2', text: 'Continuous bias screening set up for high-stakes operational workflows.', description: 'Monitors prediction indices for drift in banking or public assistance models.' }
      ]
    },
    {
      id: 'f2',
      category: 'fairness',
      text: 'Disparate impact ratio tests executed for demographic parity using the Four-Fifths Rule.',
      description: 'Statistically measures whether selection rates for protected categories are within acceptable limits.',
      subParameters: [
        { id: 'f2_sub1', text: 'Demographic selection rates calculated using the 80% selection rule.', description: 'Standard statistical test check to prove parity in hiring or lending models.' },
        { id: 'f2_sub2', text: 'Corrective weight parameters added to balance predictive disparities.', description: 'Applies algorithm weights if selection rates fall outside acceptable parameters.' }
      ]
    },
    {
      id: 'f3',
      category: 'fairness',
      text: 'ADA Section 508 accessibility compliance verified for all user interfaces.',
      description: 'Assures that US federal agencies and public systems are accessible to employees and citizens with disabilities.',
      subParameters: [
        { id: 'f3_sub1', text: 'Assistive keyboard shortcuts and accessibility indicators pass testing.', description: 'Confirms system compliance with Section 508 guidelines.' },
        { id: 'f3_sub2', text: 'Auditory readout and high-contrast color themes integrated.', description: 'Ensures readability for visually impaired citizens.' }
      ]
    },
    {
      id: 't1',
      category: 'transparency',
      text: 'AI system registry and public disclosure of generative model training dataset sources maintained.',
      description: 'Fulfills disclosure rules regarding the training data provenance and licensing status.',
      subParameters: [
        { id: 't1_sub1', text: 'Database of copyrighted datasets and training sources catalogued.', description: 'Tracks copyright compliance for generative model datasets.' },
        { id: 't1_sub2', text: 'Public system registry declarations filed per Federal directives.', description: 'Maintains compliance with public sector transparency mandates.' }
      ]
    },
    {
      id: 't2',
      category: 'transparency',
      text: 'NIST AI Risk Management Framework (RMF) scorecard generated and made public.',
      description: 'A voluntary framework guiding organizations to identify, measure, and manage AI risks.',
      subParameters: [
        { id: 't2_sub1', text: 'NIST AI RMF control checks mapped against system operational boundaries.', description: 'Checks model design against the NIST guidelines.' },
        { id: 't2_sub2', text: 'Audit summaries and risk profiles published to public dashboards.', description: 'Provides stakeholders insight into model safety postures.' }
      ]
    },
    {
      id: 't3',
      category: 'transparency',
      text: 'Model explainability logs (SHAP/LIME values) recorded for all automated decisions.',
      description: 'Maintains a mathematical record of which parameters most heavily influenced high-stakes model outputs.',
      subParameters: [
        { id: 't3_sub1', text: 'Decision logs generate SHAP explainability charts for every run.', description: 'Maps mathematical feature importances for predictions.' },
        { id: 't3_sub2', text: 'Explaining texts converted to human-readable summaries in decision logs.', description: 'Allows users to see a clear list of what variables drove their outputs.' }
      ]
    },
    {
      id: 'p1',
      category: 'privacy',
      text: 'HIPAA-compliant Business Associate Agreements (BAA) signed, or CCPA/CPRA data mapping active.',
      description: 'Assures data handling contracts protect health datasets or fulfill California privacy directives.',
      subParameters: [
        { id: 'p1_sub1', text: 'HIPAA BAA signed with all cloud hosting partners.', description: 'Ensures cloud resources protect health details under US federal law.' },
        { id: 'p1_sub2', text: 'CCPA/CPRA data map lists and tracks where consumer records reside.', description: 'Prepares systems for consumer data queries or deletion requests.' }
      ]
    },
    {
      id: 'p2',
      category: 'privacy',
      text: 'Opt-out registry for data sharing and machine learning training queries implemented.',
      description: 'Provides consumers a clear interface to restrict the sale or model-training use of their personal data.',
      subParameters: [
        { id: 'p2_sub1', text: 'Consumer opt-out button is clearly visible in user profiles.', description: 'Fulfills state consumer data access regulations.' },
        { id: 'p2_sub2', text: 'Opted-out customer records deleted from training pipelines instantly.', description: 'Enforces dataset hygiene to ensure consumer preference is respected.' }
      ]
    },
    {
      id: 'p3',
      category: 'privacy',
      text: 'Children\'s Online Privacy Protection Rule (COPPA) review completed for under-13 age restrictions.',
      description: 'Limits the collection of personal information from children without explicit parental consent.',
      subParameters: [
        { id: 'p3_sub1', text: 'Age gate and consent verification flows built for registrations.', description: 'Fulfills COPPA verification rules.' },
        { id: 'p3_sub2', text: 'System automatically screens and blocks PII collection from under-13 users.', description: 'Prevents database logging of child records.' }
      ]
    },
    {
      id: 's1',
      category: 'security',
      text: 'System meets NIST SP 800-53 security controls, with threat modeling performed on training pipelines.',
      description: 'Strict cybersecurity controls required for federal information systems and partners.',
      subParameters: [
        { id: 's1_sub1', text: 'NIST SP 800-53 control compliance certificate signed off.', description: 'Mandatory standard validation for cloud and public systems.' },
        { id: 's1_sub2', text: 'Threat modeling audit conducted on database training workflows.', description: 'Prevent data injection or parameter manipulation bugs in ML models.' }
      ]
    },
    {
      id: 's2',
      category: 'security',
      text: 'FedRAMP / SOC 2 Type II audit report filed, and red-teaming exercises conducted.',
      description: 'Independent verification of security, availability, and processing integrity of cloud architectures.',
      subParameters: [
        { id: 's2_sub1', text: 'SOC 2 Type II report signed by auditing agency.', description: 'Validates operational security controls over a multi-month window.' },
        { id: 's2_sub2', text: 'Red-teaming attacks simulated against prompt injection weaknesses.', description: 'Ensures the model does not expose baseline system parameters.' }
      ]
    },
    {
      id: 's3',
      category: 'security',
      text: 'Adversarial ML attack defenses implemented (e.g. prompt injection mitigations).',
      description: 'Secures LLM endpoints and predictive nodes against specialized evasion or model extraction attacks.',
      subParameters: [
        { id: 's3_sub1', text: 'Input sanitization layers block malicious prompts on all inputs.', description: 'Blocks jailbreaks or system override triggers.' },
        { id: 's3_sub2', text: 'Rate limiting and anomaly checks flag bot query scripts.', description: 'Prevents mass queries aimed at stealing model weight details.' }
      ]
    }
  ],
  'Global Standards (ISO)': [
    {
      id: 'f1',
      category: 'fairness',
      text: 'Algorithmic Fairness management policies established per ISO/IEC 42001 Annex A controls.',
      description: 'Aligns AI management processes with global standards for managing bias and discrimination.',
      subParameters: [
        { id: 'f1_sub1', text: 'Bias control policy drafted and approved by executive board.', description: 'Establishes clear, document-based management strategies for AI fairness.' },
        { id: 'f1_sub2', text: 'ISO 42001 Annex A.6 controls verified on deployment scripts.', description: 'Checks engineering implementation of bias control goals.' }
      ]
    },
    {
      id: 'f2',
      category: 'fairness',
      text: 'System systematic bias monitoring systems operational in production pipelines.',
      description: 'Ensures statistical fairness parameters do not degrade as real-world input distributions shift.',
      subParameters: [
        { id: 'f2_sub1', text: 'Automated alert trigger set if selection parity falls below 80%.', description: 'Triggers diagnostic reviews if model predictions drift towards bias.' },
        { id: 'f2_sub2', text: 'Model dataset updates undergo automated bias audits before compile.', description: 'Ensures model training updates do not introduce new bias.' }
      ]
    },
    {
      id: 'f3',
      category: 'fairness',
      text: 'Linguistic and cultural localization guidelines verified across international deployments.',
      description: 'Prevents structural discrimination when deploying AI systems across different cultural contexts.',
      subParameters: [
        { id: 'f3_sub1', text: 'Model localized testing validates accuracy in multi-lingual zones.', description: 'Prevents systematic errors when operating globally.' },
        { id: 'f3_sub2', text: 'Cultural impact review signed by global localization committee.', description: 'Verifies model output respect regional values and context.' }
      ]
    },
    {
      id: 't1',
      category: 'transparency',
      text: 'System documentation and transparency statements explaining AI capability boundaries.',
      description: 'Explicitly outlines what the AI system can and cannot do, preventing user over-reliance.',
      subParameters: [
        { id: 't1_sub1', text: 'Public documentation site details capabilities and limitations.', description: 'Fulfills transparency guidelines by warning users of limitation zones.' },
        { id: 't1_sub2', text: 'Technical specification document details system datasets and features.', description: 'Provides in-depth specifications for downstream developers and integrators.' }
      ]
    },
    {
      id: 't2',
      category: 'transparency',
      text: 'Explainability logs maintained, allowing traceability of algorithmic logic for audit trails.',
      description: 'Fulfills ISO auditability requirements by logging explanation paths alongside model predictions.',
      subParameters: [
        { id: 't2_sub1', text: 'Traceability database logs prediction IDs and explainability metrics.', description: 'Enables retroactive audit review of system decisions.' },
        { id: 't2_sub2', text: 'Log database secures data against unauthorized edits.', description: 'Ensures audit log authenticity and compliance with strict standards.' }
      ]
    },
    {
      id: 't3',
      category: 'transparency',
      text: 'Third-party validation report generated verifying model generalization limits.',
      description: 'Proves the algorithm was tested on independent test sets and performs within declared boundaries.',
      subParameters: [
        { id: 't3_sub1', text: 'Validation audit report signed by independent standards body.', description: 'Validates that testing was objective and rigorous.' },
        { id: 't3_sub2', text: 'Out-of-distribution dataset accuracy test records logged.', description: 'Proves model resilience in unusual edge-case environments.' }
      ]
    },
    {
      id: 'p1',
      category: 'privacy',
      text: 'Privacy Information Management System (PIMS) audited against ISO/IEC 27701.',
      description: 'Extends ISO 27001 security controls to incorporate privacy management requirements.',
      subParameters: [
        { id: 'p1_sub1', text: 'ISO 27701 internal auditor certificate filed.', description: 'Ensures internal audits are managed by a certified professional.' },
        { id: 'p1_sub2', text: 'PIMS controls mapped against database schema structures.', description: 'Validates privacy controls protect real-world citizen databases.' }
      ]
    },
    {
      id: 'p2',
      category: 'privacy',
      text: 'Cross-border data transfer compliance and automated data minimisation criteria active.',
      description: 'Restricts data storage to only necessary elements and ensures secure global transit.',
      subParameters: [
        { id: 'p2_sub1', text: 'Auto-prune processes wipe unused user profiles and telemetry fields.', description: 'Ensures databases only store details required for operations.' },
        { id: 'p2_sub2', text: 'Encryption keys for international data transfers audited.', description: 'Prevents interception during cross-border transit.' }
      ]
    },
    {
      id: 'p3',
      category: 'privacy',
      text: 'Regular privacy posture reviews scheduled and data retention limits enforced.',
      description: 'Ensures that databases automatically prune expired user telemetry records to minimize exposure.',
      subParameters: [
        { id: 'p3_sub1', text: 'Data retention script verified to delete inactive files after 180 days.', description: 'Automatically enforces the database hygiene guidelines.' },
        { id: 'p3_sub2', text: 'Quarterly privacy audits log data minimisation results.', description: 'Maintains records of privacy-preserving performance.' }
      ]
    },
    {
      id: 's1',
      category: 'security',
      text: 'Information Security Management System (ISMS) certified against ISO/IEC 27001.',
      description: 'The gold standard for establishing, implementing, and improving information security.',
      subParameters: [
        { id: 's1_sub1', text: 'ISO 27001 certificate verified and active.', description: 'Confirms baseline organizational security practices conform to international rules.' },
        { id: 's1_sub2', text: 'Statement of Applicability (SoA) matches system control setups.', description: 'Ensures controls map directly to current system architectures.' }
      ]
    },
    {
      id: 's2',
      category: 'security',
      text: 'Threat vector analysis for adversarial attacks (data poisoning, model inversion) updated quarterly.',
      description: 'Proactively models threats specific to machine learning weights and dataset security.',
      subParameters: [
        { id: 's2_sub1', text: 'Threat logs capture and analyze anomalous input patterns.', description: 'Spots zero-day evasion or parameter theft attempts.' },
        { id: 's2_sub2', text: 'Adversarial threat assessments updated with newly discovered CVSS scores.', description: 'Monitors the landscape for newly discovered AI exploits.' }
      ]
    },
    {
      id: 's3',
      category: 'security',
      text: 'Business continuity and disaster recovery drills simulated for AI outage vectors.',
      description: 'Ensures operations can fall back to non-AI or redundant systems during structural failures.',
      subParameters: [
        { id: 's3_sub1', text: 'Continuity protocols define offline manual fallback steps.', description: 'Ensures service operations remain stable if models crash.' },
        { id: 's3_sub2', text: 'Redundant model server groups replicate databases real-time.', description: 'Provides instant failover capability during hardware issues.' }
      ]
    }
  ],
  'NIST AI RMF': [
    {
      id: 'f1',
      category: 'fairness',
      text: 'Map Function (MAP-1): System context is analyzed to identify socio-technical implications, bias, and equity.',
      description: 'Ensures that AI system design documentation details potential demographic disparities and bias vectors.',
      subParameters: [
        { id: 'f1_sub1', text: 'AI system design documentation details potential demographic disparities and bias vectors.', description: 'Validates that designers explicitly mapped potential bias risks before system creation.' },
        { id: 'f1_sub2', text: 'System undergoes ongoing demographic testing across all 16 Ghanaian regions.', description: 'Ensures models perform equitably for residents in Northern and Southern zones alike.' }
      ]
    },
    {
      id: 'f2',
      category: 'fairness',
      text: 'Govern Function (GOVERN-1): Organizational policies and procedures are established to manage AI safety.',
      description: 'Reviews governance compliance structures and leadership oversight over AI decisions.',
      subParameters: [
        { id: 'f2_sub1', text: 'Executive oversight roles and compliance policies formally adopted.', description: 'Establishes legal ownership and compliance accountability chains.' },
        { id: 'f2_sub2', text: 'Socio-economic impact mitigations (like local dialects voice IVR prompts) active.', description: 'Maintains inclusion by resolving accessibility hurdles for all citizen classes.' }
      ]
    },
    {
      id: 'f3',
      category: 'fairness',
      text: 'Map Function (MAP-3): Customer and user demographics are analyzed to ensure accessibility.',
      description: 'Verifies user interfaces are accessible to citizens with physical or technical limitations.',
      subParameters: [
        { id: 'f3_sub1', text: 'Offline SMS or USSD channels active for remote, network-starved regions.', description: 'Bypasses cellular internet dependencies to support rural citizens.' },
        { id: 'f3_sub2', text: 'Web UI fully conforms to international keyboard and contrast accessibility rules.', description: 'Allows visually or physically challenged users to navigate portals comfortably.' }
      ]
    },
    {
      id: 't1',
      category: 'transparency',
      text: 'Measure Function (MEASURE-1): AI systems are analyzed using quantitative and qualitative metrics.',
      description: 'Establishes open model metrics and limits to prevent user over-reliance.',
      subParameters: [
        { id: 't1_sub1', text: 'Standardized model card details neural architectures and limitations.', description: 'Details operational limitations to downstream engineers and users.' },
        { id: 't1_sub2', text: 'Training dataset metadata and provenance registries catalogued.', description: 'Provides clear logs of where training assets were sourced and labeled.' }
      ]
    },
    {
      id: 't2',
      category: 'transparency',
      text: 'Manage Function (MANAGE-1): Risk response strategies are executed to limit potential harms.',
      description: 'Monitors explainability and oversight procedures in live deployment states.',
      subParameters: [
        { id: 't2_sub1', text: 'Traceability database logs prediction inputs and SHAP/LIME explainability metrics.', description: 'Enables auditable explanation chains for automated outcomes.' },
        { id: 't2_sub2', text: 'Human oversight override channels and fallback reviews operational.', description: 'Allows manual review escalation if automated models trigger anomalies.' }
      ]
    },
    {
      id: 't3',
      category: 'transparency',
      text: 'Govern Function (GOVERN-4): Public transparency and documentation standards published.',
      description: 'Ensures public-facing indicators clearly state if content is synthetic or AI-driven.',
      subParameters: [
        { id: 't3_sub1', text: 'Cryptographic watermarks applied to all generative outputs.', description: 'Prevents misinformation by validating synthetic file signatures.' },
        { id: 't3_sub2', text: 'Plain-text explanations generated in English and local languages.', description: 'Fulfills public transparency guidelines by translating decision outputs for local citizens.' }
      ]
    },
    {
      id: 'p1',
      category: 'privacy',
      text: 'Govern / Map (GOVERN-5): Privacy impact assessments are integrated into system lifecycle.',
      description: 'Assesses database ingestion pipelines to protect personal data from exposure.',
      subParameters: [
        { id: 'p1_sub1', text: 'Automated PII detection filters screen incoming files at intake.', description: 'Wipes raw phone numbers or identities before database storage.' },
        { id: 'p1_sub2', text: 'Cryptographic salted hashes anonymize personal citizen fields.', description: 'Protects citizen databases against reverse mapping attempts.' }
      ]
    },
    {
      id: 'p2',
      category: 'privacy',
      text: 'Measure / Manage (MANAGE-4): Sovereign data security and minimization checks enforced.',
      description: 'Ensures database storage is restricted to essential profiles and kept in local boundaries.',
      subParameters: [
        { id: 'p2_sub1', text: 'Sovereign hosting rules confirm datacentre servers reside inside Ghana.', description: 'Maintains national data residency control.' },
        { id: 'p2_sub2', text: 'Standard contractual clauses active with external cloud resources.', description: 'Protects data transit security across cloud bounds.' }
      ]
    },
    {
      id: 'p3',
      category: 'privacy',
      text: 'Manage Function (MANAGE-3): Data retention schedules configured and audited.',
      description: 'Ensures telemetry logs and profiling records are purged periodically to limit risks.',
      subParameters: [
        { id: 'p3_sub1', text: 'Automated retention scripts purge inactive user profiles after 180 days.', description: 'Enforces database hygiene protocols.' },
        { id: 'p3_sub2', text: 'GDPR/Act 843 compliant right-to-be-forgotten deletion workflows active.', description: 'Allows citizens to request total profile erasure within a 30-day window.' }
      ]
    },
    {
      id: 's1',
      category: 'security',
      text: 'Measure Function (MEASURE-2.4): Adversarial vulnerability testing (red-teaming) performed.',
      description: 'Proactively tests code and models against adversarial evasion and injection attacks.',
      subParameters: [
        { id: 's1_sub1', text: 'SAST/DAST scanner checks code against OWASP vulnerabilities.', description: 'Mitigates common software authorization or injection bugs.' },
        { id: 's1_sub2', text: 'CVE library updates scheduled weekly to prevent supply chain exploits.', description: 'Maintains packages safety against known threat listings.' }
      ]
    },
    {
      id: 's2',
      category: 'security',
      text: 'Manage Function (MANAGE-2): Dynamic ML security checks and injection mitigations.',
      description: 'Secures model input interfaces to block adversarial jailbreaks or theft attempts.',
      subParameters: [
        { id: 's2_sub1', text: 'Input sanitization rules block prompt injection patterns.', description: 'Blocks system rule overrides on input text boxes.' },
        { id: 's2_sub2', text: 'Rate limiting and query checks flag mass automated scrapers.', description: 'Prevents extraction attacks aimed at stealing neural parameters.' }
      ]
    },
    {
      id: 's3',
      category: 'security',
      text: 'Manage Function (MANAGE-2.3): Emergency failovers and incident alerts integrated.',
      description: 'Links the system to national incident centers for real-time cyberdefense coordination.',
      subParameters: [
        { id: 's3_sub1', text: 'Incident alerts synced real-time with National Cyber Security Authority.', description: 'Fulfills reporting requirements to CERT-GH during cyberattacks.' },
        { id: 's3_sub2', text: 'Offline manuals fallback and server failover simulated quarterly.', description: 'Ensures services stay stable if neural networks experience structural failures.' }
      ]
    }
  ],
  'ISO/IEC 42001 (AIMS)': [
    {
      id: 'f1',
      category: 'fairness',
      text: 'Clause 6.1 (Actions to address risks and opportunities): Assess impact on fairness and equality.',
      description: 'Aligns AI risk management with global expectations for bias and discrimination control.',
      subParameters: [
        { id: 'f1_sub1', text: 'Bias control policy drafted and approved by executive board.', description: 'Establishes clear corporate guidelines to mitigate discrimination.' },
        { id: 'f1_sub2', text: 'Algorithmic fairness reviews validate performance parity in agricultural/urban zones.', description: 'Guarantees models support both rural farmers and city populations equitably.' }
      ]
    },
    {
      id: 'f2',
      category: 'fairness',
      text: 'Clause 8.3 (AI system design and development): Inclusivity guidelines integrated into design.',
      description: 'Requires interfaces to support local language accessibility and diverse users.',
      subParameters: [
        { id: 'f2_sub1', text: 'Representative speech samples cover regional Ghanaian dialects (Ga, Ewe).', description: 'Prevents acoustic mismatch errors for minority regional languages.' },
        { id: 'f2_sub2', text: 'IVR and local language audio narration tools active.', description: 'Assists citizens who cannot read or write text.' }
      ]
    },
    {
      id: 'f3',
      category: 'fairness',
      text: 'Clause 8.3.3: Systematic accessibility channels operational in software designs.',
      description: 'Guarantees alternative navigation features for low-network or disabled demographics.',
      subParameters: [
        { id: 'f3_sub1', text: 'Offline USSD channels active for remote deployment.', description: 'Enables core functionality without cellular internet connections.' },
        { id: 'f3_sub2', text: 'System UI conforms fully to WCAG accessibility guidelines.', description: 'Enables keyboard navigation and screen-reader assistance.' }
      ]
    },
    {
      id: 't1',
      category: 'transparency',
      text: 'Clause 8.4 (AI system provisioning): Model documentation and limitation cards published.',
      description: 'Provides standardized capability disclosures to downstream implementers.',
      subParameters: [
        { id: 't1_sub1', text: 'Model card details neural parameters and limitations.', description: 'Outlines model performance bounds clearly.' },
        { id: 't1_sub2', text: 'Third-party validation audits confirm system capabilities.', description: 'Ensures independent verification of accuracy declarations.' }
      ]
    },
    {
      id: 't2',
      category: 'transparency',
      text: 'Clause 9 (Performance evaluation): Transparency and explainability dashboard active.',
      description: 'Requires automated explanation systems for high-impact decisions.',
      subParameters: [
        { id: 't2_sub1', text: 'User explainability interface explain automated outcomes using LIME/SHAP.', description: 'Helps users see which parameters drove their automated results.' },
        { id: 't2_sub2', text: 'Traceability database logs decisions, preventing unauthorized changes.', description: 'Maintains tamper-proof records for auditing.' }
      ]
    },
    {
      id: 't3',
      category: 'transparency',
      text: 'Clause 8.4.3: Synthetic media watermark labeling active.',
      description: 'Ensures generative content is flagged to prevent misinformation.',
      subParameters: [
        { id: 't3_sub1', text: 'Metadata watermarks and synthetic hashes embedded in outputs.', description: 'Enables downstream detection of AI-generated media.' },
        { id: 't3_sub2', text: 'Plain-English automated summary reports generated for decisions.', description: 'Explains complex decisions in simple words.' }
      ]
    },
    {
      id: 'p1',
      category: 'privacy',
      text: 'Clause 8.2 (AI risk assessment): Data management policies and consent flows configured.',
      description: 'Ensures the AI system respects data privacy and handles consent flows correctly.',
      subParameters: [
        { id: 'p1_sub1', text: 'Consent verification mechanisms ensure voluntary consumer opt-in.', description: 'Collects positive opt-ins before profiling or training model updates.' },
        { id: 'p1_sub2', text: 'Salted cryptographic hashes anonymize personal citizen fields.', description: 'Prevents identity matching inside central databases.' }
      ]
    },
    {
      id: 'p2',
      category: 'privacy',
      text: 'Clause 8.5 (AI system operation): Data minimization and sovereign hosting verified.',
      description: 'Validates that data residency requirements and sovereign boundaries are enforced.',
      subParameters: [
        { id: 'p2_sub1', text: 'Sovereign datacentre hosting rules confirm files reside inside Ghana.', description: 'Maintains national data residency.' },
        { id: 'p2_sub2', text: 'Privacy posture reviews are managed by an ISO 27701 certified PIMS.', description: 'Ensures privacy assessments are catalogued and audited.' }
      ]
    },
    {
      id: 'p3',
      category: 'privacy',
      text: 'Clause 8.5.2: Privacy retention limits and deletion flows active.',
      description: 'Allows users to control their data lifecycle, conforming to strict privacy standards.',
      subParameters: [
        { id: 'p3_sub1', text: 'Automated retention script purges expired files after 180 days.', description: 'Wipes diagnostic records and log files.' },
        { id: 'p3_sub2', text: 'GDPR/Act 843 compliant right-to-be-forgotten deletion workflows active.', description: 'Purges profile records within 30 days.' }
      ]
    },
    {
      id: 's1',
      category: 'security',
      text: 'Clause 8 (Operational planning and control): ISMS certified against ISO/IEC 27001.',
      description: 'Ensures baseline security controls protect AI computing environments.',
      subParameters: [
        { id: 's1_sub1', text: 'System operates inside active ISO 27001 ISMS.', description: 'Validates corporate security posture conforms to global rules.' },
        { id: 's1_sub2', text: 'SBOM generates dynamic code inventories on compiler runs.', description: 'Identifies software library vulnerabilities dynamically.' }
      ]
    },
    {
      id: 's2',
      category: 'security',
      text: 'Clause 10 (Improvement): Adversarial vulnerability audits and CVE logging.',
      description: 'Continually checks the security posture against new adversarial threat patterns.',
      subParameters: [
        { id: 's2_sub1', text: 'Static and dynamic checks block OWASP vulnerability patterns.', description: 'Prevents security bypasses on deployments.' },
        { id: 's2_sub2', text: 'CVE vulnerability logging is active and registered with national centers.', description: 'Links system checks to active vulnerability indexes.' }
      ]
    },
    {
      id: 's3',
      category: 'security',
      text: 'Clause 8.2.4: System security failovers and injection defenses.',
      description: 'Mitigates the risk of system hijack or parameters theft during execution.',
      subParameters: [
        { id: 's3_sub1', text: 'Input sanitization rules block prompt injection jailbreaks.', description: 'Mitigates the threat of system rule bypasses.' },
        { id: 's3_sub2', text: 'Manual disaster failover simulated and tested quarterly.', description: 'Verifies continuity protocols are operational.' }
      ]
    }
  ]
};

const tooltipStyles = `
  .tooltip-container {
    position: relative;
    display: inline-flex;
    align-items: center;
    margin-left: 8px;
    vertical-align: middle;
  }
  .tooltip-text {
    visibility: hidden;
    width: 300px;
    background-color: rgba(15, 23, 42, 0.98);
    color: #f1f5f9;
    text-align: left;
    border-radius: 8px;
    padding: 12px 16px;
    position: absolute;
    z-index: 9999;
    top: 50%;
    left: 140%;
    transform: translateY(-50%);
    opacity: 0;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s ease;
    font-size: 0.78rem;
    line-height: 1.4;
    border: 1px solid rgba(255, 255, 255, 0.15);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(12px);
    pointer-events: none;
    font-weight: normal;
  }
  .tooltip-text::after {
    content: "";
    position: absolute;
    top: 50%;
    right: 100%;
    transform: translateY(-50%);
    border-width: 6px;
    border-style: solid;
    border-color: transparent rgba(15, 23, 42, 0.98) transparent transparent;
  }
  .tooltip-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
    transform: translateY(-50%) translateX(4px);
  }
`;

export const GovernanceCompliance: React.FC<GovernanceComplianceProps> = ({
  projects,
  onUpdateCompliance,
  currentRole
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const activeProject = projects.find(p => p.id === selectedProjectId);

  const [framework, setFramework] = useState<string>('Ghana');
  const [answers, setAnswers] = useState<Record<string, 'yes' | 'no'>>({});

  // Initialize metadata answers based on active project's current compliance scores
  useEffect(() => {
    if (!activeProject) return;
    const score = activeProject.compliance;
    const initialAnswers: Record<string, 'yes' | 'no'> = {
      f1_sub1: score.fairness >= 60 ? 'yes' : 'no',
      f1_sub2: score.fairness >= 80 ? 'yes' : 'no',
      f2_sub1: score.fairness >= 80 ? 'yes' : 'no',
      f2_sub2: score.fairness >= 100 ? 'yes' : 'no',
      f3_sub1: score.fairness >= 100 ? 'yes' : 'no',
      f3_sub2: score.fairness >= 100 ? 'yes' : 'no',
      
      t1_sub1: score.transparency >= 60 ? 'yes' : 'no',
      t1_sub2: score.transparency >= 80 ? 'yes' : 'no',
      t2_sub1: score.transparency >= 80 ? 'yes' : 'no',
      t2_sub2: score.transparency >= 100 ? 'yes' : 'no',
      t3_sub1: score.transparency >= 100 ? 'yes' : 'no',
      t3_sub2: score.transparency >= 100 ? 'yes' : 'no',

      p1_sub1: score.privacy >= 60 ? 'yes' : 'no',
      p1_sub2: score.privacy >= 80 ? 'yes' : 'no',
      p2_sub1: score.privacy >= 80 ? 'yes' : 'no',
      p2_sub2: score.privacy >= 100 ? 'yes' : 'no',
      p3_sub1: score.privacy >= 100 ? 'yes' : 'no',
      p3_sub2: score.privacy >= 100 ? 'yes' : 'no',

      s1_sub1: score.security >= 60 ? 'yes' : 'no',
      s1_sub2: score.security >= 80 ? 'yes' : 'no',
      s2_sub1: score.security >= 80 ? 'yes' : 'no',
      s2_sub2: score.security >= 100 ? 'yes' : 'no',
      s3_sub1: score.security >= 100 ? 'yes' : 'no',
      s3_sub2: score.security >= 100 ? 'yes' : 'no',
    };
    setAnswers(initialAnswers);
  }, [selectedProjectId, activeProject]);

  const handleAnswerChange = (subId: string, val: 'yes' | 'no') => {
    const canAudit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);
    if (!canAudit) return;

    const newAnswers = {
      ...answers,
      [subId]: val
    };
    setAnswers(newAnswers);

    const computeCategoryScore = (subIds: string[]) => {
      const yesCount = subIds.filter(id => newAnswers[id] === 'yes').length;
      // Linear scaling: 40% baseline, each sub YES adds 10%
      return 40 + (yesCount * 10);
    };

    const fairness = computeCategoryScore(['f1_sub1', 'f1_sub2', 'f2_sub1', 'f2_sub2', 'f3_sub1', 'f3_sub2']);
    const transparency = computeCategoryScore(['t1_sub1', 't1_sub2', 't2_sub1', 't2_sub2', 't3_sub1', 't3_sub2']);
    const privacy = computeCategoryScore(['p1_sub1', 'p1_sub2', 'p2_sub1', 'p2_sub2', 'p3_sub1', 'p3_sub2']);
    const security = computeCategoryScore(['s1_sub1', 's1_sub2', 's2_sub1', 's2_sub2', 's3_sub1', 's3_sub2']);

    const weightedNgs = (fairness * 0.20) + (transparency * 0.25) + (privacy * 0.20) + (security * 0.35);

    let overallGrade: 'Excellent' | 'Good' | 'Moderate' | 'High Risk' = 'Moderate';
    if (weightedNgs >= 90) overallGrade = 'Excellent';
    else if (weightedNgs >= 75) overallGrade = 'Good';
    else if (weightedNgs >= 50) overallGrade = 'Moderate';
    else overallGrade = 'High Risk';

    const newScore: ComplianceScore = {
      fairness,
      transparency,
      accountability: transparency, // Maintain compatibility
      privacy,
      security,
      overallGrade
    };

    onUpdateCompliance(selectedProjectId, newScore);
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'Excellent':
        return <ShieldCheck className="w-8 h-8 text-emerald-400" />;
      case 'Good':
        return <Award className="w-8 h-8 text-emerald-400" />;
      case 'Moderate':
        return <Info className="w-8 h-8 text-amber-400" />;
      default:
        return <AlertTriangle className="w-8 h-8 text-red-400" />;
    }
  };

  const getGradeClass = (grade: string) => {
    switch (grade) {
      case 'Excellent': return 'badge-success';
      case 'Good': return 'badge-info';
      case 'Moderate': return 'badge-warning';
      default: return 'badge-danger';
    }
  };

  const getCategoryTitle = (cat: 'fairness' | 'transparency' | 'privacy' | 'security') => {
    if (cat === 'fairness') {
      if (framework === 'Ghana') return 'Fairness & Tribal Equity (20% Weight)';
      if (framework === 'NIST AI RMF') return 'Socio-Technical Bias & Equity (MAP-1) (20% Weight)';
      if (framework === 'ISO/IEC 42001 (AIMS)') return 'AIMS Fairness & Localization (20% Weight)';
      return 'Fairness & Demographic Equity (20% Weight)';
    }
    if (cat === 'transparency') {
      if (framework === 'NIST AI RMF') return 'Auditability & Explainability (MEASURE) (25% Weight)';
      if (framework === 'ISO/IEC 42001 (AIMS)') return 'Transparency & Provisioning (25% Weight)';
      return 'Transparency & Explainability (25% Weight)';
    }
    if (cat === 'privacy') {
      if (framework === 'Ghana') return 'Citizen Privacy & Act 843 Compliance (20% Weight)';
      if (framework === 'European Union') return 'Citizen Privacy & GDPR Compliance (20% Weight)';
      if (framework === 'United States') return 'Citizen Privacy & HIPAA/CCPA Compliance (20% Weight)';
      if (framework === 'NIST AI RMF') return 'Privacy Governance & NIST Controls (20% Weight)';
      if (framework === 'ISO/IEC 42001 (AIMS)') return 'Privacy Management & ISO AIMS (20% Weight)';
      return 'Citizen Privacy & ISO/IEC Compliance (20% Weight)';
    }
    if (cat === 'security') {
      if (framework === 'Ghana') return 'Cybersecurity & Act 1038 Prevention (35% Weight)';
      if (framework === 'European Union') return 'Cybersecurity & CE Certification (35% Weight)';
      if (framework === 'United States') return 'Cybersecurity & NIST Framework (35% Weight)';
      if (framework === 'NIST AI RMF') return 'Adversarial Vulnerability & Failovers (35% Weight)';
      if (framework === 'ISO/IEC 42001 (AIMS)') return 'Operational planning & security controls (35% Weight)';
      return 'Cybersecurity & Threat Prevention (35% Weight)';
    }
    return '';
  };

  const getParentStatusIcon = (q: AuditQuestion) => {
    const subIds = q.subParameters.map(s => s.id);
    const yesCount = subIds.filter(id => answers[id] === 'yes').length;
    
    if (yesCount === 2) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" style={{ marginRight: '6px' }} />;
    } else if (yesCount === 1) {
      return <AlertCircle className="w-4 h-4 text-amber-400" style={{ marginRight: '6px' }} />;
    } else {
      return <XCircle className="w-4 h-4 text-rose-500" style={{ marginRight: '6px' }} />;
    }
  };

  const canAudit = ['Super Administrator', 'National AI Authority', 'Government Administrator', 'Auditor'].includes(currentRole);

  const renderQuestionGroup = (cat: 'fairness' | 'transparency' | 'privacy' | 'security') => {
    const colorMap = {
      fairness: 'var(--ghana-emerald)',
      transparency: '#38bdf8',
      privacy: '#fb7185',
      security: '#f43f5e'
    };

    return (
      <div key={cat} style={{ marginBottom: '20px' }}>
        <h4 style={{ 
          fontSize: '0.82rem', 
          fontWeight: 700, 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em', 
          color: colorMap[cat] || 'var(--ghana-emerald)', 
          marginBottom: '12px' 
        }}>
          {getCategoryTitle(cat)}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {(frameworkQuestions[framework] || frameworkQuestions['Ghana'])
            .filter(q => q.category === cat)
            .map(q => {
              return (
                <div key={q.id} style={{ 
                  background: 'rgba(0,0,0,0.12)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '10px',
                  padding: '14px'
                }}>
                  {/* Parent Parameter Header */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    paddingBottom: '8px'
                  }}>
                    {getParentStatusIcon(q)}
                    <span style={{ 
                      color: 'var(--text-primary)',
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      lineHeight: '1.4',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {q.text}
                      <span className="tooltip-container">
                        <Info 
                          className="w-3.5 h-3.5 text-sky-400 cursor-help hover:text-sky-300" 
                          style={{ marginLeft: '6px', opacity: 0.7 }} 
                        />
                        <span className="tooltip-text">
                          <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Parameter Goal:</strong>
                          {q.description}
                        </span>
                      </span>
                    </span>
                  </div>

                  {/* Child Sub-Parameters List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '22px' }}>
                    {q.subParameters.map(sub => {
                      const isYes = answers[sub.id] === 'yes';
                      const isNo = answers[sub.id] === 'no';
                      return (
                        <div 
                          key={sub.id}
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            alignItems: 'center', 
                            gap: '16px', 
                            padding: '10px 12px', 
                            background: 'rgba(255,255,255,0.01)', 
                            border: '1px solid rgba(255,255,255,0.03)', 
                            borderRadius: '6px',
                            fontSize: '0.8rem'
                          }}
                        >
                          <span style={{ 
                            color: isYes ? 'var(--text-primary)' : 'var(--text-secondary)',
                            lineHeight: '1.4',
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                            • {sub.text}
                            <span className="tooltip-container">
                              <Info 
                                className="w-3.5 h-3.5 text-sky-400 cursor-help hover:text-sky-300" 
                                style={{ marginLeft: '6px', opacity: 0.6 }} 
                              />
                              <span className="tooltip-text">
                                <strong style={{ color: '#38bdf8', display: 'block', marginBottom: '4px' }}>Sub-parameter Requirement:</strong>
                                {sub.description}
                              </span>
                            </span>
                          </span>
                          
                          {/* Sub-Parameter Yes/No Controls */}
                          <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                            <button
                              onClick={() => handleAnswerChange(sub.id, 'yes')}
                              disabled={!canAudit}
                              style={{
                                padding: '5px 11px',
                                borderRadius: '5px',
                                border: '1px solid ' + (isYes ? '#10b981' : 'rgba(255,255,255,0.06)'),
                                background: isYes ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.01)',
                                color: isYes ? '#34d399' : 'var(--text-muted)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: canAudit ? 'pointer' : 'default',
                                transition: 'all 0.12s ease',
                                boxShadow: isYes ? '0 0 6px rgba(16, 185, 129, 0.15)' : 'none'
                              }}
                            >
                              YES
                            </button>
                            <button
                              onClick={() => handleAnswerChange(sub.id, 'no')}
                              disabled={!canAudit}
                              style={{
                                padding: '5px 11px',
                                borderRadius: '5px',
                                border: '1px solid ' + (isNo ? '#f43f5e' : 'rgba(255,255,255,0.06)'),
                                background: isNo ? 'rgba(244, 63, 94, 0.15)' : 'rgba(255,255,255,0.01)',
                                color: isNo ? '#fb7185' : 'var(--text-muted)',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: canAudit ? 'pointer' : 'default',
                                transition: 'all 0.12s ease',
                                boxShadow: isNo ? '0 0 6px rgba(244, 63, 94, 0.15)' : 'none'
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
    );
  };

  const calculatedScore = activeProject
    ? (activeProject.compliance.fairness * 0.20) + 
      (activeProject.compliance.transparency * 0.25) + 
      (activeProject.compliance.privacy * 0.20) + 
      (activeProject.compliance.security * 0.35)
    : 0;

  return (
    <div>
      {/* Inject custom tooltip styles */}
      <style>{tooltipStyles}</style>

      {/* Target Selector */}
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
          <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>AI Governance & Ethical Scorecard</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Audit algorithm compliance against dynamic legislative acts and global AI frameworks
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Select Project:
          </span>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="form-select"
            style={{ width: '220px', padding: '8px 12px' }}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {activeProject && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* LEFT PANEL: Ethical Question Checklists */}
          <div className="glass-card" style={{ position: 'relative', zIndex: 10 }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px', 
              borderBottom: '1px solid var(--border-color)', 
              paddingBottom: '12px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>
                  Audit Verification Checklist
                </h3>
                {!canAudit && (
                  <span className="badge badge-warning" style={{ fontSize: '0.68rem' }}>Read-only Mode</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Framework:</span>
                <select
                  value={framework}
                  onChange={(e) => setFramework(e.target.value)}
                  className="form-select"
                  style={{ 
                    padding: '6px 12px', 
                    fontSize: '0.78rem', 
                    borderRadius: '6px', 
                    background: 'rgba(0,0,0,0.3)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-primary)',
                    width: '180px'
                  }}
                >
                  <option value="Ghana">🇬🇭 Ghana (DPA / Act 1038)</option>
                  <option value="European Union">🇪🇺 European Union (EU AI Act)</option>
                  <option value="United States">🇺🇸 United States (HIPAA / CCPA)</option>
                  <option value="Global Standards (ISO)">🌐 Global Standards (ISO/IEC)</option>
                  <option value="NIST AI RMF">🛡️ NIST AI RMF Core Functions</option>
                  <option value="ISO/IEC 42001 (AIMS)">⚙️ ISO/IEC 42001:2023 (AIMS)</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {renderQuestionGroup('fairness')}
              {renderQuestionGroup('transparency')}
              {renderQuestionGroup('privacy')}
              {renderQuestionGroup('security')}
            </div>
          </div>

          {/* RIGHT PANEL: Live NGS Scorecard gauge & summary */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', zIndex: 1 }}>
            
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 24px', textAlign: 'center' }}>
              <div style={{ padding: '16px', borderRadius: '50%', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                {getGradeIcon(activeProject.compliance.overallGrade)}
              </div>
              
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
                Compliance Grading
              </div>
              
              <div style={{ margin: '8px 0' }}>
                <span className={`badge ${getGradeClass(activeProject.compliance.overallGrade)}`} style={{ fontSize: '1rem', padding: '6px 18px' }}>
                  {activeProject.compliance.overallGrade}
                </span>
              </div>

              <div style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-primary)', marginTop: '12px' }}>
                {calculatedScore.toFixed(0)}%
              </div>
              
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                Weighted National Governance Score (NGS)
              </div>
            </div>

            <div className="glass-card">
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '16px' }}>Pillar Statistics Breakdown</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Fairness indicator */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Fairness & Inclusivity (20%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.fairness}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.fairness}%`, height: '100%', background: 'var(--ghana-emerald)', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Transparency */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Transparency & Explainability (25%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.transparency}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.transparency}%`, height: '100%', background: '#38bdf8', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Privacy */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Privacy & Data Security (20%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.privacy}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.privacy}%`, height: '100%', background: '#fb7185', borderRadius: '99px' }}></div>
                  </div>
                </div>

                {/* Security */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)' }}>Security & Threat Resistance (35%)</span>
                    <strong style={{ color: 'var(--text-primary)' }}>{activeProject.compliance.security}%</strong>
                  </div>
                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '99px' }}>
                    <div style={{ width: `${activeProject.compliance.security}%`, height: '100%', background: '#f43f5e', borderRadius: '99px' }}></div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
