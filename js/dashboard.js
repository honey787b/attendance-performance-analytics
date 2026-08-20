document.addEventListener("DOMContentLoaded", function () {

    const totalStudentsElement =
        document.getElementById("totalStudents");

    const averageAttendanceElement =
        document.getElementById("averageAttendance");

    const todayAttendanceElement =
        document.getElementById("todayAttendance");

    const riskStudentsElement =
        document.getElementById("riskStudents");


    const savedStudents =
        JSON.parse(localStorage.getItem("students") || "null");

    const savedAttendance =
        JSON.parse(localStorage.getItem("attendanceSummary") || "null");


    if (savedStudents && Array.isArray(savedStudents)) {
        totalStudentsElement.textContent = savedStudents.length;
    }


    if (savedAttendance) {

        if (savedAttendance.average !== undefined) {
            averageAttendanceElement.textContent =
                savedAttendance.average + "%";
        }

        if (savedAttendance.today !== undefined) {
            todayAttendanceElement.textContent =
                savedAttendance.today + "%";
        }

        if (savedAttendance.risk !== undefined) {
            riskStudentsElement.textContent =
                savedAttendance.risk;
        }
    }


    const monthSelect =
        document.getElementById("monthSelect");

    monthSelect.addEventListener("change", function () {
        console.log(
            "Selected month:",
            this.value
        );
    });


    const notificationButton =
        document.querySelector(".icon-button");

    notificationButton.addEventListener("click", function () {
        alert("You have no new notifications.");
    });

});