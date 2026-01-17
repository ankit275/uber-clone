package com.uberbackend.controller;

import com.uberbackend.model.entity.Trip;
import com.uberbackend.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping("/{rideId}/start")
    public ResponseEntity<Trip> startTrip(@PathVariable Long rideId) {
        Trip res = tripService.startTrip(rideId);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/{tripId}/end")
    public ResponseEntity<Void> endTrip(@PathVariable Long tripId) {
        tripService.endTrip(tripId);
        return ResponseEntity.ok().build();
    }
}