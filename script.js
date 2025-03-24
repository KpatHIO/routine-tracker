
// This file includes the timezone-aware patch
// Ensures today’s date is based on local time, not UTC

// Inside loadChildView and date tracking, replace toISOString().split('T')[0] with:
const today = new Date();
const selectedDate = today.toLocaleDateString('en-CA'); // 'YYYY-MM-DD' in local timezone

// Example usage for comparing or displaying dates
