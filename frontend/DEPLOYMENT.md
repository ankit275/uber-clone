# Deployment Guide

This guide covers deploying the Uber Frontend application to various platforms.

## Prerequisites

- Node.js 18+ installed
- Backend API running and accessible
- Environment variables configured

## Environment Variables

Create environment files based on your deployment target:

### Development (`.env.development`)
```env
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

### Production (`.env.production`)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

## Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist` directory.

## Deployment Options

### 1. Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Configure environment variables in Vercel dashboard:
   - `VITE_API_URL`
   - `VITE_WS_URL`

### 2. Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy the `dist` folder to Netlify:
   - Use Netlify CLI or drag & drop in the dashboard
   - Configure build command: `npm run build`
   - Configure publish directory: `dist`

3. Set environment variables in Netlify dashboard

### 3. Docker

1. Build the Docker image:
```bash
docker build -t uber-frontend .
```

2. Run the container:
```bash
docker run -p 80:80 -e VITE_API_URL=https://api.yourdomain.com uber-frontend
```

3. Or use docker-compose:
```yaml
version: '3.8'
services:
  frontend:
    build: .
    ports:
      - "80:80"
    environment:
      - VITE_API_URL=https://api.yourdomain.com
      - VITE_WS_URL=wss://api.yourdomain.com
```

### 4. Static Hosting (AWS S3, Azure Blob, etc.)

1. Build the project:
```bash
npm run build
```

2. Upload the contents of the `dist` directory to your static hosting service

3. Configure the hosting service to:
   - Serve `index.html` for all routes (for React Router)
   - Enable gzip compression
   - Set appropriate cache headers

### 5. Traditional Server (Nginx, Apache)

#### Nginx Configuration

Use the provided `nginx.conf` or create a server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://your-backend-url;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /ws {
        proxy_pass http://your-backend-url;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Performance Optimization

The production build includes:
- Code splitting
- Tree shaking
- Minification
- Asset optimization
- Lazy loading

## Security Headers

The nginx configuration includes security headers. For other platforms, configure:
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## Monitoring

Consider adding:
- Error tracking (Sentry, LogRocket)
- Analytics (Google Analytics, Plausible)
- Performance monitoring (Lighthouse CI)

## Troubleshooting

### Build Errors
- Ensure Node.js 18+ is installed
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Runtime Errors
- Verify environment variables are set correctly
- Check browser console for errors
- Verify API endpoints are accessible
- Check CORS configuration on backend

### Map Not Loading
- Verify Leaflet CSS is loaded
- Check browser console for Leaflet errors
- Ensure map tiles are accessible (OpenStreetMap)

### WebSocket Connection Issues
- Verify WebSocket URL is correct
- Check backend WebSocket configuration
- Verify firewall/network allows WebSocket connections