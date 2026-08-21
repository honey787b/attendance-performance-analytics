/* =========================================================
   PRESENTTRACK
   HOLIDAY CALENDAR JAVASCRIPT
========================================================= */


/* =========================================================
   PREDEFINED HOLIDAYS
   FRONTEND DEMO DATA
========================================================= */

const holidays = [

    {
        date: "2026-08-15",
        name: "Independence Day",
        type: "public",
        icon: "🇮🇳",
        description:
            "Independence Day is a national public holiday in India."
    },

    {
        date: "2026-08-28",
        name: "College Foundation Day",
        type: "college",
        icon: "🎓",
        description:
            "College Foundation Day is declared as a holiday by the college administration."
    },

    {
        date: "2026-09-05",
        name: "Teachers' Day",
        type: "college",
        icon: "👨‍🏫",
        description:
            "Special college holiday for Teachers' Day celebrations."
    },

    {
        date: "2026-10-02",
        name: "Gandhi Jayanti",
        type: "public",
        icon: "🇮🇳",
        description:
            "Gandhi Jayanti is observed as a national public holiday."
    },

    {
        date: "2026-10-20",
        name: "Dussehra",
        type: "public",
        icon: "🪔",
        description:
            "Dussehra is observed as a public holiday."
    },

    {
        date: "2026-11-08",
        name: "Diwali",
        type: "public",
        icon: "🪔",
        description:
            "Diwali is celebrated as a public holiday."
    },

    {
        date: "2026-12-25",
        name: "Christmas",
        type: "public",
        icon: "🎄",
        description:
            "Christmas is observed as a public holiday."
    }

];


/* =========================================================
   CURRENT DATE
========================================================= */

let currentDate = new Date();


/* =========================================================
   DOM ELEMENTS
========================================================= */

const calendarDays =
    document.getElementById("calendarDays");

const monthYear =
    document.getElementById("monthYear");

const monthSubtitle =
    document.getElementById("monthSubtitle");

const upcomingList =
    document.getElementById("upcomingList");

const publicHolidayCount =
    document.getElementById("publicHolidayCount");

const collegeHolidayCount =
    document.getElementById("collegeHolidayCount");

const nextHolidayName =
    document.getElementById("nextHolidayName");

const prevMonth =
    document.getElementById("prevMonth");

const nextMonth =
    document.getElementById("nextMonth");


/* =========================================================
   MODAL ELEMENTS
========================================================= */

const holidayModal =
    document.getElementById("holidayModal");

const closeModal =
    document.getElementById("closeModal");

const modalCloseBtn =
    document.getElementById("modalCloseBtn");

const modalIcon =
    document.getElementById("modalIcon");

const modalType =
    document.getElementById("modalType");

const modalTitle =
    document.getElementById("modalTitle");

const modalDate =
    document.getElementById("modalDate");

const modalDescription =
    document.getElementById("modalDescription");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        renderCalendar();

        renderUpcomingHolidays();

        updateHolidayCounts();

        setupEvents();

    }
);


/* =========================================================
   RENDER CALENDAR
========================================================= */

function renderCalendar() {

    calendarDays.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    const monthName =
        currentDate.toLocaleString(
            "default",
            {
                month: "long"
            }
        );


    monthYear.textContent =
        `${monthName} ${year}`;

    monthSubtitle.textContent =
        "Holiday Calendar";


    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* EMPTY DAYS */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty-day";

        calendarDays.appendChild(
            emptyDay
        );

    }


    /* ACTUAL DAYS */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const holiday =
            holidays.find(
                item =>
                    item.date === dateString
            );


        /* DAY NUMBER */

        const dayNumber =
            document.createElement("span");

        dayNumber.className =
            "day-number";

        dayNumber.textContent =
            day;

        dayElement.appendChild(
            dayNumber
        );


        /* TODAY */

        const today =
            new Date();


        const isToday =
            today.getFullYear() === year &&
            today.getMonth() === month &&
            today.getDate() === day;


        if (isToday) {

            dayElement.classList.add(
                "today"
            );

        }


        /* HOLIDAY */

        if (holiday) {

            if (holiday.type === "public") {

                dayElement.classList.add(
                    "public-holiday"
                );

            } else {

                dayElement.classList.add(
                    "college-holiday"
                );

            }


            const holidayName =
                document.createElement("span");

            holidayName.className =
                "holiday-name";

            holidayName.textContent =
                holiday.name;

            dayElement.appendChild(
                holidayName
            );


            dayElement.addEventListener(
                "click",
                function () {

                    showHolidayModal(
                        holiday
                    );

                }
            );

        }


        calendarDays.appendChild(
            dayElement
        );

    }

}


