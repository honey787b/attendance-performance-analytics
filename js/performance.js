/* =========================================================
   PRESENTRACK PERFORMANCE INTELLIGENCE ENGINE
   ========================================================= */


/* =========================================================
   BASIC NAVIGATION
   ========================================================= */

function generateReport() {
    window.location.href = "reports.html";
}

function openTranscript() {
    window.location.href = "transcript.html";
}

function openParentReport() {
    window.location.href = "parent-report.html";
}

function openAllStudents() {
    window.location.href = "students.html";
}

function openInstitutionAnalytics() {
    window.location.href = "analytics.html";
}


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToSection(id) {

    const section = document.getElementById(id);

    if (section) {
        section.scrollIntoView({
            behavior: "smooth"
        });
    }
}


/* =========================================================
   CURRENT PERFORMANCE STATE
   ========================================================= */

let selectedStudent = null;


/* =========================================================
   SEMESTER
   ========================================================= */

async function changeSemester() {

    const semesterSelect =
        document.getElementById("semesterSelect");

    if (!semesterSelect) {
        console.error("semesterSelect not found");
        return;
    }

    await loadPerformanceAnalysis();

    showToast(
        "Semester " +
        semesterSelect.value +
        " performance data loaded."
    );
}


/* =========================================================
   MID 1 / MID 2 / SEMESTER
   ========================================================= */

async function changeExam(type, button) {

    document
        .querySelectorAll(".segmented-control button")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    await loadPerformanceAnalysis();

    const messages = {

        mid1:
            "Mid 1 performance data is now active.",

        mid2:
            "Mid 2 performance data is now active.",

        semester:
            "Final semester performance data is now active."

    };

    showToast(
        messages[type] ||
        "Performance data updated."
    );
}


/* =========================================================
   GET ACTIVE EXAM
   ========================================================= */

function getActiveExamType() {

    const activeExam =
        document.querySelector(
            ".segmented-control button.active"
        );

    if (!activeExam) {
        return "mid1";
    }

    const text =
        activeExam.textContent
            .trim()
            .toLowerCase();

    if (
        text.includes("mid 2") ||
        text.includes("mid2")
    ) {
        return "mid2";
    }

    if (
        text.includes("semester") ||
        text.includes("final")
    ) {
        return "semester_exam";
    }

    return "mid1";
}


/* =========================================================
   STUDENT SELECTION
   ========================================================= */

async function selectStudent(
    studentId,
    name,
    attendance = 0,
    gpa = 0
) {

    /*
       Backward compatibility:
       If an old onclick only passes a name,
       still allow it to work.
    */

    if (
        typeof studentId === "string" &&
        name === undefined
    ) {
        name = studentId;
        studentId = null;
    }

    selectedStudent = {

        id: studentId,

        name:
            name || "Selected Student",

        attendance:
            Number(attendance || 0),

        gpa:
            Number(gpa || 0)

    };


    const nameElement =
        document.getElementById(
            "selectedStudentName"
        );

    if (nameElement) {
        nameElement.textContent =
            selectedStudent.name;
    }


    /*
       Show actual attendance percentage
       instead of the old hardcoded values.
    */

    const percentage =
        document.getElementById(
            "riskPercentage"
        );

    if (percentage) {

        percentage.textContent =
            selectedStudent.attendance.toFixed(0) +
            "%";
    }


    /*
       If we know the student's database ID,
       load their real performance.
    */

    if (studentId) {

        await loadPerformanceAnalysis();

    }


    showToast(
        "Showing performance for " +
        selectedStudent.name
    );
}


/* =========================================================
   INTERVENTION PLAN
   ========================================================= */

