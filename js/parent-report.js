/* =========================================
   PARENT REPORT JAVASCRIPT
   ========================================= */

function printReport() {
    window.print();
}


function downloadReport() {

    alert(
        "Parent report generated successfully.\n\n" +
        "PDF download functionality can be connected to a backend later."
    );

}


function changeSemester() {

    const semester =
        document.getElementById("semesterSelect").value;

    alert("Loading performance data for Semester " + semester);

}


function openAttendance() {

    window.location.href = "attendance.html";

}


function goBack() {

    window.location.href = "performance.html";

}