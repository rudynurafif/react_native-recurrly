// Live API base URL. Override with EXPO_PUBLIC_API_URL if you self-host the API.
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "https://subdub-sigma.vercel.app/api/v1";

// Master switch for the live API.
// - true  (default): try the API, fall back to bundled dummy data if it fails.
// - false: always use dummy data (set EXPO_PUBLIC_USE_API=false to force this).
export const USE_API =
  (process.env.EXPO_PUBLIC_USE_API ?? "true").toLowerCase() !== "false";