function openIntervention() {

    const modal =
        document.getElementById(
            "modalOverlay"
        );

    const content =
        document.getElementById(
            "modalContent"
        );

    if (!modal || !content) {

        console.error(
            "Intervention modal not found"
        );

        return;
    }


    /*
       If no student has been selected,
       use a safe message instead of fake data.
    */

    if (!selectedStudent) {

        content.innerHTML = `

            <span class="section-label">
                FACULTY INTERVENTION
            </span>

            <h2 style="margin:8px 0 20px">
                Create Intervention Plan
            </h2>

            <div style="
                background:#FFF7ED;
                padding:15px;
                border-radius:10px;
                margin-bottom:15px;
            ">

                Please select a student first.

            </div>

            <button
                class="btn-primary full-width"
                onclick="closeModal()">

                Close

            </button>

        `;

        modal.classList.add("show");

        return;
    }


    const attendance =
        Number(
            selectedStudent.attendance || 0
        );

    const gpa =
        Number(
            selectedStudent.gpa || 0
        );


    let risk = "Moderate";

    if (
        attendance < 60 ||
        (gpa > 0 && gpa < 2.5)
    ) {

        risk = "High";

    }

    else if (
        attendance >= 75 &&
        (gpa === 0 || gpa >= 3)
    ) {

        risk = "Low";

    }


    content.innerHTML = `

        <span class="section-label">
            FACULTY INTERVENTION
        </span>

        <h2 style="margin:8px 0 20px">
            Create Intervention Plan
        </h2>

        <div style="
            background:#EEF2FF;
            padding:15px;
            border-radius:10px;
            margin-bottom:15px;
        ">

            <strong>Student:</strong>
            ${selectedStudent.name}

            <br>

            <strong>Attendance:</strong>
            ${attendance.toFixed(1)}%

            <br>

            <strong>GPA:</strong>
            ${gpa > 0 ? gpa.toFixed(2) : "Not available"}

            <br>

            <strong>Risk:</strong>
            ${risk}

        </div>

        <h3>Recommended Actions</h3>

        <label style="
            display:block;
            margin:15px 0;
        ">

            <input
                type="checkbox"
                id="interventionMentoring"
                checked>

            Faculty mentoring

        </label>

        <label style="
            display:block;
            margin:15px 0;
        ">

            <input
                type="checkbox"
                id="interventionAttendance"
                ${attendance < 75 ? "checked" : ""}>

            Attendance recovery plan

        </label>

        <label style="
            display:block;
            margin:15px 0;
        ">

            <input
                type="checkbox"
                id="interventionParent"
                ${risk === "High" ? "checked" : ""}>

            Parent notification

        </label>

        <label style="
            display:block;
            margin:15px 0;
        ">

            <input
                type="checkbox"
                id="interventionMonitoring"
                checked>

            Weekly performance monitoring

        </label>

        <button
            class="btn-primary full-width"
            onclick="saveIntervention()">

            Create Intervention

        </button>

    `;

    modal.classList.add("show");
}


/* =========================================================
   SAVE INTERVENTION
   ========================================================= */

function saveIntervention() {

    if (!selectedStudent) {

        showToast(
            "Please select a student first."
        );

        return;
    }


    const actions = [];

    const mentoring =
        document.getElementById(
            "interventionMentoring"
        );

    const attendance =
        document.getElementById(
            "interventionAttendance"
        );

    const parent =
        document.getElementById(
            "interventionParent"
        );

    const monitoring =
        document.getElementById(
            "interventionMonitoring"
        );


    if (mentoring && mentoring.checked) {
        actions.push("Faculty mentoring");
    }

    if (attendance && attendance.checked) {
        actions.push("Attendance recovery plan");
    }

    if (parent && parent.checked) {
        actions.push("Parent notification");
    }

    if (monitoring && monitoring.checked) {
        actions.push(
            "Weekly performance monitoring"
        );
    }


    /*
       Save locally for now.
       This means the generated plan persists
       during the current browser session.
    */

    const plans =
        JSON.parse(
            localStorage.getItem(
                "presentrackInterventionPlans"
            ) || "[]"
        );


    plans.push({

        student_id:
            selectedStudent.id,

        student_name:
            selectedStudent.name,

        attendance:
            selectedStudent.attendance,

        gpa:
            selectedStudent.gpa,

        actions,

        created_at:
            new Date().toISOString()

    });


    localStorage.setItem(
        "presentrackInterventionPlans",
        JSON.stringify(plans)
    );


    closeModal();

    showToast(
        "Intervention plan created for " +
        selectedStudent.name
    );
}


