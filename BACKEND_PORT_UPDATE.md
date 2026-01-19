# Backend Configuration Update - Port 8081

## Changes Made

The frontend has been updated to use port **8081** instead of 8080 for the backend.

### Files Updated

1. **src/utils/api.ts** - API base URL
   - Changed: `http://localhost:8080` → `http://localhost:8081`
   - Added CORS support with `withCredentials: true`
   - Added CORS error handling and logging

2. **src/services/websocketService.ts** - WebSocket URL
   - Changed: `ws://localhost:8080` → `ws://localhost:8081`

3. **src/services/authService.ts** - Identity endpoint
   - Changed from: `POST /identify` with request body
   - Changed to: `GET /identity?email=...` with query parameters
   - Matches your curl: `curl 'http://localhost:8081/identity?email=ops%40acme.example'`

4. **Created .env.local** - Environment configuration
   ```env
   VITE_API_URL=http://localhost:8081
   VITE_WS_URL=ws://localhost:8081
   ```

---

## CORS Configuration on Backend

If you encounter CORS errors, ensure your Spring Boot backend has CORS enabled:

### Option 1: Global CORS Configuration

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

### Option 2: Annotation-based (per controller)

```java
@CrossOrigin(origins = "http://localhost:5173", 
             allowedHeaders = "*", 
             methods = {RequestMethod.GET, RequestMethod.POST})
@RestController
@RequestMapping("/api")
public class YourController {
    // Your endpoints
}
```

### Option 3: Properties File

```yaml
# application.yml
spring:
  web:
    cors:
      allowed-origins: http://localhost:5173,http://localhost:3000
      allowed-methods: GET,POST,PUT,DELETE,PATCH
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

---

## How to Start Backend on Port 8081

### Option 1: Maven Command Line
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Option 2: Environment Variable
```bash
SERVER_PORT=8081 mvn spring-boot:run
```

### Option 3: Application Properties
In `src/main/resources/application.yml`:
```yaml
server:
  port: 8081
```

### Option 4: application-dev.yml
```yaml
server:
  port: 8081
  
spring:
  profiles:
    active: dev
```

Then run: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`

---

## Testing the Updated Configuration

### 1. Start Backend
```bash
# Using Maven
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"

# Or if configured in application.yml
mvn spring-boot:run
```

### 2. Verify Backend is Running
```bash
# Test the identity endpoint
curl 'http://localhost:8081/identity?email=ops%40acme.example'

# Expected response (adjust based on your API):
{
  "id": 123,
  "email": "ops@acme.example",
  "name": "ops",
  "tenantId": 1
}
```

### 3. Start Frontend
```bash
cd frontend
npm run dev
# Opens on http://localhost:5173
```

### 4. Test Login Flow
1. Navigate to `http://localhost:5173/login`
2. Enter email: `ops@acme.example`
3. Click "Login" or "Register as Tenant"
4. Check browser console (F12) for any errors
5. Should redirect to `/role-selection`

---

## Troubleshooting CORS Errors

### Error: "Access to XMLHttpRequest has been blocked by CORS policy"

**Symptoms:**
```
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**Solutions:**

1. **Check backend is running on correct port**
   ```bash
   curl http://localhost:8081/health
   ```

2. **Verify CORS is enabled on backend** - Check your Spring Boot configuration

3. **Clear browser cache**
   - Ctrl+Shift+Delete (Windows/Linux)
   - Cmd+Shift+Delete (Mac)

4. **Check browser console for exact error**
   - Open DevTools (F12)
   - Go to Network tab
   - Look for failed requests
   - Click the failed request and check Response headers

5. **Add origin to CORS whitelist**
   ```java
   .allowedOrigins("http://localhost:5173")
   ```

### Error: "Failed to connect to backend"

**Symptoms:**
```
Network error or Cannot reach server
```

**Solutions:**

1. **Verify backend is running**
   ```bash
   lsof -i :8081  # Check if port is in use
   ```

2. **Verify .env.local is correct**
   ```
   VITE_API_URL=http://localhost:8081
   VITE_WS_URL=ws://localhost:8081
   ```

3. **Restart frontend dev server**
   ```bash
   npm run dev
   ```

4. **Check firewall settings**
   - Ensure port 8081 is not blocked

---

## Environment Variables Reference

### Development (.env.local)
```env
VITE_API_URL=http://localhost:8081
VITE_WS_URL=ws://localhost:8081
```

### Production (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com
```

### Build Environment Override
```bash
VITE_API_URL=http://custom-host:8081 npm run build
```

---

## Backend API Endpoints (Updated)

All endpoints now use port 8081:

```
Authentication:
GET    http://localhost:8081/identity?email=...
POST   http://localhost:8081/tenants
POST   http://localhost:8081/drivers

Rides:
POST   http://localhost:8081/rides
GET    http://localhost:8081/rides/{id}
PATCH  http://localhost:8081/rides/{id}/status

Drivers:
POST   http://localhost:8081/drivers
PUT    http://localhost:8081/drivers/{id}/location
PUT    http://localhost:8081/drivers/{id}/status
POST   http://localhost:8081/drivers/{id}/accept

Trips:
POST   http://localhost:8081/trips/{id}/start
POST   http://localhost:8081/trips/{id}/end
GET    http://localhost:8081/trips/{id}

Payments:
POST   http://localhost:8081/payments
GET    http://localhost:8081/payments/{id}
```

---

## Quick Start (One Command)

```bash
# Terminal 1 - Backend
SERVER_PORT=8081 mvn spring-boot:run

# Terminal 2 - Frontend
cd frontend && npm run dev

# Open http://localhost:5173 in browser
```

---

## Version History

- **v1.1** (Current)
  - Updated to port 8081
  - Changed identity endpoint to GET with query parameter
  - Added CORS support and error handling
  - Created .env.local for configuration

- **v1.0**
  - Initial implementation with port 8080

---

**Last Updated:** January 2026  
**Status:** ✅ Ready to use
