USE PresenTrack;

-- ---------------------------------------------------------------------
-- SEED DATA — matches the mock data originally hardcoded in the
-- frontend JS files, so the live pages look the same as before.
-- ---------------------------------------------------------------------

INSERT INTO faculty (faculty_code, name, email, department, designation, status) VALUES
('FAC-001', 'Dr. Ramesh Kumar', 'ramesh.kumar@presentrack.edu', 'CSE', 'Professor', 'Active'),
('FAC-002', 'Dr. Lakshmi Nair', 'lakshmi.nair@presentrack.edu', 'ECE', 'Associate Professor', 'Active'),
('FAC-003', 'Prof. Suresh Babu', 'suresh.babu@presentrack.edu', 'EEE', 'Assistant Professor', 'Active');

INSERT INTO subjects (code, name, department, credits, faculty_id) VALUES
('CS301', 'Data Structures', 'CSE', 4, 1),
('CS302', 'Database Systems', 'CSE', 4, 1),
('EC301', 'Digital Electronics', 'ECE', 3, 2),
('EE301', 'Circuit Theory', 'EEE', 3, 3);

INSERT INTO students (roll_no, name, email, branch, year, section, attendance_percent, performance_percent, gpa, status) VALUES
('CSE001', 'Arjun Reddy', 'arjun.reddy@presentrack.edu', 'CSE', 1, 'A', 96, 88, 8.8, 'Active'),
('CSE002', 'Sneha Rani', 'sneha.rani@presentrack.edu', 'CSE', 1, 'A', 91, 84, 8.4, 'Active'),
('CSE003', 'Rahul Kumar', 'rahul.kumar@presentrack.edu', 'CSE', 2, 'A', 86, 79, 7.9, 'Active'),
('ECE001', 'Meghana Priya', 'meghana.priya@presentrack.edu', 'ECE', 2, 'B', 78, 75, 7.5, 'Active'),
('ECE002', 'Sanjay Rao', 'sanjay.rao@presentrack.edu', 'ECE', 3, 'A', 93, 90, 9.0, 'Active'),
('EEE001', 'Kavya Sri', 'kavya.sri@presentrack.edu', 'EEE', 1, 'A', 88, 82, 8.2, 'Active'),
('CSE004', 'Vishal Kumar', 'vishal.kumar@presentrack.edu', 'CSE', 3, 'B', 97, 92, 9.2, 'Active'),
('ECE003', 'Priya Sharma', 'priya.sharma@presentrack.edu', 'ECE', 4, 'A', 82, 76, 7.6, 'Active'),
('EEE002', 'Nikhil Varma', 'nikhil.varma@presentrack.edu', 'EEE', 2, 'A', 74, 60, 2.1, 'Active'),
('CSE005', 'Anjali Devi', 'anjali.devi@presentrack.edu', 'CSE', 4, 'A', 95, 91, 9.1, 'Active'),
('CSE006', 'Alex Johnson', 'alex.johnson@presentrack.edu', 'CSE', 2, 'B', 62, 55, 2.1, 'Active'),
('ECE004', 'Ananya Roy', 'ananya.roy@presentrack.edu', 'ECE', 1, 'A', 58, 50, 1.9, 'Active'),
('MECH001', 'Rohan Mehta', 'rohan.mehta@presentrack.edu', 'MECH', 3, 'A', 85, 60, 2.2, 'Active');

INSERT INTO attendance_rules (excellent_threshold, good_threshold, warning_threshold, critical_threshold, minimum_attendance, late_limit)
VALUES (90, 80, 75, 65, 75, 3);

INSERT INTO holidays (holiday_date, name, type, icon, description) VALUES
('2026-08-15', 'Independence Day', 'public', '🇮🇳', 'Independence Day is a national public holiday in India.'),
('2026-08-28', 'College Foundation Day', 'college', '🎓', 'College Foundation Day is declared as a holiday by the college administration.'),
('2026-09-05', 'Teachers Day', 'college', '👨‍🏫', 'Special college holiday for Teachers Day celebrations.'),
('2026-10-02', 'Gandhi Jayanti', 'public', '🇮🇳', 'Gandhi Jayanti is observed as a national public holiday.'),
('2026-10-20', 'Dussehra', 'public', '🪔', 'Dussehra is observed as a public holiday.'),
('2026-11-08', 'Diwali', 'public', '🪔', 'Diwali is celebrated as a public holiday.'),
('2026-12-25', 'Christmas', 'public', '🎄', 'Christmas is observed as a public holiday.');

INSERT INTO institution_settings (academic_year, current_semester, default_department)
VALUES ('2026-2027', 1, 'CSE');