/* =========================================================
   WHAT-IF SIMULATOR
   ========================================================= */

function runSimulation() {

    const attendanceInput =
        document.getElementById(
            "currentAttendance"
        );

    const futureInput =
        document.getElementById(
            "futureClasses"
        );

    const performanceInput =
        document.getElementById(
            "currentPerformance"
        );

    const expectedInput =
        document.getElementById(
            "expectedMarks"
        );


    if (
        !attendanceInput ||
        !futureInput ||
        !performanceInput ||
        !expectedInput
    ) {
        return;
    }


    const currentAttendance =
        Number(
            attendanceInput.value
        );

    const futureClasses =
        Number(
            futureInput.value
        );

    const currentPerformance =
        Number(
            performanceInput.value
        );

    const expectedMarks =
        Number(
            expectedInput.value
        );


    /*
       Approximate current attendance
       as attended classes out of 100.
    */

    const currentAttended =
        currentAttendance;


    const projectedAttendance =
        (
            (currentAttended + futureClasses) /
            (100 + futureClasses)
        ) * 100;


    const predictedPerformance =
        (
            currentPerformance * 0.6 +
            expectedMarks * 0.4
        );


    const attendance =
        Math.min(
            100,
            Math.max(
                0,
                projectedAttendance
            )
        );


    const performance =
        Math.min(
            100,
            Math.max(
                0,
                predictedPerformance
            )
        );


    const simAttendance =
        document.getElementById(
            "simAttendance"
        );

    const simPerformance =
        document.getElementById(
            "simPerformance"
        );


    if (simAttendance) {

        simAttendance.textContent =
            attendance.toFixed(1) + "%";
    }


    if (simPerformance) {

        simPerformance.textContent =
            performance.toFixed(1) + "%";
    }


    const riskElement =
        document.getElementById(
            "simRisk"
        );

    const messageElement =
        document.getElementById(
            "simMessage"
        );


    if (
        !riskElement ||
        !messageElement
    ) {
        return;
    }


    let risk;
    let message;


    if (
        attendance >= 75 &&
        performance >= 75
    ) {

        risk = "LOW RISK";

        riskElement.className =
            "simulation-status safe";

        message =
            "The student is projected to move into a safer academic zone.";

    }

    else if (
        attendance >= 70 &&
        performance >= 60
    ) {

        risk = "MODERATE RISK";

        riskElement.className =
            "simulation-status moderate";

        message =
            "The student is improving but still requires monitoring.";

    }

    else {

        risk = "HIGH RISK";

        riskElement.className =
            "simulation-status high";

        message =
            "Immediate intervention is recommended.";
    }


    riskElement.textContent =
        risk;

    messageElement.textContent =
        message;
}


/* =========================================================
   ATTENDANCE RECOVERY
   ========================================================= */

function calculateRecovery() {

    const currentInput =
        document.getElementById(
            "recoveryAttendance"
        );

    const requiredInput =
        document.getElementById(
            "requiredAttendance"
        );

    const upcomingInput =
        document.getElementById(
            "upcomingClasses"
        );

    const result =
        document.getElementById(
            "recoveryResult"
        );


    if (
        !currentInput ||
        !requiredInput ||
        !upcomingInput ||
        !result
    ) {
        return;
    }


    const current =
        Number(
            currentInput.value
        );

    const required =
        Number(
            requiredInput.value
        );

    const upcoming =
        Number(
            upcomingInput.value
        );


    if (current >= required) {

        result.innerHTML = `

            <strong>
                Attendance target already achieved.
            </strong>

            You are currently at
            ${current}%.

        `;

        return;
    }


    const currentAttended =
        current;


    let requiredClasses = 0;


    while (
        (
            (currentAttended + requiredClasses) /
            (100 + requiredClasses)
        ) * 100 < required
    ) {

        requiredClasses++;


        if (
            requiredClasses > upcoming
        ) {
            break;
        }
    }


    if (
        requiredClasses <= upcoming
    ) {

        result.innerHTML = `

            Attend approximately

            <strong>
                ${requiredClasses}
                consecutive classes
            </strong>

            to reach
            <strong>${required}%</strong>
            attendance.

        `;

    }

    else {

        result.innerHTML = `

            <strong>
                Recovery may not be possible
            </strong>

            within the next
            ${upcoming} classes.

            Immediate faculty intervention recommended.

        `;
    }
}


