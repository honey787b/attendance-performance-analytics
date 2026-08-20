document.addEventListener("DOMContentLoaded", function () {

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


    /*
     * UPDATE SIMD VALUE
     */
    if (simdRange && simdValue) {

        simdRange.addEventListener("input", function () {

            simdValue.textContent = "1 - " + simdRange.value;

        });

    }


    /*
     * UPDATE ATTENDANCE VALUE
     */
    if (attendanceRange && attendanceValue) {

        attendanceRange.addEventListener("input", function () {

            attendanceValue.textContent =
                attendanceRange.value + "%";

        });

    }


    /*
     * FILTER CHANGE
     */
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


        let count = 779;


        /*
         * Demo filter calculations.
         * Later API/database data can replace this.
         */

        if (selectedYear !== "all") {
            count = Math.round(count * 0.16);
        }

        if (selectedHouse !== "all") {
            count = Math.round(count * 0.14);
        }

        if (selectedMeals !== "all") {
            count = Math.round(count * 0.12);
        }

        if (selectedGender !== "all") {
            count = Math.round(count * 0.50);
        }

        if (Number(attendance) < 100) {

            const percentage =
                Number(attendance) / 100;

            count = Math.round(count * percentage);

        }


        if (studentCount) {

            studentCount.textContent =
                "Showing " +
                count +
                " of 779 students";

        }

    }


    /*
     * ADD FILTER EVENTS
     */

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


    /*
     * CLEAR FILTERS
     */

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

                if (studentCount) {
                    studentCount.textContent =
                        "Showing 779 of 779 students";
                }

            }
        );

    }


    /*
     * SEARCH BUTTON
     */

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function () {

                const searchText =
                    window.prompt(
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