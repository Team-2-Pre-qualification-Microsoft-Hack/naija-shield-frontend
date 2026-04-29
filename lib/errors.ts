// Maps known API error messages / codes to user-friendly strings.
const ERROR_MAP: Record<string, string> = {
  // Auth
  "Email or password is incorrect":          "Incorrect email or password. Please try again.",
  "INVALID_CREDENTIALS":                     "Incorrect email or password. Please try again.",
  "Invalid credentials.":                    "Incorrect email or password. Please try again.",
  "Access token has expired":                "Your session has expired. Please sign in again.",
  "TOKEN_EXPIRED":                           "Your session has expired. Please sign in again.",
  "Your session has expired. Please sign in again.": "Your session has expired. Please sign in again.",

  // Invite
  "INVALID_INVITE":                          "This invite link is invalid, already used, or has expired.",
  "Invite not found or expired":             "This invite link is invalid, already used, or has expired.",
  "INVITE_ALREADY_ACCEPTED":                 "This invitation has already been used.",
  "PASSWORDS_DO_NOT_MATCH":                  "Passwords do not match.",
  "Passwords do not match":                  "Passwords do not match.",

  // Users
  "User not found":                          "No account found with that email address.",
  "USER_NOT_FOUND":                          "No account found with that email address.",
  "Email already exists":                    "An account with that email address already exists.",
  "EMAIL_ALREADY_EXISTS":                    "An account with that email address already exists.",

  // Generic
  "Request failed. Please try again.":       "Something went wrong. Please try again.",
  "Request failed":                          "Something went wrong. Please try again.",
  "Network request failed":                  "Network error. Please check your connection.",
  "Failed to fetch":                         "Network error. Please check your connection.",
};

export function friendlyError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  return ERROR_MAP[raw] ?? raw;
}