/* =========================================================
   ANOMALY DETAILS
   ========================================================= */

function openAnomalyDetails() {

    const modal =
        document.getElementById(
            "modalOverlay"
        );

    const content =
        document.getElementById(
            "modalContent"
        );


    if (!modal || !content) {
        return;
    }


    content.innerHTML = `

        <span class="section-label">
            ATTENDANCE SECURITY
        </span>

        <h2 style="margin:8px 0 20px">
            Attendance Anomaly Report
        </h2>

        <div style="
            padding:15px;
            background:#FFF7ED;
            border-radius:10px;
            margin-bottom:15px;
        ">

            <strong>
                3 anomalies detected
            </strong>

        </div>

        <div style="
            padding:12px 0;
            border-bottom:1px solid #E2E8F0;
        ">

            <strong>
                Duplicate Session
            </strong>

            <p style="color:#64748B;font-size:12px">

                Student PT105 recorded attendance
                twice in the same session.

            </p>

        </div>

        <div style="
            padding:12px 0;
            border-bottom:1px solid #E2E8F0;
        ">

            <strong>
                Location Mismatch
            </strong>

            <p style="color:#64748B;font-size:12px">

                Attendance location differs from
                classroom location.

            </p>

        </div>

        <div style="margin-top:20px">

            <button
                class="btn-primary"
                onclick="closeModal()">

                Mark for Verification

            </button>

        </div>

    `;


    modal.classList.add("show");
}


/* =========================================================
   NATURAL LANGUAGE ANALYTICS
   ========================================================= */

function useQuery(button) {

    const input =
        document.getElementById(
            "analyticsQuery"
        );


    if (!input || !button) {
        return;
    }


    input.value =
        button.textContent.trim();


    askAnalytics();
}


function askAnalytics() {

    const input =
        document.getElementById(
            "analyticsQuery"
        );

    const result =
        document.getElementById(
            "analyticsResult"
        );


    if (!input || !result) {
        return;
    }


    const query =
        input.value
            .toLowerCase()
            .trim();


    if (!query) {

        result.innerHTML = `

            <i class="fas fa-circle-info"></i>

            <span>
                Please enter an analytics question.
            </span>

        `;

        return;
    }


    let answer = "";


    if (
        query.includes("below 75") ||
        query.includes("attendance")
    ) {

        answer = `

            <strong>
                Attendance Insight
            </strong>

            <br>

            38 students currently have
            attendance below 75%.

            <br>

            12 of them are classified as
            high-risk students.

        `;

    }

    else if (
        query.includes("lowest") ||
        query.includes("subject")
    ) {

        answer = `

            <strong>
                Subject Performance Insight
            </strong>

            <br>

            Operating Systems has the
            lowest class average at

            <strong>64.8%</strong>.

            <br>

            Consider targeted mentoring
            and additional revision sessions.

        `;

    }

    else if (
        query.includes("high risk") ||
        query.includes("risk")
    ) {

        answer = `

            <strong>
                Risk Analysis
            </strong>

            <br>

            12 students are currently
            classified as high or critical risk.

            <br>

            5 require immediate faculty intervention.

        `;

    }

    else if (
        query.includes("improved") ||
        query.includes("improvement")
    ) {

        answer = `

            <strong>
                Improvement Insight
            </strong>

            <br>

            Ananya Rao has shown the highest
            semester improvement of

            <strong>18.4%</strong>.

            <br>

            Growth Score:
            <strong>94/100</strong>.

        `;

    }

    else {

        answer = `

            <strong>
                PresenTrack Insight
            </strong>

            <br>

            I analyzed the available academic
            indicators.

            <br>

            Try asking about attendance,
            risk, subjects or improvement.

        `;
    }


    result.innerHTML = `

        <i class="fas fa-sparkles"></i>

        <span>${answer}</span>

    `;
}


/* =========================================================
   ROLE BASED ACCESS DEMO
   ========================================================= */

