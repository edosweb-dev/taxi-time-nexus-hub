
/**
 * Utility functions for digital signature handling
 */

/**
 * Clean up URL and remove any double slashes except after protocol
 * @param url The URL to clean
 * @returns Cleaned URL
 */
export const cleanupFirmaUrl = (url: string): string => {
  if (!url) return '';
  
  // Fix common issues in signature URLs:
  
  // 1. Remove any double slashes except after protocol
  let cleanedUrl = url.replace(/([^:]\/)\/+/g, "$1");
  
  // 2. Ensure proper path encoding
  try {
    // Extract parts to encode path components but not the whole URL
    const urlObj = new URL(cleanedUrl);
    // We don't need to encode the path as the API should handle it
    
    return cleanedUrl;
  } catch (e) {
    console.error("Error parsing signature URL:", e);
    return cleanedUrl;
  }
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

/**
 * Check if a signature URL is correctly formed
 * @param url The signature URL to validate
 * @returns Boolean indicating if the URL is valid
 */
export const isValidFirmaUrl = (url?: string | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch (e) {
    console.error("Invalid signature URL:", url);
    return false;
  }
};
