package com.uberbackend.controller;

import com.uberbackend.dto.request.CreateTenantRequest;
import com.uberbackend.dto.response.RideResponse;
import com.uberbackend.model.entity.Tenant;
import com.uberbackend.service.HistoryService;
import com.uberbackend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;
    private final HistoryService historyService;

    @PostMapping
    public ResponseEntity<Tenant> registerTenant(@Valid @RequestBody CreateTenantRequest request) {
        Tenant tenant = new Tenant();
        tenant.setName(request.getName());
        tenant.setContactEmail(request.getContactEmail());
        Tenant saved = tenantService.registerTenant(tenant);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{tenantId}/history")
    public ResponseEntity<List<RideResponse>> getTenantHistory(@PathVariable Long tenantId) {
        List<RideResponse> history = historyService.getTenantRideHistory(tenantId);
        return ResponseEntity.ok(history);
    }
}