function openRolePanel() {

    const modal =
        document.getElementById(
            "modalOverlay"
        );

    const content =
        document.getElementById(
            "modalContent"
        );


    if (!modal || !content) {
        return;
    }


    content.innerHTML = `

        <span class="section-label">
            ACCESS CONTROL
        </span>

        <h2 style="margin:8px 0 20px">
            Select User Role
        </h2>

        <button
            class="btn-primary full-width"
            style="margin-bottom:10px"
            onclick="setRole('Administrator')">

            Administrator

        </button>

        <button
            class="btn-primary full-width"
            style="margin-bottom:10px"
            onclick="setRole('Faculty')">

            Faculty

        </button>

        <button
            class="btn-primary full-width"
            style="margin-bottom:10px"
            onclick="setRole('Student')">

            Student

        </button>

        <button
            class="btn-primary full-width"
            onclick="setRole('Parent')">

            Parent

        </button>

    `;


    modal.classList.add("show");
}


function setRole(role) {

    const roleElement =
        document.getElementById(
            "currentRole"
        );


    if (roleElement) {
        roleElement.textContent =
            role;
    }


    localStorage.setItem(
        "presentrackRole",
        role
    );


    closeModal();


    showToast(
        "Role changed to " + role
    );
}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function toggleNotifications() {

    const panel =
        document.getElementById(
            "notificationPanel"
        );


    if (panel) {
        panel.classList.toggle("show");
    }
}


/* =========================================================
   MODAL
   ========================================================= */

function closeModal(event) {

    const modal =
        document.getElementById(
            "modalOverlay"
        );


    if (!modal) {
        return;
    }


    if (
        event &&
        event.target !== modal
    ) {
        return;
    }


    modal.classList.remove("show");
}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const oldToast =
        document.querySelector(
            ".presentrack-toast"
        );


    if (oldToast) {
        oldToast.remove();
    }


    const toast =
        document.createElement("div");


    toast.className =
        "presentrack-toast";


    toast.innerHTML = `

        <i class="fas fa-circle-check"></i>

        ${message}

    `;


    document.body.appendChild(toast);


    setTimeout(() => {

        toast.classList.add("hide");


        setTimeout(() => {

            toast.remove();

        }, 300);

    }, 2500);
}


/* =========================================================
   LOAD PERFORMANCE DATA FROM BACKEND
   ========================================================= */

