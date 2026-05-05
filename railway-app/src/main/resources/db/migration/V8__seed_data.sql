-- =============================================
-- Seed Data for Railway Booking System
-- =============================================

-- 0. Admin User (test@test.com / testadmin)
INSERT INTO users (id, email, password_hash, full_name, role, email_verified) VALUES
(1, 'test@test.com', '$2a$10$TqVc29id0JpdZOlpDbttf.NFPDO/RwnAcPvJXW8rXs/v.1TE5Oj1W', 'Test Admin', 'ADMIN', TRUE)
ON CONFLICT (id) DO NOTHING;

SELECT setval('users_id_seq', GREATEST((SELECT MAX(id) FROM users), 1));

-- 1. Stations
INSERT INTO stations (id, code, name, city, state, zone) VALUES
(1, 'NDLS', 'New Delhi', 'New Delhi', 'Delhi', 'NR'),
(2, 'BCT', 'Mumbai Central', 'Mumbai', 'Maharashtra', 'WR'),
(3, 'MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu', 'SR'),
(4, 'HWH', 'Howrah Junction', 'Kolkata', 'West Bengal', 'ER'),
(5, 'SBC', 'Bangalore City', 'Bangalore', 'Karnataka', 'SWR'),
(6, 'JP', 'Jaipur Junction', 'Jaipur', 'Rajasthan', 'NWR'),
(7, 'BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh', 'WCR'),
(8, 'NGP', 'Nagpur Junction', 'Nagpur', 'Maharashtra', 'CR'),
(9, 'ALD', 'Prayagraj Junction', 'Prayagraj', 'Uttar Pradesh', 'NCR'),
(10, 'CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh', 'NCR')
ON CONFLICT (id) DO NOTHING;

SELECT setval('stations_id_seq', GREATEST((SELECT MAX(id) FROM stations), 10));

-- 2. Trains
INSERT INTO trains (id, train_number, name, train_type, source_station_id, dest_station_id) VALUES
(1, '12301', 'Howrah Rajdhani Express', 'RAJDHANI', 1, 4),
(2, '12951', 'Mumbai Rajdhani Express', 'RAJDHANI', 1, 2),
(3, '12657', 'Chennai Mail', 'SUPERFAST', 5, 3)
ON CONFLICT (id) DO NOTHING;

SELECT setval('trains_id_seq', GREATEST((SELECT MAX(id) FROM trains), 3));

-- 3. Coaches
-- Train 1: Howrah Rajdhani (NDLS → HWH)
INSERT INTO coaches (id, train_id, coach_number, coach_type, total_seats, total_berths, sequence_in_train) VALUES
(1,  1, 'H1',  'FIRST_AC',  24, 24, 1),
(2,  1, 'A1',  'SECOND_AC', 48, 48, 2),
(3,  1, 'A2',  'SECOND_AC', 48, 48, 3),
(4,  1, 'B1',  'THIRD_AC',  64, 64, 4),
(5,  1, 'B2',  'THIRD_AC',  64, 64, 5),
(6,  1, 'B3',  'THIRD_AC',  64, 64, 6),
(7,  1, 'S1',  'SLEEPER',   72, 72, 7),
(8,  1, 'S2',  'SLEEPER',   72, 72, 8),
-- Train 2: Mumbai Rajdhani (NDLS → BCT)
(9,  2, 'H1',  'FIRST_AC',  24, 24, 1),
(10, 2, 'A1',  'SECOND_AC', 48, 48, 2),
(11, 2, 'A2',  'SECOND_AC', 48, 48, 3),
(12, 2, 'B1',  'THIRD_AC',  64, 64, 4),
(13, 2, 'B2',  'THIRD_AC',  64, 64, 5),
(14, 2, 'B3',  'THIRD_AC',  64, 64, 6),
(15, 2, 'S1',  'SLEEPER',   72, 72, 7),
(16, 2, 'S2',  'SLEEPER',   72, 72, 8),
-- Train 3: Chennai Mail (SBC → MAS)
(17, 3, 'H1',  'FIRST_AC',  24, 24, 1),
(18, 3, 'A1',  'SECOND_AC', 48, 48, 2),
(19, 3, 'A2',  'SECOND_AC', 48, 48, 3),
(20, 3, 'B1',  'THIRD_AC',  64, 64, 4),
(21, 3, 'B2',  'THIRD_AC',  64, 64, 5),
(22, 3, 'S1',  'SLEEPER',   72, 72, 6),
(23, 3, 'S2',  'SLEEPER',   72, 72, 7)
ON CONFLICT (id) DO NOTHING;

SELECT setval('coaches_id_seq', GREATEST((SELECT MAX(id) FROM coaches), 23));

-- 4. Routes
INSERT INTO routes (id, train_id, route_name) VALUES
(1, 1, 'New Delhi - Howrah via Kanpur, Prayagraj'),
(2, 2, 'New Delhi - Mumbai Central via Jaipur, Bhopal'),
(3, 3, 'Bangalore City - Chennai Central')
ON CONFLICT (id) DO NOTHING;

SELECT setval('routes_id_seq', GREATEST((SELECT MAX(id) FROM routes), 3));

