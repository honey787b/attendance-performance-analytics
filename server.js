require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(
    "/exports",
    express.static(
        path.join(__dirname, "exports")
    )
);

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
// ===============================================================
// EDIT LOGGED-IN USER PROFILE
// ===============================================================

app.put("/api/auth/profile", authenticateToken, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        error: "Name and email are required"
      });
    }

    // Check whether another user already has this email
    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE email = ? AND id != ? LIMIT 1",
      [email, req.user.id]
    );

    if (existingUsers.length) {
      return res.status(409).json({
        error: "Email is already being used by another account"
      });
    }

    await pool.query(
      `UPDATE users
       SET name = ?,
           email = ?,
           phone = ?
       WHERE id = ?`,
      [
        name.trim(),
        email.trim(),
        phone ? phone.trim() : null,
        req.user.id
      ]
    );

    // Get the updated user
    const [users] = await pool.query(
      `SELECT id, name, email, role, phone, two_factor_enabled
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    res.json({
      message: "Profile updated successfully",
      user: users[0]
    });

  } catch (err) {
    console.error("Profile update error:", err);

    res.status(500).json({
      error: "Failed to update profile"
    });
  }
});

// ===============================================================
// CHANGE LOGGED-IN USER PASSWORD
// ===============================================================

app.put("/api/auth/change-password", authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: "New password must be at least 6 characters long"
      });
    }

    // Get the logged-in user's current password hash
    const [users] = await pool.query(
      `SELECT password_hash
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [req.user.id]
    );

    if (!users.length) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    // Verify the current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      users[0].password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        error: "Current password is incorrect"
      });
    }

    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update the password in MySQL
    await pool.query(
      `UPDATE users
       SET password_hash = ?
       WHERE id = ?`,
      [newPasswordHash, req.user.id]
    );

    res.json({
      message: "Password changed successfully"
    });

  } catch (err) {
    console.error("Change password error:", err);

    res.status(500).json({
      error: "Failed to change password"
    });
  }
});

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
// TIMETABLE
// =================================================================

