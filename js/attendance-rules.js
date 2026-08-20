document.addEventListener("DOMContentLoaded", function () {

    const fields = [
        "excellent",
        "good",
        "warning",
        "critical",
        "minimumAttendance",
        "lateLimit"
    ];


    const savedRules =
        JSON.parse(
            localStorage.getItem("attendanceRules") || "null"
        );


    if (savedRules) {

        fields.forEach(function (field) {

            const element =
                document.getElementById(field);

            if (savedRules[field] !== undefined) {
                element.value =
                    savedRules[field];
            }

        });

    }


    document
        .getElementById("saveRules")
        .addEventListener("click", function () {

            const rules = {};


            fields.forEach(function (field) {

                rules[field] =
                    Number(
                        document.getElementById(field).value
                    );

            });


            if (
                rules.excellent <= rules.good ||
                rules.good <= rules.warning
            ) {

                alert(
                    "Please keep thresholds in descending order."
                );

                return;

            }


            if (
                rules.minimumAttendance < 0 ||
                rules.minimumAttendance > 100
            ) {

                alert(
                    "Minimum attendance must be between 0 and 100."
                );

                return;

            }


            localStorage.setItem(
                "attendanceRules",
                JSON.stringify(rules)
            );


            const message =
                document.getElementById("ruleMessage");


            message.textContent =
                "✓ Attendance rules saved successfully.";

            message.style.color =
                "#16a34a";

        });

});