document.addEventListener("DOMContentLoaded", function () {

    const students = [
        {
            id: 1,
            name: "Arjun Reddy",
            roll: "CSE001",
            department: "CSE",
            year: "1",
            attendance: 96
        },
        {
            id: 2,
            name: "Sneha Rani",
            roll: "CSE002",
            department: "CSE",
            year: "1",
            attendance: 91
        },
        {
            id: 3,
            name: "Rahul Kumar",
            roll: "CSE003",
            department: "CSE",
            year: "2",
            attendance: 86
        },
        {
            id: 4,
            name: "Meghana Priya",
            roll: "ECE001",
            department: "ECE",
            year: "2",
            attendance: 78
        },
        {
            id: 5,
            name: "Sanjay Rao",
            roll: "ECE002",
            department: "ECE",
            year: "3",
            attendance: 93
        },
        {
            id: 6,
            name: "Kavya Sri",
            roll: "EEE001",
            department: "EEE",
            year: "1",
            attendance: 88
        },
        {
            id: 7,
            name: "Vishal Kumar",
            roll: "CSE004",
            department: "CSE",
            year: "3",
            attendance: 97
        },
        {
            id: 8,
            name: "Priya Sharma",
            roll: "ECE003",
            department: "ECE",
            year: "4",
            attendance: 82
        },
        {
            id: 9,
            name: "Nikhil Varma",
            roll: "EEE002",
            department: "EEE",
            year: "2",
            attendance: 74
        },
        {
            id: 10,
            name: "Anjali Devi",
            roll: "CSE005",
            department: "CSE",
            year: "4",
            attendance: 95
        }
    ];


    let attendanceStatus = {};


    const savedStatus =
        localStorage.getItem("todayAttendanceStatus");

    if (savedStatus) {
        attendanceStatus = JSON.parse(savedStatus);
    }


    const tableBody =
        document.getElementById("studentTableBody");

    const searchInput =
        document.getElementById("studentSearch");

    const departmentFilter =
        document.getElementById("departmentFilter");

    const yearFilter =
        document.getElementById("yearFilter");

    const sectionFilter =
        document.getElementById("sectionFilter");

    const dateInput =
        document.getElementById("attendanceDate");


    const totalStudentsElement =
        document.getElementById("totalStudents");

    const presentTodayElement =
        document.getElementById("presentToday");

    const absentTodayElement =
        document.getElementById("absentToday");

    const studentCountElement =
        document.getElementById("studentCount");


    const today = new Date();

    const formattedDate =
        today.toISOString().split("T")[0];

    dateInput.value = formattedDate;


    function getInitials(name) {

        return name
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

    }


    function getAttendanceClass(value) {

        if (value >= 90) {
            return "percentage-good";
        }

        if (value >= 80) {
            return "percentage-warning";
        }

        return "percentage-danger";
    }


    function getStatus(id) {

        return attendanceStatus[id] || "not-marked";

    }


    function getStatusHTML(status) {

        if (status === "present") {
            return `
                <span class="status-badge status-present">
                    Present
                </span>
            `;
        }

        if (status === "absent") {
            return `
                <span class="status-badge status-absent">
                    Absent
                </span>
            `;
        }

        if (status === "late") {
            return `
                <span class="status-badge status-late">
                    Late
                </span>
            `;
        }

        return `
            <span class="status-badge status-not-marked">
                Not Marked
            </span>
        `;

    }


    function renderStudents() {

        const searchValue =
            searchInput.value.toLowerCase().trim();

        const department =
            departmentFilter.value;

        const year =
            yearFilter.value;


        const filteredStudents =
            students.filter(student => {

                const matchesSearch =
                    student.name.toLowerCase().includes(searchValue) ||
                    student.roll.toLowerCase().includes(searchValue);

                const matchesDepartment =
                    department === "all" ||
                    student.department.toLowerCase() === department;

                const matchesYear =
                    year === "all" ||
                    student.year === year;

                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesYear
                );

            });


        tableBody.innerHTML = "";


        filteredStudents.forEach((student, index) => {

            const status =
                getStatus(student.id);


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>


                <td>

                    <div class="student-cell">

                        <div class="student-table-avatar">
                            ${getInitials(student.name)}
                        </div>

                        <strong>
                            ${student.name}
                        </strong>

                    </div>

                </td>


                <td>
                    ${student.roll}
                </td>


                <td>
                    ${student.department}
                </td>


                <td>
                    ${student.year}
                </td>


                <td>

                    <span class="attendance-percentage
                        ${getAttendanceClass(student.attendance)}">

                        ${student.attendance}%

                    </span>

                </td>


                <td>
                    ${getStatusHTML(status)}
                </td>


                <td>

                    <div class="action-buttons">

                        <button
                            class="status-button present-button"
                            data-id="${student.id}"
                            data-status="present">

                            ✓

                        </button>

                        <button
                            class="status-button absent-button"
                            data-id="${student.id}"
                            data-status="absent">

                            ✕

                        </button>

                        <button
                            class="status-button late-button"
                            data-id="${student.id}"
                            data-status="late">

                            L

                        </button>

                    </div>

                </td>

            `;


            tableBody.appendChild(row);

        });


        studentCountElement.textContent =
            `Showing ${filteredStudents.length} students`;


        attachStatusEvents();

        updateSummary();

    }


    function attachStatusEvents() {

        const buttons =
            document.querySelectorAll(".status-button");


        buttons.forEach(button => {

            button.addEventListener("click", function () {

                const id =
                    Number(this.dataset.id);

                const status =
                    this.dataset.status;

                attendanceStatus[id] =
                    status;

                localStorage.setItem(
                    "todayAttendanceStatus",
                    JSON.stringify(attendanceStatus)
                );

                renderStudents();

            });

        });

    }


    function updateSummary() {

        const statuses =
            Object.values(attendanceStatus);

        const present =
            statuses.filter(
                status => status === "present"
            ).length;

        const absent =
            statuses.filter(
                status => status === "absent"
            ).length;


        totalStudentsElement.textContent =
            students.length;

        presentTodayElement.textContent =
            present;

        absentTodayElement.textContent =
            absent;

    }


    searchInput.addEventListener(
        "input",
        renderStudents
    );


    departmentFilter.addEventListener(
        "change",
        renderStudents
    );


    yearFilter.addEventListener(
        "change",
        renderStudents
    );


    sectionFilter.addEventListener(
        "change",
        renderStudents
    );


    document
        .getElementById("clearFilters")
        .addEventListener("click", function () {

            searchInput.value = "";

            departmentFilter.value = "all";

            yearFilter.value = "all";

            sectionFilter.value = "all";

            renderStudents();

        });


    document
        .getElementById("markAllPresent")
        .addEventListener("click", function () {

            students.forEach(student => {

                attendanceStatus[student.id] =
                    "present";

            });


            localStorage.setItem(
                "todayAttendanceStatus",
                JSON.stringify(attendanceStatus)
            );


            renderStudents();

        });


    document
        .getElementById("saveAttendance")
        .addEventListener("click", function () {

            localStorage.setItem(
                "todayAttendanceStatus",
                JSON.stringify(attendanceStatus)
            );


            const message =
                document.getElementById(
                    "attendanceMessage"
                );

            message.textContent =
                "✓ Attendance saved successfully!";

            message.style.color =
                "#16a34a";


            setTimeout(function () {

                message.textContent =
                    "Make sure attendance is updated before saving.";

                message.style.color =
                    "";

            }, 2500);

        });


    document
        .getElementById("notificationButton")
        .addEventListener("click", function () {

            alert("No new attendance notifications.");

        });


    renderStudents();

});