/* =========================================================
   UPCOMING HOLIDAYS
========================================================= */

function renderUpcomingHolidays() {

    upcomingList.innerHTML = "";

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    const upcoming =
        holidays
            .filter(
                holiday =>
                    new Date(
                        holiday.date
                    ) >= today
            )
            .sort(
                (a, b) =>
                    new Date(a.date) -
                    new Date(b.date)
            )
            .slice(0, 5);


    if (upcoming.length === 0) {

        upcomingList.innerHTML =
            `<div class="no-upcoming">
                No upcoming holidays.
            </div>`;

        return;

    }


    upcoming.forEach(
        holiday => {

            const item =
                document.createElement("div");

            item.className =
                "upcoming-item";


            const date =
                new Date(
                    holiday.date
                );


            const formattedDate =
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                    }
                );


            item.innerHTML = `

                <div class="upcoming-date">
                    ${formattedDate}
                </div>

                <h3>
                    ${holiday.icon}
                    ${holiday.name}
                </h3>

                <p>
                    ${holiday.description}
                </p>

                <span class="upcoming-type ${
                    holiday.type === "public"
                        ? "type-public"
                        : "type-college"
                }">
                    ${
                        holiday.type === "public"
                            ? "PUBLIC HOLIDAY"
                            : "COLLEGE HOLIDAY"
                    }
                </span>

            `;


            item.addEventListener(
                "click",
                function () {

                    showHolidayModal(
                        holiday
                    );

                }
            );


            upcomingList.appendChild(
                item
            );

        }
    );


    /* NEXT HOLIDAY */

    nextHolidayName.textContent =
        upcoming[0]
            ? upcoming[0].name
            : "--";

}


/* =========================================================
   HOLIDAY COUNTS
========================================================= */

function updateHolidayCounts() {

    const publicCount =
        holidays.filter(
            holiday =>
                holiday.type === "public"
        ).length;


    const collegeCount =
        holidays.filter(
            holiday =>
                holiday.type === "college"
        ).length;


    publicHolidayCount.textContent =
        publicCount;

    collegeHolidayCount.textContent =
        collegeCount;

}


/* =========================================================
   MONTH NAVIGATION
========================================================= */

function goToPreviousMonth() {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();

}


function goToNextMonth() {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();

}


/* =========================================================
   MODAL
========================================================= */

function showHolidayModal(
    holiday
) {

    modalIcon.textContent =
        holiday.icon;

    modalTitle.textContent =
        holiday.name;


    const date =
        new Date(
            holiday.date
        );


    modalDate.textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    modalType.textContent =
        holiday.type === "public"
            ? "PUBLIC HOLIDAY"
            : "COLLEGE HOLIDAY";


    modalDescription.textContent =
        holiday.description;


    holidayModal.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeHolidayModal() {

    holidayModal.classList.remove(
        "show"
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    prevMonth.addEventListener(
        "click",
        goToPreviousMonth
    );


    nextMonth.addEventListener(
        "click",
        goToNextMonth
    );


    closeModal.addEventListener(
        "click",
        closeHolidayModal
    );


    modalCloseBtn.addEventListener(
        "click",
        closeHolidayModal
    );


    holidayModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                holidayModal
            ) {

                closeHolidayModal();

            }

        }
    );


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Escape"
            ) {

                closeHolidayModal();

            }

        }
    );


    /* LOGOUT */

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (logoutBtn) {

        logoutBtn.addEventListener(
            "click",
            function () {

                localStorage.clear();

                window.location.href =
                    "login.html";

            }
        );

    }

}