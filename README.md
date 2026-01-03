# Capstone Frontend

This repository contains the React frontend application for the capstone project.

## What's in This Repo

This repo contains a React Single Page Application (SPA) that provides a user interface for uploading images to the backend services:

- **React Application**: User interface for file uploads
- **Environment-Specific Nginx**: Different configs for dev/qa/prod
- **CI/CD Pipeline**: GitHub Actions workflow for automated deployment
- **Dockerized**: Containerized with nginx for production serving

## Repository Structure

```
capstone-Frontend/
├── public/
│   └── index.html            # HTML template
├── src/
│   ├── App.js                # Main React component
│   ├── index.js              # React entry point
│   └── App.css               # Styles
├── nginx.dev.conf            # Nginx config for dev
├── nginx.qa.conf             # Nginx config for QA
├── nginx.prod.conf           # Nginx config for prod
├── Dockerfile                # Multi-stage build
├── package.json              # Dependencies
└── .github/
    └── workflows/
        └── deploy.yml        # Automated CI/CD pipeline
```

## How This Fits in the Overall Project

This is **1 of 3 repositories** that make up the complete capstone project:

### 1. [capstone-Backend](https://github.com/gopall-tech/capstone-Backend)
**What it contains**: Backend microservices (Node.js/Express)
- Two REST API services (backend-a and backend-b)
- Handles file uploads and database storage
- **This frontend calls these APIs**

### 2. [capstone-Frontend](https://github.com/gopall-tech/capstone-Frontend) (THIS REPO)
**What it contains**: Frontend web application (React)
- User interface for uploading files
- Calls backend-a and backend-b APIs
- Environment-specific nginx configurations
- GitHub Actions CI/CD workflow

### 3. [capstone-terraform](https://github.com/gopall-tech/capstone-terraform)
**What it contains**: Infrastructure as Code and deployment configs
- Terraform modules for Azure resources
- Kubernetes deployment manifests for all services
- Includes deployment manifest for this frontend

**How they connect**:
```
┌──────────────────┐
│ THIS REPO        │
│ React Frontend   │ ← User interacts here
└────────┬─────────┘
         │
         │ HTTP POST (file uploads)
         ▼
┌──────────────────┐
│      APIM        │ ← API Gateway - THE ONLY WAY to access backends
│  (Azure API Mgmt)│    (rate limiting, authentication, policies)
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌────────┐
│Backend │ │Backend │ ← API services (backend repo)
│   A    │ │   B    │    Running in AKS (K8s)
└────────┘ └────────┘
```

## Features

- **Upload to Backend A**: Sends files to `/api/a` endpoint
- **Upload to Backend B**: Sends files to `/api/b` endpoint
- **Real-time Response Display**: Shows JSON responses from backends
- **Environment Detection**: Uses different nginx configs per environment
- **Production-Ready**: Optimized React build served by nginx

## CI/CD Pipeline (`.github/workflows/deploy.yml`)

This workflow automatically builds and deploys the frontend:

**What happens when you push code:**

1. **Build Job**:
   - Builds React app with dev nginx config
   - Creates Docker image with optimized production build
   - Pushes to dev ACR (Azure Container Registry)
   - Tags: `dev-{commit-sha}` and `dev-latest`

2. **Deploy-Dev Job**:
   - Automatically deploys to dev AKS cluster
   - Updates deployment with new image
   - No approval needed

3. **Promote-to-QA Job**:
   - **⏸ Waits for manual approval**
   - Pulls image from dev ACR
   - Retags and pushes to QA ACR
   - Deploys to QA AKS cluster

4. **Promote-to-Prod Job**:
   - **⏸ Waits for manual approval**
   - Pulls image from QA ACR
   - Retags and pushes to Prod ACR
   - Deploys to Prod AKS cluster

**Required GitHub Secrets:**
- `AZURE_CREDENTIALS` - Service Principal for Azure access
- `POSTGRES_ADMIN_PASSWORD` - Database password (for consistency)

## Current Deployment Status

### ✅ Dev Environment
- **URL**: http://20.28.60.126/
- **Backend A API**: http://20.28.60.126/api/a/
- **Backend B API**: http://20.28.60.126/api/b/
- **Status**: Fully operational

### ✅ QA Environment
- **URL**: http://20.28.46.94/
- **Backend A API**: http://20.28.46.94/api/a/
- **Backend B API**: http://20.28.46.94/api/b/
- **Status**: Fully operational

### ✅ Prod Environment
- **URL**: http://20.53.16.223/
- **Backend A API**: http://20.53.16.223/api/a/
- **Backend B API**: http://20.53.16.223/api/b/
- **Status**: Fully operational

## Local Development

### Prerequisites
- Node.js 18+
- npm or yarn

### Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm start

# App opens at http://localhost:3000
```

### Build for Production
```bash
# Create optimized build
npm run build

# Output in build/ directory
```

### Test Docker Build
```bash
# Build dev image
docker build --build-arg NGINX_CONF=nginx.dev.conf -t frontend:dev .

