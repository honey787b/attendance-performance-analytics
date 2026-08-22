// =====================================================
// PRESENTTRACK — STUDENTS PAGE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Students page loaded successfully!");

    // =================================================
    // ELEMENTS
    // =================================================

    const searchInput = document.getElementById("student-search");
    const yearFilter = document.getElementById("year-filter");
    const branchFilter = document.getElementById("branch-filter");

    const applyButton = document.querySelector(
        ".student-filters .btn-primary"
    );

    const tableBody = document.querySelector("tbody");
    const studentCount = document.querySelector(".student-count");

    const addStudentButton = document.querySelector(
        ".page-header .btn-primary"
    );

    const previousButton = document.querySelector(
        ".pagination-btn:first-child"
    );

    const nextButton = document.querySelector(
        ".pagination-btn:last-child"
    );

    const pageText = document.querySelector(".pagination span");

    // =================================================
    // STUDENT DATA
    // =================================================

    let students = [];

    let currentPage = 1;

    const studentsPerPage = 10;

    // =================================================
    // FORMAT YEAR
    // =================================================

    function formatYear(year) {

        const yearNumber = Number(year);

        const suffix =
            yearNumber === 1 ? "st" :
            yearNumber === 2 ? "nd" :
            yearNumber === 3 ? "rd" : "th";

        return `${yearNumber}${suffix}`;

    }

    // =================================================
    // GET ATTENDANCE CLASS
    // =================================================

    function getAttendanceClass(attendance) {

        if (attendance >= 85) {
            return "attendance-good";
        }

        if (attendance >= 75) {
            return "attendance-warning";
        }

        return "attendance-danger";

    }

    // =================================================
    // GET STATUS
    // =================================================

    function getStatus(student) {

        if (student.status === "Inactive") {
            return {
                text: "Inactive",
                className: "status-danger"
            };
        }

        if (
            Number(student.attendance_percent) < 75 ||
            Number(student.gpa) < 2.5
        ) {
            return {
                text: "At Risk",
                className: "status-danger"
            };
        }

        if (
            Number(student.attendance_percent) < 85 ||
            Number(student.gpa) < 6.0
        ) {
            return {
                text: "Attention",
                className: "status-warning"
            };
        }

        return {
            text: "Active",
            className: "status-active"
        };

    }

    // =================================================
    // DISPLAY STUDENTS
    // =================================================

    function displayStudents(studentList) {

        tableBody.innerHTML = "";

        if (studentList.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        No students found
                    </td>
                </tr>
            `;

            studentCount.textContent = "0 Students";

            updatePagination(0);

            return;
        }

        const totalPages =
            Math.ceil(studentList.length / studentsPerPage);

        if (currentPage > totalPages) {
            currentPage = totalPages;
        }

        const startIndex =
            (currentPage - 1) * studentsPerPage;

        const endIndex =
            startIndex + studentsPerPage;

        const pageStudents =
            studentList.slice(startIndex, endIndex);

        pageStudents.forEach(student => {

            const attendance =
                Number(student.attendance_percent || 0);

            const performance =
                Number(student.performance_percent || 0);

            const gpa =
                Number(student.gpa || 0);

            const status =
                getStatus(student);

            const row =
                document.createElement("tr");

            row.innerHTML = `

                <td>
                    ${student.roll_no}
                </td>

                <td>
                    <strong>
                        ${student.name}
                    </strong>
                </td>

                <td>
                    ${student.branch}
                </td>

                <td>
                    ${formatYear(student.year)}
                </td>

                <td>
                    ${student.section}
                </td>

                <td>

                    <span class="${getAttendanceClass(attendance)}">
                        ${attendance}%
                    </span>

                </td>

                <td>
                    ${gpa.toFixed(2)} CGPA
                </td>

                <td>

                    <span class="status-badge ${status.className}">
                        ${status.text}
                    </span>

                </td>

                <td>

                    <button
                        class="action-btn"
                        data-id="${student.id}">
                        View
                    </button>

                </td>

            `;

            tableBody.appendChild(row);

        });

        studentCount.textContent =
            `${studentList.length} Students`;

        updatePagination(totalPages);

        attachViewButtons();

    }

    // =================================================
    // FILTER STUDENTS
    // =================================================

    function filterStudents() {

        const searchValue =
            searchInput.value.trim().toLowerCase();

        const selectedYear =
            yearFilter.value;

        const selectedBranch =
            branchFilter.value;

        const filteredStudents =
            students.filter(student => {

                const studentId =
                    String(student.roll_no)
                        .toLowerCase();

                const studentName =
                    String(student.name)
                        .toLowerCase();

                const branch =
                    String(student.branch);

                const year =
                    Number(student.year);

                const matchesSearch =
                    studentId.includes(searchValue) ||
                    studentName.includes(searchValue);

                const matchesYear =
                    selectedYear === "All Years" ||
                    year === Number(
                        selectedYear.charAt(0)
                    );

                const matchesBranch =
                    selectedBranch === "All Branches" ||
                    branch === selectedBranch;

                return (
                    matchesSearch &&
                    matchesYear &&
                    matchesBranch
                );

            });

        currentPage = 1;

        displayStudents(filteredStudents);

    }

    // =================================================
    // VIEW STUDENT
    // =================================================

    function attachViewButtons() {

        const viewButtons =
            document.querySelectorAll(".action-btn");

        viewButtons.forEach(button => {

            button.addEventListener("click", () => {

                const studentId =
                    Number(button.dataset.id);

                const student =
                    students.find(
                        s => Number(s.id) === studentId
                    );

                if (!student) {
                    return;
                }

                alert(
                    `Student Details\n\n` +
                    `ID: ${student.roll_no}\n` +
                    `Name: ${student.name}\n` +
                    `Branch: ${student.branch}\n` +
                    `Year: ${formatYear(student.year)}\n` +
                    `Section: ${student.section}\n` +
                    `Attendance: ${student.attendance_percent}%\n` +
                    `Performance: ${student.performance_percent}%\n` +
                    `GPA: ${student.gpa}\n` +
                    `Status: ${student.status}`
                );

            });

        });

    }

    // =================================================
    // PAGINATION
    // =================================================

    function updatePagination(totalPages) {

        if (totalPages === 0) {
            pageText.textContent = "Page 0 of 0";

            previousButton.disabled = true;
            nextButton.disabled = true;

            return;
        }

        pageText.textContent =
            `Page ${currentPage} of ${totalPages}`;

        previousButton.disabled =
            currentPage === 1;

        nextButton.disabled =
            currentPage === totalPages;

    }

    previousButton.addEventListener(
        "click",
        () => {

            if (currentPage > 1) {

                currentPage--;

                filterStudents();

            }

        }
    );

    nextButton.addEventListener(
        "click",
        () => {

            const searchValue =
                searchInput.value.trim().toLowerCase();

            const selectedYear =
                yearFilter.value;

            const selectedBranch =
                branchFilter.value;

            const filteredStudents =
                students.filter(student => {

                    const matchesSearch =
                        String(student.roll_no)
                            .toLowerCase()
                            .includes(searchValue) ||
                        String(student.name)
                            .toLowerCase()
                            .includes(searchValue);

                    const matchesYear =
                        selectedYear === "All Years" ||
                        Number(student.year) ===
                        Number(selectedYear.charAt(0));

                    const matchesBranch =
                        selectedBranch === "All Branches" ||
                        student.branch === selectedBranch;

                    return (
                        matchesSearch &&
                        matchesYear &&
                        matchesBranch
                    );

                });

            const totalPages =
                Math.ceil(
                    filteredStudents.length /
                    studentsPerPage
                );

            if (currentPage < totalPages) {

                currentPage++;

                displayStudents(filteredStudents);

            }

        }
    );

    // =================================================
    // SEARCH
    // =================================================

    searchInput.addEventListener(
        "input",
        filterStudents
    );

    // =================================================
    // APPLY FILTERS
    // =================================================

    applyButton.addEventListener(
        "click",
        filterStudents
    );

    // =================================================
    // ADD STUDENT
    // =================================================

    addStudentButton.addEventListener(
        "click",
        () => {

            alert(
                "Add Student feature will be connected to the student database later."
            );

        }
    );

    // =================================================
    // LOAD STUDENTS FROM DATABASE
    // =================================================

    async function loadStudents() {

        try {

            const response =
                await fetch("/api/students");

            if (!response.ok) {
                throw new Error(
                    "Failed to load students"
                );
            }

            students =
                await response.json();

            console.log(
                "Students loaded from database:",
                students
            );

            displayStudents(students);

        } catch (error) {

            console.error(
                "Error loading students:",
                error
            );

            tableBody.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align:center;">
                        Unable to load students from database
                    </td>
                </tr>
            `;

            studentCount.textContent =
                "0 Students";

        }

    }

    // =================================================
    // INITIALIZE
    // =================================================

    loadStudents();

});