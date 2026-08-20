/* =====================================================
   DASHBOARD JAVASCRIPT
===================================================== */


/* =====================================================
   DEMO DASHBOARD DATA
   Later backend API nundi replace cheyyachu
===================================================== */

const dashboardData = {

    user: {
        name: "Yasaswini"
    },

    attendance: {
        percentage: 85,
        present: 42,
        absent: 7,
        late: 1,
        total: 50
    },

    performance: {
        percentage: 78
    },

    risk: {
        status: false
    },

    recentAttendance: [
        {
            subject: "Data Structures",
            date: "20 Aug 2026",
            status: "Present"
        },
        {
            subject: "DBMS",
            date: "19 Aug 2026",
            status: "Present"
        },
        {
            subject: "Web Development",
            date: "18 Aug 2026",
            status: "Absent"
        },
        {
            subject: "Python",
            date: "17 Aug 2026",
            status: "Present"
        }
    ]
};


/* =====================================================
   GET ELEMENT
===================================================== */

function getElement(id) {

    return document.getElementById(id);
}


/* =====================================================
   DISPLAY USER
===================================================== */

function loadUser() {

    const name =
        dashboardData.user.name || "Student";

    const userName =
        getElement("userName");

    const welcomeName =
        getElement("welcomeName");


    if (userName) {
        userName.textContent = name;
    }


    if (welcomeName) {
        welcomeName.textContent = name;
    }
}


/* =====================================================
   DISPLAY CURRENT DATE
===================================================== */

function loadCurrentDate() {

    const dateElement =
        getElement("currentDate");


    if (!dateElement) {
        return;
    }


    const today =
        new Date();


    const options = {
        day: "2-digit",
        month: "short",
        year: "numeric"
    };


    dateElement.textContent =
        today.toLocaleDateString(
            "en-IN",
            options
        );
}


/* =====================================================
   DISPLAY STATISTICS
===================================================== */

function loadStatistics() {

    const attendance =
        dashboardData.attendance;

    const performance =
        dashboardData.performance;

    const risk =
        dashboardData.risk;


    /* Attendance */

    const attendancePercentage =
        getElement(
            "attendancePercentage"
        );

    if (attendancePercentage) {

        attendancePercentage.textContent =
            `${attendance.percentage}%`;
    }


    /* Performance */

    const performancePercentage =
        getElement(
            "performancePercentage"
        );

    if (performancePercentage) {

        performancePercentage.textContent =
            `${performance.percentage}%`;
    }


    /* Present */

    const presentDays =
        getElement("presentDays");

    if (presentDays) {

        presentDays.textContent =
            attendance.present;
    }


    /* Risk */

    const riskStatus =
        getElement("riskStatus");

    if (riskStatus) {

        riskStatus.textContent =
            risk.status ? "Yes" : "No";
    }


    /* Attendance Text */

    const attendanceText =
        getElement("attendanceText");

    if (attendanceText) {

        attendanceText.textContent =
            `${attendance.percentage}%`;
    }


    /* Progress */

    const progress =
        getElement("attendanceProgress");

    if (progress) {

        progress.style.width =
            `${attendance.percentage}%`;
    }


    /* Attendance Details */

    const presentCount =
        getElement("presentCount");

    if (presentCount) {

        presentCount.textContent =
            attendance.present;
    }


    const absentCount =
        getElement("absentCount");

    if (absentCount) {

        absentCount.textContent =
            attendance.absent;
    }


    const lateCount =
        getElement("lateCount");

    if (lateCount) {

        lateCount.textContent =
            attendance.late;
    }


    const totalClasses =
        getElement("totalClasses");

    if (totalClasses) {

        totalClasses.textContent =
            attendance.total;
    }
}


/* =====================================================
   LOAD RECENT ATTENDANCE
===================================================== */

function loadRecentAttendance() {

    const tableBody =
        getElement(
            "attendanceTableBody"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    dashboardData.recentAttendance
        .forEach(record => {

            const row =
                document.createElement("tr");


            const subjectCell =
                document.createElement("td");

            subjectCell.textContent =
                record.subject;


            const dateCell =
                document.createElement("td");

            dateCell.textContent =
                record.date;


            const statusCell =
                document.createElement("td");


            const statusSpan =
                document.createElement("span");


            statusSpan.classList.add(
                "status"
            );


            const status =
                record.status.toLowerCase();


            if (status === "present") {

                statusSpan.classList.add(
                    "present"
                );

            } else if (status === "absent") {

                statusSpan.classList.add(
                    "absent"
                );

            } else if (status === "late") {

                statusSpan.classList.add(
                    "late"
                );
            }


            statusSpan.textContent =
                record.status;


            statusCell.appendChild(
                statusSpan
            );


            row.appendChild(
                subjectCell
            );

            row.appendChild(
                dateCell
            );

            row.appendChild(
                statusCell
            );


            tableBody.appendChild(row);
        });
}


/* =====================================================
   LOGOUT
===================================================== */

function setupLogout() {

    const logoutBtn =
        getElement("logoutBtn");


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmLogout) {
                return;
            }


            /*
             * Remove authentication information
             * if it exists.
             */

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "user"
            );


            /*
             * Go back to login page.
             *
             * If your login page has another
             * filename, change this later.
             */

            window.location.href =
                "../index.html";
        }
    );
}


/* =====================================================
   INITIALIZE DASHBOARD
===================================================== */

function initializeDashboard() {

    loadUser();

    loadCurrentDate();

    loadStatistics();

    loadRecentAttendance();

    setupLogout();
}


/* =====================================================
   START APPLICATION
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    initializeDashboard
);