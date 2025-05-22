// Chart handling for statistics section
document.addEventListener('DOMContentLoaded', () => {
    // If we're on the statistics tab, load the charts
    if (document.getElementById('statistics-content').classList.contains('active')) {
        loadStatisticsCharts();
    }
    
    // Add event listener for statistics tab if it exists
    const statisticsLink = document.querySelector('[data-section="statistics"]');
    if (statisticsLink) {
        statisticsLink.addEventListener('click', loadStatisticsCharts);
    }
});

// Load statistics charts data from API
async function loadStatisticsCharts() {
    try {
        const statisticsData = await apiRequest('/statistics/');
        if (statisticsData) {
            updateStatisticsData(statisticsData);
            createLocationChart(statisticsData.locationData);
            createStatusChart(statisticsData.statusData);
            createIssueTypeChart(statisticsData.issueTypeData);
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        showNotification('Failed to load statistics data', 'error');
    }
}

// Update statistics counter values
function updateStatisticsData(data) {
    document.getElementById('stats-total-applications').textContent = data.totalApplications || 0;
    document.getElementById('stats-recent-applications').textContent = data.recentApplications || 0;
    document.getElementById('stats-total-products').textContent = data.totalProducts || 0;
}

// Create location chart
function createLocationChart(locationData) {
    const ctx = document.getElementById('stats-location-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.locationChart) {
        window.locationChart.destroy();
    }
    
    window.locationChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: locationData.map(item => item.name),
            datasets: [{
                label: 'Applications by Location',
                data: locationData.map(item => item.count),
                backgroundColor: '#4e73df',
                borderColor: '#4e73df',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    precision: 0
                }
            }
        }
    });
}

// Create status chart
function createStatusChart(statusData) {
    const ctx = document.getElementById('stats-status-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.statusChart) {
        window.statusChart.destroy();
    }
    
    const statusColors = {
        'Pending': '#f6c23e',
        'In Progress': '#4e73df',
        'Completed': '#1cc88a',
        'Cancelled': '#e74a3b'
    };
    
    window.statusChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: statusData.map(item => item.name),
            datasets: [{
                data: statusData.map(item => item.count),
                backgroundColor: statusData.map(item => statusColors[item.name] || '#858796')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            }
        }
    });
}

// Create issue type chart
function createIssueTypeChart(issueTypeData) {
    const ctx = document.getElementById('stats-issue-type-chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.issueTypeChart) {
        window.issueTypeChart.destroy();
    }
    
    window.issueTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: issueTypeData.map(item => item.name),
            datasets: [{
                data: issueTypeData.map(item => item.count),
                backgroundColor: [
                    '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
                    '#5a5c69', '#858796', '#f8f9fc', '#d1d3e2', '#b7b9cc'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom'
            }
        }
    });
}