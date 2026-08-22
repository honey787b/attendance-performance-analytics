document.addEventListener("DOMContentLoaded", async function () {

    console.log("Attendance page loaded successfully!");

    // =====================================================
    // ELEMENTS
    // =====================================================

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


    // =====================================================
    // API
    // =====================================================

    const API = "http://localhost:5050/api";


    // =====================================================
    // STATE
    // =====================================================

    let students = [];
    let attendanceStatus = {};
    let currentSessionId = null;


    // =====================================================
    // TODAY'S DATE
    // =====================================================

    const today = new Date();

    const formattedDate =
        today.toISOString().split("T")[0];

    dateInput.value = formattedDate;


    // =====================================================
    // HELPERS
    // =====================================================

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


    // =====================================================
    // CREATE / GET ATTENDANCE SESSION
    // =====================================================

    async function createSession() {

        const branchValue =
            departmentFilter.value === "all"
                ? "CSE"
                : departmentFilter.value.toUpperCase();

        const yearValue =
            yearFilter.value === "all"
                ? 1
                : Number(yearFilter.value);

        const sectionValue =
            sectionFilter.value === "all"
                ? "A"
                : sectionFilter.value;


        try {

            const response =
                await fetch(`${API}/attendance/sessions`, {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        session_date: dateInput.value,
                        branch: branchValue,
                        year: yearValue,
                        section: sectionValue
                    })

                });


            if (!response.ok) {

                throw new Error(
                    "Could not create attendance session"
                );

            }


            const data =
                await response.json();

            currentSessionId =
                data.id;

        } catch (error) {

            console.error(error);

            attendanceMessage.textContent =
                "Unable to create attendance session.";

        }

    }


    // =====================================================
    // LOAD ATTENDANCE RECORDS
    // =====================================================

    async function loadAttendance() {

        if (!currentSessionId) {
            await createSession();
        }


        if (!currentSessionId) {
            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/attendance/records?session_id=${currentSessionId}`
                );


            if (!response.ok) {

                throw new Error(
                    "Could not load attendance records"
                );

            }


            students =
                await response.json();


            students.forEach(student => {

                attendanceStatus[student.student_id] =
                    student.status;

            });


            renderStudents();

        } catch (error) {

            console.error(error);

            attendanceMessage.textContent =
                "Unable to load attendance data.";

        }

    }


    // =====================================================
    // RENDER STUDENTS
    // =====================================================

    function renderStudents() {

        const searchValue =
            searchInput.value
                .toLowerCase()
                .trim();


        const department =
            departmentFilter.value;


        const year =
            yearFilter.value;


        const section =
            sectionFilter.value;


        const filteredStudents =
            students.filter(student => {

                const matchesSearch =
                    student.name
                        .toLowerCase()
                        .includes(searchValue) ||

                    student.roll_no
                        .toLowerCase()
                        .includes(searchValue);


                const matchesDepartment =
                    department === "all" ||

                    student.branch
                        .toLowerCase() === department;


                const matchesYear =
                    year === "all" ||

                    String(student.year) === year;


                const matchesSection =
                    section === "all" ||

                    String(student.section) === section;


                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesYear &&
                    matchesSection
                );

            });


        tableBody.innerHTML = "";


        filteredStudents.forEach((student, index) => {

            const status =
                attendanceStatus[student.student_id]
                || student.status
                || "not-marked";


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
                            Number(student.attendance_percent || 0)
                        )}">

                        ${Number(
                            student.attendance_percent || 0
                        ).toFixed(0)}%

                    </span>

                </td>

                <td>
                    ${getStatusHTML(status)}
                </td>

                <td>

                    <div class="action-buttons">

                        <button
                            class="status-button present-button"
                            data-id="${student.student_id}"
                            data-status="present">

                            ✓

                        </button>

                        <button
                            class="status-button absent-button"
                            data-id="${student.student_id}"
                            data-status="absent">

                            ✕

                        </button>

                        <button
                            class="status-button late-button"
                            data-id="${student.student_id}"
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


    // =====================================================
    // STATUS BUTTONS
    // =====================================================

    function attachStatusEvents() {

        const buttons =
            document.querySelectorAll(".status-button");


        buttons.forEach(button => {

            button.addEventListener(
                "click",
                async function () {

                    const studentId =
                        Number(this.dataset.id);

                    const status =
                        this.dataset.status;


                    attendanceStatus[studentId] =
                        status;


                    try {

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
                                        session_id:
                                            currentSessionId,

                                        student_id:
                                            studentId,

                                        status:
                                            status
                                    })

                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                "Failed to save attendance"
                            );

                        }


                        renderStudents();

                    } catch (error) {

                        console.error(error);

                        attendanceMessage.textContent =
                            "Failed to save attendance.";

                    }

                }
            );

        });

    }


    // =====================================================
    // SUMMARY
    // =====================================================

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


        const total =
            students.length;


        const attendanceValues =
            students.map(
                student =>
                    Number(
                        student.attendance_percent || 0
                    )
            );


        const average =
            attendanceValues.length
                ? attendanceValues.reduce(
                    (sum, value) => sum + value,
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


    // =====================================================
    // FILTER EVENTS
    // =====================================================

    searchInput.addEventListener(
        "input",
        renderStudents
    );


    departmentFilter.addEventListener(
        "change",
        async function () {

            await createSession();

            await loadAttendance();

        }
    );


    yearFilter.addEventListener(
        "change",
        async function () {

            await createSession();

            await loadAttendance();

        }
    );


    sectionFilter.addEventListener(
        "change",
        async function () {

            await createSession();

            await loadAttendance();

        }
    );


    dateInput.addEventListener(
        "change",
        async function () {

            await createSession();

            await loadAttendance();

        }
    );


    // =====================================================
    // CLEAR FILTERS
    // =====================================================

    document
        .getElementById("clearFilters")
        .addEventListener(
            "click",
            async function () {

                searchInput.value = "";

                departmentFilter.value = "all";

                yearFilter.value = "all";

                sectionFilter.value = "all";


                await createSession();

                await loadAttendance();

            }
        );


    // =====================================================
    // MARK ALL PRESENT
    // =====================================================

    document
        .getElementById("markAllPresent")
        .addEventListener(
            "click",
            async function () {

                const studentIds =
                    students.map(
                        student => student.student_id
                    );


                if (!studentIds.length) {
                    return;
                }


                try {

                    const response =
                        await fetch(
                            `${API}/attendance/records/bulk`,
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    session_id:
                                        currentSessionId,

                                    student_ids:
                                        studentIds,

                                    status:
                                        "present"

                                })

                            }
                        );


                    if (!response.ok) {

                        throw new Error(
                            "Failed to mark students present"
                        );

                    }


                    students.forEach(student => {

                        attendanceStatus[
                            student.student_id
                        ] = "present";

                    });


                    renderStudents();

                    attendanceMessage.textContent =
                        "✓ All students marked present.";

                } catch (error) {

                    console.error(error);

                    attendanceMessage.textContent =
                        "Failed to mark all students present.";

                }

            }
        );


    // =====================================================
    // SAVE ATTENDANCE
    // =====================================================

    document
        .getElementById("saveAttendance")
        .addEventListener(
            "click",
            function () {

                attendanceMessage.textContent =
                    "✓ Attendance saved successfully!";

                attendanceMessage.style.color =
                    "#16a34a";


                setTimeout(function () {

                    attendanceMessage.textContent =
                        "Make sure attendance is updated before saving.";

                    attendanceMessage.style.color = "";

                }, 2500);

            }
        );


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

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


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    await createSession();

    await loadAttendance();

});