/* =========================================================
   PRESENTTRACK
   HOLIDAY CALENDAR JAVASCRIPT
========================================================= */


/* =========================================================
   HOLIDAY DATA
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
   CURRENT MONTH
========================================================= */

let currentDate = new Date();


/* =========================================================
   DOM ELEMENTS
========================================================= */

let calendarDays;
let monthYear;
let monthSubtitle;

let upcomingList;

let publicHolidayCount;
let collegeHolidayCount;
let nextHolidayName;

let prevMonth;
let nextMonth;

let holidayModal;
let closeModal;
let modalCloseBtn;

let modalIcon;
let modalType;
let modalTitle;
let modalDate;
let modalDescription;


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
         // =====================================================
        // LOAD LOGGED-IN USER PROFILE
        // =====================================================

        const storage = localStorage.getItem("userName")
            ? localStorage
            : sessionStorage;

        const userName =
            storage.getItem("userName") || "User";

        const userRole =
            storage.getItem("userRole") || "User";

        const initials =
            userName
                .split(" ")
                .map(name => name.charAt(0))
                .join("")
                .substring(0, 2)
                .toUpperCase();


        // Sidebar profile
        document.getElementById("holidayUserName").textContent =
            userName;

        document.getElementById("holidayUserRole").textContent =
            userRole;

        document.getElementById("holidayUserAvatar").textContent =
            initials;


        // Header profile
        document.getElementById("holidayHeaderUserName").textContent =
            userName;

        document.getElementById("holidayHeaderUserRole").textContent =
            userRole;

        document.getElementById("holidayHeaderAvatar").textContent =
            initials;



        calendarDays =
            document.getElementById(
                "calendarDays"
            );

        monthYear =
            document.getElementById(
                "monthYear"
            );

        monthSubtitle =
            document.getElementById(
                "monthSubtitle"
            );

        upcomingList =
            document.getElementById(
                "upcomingList"
            );

        publicHolidayCount =
            document.getElementById(
                "publicHolidayCount"
            );

        collegeHolidayCount =
            document.getElementById(
                "collegeHolidayCount"
            );

        nextHolidayName =
            document.getElementById(
                "nextHolidayName"
            );

        prevMonth =
            document.getElementById(
                "prevMonth"
            );

        nextMonth =
            document.getElementById(
                "nextMonth"
            );

        holidayModal =
            document.getElementById(
                "holidayModal"
            );

        closeModal =
            document.getElementById(
                "closeModal"
            );

        modalCloseBtn =
            document.getElementById(
                "modalCloseBtn"
            );

        modalIcon =
            document.getElementById(
                "modalIcon"
            );

        modalType =
            document.getElementById(
                "modalType"
            );

        modalTitle =
            document.getElementById(
                "modalTitle"
            );

        modalDate =
            document.getElementById(
                "modalDate"
            );

        modalDescription =
            document.getElementById(
                "modalDescription"
            );


        initializeHolidayPage();

    }
);


/* =========================================================
   INITIALIZE PAGE
========================================================= */

function initializeHolidayPage() {

    renderCalendar();

    renderUpcomingHolidays();

    updateHolidayCounts();

    setupEvents();

}


/* =========================================================
   RENDER CALENDAR
========================================================= */

function renderCalendar() {

    if (!calendarDays) {
        return;
    }

    calendarDays.innerHTML = "";


    const year =
        currentDate.getFullYear();

    const month =
        currentDate.getMonth();


    const monthName =
        currentDate.toLocaleString(
            "en-IN",
            {
                month: "long"
            }
        );


    if (monthYear) {

        monthYear.textContent =
            `${monthName} ${year}`;

    }


    if (monthSubtitle) {

        monthSubtitle.textContent =
            "Holiday Calendar";

    }


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


    /* =====================================================
       EMPTY DAYS
    ====================================================== */

    for (
        let i = 0;
        i < firstDay;
        i++
    ) {

        const emptyDay =
            document.createElement(
                "div"
            );

        emptyDay.className =
            "calendar-day empty-day";

        calendarDays.appendChild(
            emptyDay
        );

    }


    /* =====================================================
       MONTH DAYS
    ====================================================== */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dayElement =
            document.createElement(
                "div"
            );

        dayElement.className =
            "calendar-day";


        const dateString =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;


        const holiday =
            holidays.find(
                function (item) {

                    return item.date ===
                        dateString;

                }
            );


        /* DAY NUMBER */

        const dayNumber =
            document.createElement(
                "span"
            );

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
                holiday.type ===
                "public"
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
                document.createElement(
                    "span"
                );

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

                    return (
                        parseHolidayDate(
                            holiday.date
                        ) >= today
                    );

                }
            )
            .sort(
                function (a, b) {

                    return (
                        parseHolidayDate(a.date) -
                        parseHolidayDate(b.date)
                    );

                }
            )
            .slice(0, 5);


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


    upcoming.forEach(
        function (holiday) {

            const item =
                document.createElement(
                    "div"
                );

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
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );


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


    if (nextHolidayName) {

        nextHolidayName.textContent =
            upcoming[0]
                ? upcoming[0].name
                : "--";

    }

}


/* =========================================================
   DATE HELPER
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

                return holiday.type ===
                    "public";

            }
        ).length;


    const collegeCount =
        holidays.filter(
            function (holiday) {

                return holiday.type ===
                    "college";

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

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();

}


/* =========================================================
   NEXT MONTH
========================================================= */

function goToNextMonth() {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();

}


/* =========================================================
   SHOW MODAL
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

    document.body.style.overflow =
        "hidden";

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

    document.body.style.overflow =
        "";

}


/* =========================================================
   EVENTS
========================================================= */

function setupEvents() {

    if (prevMonth) {

        prevMonth.addEventListener(
            "click",
            goToPreviousMonth
        );

    }


    if (nextMonth) {

        nextMonth.addEventListener(
            "click",
            goToNextMonth
        );

    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeHolidayModal
        );

    }


    if (modalCloseBtn) {

        modalCloseBtn.addEventListener(
            "click",
            closeHolidayModal
        );

    }


    if (holidayModal) {

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

    }


    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Escape"
            ) {

                closeHolidayModal();

            }

        }
    );

}