# Dokploy Production Deployment Runbook — GNAPRMS

This runbook provides complete, step-by-step instructions to deploy and operate the **Ghana National AI Projects Registry & Monitoring System (GNAPRMS)** in production on **Dokploy**.

---

## 1. Architecture & Runtime Summary

| Attribute | Value |
| :--- | :--- |
| **Application Type** | Single Page Application (React 18 + TypeScript 5 + Vite 5) |
| **Production Web Server** | NGINX (`nginx:1.27-alpine`) |
| **Recommended Dokploy Build Type** | **Application → `Dockerfile`** *(or Docker Compose via [`docker-compose.yml`](docker-compose.yml))* |
| **Internal Container Port** | **`80`** (HTTP behind Dokploy Traefik SSL termination) |
| **Liveness / Readiness Probe** | `GET /health` or `GET /healthz` → `200 OK` (`{"status":"healthy","service":"gnaprms","version":"1.0.0"}`) |
| **Client-Side Persistence** | Browser `localStorage` (`gnaprms_projects_v2`, `gnaprms_user_session`, `gnaprms_audit_ledger`, `gnaprms_dg_verdicts`) + `IndexedDB` (`gnaprms_real_files_db` for uploaded PDF/DOCX/TXT binaries) |
| **Automated Build Verification** | Runs `npm test` (71 automated RBAC + 3-tier clearance workflow checks) and `npm run build` (`tsc && vite build`) inside Stage 1 of [`Dockerfile`](Dockerfile) |

---

## 2. Deployment Option A (Recommended): Dokploy "Application" Service (`Dockerfile`)

Using Dokploy's native **Application** resource with the root [`Dockerfile`](Dockerfile) is the cleanest and most maintainable deployment architecture because Dokploy's built-in **Traefik** reverse proxy automatically manages routing, zero-downtime rollouts, and Let's Encrypt TLS certificates.

### Step 2.1 — Create the Project & Application in Dokploy
1. Log into your **Dokploy Dashboard**.
2. Create or select a Project (e.g., `gnaprms-production`).
3. Click **Create Service** → Select **Application**.
4. Enter:
   - **Name**: `gnaprms-portal`
   - **Description**: `Ghana National AI Projects Registry & Monitoring System (NITA / MOCD)`

### Step 2.2 — Configure Git Provider & Build Type
1. Open the **General** tab of the new Application.
2. Under **Provider** (GitHub / Git Repository):
   - **Repository**: `https://github.com/nkwasi262-glitch/ai-tracker.git` (or your connected GitHub account & repo)
   - **Branch**: `main`
   - **Build Path**: `/`
3. Under **Build Type**:
   - Select **`Dockerfile`**
   - **Dockerfile Path**: `Dockerfile`
   - **Docker Context Path**: `.`

### Step 2.3 — Configure Environment Variables (Optional)
1. Open the **Environment** tab in Dokploy.
2. Paste the build-time variables from [`.env.example`](.env.example) if you want custom values (sensible defaults are already baked into [`Dockerfile`](Dockerfile)):
   ```env
   VITE_APP_ENV=production
   VITE_APP_NAME=Ghana National AI Projects Registry & Monitoring System (GNAPRMS)
   VITE_APP_VERSION=1.0.0
   VITE_API_BASE_URL=/api/v1
   ```
3. Click **Save**.

### Step 2.4 — Configure Domain, Container Port & HTTPS (Traefik)
1. Open the **Domains** tab in Dokploy.
2. Click **Add Domain** and set:
   - **Host**: Your domain or subdomain (e.g., `ai-registry.nita.gov.gh` or your Dokploy `*.traefik.me` domain)
   - **Path**: `/`
   - **Container Port**: **`80`** *(Important: NGINX listens on port `80` inside the container)*
   - **HTTPS**: Enable **HTTPS**
   - **Certificate Provider**: Select **Let's Encrypt**
3. Click **Create / Save**.

### Step 2.5 — Deploy
1. Go to the **General** tab and click **Deploy**.
2. Open the **Logs / Deployments** tab to monitor the multi-stage build:
   - **Stage 1 (`node:20-alpine`)**: Runs `npm ci`, executes all 71 automated verification tests (`npm test`), and compiles the vendor-split production bundle (`npm run build`).
   - **Stage 2 (`nginx:1.27-alpine`)**: Copies [`nginx.conf`](nginx.conf) and `/app/dist` into `/usr/share/nginx/html` and starts NGINX with the `/health` check active.

---

## 3. Deployment Option B: Dokploy "Compose" Service (`docker-compose.yml`)

If you prefer deploying via Docker Compose in Dokploy or on any Linux VM:

1. In Dokploy, click **Create Service** → **Compose**.
2. Set **Compose Type** to `Docker Compose` and **Compose Path** to `./docker-compose.yml`.
3. In the **Domains** tab of the Compose service:
   - Select service: **`gnaprms-web`**
   - Set **Container Port**: **`80`**
   - Enable **HTTPS (Let's Encrypt)**.
4. Click **Deploy**.

For standalone local or server verification outside Dokploy:
```bash
docker compose up -d --build
curl -i http://localhost:8080/health
```

---

## 4. Post-Deployment Verification Checklist

Run the following checks immediately after deployment completes:

### 4.1 Verify Container Health Endpoint
```bash
curl -i https://<your-dokploy-domain>/health
```
**Expected Response:**
```http
HTTP/2 200
content-type: application/json
cache-control: no-store

{"status":"healthy","service":"gnaprms","version":"1.0.0"}
```

### 4.2 Verify SPA Routing & Cache Headers
```bash
curl -I https://<your-dokploy-domain>/
```
**Expected Headers:**
- `HTTP/2 200`
- `cache-control: no-cache, no-store, must-revalidate` (ensures instant updates on future deployments)
- `x-frame-options: SAMEORIGIN`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`

### 4.3 Functional Smoke Test in Browser
1. Open `https://<your-dokploy-domain>` in your browser.
2. Verify the **Mandatory Institutional Verification Gate** loads cleanly.
3. Test **First-Timer / New User** onboarding:
   - Log in with an MDA and institutional email (`@nita.gov.gh` or `@ghs.gov.gh`).
   - Confirm the active project matches the logged-in MDA and uploaded documents auto-grade **Governance & Ethics** and **AI Readiness**.
4. Test the **3-Tier Statutory Clearance Dedicated Spaces** in **Documents & OCR**:
   - **Space 1 (`Technical Clearance Team Clearance`)**: Enter comment and click **Recommend to Tech Director** or **Pass Comment**.
   - **Space 2 (`Technical Director Recommendation`)**: Enter comment and click **Recommend to DG** or **Pass Comment**.
   - **Space 3 (`Director General / Super Admin Registration Clearance`)**: Enter directive and click **Approve**, **Pend**, or **Reject**, then verify the final status, project counter, and budget update on the **M&E Dashboard**.

---

## 5. Operations, Zero-Downtime Updates & Troubleshooting

- **Automatic Webhook Deployments**: Enable **Auto Deploy** in Dokploy's **General** tab so every `git push origin main` automatically runs tests, builds a fresh image, verifies `/health`, and swaps containers without downtime.
- **502 Bad Gateway on Dokploy**: Verify that **Container Port** in the Dokploy **Domains** tab is set to **`80`** (not `3000` or `8080`).
- **Build Failure in Stage 1**: Check the Dokploy deployment logs. Because `RUN npm test && npm run build` runs inside the [`Dockerfile`](Dockerfile), any TypeScript compiler error or broken RBAC/workflow test will halt the build before affecting the running production container.

