document.addEventListener("DOMContentLoaded", function () {

    const dateInput =
        document.getElementById("sessionDate");

    const today =
        new Date().toISOString().split("T")[0];

    dateInput.value = today;


    let sessions =
        JSON.parse(
            localStorage.getItem("attendanceSessions") || "[]"
        );


    const tableBody =
        document.getElementById("sessionTableBody");


    function renderSessions() {

        tableBody.innerHTML = "";


        if (sessions.length === 0) {

            tableBody.innerHTML = `
                <tr>
                    <td colspan="6"
                        style="
                            text-align:center;
                            color:#64748b;
                            padding:30px;
                        ">
                        No sessions created yet.
                    </td>
                </tr>
            `;

            return;
        }


        sessions.forEach(function (session, index) {

            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    ${session.date}
                </td>

                <td>
                    ${session.department}
                </td>

                <td>
                    ${session.year}
                </td>

                <td>
                    ${session.section}
                </td>

                <td>
                    <span class="status-badge status-present">
                        Active
                    </span>
                </td>

            `;


            tableBody.appendChild(row);

        });

    }


    document
        .getElementById("createSession")
        .addEventListener("click", function () {

            const department =
                document.getElementById(
                    "sessionDepartment"
                ).value;

            const year =
                document.getElementById(
                    "sessionYear"
                ).value;

            const section =
                document.getElementById(
                    "sessionSection"
                ).value;

            const date =
                dateInput.value;


            if (!date) {

                alert("Please select a date.");

                return;

            }


            const newSession = {

                date: date,

                department: department,

                year: year,

                section: section

            };


            sessions.unshift(newSession);


            localStorage.setItem(
                "attendanceSessions",
                JSON.stringify(sessions)
            );


            renderSessions();


            const message =
                document.getElementById(
                    "sessionMessage"
                );


            message.textContent =
                "✓ Attendance session created successfully.";

            message.style.color =
                "#16a34a";

        });


    renderSessions();

});