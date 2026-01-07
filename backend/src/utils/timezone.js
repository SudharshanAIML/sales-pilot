/**
 * Timezone utility functions for Indian Standard Time (IST)
 */

/**
 * Get current date and time in IST
 * @returns {Date} Current date in IST
 */
export const getCurrentIST = () => {
  const now = new Date();
  // Add 5.5 hours (IST offset) to UTC
  return new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
};

/**
 * Convert UTC date to IST
 * @param {Date|string} utcDate - UTC date to convert
 * @returns {Date} Date in IST
 */
export const convertToIST = (utcDate) => {
  const date = new Date(utcDate);
  // Add 5.5 hours (IST offset) to UTC
  return new Date(date.getTime() + (5.5 * 60 * 60 * 1000));
};

/**
 * Format date in IST for display
 * @param {Date|string} date - Date to format
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDateIST = (date, options = {}) => {
  const istDate = convertToIST(date);
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return istDate.toLocaleString('en-IN', defaultOptions);
};

/**
 * Get ISO string in IST
 * @param {Date|string} date - Date to convert
 * @returns {string} ISO string in IST
 */
export const toISOStringIST = (date = new Date()) => {
  const istDate = convertToIST(date);
  return istDate.toISOString();
};

/**
 * Get current time in IST for display (HH:MM AM/PM format)
 * @returns {string} Current time in IST
 */
export const getCurrentTimeIST = () => {
  const istDate = getCurrentIST();
  return istDate.toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

export default {
  getCurrentIST,
  convertToIST,
  formatDateIST,
  toISOStringIST,
  getCurrentTimeIST,
};