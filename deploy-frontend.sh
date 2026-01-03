#!/bin/bash

# Quick deployment script for frontend
# Usage: ./deploy-frontend.sh <environment>
# Example: ./deploy-frontend.sh dev

set -e

ENV=$1

if [ -z "$ENV" ]; then
    echo "Usage: ./deploy-frontend.sh <environment>"
    echo "Example: ./deploy-frontend.sh dev"
    exit 1
fi

if [ "$ENV" != "dev" ] && [ "$ENV" != "qa" ] && [ "$ENV" != "prod" ]; then
    echo "Error: Environment must be dev, qa, or prod"
    exit 1
fi

echo "================================================"
echo "Deploying Frontend to $ENV"
echo "================================================"

# Set ACR and resource names based on environment
if [ "$ENV" == "dev" ]; then
    ACR_NAME="gopaldevacr"
    RG_NAME="rg-gopal-dev"
    APP_NAME="app-gopal-ui-dev"
    NGINX_CONF="nginx.dev.conf"
elif [ "$ENV" == "qa" ]; then
    ACR_NAME="gopalqaacr"
    RG_NAME="rg-gopal-qa"
    APP_NAME="app-gopal-ui-qa"
    NGINX_CONF="nginx.qa.conf"
else
    ACR_NAME="gopalprodacr"
    RG_NAME="rg-gopal-prod"
    APP_NAME="app-gopal-ui-prod"
    NGINX_CONF="nginx.prod.conf"
fi

echo "Step 1/4: Logging into ACR..."
az acr login --name $ACR_NAME

echo "Step 2/4: Building Docker image..."
docker build --build-arg NGINX_CONF=$NGINX_CONF -t $ACR_NAME.azurecr.io/gopal-frontend:$ENV .

echo "Step 3/4: Pushing to ACR..."
docker push $ACR_NAME.azurecr.io/gopal-frontend:$ENV

echo "Step 4/4: Updating App Service..."
az webapp config container set \
  --resource-group $RG_NAME \
  --name $APP_NAME \
  --docker-custom-image-name $ACR_NAME.azurecr.io/gopal-frontend:$ENV

az webapp restart --resource-group $RG_NAME --name $APP_NAME

echo ""
echo "================================================"
echo "Deployment Complete!"
echo "================================================"
echo ""
echo "Getting App Service URL..."
az webapp show --resource-group $RG_NAME --name $APP_NAME --query "defaultHostName" -o tsv
echo ""
echo "Wait 2-3 minutes for container to restart, then visit the URL above."
