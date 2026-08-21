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
   SEMESTER
   ========================================================= */

function changeSemester() {

    const semester =
        document.getElementById("semesterSelect").value;

    showToast(
        "Semester " + semester +
        " performance data loaded."
    );

}


/* =========================================================
   MID 1 / MID 2 / SEMESTER
   ========================================================= */

function changeExam(type, button) {

    document
        .querySelectorAll(".segmented-control button")
        .forEach(btn => {
            btn.classList.remove("active");
        });

    button.classList.add("active");


    const messages = {

        mid1:
            "Mid 1 performance data is now active.",

        mid2:
            "Mid 2 performance data is now active.",

        semester:
            "Final semester performance data is now active."

    };


    showToast(messages[type]);

}


/* =========================================================
   STUDENT SELECTION
   ========================================================= */

function selectStudent(name) {

    const nameElement =
        document.getElementById("selectedStudentName");

    const percentage =
        document.getElementById("riskPercentage");


    nameElement.textContent = name;


    const data = {

        "Rahul Verma": 82,

        "Vikram Singh": 76,

        "Sneha Reddy": 64,

        "Ishta Nair": 57

    };


    percentage.textContent =
        (data[name] || 50) + "%";


    showToast(
        "Showing risk analysis for " + name
    );

}


/* =========================================================
   INTERVENTION PLAN
   ========================================================= */

function openIntervention() {

    const modal =
        document.getElementById("modalOverlay");

    const content =
        document.getElementById("modalContent");


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
            Rahul Verma

            <br>

            <strong>Risk:</strong>
            82% — High

        </div>


        <h3>Recommended Actions</h3>

        <label style="
            display:block;
            margin:15px 0;
        ">

            <input type="checkbox" checked>
            Faculty mentoring

        </label>


        <label style="
            display:block;
            margin:15px 0;
        ">

            <input type="checkbox" checked>
            Attendance recovery plan

        </label>


        <label style="
            display:block;
            margin:15px 0;
        ">

            <input type="checkbox" checked>
            Parent notification

        </label>


        <label style="
            display:block;
            margin:15px 0;
        ">

            <input type="checkbox">
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


function saveIntervention() {

    closeModal();

    showToast(
        "Intervention plan created successfully."
    );

}


/* =========================================================
   WHAT-IF SIMULATOR
   ========================================================= */

function runSimulation() {

    const currentAttendance =
        Number(
            document.getElementById(
                "currentAttendance"
            ).value
        );


    const futureClasses =
        Number(
            document.getElementById(
                "futureClasses"
            ).value
        );


    const currentPerformance =
        Number(
            document.getElementById(
                "currentPerformance"
            ).value
        );


    const expectedMarks =
        Number(
            document.getElementById(
                "expectedMarks"
            ).value
        );


    /*
       Assumption:
       Current attendance represents
       100 conducted classes.

       This is a prototype model.
    */

    const currentAttended =
        currentAttendance;


    const projectedAttendance =
        (
            (currentAttended + futureClasses) /
            (100 + futureClasses)
        ) * 100;


    /*
       Performance prediction:
       60% current performance
       40% expected future marks
    */

    const predictedPerformance =
        (
            currentPerformance * 0.6 +
            expectedMarks * 0.4
        );


    const attendance =
        Math.min(
            100,
            projectedAttendance
        );


    const performance =
        Math.min(
            100,
            predictedPerformance
        );


    document.getElementById(
        "simAttendance"
    ).textContent =
        attendance.toFixed(1) + "%";


    document.getElementById(
        "simPerformance"
    ).textContent =
        performance.toFixed(1) + "%";


    const riskElement =
        document.getElementById("simRisk");


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


    riskElement.textContent = risk;


    document.getElementById(
        "simMessage"
    ).textContent = message;

}


/* =========================================================
   ATTENDANCE RECOVERY
   ========================================================= */

function calculateRecovery() {

    const current =
        Number(
            document.getElementById(
                "recoveryAttendance"
            ).value
        );


    const required =
        Number(
            document.getElementById(
                "requiredAttendance"
            ).value
        );


    const upcoming =
        Number(
            document.getElementById(
                "upcomingClasses"
            ).value
        );


    if (
        current >= required
    ) {

        document.getElementById(
            "recoveryResult"
        ).innerHTML = `

            <strong>
                Attendance target already achieved.
            </strong>

            You are currently at
            ${current}%.

        `;

        return;

    }


    /*
       Assume 100 classes conducted.
    */

    const currentAttended = current;


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


    const result =
        document.getElementById(
            "recoveryResult"
        );


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
        document.getElementById("modalOverlay");

    const content =
        document.getElementById("modalContent");


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

    document.getElementById(
        "analyticsQuery"
    ).value =
        button.textContent.trim();


    askAnalytics();

}


function askAnalytics() {

    const query =
        document.getElementById(
            "analyticsQuery"
        ).value
        .toLowerCase()
        .trim();


    const result =
        document.getElementById(
            "analyticsResult"
        );


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
        document.getElementById("modalOverlay");

    const content =
        document.getElementById("modalContent");


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

    document.getElementById(
        "currentRole"
    ).textContent = role;


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

    document
        .getElementById(
            "notificationPanel"
        )
        .classList.toggle("show");

}


/* =========================================================
   MODAL
   ========================================================= */

function closeModal(event) {

    if (
        event &&
        event.target !==
        document.getElementById("modalOverlay")
    ) {

        return;

    }


    document
        .getElementById("modalOverlay")
        .classList.remove("show");

}


/* =========================================================
   TOAST
   ========================================================= */

function showToast(message) {

    const oldToast =
        document.querySelector(".presentrack-toast");


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
   LOAD SAVED ROLE
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        const savedRole =
            localStorage.getItem(
                "presentrackRole"
            );


        if (savedRole) {

            document.getElementById(
                "currentRole"
            ).textContent =
                savedRole;

        }


        calculateRecovery();

        runSimulation();

    }
);