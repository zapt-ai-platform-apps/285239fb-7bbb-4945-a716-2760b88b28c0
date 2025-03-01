import { formatDistanceToNow } from 'date-fns';

/**
 * Formats a date as a relative time string (e.g., "2 hours ago")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted relative time string
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
    
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Formats a date in a standard format (e.g., "Jan 1, 2023")
 * @param {Date|string|number} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatStandardDate(date: Date | string | number): string {
  if (!date) {
    return '';
  }
  
  const dateObj = typeof date === 'string' || typeof date === 'number'
    ? new Date(date)
    : date;
    
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}