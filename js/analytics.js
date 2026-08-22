document.addEventListener('DOMContentLoaded', () => {
    // 1. Attendance Trend Line Chart
    const trendCtx = document.getElementById('attendanceTrendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Attendance Rate (%)',
                data: [88, 90, 89, 93, 91, 92.4],
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                fill: true,
                tension: 0.3,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    min: 70,
                    max: 100,
                    grid: { color: '#E2E8F0' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // 2. Performance Breakdown Doughnut Chart
    const distCtx = document.getElementById('performanceDistChart').getContext('2d');
    new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: ['Distinction', 'First Class', 'Second Class', 'At-Risk'],
            datasets: [{
                data: [45, 35, 15, 5],
                backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { boxWidth: 10, padding: 15 }
                }
            },
            cutout: '70%'
        }
    });
});