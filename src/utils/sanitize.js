
// Input validation utility functions

/**
 * Checks if the input contains any potentially dangerous content
 * @param {string} input - The input string to validate
 * @returns {Object} - Contains validation result and warning message
 */
export const validateInput = (input) => {
  if (input == null) return { isValid: true, warning: null };

  input = String(input); // Ensure it's a string

  // URL patterns - more comprehensive
  const urlPatterns = [
    /(https?:\/\/[^\s]+)/i, // Protocol URLs
    /(www\.[^\s]+)/i, // www URLs
    /([^\s]+\.(com|net|org|edu|gov|mil|biz|info|io|ai|app|dev|web|online|site|xyz|me)[^\s]*)/i, // Common TLDs
    /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/, // IP addresses
    /(localhost(:\d+)?)/i // localhost
  ];

  // Script and code patterns
  const scriptPatterns = [
    /(<script[\s\S]*?>)/i,
    /(\/?script>)/i,
    /(javascript:|vbscript:|livescript:)/i,
    /(on\w+\s*=)/i,
    /(data:\s*\w+\/\w+;base64)/i
  ];

  // HTML and special character patterns
  const htmlPatterns = [
    /(<[^>]*>)/g,
    /(&[#\w]+;)/g,
    /(^|\s)(div|span|img|<a>|script|style|link|meta|iframe|form|input|button|textarea)(\s|$)/i,
    /[<>{}\[\]`]/g
  ];

  // Check for URLs
  for (const pattern of urlPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        warning: "URLs or web addresses are not allowed in this field"
      };
    }
  }

  // Check for scripts
  for (const pattern of scriptPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        warning: "Script-like content is not allowed in this field"
      };
    }
  }

  // Check for HTML and special characters
  for (const pattern of htmlPatterns) {
    if (pattern.test(input)) {
      return {
        isValid: false,
        warning: "HTML tags, special characters, or code-like content are not allowed in this field"
      };
    }
  }

  // Only allow alphanumeric characters, spaces, and basic punctuation
  const validContentPattern = /^[\w\s.,!?-]*$/;
  if (!validContentPattern.test(input)) {
    return {
      isValid: false,
      warning: "Only letters, numbers, spaces, and basic punctuation are allowed"
    };
  }

  return { isValid: true, warning: null };
};

/**
 * Sanitizes the input by removing any potentially dangerous content
 * @param {string} input - The input string to sanitize
 * @returns {string} - The sanitized input
 */
export const sanitizeInput = (input) => {
  if (input == null) return ''; // Handles undefined and null

  let sanitized = String(input); // Ensure it's a string

  // Remove URLs and web addresses
  sanitized = sanitized.replace(/(https?:\/\/[^\s]+)/gi, '') // http(s) URLs
    .replace(/(www\.[^\s]+)/gi, '') // www URLs
    .replace(/([^\s]+\.(com|net|org|edu|gov|mil|biz|info|io|ai|app|dev|web|online|site|xyz|me)[^\s]*)/gi, '') // TLDs
    .replace(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g, '') // IP addresses
    .replace(/(localhost(:\d+)?)/gi, ''); // localhost

  // Remove script-related content
  sanitized = sanitized.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '') // Complete script tags
    .replace(/<script[\s\S]*?>/gi, '') // Opening script tags
    .replace(/(<\/?script>)/gi, '') // Simple script tags
    .replace(/(javascript:|vbscript:|livescript:)/gi, '') // Script protocols
    .replace(/(on\w+\s*=)/gi, '') // Event handlers
    .replace(/(data:\s*\w+\/\w+;base64)/gi, ''); // Base64 content

  // Remove HTML tags and entities
  sanitized = sanitized.replace(/<[^>]*>/g, '') // HTML tags
    .replace(/(&[#\w]+;)/g, '') // HTML entities
    .replace(/(^|\s)(div|span|img|<a>|script|style|link|meta|iframe|form|input|button|textarea)(\s|$)/gi, ' '); // Common HTML words

  // Remove special characters
  sanitized = sanitized.replace(/[<>{}\[\]`]/g, '');

  // Only keep alphanumeric characters, spaces, and basic punctuation

  sanitized = sanitized.replace(/[^\w\s.,!?-]/g, '');

  sanitized = sanitized.replace(/[^a-zA-Z0-9\s.,!?-]/g, '');


  // Trim extra whitespace

  // sanitized = sanitized.trim().replace(/\s+/g, ' ');
  // sanitized = sanitized.trim();

  return sanitized;
};
