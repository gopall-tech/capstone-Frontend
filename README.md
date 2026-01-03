# Capstone Frontend

React SPA for uploading images to multiple backend services.

## Features

- Upload images to Backend-A via `/api/a`
- Upload images to Backend-B via `/api/b`
- Real-time response display
- Environment-specific Nginx configurations

## Development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Docker

Environment-specific builds:
- Dev: `docker build --build-arg NGINX_CONF=nginx.dev.conf -t frontend:dev .`
- QA: `docker build --build-arg NGINX_CONF=nginx.qa.conf -t frontend:qa .`
- Prod: `docker build --build-arg NGINX_CONF=nginx.prod.conf -t frontend:prod .`