async function loadPerformanceData() {

    try {

        const statsResponse =
            await fetch(
                "/api/dashboard/stats"
            );


        if (!statsResponse.ok) {

            throw new Error(
                "Failed to load dashboard statistics"
            );
        }


        const stats =
            await statsResponse.json();


        const riskResponse =
            await fetch(
                "/api/at-risk"
            );


        if (!riskResponse.ok) {

            throw new Error(
                "Failed to load at-risk students"
            );
        }


        const riskStudents =
            await riskResponse.json();


        console.log(
            "Performance stats:",
            stats
        );


        console.log(
            "At-risk students:",
            riskStudents
        );


        /* =====================================================
           TOTAL STUDENTS
           ===================================================== */

        const metricCards =
            document.querySelectorAll(
                ".metric-card"
            );


        if (metricCards[0]) {

            const value =
                metricCards[0].querySelector(
                    "h2"
                );


            if (value) {

                value.textContent =
                    stats.totalStudents;
            }
        }


        /* =====================================================
           AT-RISK COUNT
           ===================================================== */

        const riskCount =
            document.getElementById(
                "riskCount"
            );


        if (riskCount) {

            riskCount.textContent =
                stats.atRiskCount;
        }


        /* =====================================================
           RISK STUDENT LIST
           ===================================================== */

        const riskContainer =
            document.querySelector(
                ".risk-students"
            );


        if (!riskContainer) {
            return;
        }


        riskContainer.innerHTML = "";


        if (
            !Array.isArray(riskStudents) ||
            riskStudents.length === 0
        ) {

            riskContainer.innerHTML = `

                <div style="
                    padding:20px;
                    text-align:center;
                    color:#64748B;
                ">

                    No at-risk students found.

                </div>

            `;

            return;
        }


        riskStudents.forEach(student => {

            const attendance =
                Number(
                    student.attendance_percent || 0
                );


            const gpa =
                Number(
                    student.gpa || 0
                );


            let riskClass =
                "moderate";


            let riskLabel =
                "Moderate";


            if (
                student.risk_type === "both" ||
                student.risk_type === "gpa"
            ) {

                riskClass =
                    "high";

                riskLabel =
                    "High Risk";
            }


            if (
                student.risk_type === "attendance" &&
                attendance < 60
            ) {

                riskClass =
                    "high";

                riskLabel =
                    "High Risk";
            }


            const initials =
                student.name
                    .trim()
                    .split(/\s+/)
                    .map(word => word[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "student-risk-row";


            /*
               IMPORTANT:
               Pass the REAL database ID,
               name, attendance and GPA.
            */

            row.onclick =
                function() {

                    selectStudent(
                        student.id,
                        student.name.trim(),
                        attendance,
                        gpa
                    );

                };


            row.innerHTML = `

                <div class="student-mini-avatar ${riskClass}">
                    ${initials}
                </div>

                <div class="student-info">

                    <strong>
                        ${student.name.trim()}
                    </strong>

                    <span>
                        ${student.roll_no}
                        ·
                        ${student.branch}
                        ·
                        Year ${student.year || ""}
                    </span>

                </div>

                <div class="risk-score ${riskClass}">

                    <strong>
                        ${attendance.toFixed(0)}%
                    </strong>

                    <span>
                        ${riskLabel}
                    </span>

                </div>

                <i class="fas fa-chevron-right"></i>

            `;


            riskContainer.appendChild(
                row
            );

        });


    } catch (error) {

        console.error(
            "Failed to load performance data:",
            error
        );
    }
}


/* =========================================================
   LOAD REAL PERFORMANCE ANALYSIS
   ========================================================= */

async function loadPerformanceAnalysis() {

    try {

        /* =====================================================
           GET CURRENT SEMESTER
           ===================================================== */

        const semesterSelect =
            document.getElementById(
                "semesterSelect"
            );


        if (!semesterSelect) {

            console.error(
                "semesterSelect element not found"
            );

            return;
        }


        const semester =
            semesterSelect.value;


        /* =====================================================
           GET ACTIVE EXAM
           ===================================================== */

        const examType =
            getActiveExamType();


        console.log(
            "Loading performance:",
            {
                semester,
                examType,
                selectedStudent
            }
        );


        /* =====================================================
           BUILD API URL
           ===================================================== */

        let url =
            "/api/marks?semester=" +
            encodeURIComponent(
                semester
            );


        /*
           If a real student has been selected,
           request ONLY that student's marks.
        */

        if (
            selectedStudent &&
            selectedStudent.id
        ) {

            url +=
                "&student_id=" +
                encodeURIComponent(
                    selectedStudent.id
                );
        }


        /* =====================================================
           REQUEST MARKS
           ===================================================== */

        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                "Failed to load marks"
            );
        }


        const marks =
            await response.json();


        console.log(
            "Performance marks:",
            marks
        );


        /* =====================================================
           NO DATA
           ===================================================== */

        if (
            !Array.isArray(marks) ||
            marks.length === 0
        ) {

            updatePerformanceUI(
                0,
                semester,
                examType,
                true
            );

            return;
        }


        /* =====================================================
           CALCULATE SELECTED EXAM PERFORMANCE
           ===================================================== */

        let totalMarks =
            0;

        let totalMax =
            0;


        marks.forEach(mark => {

            let score = 0;


            if (
                examType === "mid1"
            ) {

                score =
                    Number(
                        mark.mid1 || 0
                    );

            }

            else if (
                examType === "mid2"
            ) {

                score =
                    Number(
                        mark.mid2 || 0
                    );

            }

            else if (
                examType === "semester_exam"
            ) {

                score =
                    Number(
                        mark.semester_exam || 0
                    );
            }


            const max =
                Number(
                    mark.max_marks || 100
                );


            totalMarks +=
                score;


            totalMax +=
                max;

        });


        const average =
            totalMax > 0
                ? (
                    totalMarks /
                    totalMax
                ) * 100
                : 0;


        /* =====================================================
           UPDATE UI
           ===================================================== */

        updatePerformanceUI(
            average,
            semester,
            examType,
            false
        );


    } catch (error) {

        console.error(
            "Performance analysis error:",
            error
        );


        showToast(
            "Unable to load performance data."
        );
    }
}


