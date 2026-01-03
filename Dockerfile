#==============================================================================
# Frontend Application - Multi-Stage Dockerfile
#==============================================================================
#
# This Dockerfile creates an optimized production build of the React frontend.
# It uses a multi-stage build to:
# 1. Build the React application with all dev dependencies
# 2. Serve the optimized static files with nginx
#
# Build Arguments:
#   NGINX_CONF - nginx configuration file (nginx.dev.conf, nginx.qa.conf, nginx.prod.conf)
#
# Build Command (Example for dev):
#   docker build --build-arg NGINX_CONF=nginx.dev.conf -t frontend:dev .
#
# Run Command:
#   docker run -p 80:80 frontend:dev
#==============================================================================

#------------------------------------------------------------------------------
# STAGE 1: Build Stage
#------------------------------------------------------------------------------
# Purpose: Compile and optimize the React application
# Base Image: node:18-alpine (includes npm and build tools)
# Output: Optimized static files in /app/build directory

FROM node:18-alpine AS build

# Set working directory for build process
WORKDIR /app

# Copy package dependency files
# package-lock.json* uses glob to handle cases where it might not exist
COPY package.json package-lock.json* ./

# Install ALL dependencies (including devDependencies)
# Required for building the React app
RUN npm install

# Copy all source files into the container
# Includes src/, public/, package.json, etc.
COPY . .

# Build the production-optimized React application
# Creates minified, bundled static files in /app/build
# - Minifies JavaScript and CSS
# - Optimizes images
# - Removes source maps (production build)
RUN npm run build

#------------------------------------------------------------------------------
# STAGE 2: Production Stage
#------------------------------------------------------------------------------
# Purpose: Serve the built static files with nginx web server
# Base Image: nginx:1.25-alpine (lightweight nginx on Alpine Linux)
# Exposed Port: 80

FROM nginx:1.25-alpine

# Accept build argument for environment-specific nginx configuration
# Default: nginx.dev.conf (can be overridden during docker build)
ARG NGINX_CONF=nginx.dev.conf

# Copy optimized build artifacts from build stage
# Source: /app/build from 'build' stage
# Destination: nginx's default static file directory
COPY --from=build /app/build /usr/share/nginx/html

# Copy environment-specific nginx configuration
# This configuration handles:
# - Serving static React files
# - Proxying API requests to backend services via APIM
# - CORS headers
# - Cache control
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Expose port 80 for HTTP traffic
# Kubernetes Service maps this to its service port
EXPOSE 80

# Start nginx in foreground mode
# -g "daemon off;" prevents nginx from running as background daemon
# This keeps the container running and allows Docker to manage the process
CMD ["nginx", "-g", "daemon off;"]
