export function resolveEmailVerified(
  auth0Claim: unknown,
  cachedProfileValue: unknown,
) {
  return typeof auth0Claim === "boolean"
    ? auth0Claim
    : cachedProfileValue === true;
}
