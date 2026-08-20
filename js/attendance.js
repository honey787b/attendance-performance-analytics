/* =====================================================
   ATTENDANCE PAGE
===================================================== */


/* DEMO DATA */

const attendanceData = {

    student: {
        name: "Yasaswini"
    },

    summary: {
        percentage: 85,
        present: 42,
        absent: 7,
        late: 1,
        total: 50
    },

    records: [

        {
            subject: "Data Structures",
            date: "20 Aug 2026",
            time: "09:00 AM",
            faculty: "Faculty A",
            status: "Present"
        },

        {
            subject: "DBMS",
            date: "19 Aug 2026",
            time: "10:00 AM",
            faculty: "Faculty B",
            status: "Present"
        },

        {
            subject: "Web Development",
            date: "18 Aug 2026",
            time: "11:00 AM",
            faculty: "Faculty C",
            status: "Absent"
        },

        {
            subject: "Python",
            date: "17 Aug 2026",
            time: "09:00 AM",
            faculty: "Faculty D",
            status: "Present"
        },

        {
            subject: "Data Structures",
            date: "16 Aug 2026",
            time: "09:00 AM",
            faculty: "Faculty A",
            status: "Late"
        },

        {
            subject: "DBMS",
            date: "15 Aug 2026",
            time: "10:00 AM",
            faculty: "Faculty B",
            status: "Present"
        },

        {
            subject: "Python",
            date: "14 Aug 2026",
            time: "11:00 AM",
            faculty: "Faculty D",
            status: "Present"
        }

    ]
};


/* GET ELEMENT */

function getElement(id) {

    return document.getElementById(id);
}


/* LOAD SUMMARY */

function loadSummary() {

    const summary =
        attendanceData.summary;


    getElement("studentName").textContent =
        attendanceData.student.name;


    getElement("attendancePercentage").textContent =
        `${summary.percentage}%`;


    getElement("presentCount").textContent =
        summary.present;


    getElement("absentCount").textContent =
        summary.absent;


    getElement("lateCount").textContent =
        summary.late;


    getElement("percentageText").textContent =
        `${summary.percentage}%`;


    getElement("progressPresent").textContent =
        summary.present;


    getElement("totalClasses").textContent =
        summary.total;


    const progress =
        getElement("attendanceProgress");


    if (progress) {

        progress.style.width =
            `${summary.percentage}%`;
    }
}


/* CREATE STATUS */

function createStatus(status) {

    const span =
        document.createElement("span");

    span.classList.add("status");


    if (status === "Present") {

        span.classList.add("present");

    } else if (status === "Absent") {

        span.classList.add("absent");

    } else if (status === "Late") {

        span.classList.add("late");
    }


    span.textContent = status;


    return span;
}


/* DISPLAY RECORDS */

function displayRecords() {

    const tableBody =
        getElement("attendanceTableBody");

    const emptyMessage =
        getElement("emptyMessage");


    if (!tableBody) {
        return;
    }


    const subjectFilter =
        getElement("subjectFilter").value;


    const statusFilter =
        getElement("statusFilter").value;


    const filteredRecords =
        attendanceData.records.filter(
            record => {

                const subjectMatch =
                    subjectFilter === "all" ||
                    record.subject === subjectFilter;


                const statusMatch =
                    statusFilter === "all" ||
                    record.status === statusFilter;


                return (
                    subjectMatch &&
                    statusMatch
                );
            }
        );


    tableBody.innerHTML = "";


    if (filteredRecords.length === 0) {

        emptyMessage.hidden = false;

        return;

    } else {

        emptyMessage.hidden = true;
    }


    filteredRecords.forEach(
        (record, index) => {

            const row =
                document.createElement("tr");


            const number =
                document.createElement("td");

            number.textContent =
                index + 1;


            const subject =
                document.createElement("td");

            subject.textContent =
                record.subject;


            const date =
                document.createElement("td");

            date.textContent =
                record.date;


            const time =
                document.createElement("td");

            time.textContent =
                record.time;


            const faculty =
                document.createElement("td");

            faculty.textContent =
                record.faculty;


            const status =
                document.createElement("td");

            status.appendChild(
                createStatus(
                    record.status
                )
            );


            row.appendChild(number);

            row.appendChild(subject);

            row.appendChild(date);

            row.appendChild(time);

            row.appendChild(faculty);

            row.appendChild(status);


            tableBody.appendChild(row);
        }
    );
}


/* RESET FILTERS */

function resetFilters() {

    getElement("subjectFilter").value =
        "all";

    getElement("statusFilter").value =
        "all";


    displayRecords();
}


/* LOGOUT */

function setupLogout() {

    const logoutBtn =
        getElement("logoutBtn");


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        () => {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "../index.html";
        }
    );
}


/* INITIALIZE */

function initializeAttendance() {

    loadSummary();

    displayRecords();

    setupLogout();


    getElement(
        "subjectFilter"
    ).addEventListener(
        "change",
        displayRecords
    );


    getElement(
        "statusFilter"
    ).addEventListener(
        "change",
        displayRecords
    );


    getElement(
        "resetFilters"
    ).addEventListener(
        "click",
        resetFilters
    );
}


/* START */

document.addEventListener(
    "DOMContentLoaded",
    initializeAttendance
);