/* =========================================================
   UPDATE PERFORMANCE UI
   ========================================================= */

function updatePerformanceUI(
    average,
    semester,
    examType,
    noData
) {

    /* =====================================================
       PERFORMANCE CARD
       ===================================================== */

    const metricCards =
        document.querySelectorAll(
            ".metric-card"
        );


    if (metricCards[1]) {

        const value =
            metricCards[1].querySelector(
                "h2"
            );


        if (value) {

            value.textContent =
                noData
                    ? "0.0%"
                    : average.toFixed(1) + "%";
        }
    }


    /* =====================================================
       CHART
       ===================================================== */

    const chartValues =
        document.querySelectorAll(
            ".chart-value"
        );


    const chartBars =
        document.querySelectorAll(
            ".chart-bar"
        );


    if (chartValues.length) {

        const currentValue =
            chartValues[
                chartValues.length - 1
            ];


        currentValue.textContent =
            noData
                ? "0.0%"
                : average.toFixed(1) + "%";
    }


    if (chartBars.length) {

        const currentBar =
            chartBars[
                chartBars.length - 1
            ];


        currentBar.style.height =
            Math.min(
                100,
                Math.max(
                    0,
                    average
                )
            ) + "%";
    }


    /* =====================================================
       INSIGHT
       ===================================================== */

    const insight =
        document.querySelector(
            ".insight-box p"
        );


    if (!insight) {
        return;
    }


    let examName =
        "Mid 1";


    if (
        examType === "mid2"
    ) {

        examName =
            "Mid 2";

    }

    else if (
        examType === "semester_exam"
    ) {

        examName =
            "Semester";
    }


    const studentText =
        selectedStudent
            ? " for " +
              selectedStudent.name
            : "";


    if (noData) {

        insight.innerHTML = `

            <strong>Insight:</strong>

            No ${examName} performance
            data is available for
            Semester ${semester}
            ${studentText}.

        `;

    }

    else {

        insight.innerHTML = `

            <strong>Insight:</strong>

            ${examName} performance
            ${studentText}
            for Semester ${semester}
            is

            <strong>
                ${average.toFixed(1)}%
            </strong>.

        `;
    }
}


/* =========================================================
   LOAD SAVED ROLE / INITIAL PAGE LOAD
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const storage =
            localStorage.getItem(
                "userName"
            )
                ? localStorage
                : sessionStorage;


        const userName =
            storage.getItem(
                "userName"
            );


        const userRole =
            storage.getItem(
                "userRole"
            );


        const nameElement =
            document.getElementById(
                "performanceUserName"
            );


        const avatarElement =
            document.getElementById(
                "userAvatar"
            );


        if (
            userName &&
            nameElement
        ) {

            nameElement.textContent =
                userName;
        }


        if (
            userName &&
            avatarElement
        ) {

            avatarElement.textContent =
                userName
                    .split(/\s+/)
                    .map(
                        word => word[0]
                    )
                    .join("")
                    .substring(0, 2)
                    .toUpperCase();
        }


        if (userRole) {

            const roleElement =
                document.getElementById(
                    "currentRole"
                );


            if (roleElement) {

                roleElement.textContent =
                    userRole
                        .charAt(0)
                        .toUpperCase() +
                    userRole.slice(1);
            }
        }


        const savedRole =
            localStorage.getItem(
                "presentrackRole"
            );


        if (savedRole) {

            const roleElement =
                document.getElementById(
                    "currentRole"
                );


            if (roleElement) {

                roleElement.textContent =
                    savedRole;
            }
        }


        /* =====================================================
           INITIAL PAGE DATA
           ===================================================== */

        calculateRecovery();

        runSimulation();

        loadPerformanceData();

        loadPerformanceAnalysis();

    }
);