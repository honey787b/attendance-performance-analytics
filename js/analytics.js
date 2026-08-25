document.addEventListener("DOMContentLoaded", () => {

    // ============================================================
    // 1. ATTENDANCE TREND CHART
    // ============================================================

    const trendCanvas = document.getElementById("attendanceTrendChart");

    if (trendCanvas) {
        const trendCtx = trendCanvas.getContext("2d");

        new Chart(trendCtx, {
            type: "line",

            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],

                datasets: [{
                    label: "Attendance Rate (%)",
                    data: [88, 90, 89, 93, 91, 92.4],

                    borderColor: "#4F46E5",
                    backgroundColor: "rgba(79, 70, 229, 0.08)",

                    fill: true,
                    tension: 0.3,
                    borderWidth: 2
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        display: false
                    }
                },

                scales: {
                    y: {
                        min: 70,
                        max: 100,
                        grid: {
                            color: "#E2E8F0"
                        }
                    },

                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }


    // ============================================================
    // 2. PERFORMANCE BREAKDOWN CHART
    // ============================================================

    const distCanvas = document.getElementById("performanceDistChart");

    if (distCanvas) {
        const distCtx = distCanvas.getContext("2d");

        new Chart(distCtx, {
            type: "doughnut",

            data: {
                labels: [
                    "Distinction",
                    "First Class",
                    "Second Class",
                    "At-Risk"
                ],

                datasets: [{
                    data: [45, 35, 15, 5],

                    backgroundColor: [
                        "#4F46E5",
                        "#10B981",
                        "#F59E0B",
                        "#EF4444"
                    ],

                    borderWidth: 2,
                    borderColor: "#FFFFFF"
                }]
            },

            options: {
                responsive: true,
                maintainAspectRatio: false,

                plugins: {
                    legend: {
                        position: "bottom",

                        labels: {
                            boxWidth: 10,
                            padding: 15
                        }
                    }
                },

                cutout: "70%"
            }
        });
    }


    // ============================================================
    // 3. EXPORT ANALYTICS
    // ============================================================

    const exportButton = document.querySelector(".page-header .btn-primary");

    if (exportButton) {

        exportButton.addEventListener("click", exportAnalytics);

    }


    async function exportAnalytics() {

        try {

            // Get latest dashboard statistics
            const response = await fetch("/api/dashboard/stats");

            if (!response.ok) {
                throw new Error("Unable to fetch analytics data");
            }

            const stats = await response.json();


            // Get at-risk students
            const riskResponse = await fetch("/api/at-risk");

            let atRiskStudents = [];

            if (riskResponse.ok) {
                atRiskStudents = await riskResponse.json();
            }


            // Create CSV content
            let csv = "";

            csv += "PresentTrack Analytics Report\n";
            csv += `Generated On,${new Date().toLocaleString()}\n\n`;

            csv += "SUMMARY METRICS\n";

            csv += "Metric,Value\n";

            csv += `Total Students,${stats.totalStudents || 0}\n`;

            csv += `Total Faculty,${stats.totalFaculty || 0}\n`;

            csv += `Average Attendance,${stats.avgAttendance || 0}%\n`;

            csv += `At-Risk Students,${stats.atRiskCount || 0}\n`;

            csv += "\n";


            // At-risk section
            csv += "AT-RISK STUDENTS\n";

            csv += "Roll No,Name,Branch,Attendance %,Risk Type\n";


            atRiskStudents.forEach(student => {

                csv += [
                    student.roll_no || "",
                    student.name || "",
                    student.branch || "",
                    student.attendance_percent || 0,
                    student.risk_type || ""
                ].map(value => `"${String(value).replace(/"/g, '""')}"`).join(",");

                csv += "\n";

            });


            // Create downloadable file
            const blob = new Blob(
                [csv],
                {
                    type: "text/csv;charset=utf-8;"
                }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download =
                `PresentTrack_Analytics_${new Date().toISOString().slice(0, 10)}.csv`;

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);


            alert("Analytics exported successfully!");

        } catch (error) {

            console.error("Analytics export error:", error);

            alert("Unable to export analytics. Please try again.");

        }

    }

});