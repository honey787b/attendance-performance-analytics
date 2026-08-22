require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const app = express();
app.use(cors());
app.use(express.json());

// ---------------------------------------------------------------
// DATABASE CONNECTION POOL — points at your PresenTrack database
// ---------------------------------------------------------------
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: +(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "PresenTrack",
  waitForConnections: true,
  connectionLimit: 10,
});

// ===============================================================
// AUTHENTICATION
// ===============================================================

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn("WARNING: JWT_SECRET is not set in .env");
}

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    const [users] = await pool.query(
      `SELECT id, name, email, password_hash, role, phone,
              two_factor_enabled
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    if (!users.length) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const user = users[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      {
        expiresIn: "2h"
      }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        two_factor_enabled: user.two_factor_enabled
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      error: "Server error during login"
    });
  }
});

// ===============================================================
// AUTH MIDDLEWARE
// ===============================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Authentication required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(403).json({
      error: "Invalid or expired token"
    });
  }
}

// ---------------------------------------------------------------
// SERVE THE FRONTEND (css/js/pages) STATICALLY
// ---------------------------------------------------------------
app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/pages", express.static(path.join(__dirname, "pages")));
app.use(express.static(path.join(__dirname)));

// Open login page first
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "pages",  "index.html"));
});

// =================================================================
// STUDENTS  —  students.html / attendance.html
// =================================================================
app.get("/api/students", async (req, res) => {
  try {
    const { branch, year, section, search } = req.query;
    let sql = "SELECT * FROM students WHERE 1=1";
    const params = [];

    if (branch) { sql += " AND branch = ?"; params.push(branch); }
    if (year) { sql += " AND year = ?"; params.push(year); }
    if (section) { sql += " AND section = ?"; params.push(section); }
    if (search) {
      sql += " AND (name LIKE ? OR roll_no LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }
    sql += " ORDER BY roll_no";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/students", async (req, res) => {
  try {
    const { roll_no, name, email, phone, branch, year, section } = req.body;
    const [result] = await pool.query(
      `INSERT INTO students (roll_no, name, email, phone, branch, year, section)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [roll_no, name, email, phone, branch, year, section]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/students/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM students WHERE id = ?",
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// FACULTY  —  faculty.html
// =================================================================
app.get("/api/faculty", async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let sql = `
      SELECT f.*,
        GROUP_CONCAT(DISTINCT s.name SEPARATOR ', ') AS subjects,
        COUNT(DISTINCT ca.id) AS class_count
      FROM faculty f
      LEFT JOIN subjects s ON s.faculty_id = f.id
      LEFT JOIN class_assignments ca ON ca.faculty_id = f.id
      WHERE 1=1
    `;
    const params = [];

    if (department) {
      sql += " AND f.department = ?";
      params.push(department);
    }

    if (status) {
      sql += " AND f.status = ?";
      params.push(status);
    }

    if (search) {
      sql += " AND (f.name LIKE ? OR f.faculty_code LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += " GROUP BY f.id ORDER BY f.name";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/faculty", async (req, res) => {
  try {
    const { faculty_code, name, email, department, designation } = req.body;
    const [result] = await pool.query(
      `INSERT INTO faculty (faculty_code, name, email, department, designation)
       VALUES (?, ?, ?, ?, ?)`,
      [faculty_code, name, email, department, designation]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// SUBJECTS
// =================================================================
app.get("/api/subjects", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM subjects ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// TIMETABLE  —  timetable.html
// =================================================================
app.get("/api/timetable", async (req, res) => {
  try {
    const { branch, year, section } = req.query;

    let sql = `
      SELECT t.*, s.name AS subject_name, f.name AS faculty_name
      FROM timetable t
      LEFT JOIN subjects s ON s.id = t.subject_id
      LEFT JOIN faculty f ON f.id = t.faculty_id
      WHERE 1=1
    `;

    const params = [];

    if (branch) {
      sql += " AND t.branch = ?";
      params.push(branch);
    }

    if (year) {
      sql += " AND t.year = ?";
      params.push(year);
    }

    if (section) {
      sql += " AND t.section = ?";
      params.push(section);
    }

    sql += " ORDER BY FIELD(t.day_name,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.start_time";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/timetable", async (req, res) => {
  try {
    const {
      day_name,
      start_time,
      end_time,
      subject_id,
      faculty_id,
      branch,
      year,
      section,
      room
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO timetable
       (day_name, start_time, end_time, subject_id, faculty_id, branch, year, section, room)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        day_name,
        start_time,
        end_time,
        subject_id,
        faculty_id,
        branch,
        year,
        section,
        room
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// ATTENDANCE SESSIONS  —  attendance-sessions.html
// =================================================================
app.get("/api/attendance/sessions", async (req, res) => {
  try {
    const { date, branch, year, section } = req.query;

    let sql = "SELECT * FROM attendance_sessions WHERE 1=1";
    const params = [];

    if (date) {
      sql += " AND session_date = ?";
      params.push(date);
    }

    if (branch) {
      sql += " AND branch = ?";
      params.push(branch);
    }

    if (year) {
      sql += " AND year = ?";
      params.push(year);
    }

    if (section) {
      sql += " AND section = ?";
      params.push(section);
    }

    sql += " ORDER BY session_date DESC, id DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/attendance/sessions", async (req, res) => {
  try {
    const {
      session_date,
      branch,
      year,
      section,
      subject_id,
      faculty_id
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO attendance_sessions
       (session_date, branch, year, section, subject_id, faculty_id, status)
       VALUES (?, ?, ?, ?, ?, ?, 'Active')`,
      [
        session_date,
        branch,
        year,
        section,
        subject_id || null,
        faculty_id || null
      ]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// ATTENDANCE RECORDS  —  attendance.html present/absent/late marking
// =================================================================
app.get("/api/attendance/records", async (req, res) => {
  try {
    const { session_id } = req.query;

    if (!session_id) {
      return res.status(400).json({
        error: "session_id is required"
      });
    }

    const [rows] = await pool.query(
      `SELECT s.id AS student_id, s.name, s.roll_no, s.branch, s.year, s.attendance_percent,
              COALESCE(ar.status, 'not-marked') AS status
       FROM students s
       LEFT JOIN attendance_records ar
         ON ar.student_id = s.id AND ar.session_id = ?
       WHERE s.branch = (SELECT branch FROM attendance_sessions WHERE id = ?)
         AND s.year = (SELECT year FROM attendance_sessions WHERE id = ?)
         AND s.section = (SELECT section FROM attendance_sessions WHERE id = ?)
       ORDER BY s.roll_no`,
      [session_id, session_id, session_id, session_id]
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark or update one student's status for a session
app.post("/api/attendance/records", async (req, res) => {
  try {
    const { session_id, student_id, status } = req.body;

    await pool.query(
      `INSERT INTO attendance_records (session_id, student_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       marked_at = CURRENT_TIMESTAMP`,
      [session_id, student_id, status]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk mark (e.g. "Mark All Present")
app.post("/api/attendance/records/bulk", async (req, res) => {
  try {
    const { session_id, student_ids, status } = req.body;
    const values = student_ids.map((sid) => [session_id, sid, status]);

    await pool.query(
      `INSERT INTO attendance_records
       (session_id, student_id, status)
       VALUES ?
       ON DUPLICATE KEY UPDATE
       status = VALUES(status),
       marked_at = CURRENT_TIMESTAMP`,
      [values]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// ATTENDANCE RULES  —  attendance-rules.html (single-row config)
// =================================================================
app.get("/api/attendance/rules", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM attendance_rules ORDER BY id DESC LIMIT 1"
    );

    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/attendance/rules", async (req, res) => {
  try {
    const {
      excellent,
      good,
      warning,
      critical,
      minimumAttendance,
      lateLimit
    } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM attendance_rules ORDER BY id DESC LIMIT 1"
    );

    if (existing.length) {
      await pool.query(
        `UPDATE attendance_rules
         SET excellent_threshold=?,
             good_threshold=?,
             warning_threshold=?,
             critical_threshold=?,
             minimum_attendance=?,
             late_limit=?
         WHERE id=?`,
        [
          excellent,
          good,
          warning,
          critical,
          minimumAttendance,
          lateLimit,
          existing[0].id
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO attendance_rules
         (excellent_threshold, good_threshold, warning_threshold,
          critical_threshold, minimum_attendance, late_limit)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          excellent,
          good,
          warning,
          critical,
          minimumAttendance,
          lateLimit
        ]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// INTERNAL MARKS  —  performance.html
// =================================================================
app.get("/api/marks", async (req, res) => {
  try {
    const { student_id, subject_id, semester } = req.query;

    let sql = `
      SELECT im.*, sub.name AS subject_name, s.name AS student_name
      FROM internal_marks im
      JOIN subjects sub ON sub.id = im.subject_id
      JOIN students s ON s.id = im.student_id
      WHERE 1=1
    `;

    const params = [];

    if (student_id) {
      sql += " AND im.student_id = ?";
      params.push(student_id);
    }

    if (subject_id) {
      sql += " AND im.subject_id = ?";
      params.push(subject_id);
    }

    if (semester) {
      sql += " AND im.semester = ?";
      params.push(semester);
    }

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/marks", async (req, res) => {
  try {
    const {
      student_id,
      subject_id,
      semester,
      quiz,
      assignment,
      mid1,
      mid2,
      semester_exam,
      max_marks
    } = req.body;

    await pool.query(
      `INSERT INTO internal_marks
       (student_id, subject_id, semester, quiz, assignment, mid1, mid2, semester_exam, max_marks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
       quiz=VALUES(quiz),
       assignment=VALUES(assignment),
       mid1=VALUES(mid1),
       mid2=VALUES(mid2),
       semester_exam=VALUES(semester_exam),
       max_marks=VALUES(max_marks)`,
      [
        student_id,
        subject_id,
        semester || 1,
        quiz || 0,
        assignment || 0,
        mid1 || 0,
        mid2 || 0,
        semester_exam || 0,
        max_marks || 100
      ]
    );

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// AT-RISK STUDENTS  —  at-risk.html (computed, no dedicated table)
// =================================================================
app.get("/api/at-risk", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.roll_no, s.name, s.branch, s.attendance_percent, s.gpa,
        CASE
          WHEN s.attendance_percent < r.critical_threshold AND s.gpa < 2.5 THEN 'both'
          WHEN s.attendance_percent < r.warning_threshold THEN 'attendance'
          WHEN s.gpa < 2.5 THEN 'gpa'
        END AS risk_type
      FROM students s,
           (SELECT * FROM attendance_rules ORDER BY id DESC LIMIT 1) r
      WHERE s.attendance_percent < r.warning_threshold OR s.gpa < 2.5
      ORDER BY s.attendance_percent ASC
    `);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// HOLIDAYS  —  holidays.html
// =================================================================
app.get("/api/holidays", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM holidays ORDER BY holiday_date"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/holidays", async (req, res) => {
  try {
    const {
      holiday_date,
      name,
      type,
      icon,
      description
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO holidays
       (holiday_date, name, type, icon, description)
       VALUES (?, ?, ?, ?, ?)`,
      [holiday_date, name, type, icon, description]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// REPORTS  —  reports.html
// =================================================================
app.get("/api/reports", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM reports ORDER BY generated_date DESC"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/reports", async (req, res) => {
  try {
    const {
      report_name,
      type,
      period,
      generated_by
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO reports
       (report_name, type, period, generated_by, status)
       VALUES (?, ?, ?, ?, 'Ready')`,
      [report_name, type, period, generated_by || null]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// INSTITUTION SETTINGS  —  settings.html (single-row config)
// =================================================================
app.get("/api/settings", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM institution_settings ORDER BY id DESC LIMIT 1"
    );

    res.json(rows[0] || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/settings", async (req, res) => {
  try {
    const {
      academic_year,
      current_semester,
      default_department,
      attendance_alerts_enabled,
      attendance_notifications_enabled,
      performance_alerts_enabled,
      report_notifications_enabled,
    } = req.body;

    const [existing] = await pool.query(
      "SELECT id FROM institution_settings ORDER BY id DESC LIMIT 1"
    );

    if (existing.length) {
      await pool.query(
        `UPDATE institution_settings
         SET academic_year=?,
             current_semester=?,
             default_department=?,
             attendance_alerts_enabled=?,
             attendance_notifications_enabled=?,
             performance_alerts_enabled=?,
             report_notifications_enabled=?
         WHERE id=?`,
        [
          academic_year,
          current_semester,
          default_department,
          attendance_alerts_enabled,
          attendance_notifications_enabled,
          performance_alerts_enabled,
          report_notifications_enabled,
          existing[0].id
        ]
      );
    } else {
      await pool.query(
        `INSERT INTO institution_settings
         (academic_year, current_semester, default_department,
          attendance_alerts_enabled,
          attendance_notifications_enabled,
          performance_alerts_enabled,
          report_notifications_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          academic_year,
          current_semester,
          default_department,
          attendance_alerts_enabled,
          attendance_notifications_enabled,
          performance_alerts_enabled,
          report_notifications_enabled
        ]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================================
// DASHBOARD STATS  —  dashboard.html summary numbers
// =================================================================
app.get("/api/dashboard/stats", async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query(
      "SELECT COUNT(*) AS totalStudents FROM students"
    );

    const [[{ totalFaculty }]] = await pool.query(
      "SELECT COUNT(*) AS totalFaculty FROM faculty"
    );

    const [[{ avgAttendance }]] = await pool.query(
      "SELECT ROUND(AVG(attendance_percent),2) AS avgAttendance FROM students"
    );

    const [[{ atRiskCount }]] = await pool.query(`
      SELECT COUNT(*) AS atRiskCount
      FROM students s,
           (SELECT * FROM attendance_rules ORDER BY id DESC LIMIT 1) r
      WHERE s.attendance_percent < r.warning_threshold
         OR s.gpa < 2.5
    `);

    res.json({
      totalStudents,
      totalFaculty,
      avgAttendance,
      atRiskCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`PresenTrack server running: http://localhost:${PORT}`);
});

