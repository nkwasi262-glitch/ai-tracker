# User & Administrator Manual: GNAPRMS

This document serves as the official operational guide for the **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)**, providing instructions for system operators, project managers, ministries, and auditors.

---

## 1. System Navigation & Dashboard Layout

When users log into GNAPRMS, they are greeted by the main portal dashboard, designed to adapt dynamic options based on the user's active role.

```text
+-----------------------------------------------------------------------------+
|  [GHANA COAT OF ARMS]  GHANA NATIONAL AI REGISTRY & MONITORING SYSTEM       |
|  Active Role: Super Administrator | User: Yaw Boateng | Date: 2026-06-02   |
+-----------------------------------------------------------------------------+
|  [ DOCKED SIDEBAR ]  |  [ MAIN DASHBOARD PANEL ]                             |
|                      |                                                      |
|  - Dashboard         |  [ KPI CARD 1 ]  [ KPI CARD 2 ]  [ KPI CARD 3 ]      |
|  - Registry          |  Total Projects  Active Projects Total Budget        |
|  - GIS Map           |        24               15         GHS 124M          |
|  - Governance        |                                                      |
|  - AI Readiness      |  +----------------------------+ +-----------------+  |
|  - Risk Register     |  | Budget Utilization Graph   | | Sector Analysis |  |
|  - Documents         |  |                            | | (Radar Chart)   |  |
|  - AI Chatbot        |  |                            | |                 |  |
|  - Observatory       |  +----------------------------+ +-----------------+  |
|                      |                                                      |
|                      |  [ GEOSPATIAL MAP ]                                  |
|                      |  Interactive Leaflet Map showing Accra, Kumasi, etc. |
+-----------------------------------------------------------------------------+
```

### Navigational Panels
* **Header**: Contains the Ghana National Crest, active user name, current system date, Dark Mode toggle, and the **Role Switcher** (useful for staging testing).
* **Sidebar**: Links to all functional modules of the portal. Administrative links are highlighted or greyed out dynamically.
* **Content Viewport**: Responsive canvas executing and rendering the active component.

---

## 2. Institutional Administrator Guide

This section is tailored for representatives of MDAs, Universities, and Private start-ups registering and managing projects.

### A. Registering a New AI Project
1. Navigate to the **Project Registry** page from the sidebar.
2. Click on the **"Register New AI Project"** action button.
3. Complete the multi-part registration form:
   * **Project Name & Description**: Clear explanations of the project and its goals.
   * **Category & Sector**: Choose from ML, Generative AI, Computer Vision, etc. and corresponding economic sectors (Health, Agriculture, security).
   * **GIS Coordinates**: Enter Latitude and Longitude coordinates (decimal format) of the primary datacenter or deployment site (e.g., Accra: `5.6037, -0.1870`).
   * **Budget Allocation**: Input approved funding limits, primary source (e.g., Government funding, donor grants), and currency.
4. Click **"Submit Project for Review"**. The project status is set to `Concept` and queued in the workflow.

### B. Updating Milestones & Deliverables
1. Select your project from the Project List.
2. Navigate to the **Milestones** subsection.
3. Click on any active milestone (e.g., "Model Training", "Data Gathering") to update progress (slider from 0% to 100%) and save. Updates trigger logs.

---

## 3. M&E Officer & Auditor Guide

This section is designed for National AI Authority officers and compliance teams.

### A. Performing AI Ethical Assessments
1. Navigate to the **Governance & Compliance** module.
2. Select the targeted project from the dropdown.
3. Fill in the **Ethical Assessment Checklist** across the 5 pillars:
   * *Fairness*: Has the team tested training datasets for regional or tribal biases?
   * *Accountability*: Is there a human-in-the-loop escalation workflow?
   * *Transparency*: Are model cards and source dataset origins published?
   * *Privacy*: Are personal records encrypted and hashed under Act 843?
   * *Security*: Has the code undergone penetration testing?
4. The system dynamically computes the overall **National Governance Score (NGS)** and outputs a compliance grade (e.g., Excellent, Good, High Risk).
5. Add any mandatory recommendations and submit.

### B. Risk Mitigation Tracking
1. Navigate to the **Risk Management Matrix**.
2. Review the interactive 5x5 grid. High-severity/high-probability risks are plotted in red (Critical).
3. Select a risk from the register to write mitigation tasks or elevate the status from "Open" to "Mitigated".

---

## 4. Super Administrator & System Configuration

1. **User Role Management**: Super Administrators manage staff directory accounts, change institutional affiliations (MDAs), enable/disable Multi-Factor Authentication (MFA), and override dynamic approvals.
2. **Audit Logs Review**: Administrators can search all system actions (creating projects, deleting documents, modified budgets) from the unified system ledger. Logs are immutable, ensuring complete accountability.