app.get("/api/timetable", async (req, res) => {
  try {
    const {
      branch,
      year,
      section,
      day
    } = req.query;

    let sql = `
      SELECT
        t.id,
        t.day_name,
        t.start_time,
        t.end_time,
        t.subject_id,
        t.faculty_id,
        t.branch,
        t.year,
        t.section,
        t.room,

        s.name AS subject_name,

        f.name AS faculty_name

      FROM timetable t

      LEFT JOIN subjects s
        ON s.id = t.subject_id

      LEFT JOIN faculty f
        ON f.id = t.faculty_id

      WHERE 1=1
    `;

    const params = [];

    // -------------------------------------------------------------
    // FILTERS
    // -------------------------------------------------------------

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

    if (day) {
      sql += " AND t.day_name = ?";
      params.push(day);
    }

    // -------------------------------------------------------------
    // ORDER
    // -------------------------------------------------------------

    sql += `
      ORDER BY
        FIELD(
          t.day_name,
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ),
        t.start_time
    `;

    // -------------------------------------------------------------
    // EXECUTE
    // -------------------------------------------------------------

    const [rows] = await pool.query(sql, params);

    res.json(rows);

  } catch (err) {

    console.error("Get timetable error:", err);

    res.status(500).json({
      error: err.message
    });

  }
});
// =================================================================
// ADD TIMETABLE CLASS
// =================================================================

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

    // -------------------------------------------------------------
    // VALIDATION
    // -------------------------------------------------------------

    if (
      !day_name ||
      !start_time ||
      !end_time ||
      !branch ||
      !year ||
      !section
    ) {
      return res.status(400).json({
        error: "Missing required timetable fields."
      });
    }

    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];

    if (!validDays.includes(day_name)) {
      return res.status(400).json({
        error: "Invalid day."
      });
    }

    // -------------------------------------------------------------
    // CHECK SUBJECT
    // -------------------------------------------------------------

    if (
      subject_id !== null &&
      subject_id !== undefined &&
      subject_id !== ""
    ) {
      const [subjects] = await pool.query(
        "SELECT id FROM subjects WHERE id = ?",
        [subject_id]
      );

      if (subjects.length === 0) {
        return res.status(400).json({
          error: "Invalid subject ID."
        });
      }
    }

    // -------------------------------------------------------------
    // CHECK FACULTY
    // -------------------------------------------------------------

    if (
      faculty_id !== null &&
      faculty_id !== undefined &&
      faculty_id !== ""
    ) {
      const [faculty] = await pool.query(
        "SELECT id FROM faculty WHERE id = ?",
        [faculty_id]
      );

      if (faculty.length === 0) {
        return res.status(400).json({
          error: "Invalid faculty ID."
        });
      }
    }

    // -------------------------------------------------------------
    // CHECK TIME
    // -------------------------------------------------------------

    if (start_time >= end_time) {
      return res.status(400).json({
        error: "End time must be later than start time."
      });
    }

    // -------------------------------------------------------------
    // CHECK DUPLICATE SLOT
    // -------------------------------------------------------------

    const [existing] = await pool.query(
      `
      SELECT id
      FROM timetable
      WHERE day_name = ?
        AND branch = ?
        AND year = ?
        AND section = ?
        AND start_time = ?
        AND end_time = ?
      `,
      [
        day_name,
        branch,
        year,
        section,
        start_time,
        end_time
      ]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        error: "A class already exists in this time slot."
      });
    }

    // -------------------------------------------------------------
    // INSERT INTO TIMETABLE
    // -------------------------------------------------------------

    const [result] = await pool.query(
      `
      INSERT INTO timetable
      (
        day_name,
        start_time,
        end_time,
        subject_id,
        faculty_id,
        branch,
        year,
        section,
        room
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        day_name,
        start_time,
        end_time,
        subject_id || null,
        faculty_id || null,
        branch,
        year,
        section,
        room || null
      ]
    );

    // -------------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------------

    res.status(201).json({
      message: "Class added successfully.",
      id: result.insertId
    });

  } catch (err) {

    console.error("Add timetable error:", err);

    res.status(500).json({
      error: err.message
    });
  }
});
// =================================================================
// ATTENDANCE SESSIONS
// =================================================================

// Get attendance sessions
app.get("/api/attendance/sessions", async (req, res) => {
  try {

    const {
      date,
      branch,
      year,
      section
    } = req.query;


    let sql = `
      SELECT *
      FROM attendance_sessions
      WHERE 1=1
    `;

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


    sql += `
      ORDER BY
        session_date DESC,
        id DESC
    `;


    const [rows] =
      await pool.query(sql, params);


    res.json(rows);

  } catch (err) {

    console.error(
      "Get attendance sessions error:",
      err
    );

    res.status(500).json({
      error: err.message
    });

  }
});


// Create an attendance session
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


    if (
      !session_date ||
      !branch ||
      !year ||
      !section
    ) {

      return res.status(400).json({
        error:
          "session_date, branch, year and section are required"
      });

    }


    // Check whether this exact session already exists.
    const [existing] = await pool.query(
      `
      SELECT id
      FROM attendance_sessions
      WHERE session_date = ?
        AND branch = ?
        AND year = ?
        AND section = ?
        AND (
          subject_id = ?
          OR (subject_id IS NULL AND ? IS NULL)
        )
      ORDER BY id DESC
      LIMIT 1
      `,
      [
        session_date,
        branch,
        year,
        section,
        subject_id || null,
        subject_id || null
      ]
    );


    if (existing.length) {

      return res.json({
        id: existing[0].id,
        existing: true
      });

    }


    const [result] = await pool.query(
      `
      INSERT INTO attendance_sessions
      (
        session_date,
        branch,
        year,
        section,
        subject_id,
        faculty_id,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'Active')
      `,
      [
        session_date,
        branch,
        year,
        section,
        subject_id || null,
        faculty_id || null
      ]
    );


    res.status(201).json({
      id: result.insertId,
      existing: false
    });


  } catch (err) {

    console.error(
      "Create attendance session error:",
      err
    );

    res.status(500).json({
      error: err.message
    });

  }
});


// =================================================================
// ATTENDANCE RECORDS
// =================================================================

// Get attendance records + calculated attendance percentage
app.get("/api/attendance/records", async (req, res) => {
  try {

    const {
      date,
      branch,
      year,
      section
    } = req.query;


    // -------------------------------------------------------------
    // STUDENT FILTER
    // -------------------------------------------------------------

    let studentSql = `
      SELECT
        id AS student_id,
        roll_no,
        name,
        branch,
        year,
        section
      FROM students
      WHERE 1=1
    `;

    const studentParams = [];


    if (branch) {
      studentSql += " AND branch = ?";
      studentParams.push(branch);
    }


    if (year) {
      studentSql += " AND year = ?";
      studentParams.push(year);
    }


    if (section) {
      studentSql += " AND section = ?";
      studentParams.push(section);
    }


    studentSql += " ORDER BY roll_no";


    const [students] =
      await pool.query(
        studentSql,
        studentParams
      );


    // -------------------------------------------------------------
    // CALCULATE ATTENDANCE FOR EACH STUDENT
    //
    // Leave is NOT counted as an absence.
    //
    // Attendance =
    // present / (present + absent) * 100
    // -------------------------------------------------------------

    const result = [];


    for (const student of students) {

      const [percentageRows] =
        await pool.query(
          `
          SELECT

            SUM(
              CASE
                WHEN ar.status = 'present'
                THEN 1
                ELSE 0
              END
            ) AS present_count,

            SUM(
              CASE
                WHEN ar.status = 'absent'
                THEN 1
                ELSE 0
              END
            ) AS absent_count

          FROM attendance_records ar

          WHERE ar.student_id = ?
          `,
          [student.student_id]
        );


      const presentCount =
        Number(
          percentageRows[0]?.present_count || 0
        );


      const absentCount =
        Number(
          percentageRows[0]?.absent_count || 0
        );


      const totalClasses =
        presentCount + absentCount;


      const attendancePercent =
        totalClasses > 0
          ? Number(
              (
                presentCount /
                totalClasses *
                100
              ).toFixed(2)
            )
          : 0;


      // -----------------------------------------------------------
      // TODAY'S STATUS
      // -----------------------------------------------------------

      let todayStatus = "not-marked";


      if (date) {

        const [todayRows] =
          await pool.query(
            `
            SELECT ar.status

            FROM attendance_records ar

            INNER JOIN attendance_sessions ats
              ON ats.id = ar.session_id

            WHERE ar.student_id = ?
              AND ats.session_date = ?

            ORDER BY ar.id DESC

            LIMIT 1
            `,
            [
              student.student_id,
              date
            ]
          );


        if (todayRows.length) {

          todayStatus =
            todayRows[0].status;

        }

      }


      result.push({

        student_id:
          student.student_id,

        roll_no:
          student.roll_no,

        name:
          student.name,

        branch:
          student.branch,

        year:
          student.year,

        section:
          student.section,

        attendance_percent:
          attendancePercent,

        today_status:
          todayStatus,

        present_count:
          presentCount,

        absent_count:
          absentCount

      });

    }


    res.json({
      students: result
    });


  } catch (err) {

    console.error(
      "Get attendance records error:",
      err
    );

    res.status(500).json({
      error: err.message
    });

  }
});


// =================================================================
// MARK / UPDATE ONE STUDENT'S ATTENDANCE
// =================================================================

app.post("/api/attendance/records", async (req, res) => {
  try {

    const {
      student_id,
      date,
      status
    } = req.body;


    if (
      !student_id ||
      !date ||
      !status
    ) {

      return res.status(400).json({
        error:
          "student_id, date and status are required"
      });

    }


    // Only these three statuses are allowed.
    if (
      ![
        "present",
        "absent",
        "leave"
      ].includes(status)
    ) {

      return res.status(400).json({
        error:
          "Status must be present, absent or leave"
      });

    }


    // -------------------------------------------------------------
    // GET STUDENT DETAILS
    // -------------------------------------------------------------

    const [students] =
      await pool.query(
        `
        SELECT
          id,
          branch,
          year,
          section
        FROM students
        WHERE id = ?
        LIMIT 1
        `,
        [student_id]
      );


    if (!students.length) {

      return res.status(404).json({
        error: "Student not found"
      });

    }


    const student = students[0];


    // -------------------------------------------------------------
    // FIND EXISTING SESSION
    // -------------------------------------------------------------

    const [sessions] =
      await pool.query(
        `
        SELECT id

        FROM attendance_sessions

        WHERE session_date = ?
          AND branch = ?
          AND year = ?
          AND section = ?

        ORDER BY id DESC

        LIMIT 1
        `,
        [
          date,
          student.branch,
          student.year,
          student.section
        ]
      );


    let sessionId;


    if (sessions.length) {

      sessionId =
        sessions[0].id;

    } else {

      // -----------------------------------------------------------
      // CREATE SESSION ONLY IF IT DOESN'T EXIST
      // -----------------------------------------------------------

      const [newSession] =
        await pool.query(
          `
          INSERT INTO attendance_sessions
          (
            session_date,
            branch,
            year,
            section,
            subject_id,
            faculty_id,
            status
          )
          VALUES (?, ?, ?, ?, NULL, NULL, 'Active')
          `,
          [
            date,
            student.branch,
            student.year,
            student.section
          ]
        );


      sessionId =
        newSession.insertId;

    }


    // -------------------------------------------------------------
    // INSERT OR UPDATE ATTENDANCE
    // -------------------------------------------------------------

    await pool.query(
      `
      INSERT INTO attendance_records
      (
        session_id,
        student_id,
        status
      )
      VALUES (?, ?, ?)

      ON DUPLICATE KEY UPDATE

        status = VALUES(status),

        marked_at = CURRENT_TIMESTAMP
      `,
      [
        sessionId,
        student_id,
        status
      ]
    );


    // -------------------------------------------------------------
    // CALCULATE NEW ATTENDANCE
    // -------------------------------------------------------------

    const [counts] =
      await pool.query(
        `
        SELECT

          SUM(
            CASE
              WHEN status = 'present'
              THEN 1
              ELSE 0
            END
          ) AS present_count,

          SUM(
            CASE
              WHEN status = 'absent'
              THEN 1
              ELSE 0
            END
          ) AS absent_count

        FROM attendance_records

        WHERE student_id = ?
        `,
        [student_id]
      );


    const presentCount =
      Number(
        counts[0]?.present_count || 0
      );


    const absentCount =
      Number(
        counts[0]?.absent_count || 0
      );


    const totalClasses =
      presentCount + absentCount;


    const attendancePercent =
      totalClasses > 0
        ? Number(
            (
              presentCount /
              totalClasses *
              100
            ).toFixed(2)
          )
        : 0;


    // Keep students.attendance_percent synchronized too.
    await pool.query(
      `
      UPDATE students

      SET attendance_percent = ?

      WHERE id = ?
      `,
      [
        attendancePercent,
        student_id
      ]
    );


    res.json({

      ok: true,

      session_id:
        sessionId,

      student_id,

      status,

      attendance_percent:
        attendancePercent,

      present_count:
        presentCount,

      absent_count:
        absentCount

    });


  } catch (err) {

    console.error(
      "Save attendance error:",
      err
    );

    res.status(500).json({
      error: err.message
    });

  }
});


// =================================================================
// BULK MARK ATTENDANCE
// =================================================================

app.post("/api/attendance/records/bulk", async (req, res) => {
  try {

    const {
      student_ids,
      date,
      status
    } = req.body;


    if (
      !Array.isArray(student_ids) ||
      !student_ids.length ||
      !date ||
      !status
    ) {

      return res.status(400).json({
        error:
          "student_ids, date and status are required"
      });

    }


    if (
      ![
        "present",
        "absent",
        "leave"
      ].includes(status)
    ) {

      return res.status(400).json({
        error:
          "Status must be present, absent or leave"
      });

    }


    for (const studentId of student_ids) {

      // -----------------------------------------------------------
      // GET STUDENT
      // -----------------------------------------------------------

      const [students] =
        await pool.query(
          `
          SELECT
            id,
            branch,
            year,
            section

          FROM students

          WHERE id = ?

          LIMIT 1
          `,
          [studentId]
        );


      if (!students.length) {
        continue;
      }


      const student =
        students[0];


      // -----------------------------------------------------------
      // FIND SESSION
      // -----------------------------------------------------------

      const [sessions] =
        await pool.query(
          `
          SELECT id

          FROM attendance_sessions

          WHERE session_date = ?
            AND branch = ?
            AND year = ?
            AND section = ?

          ORDER BY id DESC

          LIMIT 1
          `,
          [
            date,
            student.branch,
            student.year,
            student.section
          ]
        );


      let sessionId;


      if (sessions.length) {

        sessionId =
          sessions[0].id;

      } else {

        const [newSession] =
          await pool.query(
            `
            INSERT INTO attendance_sessions
            (
              session_date,
              branch,
              year,
              section,
              subject_id,
              faculty_id,
              status
            )

            VALUES (?, ?, ?, ?, NULL, NULL, 'Active')
            `,
            [
              date,
              student.branch,
              student.year,
              student.section
            ]
          );


        sessionId =
          newSession.insertId;

      }


      // -----------------------------------------------------------
      // SAVE ATTENDANCE
      // -----------------------------------------------------------

      await pool.query(
        `
        INSERT INTO attendance_records
        (
          session_id,
          student_id,
          status
        )

        VALUES (?, ?, ?)

        ON DUPLICATE KEY UPDATE

          status = VALUES(status),

          marked_at = CURRENT_TIMESTAMP
        `,
        [
          sessionId,
          studentId,
          status
        ]
      );


      // -----------------------------------------------------------
      // RECALCULATE STUDENT ATTENDANCE
      // -----------------------------------------------------------

      const [counts] =
        await pool.query(
          `
          SELECT

            SUM(
              CASE
                WHEN status = 'present'
                THEN 1
                ELSE 0
              END
            ) AS present_count,

            SUM(
              CASE
                WHEN status = 'absent'
                THEN 1
                ELSE 0
              END
            ) AS absent_count

          FROM attendance_records

          WHERE student_id = ?
          `,
          [studentId]
        );


      const presentCount =
        Number(
          counts[0]?.present_count || 0
        );


      const absentCount =
        Number(
          counts[0]?.absent_count || 0
        );


      const totalClasses =
        presentCount + absentCount;


      const attendancePercent =
        totalClasses > 0
          ? Number(
              (
                presentCount /
                totalClasses *
                100
              ).toFixed(2)
            )
          : 0;


      await pool.query(
        `
        UPDATE students

        SET attendance_percent = ?

        WHERE id = ?
        `,
        [
          attendancePercent,
          studentId
        ]
      );

    }


    res.json({
      ok: true,
      count: student_ids.length
    });


  } catch (err) {

    console.error(
      "Bulk attendance error:",
      err
    );

    res.status(500).json({
      error: err.message
    });

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
// REPORT EXPORT — PDF / EXCEL / CSV
// =================================================================

app.post("/api/reports/:id/export", async (req, res) => {

  try {

    const reportId =
      Number(req.params.id);

    const format =
      String(
        req.body.format || "pdf"
      ).toLowerCase();


    // -------------------------------------------------------------
    // VALIDATE REPORT ID
    // -------------------------------------------------------------

    if (!Number.isInteger(reportId)) {

      return res.status(400).json({
        error: "Invalid report ID."
      });

    }


    // -------------------------------------------------------------
    // VALIDATE FORMAT
    // -------------------------------------------------------------

    const allowedFormats = [
      "pdf",
      "excel",
      "xlsx",
      "csv"
    ];


    if (!allowedFormats.includes(format)) {

      return res.status(400).json({
        error:
          "Invalid export format. Use PDF, Excel, or CSV."
      });

    }


    // -------------------------------------------------------------
    // GET REPORT
    // -------------------------------------------------------------

    const [rows] =
      await pool.query(
        `SELECT *
         FROM reports
         WHERE id = ?`,
        [reportId]
      );


    if (!rows.length) {

      return res.status(404).json({
        error: "Report not found."
      });

    }


    const report =
      rows[0];


    // -------------------------------------------------------------
    // CREATE EXPORT DIRECTORY
    // -------------------------------------------------------------

    const exportDirectory =
      path.join(
        __dirname,
        "exports"
      );


    if (!fs.existsSync(exportDirectory)) {

      fs.mkdirSync(
        exportDirectory,
        {
          recursive: true
        }
      );

    }


    // -------------------------------------------------------------
    // SAFE FILE NAME
    // -------------------------------------------------------------

    const safeName =
      String(
        report.report_name ||
        "PresentTrack_Report"
      )
      .replace(
        /[^a-z0-9_-]/gi,
        "_"
      );


    // =============================================================
    // CSV
    // =============================================================

    if (format === "csv") {

      const fileName =
        `${safeName}_${report.id}.csv`;

      const filePath =
        path.join(
          exportDirectory,
          fileName
        );


      const csvRows = [

        [
          "PresentTrack Report"
        ],

        [],

        [
          "Report ID",
          "Report Name",
          "Type",
          "Period",
          "Generated By",
          "Generated Date",
          "Status"
        ],

        [
          report.id,
          report.report_name,
          report.type,
          report.period,
          report.generated_by || "",
          report.generated_date
            ? new Date(
                report.generated_date
              ).toISOString()
            : "",
          report.status
        ]

      ];


      const csvContent =
        csvRows
          .map(
            row =>
              row
                .map(
                  value =>
                    `"${String(
                      value ?? ""
                    )
                    .replace(
                      /"/g,
                      '""'
                    )}"`
                )
                .join(",")
          )
          .join("\n");


      fs.writeFileSync(
        filePath,
        csvContent,
        "utf8"
      );


      await pool.query(
        `UPDATE reports
         SET file_path = ?,
             status = 'Ready'
         WHERE id = ?`,
        [
          `/exports/${fileName}`,
          reportId
        ]
      );


      return res.json({

        success: true,

        format: "csv",

        fileName,

        downloadUrl:
          `/exports/${fileName}`

      });

    }


    // =============================================================
    // EXCEL
    // =============================================================

    if (
      format === "excel" ||
      format === "xlsx"
    ) {

      const fileName =
        `${safeName}_${report.id}.xlsx`;

      const filePath =
        path.join(
          exportDirectory,
          fileName
        );


      const workbook =
        new ExcelJS.Workbook();


      const worksheet =
        workbook.addWorksheet(
          "Report"
        );


      worksheet.addRow([
        "PresentTrack Report"
      ]);


      worksheet.addRow([]);


      worksheet.addRow([
        "Report ID",
        report.id
      ]);


      worksheet.addRow([
        "Report Name",
        report.report_name
      ]);


      worksheet.addRow([
        "Type",
        report.type
      ]);


      worksheet.addRow([
        "Period",
        report.period
      ]);


      worksheet.addRow([
        "Generated By",
        report.generated_by || ""
      ]);


      worksheet.addRow([
        "Generated Date",
        report.generated_date
          ? new Date(
              report.generated_date
            ).toLocaleString()
          : ""
      ]);


      worksheet.addRow([
        "Status",
        report.status
      ]);


      worksheet.getColumn(1).width =
        25;

      worksheet.getColumn(2).width =
        45;


      await workbook.xlsx.writeFile(
        filePath
      );


      await pool.query(
        `UPDATE reports
         SET file_path = ?,
             status = 'Ready'
         WHERE id = ?`,
        [
          `/exports/${fileName}`,
          reportId
        ]
      );


      return res.json({

        success: true,

        format: "xlsx",

        fileName,

        downloadUrl:
          `/exports/${fileName}`

      });

    }


    // =============================================================
    // PDF
    // =============================================================

    if (format === "pdf") {

      const fileName =
        `${safeName}_${report.id}.pdf`;

      const filePath =
        path.join(
          exportDirectory,
          fileName
        );


      await new Promise(
        (
          resolve,
          reject
        ) => {

          const doc =
            new PDFDocument({
              margin: 50
            });


          const stream =
            fs.createWriteStream(
              filePath
            );


          stream.on(
            "finish",
            resolve
          );


          stream.on(
            "error",
            reject
          );


          doc.pipe(stream);


          // -------------------------------------------------------
          // TITLE
          // -------------------------------------------------------

          doc
            .fontSize(22)
            .text(
              "PresentTrack",
              {
                align: "center"
              }
            );


          doc.moveDown();


          doc
            .fontSize(18)
            .text(
              "Report",
              {
                align: "center"
              }
            );


          doc.moveDown(2);


          // -------------------------------------------------------
          // REPORT INFORMATION
          // -------------------------------------------------------

          doc
            .fontSize(12)
            .text(
              `Report ID: ${report.id}`
            );


          doc.moveDown();


          doc.text(
            `Report Name: ${
              report.report_name
            }`
          );


          doc.moveDown();


          doc.text(
            `Type: ${
              report.type
            }`
          );


          doc.moveDown();


          doc.text(
            `Period: ${
              report.period
            }`
          );


          doc.moveDown();


          doc.text(
            `Generated By: ${
              report.generated_by || "System"
            }`
          );


          doc.moveDown();


          doc.text(
            `Generated Date: ${
              report.generated_date
                ? new Date(
                    report.generated_date
                  ).toLocaleString()
                : ""
            }`
          );


          doc.moveDown();


          doc.text(
            `Status: ${
              report.status
            }`
          );


          doc.moveDown(2);


          // -------------------------------------------------------
          // FOOTER / NOTE
          // -------------------------------------------------------

          doc
            .fontSize(10)
            .text(
              "Generated by PresentTrack Attendance & Performance Analytics.",
              {
                align: "center"
              }
            );


          doc.end();

        }
      );


      await pool.query(
        `UPDATE reports
         SET file_path = ?,
             status = 'Ready'
         WHERE id = ?`,
        [
          `/exports/${fileName}`,
          reportId
        ]
      );


      return res.json({

        success: true,

        format: "pdf",

        fileName,

        downloadUrl:
          `/exports/${fileName}`

      });

    }


  } catch (err) {

    console.error(
      "Report export error:",
      err
    );


    res.status(500).json({
      error:
        "Failed to export report."
    });

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

