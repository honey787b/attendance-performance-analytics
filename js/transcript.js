/* =========================================
   TRANSCRIPT PAGE JAVASCRIPT
   ========================================= */

function printTranscript() {

    window.print();

}


function downloadTranscript() {

    alert(
        "Academic transcript generated successfully.\n\n" +
        "PDF download functionality can be connected to the backend."
    );

}


function changeSemester() {

    const semester =
        document.getElementById("semesterSelect").value;

    alert(
        "Loading academic transcript for Semester " +
        semester
    );

}


function goBack() {

    window.location.href = "performance.html";

}