-- 5. Route Stations
-- Route 1: NDLS → CNB → ALD → HWH
INSERT INTO route_stations (id, route_id, station_id, sequence_number, arrival_time, departure_time, halt_minutes, distance_from_origin_km, day_offset) VALUES
(1,  1, 1,  1, NULL,    '16:55', 0,   0,    0),
(2,  1, 10, 2, '21:30', '21:35', 5,   440,  0),
(3,  1, 9,  3, '23:45', '23:50', 5,   634,  0),
(4,  1, 4,  4, '09:55', NULL,    0,   1451, 1),
-- Route 2: NDLS → JP → BPL → BCT
(5,  2, 1, 1, NULL,    '16:35', 0,   0,    0),
(6,  2, 6, 2, '21:10', '21:15', 5,   308,  0),
(7,  2, 7, 3, '04:30', '04:35', 5,   700,  1),
(8,  2, 2, 4, '08:35', NULL,    0,   1384, 1),
-- Route 3: SBC → MAS
(9,  3, 5, 1, NULL,    '22:30', 0,   0,   0),
(10, 3, 3, 2, '05:00', NULL,    0,   362, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval('route_stations_id_seq', GREATEST((SELECT MAX(id) FROM route_stations), 10));

-- 6. Schedules (all trains run daily)
INSERT INTO schedules (id, train_id, route_id, runs_on_monday, runs_on_tuesday, runs_on_wednesday, runs_on_thursday, runs_on_friday, runs_on_saturday, runs_on_sunday, effective_from, effective_until) VALUES
(1, 1, 1, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '2026-01-01', NULL),
(2, 2, 2, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '2026-01-01', NULL),
(3, 3, 3, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, '2026-01-01', NULL)
ON CONFLICT (id) DO NOTHING;

SELECT setval('schedules_id_seq', GREATEST((SELECT MAX(id) FROM schedules), 3));

-- 7. Train Runs (7 days: 2026-05-06 to 2026-05-12)
INSERT INTO train_runs (id, schedule_id, train_id, route_id, run_date, status) VALUES
-- Train 1: Howrah Rajdhani
(1,  1, 1, 1, '2026-05-06', 'SCHEDULED'),
(2,  1, 1, 1, '2026-05-07', 'SCHEDULED'),
(3,  1, 1, 1, '2026-05-08', 'SCHEDULED'),
(4,  1, 1, 1, '2026-05-09', 'SCHEDULED'),
(5,  1, 1, 1, '2026-05-10', 'SCHEDULED'),
(6,  1, 1, 1, '2026-05-11', 'SCHEDULED'),
(7,  1, 1, 1, '2026-05-12', 'SCHEDULED'),
-- Train 2: Mumbai Rajdhani
(8,  2, 2, 2, '2026-05-06', 'SCHEDULED'),
(9,  2, 2, 2, '2026-05-07', 'SCHEDULED'),
(10, 2, 2, 2, '2026-05-08', 'SCHEDULED'),
(11, 2, 2, 2, '2026-05-09', 'SCHEDULED'),
(12, 2, 2, 2, '2026-05-10', 'SCHEDULED'),
(13, 2, 2, 2, '2026-05-11', 'SCHEDULED'),
(14, 2, 2, 2, '2026-05-12', 'SCHEDULED'),
-- Train 3: Chennai Mail
(15, 3, 3, 3, '2026-05-06', 'SCHEDULED'),
(16, 3, 3, 3, '2026-05-07', 'SCHEDULED'),
(17, 3, 3, 3, '2026-05-08', 'SCHEDULED'),
(18, 3, 3, 3, '2026-05-09', 'SCHEDULED'),
(19, 3, 3, 3, '2026-05-10', 'SCHEDULED'),
(20, 3, 3, 3, '2026-05-11', 'SCHEDULED'),
(21, 3, 3, 3, '2026-05-12', 'SCHEDULED')
ON CONFLICT (id) DO NOTHING;

SELECT setval('train_runs_id_seq', GREATEST((SELECT MAX(id) FROM train_runs), 21));

-- 8. Seat Inventory (per train_run, per coach_type, for end-to-end segment)
-- Train 1 runs (IDs 1-7): NDLS(1) → HWH(4)
INSERT INTO seat_inventory (train_run_id, coach_type, from_station_id, to_station_id, total_seats, available_seats, rac_seats, waitlist_count, version)
SELECT tr.id, ct.coach_type, 1, 4, ct.total_seats, ct.total_seats, 0, 0, 0
FROM train_runs tr
CROSS JOIN (
    VALUES ('FIRST_AC', 24), ('SECOND_AC', 96), ('THIRD_AC', 192), ('SLEEPER', 144)
) AS ct(coach_type, total_seats)
WHERE tr.id BETWEEN 1 AND 7
ON CONFLICT (train_run_id, coach_type, from_station_id, to_station_id) DO NOTHING;

-- Train 2 runs (IDs 8-14): NDLS(1) → BCT(2)
INSERT INTO seat_inventory (train_run_id, coach_type, from_station_id, to_station_id, total_seats, available_seats, rac_seats, waitlist_count, version)
SELECT tr.id, ct.coach_type, 1, 2, ct.total_seats, ct.total_seats, 0, 0, 0
FROM train_runs tr
CROSS JOIN (
    VALUES ('FIRST_AC', 24), ('SECOND_AC', 96), ('THIRD_AC', 192), ('SLEEPER', 144)
) AS ct(coach_type, total_seats)
WHERE tr.id BETWEEN 8 AND 14
ON CONFLICT (train_run_id, coach_type, from_station_id, to_station_id) DO NOTHING;

-- Train 3 runs (IDs 15-21): SBC(5) → MAS(3)
INSERT INTO seat_inventory (train_run_id, coach_type, from_station_id, to_station_id, total_seats, available_seats, rac_seats, waitlist_count, version)
SELECT tr.id, ct.coach_type, 5, 3, ct.total_seats, ct.total_seats, 0, 0, 0
FROM train_runs tr
CROSS JOIN (
    VALUES ('FIRST_AC', 24), ('SECOND_AC', 96), ('THIRD_AC', 192), ('SLEEPER', 144)
) AS ct(coach_type, total_seats)
WHERE tr.id BETWEEN 15 AND 21
ON CONFLICT (train_run_id, coach_type, from_station_id, to_station_id) DO NOTHING;
