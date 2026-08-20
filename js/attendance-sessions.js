const sessions = [

    {
        subject: "Data Structures",
        faculty: "Faculty A",
        date: "20 Aug 2026",
        start: "09:00 AM",
        end: "10:00 AM",
        status: "Completed"
    },

    {
        subject: "DBMS",
        faculty: "Faculty B",
        date: "20 Aug 2026",
        start: "10:00 AM",
        end: "11:00 AM",
        status: "Completed"
    },

    {
        subject: "Web Development",
        faculty: "Faculty C",
        date: "20 Aug 2026",
        start: "11:00 AM",
        end: "12:00 PM",
        status: "Scheduled"
    },

    {
        subject: "Python",
        faculty: "Faculty D",
        date: "20 Aug 2026",
        start: "01:00 PM",
        end: "02:00 PM",
        status: "Scheduled"
    }

];


function createSessionStatus(status) {

    const span =
        document.createElement("span");

    span.classList.add("status");


    if (status === "Completed") {

        span.classList.add("present");

    } else {

        span.classList.add("late");
    }


    span.textContent = status;


    return span;
}


function loadSessions() {

    const tableBody =
        document.getElementById(
            "sessionsTableBody"
        );

    const emptyMessage =
        document.getElementById(
            "emptySessionMessage"
        );


    if (!tableBody) {
        return;
    }


    tableBody.innerHTML = "";


    if (sessions.length === 0) {

        emptyMessage.hidden = false;

        return;
    }


    emptyMessage.hidden = true;


    sessions.forEach(
        (session, index) => {

            const row =
                document.createElement("tr");


            const number =
                document.createElement("td");

            number.textContent =
                index + 1;


            const subject =
                document.createElement("td");

            subject.textContent =
                session.subject;


            const faculty =
                document.createElement("td");

            faculty.textContent =
                session.faculty;


            const date =
                document.createElement("td");

            date.textContent =
                session.date;


            const start =
                document.createElement("td");

            start.textContent =
                session.start;


            const end =
                document.createElement("td");

            end.textContent =
                session.end;


            const status =
                document.createElement("td");

            status.appendChild(
                createSessionStatus(
                    session.status
                )
            );


            row.appendChild(number);

            row.appendChild(subject);

            row.appendChild(faculty);

            row.appendChild(date);

            row.appendChild(start);

            row.appendChild(end);

            row.appendChild(status);


            tableBody.appendChild(row);
        }
    );
}


function setupLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmed =
                window.confirm(
                    "Are you sure you want to logout?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "accessToken"
            );

            localStorage.removeItem(
                "user"
            );


            window.location.href =
                "../index.html";
        }
    );
}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadSessions();

        setupLogout();

    }
);