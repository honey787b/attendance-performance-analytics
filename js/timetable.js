// =====================================================
// PRESENTTRACK — TIMETABLE PAGE
// =====================================================

document.addEventListener("DOMContentLoaded", () => {

    console.log("PresentTrack Timetable loaded successfully!");

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

    const timetableBody =
        document.querySelector(".timetable-table tbody");

    const todayClassesHeading =
        document.querySelector(".today-card h2");


    // =================================================
    // CONSTANTS
    // =================================================

    const days = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
    ];

    const timeSlots = [
        {
            start: "09:20:00",
            end: "10:10:00",
            label: "9:20 – 10:10"
        },
        {
            start: "10:10:00",
            end: "11:00:00",
            label: "10:10 – 11:00"
        },
        {
            start: "11:20:00",
            end: "12:10:00",
            label: "11:20 – 12:10"
        },
        {
            start: "12:10:00",
            end: "13:00:00",
            label: "12:10 – 1:00"
        },
        {
            start: "14:00:00",
            end: "14:50:00",
            label: "2:00 – 2:50"
        },
        {
            start: "14:50:00",
            end: "15:40:00",
            label: "2:50 – 3:40"
        },
        {
            start: "15:40:00",
            end: "16:30:00",
            label: "3:40 – 4:30"
        }
    ];


    // =================================================
    // CURRENT WEEK
    // =================================================
    // The timetable is a recurring weekly schedule.
    // Changing week changes the displayed dates only.

    let currentWeekStart = new Date(2026, 7, 17);


    // =================================================
    // DATE HELPERS
    // =================================================

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

        if (!weekDisplay) return;

        const startDate =
            new Date(currentWeekStart);

        const endDate =
            new Date(currentWeekStart);

        endDate.setDate(
            endDate.getDate() + 5
        );

        let displayText;

        // Same month
        if (
            startDate.getMonth() ===
            endDate.getMonth()
        ) {

            displayText =
                `${formatDate(startDate)} – ${endDate.getDate()}, ${endDate.getFullYear()}`;

        }

        // Different month
        else {

            displayText =
                `${formatDate(startDate)} – ${formatDate(endDate)}, ${endDate.getFullYear()}`;

        }

        weekDisplay.textContent =
            displayText;
    }


    // =================================================
    // NORMALIZE DAY
    // =================================================

    function normalizeDay(day) {

        if (!day) return "";

        const value =
            String(day)
                .trim()
                .toLowerCase();

        return value.charAt(0).toUpperCase() +
            value.slice(1);

    }


    // =================================================
    // NORMALIZE MYSQL TIME
    // =================================================

    function normalizeTime(time) {

        if (!time) return "";

        let value =
            String(time).trim();

        // Remove possible date portion
        if (value.includes("T")) {

            value =
                value.split("T")[1];

        }

        // Remove milliseconds
        value =
            value.split(".")[0];

        // Ensure HH:MM:SS
        if (/^\d{1,2}:\d{2}$/.test(value)) {

            value =
                value + ":00";

        }

        // Convert HH:MM:SS
        const parts =
            value.split(":");

        if (parts.length >= 2) {

            const hour =
                String(parts[0]).padStart(2, "0");

            const minute =
                String(parts[1]).padStart(2, "0");

            const second =
                String(parts[2] || "00")
                    .padStart(2, "0");

            return `${hour}:${minute}:${second}`;

        }

        return value;
    }


    // =================================================
    // TIME MATCHING
    // =================================================

    function timesMatch(time1, time2) {

        return (
            normalizeTime(time1) ===
            normalizeTime(time2)
        );

    }


    // =================================================
    // LOAD TIMETABLE
    // =================================================

    async function loadTimetable() {

        try {

            showLoadingState();

            const response =
                await fetch("/api/timetable", {
                    method: "GET",
                    headers: {
                        "Accept": "application/json"
                    }
                });


            if (!response.ok) {

                throw new Error(
                    `Server returned ${response.status}`
                );

            }


            const classes =
                await response.json();


            if (!Array.isArray(classes)) {

                throw new Error(
                    "Invalid timetable data received from server"
                );

            }


            console.log(
                "Timetable records:",
                classes
            );


            renderTimetable(classes);

            updateTodayClasses(classes);


        } catch (error) {

            console.error(
                "Timetable loading error:",
                error
            );

            showErrorState(
                "Unable to load timetable."
            );

            updateTodayClasses([]);

        }

    }


    // =================================================
    // LOADING STATE
    // =================================================

    function showLoadingState() {

        if (!timetableBody) return;

        timetableBody.innerHTML = "";

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 7;

        cell.textContent =
            "Loading timetable...";

        cell.style.textAlign =
            "center";

        cell.style.padding =
            "30px";

        row.appendChild(cell);

        timetableBody.appendChild(row);

    }


    // =================================================
    // ERROR STATE
    // =================================================

    function showErrorState(message) {

        if (!timetableBody) return;

        timetableBody.innerHTML = "";

        const row =
            document.createElement("tr");

        const cell =
            document.createElement("td");

        cell.colSpan = 7;

        cell.textContent =
            message;

        cell.style.textAlign =
            "center";

        cell.style.padding =
            "30px";

        row.appendChild(cell);

        timetableBody.appendChild(row);

    }


    // =================================================
    // FIND CLASS
    // =================================================

    function findClass(
        classes,
        day,
        startTime
    ) {

        return classes.find(item => {

            const itemDay =
                normalizeDay(
                    item.day_name
                );

            return (
                itemDay === day &&
                timesMatch(
                    item.start_time,
                    startTime
                )
            );

        });

    }


    // =================================================
    // RENDER TIMETABLE
    // =================================================

    function renderTimetable(classes) {

        if (!timetableBody) return;


        // Clear hardcoded HTML timetable
        timetableBody.innerHTML = "";


        timeSlots.forEach(slot => {

            const row =
                document.createElement("tr");


            // -----------------------------------------
            // TIME CELL
            // -----------------------------------------

            const timeCell =
                document.createElement("td");

            timeCell.className =
                "time-cell";

            timeCell.textContent =
                slot.label;

            row.appendChild(timeCell);


            // -----------------------------------------
            // EACH DAY
            // -----------------------------------------

            days.forEach(day => {

                const cell =
                    document.createElement("td");


                const matchingClass =
                    findClass(
                        classes,
                        day,
                        slot.start
                    );


                // -------------------------------------
                // CLASS EXISTS
                // -------------------------------------

                if (matchingClass) {

                    const card =
                        createClassCard(
                            matchingClass,
                            slot
                        );

                    cell.appendChild(card);

                }


                // -------------------------------------
                // FREE PERIOD
                // -------------------------------------

                else {

                    const freeCard =
                        createFreeCard();

                    cell.appendChild(
                        freeCard
                    );

                }


                row.appendChild(cell);

            });


            timetableBody.appendChild(row);

        });

    }


    // =================================================
    // CREATE CLASS CARD
    // =================================================

    function createClassCard(
        classData,
        slot
    ) {

        const card =
            document.createElement("div");

        card.className =
            "class-card";


        // -----------------------------------------
        // SUBJECT
        // -----------------------------------------

        const subject =
            document.createElement("strong");

        subject.textContent =
            classData.subject_name ||
            "Class";


        // -----------------------------------------
        // BRANCH / SECTION
        // -----------------------------------------

        const classInfo =
            document.createElement("span");


        const branch =
            classData.branch || "";

        const section =
            classData.section || "";

        const year =
            classData.year || "";


        let infoText = "";


        if (branch && section) {

            infoText =
                `${branch}-${section}`;

        } else if (branch) {

            infoText =
                branch;

        } else if (section) {

            infoText =
                section;

        }


        if (year) {

            infoText +=
                infoText
                    ? ` • Year ${year}`
                    : `Year ${year}`;

        }


        classInfo.textContent =
            infoText;


        // -----------------------------------------
        // ROOM
        // -----------------------------------------

        const room =
            document.createElement("small");

        room.textContent =
            classData.room ||
            "Room not assigned";


        card.appendChild(subject);
        card.appendChild(classInfo);
        card.appendChild(room);


        // -----------------------------------------
        // CLICK DETAILS
        // -----------------------------------------

        card.addEventListener(
            "click",
            () => {

                showClassDetails(
                    classData,
                    slot
                );

            }
        );


        return card;

    }


    // =================================================
    // CREATE FREE CARD
    // =================================================

    function createFreeCard() {

        const freeCard =
            document.createElement("div");

        freeCard.className =
            "class-card";


        const subject =
            document.createElement("strong");

        subject.textContent =
            "—";


        const freeText =
            document.createElement("span");

        freeText.textContent =
            "Free Period";


        freeCard.appendChild(subject);
        freeCard.appendChild(freeText);


        freeCard.addEventListener(
            "click",
            () => {

                alert(
                    "This is a free period."
                );

            }
        );


        return freeCard;

    }


    // =================================================
    // CLASS DETAILS
    // =================================================

    function showClassDetails(
        classData,
        slot
    ) {

        const subject =
            classData.subject_name ||
            "N/A";

        const day =
            classData.day_name ||
            "N/A";

        const start =
            formatTimeForDisplay(
                classData.start_time
            ) ||
            formatTimeForDisplay(
                slot.start
            );

        const end =
            formatTimeForDisplay(
                classData.end_time
            ) ||
            formatTimeForDisplay(
                slot.end
            );

        const branch =
            classData.branch ||
            "N/A";

        const section =
            classData.section ||
            "N/A";

        const year =
            classData.year ||
            "N/A";

        const room =
            classData.room ||
            "Not assigned";

        const faculty =
            classData.faculty_name ||
            "Not assigned";


        alert(
            `Class Details\n\n` +
            `Subject: ${subject}\n` +
            `Day: ${day}\n` +
            `Time: ${start} – ${end}\n` +
            `Branch: ${branch}\n` +
            `Year: ${year}\n` +
            `Section: ${section}\n` +
            `Room: ${room}\n` +
            `Faculty: ${faculty}`
        );

    }


    // =================================================
    // FORMAT TIME FOR DISPLAY
    // =================================================

    function formatTimeForDisplay(time) {

        if (!time) return "";

        const normalized =
            normalizeTime(time);

        if (!normalized) return "";

        const parts =
            normalized.split(":");

        if (parts.length < 2) return time;

        let hours =
            Number(parts[0]);

        const minutes =
            parts[1];

        const suffix =
            hours >= 12
                ? "PM"
                : "AM";

        hours =
            hours % 12 || 12;

        return `${hours}:${minutes} ${suffix}`;

    }


    // =================================================
    // TODAY'S CLASSES
    // =================================================

    function updateTodayClasses(classes) {

        if (!todayClassesHeading) return;


        const today =
            new Date();

        const todayDayIndex =
            today.getDay();


        // Sunday = no timetable day
        if (
            todayDayIndex === 0
        ) {

            todayClassesHeading.textContent =
                "No Classes Scheduled";

            return;

        }


        // JS:
        // Monday = 1
        // Tuesday = 2
        // ...
        // Saturday = 6

        const todayName =
            days[todayDayIndex - 1];


        const todaysClasses =
            classes.filter(item => {

                return (
                    normalizeDay(
                        item.day_name
                    ) === todayName
                );

            });


        const count =
            todaysClasses.length;


        if (count === 0) {

            todayClassesHeading.textContent =
                "No Classes Scheduled";

        }

        else {

            todayClassesHeading.textContent =
                `${count} ${count === 1 ? "Class" : "Classes"} Scheduled`;

        }

    }


    // =================================================
    // WEEK NAVIGATION
    // =================================================

    if (previousWeekButton) {

        previousWeekButton.addEventListener(
            "click",
            () => {

                currentWeekStart.setDate(
                    currentWeekStart.getDate() - 7
                );

                updateWeekDisplay();

                // The schedule is recurring,
                // so we don't need to reload
                // the database for every week.

                loadTimetable();

            }
        );

    }


    if (nextWeekButton) {

        nextWeekButton.addEventListener(
            "click",
            () => {

                currentWeekStart.setDate(
                    currentWeekStart.getDate() + 7
                );

                updateWeekDisplay();

                loadTimetable();

            }
        );

    }


    // =================================================
    // EXPORT TIMETABLE
    // =================================================

    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportTimetable
        );

    }


    async function exportTimetable() {

        try {

            exportButton.disabled = true;

            exportButton.textContent =
                "Exporting...";


            const response =
                await fetch(
                    "/api/timetable",
                    {
                        method: "GET",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Unable to fetch timetable"
                );

            }


            const classes =
                await response.json();


            if (
                !Array.isArray(classes) ||
                classes.length === 0
            ) {

                alert(
                    "There is no timetable data to export."
                );

                return;

            }


            let csv =
                "PresentTrack Timetable\n";


            csv +=
                `Week,"${weekDisplay ? weekDisplay.textContent : ""}"\n\n`;


            csv +=
                "Day,Start Time,End Time,Subject,Branch,Year,Section,Faculty,Room\n";


            // Sort by day and time
            const sortedClasses =
                [...classes].sort(
                    (a, b) => {

                        const dayA =
                            days.indexOf(
                                normalizeDay(
                                    a.day_name
                                )
                            );

                        const dayB =
                            days.indexOf(
                                normalizeDay(
                                    b.day_name
                                )
                            );

                        if (
                            dayA !== dayB
                        ) {

                            return dayA - dayB;

                        }

                        return normalizeTime(
                            a.start_time
                        ).localeCompare(
                            normalizeTime(
                                b.start_time
                            )
                        );

                    }
                );


            sortedClasses.forEach(item => {

                const row = [

                    item.day_name || "",

                    item.start_time || "",

                    item.end_time || "",

                    item.subject_name || "",

                    item.branch || "",

                    item.year || "",

                    item.section || "",

                    item.faculty_name || "",

                    item.room || ""

                ];


                csv +=
                    row
                        .map(value =>
                            `"${String(value)
                                .replace(/"/g, '""')}"`
                        )
                        .join(",");


                csv += "\n";

            });


            const blob =
                new Blob(
                    [csv],
                    {
                        type:
                            "text/csv;charset=utf-8;"
                    }
                );


            const url =
                URL.createObjectURL(blob);


            const link =
                document.createElement("a");


            link.href =
                url;


            const date =
                new Date()
                    .toISOString()
                    .slice(0, 10);


            link.download =
                `PresentTrack_Timetable_${date}.csv`;


            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);


            alert(
                "Timetable exported successfully!"
            );


        } catch (error) {

            console.error(
                "Timetable export error:",
                error
            );

            alert(
                `Unable to export timetable.\n\n${error.message}`
            );

        } finally {

            exportButton.disabled = false;

            exportButton.textContent =
                "📥 Export";

        }

    }


    // =================================================
    // ADD CLASS
    // =================================================

    if (addClassButton) {

        addClassButton.addEventListener(
            "click",
            addNewClass
        );

    }


    async function addNewClass() {

        try {

            addClassButton.disabled = true;


            // =========================================
            // DAY
            // =========================================

            const day =
                prompt(
                    "Enter day:\n\nMonday, Tuesday, Wednesday, Thursday, Friday or Saturday"
                );


            if (!day) return;


            const formattedDay =
                normalizeDay(day);


            if (
                !days.includes(
                    formattedDay
                )
            ) {

                alert(
                    "Please enter a valid day."
                );

                return;

            }


            // =========================================
            // START TIME
            // =========================================

            const startTimeInput =
                prompt(
                    "Enter start time:\n\nExample: 09:20"
                );


            if (!startTimeInput) return;


            const startTime =
                normalizeInputTime(
                    startTimeInput
                );


            if (!startTime) {

                alert(
                    "Invalid start time.\n\nPlease use HH:MM format, for example 09:20."
                );

                return;

            }


            // =========================================
            // END TIME
            // =========================================

            const endTimeInput =
                prompt(
                    "Enter end time:\n\nExample: 10:10"
                );


            if (!endTimeInput) return;


            const endTime =
                normalizeInputTime(
                    endTimeInput
                );


            if (!endTime) {

                alert(
                    "Invalid end time.\n\nPlease use HH:MM format, for example 10:10."
                );

                return;

            }


            if (
                endTime <= startTime
            ) {

                alert(
                    "End time must be later than start time."
                );

                return;

            }


            // =========================================
            // SUBJECTS
            // =========================================

            const subjectResponse =
                await fetch(
                    "/api/subjects",
                    {
                        method: "GET",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!subjectResponse.ok) {

                throw new Error(
                    "Unable to load subjects."
                );

            }


            const subjects =
                await subjectResponse.json();


            if (
                !Array.isArray(subjects) ||
                subjects.length === 0
            ) {

                alert(
                    "No subjects are available in the database."
                );

                return;

            }


            let subjectList =
                "Available Subjects:\n\n";


            subjects.forEach(
                subject => {

                    subjectList +=
                        `${subject.id}. ${subject.name}\n`;

                }
            );


            const subjectId =
                prompt(
                    subjectList +
                    "\nEnter the Subject ID:"
                );


            if (!subjectId) return;


            const selectedSubject =
                subjects.find(
                    subject =>
                        Number(subject.id) ===
                        Number(subjectId)
                );


            if (!selectedSubject) {

                alert(
                    "Invalid subject ID."
                );

                return;

            }


            // =========================================
            // BRANCH
            // =========================================

            const branch =
                prompt(
                    "Enter branch:\n\nExample: CSE"
                );


            if (!branch) return;


            // =========================================
            // YEAR
            // =========================================

            const yearInput =
                prompt(
                    "Enter year:\n\nExample: 1"
                );


            if (!yearInput) return;


            const year =
                Number(yearInput);


            if (
                !Number.isInteger(year) ||
                year < 1
            ) {

                alert(
                    "Please enter a valid year."
                );

                return;

            }


            // =========================================
            // SECTION
            // =========================================

            const section =
                prompt(
                    "Enter section:\n\nExample: A"
                );


            if (!section) return;


            // =========================================
            // ROOM
            // =========================================

            const room =
                prompt(
                    "Enter room:\n\nExample: Room 201"
                );


            if (!room) return;


            // =========================================
            // FACULTY
            // =========================================

            let facultyId = null;


            try {

                const facultyResponse =
                    await fetch(
                        "/api/faculty",
                        {
                            method: "GET",
                            headers: {
                                "Accept":
                                    "application/json"
                            }
                        }
                    );


                if (
                    facultyResponse.ok
                ) {

                    const faculty =
                        await facultyResponse.json();


                    if (
                        Array.isArray(faculty) &&
                        faculty.length > 0
                    ) {

                        let facultyList =
                            "Available Faculty:\n\n";


                        faculty.forEach(
                            person => {

                                facultyList +=
                                    `${person.id}. ${person.name}\n`;

                            }
                        );


                        const selectedFaculty =
                            prompt(
                                facultyList +
                                "\nEnter Faculty ID.\n\nPress Cancel for no faculty:"
                            );


                        if (selectedFaculty) {

                            const selected =
                                faculty.find(
                                    person =>
                                        Number(person.id) ===
                                        Number(selectedFaculty)
                                );


                            if (!selected) {

                                alert(
                                    "Invalid faculty ID."
                                );

                                return;

                            }


                            facultyId =
                                Number(
                                    selectedFaculty
                                );

                        }

                    }

                }

            } catch (facultyError) {

                console.warn(
                    "Faculty list could not be loaded:",
                    facultyError
                );

                // Faculty is optional.
                facultyId = null;

            }


            // =========================================
            // CONFIRM
            // =========================================

            const confirmation =
                confirm(
                    `Add this class?\n\n` +
                    `Subject: ${selectedSubject.name}\n` +
                    `Day: ${formattedDay}\n` +
                    `Time: ${formatTimeForDisplay(startTime)} – ${formatTimeForDisplay(endTime)}\n` +
                    `Branch: ${branch.trim()}\n` +
                    `Year: ${year}\n` +
                    `Section: ${section.trim()}\n` +
                    `Room: ${room.trim()}`
                );


            if (!confirmation) return;


            // =========================================
            // SAVE TO DATABASE
            // =========================================

            const response =
                await fetch(
                    "/api/timetable",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",
                            "Accept":
                                "application/json"
                        },

                        body: JSON.stringify({

                            day_name:
                                formattedDay,

                            start_time:
                                startTime,

                            end_time:
                                endTime,

                            subject_id:
                                selectedSubject.id,

                            faculty_id:
                                facultyId,

                            branch:
                                branch.trim(),

                            year:
                                year,

                            section:
                                section.trim(),

                            room:
                                room.trim()

                        })

                    }
                );


            let result = {};

            try {

                result =
                    await response.json();

            } catch (jsonError) {

                console.warn(
                    "Server did not return JSON.",
                    jsonError
                );

            }


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    result.message ||
                    `Server returned ${response.status}`
                );

            }


            alert(
                "Class added successfully!"
            );


            // =========================================
            // REFRESH
            // =========================================

            await loadTimetable();


        } catch (error) {

            console.error(
                "Add class error:",
                error
            );


            alert(
                `Unable to add class.\n\n${error.message}`
            );

        } finally {

            addClassButton.disabled =
                false;

        }

    }


    // =================================================
    // NORMALIZE INPUT TIME
    // =================================================

    function normalizeInputTime(value) {

        if (!value) return null;


        let input =
            String(value)
                .trim()
                .toUpperCase();


        // -----------------------------------------
        // Handle AM / PM input
        // -----------------------------------------

        const ampmMatch =
            input.match(
                /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
            );


        if (ampmMatch) {

            let hours =
                Number(ampmMatch[1]);

            const minutes =
                Number(ampmMatch[2]);

            const modifier =
                ampmMatch[3];


            if (
                hours < 1 ||
                hours > 12 ||
                minutes < 0 ||
                minutes > 59
            ) {

                return null;

            }


            if (
                modifier === "PM" &&
                hours !== 12
            ) {

                hours += 12;

            }


            if (
                modifier === "AM" &&
                hours === 12
            ) {

                hours = 0;

            }


            return (
                String(hours).padStart(2, "0") +
                ":" +
                String(minutes).padStart(2, "0") +
                ":00"
            );

        }


        // -----------------------------------------
        // Handle 24-hour HH:MM
        // -----------------------------------------

        const match =
            input.match(
                /^(\d{1,2}):(\d{2})$/
            );


        if (!match) return null;


        const hours =
            Number(match[1]);

        const minutes =
            Number(match[2]);


        if (
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59
        ) {

            return null;

        }


        return (
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":00"
        );

    }


    // =================================================
    // INITIALIZE
    // =================================================

    updateWeekDisplay();

    loadTimetable();

});