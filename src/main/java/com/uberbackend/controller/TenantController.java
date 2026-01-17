package com.uberbackend.controller;

import com.uberbackend.dto.request.CreateTenantRequest;
import com.uberbackend.model.entity.Tenant;
import com.uberbackend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<Tenant> registerTenant(@Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setContactEmail(request.getContactEmail());
        Tenant saved = tenantService.registerTenant(tenant);
        return ResponseEntity.ok(saved);
    }
}
