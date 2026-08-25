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

    const pageText =
        document.querySelector(".pagination span");


    // =================================================
    // FACULTY DATA
    // =================================================

    let faculty = [];

    let currentPage = 1;

    const facultyPerPage = 10;


    // =================================================
    // GET STATUS CLASS
    // =================================================

    function getStatusClass(status) {

        if (
            status === "Inactive" ||
            status === "inactive"
        ) {
            return "status-danger";
        }

        if (
            status === "On Leave" ||
            status === "on leave"
        ) {
            return "status-warning";
        }

        return "status-active";

    }


    // =================================================
    // DISPLAY FACULTY
    // =================================================

    function displayFaculty(facultyList) {

        tableBody.innerHTML = "";

        if (facultyList.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        No faculty found
                    </td>
                </tr>
            `;

            facultyCount.textContent =
                "0 Faculty";

            updatePagination(0);

            return;

        }


        const totalPages =
            Math.ceil(
                facultyList.length /
                facultyPerPage
            );


        if (currentPage > totalPages) {
            currentPage = totalPages;
        }


        const startIndex =
            (currentPage - 1) *
            facultyPerPage;


        const endIndex =
            startIndex +
            facultyPerPage;


        const pageFaculty =
            facultyList.slice(
                startIndex,
                endIndex
            );


        pageFaculty.forEach(member => {

            const row =
                document.createElement("tr");


            const subjects =
                member.subjects || "—";


            const classCount =
                member.class_count || 0;


            const status =
                member.status || "Active";


            row.innerHTML = `

                <td>
                    ${member.faculty_code || "—"}
                </td>

                <td>
                    <strong>
                        ${member.name || "—"}
                    </strong>
                </td>

                <td>
                    ${member.department || "—"}
                </td>

                <td>
                    ${member.designation || "Faculty"}
                </td>

                <td>
                    ${subjects}
                </td>

                <td>
                    ${classCount}
                </td>

                <td>

                    <span class="status-badge ${getStatusClass(status)}">
                        ${status}
                    </span>

                </td>

                <td>

                    <button
                        class="action-btn"
                        data-id="${member.id}">
                        View
                    </button>

                </td>

            `;


            tableBody.appendChild(row);

        });


        facultyCount.textContent =
            `${facultyList.length} Faculty`;


        updatePagination(totalPages);


        attachViewButtons();

    }


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


        const filteredFaculty =
            faculty.filter(member => {

                const facultyCode =
                    String(member.faculty_code || "")
                        .toLowerCase();


                const facultyName =
                    String(member.name || "")
                        .toLowerCase();


                const department =
                    String(member.department || "");


                const status =
                    String(member.status || "Active");


                const matchesSearch =
                    facultyCode.includes(searchValue) ||
                    facultyName.includes(searchValue);


                const matchesDepartment =
                    selectedDepartment ===
                    "All Departments" ||
                    department ===
                    selectedDepartment;


                const matchesStatus =
                    selectedStatus ===
                    "All Status" ||
                    status ===
                    selectedStatus;


                return (
                    matchesSearch &&
                    matchesDepartment &&
                    matchesStatus
                );

            });


        currentPage = 1;


        displayFaculty(
            filteredFaculty
        );

    }


    // =================================================
    // VIEW FACULTY
    // =================================================

    function attachViewButtons() {

        const viewButtons =
            document.querySelectorAll(
                ".action-btn"
            );


        viewButtons.forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const facultyId =
                        Number(
                            button.dataset.id
                        );


                    const member =
                        faculty.find(
                            f =>
                                Number(f.id) ===
                                facultyId
                        );


                    if (!member) {
                        return;
                    }


                    alert(
                        `Faculty Details\n\n` +
                        `ID: ${member.faculty_code}\n` +
                        `Name: ${member.name}\n` +
                        `Department: ${member.department}\n` +
                        `Designation: ${member.designation || "Faculty"}\n` +
                        `Subjects: ${member.subjects || "None"}\n` +
                        `Classes: ${member.class_count || 0}\n` +
                        `Status: ${member.status || "Active"}`
                    );

                }
            );

        });

    }


    // =================================================
    // PAGINATION
    // =================================================

    function updatePagination(totalPages) {

        if (totalPages === 0) {

            pageText.textContent =
                "Page 0 of 0";

            previousButton.disabled =
                true;

            nextButton.disabled =
                true;

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

                filterFaculty();

            }

        }
    );


    nextButton.addEventListener(
        "click",
        () => {

            const searchValue =
                searchInput.value
                    .trim()
                    .toLowerCase();


            const selectedDepartment =
                departmentFilter.value;


            const selectedStatus =
                statusFilter.value;


            const filteredFaculty =
                faculty.filter(member => {

                    const matchesSearch =
                        String(
                            member.faculty_code || ""
                        )
                            .toLowerCase()
                            .includes(
                                searchValue
                            ) ||
                        String(member.name || "")
                            .toLowerCase()
                            .includes(
                                searchValue
                            );


                    const matchesDepartment =
                        selectedDepartment ===
                        "All Departments" ||
                        member.department ===
                        selectedDepartment;


                    const matchesStatus =
                        selectedStatus ===
                        "All Status" ||
                        (member.status || "Active") ===
                        selectedStatus;


                    return (
                        matchesSearch &&
                        matchesDepartment &&
                        matchesStatus
                    );

                });


            const totalPages =
                Math.ceil(
                    filteredFaculty.length /
                    facultyPerPage
                );


            if (
                currentPage <
                totalPages
            ) {

                currentPage++;

                displayFaculty(
                    filteredFaculty
                );

            }

        }
    );


    // =================================================
    // SEARCH
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
    // ADD FACULTY
    // =================================================

    addFacultyButton.addEventListener(
        "click",
        async () => {

            const facultyCode =
                prompt("Enter Faculty ID:");

            if (!facultyCode) {
                return;
            }


            const name =
                prompt("Enter Faculty Name:");

            if (!name) {
                return;
            }


            const email =
                prompt("Enter Faculty Email:");

            if (!email) {
                return;
            }


            const department =
                prompt(
                    "Enter Department:\n\nCSE\nAI & ML\nECE\nEEE\nMechanical\nCivil"
                );

            if (!department) {
                return;
            }


            const designation =
                prompt(
                    "Enter Designation:",
                    "Assistant Professor"
                );

            if (!designation) {
                return;
            }


            try {

                addFacultyButton.disabled = true;

                addFacultyButton.textContent =
                    "Adding...";


                const response =
                    await fetch(
                        "/api/faculty",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                faculty_code:
                                    facultyCode.trim(),

                                name:
                                    name.trim(),

                                email:
                                    email.trim(),

                                department:
                                    department.trim(),

                                designation:
                                    designation.trim()

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    throw new Error(
                        data.error ||
                        "Failed to add faculty"
                    );

                }


                alert(
                    "✓ Faculty added successfully!"
                );


                // Reload faculty from database
                await loadFaculty();


            } catch (error) {

                console.error(
                    "Add faculty error:",
                    error
                );


                alert(
                    "Failed to add faculty.\n\n" +
                    error.message
                );


            } finally {

                addFacultyButton.disabled =
                    false;

                addFacultyButton.textContent =
                    "+ Add Faculty";

            }

        }
    );


    // =================================================
    // LOAD FACULTY FROM DATABASE
    // =================================================

    async function loadFaculty() {

        try {

            const response =
                await fetch(
                    "/api/faculty"
                );


            if (!response.ok) {

                throw new Error(
                    "Failed to load faculty"
                );

            }


            faculty =
                await response.json();


            console.log(
                "Faculty loaded from database:",
                faculty
            );


            displayFaculty(
                faculty
            );


        } catch (error) {

            console.error(
                "Error loading faculty:",
                error
            );


            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align:center;">
                        Unable to load faculty from database
                    </td>
                </tr>
            `;


            facultyCount.textContent =
                "0 Faculty";

        }

    }


    // =================================================
    // INITIALIZE
    // =================================================

    loadFaculty();

});