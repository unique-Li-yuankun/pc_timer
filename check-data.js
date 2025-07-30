// This script simulates the database checking that would happen in the app
console.log('Simulating database check...');

// Create a mock database to test if our logic would work
const mockDatabase = {
  app_usage: [
    {
      id: 1,
      appName: 'explorer',
      duration: 5000,
      date: new Date().toISOString().split('T')[0],
      startTime: Date.now() - 10000,
      endTime: Date.now() - 5000
    },
    {
      id: 2,
      appName: 'chrome',
      duration: 8000,
      date: new Date().toISOString().split('T')[0],
      startTime: Date.now() - 15000,
      endTime: Date.now() - 7000
    }
  ]
};

// Test the getAppStats logic
function getAppStats(timeRange) {
  const today = new Date().toISOString().split('T')[0];
  let filteredData = mockDatabase.app_usage;
  
  if (timeRange === 'today') {
    filteredData = mockDatabase.app_usage.filter(usage => usage.date === today);
  }

  // Group by app name
  const grouped = {};
  
  filteredData.forEach(usage => {
    if (!grouped[usage.appName]) {
      grouped[usage.appName] = { total_duration: 0, session_count: 0 };
    }
    grouped[usage.appName].total_duration += usage.duration;
    grouped[usage.appName].session_count += 1;
  });

  // Convert to array and sort
  const result = Object.entries(grouped).map(([app_name, stats]) => ({
    app_name,
    total_duration: stats.total_duration,
    session_count: stats.session_count
  })).sort((a, b) => b.total_duration - a.total_duration);

  return result;
}

console.log('Mock database content:', mockDatabase.app_usage);
console.log('Stats result:', getAppStats('today'));

// Format duration like the app does
function formatDuration(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

const stats = getAppStats('today');
console.log('\nFormatted output:');
stats.forEach((app, index) => {
  console.log(`#${index + 1} ${app.app_name}: ${formatDuration(app.total_duration)} (${app.session_count} sessions)`);
});

console.log('\nTotal apps:', stats.length);
console.log('Total time:', formatDuration(stats.reduce((sum, app) => sum + app.total_duration, 0)));