export const WEBFINGER_PATTERN =
  /^@[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isWebfinger(value: string) {
  return WEBFINGER_PATTERN.test(value);
}
