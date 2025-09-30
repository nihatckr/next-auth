
/**
 * An array of routes that are accessible to the public.
 * These routes do not require authentication to access.
 * @type {string[]}
 */
export const publicRoutes = [
  '/',
  '/auth/new-verification',


];

/**
 * An array of routes that are used for authentication purposes.
 * These routes will redirect to the logged in users to /settings page.
 * @type {string[]}
 */
export const authRoutes = [
  '/auth/login',
  '/auth/register',
   '/auth/error',
  '/auth/reset',
  '/auth/new-password',
];

/**
 * The prefix for API authentication routes.
 * Routes that start with this prefix are used for API authentication purposes.
 * @type {string[]}
 */

export const apiAuthPrefix = "/api/auth";

/**
 * The default redirect path after login in.
 *
 * @type {string}
 */

export const DEFAULT_LOGIN_REDIRECT = "/admin";
