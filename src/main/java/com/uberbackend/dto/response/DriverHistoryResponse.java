package com.uberbackend.dto.response;

import com.uberbackend.model.entity.Driver;
import com.uberbackend.model.entity.Ride;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverHistoryResponse {
    private DriverSummaryResponse driver;
    private List<RideResponse> rides;

    public static DriverHistoryResponse from(Driver driver, List<Ride> history) {
        return DriverHistoryResponse.builder()
            .driver(DriverSummaryResponse.from(driver))
            .rides(history.stream().map(RideResponse::from).collect(Collectors.toList()))
            .build();
    }
}
