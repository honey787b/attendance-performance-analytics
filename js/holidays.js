/* =========================================================
   PRESENTTRACK
   HOLIDAY CALENDAR JAVASCRIPT
========================================================= */


/* =========================================================
   PREDEFINED HOLIDAYS
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

        initializeHolidayPage();

    }
);


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeHolidayPage() {

    if (calendarDays) {
        renderCalendar();
    }

    if (upcomingList) {
        renderUpcomingHolidays();
    }

    updateHolidayCounts();

    setupEvents();

}


/* =========================================================
   RENDER CALENDAR
========================================================= */

function renderCalendar() {

    if (!calendarDays || !monthYear) {
        return;
    }

    calendarDays.innerHTML = "";

    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    /* MONTH NAME */

    const monthName =
        currentDate.toLocaleString(
            "en-IN",
            {
                month: "long"
            }
        );


    monthYear.textContent =
        `${monthName} ${year}`;


    if (monthSubtitle) {
        monthSubtitle.textContent =
            "Holiday Calendar";
    }


    /* FIRST DAY */

    const firstDay =
        new Date(
            year,
            month,
            1
        ).getDay();


    /* DAYS IN MONTH */

    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /* =====================================================
       EMPTY DAYS
    ====================================================== */

    for (
        let index = 0;
        index < firstDay;
        index++
    ) {

        const emptyDay =
            document.createElement("div");

        emptyDay.className =
            "calendar-day empty-day";

        calendarDays.appendChild(
            emptyDay
        );

    }


    /* =====================================================
       ACTUAL DAYS
    ====================================================== */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement("div");

        dayElement.className =
            "calendar-day";


        /* DATE STRING */

        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        /* FIND HOLIDAY */

        const holiday =
            holidays.find(
                function (item) {
                    return item.date === dateString;
                }
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


        /* =================================================
           TODAY
        ================================================== */

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


        /* =================================================
           HOLIDAY
        ================================================== */

        if (holiday) {

            if (
                holiday.type === "public"
            ) {

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


            /* CLICK EVENT */

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

    if (!upcomingList) {
        return;
    }

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
                function (holiday) {

                    const holidayDate =
                        parseHolidayDate(
                            holiday.date
                        );

                    return holidayDate >= today;

                }
            )
            .sort(
                function (first, second) {

                    return (
                        parseHolidayDate(first.date) -
                        parseHolidayDate(second.date)
                    );

                }
            )
            .slice(0, 5);


    /* =====================================================
       NO UPCOMING HOLIDAYS
    ====================================================== */

    if (upcoming.length === 0) {

        upcomingList.innerHTML =
            `
                <div class="no-upcoming">
                    No upcoming holidays.
                </div>
            `;

        if (nextHolidayName) {
            nextHolidayName.textContent =
                "--";
        }

        return;
    }


    /* =====================================================
       UPCOMING ITEMS
    ====================================================== */

    upcoming.forEach(
        function (holiday) {

            const item =
                document.createElement("div");

            item.className =
                "upcoming-item";


            const date =
                parseHolidayDate(
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


            const holidayType =
                holiday.type === "public"
                    ? "PUBLIC HOLIDAY"
                    : "COLLEGE HOLIDAY";


            const typeClass =
                holiday.type === "public"
                    ? "type-public"
                    : "type-college";


            item.innerHTML =
                `
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

                    <span class="upcoming-type ${typeClass}">
                        ${holidayType}
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


    /* =====================================================
       NEXT HOLIDAY
    ====================================================== */

    if (nextHolidayName) {

        nextHolidayName.textContent =
            upcoming[0]
                ? upcoming[0].name
                : "--";

    }

}


/* =========================================================
   SAFE DATE PARSER
========================================================= */

function parseHolidayDate(
    dateString
) {

    const parts =
        dateString.split("-");


    return new Date(
        Number(parts[0]),
        Number(parts[1]) - 1,
        Number(parts[2])
    );

}


/* =========================================================
   HOLIDAY COUNTS
========================================================= */

function updateHolidayCounts() {

    const publicCount =
        holidays.filter(
            function (holiday) {

                return holiday.type === "public";

            }
        ).length;


    const collegeCount =
        holidays.filter(
            function (holiday) {

                return holiday.type === "college";

            }
        ).length;


    if (publicHolidayCount) {

        publicHolidayCount.textContent =
            publicCount;

    }


    if (collegeHolidayCount) {

        collegeHolidayCount.textContent =
            collegeCount;

    }

}


/* =========================================================
   PREVIOUS MONTH
========================================================= */

function goToPreviousMonth() {

    currentDate.setDate(1);

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();

}


/* =========================================================
   NEXT MONTH
========================================================= */

function goToNextMonth() {

    currentDate.setDate(1);

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();

}


/* =========================================================
   SHOW HOLIDAY MODAL
========================================================= */

function showHolidayModal(
    holiday
) {

    if (!holidayModal) {
        return;
    }


    if (modalIcon) {

        modalIcon.textContent =
            holiday.icon;

    }


    if (modalTitle) {

        modalTitle.textContent =
            holiday.name;

    }


    const date =
        parseHolidayDate(
            holiday.date
        );


    if (modalDate) {

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

    }


    if (modalType) {

        modalType.textContent =
            holiday.type === "public"
                ? "PUBLIC HOLIDAY"
                : "COLLEGE HOLIDAY";

    }


    if (modalDescription) {

        modalDescription.textContent =
            holiday.description;

    }


    holidayModal.classList.add(
        "show"
    );

}


/* =========================================================
   CLOSE MODAL
========================================================= */

function closeHolidayModal() {

    if (!holidayModal) {
        return;
    }

    holidayModal.classList.remove(
        "show"
    );

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {


    /* PREVIOUS MONTH */

    if (prevMonth) {

        prevMonth.addEventListener(
            "click",
            goToPreviousMonth
        );

    }


    /* NEXT MONTH */

    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            goToNextMonth
        );

    }


    /* CLOSE ICON */

    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeHolidayModal
        );

    }


    /* CLOSE BUTTON */

    if (modalCloseBtn) {

        modalCloseBtn.addEventListener(
            "click",
            closeHolidayModal
        );

    }


    /* CLICK OUTSIDE MODAL */

    if (holidayModal) {

        holidayModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target === holidayModal
                ) {

                    closeHolidayModal();

                }

            }
        );

    }


    /* ESCAPE KEY */

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


    /* =====================================================
       LOGOUT
    ====================================================== */

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