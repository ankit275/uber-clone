package com.uberbackend.controller;

import com.uberbackend.dto.request.CreateRideRequest;
import com.uberbackend.dto.response.RideResponse;
import com.uberbackend.service.RideService;
import com.uberbackend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final TenantService tenantService;

    @PostMapping
    public ResponseEntity<RideResponse> createRide(@Valid @RequestBody CreateRideRequest request) {

        RideResponse response = rideService.createRide(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{rideId}")
    public ResponseEntity<RideResponse> getRide(@PathVariable Long rideId) {
        RideResponse response = rideService.getRide(rideId);
        return ResponseEntity.ok(response);
    }
}