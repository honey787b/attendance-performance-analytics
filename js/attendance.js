document.addEventListener("DOMContentLoaded", async function () {

    // =========================================================
    // PROFILE
    // =========================================================

    const storage = localStorage.getItem("userName")
        ? localStorage
        : sessionStorage;

    const userName = storage.getItem("userName") || "User";
    const userRole = storage.getItem("userRole") || "User";

    const initials = userName
        .split(" ")
        .map(name => name.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase();

    document.getElementById("attendanceUserName").textContent = userName;
    document.getElementById("attendanceUserRole").textContent = userRole;
    document.getElementById("attendanceUserAvatar").textContent = initials;

    document.getElementById("attendanceHeaderUserName").textContent = userName;
    document.getElementById("attendanceHeaderUserRole").textContent = userRole;
    document.getElementById("attendanceHeaderAvatar").textContent = initials;


    // =========================================================
    // ELEMENTS
    // =========================================================

    const tableBody = document.getElementById("studentTableBody");
    const searchInput = document.getElementById("studentSearch");

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

    const averageAttendanceElement =
        document.getElementById("averageAttendance");

    const presentTodayElement =
        document.getElementById("presentToday");

    const absentTodayElement =
        document.getElementById("absentToday");

    const studentCountElement =
        document.getElementById("studentCount");

    const attendanceMessage =
        document.getElementById("attendanceMessage");


    // =========================================================
    // API
    // =========================================================

    const API = "http://localhost:5050/api";


    // =========================================================
    // STATE
    // =========================================================

    let students = [];

    let attendanceStatus = {};

    let originalAttendanceStatus = {};


    // =========================================================
    // DATE
    // =========================================================

    function getTodayDate() {

        const now = new Date();

        const year = now.getFullYear();

        const month =
            String(now.getMonth() + 1).padStart(2, "0");

        const day =
            String(now.getDate()).padStart(2, "0");

        return `${year}-${month}-${day}`;

    }

    dateInput.value = getTodayDate();


    // =========================================================
    // HELPERS
    // =========================================================

    function getInitials(name) {

        return String(name || "")
            .split(" ")
            .map(word => word.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();

    }


    function getAttendanceClass(value) {

        if (value >= 95) {
            return "percentage-good";
        }

        if (value >= 80) {
            return "percentage-warning";
        }

        return "percentage-danger";

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

        if (status === "leave") {

            return `
                <span class="status-badge status-late">
                    Leave
                </span>
            `;

        }

        return `
            <span class="status-badge status-not-marked">
                Not Marked
            </span>
        `;

    }


    // =========================================================
    // BUILD FILTER PARAMETERS
    // =========================================================

    function getFilterParams() {

        const params = new URLSearchParams();

        if (departmentFilter.value !== "all") {

            params.set(
                "branch",
                departmentFilter.value.toUpperCase()
            );

        }

        if (yearFilter.value !== "all") {

            params.set(
                "year",
                yearFilter.value
            );

        }

        if (sectionFilter.value !== "all") {

            params.set(
                "section",
                sectionFilter.value
            );

        }

        params.set(
            "date",
            dateInput.value
        );

        return params;

    }


    // =========================================================
    // LOAD ATTENDANCE
    // =========================================================

    async function loadAttendance() {

        try {

            attendanceMessage.textContent =
                "Loading attendance...";

            const params = getFilterParams();

            const response = await fetch(
                `${API}/attendance/records?${params.toString()}`
            );

            if (!response.ok) {

                const errorData =
                    await response.json().catch(() => ({}));

                throw new Error(
                    errorData.error ||
                    "Could not load attendance records"
                );

            }

            const data = await response.json();


            // -------------------------------------------------
            // Backend returns:
            // {
            //    students: [...]
            // }
            // -------------------------------------------------

            students = Array.isArray(data)
                ? data
                : (data.students || []);


            attendanceStatus = {};
            originalAttendanceStatus = {};


            students.forEach(student => {

                const status =
                    student.today_status ||
                    student.status ||
                    "not-marked";

                attendanceStatus[
                    student.student_id
                ] = status;

                originalAttendanceStatus[
                    student.student_id
                ] = status;

            });


            renderStudents();


            attendanceMessage.textContent =
                "Make sure attendance is updated before saving.";

            attendanceMessage.style.color = "";


        } catch (error) {

            console.error(
                "Attendance loading error:",
                error
            );

            students = [];

            attendanceStatus = {};
            originalAttendanceStatus = {};

            renderStudents();

            attendanceMessage.textContent =
                "Unable to load attendance data: " +
                error.message;

            attendanceMessage.style.color =
                "#dc2626";

        }

    }


    // =========================================================
    // RENDER STUDENTS
    // =========================================================

    function renderStudents() {

        const searchValue =
            searchInput.value
                .toLowerCase()
                .trim();


        // Search is intentionally done locally.
        // Department/year/section/date are handled by backend.

        const filteredStudents =
            students.filter(student => {

                const name =
                    String(student.name || "")
                        .toLowerCase();

                const rollNo =
                    String(student.roll_no || "")
                        .toLowerCase();

                return (
                    name.includes(searchValue) ||
                    rollNo.includes(searchValue)
                );

            });


        tableBody.innerHTML = "";


        if (!filteredStudents.length) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center; padding:30px;">
                        No students found.
                    </td>
                </tr>
            `;

        }


        filteredStudents.forEach((student, index) => {

            const studentId =
                Number(student.student_id);


            const status =
                attendanceStatus[studentId] ||
                "not-marked";


            const attendancePercent =
                Number(
                    student.attendance_percent || 0
                );


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
                    ${student.roll_no}
                </td>

                <td>
                    ${student.branch}
                </td>

                <td>
                    ${student.year}
                </td>

                <td>

                    <span class="attendance-percentage
                        ${getAttendanceClass(
                            attendancePercent
                        )}">

                        ${attendancePercent.toFixed(0)}%

                    </span>

                </td>

                <td>
                    ${getStatusHTML(status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="status-button present-button
                                ${status === "present" ? "selected" : ""}"
                            data-id="${studentId}"
                            data-status="present"
                            title="Present">

                            ✓

                        </button>

                        <button
                            class="status-button absent-button
                                ${status === "absent" ? "selected" : ""}"
                            data-id="${studentId}"
                            data-status="absent"
                            title="Absent">

                            ✕

                        </button>

                        <button
                            class="status-button late-button
                                ${status === "leave" ? "selected" : ""}"
                            data-id="${studentId}"
                            data-status="leave"
                            title="Leave">

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


    // =========================================================
    // STATUS BUTTONS
    // =========================================================

    function attachStatusEvents() {

        const buttons =
            document.querySelectorAll(".status-button");


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    const studentId =
                        Number(this.dataset.id);

                    const status =
                        this.dataset.status;


                    attendanceStatus[studentId] =
                        status;


                    renderStudents();


                    attendanceMessage.textContent =
                        "Attendance changed. Click Save Attendance to save.";

                    attendanceMessage.style.color =
                        "#2563eb";

                }
            );

        });

    }


    // =========================================================
    // SUMMARY
    // =========================================================

    function updateSummary() {

        const total =
            students.length;


        const present =
            Object.values(attendanceStatus)
                .filter(
                    status => status === "present"
                )
                .length;


        const absent =
            Object.values(attendanceStatus)
                .filter(
                    status => status === "absent"
                )
                .length;


        const attendanceValues =
            students.map(student =>
                Number(
                    student.attendance_percent || 0
                )
            );


        const average =
            attendanceValues.length
                ? attendanceValues.reduce(
                    (sum, value) =>
                        sum + value,
                    0
                ) / attendanceValues.length
                : 0;


        totalStudentsElement.textContent =
            total;


        averageAttendanceElement.textContent =
            `${average.toFixed(1)}%`;


        presentTodayElement.textContent =
            present;


        absentTodayElement.textContent =
            absent;

    }


    // =========================================================
    // SEARCH
    // =========================================================

    searchInput.addEventListener(
        "input",
        function () {

            renderStudents();

        }
    );


    // =========================================================
    // DEPARTMENT FILTER
    // =========================================================

    departmentFilter.addEventListener(
        "change",
        async function () {

            await loadAttendance();

        }
    );


    // =========================================================
    // YEAR FILTER
    // =========================================================

    yearFilter.addEventListener(
        "change",
        async function () {

            await loadAttendance();

        }
    );


    // =========================================================
    // SECTION FILTER
    // =========================================================

    sectionFilter.addEventListener(
        "change",
        async function () {

            await loadAttendance();

        }
    );


    // =========================================================
    // DATE FILTER
    // =========================================================

    dateInput.addEventListener(
        "change",
        async function () {

            await loadAttendance();

        }
    );


    // =========================================================
    // CLEAR FILTERS
    // =========================================================

    document
        .getElementById("clearFilters")
        .addEventListener(
            "click",
            async function () {

                searchInput.value = "";

                departmentFilter.value = "all";

                yearFilter.value = "all";

                sectionFilter.value = "all";

                dateInput.value = getTodayDate();


                await loadAttendance();

            }
        );


    // =========================================================
    // MARK ALL PRESENT
    // =========================================================

    document
        .getElementById("markAllPresent")
        .addEventListener(
            "click",
            function () {

                if (!students.length) {

                    attendanceMessage.textContent =
                        "No students available.";

                    attendanceMessage.style.color =
                        "#dc2626";

                    return;

                }


                students.forEach(student => {

                    attendanceStatus[
                        student.student_id
                    ] = "present";

                });


                renderStudents();


                attendanceMessage.textContent =
                    "✓ All students marked present. Click Save Attendance to save.";

                attendanceMessage.style.color =
                    "#2563eb";

            }
        );


    // =========================================================
    // SAVE ATTENDANCE
    // =========================================================

    document
        .getElementById("saveAttendance")
        .addEventListener(
            "click",
            async function () {

                const changedStudents =
                    students.filter(student => {

                        const id =
                            student.student_id;

                        return (
                            attendanceStatus[id] !==
                            originalAttendanceStatus[id]
                        );

                    });


                if (!changedStudents.length) {

                    attendanceMessage.textContent =
                        "No attendance changes to save.";

                    attendanceMessage.style.color =
                        "#64748b";

                    return;

                }


                try {

                    attendanceMessage.textContent =
                        "Saving attendance...";

                    attendanceMessage.style.color =
                        "#2563eb";


                    for (const student of changedStudents) {

                        const response =
                            await fetch(
                                `${API}/attendance/records`,
                                {

                                    method: "POST",

                                    headers: {
                                        "Content-Type":
                                            "application/json"
                                    },

                                    body: JSON.stringify({

                                        student_id:
                                            student.student_id,

                                        date:
                                            dateInput.value,

                                        status:
                                            attendanceStatus[
                                                student.student_id
                                            ]

                                    })

                                }
                            );


                        if (!response.ok) {

                            const errorData =
                                await response
                                    .json()
                                    .catch(() => ({}));


                            throw new Error(
                                errorData.error ||
                                "Failed to save attendance"
                            );

                        }

                    }


                    // Reload from database.
                    // This is important because the backend
                    // calculates the new percentage.

                    await loadAttendance();


                    attendanceMessage.textContent =
                        "✓ Attendance saved successfully!";

                    attendanceMessage.style.color =
                        "#16a34a";


                    setTimeout(
                        function () {

                            attendanceMessage.textContent =
                                "Make sure attendance is updated before saving.";

                            attendanceMessage.style.color = "";

                        },
                        3000
                    );


                } catch (error) {

                    console.error(
                        "Save attendance error:",
                        error
                    );


                    attendanceMessage.textContent =
                        "Failed to save attendance: " +
                        error.message;

                    attendanceMessage.style.color =
                        "#dc2626";

                }

            }
        );


    // =========================================================
    // NOTIFICATIONS
    // =========================================================

    document
        .getElementById("notificationButton")
        .addEventListener(
            "click",
            function () {

                alert(
                    "No new attendance notifications."
                );

            }
        );


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    await loadAttendance();

});