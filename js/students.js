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


    // =================================================
    // STORE STUDENT ROWS
    // =================================================

    const studentRows = Array.from(
        tableBody.querySelectorAll("tr")
    );


    // =================================================
    // SEARCH + FILTER FUNCTION
    // =================================================

    function filterStudents() {

        const searchValue =
            searchInput.value.trim().toLowerCase();

        const selectedYear =
            yearFilter.value;

        const selectedBranch =
            branchFilter.value;


        let visibleStudents = 0;


        studentRows.forEach(row => {

            const studentId =
                row.cells[0].textContent
                    .trim()
                    .toLowerCase();

            const studentName =
                row.cells[1].textContent
                    .trim()
                    .toLowerCase();

            const branch =
                row.cells[2].textContent
                    .trim();

            const year =
                row.cells[3].textContent
                    .trim();


            // SEARCH

            const matchesSearch =
                studentId.includes(searchValue) ||
                studentName.includes(searchValue);


            // YEAR

            const matchesYear =
                selectedYear === "All Years" ||
                year === selectedYear.replace(" Year", "");


            // BRANCH

            const matchesBranch =
                selectedBranch === "All Branches" ||
                branch === selectedBranch;


            // FINAL RESULT

            const shouldShow =
                matchesSearch &&
                matchesYear &&
                matchesBranch;


            if (shouldShow) {

                row.style.display = "";

                visibleStudents++;

            } else {

                row.style.display = "none";

            }

        });


        // UPDATE COUNT

        studentCount.textContent =
            `${visibleStudents} Students`;

    }


    // =================================================
    // SEARCH WHILE TYPING
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
    // VIEW STUDENT
    // =================================================

    const viewButtons =
        document.querySelectorAll(".action-btn");


    viewButtons.forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest("tr");


            const studentId =
                row.cells[0].textContent.trim();

            const studentName =
                row.cells[1].textContent.trim();

            const branch =
                row.cells[2].textContent.trim();

            const year =
                row.cells[3].textContent.trim();

            const section =
                row.cells[4].textContent.trim();

            const attendance =
                row.cells[5].textContent.trim();

            const performance =
                row.cells[6].textContent.trim();

            const status =
                row.cells[7].textContent.trim();


            alert(
                `Student Details\n\n` +
                `ID: ${studentId}\n` +
                `Name: ${studentName}\n` +
                `Branch: ${branch}\n` +
                `Year: ${year}\n` +
                `Section: ${section}\n` +
                `Attendance: ${attendance}\n` +
                `Performance: ${performance}\n` +
                `Status: ${status}`
            );

        });

    });


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
    // PAGINATION
    // =================================================

    let currentPage = 1;

    const totalPages = 12;


    function updatePagination() {

        const pageText =
            document.querySelector(".pagination span");

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

                updatePagination();

            }

        }
    );


    nextButton.addEventListener(
        "click",
        () => {

            if (currentPage < totalPages) {

                currentPage++;

                updatePagination();

            }

        }
    );


    // =================================================
    // INITIALIZE
    // =================================================

    updatePagination();

    filterStudents();

});