// =====================================================
// PRESENTTRACK — REPORTS PAGE
// =====================================================

"use strict";

document.addEventListener("DOMContentLoaded", () => {

    console.log("Reports page loaded successfully!");


    // =================================================
    // ELEMENTS
    // =================================================

    const reportType =
        document.getElementById("report-type");

    const reportPeriod =
        document.getElementById("report-period");

    const reportFormat =
        document.getElementById("report-format");

    const generateButton =
        document.querySelector(".generate-btn");

    const headerGenerateButton =
        document.querySelector(
            ".page-header .btn-primary"
        );

    const reportCount =
        document.querySelector(".report-count");

    const reportTableBody =
        document.querySelector("tbody");

    const summaryCards =
        document.querySelectorAll(
            ".reports-summary .summary-card"
        );


    // =================================================
    // API
    // =================================================

    const API_BASE = "/api";


    // =================================================
    // AUTH
    // =================================================

    function getStorage() {

        return (
            localStorage.getItem("token")
                ? localStorage
                : sessionStorage
        );

    }


    function getToken() {

        return getStorage().getItem("token");

    }


    function getUserId() {

        return getStorage().getItem("userId");

    }


    function getUserName() {

        return (
            getStorage().getItem("userName")
            || "User"
        );

    }


    // =================================================
    // API REQUEST HELPER
    // =================================================

    async function apiRequest(
        url,
        options = {}
    ) {

        const token =
            getToken();


        const headers = {
            "Content-Type":
                "application/json",

            "Accept":
                "application/json"
        };


        if (token) {

            headers.Authorization =
                `Bearer ${token}`;

        }


        const response =
            await fetch(
                url,
                {
                    ...options,
                    headers: {
                        ...headers,
                        ...(options.headers || {})
                    }
                }
            );


        let data = {};


        try {

            data =
                await response.json();

        } catch {

            data = {};

        }


        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                "Request failed."
            );

        }


        return data;

    }


    // =================================================
    // LOAD REPORTS
    // =================================================

    async function loadReports() {

        try {

            const reports =
                await apiRequest(
                    `${API_BASE}/reports`
                );


            renderReports(
                Array.isArray(reports)
                    ? reports
                    : []
            );


        } catch (error) {

            console.error(
                "Failed to load reports:",
                error
            );


            reportTableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center;">
                        Unable to load reports.
                    </td>
                </tr>
            `;

            updateReportCount([]);

        }

    }


    // =================================================
    // RENDER REPORTS
    // =================================================

    function renderReports(
        reports
    ) {

        reportTableBody.innerHTML = "";


        if (!reports.length) {

            reportTableBody.innerHTML = `
                <tr>
                    <td colspan="7"
                        style="text-align:center;">
                        No reports generated yet.
                    </td>
                </tr>
            `;

            updateReportCount([]);

            updateSummaryCards([]);

            return;

        }


        reports.forEach(
            report => {

                const row =
                    document.createElement("tr");


                const generatedDate =
                    report.generated_date
                        ? new Date(
                            report.generated_date
                        ).toLocaleDateString(
                            "en-GB",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )
                        : "—";


                const status =
                    report.status ||
                    "Ready";


                row.innerHTML = `

                    <td>
                        <strong>
                            ${escapeHtml(
                                report.report_name
                                || "Untitled Report"
                            )}
                        </strong>
                    </td>

                    <td>
                        ${escapeHtml(
                            report.type
                            || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHtml(
                            report.period
                            || "—"
                        )}
                    </td>

                    <td>
                        ${
                            report.generated_by
                                ? `User #${report.generated_by}`
                                : "System"
                        }
                    </td>

                    <td>
                        ${generatedDate}
                    </td>

                    <td>
                        <span class="status-badge status-ready">
                            ${escapeHtml(status)}
                        </span>
                    </td>

                    <td>
                        <button
                            class="action-btn view-report-btn"
                            data-id="${report.id}">
                            View
                        </button>
                    </td>

                `;


                reportTableBody.appendChild(
                    row
                );

            }
        );


        updateReportCount(
            reports
        );


        updateSummaryCards(
            reports
        );


        attachViewButtons(
            reports
        );

    }


    // =================================================
    // ESCAPE HTML
    // =================================================

    function escapeHtml(
        value
    ) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    // =================================================
    // VIEW REPORT
    // =================================================

    function attachViewButtons(
        reports
    ) {

        const buttons =
            document.querySelectorAll(
                ".view-report-btn"
            );


        buttons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {

                        const reportId =
                            Number(
                                button.dataset.id
                            );


                        const report =
                            reports.find(
                                item =>
                                    Number(item.id)
                                    === reportId
                            );


                        if (!report) {

                            alert(
                                "Report details could not be found."
                            );

                            return;

                        }


                        alert(
                            `Report Details\n\n` +

                            `Report: ${
                                report.report_name
                                || "—"
                            }\n` +

                            `Type: ${
                                report.type
                                || "—"
                            }\n` +

                            `Period: ${
                                report.period
                                || "—"
                            }\n` +

                            `Generated By: ${
                                report.generated_by
                                    ? "User #" +
                                      report.generated_by
                                    : "System"
                            }\n` +

                            `Date: ${
                                report.generated_date
                                    ? new Date(
                                        report.generated_date
                                      ).toLocaleString()
                                    : "—"
                            }\n` +

                            `Status: ${
                                report.status
                                || "—"
                            }`
                        );

                    }
                );

            }
        );

    }


    // =================================================
    // GENERATE REPORT
    // =================================================

    async function generateReport() {

        const type =
            reportType.value.trim();

        const period =
            reportPeriod.value.trim();

        const format =
            reportFormat.value.trim();


        if (!type || !period) {

            alert(
                "Please select a report type and period."
            );

            return;

        }


        const originalText =
            generateButton.textContent;


        generateButton.disabled =
            true;


        generateButton.textContent =
            "Generating...";


        try {

            const userId =
                getUserId();


            const reportName =
                `${type} - ${period}`;


            const createdReport =
    await apiRequest(
        `${API_BASE}/reports`,
        {
            method: "POST",

            body:
                JSON.stringify(
                    {
                        report_name:
                            reportName,

                        type:
                            type,

                        period:
                            period,

                        generated_by:
                            userId
                                ? Number(userId)
                                : null
                    }
                )
        }
    );
// =================================================
// ACTUAL FILE EXPORT
// =================================================

const exportResult =
    await apiRequest(
        `${API_BASE}/reports/${createdReport.id}/export`,
        {
            method: "POST",

            body:
                JSON.stringify(
                    {
                        format:
                            format
                                .toLowerCase()
                    }
                )
        }
    );


if (
    exportResult.downloadUrl
) {

    const downloadLink =
        document.createElement(
            "a"
        );


    downloadLink.href =
        exportResult.downloadUrl;


    downloadLink.download =
        exportResult.fileName;


    document.body.appendChild(
        downloadLink
    );


    downloadLink.click();


    downloadLink.remove();

}
            alert(
                `Report generated successfully!\n\n` +

                `Report: ${reportName}\n` +

                `Format: ${format}`
            );


            await loadReports();


        } catch (error) {

            console.error(
                "Generate report error:",
                error
            );


            alert(
                `Failed to generate report.\n\n${
                    error.message
                }`
            );


        } finally {

            generateButton.disabled =
                false;

            generateButton.textContent =
                originalText;

        }

    }


    generateButton.addEventListener(
        "click",
        generateReport
    );


    // =================================================
    // HEADER GENERATE BUTTON
    // =================================================

    if (headerGenerateButton) {

        headerGenerateButton.addEventListener(
            "click",
            () => {

                const form =
                    document.querySelector(
                        ".report-form"
                    );


                if (form) {

                    form.scrollIntoView(
                        {
                            behavior: "smooth"
                        }
                    );

                }

            }
        );

    }


    // =================================================
    // SUMMARY CARDS
    // =================================================

    function updateSummaryCards(
        reports
    ) {

        const total =
            reports.length;


        const attendance =
            reports.filter(
                report =>
                    String(
                        report.type
                    )
                    .toLowerCase()
                    .includes(
                        "attendance"
                    )
            ).length;


        const performance =
            reports.filter(
                report =>
                    String(
                        report.type
                    )
                    .toLowerCase()
                    .includes(
                        "performance"
                    )
            ).length;


        const analytics =
            reports.filter(
                report =>
                    String(
                        report.type
                    )
                    .toLowerCase()
                    .includes(
                        "analytics"
                    )
            ).length;


        const values = [
            total,
            attendance,
            performance,
            analytics
        ];


        summaryCards.forEach(
            (
                card,
                index
            ) => {

                const number =
                    card.querySelector("h3");


                if (number) {

                    number.textContent =
                        values[index] || 0;

                }

            }
        );

    }


    // =================================================
    // REPORT COUNT
    // =================================================

    function updateReportCount(
        reports
    ) {

        reportCount.textContent =
            `${reports.length} Recent Reports`;

    }


    // =================================================
    // QUICK REPORTS
    // =================================================

    const quickReportButtons =
        document.querySelectorAll(
            ".quick-report-card .action-btn"
        );


    quickReportButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const card =
                        button.closest(
                            ".quick-report-card"
                        );


                    const title =
                        card
                            .querySelector("h3")
                            .textContent
                            .trim();


                    const originalText =
                        button.textContent;


                    button.disabled =
                        true;


                    button.textContent =
                        "Generating...";


                    try {

                        const userId =
                            getUserId();


                        await apiRequest(
                            `${API_BASE}/reports`,
                            {
                                method: "POST",

                                body:
                                    JSON.stringify(
                                        {
                                            report_name:
                                                title,

                                            type:
                                                title
                                                    .replace(
                                                        " Summary",
                                                        ""
                                                    )
                                                    .replace(
                                                        "At-Risk Students",
                                                        "Analytics"
                                                    ),

                                            period:
                                                "Current Semester",

                                            generated_by:
                                                userId
                                                    ? Number(
                                                        userId
                                                      )
                                                    : null
                                        }
                                    )
                            }
                        );


                        alert(
                            `${title} generated successfully!`
                        );


                        await loadReports();


                    } catch (error) {

                        console.error(
                            "Quick report error:",
                            error
                        );


                        alert(
                            `Failed to generate report.\n\n${
                                error.message
                            }`
                        );

                    } finally {

                        button.disabled =
                            false;

                        button.textContent =
                            originalText;

                    }

                }
            );

        }
    );


    // =================================================
    // INITIALIZE
    // =================================================

    loadReports();

});