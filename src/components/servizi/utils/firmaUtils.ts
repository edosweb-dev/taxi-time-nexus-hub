
/**
 * Utility functions for digital signature handling
 */

/**
 * Clean up URL and remove any double slashes except after protocol
 * @param url The URL to clean
 * @returns Cleaned URL
 */
export const cleanupFirmaUrl = (url: string): string => {
  return url.replace(/([^:]\/)\/+/g, "$1");
};

/**
 * Format firma timestamp in a readable format
 * @param timestamp ISO timestamp string
 * @returns Formatted date string
 */
export const formatFirmaTimestamp = (timestamp?: string | null): string | null => {
  if (!timestamp) return null;
  try {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting firma timestamp:', error);
    return null;
  }
};
