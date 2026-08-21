// =====================================================
// PRESENTTRACK — FACULTY PAGE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Faculty page loaded successfully!");


    // =================================================
    // ELEMENTS
    // =================================================

    const searchInput =
        document.getElementById("faculty-search");

    const departmentFilter =
        document.getElementById("department-filter");

    const statusFilter =
        document.getElementById("status-filter");

    const applyButton =
        document.querySelector(
            ".faculty-filters .btn-primary"
        );

    const tableBody =
        document.querySelector("tbody");

    const facultyCount =
        document.querySelector(".faculty-count");

    const addFacultyButton =
        document.querySelector(
            ".page-header .btn-primary"
        );

    const previousButton =
        document.querySelector(
            ".pagination-btn:first-child"
        );

    const nextButton =
        document.querySelector(
            ".pagination-btn:last-child"
        );


    // =================================================
    // FACULTY ROWS
    // =================================================

    const facultyRows =
        Array.from(
            tableBody.querySelectorAll("tr")
        );


    // =================================================
    // FILTER FACULTY
    // =================================================

    function filterFaculty() {

        const searchValue =
            searchInput.value
                .trim()
                .toLowerCase();

        const selectedDepartment =
            departmentFilter.value;

        const selectedStatus =
            statusFilter.value;


        let visibleFaculty = 0;


        facultyRows.forEach(row => {

            const facultyId =
                row.cells[0].textContent
                    .trim()
                    .toLowerCase();

            const facultyName =
                row.cells[1].textContent
                    .trim()
                    .toLowerCase();

            const department =
                row.cells[2].textContent
                    .trim();

            const status =
                row.cells[6].textContent
                    .trim();


            // SEARCH

            const matchesSearch =
                facultyId.includes(searchValue) ||
                facultyName.includes(searchValue);


            // DEPARTMENT

            const matchesDepartment =
                selectedDepartment === "All Departments" ||
                department === selectedDepartment;


            // STATUS

            const matchesStatus =
                selectedStatus === "All Status" ||
                status === selectedStatus;


            // FINAL RESULT

            const shouldShow =
                matchesSearch &&
                matchesDepartment &&
                matchesStatus;


            if (shouldShow) {

                row.style.display = "";

                visibleFaculty++;

            } else {

                row.style.display = "none";

            }

        });


        // UPDATE COUNT

        facultyCount.textContent =
            `${visibleFaculty} Faculty`;

    }


    // =================================================
    // SEARCH WHILE TYPING
    // =================================================

    searchInput.addEventListener(
        "input",
        filterFaculty
    );


    // =================================================
    // APPLY FILTERS
    // =================================================

    applyButton.addEventListener(
        "click",
        filterFaculty
    );


    // =================================================
    // VIEW FACULTY
    // =================================================

    const viewButtons =
        document.querySelectorAll(".action-btn");


    viewButtons.forEach(button => {

        button.addEventListener("click", () => {

            const row =
                button.closest("tr");


            const facultyId =
                row.cells[0].textContent.trim();

            const facultyName =
                row.cells[1].textContent.trim();

            const department =
                row.cells[2].textContent.trim();

            const designation =
                row.cells[3].textContent.trim();

            const subjects =
                row.cells[4].textContent.trim();

            const classes =
                row.cells[5].textContent.trim();

            const status =
                row.cells[6].textContent.trim();


            alert(
                `Faculty Details\n\n` +
                `ID: ${facultyId}\n` +
                `Name: ${facultyName}\n` +
                `Department: ${department}\n` +
                `Designation: ${designation}\n` +
                `Subjects: ${subjects}\n` +
                `Classes: ${classes}\n` +
                `Status: ${status}`
            );

        });

    });


    // =================================================
    // ADD FACULTY
    // =================================================

    addFacultyButton.addEventListener(
        "click",
        () => {

            alert(
                "Add Faculty feature will be connected to the faculty database later."
            );

        }
    );


    // =================================================
    // PAGINATION
    // =================================================

    let currentPage = 1;

    const totalPages = 5;


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

    filterFaculty();

});