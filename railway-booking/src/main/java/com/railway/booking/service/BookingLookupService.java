package com.railway.booking.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingLookupService {

    private final JdbcTemplate jdbcTemplate;

    public record TrainInfo(String trainName, String trainNumber, String trainType) {}
    public record StationInfo(String name, String code) {}

    public TrainInfo getTrainInfoByRunId(Long trainRunId) {
        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                    "SELECT t.name, t.train_number, t.train_type " +
                            "FROM trains t JOIN train_runs tr ON tr.train_id = t.id " +
                            "WHERE tr.id = ?",
                    trainRunId);
            return new TrainInfo(
                    (String) row.get("name"),
                    (String) row.get("train_number"),
                    (String) row.get("train_type"));
        } catch (Exception e) {
            log.warn("Could not resolve train info for trainRunId={}: {}", trainRunId, e.getMessage());
            return null;
        }
    }

    public StationInfo getStationInfo(Long stationId) {
        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                    "SELECT name, code FROM stations WHERE id = ?", stationId);
            return new StationInfo((String) row.get("name"), (String) row.get("code"));
        } catch (Exception e) {
            log.warn("Could not resolve station info for stationId={}: {}", stationId, e.getMessage());
            return null;
        }
    }
}
