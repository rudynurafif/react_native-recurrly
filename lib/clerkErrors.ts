import { isClerkAPIResponseError } from "@clerk/expo";

// Extracts the message for a specific form field (e.g. "identifier", "password")
// from a Clerk API error, if present.
export const getClerkFieldError = (
  error: unknown,
  field: string,
): string | undefined => {
  if (!isClerkAPIResponseError(error)) return undefined;
  const match = error.errors.find((e) => e.meta?.paramName === field);
  return match?.longMessage ?? match?.message;
};

// Fallback message for errors that don't map to a specific field
// (e.g. rate limiting, network issues, unexpected API errors).
export const getClerkGeneralError = (error: unknown): string | undefined => {
  if (isClerkAPIResponseError(error)) return error.message;
  if (error instanceof Error) return error.message;
  return error ? "Something went wrong. Please try again." : undefined;
};
