package com.uberbackend.controller;

import com.uberbackend.dto.request.CreateRideRequest;
import com.uberbackend.dto.response.RideResponse;
import com.uberbackend.model.enums.RideStatus;
import com.uberbackend.service.RideService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(RideController.class)
class RideControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RideService rideService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testCreateRide() throws Exception {
        // Arrange
        CreateRideRequest request = new CreateRideRequest();
        request.setPassengerId(101L);
        request.setPickupLatitude(new BigDecimal("40.7128"));
        request.setPickupLongitude(new BigDecimal("-74.0060"));

        RideResponse response = RideResponse.builder()
            .id(1L)
            .passengerId(101L)
            .status(RideStatus.PENDING)
            .pickupLatitude(new BigDecimal("40.7128"))
            .pickupLongitude(new BigDecimal("-74.0060"))
            .build();

        when(rideService.createRide(any(CreateRideRequest.class))).thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/rides")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.passengerId").value(101L));
    }

    @Test
    void testGetRide() throws Exception {
        // Arrange
        Long rideId = 1L;
        RideResponse response = RideResponse.builder()
            .id(rideId)
            .passengerId(101L)
            .status(RideStatus.ASSIGNED)
            .build();

        when(rideService.getRide(rideId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/rides/" + rideId))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(rideId))
            .andExpect(jsonPath("$.passengerId").value(101L));
    }
}