package com.railway.booking.service;

import com.railway.booking.entity.Booking;
import com.railway.booking.entity.BookingPassenger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SeatAssignmentService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void assignSeats(Booking booking) {
        Long trainRunId = booking.getTrainRunId();
        String coachType = booking.getCoachType();
        Long fromStationId = booking.getFromStationId();
        Long toStationId = booking.getToStationId();

        Long trainId = jdbcTemplate.queryForObject(
                "SELECT train_id FROM train_runs WHERE id = ?",
                Long.class, trainRunId);

        List<Map<String, Object>> coaches = jdbcTemplate.queryForList(
                "SELECT id, coach_number, total_seats FROM coaches " +
                        "WHERE train_id = ? AND coach_type = ? ORDER BY sequence_in_train",
                trainId, coachType);

        if (coaches.isEmpty()) {
            log.warn("No coaches found for train {} coachType {}", trainId, coachType);
            return;
        }

        List<BookingPassenger> passengers = booking.getPassengers();
        int assigned = 0;

        for (Map<String, Object> coach : coaches) {
            if (assigned >= passengers.size()) break;

            Long coachId = ((Number) coach.get("id")).longValue();
            String coachNumber = (String) coach.get("coach_number");
            int totalSeats = ((Number) coach.get("total_seats")).intValue();

            int occupiedCount = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM seat_allocations " +
                            "WHERE train_run_id = ? AND coach_id = ? " +
                            "AND from_station_id = ? AND to_station_id = ? AND is_occupied = true",
                    Integer.class, trainRunId, coachId, fromStationId, toStationId);

            int availableInCoach = totalSeats - occupiedCount;
            if (availableInCoach <= 0) continue;

            List<Integer> occupiedSeats = jdbcTemplate.queryForList(
                    "SELECT CAST(seat_number AS INTEGER) FROM seat_allocations " +
                            "WHERE train_run_id = ? AND coach_id = ? " +
                            "AND from_station_id = ? AND to_station_id = ? AND is_occupied = true " +
                            "ORDER BY CAST(seat_number AS INTEGER)",
                    Integer.class, trainRunId, coachId, fromStationId, toStationId);

            int seatNum = 1;
            while (assigned < passengers.size() && seatNum <= totalSeats) {
                if (!occupiedSeats.contains(seatNum)) {
                    BookingPassenger p = passengers.get(assigned);
                    String seatNumber = String.valueOf(seatNum);

                    jdbcTemplate.update(
                            "INSERT INTO seat_allocations (train_run_id, coach_id, seat_number, " +
                                    "booking_passenger_id, from_station_id, to_station_id, is_occupied) " +
                                    "VALUES (?, ?, ?, ?, ?, ?, true)",
                            trainRunId, coachId, seatNumber, p.getId(), fromStationId, toStationId);

                    p.setSeatNumber(seatNumber);
                    p.setCoachNumber(coachNumber);
                    assigned++;
                }
                seatNum++;
            }
        }

        if (assigned < passengers.size()) {
            log.warn("Could not assign seats to all passengers for booking PNR={}. Assigned {}/{}",
                    booking.getPnr(), assigned, passengers.size());
        } else {
            log.info("Seats assigned for PNR={}: {} passengers", booking.getPnr(), assigned);
        }
    }
}
