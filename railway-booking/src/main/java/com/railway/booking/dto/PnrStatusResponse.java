package com.railway.booking.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PnrStatusResponse(
        String pnr,
        String bookingStatus,
        String trainName,
        String trainNumber,
        String coachType,
        String fromStation,
        String fromStationCode,
        String toStation,
        String toStationCode,
        List<PassengerStatus> passengers
) {
    public record PassengerStatus(
            String name,
            int age,
            String status,
            String seatNumber,
            String coachNumber,
            Integer waitlistNumber,
            Integer racNumber
    ) {
    }
}
