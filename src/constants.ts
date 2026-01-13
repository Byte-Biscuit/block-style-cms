// x-pathname header key
export const X_PATH_HEADER_KEY = "x-pathname";
export const BETTER_AUTH_SIGN_IN = "/auth/sign-in";
export const BETTER_AUTH_ERROR_PAGE = "/auth/error";
export const BETTER_AUTH_DATABASE = "better-auth.db";
// Unified locale parameter name
export const LOCALE_PARAM_NAME = "__locale__";

// ==================== Validation Patterns ====================

/**
 * Email validation regular expression
 * 
 * Rules:
 * - Must contain @ symbol
 * - Must have domain and TLD
 * - No whitespace allowed
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
