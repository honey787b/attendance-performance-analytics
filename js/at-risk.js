document.addEventListener('DOMContentLoaded', () => {
    // Mock Data for At-Risk Students
    const atRiskStudents = [
        { id: 'ST-1042', name: 'Alex Johnson', dept: 'CSE', attendance: 62, gpa: 2.1, type: 'both' },
        { id: 'ST-1088', name: 'Priya Sharma', dept: 'ECE', attendance: 68, gpa: 3.2, type: 'attendance' },
        { id: 'ST-1105', name: 'Rohan Mehta', dept: 'MECH', attendance: 85, gpa: 2.2, type: 'gpa' },
        { id: 'ST-1132', name: 'Ananya Roy', dept: 'CSE', attendance: 58, gpa: 1.9, type: 'both' },
        { id: 'ST-1178', name: 'David Miller', dept: 'EEE', attendance: 71, gpa: 2.8, type: 'attendance' },
    ];

    const tableBody = document.getElementById('atRiskTableBody');
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('filterSelect');
    const notifyAllBtn = document.getElementById('notifyAllBtn');

    // Render Student Rows
    function renderTable(students) {
        tableBody.innerHTML = '';

        if (students.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 20px; color: var(--text-secondary);">No matching at-risk records found</td></tr>`;
            return;
        }

        students.forEach(student => {
            const row = document.createElement('tr');

            // Format Risk Reason & Badge
            let reasonBadge = '';
            if (student.type === 'attendance') {
                reasonBadge = `<span class="badge badge-warning">Low Attendance</span>`;
            } else if (student.type === 'gpa') {
                reasonBadge = `<span class="badge badge-warning">Low GPA</span>`;
            } else {
                reasonBadge = `<span class="badge badge-danger">Critical (Both)</span>`;
            }

            row.innerHTML = `
                <td><strong>${student.name}</strong></td>
                <td>${student.id}</td>
                <td>${student.dept}</td>
                <td class="${student.attendance < 75 ? 'status-danger' : ''}"><strong>${student.attendance}%</strong></td>
                <td class="${student.gpa < 2.5 ? 'status-danger' : ''}"><strong>${student.gpa}</strong></td>
                <td>${reasonBadge}</td>
                <td><button class="btn-action" onclick="alert('Notification alert sent to ${student.name}')">Notify</button></td>
            `;

            tableBody.appendChild(row);
        });
    }

    // Filter Logic
    function filterStudents() {
        const query = searchInput.value.toLowerCase();
        const selectedFilter = filterSelect.value;

        const filtered = atRiskStudents.filter(student => {
            const matchesQuery = student.name.toLowerCase().includes(query) || student.id.toLowerCase().includes(query);
            const matchesType = selectedFilter === 'all' || student.type === selectedFilter;
            return matchesQuery && matchesType;
        });

        renderTable(filtered);
    }

    // Event Listeners
    searchInput.addEventListener('input', filterStudents);
    filterSelect.addEventListener('change', filterStudents);

    notifyAllBtn.addEventListener('click', () => {
        alert('Bulk intervention alerts successfully sent to all listed students and advisors.');
    });

    // Initial Load
    renderTable(atRiskStudents);
});