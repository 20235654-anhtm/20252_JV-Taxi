/**
 * Centralized API configuration for JV-Taxi Frontend.
 * Loads the backend URL from Vite environment variables (VITE_API_URL).
 * Falls back to localhost:5000 in development.
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
