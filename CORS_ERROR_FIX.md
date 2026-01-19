# CORS Error Debugging

## Issue
You're getting a CORS error on the identity endpoint because your Spring Boot backend isn't configured to accept requests from http://localhost:5173

## Solution Steps

### Step 1: Add CORS Configuration to Backend

**Option A: Java Configuration (Recommended)**
```java
// File: src/main/java/com/uberbackend/config/CorsConfig.java

package com.uberbackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

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

**Option B: application.yml**
```yaml
server:
  port: 8081

spring:
  web:
    cors:
      allowed-origins: "http://localhost:5173"
      allowed-methods: "GET,POST,PUT,DELETE,PATCH"
      allowed-headers: "*"
      allow-credentials: true
      max-age: 3600
```

### Step 2: Restart Backend
```bash
# Stop current process (Ctrl+C)
# Then restart
mvn spring-boot:run -Dspring-boot.run.arguments="--server.port=8081"
```

### Step 3: Clear Frontend Cache
```bash
# In browser DevTools:
# 1. Open DevTools (F12)
# 2. Right-click the reload button
# 3. Select "Empty cache and hard reload"
```

### Step 4: Try Login Again
1. Go to http://localhost:5173/login
2. Enter: rahul@gmail.com
3. Click Login
4. Check Network tab - should now see 200 status, not CORS error

## What Causes CORS Error?

Browser security policy blocks requests when:
- Frontend origin: `http://localhost:5173`
- Backend doesn't list this origin in `Access-Control-Allow-Origin` header
- Request is made to `http://localhost:8081`

## Verify It's Fixed

In DevTools Network tab, look for the identity request:
- Should show Status: **200** (success)
- Should have header: `Access-Control-Allow-Origin: http://localhost:5173`
- Should see response data with user info

## If Still Not Working

### Check 1: Backend is running on 8081
```bash
curl http://localhost:8081/health
# Should return: {"status":"UP"}
```

### Check 2: Identity endpoint exists
```bash
curl 'http://localhost:8081/identity?email=test@example.com'
# Should return user data (or create new user based on your API)
```

### Check 3: CORS configuration is loaded
- Restart backend after adding CORS config
- Don't just reload - fully stop and start

### Check 4: Check browser console
- Open DevTools Console tab
- Look for exact error message
- May contain more details about what's blocked

## Browser DevTools Steps

1. Open DevTools (F12)
2. Go to Network tab
3. Try login again
4. Click the failed "identity?..." request
5. Go to "Response Headers" tab
6. Look for: `access-control-allow-origin`
7. It should show: `http://localhost:5173`

## Common Mistakes

❌ Adding CORS to only one endpoint (need `/**` for all)
❌ Forgetting to restart backend after config change
❌ Wrong origin in CORS whitelist (should be `http://localhost:5173`, not port 8081)
❌ Cache issue - need hard reload
❌ Credentials header mismatch

## Summary

1. Add CorsConfig.java to your backend
2. Restart backend
3. Hard reload frontend (Ctrl+Shift+R)
4. Try login again

The CORS error should be gone! 🎉