# Run container
docker run -p 8080:80 frontend:dev

# Access at http://localhost:8080
```

## Environment-Specific Configuration

The app uses different nginx configurations for each environment:

### nginx.dev.conf
- Proxies `/api/*` to dev backend services
- CORS configured for development
- Access logs enabled

### nginx.qa.conf
- Proxies `/api/*` to QA backend services
- Production-like configuration
- Access logs enabled

### nginx.prod.conf
- Proxies `/api/*` to prod backend services
- Production configuration
- Optimized for performance

**How it works:**
The Dockerfile uses a build argument to copy the correct nginx config:
```dockerfile
ARG NGINX_CONF=nginx.dev.conf
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf
```

## Container Images

Images are stored in Azure Container Registry:

### Dev
- `gopaldevacr.azurecr.io/frontend:dev-latest`
- `gopaldevacr.azurecr.io/frontend:dev-{sha}`

### QA
- `gopalqaacr.azurecr.io/frontend:qa-latest`
- `gopalqaacr.azurecr.io/frontend:qa-{sha}`

### Prod
- `gopalprodacr.azurecr.io/frontend:prod-latest`
- `gopalprodacr.azurecr.io/frontend:prod-{sha}`

## Kubernetes Deployment

The frontend is deployed to AKS with:
- **2 replicas** for high availability
- **Service**: ClusterIP exposing port 80
- **Ingress**: Routes `/` traffic to frontend

Deployment manifests are in the [capstone-terraform](https://github.com/gopall-tech/capstone-terraform) repo at:
- `k8s/frontend-deployment.yaml`
- Ingress configured in `k8s/ingress.yaml`

## Making Changes

1. **Make code changes** in `src/` directory
2. **Test locally** with `npm start`
3. **Commit and push** to `main` branch
   ```bash
   git add .
   git commit -m "Your message"
   git push origin main
   ```
4. **Automatic deployment** to dev happens immediately
5. **Go to GitHub Actions** tab to monitor progress
6. **Approve QA deployment** when ready (click "Review deployments")
7. **Approve Prod deployment** when ready

## Monitoring & Troubleshooting

### View Logs
```bash
# Switch to environment
az aks get-credentials --resource-group rg-gopal-dev --name aks-gopal-dev

# View frontend logs
kubectl logs -f -n gopal-app -l app=frontend
```

### Check Status
```bash
# Check pods
kubectl get pods -n gopal-app -l app=frontend

# Check deployment
kubectl get deployment frontend -n gopal-app

# Describe pod
kubectl describe pod <pod-name> -n gopal-app
```

### Restart Frontend
```bash
kubectl rollout restart deployment/frontend -n gopal-app
```

### Access Frontend in Browser
- **Dev**: Open http://20.28.60.126/
- **QA**: Open http://20.28.46.94/
- **Prod**: Open http://20.53.16.223/

## Application Architecture

### React Component Structure
```
App.js
├── Upload to Backend A Component
│   ├── File input
│   ├── Upload button
│   └── Response display
│
└── Upload to Backend B Component
    ├── File input
    ├── Upload button
    └── Response display
```

### API Communication
```javascript
// POST to backend-a
fetch('/api/a/', {
  method: 'POST',
  body: formData  // Contains uploaded file
})

// POST to backend-b
fetch('/api/b/', {
  method: 'POST',
  body: formData  // Contains uploaded file
})
```

## Request Flow through APIM

All API requests go through Azure API Management (APIM):

**Client Request Flow:**
```
User Browser
    ↓
Frontend (React App)
    ↓
APIM Gateway (API Management)
    ↓
Backend Services (backend-a or backend-b in K8s)
    ↓
PostgreSQL Database
```

**Why APIM is the ONLY gateway:**
- **Centralized API Management**: Single entry point for all backend APIs
- **Rate Limiting & Throttling**: Protects backends from overload
- **Authentication & Authorization**: Enforces security policies
- **API Versioning**: Manages API versions and deprecation
- **Analytics & Monitoring**: Tracks all API usage
- **CORS Handling**: Manages cross-origin requests centrally

## Related Documentation

- **Backend APIs**: See [capstone-Backend](https://github.com/gopall-tech/capstone-Backend) for API documentation
- **Infrastructure**: See [capstone-terraform](https://github.com/gopall-tech/capstone-terraform) for K8s and Azure setup
- **CI/CD Setup**: See `GITHUB_ACTIONS_SETUP.md` in terraform repo

## Dependencies

Key dependencies:
- **react**: UI library
- **react-dom**: React rendering
- **react-scripts**: Build tooling

Production serving:
- **nginx**: Web server and reverse proxy

## Support

- **Frontend issues**: Check this repository's issues
- **Deployment issues**: Check GitHub Actions workflow logs
- **Backend API issues**: See [capstone-Backend](https://github.com/gopall-tech/capstone-Backend)
- **Infrastructure issues**: See [capstone-terraform](https://github.com/gopall-tech/capstone-terraform)
