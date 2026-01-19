package com.uberbackend.controller;

import com.uberbackend.dto.request.CreateDriverRequest;
import com.uberbackend.dto.request.UpdateDriverLocationRequest;
import com.uberbackend.dto.response.DriverHistoryResponse;
import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.entity.Tenant;
import com.uberbackend.service.DriverService;
import com.uberbackend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/drivers")
@RequiredArgsConstructor
public class DriverController {

    private final DriverService driverService;
    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<Driver> registerDriver(@Valid @RequestBody CreateDriverRequest request) {

        Tenant tenant = tenantService.findById(request.getTenantId())
                .orElseThrow(() -> new RuntimeException("Tenant not found: " + request.getTenantId()));

        Driver driver = new Driver();
        driver.setTenantId(tenant.getId());
        driver.setName(tenant.getName());
        driver.setPhoneNumber(request.getPhoneNumber());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setVehicleModel(request.getVehicleModel());
        driver.setVehiclePlateNumber(request.getVehiclePlateNumber());

        Driver saved = driverService.createDriver(driver);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/{driverId}/location")
    public ResponseEntity<Void> updateLocation(@PathVariable Long driverId, @Valid @RequestBody UpdateDriverLocationRequest request) {

        driverService.updateDriverLocation(driverId, request);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @PostMapping("/{driverId}/accept")
    public ResponseEntity<Void> acceptRide(@PathVariable Long driverId, @RequestParam Long rideId) {

        driverService.acceptRide(driverId, rideId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{driverId}/setStatus")
    public ResponseEntity<Void> updateDriverStatus(@PathVariable Long driverId, @RequestParam String status) {

        driverService.updateDriverStatus(driverId, status);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{driverId}/detail")
    public ResponseEntity<DriverHistoryResponse> getDriverDetails(@PathVariable Long driverId) {
        DriverHistoryResponse response = driverService.getDriverDetail(driverId);
        return ResponseEntity.ok(response);
    }

}