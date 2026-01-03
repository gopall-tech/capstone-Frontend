# Frontend Deployment Guide

## Prerequisites

1. Terraform infrastructure deployed (App Service, ACR)
2. Backend services deployed and LoadBalancer IP obtained
3. APIM configured with backend routes
4. Azure CLI logged in

## Option 1: Manual Deployment

### Step 1: Build Docker Images

**Dev Environment:**
```bash
# Login to ACR
az acr login --name gopaldevacr

# Build image with dev nginx config
docker build --build-arg NGINX_CONF=nginx.dev.conf -t gopaldevacr.azurecr.io/gopal-frontend:dev .

# Push to ACR
docker push gopaldevacr.azurecr.io/gopal-frontend:dev
```

**QA Environment:**
```bash
az acr login --name gopalqaacr
docker build --build-arg NGINX_CONF=nginx.qa.conf -t gopalqaacr.azurecr.io/gopal-frontend:qa .
docker push gopalqaacr.azurecr.io/gopal-frontend:qa
```

**Prod Environment:**
```bash
az acr login --name gopalprodacr
docker build --build-arg NGINX_CONF=nginx.prod.conf -t gopalprodacr.azurecr.io/gopal-frontend:prod .
docker push gopalprodacr.azurecr.io/gopal-frontend:prod
```

### Step 2: Configure App Service

**Dev Environment:**
```bash
# Configure container
az webapp config container set \
  --resource-group rg-gopal-dev \
  --name app-gopal-ui-dev \
  --docker-custom-image-name gopaldevacr.azurecr.io/gopal-frontend:dev

# Restart app
az webapp restart \
  --resource-group rg-gopal-dev \
  --name app-gopal-ui-dev
```

**QA Environment:**
```bash
az webapp config container set \
  --resource-group rg-gopal-qa \
  --name app-gopal-ui-qa \
  --docker-custom-image-name gopalqaacr.azurecr.io/gopal-frontend:qa

az webapp restart --resource-group rg-gopal-qa --name app-gopal-ui-qa
```

**Prod Environment:**
```bash
az webapp config container set \
  --resource-group rg-gopal-prod \
  --name app-gopal-ui-prod \
  --docker-custom-image-name gopalprodacr.azurecr.io/gopal-frontend:prod

az webapp restart --resource-group rg-gopal-prod --name app-gopal-ui-prod
```

### Step 3: Get App Service URLs

```bash
# Dev
az webapp show --resource-group rg-gopal-dev --name app-gopal-ui-dev --query "defaultHostName" -o tsv

# QA
az webapp show --resource-group rg-gopal-qa --name app-gopal-ui-qa --query "defaultHostName" -o tsv

# Prod
az webapp show --resource-group rg-gopal-prod --name app-gopal-ui-prod --query "defaultHostName" -o tsv
```

### Step 4: Test the Application

Open the URLs in your browser:
- Dev: `https://app-gopal-ui-dev.azurewebsites.net`
- QA: `https://app-gopal-ui-qa.azurewebsites.net`
- Prod: `https://app-gopal-ui-prod.azurewebsites.net`

You should see the image upload interface.

## Option 2: Azure DevOps Pipeline

### Step 1: Create Environments

In Azure DevOps:
1. Pipelines → Environments → New environment
2. Create:
   - `QA-Frontend`
   - `Prod-Frontend`
3. Add approvals to each

### Step 2: Create Pipeline

1. Pipelines → New pipeline
2. Select **GitHub**
3. Select `gopall-tech/capstone-Frontend`
4. Use existing file: `/pipelines/azure-pipelines-frontend.yml`
5. Save and run

## Nginx Configuration Details

The nginx configs proxy API requests to APIM:

- `/api/a` → `https://apim-gopal-{env}.azure-api.net/api/a`
- `/api/b` → `https://apim-gopal-{env}.azure-api.net/api/b`

All other requests serve the React SPA.

## Updating APIM URLs

If your APIM URLs are different, edit the nginx config files:

```bash
# nginx.dev.conf
location /api/a {
    proxy_pass https://YOUR-APIM-URL/api/a;
    ...
}
```

Then rebuild and redeploy.

## Local Development

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm start
```

**Note:** In local dev, API calls will fail because `/api/a` and `/api/b` aren't proxied. You'll need to:

1. Update `src/App.js` to use full URLs:
```javascript
const res = await fetch("https://apim-gopal-dev.azure-api.net/api/a", {
```

OR

2. Set up local proxy in `package.json`:
```json
"proxy": "https://apim-gopal-dev.azure-api.net"
```

## Troubleshooting

### App Service shows "Application Error"

Check logs:
```bash
az webapp log tail --resource-group rg-gopal-dev --name app-gopal-ui-dev
```

Common issues:
- Container failed to start (check Docker image builds correctly)
- Port configuration (ensure Dockerfile exposes port 80)

### API calls fail (CORS errors)

1. Check that APIM is accessible from App Service
2. Verify nginx config proxies to correct APIM URL
3. Check APIM CORS policies

### Container doesn't update

```bash
# Force pull latest image
az webapp config container set \
  --resource-group rg-gopal-dev \
  --name app-gopal-ui-dev \
  --docker-custom-image-name gopaldevacr.azurecr.io/gopal-frontend:dev

# Restart
az webapp restart --resource-group rg-gopal-dev --name app-gopal-ui-dev

# Wait 2-3 minutes for container to restart
```

## Performance Optimization

### Enable Application Insights

```bash
az monitor app-insights component create \
  --app gopal-frontend-dev \
  --location australiacentral \
  --resource-group rg-gopal-dev

# Link to App Service
az webapp config appsettings set \
  --resource-group rg-gopal-dev \
  --name app-gopal-ui-dev \
  --settings APPLICATIONINSIGHTS_CONNECTION_STRING="<connection-string>"
```

### Enable CDN (Optional)

For production, consider Azure CDN for static assets:

```bash
az cdn profile create \
  --resource-group rg-gopal-prod \
  --name gopal-cdn-prod \
  --sku Standard_Microsoft

az cdn endpoint create \
  --resource-group rg-gopal-prod \
  --profile-name gopal-cdn-prod \
  --name gopal-frontend-prod \
  --origin app-gopal-ui-prod.azurewebsites.net
```

## Security Enhancements

### Enable HTTPS Only

```bash
az webapp update \
  --resource-group rg-gopal-dev \
  --name app-gopal-ui-dev \
  --https-only true
```

### Custom Domain (Optional)

```bash
# Add custom domain
az webapp config hostname add \
  --resource-group rg-gopal-prod \
  --webapp-name app-gopal-ui-prod \
  --hostname yourdomain.com

# Bind SSL certificate
az webapp config ssl bind \
  --resource-group rg-gopal-prod \
  --name app-gopal-ui-prod \
  --certificate-thumbprint <thumbprint> \
  --ssl-type SNI
```
