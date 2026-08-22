document.addEventListener("DOMContentLoaded", function () {

    const totalStudents = document.getElementById("totalStudents");
    const averageAttendance = document.getElementById("averageAttendance");
    const riskStudents = document.getElementById("riskStudents");

    const yearGroup = document.getElementById("yearGroup");
    const house = document.getElementById("house");
    const meals = document.getElementById("meals");
    const gender = document.getElementById("gender");

    const simdRange = document.getElementById("simdRange");
    const attendanceRange = document.getElementById("attendanceRange");

    const simdValue = document.getElementById("simdValue");
    const attendanceValue = document.getElementById("attendanceValue");

    const clearFilters = document.getElementById("clearFilters");
    const studentCount = document.getElementById("studentCount");
    const searchButton = document.getElementById("searchButton");


    // ============================================================
    // LOAD REAL DASHBOARD DATA FROM BACKEND
    // ============================================================

    async function loadDashboardStats() {

        try {

            const response = await fetch("/api/dashboard/stats");

            if (!response.ok) {
                throw new Error("Failed to load dashboard statistics");
            }

            const data = await response.json();

            // Total students
            if (totalStudents) {
                totalStudents.textContent = data.totalStudents;
            }

            // Average attendance
            if (averageAttendance) {
                averageAttendance.textContent =
                    Number(data.avgAttendance || 0).toFixed(2) + "%";
            }

            // At-risk students
            if (riskStudents) {
                riskStudents.textContent = data.atRiskCount;
            }

            // Update student count if the element exists
            if (studentCount) {
                studentCount.textContent =
                    "Showing " +
                    data.totalStudents +
                    " of " +
                    data.totalStudents +
                    " students";
            }

        } catch (error) {

            console.error("Dashboard API error:", error);

        }

    }


    // Load dashboard data immediately
    loadDashboardStats();


    // ============================================================
    // UPDATE SIMD VALUE
    // ============================================================

    if (simdRange && simdValue) {

        simdRange.addEventListener("input", function () {

            simdValue.textContent =
                "1 - " + simdRange.value;

        });

    }


    // ============================================================
    // UPDATE ATTENDANCE VALUE
    // ============================================================

    if (attendanceRange && attendanceValue) {

        attendanceRange.addEventListener("input", function () {

            attendanceValue.textContent =
                attendanceRange.value + "%";

        });

    }


    // ============================================================
    // FILTERS
    // ============================================================

    function updateFilters() {

        const selectedYear = yearGroup
            ? yearGroup.value
            : "all";

        const selectedHouse = house
            ? house.value
            : "all";

        const selectedMeals = meals
            ? meals.value
            : "all";

        const selectedGender = gender
            ? gender.value
            : "all";

        const attendance = attendanceRange
            ? attendanceRange.value
            : "100";


        /*
         * The old dashboard used fake values such as 779 students.
         *
         * The actual student filtering will be connected to the
         * /api/students endpoint later.
         *
         * For now, don't overwrite the real database total.
         */

        console.log("Dashboard filters:", {
            year: selectedYear,
            house: selectedHouse,
            meals: selectedMeals,
            gender: selectedGender,
            attendance: attendance
        });

    }


    // ============================================================
    // FILTER EVENTS
    // ============================================================

    if (yearGroup) {
        yearGroup.addEventListener(
            "change",
            updateFilters
        );
    }

    if (house) {
        house.addEventListener(
            "change",
            updateFilters
        );
    }

    if (meals) {
        meals.addEventListener(
            "change",
            updateFilters
        );
    }

    if (gender) {
        gender.addEventListener(
            "change",
            updateFilters
        );
    }

    if (attendanceRange) {
        attendanceRange.addEventListener(
            "input",
            updateFilters
        );
    }


    // ============================================================
    // CLEAR FILTERS
    // ============================================================

    if (clearFilters) {

        clearFilters.addEventListener(
            "click",
            function () {

                if (yearGroup) {
                    yearGroup.value = "all";
                }

                if (house) {
                    house.value = "all";
                }

                if (meals) {
                    meals.value = "all";
                }

                if (gender) {
                    gender.value = "all";
                }

                if (simdRange) {
                    simdRange.value = "20";
                }

                if (attendanceRange) {
                    attendanceRange.value = "100";
                }

                if (simdValue) {
                    simdValue.textContent = "1 - 20";
                }

                if (attendanceValue) {
                    attendanceValue.textContent = "100%";
                }

                loadDashboardStats();

            }
        );

    }


    // ============================================================
    // SEARCH BUTTON
    // ============================================================

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                const searchText = window.prompt(
                    "Search students, houses or attendance data:"
                );

                if (
                    searchText !== null &&
                    searchText.trim() !== ""
                ) {

                    window.alert(
                        "Search feature selected for: " +
                        searchText.trim()
                    );

                }

            }
        );

    }

});