// =====================================================
// PRESENTTRACK — TIMETABLE PAGE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("Timetable page loaded successfully!");


    // =================================================
    // ELEMENTS
    // =================================================

    const previousWeekButton =
        document.querySelector(".date-btn:first-child");

    const nextWeekButton =
        document.querySelector(".date-btn:last-child");

    const weekDisplay =
        document.querySelector(".week-controls strong");

    const exportButton =
        document.querySelector(".btn-secondary");

    const addClassButton =
        document.querySelector(".header-actions .btn-primary");

    const classCards =
        document.querySelectorAll(".class-card");


    // =================================================
    // WEEK NAVIGATION
    // =================================================

    let currentWeekStart =
        new Date(2026, 7, 17);

    const daysInWeek = 6;


    function formatDate(date) {

        const months = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
        ];

        return `${months[date.getMonth()]} ${date.getDate()}`;
    }


    function updateWeekDisplay() {

        const startDate =
            new Date(currentWeekStart);

        const endDate =
            new Date(currentWeekStart);

        endDate.setDate(
            endDate.getDate() + daysInWeek - 1
        );


        weekDisplay.textContent =
            `${formatDate(startDate)} – ${formatDate(endDate)}, ${endDate.getFullYear()}`;

    }


    // Previous week

    previousWeekButton.addEventListener(
        "click",
        () => {

            currentWeekStart.setDate(
                currentWeekStart.getDate() - 7
            );

            updateWeekDisplay();

        }
    );


    // Next week

    nextWeekButton.addEventListener(
        "click",
        () => {

            currentWeekStart.setDate(
                currentWeekStart.getDate() + 7
            );

            updateWeekDisplay();

        }
    );


    // =================================================
    // CLASS CARD DETAILS
    // =================================================

    classCards.forEach(card => {

        card.addEventListener("click", () => {

            const subject =
                card.querySelector("strong");

            const className =
                card.querySelector("span");

            const room =
                card.querySelector("small");


            if (!subject) {
                return;
            }


            const subjectName =
                subject.textContent.trim();

            const classNameText =
                className
                    ? className.textContent.trim()
                    : "";

            const roomText =
                room
                    ? room.textContent.trim()
                    : "";


            // Ignore empty/free cells

            if (
                subjectName === "—" ||
                classNameText === "Free Period"
            ) {

                alert(
                    "This is a free period."
                );

                return;

            }


            alert(
                `Class Details\n\n` +
                `Subject: ${subjectName}\n` +
                `Class: ${classNameText}\n` +
                `Location: ${roomText}`
            );

        });

    });


    // =================================================
    // EXPORT BUTTON
    // =================================================

    exportButton.addEventListener(
        "click",
        () => {

            alert(
                "Timetable export will be connected to PDF/Excel generation later."
            );

        }
    );


    // =================================================
    // ADD CLASS BUTTON
    // =================================================

    addClassButton.addEventListener(
        "click",
        () => {

            alert(
                "Add Class feature will be connected to the timetable database later."
            );

        }
    );


    // =================================================
    // INITIALIZE
    // =================================================

    updateWeekDisplay();

});